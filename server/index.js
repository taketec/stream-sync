import 'dotenv/config'
import mongoDBConnect from './mongoDb/Connection.js';
import express from 'express';
import userRoutes from './routes/user.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as Server from 'socket.io';
import mongoose from "mongoose"

const PORT=process.env.PORT || 8000

mongoose.set('strictQuery', false);
mongoDBConnect();

const app = express();
const corsConfig = {
  origin: 'http://localhost:3000',
  credentials: true,
};

const createLog = (req, res, next) => {
  res.on("finish", function() {
    console.log(req.method,req.body, decodeURI(req.url), res.statusCode, res.statusMessage);
  });
  next();
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(createLog)
app.use(cors(corsConfig));
app.use('/', userRoutes);



const server = app.listen(PORT, () => {
  console.log(`Server Listening at PORT - ${PORT}`);
});

const io = new Server.Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'http://localhost:3000',
  },
});

function get_time(){
	let d = new Date()
	let t = d.getTime()/1000
	// delta is the correction parameter
	return t
}


let rooms_state = {}  
let socket_user_map = {}
io.on('connection', (socket) => {

  socket.on('join room', ({room:room,username:username}) => {

    socket_user_map[socket.id] = username//store username-socketid link 

    if (rooms_state[room] == undefined){
      console.log('new room created')
      rooms_state[room] = {users:[],state:{playing:false}}; //adding default room state to a room if it doesnt already exist
    }
    
    if (!rooms_state[room].users.includes(username)) { // check if the user is already in the room
          rooms_state[room].users.push(username); // add the user to the rooms user list
          //console.log(`User ${socket.id} joined room ${room}`);
      } else {
          console.log(`User ${socket.id} is already in room ${room}`);
      }
    console.log(`user ${username} joined ${room} `)
    console.table(rooms_state)//all the code till now just manages the users state in the global room_state object, and after this the user joins he room
    socket.join(room);
  });

  socket.on('paused', (data) => {
    console.log("paused in ",data)
    rooms_state[data.room].state.playing = data.playing 
    console.table(rooms_state[data.room])
    socket.to(data.room).emit('paused' , data.playing);
  });

  socket.on('seeked-to', (data) => {
    console.log("seeked in ",data)
    socket.to(data.room).emit("seeked-to" , data.timestamp);
  });

  
  
  socket.on('time_sync_request_backward', () => {
    socket.emit('time_sync_response_backward',get_time())
  })

  socket.on('time_sync_request_forward', (time_at_client) => {
    socket.emit('time_sync_response_forward',get_time() - time_at_client)
  })

  socket.on('state_update_from_client',({room:room,state:state}) =>{
    rooms_state[room].state = state  
    console.table(rooms_state[room])
    socket.to(room).emit("state_update_from_server" , rooms_state[room].state);
  })

  //have to use disconnecting here because once the socket is 'disconnected' its room data is lost
  socket.on('disconnecting', () => {
    try {{
    let e = Array.from(socket.rooms) //convert socket.rooms which is a set to a array, since a set doesnt have indexes idk if this will always work, the room and socketid might flip indexes 

    //e[0] socketid if the current client 
    //e[1] room the socket is in

    console.log(socket_user_map[e[0]])

    socket.to(e[1]).emit('user-left-room' , socket_user_map[e[0]])
    //logic to remove the user from the room 
    console.table(rooms_state)
  };
    }
  catch(error){
    console.log(e, error)
  }}
)

});

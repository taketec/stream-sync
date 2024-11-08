import 'dotenv/config'
import mongoDBConnect from './mongodb/connection.js';
import express from 'express';
import userRoutes from './routes/user.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as Server from 'socket.io';
import mongoose from "mongoose"
import { rateLimit } from 'express-rate-limit'
import { AuthSocket } from './middleware/auth.js';
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { RedisStore } from 'rate-limit-redis'

const PORT = process.env.PORT || 8000

mongoose.set('strictQuery', false);
mongoDBConnect();

const allowed_origins =   [
  'http://localhost:3001',
  'http://localhost:3000',
  'http://192.168.1.4:3000',
  'https://stream-sync-app.onrender.com',
  'https://stream-sync-frontend-s3.s3-website.ap-south-1.amazonaws.com',
  'http://stream-sync-frontend-s3.s3-website.ap-south-1.amazonaws.com',
  'https://deploy.dd5lzrcymgwyt.amplifyapp.com'
]

const client = new Redis()

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit:100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	store: new RedisStore({
		// @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
		sendCommand: (...args) => client.call(...args),
	}),  statusCode:429,
  message:  (req, res) => {
		 return 'You can only make 100 requests every hour.'
	},
})


const app = express();
const corsConfig = {
  origin: allowed_origins,
  //origin: '*',
  credentials: true,
  methods:["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

const createLog = (req, res, next) => {
  res.on("finish", function() {
    console.log(req.method,req.body, decodeURI(req.url), res.statusCode, res.statusMessage);
  });
  next();
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(createLog)
//app.use(limiter)
//xapp.options("*",cors(corsConfig))
app.use(cors(corsConfig));
app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: "hi humans" });
});

app.get('/x-forwarded-for', (request, response) => response.send(request.headers['x-forwarded-for']))

app.set('trust proxy', 1)
app.get('/ip', (request, response) => response.send(request.ip))

const server = app.listen(PORT, () => {
  console.log(`Server Listening at PORT - ${PORT}`);
});


const pubClient = new Redis();
const subClient = pubClient.duplicate();

const io = new Server.Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowed_origins,
  },
  adapter: createAdapter(pubClient, subClient)
});

function get_time(){
	let d = new Date()
	let t = d.getTime()/1000
	// delta is the correction parameter
	return t
}
//simulate delay
// io.use((socket, next) => {
//   // Delay in milliseconds (adjust as needed)
//   const delay = 500; // 2 seconds delay
  
//   // Simulate delay before proceeding
//   setTimeout(() => {
//     next();
//   }, delay);
// });

let rooms_state = {}//initialize roomstate object  



io.use((socket,next)=>
AuthSocket(socket,next))  //authenticate socket connection with jwt.
.on('connection', (socket) => {

  socket.on('join_room', ({room:room,username:username}) => {

    if (!rooms_state[room]){
      console.log('new room created')
      let blank_state = {
        media : 'file',
        url: null,
        video_timestamp : 0.0,
        lastUpdated : get_time(),
        playing:false,
        global_timestamp: get_time(),
        //client_uid: get_jwt().substring(37,70)
      }

      rooms_state[room] = {users:[], state:blank_state}; //adding default room state to a room if it doesnt already exist
    }

    if (rooms_state[room].users[socket.id] == undefined) { // check if the user is already in the room
          rooms_state[room].users[socket.id] = username; // add the user to the rooms user list
          //console.log(`User ${socket.id} joined room ${room}`);
    } else {
          console.log(`User ${socket.id} is already in room ${room}`);
    }
    console.log(`user ${rooms_state[room].users[socket.id]} joined ${room} `)
    console.table(rooms_state[room].users)//all the code till now just manages the users state in the global room_state object, and after this the user joins he room
    socket.join(room);
    io.to(room).emit('userlist_update', Object.values(rooms_state[room].users))
  });

  socket.on('explicit_state_request', (room) => {
    if (rooms_state[room] == undefined){
      console.log('new room created')
      rooms_state[room] = {users:[], state:blank_state}; //adding default room state to a room if it doesnt already exist
    }
    socket.emit('state_update_from_server',rooms_state[room].state)
  })
  
  socket.on('time_sync_request_backward', () => {
    socket.emit('time_sync_response_backward',get_time())
  })

  socket.on('time_sync_request_forward', (time_at_client) => {
    socket.emit('time_sync_response_forward',get_time() - time_at_client)
  })

  socket.on('state_update_from_client',(data) =>{
    console.log(data.state)
      if (rooms_state[data.room] && rooms_state[data.room].state) {
        rooms_state[data.room].state = data.state;
        socket.to(data.room).emit("state_update_from_server", rooms_state[data.room].state);
      } else {
        
        rooms_state[data.room] = { users: [], state: {
          media : 'file',
          url: null,
          video_timestamp : 0.0,
          lastUpdated : get_time(),
          playing:false,
          global_timestamp: get_time(),
          //client_uid: get_jwt().substring(37,70)
        } };
      }
      })

  //have to use disconnecting here because once the socket is 'disconnected' its room data is lost
  socket.on('disconnecting', () => {
    try {{
    let e = Array.from(socket.rooms) //convert socket.rooms which is a set to a array, since a set doesnt have indexes idk if this will always work, the room and socketid might flip indexes 

    //e[0] socketid if the current client 
    //e[1] room the socket is in

    console.log(e)

    //socket.to(e[1]).emit('user_left_room' , rooms_state[e[1]].users[e[0]])
    if(rooms_state[e[1]].users[e[0]]){
    delete rooms_state[e[1]].users[e[0]]; 
    }else{
    io.to(e[1]).emit('userlist_update', Object.values(rooms_state[e[1]].users).filter(Boolean))}
    //logic to remove the user from the room 
    console.table(rooms_state[e[1]])
  };
    }
  catch(error){
    console.log(error)
  }}
)

});

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

let rooms_state = {}  
let socket_user_map = {}
io.on('connection', (socket) => {

  socket.on('setup', (userData) => {
    socket.join(userData.id);
    socket.emit('connected');
  });

  socket.on('join room', ({room:room,username:username}) => {
    if (rooms_state[room] == undefined){
      console.log('new room created')
      rooms_state[room] = {users:[],state:{playing:false}}; //adding default room state to a room if it doesnt already exist
    }
    if (!rooms_state[room].users.includes(username)) { // check if the user is already in the room
          rooms_state[room].users.push(username); // add the user to the rooms user list
          console.log(`User ${socket.id} joined room ${room}`);
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
  

  socket.on('disconnecting', () => {
    //add logic to remove the user from the room later
    console.table(rooms_state)
  });


  socket.on('new message', (newMessageRecieve) => {
    var chat = newMessageRecieve.chatId;
    if (!chat.users) console.log('chats.users is not defined');
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieve.sender._id) return;
      socket.in(user._id).emit('message recieved', newMessageRecieve);
    });
  });
});

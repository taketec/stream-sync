import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from "socket.io-client"
import { useNavigate } from 'react-router-dom';
import { validUser } from '../apis/auth';
import {get_global_time, median, timeout,get_jwt} from '../utils'
import Userlist from '../components/UsersList';
import YoutubeMedia from '../components/YoutubeMedia';
import FileMedia from '../components/FileMedia';

let socket


const Room = () => {

  const [currentSocket,setSocket] = useState(null)

  const [users, setUsers] = useState([]);

  //const [timestamp, setTimestamp] = useState('');
  const { roomId } = useParams();
  //const state = useRef(null)
  const over_estimates = useRef([])
  const under_estimates = useRef([])
  const over_estimate = useRef(0)
  const under_estimate = useRef(0)//i could have gotten away all these variables in the useeffect directly, but i like it this because of its simplicity and for any future modifications
  const [correction , setCorrection] = useState(0.0)

  const [selectedTab, setSelectedTab] = useState(null); 
  
  const navigate = useNavigate();

  useEffect(() => {
    const check_auth = async () => {
      try {
        const token = localStorage.getItem('userToken');

        if (token) {
          const response = await validUser();
          if (!response.token) {
            navigate('/login'); // Replace with your dashboard route
            localStorage.removeItem('userToken'); // Clear invalid token

          }
          } 
        else {
          navigate('/login'); // Replace with your dashboard route
        }
        }
     catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    check_auth();}, 
  []); 


  useEffect(() => {
    const socket_listen = async() => {
      socket = io('https://stream-sync.onrender.com')
      const response = await validUser();
      let username
      try{
      username = response.user.name;
      }
      catch{
        navigate('/login')
      }
      socket.emit('join_room', {room:roomId,username:username});
      
      socket.emit('explicit_state_request',roomId)
      
      socket.on('state_update_from_server',(state)=>{
        if(state.media!==selectedTab){

          setSelectedTab(state.media)
        
        }
      })


      socket.on('user_left_room' , (user) => {
        console.log(`user ${user} left room`)
      })

      socket.on("time_sync_response_backward", (time_at_server)=>{
        let under_estimate_latest =  time_at_server - get_global_time(0)
        under_estimates.current.push(under_estimate_latest)	
        under_estimate.current = median(under_estimates.current)
        setCorrection((under_estimate.current + over_estimate.current)/2)		
        console.log(`%c Updated val for under_estimate is ${under_estimate.current}`, "color:green")
        console.log(`%c New correction time is ${correction} seconds`, 'color:purple; font-size:12px')
      })
      
      socket.on("time_sync_response_forward", (calculated_diff)=>{
        let over_estimate_latest = calculated_diff
        over_estimates.current.push(over_estimate_latest)	
        over_estimate.current = median(over_estimates.current)
        setCorrection((under_estimate.current + over_estimate.current)/2) 	
        console.log(`%c Updated val for over_estimate is ${over_estimates.current}`, "color:green")
        console.log(`%c New correction time is ${correction} seconds`, 'color:purple; font-size:12px')
      })
      
      socket.on('userlist_update',(userlist)=>{
        setUsers(userlist)
        console.table(userlist)
        setSocket(socket)
      })
      return () => {
        socket.disconnect();
      };
    }
    socket_listen()},
   [])
  
  let do_time_sync_one_cycle_backward = () => {
    socket.emit("time_sync_request_backward")
  }
  let do_time_sync_one_cycle_forward = () => {
    socket.emit("time_sync_request_forward", get_global_time(0))
  }

  //this whole thing runs a bit weird in react strict mode, since the useeffect is ran twice it results in the whole process done twice
  useEffect(()=>{
    const do_time_sync = async() =>{
      for(let i = 0; i <  5; i++){
        await timeout(1000)
        do_time_sync_one_cycle_backward()
        await timeout(1000)
        do_time_sync_one_cycle_forward()
        
      }
      
    }

    do_time_sync()
  },[])

  useEffect(() => console.log(roomId),[roomId])//logs room id

  useEffect(() => console.log(selectedTab),[selectedTab])//logs selected tab


  const handleTabChange = (tabIndex) => {
    if(tabIndex!==selectedTab){

    // Update the selected tab locally
    setSelectedTab(tabIndex);
    let state_image = {
      media : tabIndex,
      url : null,
      video_timestamp : 0,//removing the delay 
      lastUpdated : get_global_time(correction),
      playing:false,
      global_timestamp: get_global_time(correction),
      client_uid: get_jwt().substring(37,70)
    }

    socket.emit('state_update_from_client', {room : roomId ,state: state_image});
  }
  };


  return (
      <div className="flex h-screen border rounded shadow">
        <div className="flex-1 flex flex-col">
          {socket && (
            <nav>
            <ul className="flex">
              <li className="mr-2">
                <button onClick={() => handleTabChange('youtube')} className="m-2 my-2 px-2 py-1 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-700 w-20">
                  Youtube
                </button>
              </li>
              <li className="ml-4">
                <button onClick={() => handleTabChange('file')} className="m-2 my-2 px-2 py-1 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-700 w-20">
                  File
                </button>
              </li>
            </ul>
          </nav>            
          )}
          <div className="flex-1">
            {selectedTab && currentSocket && (
              <>
                {selectedTab === 'youtube' && <YoutubeMedia socket={currentSocket} roomId={roomId} correction={correction} />}
                {selectedTab === 'file' && <FileMedia socket={currentSocket} roomId={roomId} correction={correction} />}
              </>
            )}
          </div>
        </div>
        <div className="overflow-y-auto pt-5" style={{ flex: '0 0 auto' }}>
          <Userlist user_list={users}/>
        </div>
      </div>
);
};

export default Room;

// const handleSeekToTimestamp = () => {
//   const seconds = parseFloat(timestamp);
//   if (!isNaN(seconds) && playerRef.current) {
//     socket.emit('seeked-to',{'room':roomId,"timestamp": seconds})
//     playerRef.current.seekTo(seconds, 'seconds');
//     setTimeout(() => {
//       console.log(`Video seeked to ${seconds} seconds`);
//     }, 100); // Adjust delay as needed
//   }
// };
  //PLAYPAUSE SETTER
  // const handlePlayPause = () => {
  //   socket.emit("paused",{room : roomId , playing:!playPause})
  //   setPlayPause(prevCheck => !prevCheck)
  // }
//   <div className="mt-4">
//   <label htmlFor="timestampInput" className="block mb-2 text-gray-700">Enter timestamp (seconds):</label>
//   <input
//     type="text"
//     id="timestampInput"
//     value={timestamp}
//     onChange={handleInputChange}
//     className="w-32 px-4 py-2 mr-2 text-gray-800 border rounded shadow"
//   />
//   <button 
//     onClick={handleSeekToTimestamp} 
//     className="px-4 py-2 bg-blue-500 text-white rounded shadow"
//   >
//     Jump to Timestamp
//   </button>
//   <button 
//     onClick={handlePlayPause} 
//     className="px-4 py-2 bg-blue-500 text-white rounded shadow"
//   >
//     pause/play
//   </button>
  
// </div>

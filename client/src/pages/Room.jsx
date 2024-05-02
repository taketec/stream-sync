import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useParams } from 'react-router-dom';
import io from "socket.io-client"
import { useNavigate } from 'react-router-dom';
import { validUser } from '../apis/auth';
import {get_global_time, median, timeout, get_jwt} from '../utils'
import Userlist from '../components/UsersList';

let socket

const THRESH_IGNORANCE = 0.2
const THRESH_IGNORANCE_SEEK = 0.5

const PLAYING_THRESH = 1 
const PAUSED_THRESH = 0.01

//let TEMP_URL = `https://rr2---sn-i5uif5t-2o9l.googlevideo.com/videoplayback?expire=1714277406&ei=vnctZsyrD8Dlz7sPvvqgMA&ip=116.75.30.244&id=o-AJfpBMoiQhwvIrm0adn0w17ZGIWC7IO2af74g-_2LEDY&itag=22&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=CG&mm=31%2C29&mn=sn-i5uif5t-2o9l%2Csn-gwpa-qxa6&ms=au%2Crdu&mv=m&mvi=2&pl=22&gcr=in&initcwndbps=1453750&bui=AWRWj2RtyyTRuxLiITjVeDbfpbuM2n8_rz9p2W5krbbSmVNb8JO9IUMk_STh8ce5Hi7i_h_U202QT4kA&spc=UWF9f9tRwoXxBei2OPalfjRMKeinzk4SgI7COEcHwnWby-ZhVmRd3JXiXQui&vprv=1&svpuc=1&mime=video%2Fmp4&ns=494aXBfI6v6IaDlKgzNkMHUQ&cnr=14&ratebypass=yes&dur=164.606&lmt=1661553915691651&mt=1714255501&fvip=7&c=WEB&sefc=1&txp=6318224&n=Y0jPXFmaEyhch9F3lq&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cgcr%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Ccnr%2Cratebypass%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AHWaYeowRQIgdzqSdW-fiGQuj_LH7QKwRYraH2sHTllYQtmzISx96UMCIQDmVb8srTDfaJlS_i5pP8fjnbu3YUZygFDA0QCxtLzcvg%3D%3D&sig=AJfQdSswRAIgQHgXQe-qPgqVG0d1ROZ4Rn40hYKCMZt0tAYxmCh87h4CIDTc5BkddNQWEnXo_A2rBzQZ_PiRQJJgB4DhWceZFGi7`
const Room = () => {
  const [videoFilePath, setVideoFilePath] = useState(null);
  const [users, setUsers] = useState([]);

  //const [timestamp, setTimestamp] = useState('');
  const playerRef = useRef(null);
  const { roomId } = useParams();
  const [playPause, setPlayPause] = useState(false);
  //const state = useRef(null)
  const over_estimates = useRef([])
  const under_estimates = useRef([])
  const over_estimate = useRef(0)
  const under_estimate = useRef(0)//i could have gotten away with just keeping the correction as a ref value and declaring other variables in the useeffect directly, but i like it this because of its simplicity and for any future modifications
  const correction = useRef(0)

  const is_playing  = useRef(false)

  let lastUpdated  = useRef(null)
  
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

  const setVideoState = (state)=>{
    if (playerRef.current){
    lastUpdated.current = get_global_time()
    let proposed_time = (state.playing) ? ((state.video_timestamp - state.global_timestamp) + get_global_time(correction.current) ) : (state.video_timestamp)
    let gap = Math.abs(proposed_time - playerRef.current.getCurrentTime())
    
    console.log(`%cGap was ${gap}`, 'font-size:12px; color:purple')
    console.log(proposed_time)

    is_playing.current = state.playing

    if (state.playing){
      if(gap > PLAYING_THRESH){
        // tolerance while the video is playing
        playerRef.current.seekTo(proposed_time, 'seconds')
      }
      
      setPlayPause(state.playing)
    }
    else{
      setPlayPause(state.playing)
      if (gap > PAUSED_THRESH){
        // condition to prevent an unnecessary seek
        playerRef.current.seekTo(proposed_time, 'seconds')
      
      }
    }}
  }

  useEffect(() => {
    const socket_listen = async() => {
      socket = io('http://localhost:8000')
      const response = await validUser();
      let username
      try{
      username = response.user.name;
      }
      catch{
        navigate('/login')
      }
      socket.emit('join_room', {room:roomId,username:username});
  
      socket.on('user_left_room' , (user) => {
        console.log(`user ${user} left room`)
      })

      socket.on('state_update_from_server',setVideoState)

      socket.on("time_sync_response_backward", (time_at_server)=>{
        let under_estimate_latest =  time_at_server - get_global_time(0)
        under_estimates.current.push(under_estimate_latest)	
        under_estimate.current = median(under_estimates.current)
        correction.current = (under_estimate.current + over_estimate.current)/2		
        console.log(`%c Updated val for under_estimate is ${under_estimate.current}`, "color:green")
        console.log(`%c New correction time is ${correction.current} seconds`, 'color:purple; font-size:12px')
      })
      
      socket.on("time_sync_response_forward", (calculated_diff)=>{
        let over_estimate_latest = calculated_diff
        over_estimates.current.push(over_estimate_latest)	
        over_estimate.current = median(over_estimates.current)
        correction.current = (under_estimate.current + over_estimate.current)/2		
        console.log(`%c Updated val for over_estimate is ${over_estimate.current}`, "color:green")
        console.log(`%c New correction time is ${correction.current} seconds`, 'color:purple; font-size:12px')
      })
      
      socket.on('userlist_update',(userlist)=>{
        setUsers(userlist)
        console.table(userlist)
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
      for(let i = 0; i <  10; i++){
        await timeout(1000)
        do_time_sync_one_cycle_backward()
        await timeout(1000)
        do_time_sync_one_cycle_forward()
      }
    }

    do_time_sync()
  },[])

  useEffect(() => console.log(roomId),[roomId])//logs room id
  useEffect(() => {console.log('playing set to -> ',playPause)},[playPause])//logs playing/pausing state

  const handleVideoUpload = (event) => {
    setVideoFilePath(URL.createObjectURL(event.target.files[0]));
  };



  const handle_pause = () => {
    is_playing.current = false
    if (get_global_time() - lastUpdated.current > THRESH_IGNORANCE ){
      let state_image = {
        video_timestamp : playerRef.current.getCurrentTime(),
        lastUpdated : get_global_time(correction.current),
        playing:false,
        global_timestamp: get_global_time(correction.current),
        client_uid: get_jwt().substring(37,70)
      }
      //console.log(`########### room-id ################ ${roomId}`)
      socket.emit("state_update_from_client",{room : roomId ,state: state_image})
    }
    else{console.log(`ignored event due to it being a result of unwanted event being fired, last updated = ${lastUpdated.current}`)}
  } 
  const handle_play = () => {
    is_playing.current = true
    if (get_global_time() - lastUpdated.current > THRESH_IGNORANCE ){
      let state_image = {
        video_timestamp : playerRef.current.getCurrentTime(),
        lastUpdated : get_global_time(correction.current),
        playing:true,
        global_timestamp: get_global_time(correction.current),
        client_uid: get_jwt().substring(37,70)
      }
      socket.emit("state_update_from_client",{room : roomId ,state: state_image})
    }else{console.log(`ignored play state update event event due to it being a result of unwanted event being fired, last updated = ${lastUpdated.current}`)}

  } 
  const handle_seek = (seconds) => {
    if (get_global_time() - lastUpdated.current > THRESH_IGNORANCE_SEEK ){
      let state_image = {
        video_timestamp : seconds,//not using ref becuase its buggy, gives time before the seek event, the onSeek callback is built for this. 
        lastUpdated : get_global_time(correction.current),
        playing:is_playing.current,
        global_timestamp: get_global_time(correction.current),
        client_uid: get_jwt().substring(37,70)
      }
      socket.emit("state_update_from_client",{room : roomId ,state: state_image})
    }else{console.log(`ignored seek event due to it being a result of unwanted event being fired, last updated = ${lastUpdated.current}`)}
  };
  const onLoad = () =>{
    if (get_global_time() - lastUpdated.current > 0.2 ){//need this condition for some buggy event firing, onReady gets called everytime when playing is changed 
      socket.emit('explicit_state_request',roomId)
    console.log('------------------------------- loaded-------------------------------------')
    }
  }

  return (
    <div className="flex h-screen border rounded shadow">
      <div className="flex-1 flex flex-row">
        <div className="p-4">
          <input 
            type="file" 
            className="mb-4"
            onChange={handleVideoUpload} 
          />
          {videoFilePath && (
            <div className="relative" style={{ paddingTop: '0%', width: '100%' }}>
              <ReactPlayer 
                ref={playerRef}
                onSeek={handle_seek}//SEEK EVENT GETTER
                onPause={handle_pause}
                onPlay={handle_play}
                url={videoFilePath} 
                className="absolute top-0 left-0 w-full h-full"
                playing={playPause}
                controls={true} 
                onReady={onLoad}
              />
            </div>
          )}
        </div>
        <div className="overflow-y-auto pt-5">
          <Userlist user_list={users}/>
        </div>
      </div>
    </div>     );
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

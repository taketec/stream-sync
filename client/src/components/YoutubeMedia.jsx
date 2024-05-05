
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';
import {get_global_time, get_jwt} from '../utils'

const THRESH_IGNORANCE = 0.2
const THRESH_IGNORANCE_SEEK = 0.5

const PLAYING_THRESH = 1 
const PAUSED_THRESH = 0.01



const YouTubeMedia = (props) => {
  let roomId = props.room
  let correction = props.correction
  const [inputValue, setInputValue] = useState('');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  const playerRef = useRef(null);

  const [playPause, setPlayPause] = useState(false);

  let lastUpdated  = useRef(null)

  const is_playing  = useRef(false)

  const setVideoState = (state)=>{
    if (playerRef.current){
    
    if (state.url !== videoUrl){
      setVideoUrl(state.url)

    } 
    
    lastUpdated.current = get_global_time()
    let proposed_time = (state.playing) ? ((state.video_timestamp - state.global_timestamp) + get_global_time(correction) ) : (state.video_timestamp)
    let gap = Math.abs(proposed_time - playerRef.current.getCurrentTime())
    
    console.log(`%cGap was ${gap}`, 'font-size:12px; color:purple')
    console.log(proposed_time)

    is_playing.current = state.playing
    console.log(`#############################playing set to ${state.playing} `)
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

  useEffect(()=>{
    console.log('in youtube')
    const socket_listen = () => {
        if (props.socket){
        props.socket.on('state_update_from_server',setVideoState)
        return () => {
          props.socket.off('state_update_from_server');
        };
      }else{console.log('socket was null')}}
      socket_listen()
    },
    []
  )

  useEffect(() => {console.log('playing set to -> ',playPause)},[playPause])//logs playing/pausing state

  const handleVideoChange = (e) => {
    e.preventDefault();
    setVideoUrl(inputValue);
    is_playing.current = false
    let state_image = {
      media : 'youtube',
      url : inputValue,
      video_timestamp : 0,//removing the delay 
      lastUpdated : get_global_time(correction),
      playing:false,
      global_timestamp: get_global_time(correction),
      client_uid: get_jwt().substring(37,70)
    }
    props.socket.emit("state_update_from_client",{room : roomId ,state: state_image})


    setInputValue('');
  };

    

  const handle_pause = () => {
    is_playing.current = false
    if (get_global_time() - lastUpdated.current > THRESH_IGNORANCE ){
      let state_image = {
        media : 'youtube',
        url : videoUrl,  
        video_timestamp : playerRef.current.getCurrentTime(),
        lastUpdated : get_global_time(correction),
        playing:false,
        global_timestamp: get_global_time(correction),
        client_uid: get_jwt().substring(37,70)
      }
      //console.log(`########### room-id ################ ${roomId}`)
      props.socket.emit("state_update_from_client",{room : roomId ,state: state_image})
    }
    else{console.log(`ignored event due to it being a result of unwanted event being fired, last updated = ${lastUpdated.current}`)}
  } 
  const handle_play = () => {
    is_playing.current = true
    if (get_global_time() - lastUpdated.current > THRESH_IGNORANCE ){
      let state_image = {
        media : 'youtube',
        url : videoUrl,  
        video_timestamp : playerRef.current.getCurrentTime(),
        lastUpdated : get_global_time(correction),
        playing:true,
        global_timestamp: get_global_time(correction),
        client_uid: get_jwt().substring(37,70)
      }
      props.socket.emit("state_update_from_client",{room : roomId ,state: state_image})
    }else{console.log(`ignored play state update event event due to it being a result of unwanted event being fired, last updated = ${lastUpdated.current}`)}

  } 
  const handle_seek = async(seconds) => {
    if (get_global_time() - lastUpdated.current > THRESH_IGNORANCE_SEEK ){
      let timestamp;
      console.log('on seek called')
      await new Promise((resolve) => {
        setTimeout(() => {
          timestamp = playerRef.current.getCurrentTime();
          resolve();
        }, 50); // gives time before the seek event, thus the delay is needed
      });
      
      let state_image = {
        media : 'youtube',
        url : videoUrl,  
        video_timestamp : seconds-0.05,//removing the delay 
        lastUpdated : get_global_time(correction),
        playing:is_playing.current,
        global_timestamp: get_global_time(correction),
        client_uid: get_jwt().substring(37,70)
      }
      props.socket.emit("state_update_from_client",{room : roomId ,state: state_image})
      await new Promise((resolve) => {
        setTimeout(() => {
          console.log('this is the post seek update')
          props.socket.emit('explicit_state_request',roomId)
          resolve();
        }, 4000); // gives time before the seek event, thus the delay is needed
      });

    }else{console.log(`ignored seek event due to it being a result of unwanted event being fired, last updated = ${lastUpdated.current}`)}
  };
  
  const onLoad = () =>{
    if (get_global_time() - lastUpdated.current > 0.2 ){//need this condition for some buggy event firing, onReady gets called everytime when playing is changed 
      props.socket.emit('explicit_state_request',roomId)
      console.log('------------------------------- loaded-------------------------------------')
    }
  }


    return(
      <div className="flex flex-col items-center w-full m-2 "> {/* Parent div */}
        <div className="relative" style={{ paddingTop: '1%', width: '100%' }}>
          <form onSubmit={handleVideoChange}>
            <div className="m-0">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter only valid url"
              />
            </div>
            <button 
              type="submit"
              className={`my-2 px-2 py-1 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-700`}
            >
              Submit
            </button>
          </form>
        </div>
        
        <div className="relative" style={{ paddingTop: '0%', width: '100%' }}>
          <ReactPlayer 
            ref={playerRef}
            onSeek={handle_seek}//SEEK EVENT GETTER
            onPause={handle_pause}
            onPlay={handle_play}
            onBufferEnd={handle_play}
            url={videoUrl}
            className="absolute top-0 left-0 w-full h-full"
            playing={playPause}
            controls={true} 
            onReady={onLoad}
          />
        </div>
      </div>

      )
    }

export default YouTubeMedia
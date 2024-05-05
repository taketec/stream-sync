import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';
import {get_global_time, median, timeout, get_jwt} from '../utils'


const THRESH_IGNORANCE = 0.2
const THRESH_IGNORANCE_SEEK = 0.5

const PLAYING_THRESH = 1 
const PAUSED_THRESH = 0.01

const FileMedia = (props) => {
    let correction = props.correction
    let roomId = props.room

    const [videoFilePath, setVideoFilePath] = useState(null);

    const playerRef = useRef(null);
    const [playPause, setPlayPause] = useState(false);

    const is_playing  = useRef(false)

    let lastUpdated  = useRef(null)

    let lastUpdatedAtClient  = useRef(null)

    const navigate = useNavigate();

    const setVideoState = (state)=>{
        if (playerRef.current){
        lastUpdated.current = get_global_time()
        let proposed_time = (state.playing) ? ((state.video_timestamp - state.global_timestamp) + get_global_time(correction) ) : (state.video_timestamp)
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
          props.socket.on('state_update_from_server',setVideoState)
    
          return () => {
            props.socket.off('state_update_from_server');
          };
        }
        socket_listen()},
       [])
       const handleVideoUpload = (event) => {
        setVideoFilePath(URL.createObjectURL(event.target.files[0]));
      };

      useEffect(() => {console.log('playing set to -> ',playPause)},[playPause])//logs playing/pausing state


      const handle_pause = () => {
        is_playing.current = false
        let gap = get_global_time() - lastUpdated.current 
        if (get_global_time() - lastUpdated.current > THRESH_IGNORANCE ){
          lastUpdatedAtClient.current = get_global_time()
          let state_image = {
            media : 'file',
            url : null,
            video_timestamp : playerRef.current.getCurrentTime(),
            lastUpdated : get_global_time(correction),
            playing:false,
            global_timestamp: get_global_time(correction),
            client_uid: get_jwt().substring(37,70)
          }
          //console.log(`########### room-id ################ ${roomId}`)
          props.socket.emit("state_update_from_client",{room : roomId ,state: state_image})
        }
        else{console.log(`ignored event due to it being a result of unwanted event being fired, last updated = ${lastUpdated.current}`)
            console.log(`gap is ${gap}`)}
      } 
      const handle_play = () => {
        is_playing.current = true
        let gap = get_global_time() - lastUpdated.current 
        if (get_global_time() - lastUpdated.current > THRESH_IGNORANCE ){
          lastUpdatedAtClient.current = get_global_time()
          let state_image = {
            media : 'file',
            url : null,
            video_timestamp : playerRef.current.getCurrentTime(),
            lastUpdated : get_global_time(correction),
            playing:true,
            global_timestamp: get_global_time(correction),
            client_uid: get_jwt().substring(37,70)
          }
          props.socket.emit("state_update_from_client",{room : roomId ,state: state_image})
    
        }else{console.log(`ignored play state update event event due to it being a result of unwanted event being fired, last updated = ${lastUpdated.current}`)
              console.log(`gap is ${gap}`)}
      } 
      const handle_seek = (seconds) => {
        let gap = get_global_time() - lastUpdated.current 
        if (gap > THRESH_IGNORANCE_SEEK ){
          lastUpdatedAtClient.current = get_global_time()
          let state_image = {
            media : 'file',
            url : null,
            video_timestamp : seconds,//not using ref becuase its buggy, gives time before the seek event, the onSeek callback is built for this. 
            lastUpdated : get_global_time(correction),
            playing:is_playing.current,
            global_timestamp: get_global_time(correction),
            client_uid: get_jwt().substring(37,70)
          }
          props.socket.emit("state_update_from_client",{room : roomId ,state: state_image})
          setTimeout(() => {
            props.socket.emit("explicit_state_request", roomId);
          }, 3000);
    
        }else{console.log(`ignored seek event due to it being a result of unwanted event being fired, lastupdated = ${lastUpdated.current}`)
              console.log(`gap is ${gap}`)}
      };
      const onLoad = () =>{
        if (get_global_time() - lastUpdated.current > 0.2 &&  get_global_time() - lastUpdatedAtClient.current > 0.5 ){//need this condition for some buggy event firing, onReady gets called everytime when playing is changed 
          console.log(`####################################### loaded hard #################################################`)
          props.socket.emit('explicit_state_request',roomId)
        }
      }
    
    
      return (    
              <div className="flex flex-col items-center w-full m-2 "> {/* Parent div */}
              <div className="relative" style={{ paddingTop: '1%', width: '100%' }}>
              <input 
                type="file" 
                className="mb-4"
                onChange={handleVideoUpload} 
              />
              </div>
              
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
            </div>
      
      
  );
};

export default FileMedia;

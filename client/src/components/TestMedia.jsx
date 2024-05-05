
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {get_global_time, get_jwt} from '../utils'

const PLAYING_THRESH = 1 
const PAUSED_THRESH = 0.01



const TestMedia = (props) => {
  let roomId = props.room
  let correction = props.correction
  const [inputValue, setInputValue] = useState('');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=gU-8U7Z-E64');

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
    console.log('in media')
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




    return(
      <div className="flex flex-col items-center w-full"> {/* Parent div */}
        <div className="relative" style={{ paddingTop: '1%', width: '100%' }}>
            <h2 className="text-xl font-semibold mb-2">This is a test component</h2>
        </div>
      </div>

      )
    }

export default TestMedia
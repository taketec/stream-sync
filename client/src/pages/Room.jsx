import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useParams } from 'react-router-dom';
import io from "socket.io-client"
import { useNavigate } from 'react-router-dom';
import { validUser } from '../apis/auth';

let socket

let THRESH_IGNORANCE = 0.1
let TEMP_URL = `https://rr2---sn-i5uif5t-2o9l.googlevideo.com/videoplayback?expire=1714277406&ei=vnctZsyrD8Dlz7sPvvqgMA&ip=116.75.30.244&id=o-AJfpBMoiQhwvIrm0adn0w17ZGIWC7IO2af74g-_2LEDY&itag=22&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&mh=CG&mm=31%2C29&mn=sn-i5uif5t-2o9l%2Csn-gwpa-qxa6&ms=au%2Crdu&mv=m&mvi=2&pl=22&gcr=in&initcwndbps=1453750&bui=AWRWj2RtyyTRuxLiITjVeDbfpbuM2n8_rz9p2W5krbbSmVNb8JO9IUMk_STh8ce5Hi7i_h_U202QT4kA&spc=UWF9f9tRwoXxBei2OPalfjRMKeinzk4SgI7COEcHwnWby-ZhVmRd3JXiXQui&vprv=1&svpuc=1&mime=video%2Fmp4&ns=494aXBfI6v6IaDlKgzNkMHUQ&cnr=14&ratebypass=yes&dur=164.606&lmt=1661553915691651&mt=1714255501&fvip=7&c=WEB&sefc=1&txp=6318224&n=Y0jPXFmaEyhch9F3lq&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cgcr%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Ccnr%2Cratebypass%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AHWaYeowRQIgdzqSdW-fiGQuj_LH7QKwRYraH2sHTllYQtmzISx96UMCIQDmVb8srTDfaJlS_i5pP8fjnbu3YUZygFDA0QCxtLzcvg%3D%3D&sig=AJfQdSswRAIgQHgXQe-qPgqVG0d1ROZ4Rn40hYKCMZt0tAYxmCh87h4CIDTc5BkddNQWEnXo_A2rBzQZ_PiRQJJgB4DhWceZFGi7`
const Room = () => {
  const [videoFilePath, setVideoFilePath] = useState(null);
  const [timestamp, setTimestamp] = useState('');
  const playerRef = useRef(null);
  const { roomId} = useParams();
  const [playPause, setPlayPause] = useState(false);
  const state = useRef(null)

  let lastUpdated  = useRef(null)
  let username
  
  const navigate = useNavigate();

  function get_global_time(delta = 0){
    let d = new Date()
    let t = d.getTime()/1000
    // delta is the correction parameter
    return t + delta
  }
  

  useEffect(() => {
    const checkAuth = async () => {
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

    checkAuth();
  }, []); // Run only on component mount


  useEffect(() => {
    const join_room = async() => {
      socket = io('http://localhost:8000')
      console.log(username,"asasfdasdfasdfasdf")
      const response = await validUser();
      username = response.user.name;
  
      socket.emit('join room', {room:roomId,username:username});
  
      socket.on("paused",(playing)=>{
        lastUpdated.current = get_global_time()
        setPlayPause(playing)
      })
      socket.on('seeked-to',(seconds)=>{
        lastUpdated.current = get_global_time()
        if(playerRef.current){playerRef.current.seekTo(seconds, 'seconds');}
      })
      return () => {
        socket.disconnect();
      };
  }
  join_room()
  },
   [])
  


  useEffect(() => console.log(roomId),[roomId])//logs room id
  useEffect(() => {console.log('playing set to -> ',playPause)},[playPause])//logs playing/pausing state

  const handleVideoUpload = (event) => {
    setVideoFilePath(URL.createObjectURL(event.target.files[0]));
  };

  const handleInputChange = (event) => {
    setTimestamp(event.target.value);
  };

  //PLAYPAUSE SETTER
  const handlePlayPause = () => {
    socket.emit("paused",{room : roomId , playing:!playPause})
    setPlayPause(prevCheck => !prevCheck)
  }

  const handleSeekToTimestamp = () => {
    const seconds = parseFloat(timestamp);
    if (!isNaN(seconds) && playerRef.current) {
      socket.emit('seeked-to',{'room':roomId,"timestamp": seconds})
      playerRef.current.seekTo(seconds, 'seconds');
      setTimeout(() => {
        console.log(`Video seeked to ${seconds} seconds`);
      }, 100); // Adjust delay as needed
    }
  };

  const handlePause = () => {
    if (get_global_time() - lastUpdated.current > THRESH_IGNORANCE ){
      socket.emit("paused",{room : roomId , playing:false})
    }
    else{console.log(`ignored event due to it being a result of unwanted event being fired, last updated = ${lastUpdated.current}`)}
  } 
  const handlePlay = () => {
    if (get_global_time() - lastUpdated.current > THRESH_IGNORANCE ){
      socket.emit("paused",{room : roomId , playing:true})
    }else{console.log(`ignored event due to it being a result of unwanted event being fired, last updated = ${lastUpdated.current}`)}

  } 

  const handleSeek = (seconds) => {
    if (get_global_time() - lastUpdated.current > 0.5 ){
      socket.emit("seeked-to",{room : roomId , timestamp: seconds})
    }else{console.log(`ignored event due to it being a result of unwanted event being fired, last updated = ${lastUpdated.current}`)}
  };


  return (
    <div className="flex flex-col items-center justify-center h-screen border rounded shadow">
      <input 
        type="file" 
        className="mb-4"
        onChange={handleVideoUpload} 
      />
      {videoFilePath && (
        <div className="w-full max-w-lg">
          <ReactPlayer 
            ref={playerRef}
            onSeek={handleSeek}//SEEK EVENT GETTER
            onPause={handlePause}
            onPlay={handlePlay}
            url={videoFilePath} 
            width="100%"
            height="100%" 
            controls={true} 
            playing = {playPause}
          />
          <div className="mt-4">
            <label htmlFor="timestampInput" className="block mb-2 text-gray-700">Enter timestamp (seconds):</label>
            <input
              type="text"
              id="timestampInput"
              value={timestamp}
              onChange={handleInputChange}
              className="w-32 px-4 py-2 mr-2 text-gray-800 border rounded shadow"
            />
            <button 
              onClick={handleSeekToTimestamp} 
              className="px-4 py-2 bg-blue-500 text-white rounded shadow"
            >
              Jump to Timestamp
            </button>
            <button 
              onClick={handlePlayPause} 
              className="px-4 py-2 bg-blue-500 text-white rounded shadow"
            >
              pause/play
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;

import './App.css';
import ReactPlayer from 'react-player'
import { useRef,useState } from 'react';
function App() {
  const handleOnChange = ()=> {
    setTimeout(() => {
      console.log('changed', playerRef.current.getCurrentTime());
    }, 50); // Adjust the delay as needed

  }

  const [videoFilePath, setVideoFilePath] = useState(null);
  const handleVideoUpload = (event) => {
    setVideoFilePath(URL.createObjectURL(event.target.files[0]));
    console.log(URL.createObjectURL(event.target.files[0]))
  };

  
  const playerRef = useRef(null);

  const handleSeek = () => {
    const timestampInput = document.getElementById('timestampInput').value;
    const seconds = parseFloat(timestampInput);
    if (!isNaN(seconds) && playerRef.current) {
      playerRef.current.seekTo(seconds, 'seconds');
      setTimeout(() => {
        console.log('seeked', playerRef.current.getCurrentTime());
      }, 1000); // Adjust the delay as needed
        }
  };


  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <input type="file" onChange={handleVideoUpload} />

          <ReactPlayer url={videoFilePath}
          ref={playerRef}
          onPause = {handleOnChange}  
          onPlay = {handleOnChange} 
          onSeek={e => console.log('onSeek', e)}
          controls = {true}/>

      <div>
        <label htmlFor="timestampInput">Enter timestamp (seconds):</label>
        <input type="text" id="timestampInput" />
        <button onClick={handleSeek}>Jump to Timestamp</button>
      </div>
      </header>
    </div>
  );
}

export default App;

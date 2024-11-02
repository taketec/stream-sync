# stream-sync, a watch-party app made with react, express, mongoDB and socket-io 

- demo - [https://deploy.dd5lzrcymgwyt.amplifyapp.com](https://deploy.dd5lzrcymgwyt.amplifyapp.com)
  ⚠️⚠️⚠️(Please be patient with the app, it might 2-5 seconds for everything to bootup and work.)⚠️⚠️⚠️
- the demo runs off of the deploy branch which has slight modifications.

# previews-

 - ## login - 
![](https://github.com/taketec/stream-sync/blob/main/previews/login.gif)


 - ## play from youtube - 
![](https://github.com/taketec/stream-sync/blob/main/previews/youtube.gif)


 - ## play from a file - 
![](https://github.com/taketec/stream-sync/blob/main/previews/file.gif)


I've been contemplating the development of an event-driven video synchronization application for quite some time. Unlike conventional methods like screen sharing via WebRTC, which often results in degraded quality and requires robust internet bandwidth, this application uses client-side events such as pausing, playing, or buffering to synchronize video playback across all participants in a shared room.The idea struck when I noticed that some of my friends struggled with poor internet connections during video calls on platforms like Discord and Google Meet. That's when I began contemplating solutions.

Doing some research upon this I found this really cool medium article https://levelup.gitconnected.com/tired-of-making-to-do-list-applications-acce875fe617 which explained exactly what I wanted.

Later on as i delved deeper into the world of web development, I really needed a good excuse to build a web app for learning web dev, so, I made this app.


## Features i would love to implement later with time - (from most important to least)
- Integrate a CDN for a video on demand service (VOD) so that users can upload and watch video streams OR stream video throught webtorrents (that would be cool)
- adding custom player controls to the react player, or using a better player like vidstack-io or plyr so that we can distinguish between user inputs and server made changes to the video-player without hacking around as mentioned in the article
- securing the websocket connections with jwt
- adding a create/join room page(like google meet)
- adding server side checks on room creations
- adding login with forgot password and email verification (i have only kept login with google in the demo, because this wasnt implemented)
- adding refresh tokens
- making the overall ui/ux better
- adding a display picture to the 'users in room' section
   

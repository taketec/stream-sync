# stream-sync, a watch-together app made with react, express, mongoDB and socket-io 

- demo - https://stream-sync-app.onrender.com
  (if this link doesnt work, just wait for about 50-100 second for the server instance to bootup. It shuts down due to inactivity)
- the demo runs off of the deploy branch which has slight modifications.

# previews-

 - ## login - 
![](https://github.com/taketec/stream-sync/blob/main/previews/login.gif)


 - ## play from youtube - 
![](https://github.com/taketec/stream-sync/blob/main/previews/youtube.gif)


 - ## play from file - 
![](https://github.com/taketec/stream-sync/blob/main/previews/file.gif)


I've been contemplating the development of an event-driven video synchronization application for quite some time. Unlike conventional methods like screen sharing via WebRTC, which often results in degraded quality and requires robust internet bandwidth, this application leverages client-side events such as pausing, playing, or buffering to synchronize video playback across all participants in a shared room.The idea struck when I noticed that some of my friends struggled with poor internet connections during video calls on platforms like Discord and Google Meet. That's when I began contemplating solutions.

Doing some research upon this I found this really cool medium article https://levelup.gitconnected.com/tired-of-making-to-do-list-applications-acce875fe617 which explained exactly what I wanted. This article is is a work of art, the research done is very neat, so please check it out and kudos to the author for such great work.

Later on as i delved deeper into the world of web development, I really needed a good excuse to build a web app for learning web dev, so, I made this app.


## Things i wanna improve - 
- securing socket connections with jwt
- adding a create/join room page(like google meet)
- adding server side checks on room creations
- adding login with forgot password and email verification (i have only kept login with google in the demo, because this wasnt implemented)
- improving the jwt middleware (adding refresh tokens maybe)
- making the fetch username flow better

## Features i would love to implement later with time -
- Feature to upload video files and stream them with hls in a watch party
- making the overall ui/ux better
- adding dp to the 'users in room' section
- adding custom player controls to the react player, or using a better player like vidstack-io so that we can distinguish between user inputs and server made inputs to the video-player as mentioned in the article
   

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


I've been wondering about implementing an event based video synchronisation app since a long time. How hard can it be, there are 3 states of a video , playing, paused, buffering so it shouldnt be very hard to sync videos on multiple clients and not have to use something like webrtc right? Well... its not really that simple. The need for this arose when some of my friends didnt have very good internet connections to watch videos with webrtc like discord and google meet and thats how I started thinking about it. 

Doing some research upon this I found this really cool article https://levelup.gitconnected.com/tired-of-making-to-do-list-applications-acce875fe617 which explained exactly what I wanted. This article is is a work of art, the code here is very elegant and the research done is very neat, so kudos to the author for such great work.

Later on, I needed an excuse to build a web app, for learning web dev so I made this app.



## Things i wanna improve upon - 
- securing socket connections with jwt
- adding a create/join room page(like google meet)
- adding server side checks on room creations
- adding login with forgot password and email verification (i have only kept login with google in the demo, because this wasnt implemented)
- improving the jwt middleware (adding refresh tokens maybe)
- making the fetch username flow better

## Features I will implement later if I have the time to -
- Feature to upload video files and stream them with hls in a watch party
- making the overall ui/ux better
- adding dp to the 'users in room' section
- adding custom player controls to the react player, or using a better player like vidstack-io so that we can distinguish between user inputs and server made inputs to the video-player as mentioned in the article
   

# stream-sync, a wathparty app made in the mern stack

- demo - https://stream-sync-app.onrender.com
  (if this link doesnt work, just wait for about 50-100 second for the server instance to bootup. It shuts down due to inactivity)

# previews-

## login - 
![](https://github.com/taketec/stream-sync/blob/main/previews/login.gif)


## play from youtube - 
![](https://github.com/taketec/stream-sync/blob/main/previews/youtube.gif)


## play from file - 
![](https://github.com/taketec/stream-sync/blob/main/previews/file.gif)


I have been wondering about how I can implement a event based video syncronization app myself since a long time. How hard can it be, there are 3 states of a video playing, playing, paused, buffering so it shouldnt be very hard to sync videos on multiple clients and not have to use something like webrtc right? Well... its not really that simple. The need for this arose when some of my friends didnt have very good internet connections to watch videos with webrtc like discord and google meet and thats how I started thinking about it. 

Doing some research upon this I found this really cool article https://levelup.gitconnected.com/tired-of-making-to-do-list-applications-acce875fe617 which explained exactly what I wanted. This article is is a work of art, the code here is very elegant and the research done is very neat, so kudos to the author for such great work.

Later on I needed an excuse to build a web app, for learning web dev so I made this app.



## Things i wanna improve upon - 
- securing socket connections with jwt\
- adding a create/join room page(like google meet)\
- adding server side checks on room creations\
- adding login with forgot password and email verification (i have only kept login with google in the demo, because this wasnt implemented)\
- improving the jwt middleware\
- making the fetch username flow better

## Features I will implement later if I have the time and motivation to -
- Feature to upload video files and stream them with hls in a watch party\
- making the overall ui/ux better
- adding dp to the 'users in room' section
 

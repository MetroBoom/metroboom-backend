# MetroBoom-Backend
> Connect your Party

## About MetroBoom

MetroBoom is an app that enables you to crowdsource the control of some Bluetooth speaker by allowing anyone in the room you may join in to or host, to share their own music from their phones to the hosting device using WebTorrents. 

This is the backend, Socket-based server of MetroBoom, enabling the following features:

* **Connect** to a "room"
* **Pull** a sorted queue of music to play from this room. If you are the host, you play this music.
* **Get** notified whenever the sorted list of music from this room changes
* **Add** a new music to the queue playlist of this room
* **Remove** music from the queue playlist of this room
* **Upvote** a specific music from the queue playlist of this room
* **Downvote** a specific music from the queue playlist of this room

## Technologies Used
NodeJS with Socket.IO was used for real-time communication. WebTorrents was used for the transmission of the files over the BitTorrent protocol.

## Before starting
Make sure to inspect the `.env` file and modify environment variables as needed.

## Debugging Notes
Inject this on your Google Chrome Developer Console, to play with the client side of the Socket server (for testing):

```javascript
var script = document.createElement('script');
script.type = "text/javascript";
script.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.5/socket.io.min.js";
(document.getElementsByTagName("head")[0]).appendChild(script);
```

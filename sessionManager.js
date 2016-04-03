var roomManager = require('./roomManager'), 
    cbHandler = require('./cbHandler');

/**
* @param {Object} gSocket - Global Socket
* @param {Object} socket - Socket.IO socket object
* @param {String} roomName - Name of the room this session is set to
* @param {String} username - Username
* @throws
*/
function sessionManager(gSocket, socket, roomName, username) {
    
    var userList, 
        musicList;
    try {
        userList = roomManager.getRoomMembers(roomName);
        musicList = roomManager.getRoomMusicList(roomName);
    } catch (e) {
        userList = e;
        musicList = e;
    }
    gSocket.in(roomName).emit('userList', userList);
    gSocket.in(roomName).emit('musicList', musicList);
    
    // Client adds new music to the queue
    socket.on('addMusic', function (data, callback) {
        try {
            roomManager.addMusic(roomName, {
                torrentLink: data.torrentLink,
                musicName: data.musicName,
                username: username
            });
        } catch (e) {
            cbHandler(e, callback);
            return;
        }
        
        var musicList = roomManager.getRoomMusicList(roomName);
        cbHandler(musicList, callback);
        gSocket.in(roomName).emit('musicList', musicList);
    });
    
    // Client removes music on the queue
    socket.on('removeMusic', function (musicId, callback) {
        roomManager.removeMusic(roomName, musicId);
        
        var musicList = roomManager.getRoomMusicList(roomName);
        cbHandler(musicList, callback);
        gSocket.in(roomName).emit('musicList', musicList);
    });
    
    // Client upvotes a music
    socket.on('upvoteMusic', function (musicId, callback) {
        try {
            roomManager.upvoteMusic(roomName, musicId, username);
        } catch (e) {
            cbHandler(e, callback);
            return;
        }
        
        var musicList = roomManager.getRoomMusicList(roomName);
        cbHandler(musicList, callback);
        gSocket.in(roomName).emit('musicList', musicList);
    });
    
    // Client downvotes a music
    socket.on('downvoteMusic', function (musicId, callback) {
        try {
            roomManager.downvoteMusic(roomName, musicId, username);
        } catch (e) {
            cbHandler(e, callback);
            return;
        }
        
        var musicList = roomManager.getRoomMusicList(roomName);
        cbHandler(musicList, callback);
        gSocket.in(roomName).emit('musicList', musicList);
    });
    
    // Client requests music listing
    socket.on('musicListing', function (callback) {
        var musicList = roomManager.getRoomMusicList(roomName);
        cbHandler(musicList, callback);
    });
}

module.exports = exports = sessionManager;
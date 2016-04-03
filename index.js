((require('node-env-file'))(__dirname + '/.env'));

var express = require('express'),
    socketIo = require('socket.io'),
    lodash = require('lodash'),
    
    roomManager = require('./roomManager'),
    sessionManager = require('./sessionManager'), 
    cbHandler = require('./cbHandler'),
    
    metroboomApp = express(), 
    gSocket = socketIo.listen(metroboomApp.listen(process.env.PORT_NUMBER));

/**
* CORS header
*/
metroboomApp.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods',
                  'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers',
                  'X-Requested-With, content-type, authorization, accept, origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === "OPTIONS") {
        res.send(200);
    } else {
        next();	
    }
});

gSocket.on('connection', function (socket) {
    
    socket.on('createRoom', function (username, callback) {
        if (typeof username !== "string" || 
            username.length === 0) {
            cbHandler(new Error("Username of the host is required"), 
                      callback);
            return;
        }
        
        var roomName = roomManager.createRoom(username);
        socket.join(roomName);
        
        sessionManager(gSocket, socket, roomName, username);
        cbHandler(roomName, callback);
    });
    
    socket.on('joinRoom', function (data, callback) {
        if (typeof data !== "object" || 
            !lodash.has(data, "username") || 
            !lodash.has(data, "roomName") || 
            typeof data.username !== "string" ||
            data.username.length === 0 || 
            typeof data.roomName !== "string" || 
            data.roomName.length === 0){
            cbHandler(new Error("Username of the joiner and " + 
                                "RoomName is required"), callback);
            return;
        }
        
        try {
            roomManager.addRoomMember(data.roomName, data.username);
        } catch (e) {
            cbHandler(e, callback);
            return;
        }
        
        socket.join(data.roomName);
        sessionManager(gSocket, socket, data.roomName, data.username);
        cbHandler("success", callback);
    }); 
    
});
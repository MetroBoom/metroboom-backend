var lodash = require('lodash'), 
    randomstring = require('randomstring');

/*
    {
        roomName: {
            host: String,
            musicList: [{
                id: String,
                torrentLink: String,
                musicName: String, 
                username: String,
                votes: {
                    username: {
                        type: String,
                        user: String
                    }
                },
                voteCount: Number
            }]
            membersList: Array<String>
        } 
    }
*/
var _rooms = {};


/**
* Checks if a room exists. If it doesn't, throws.
* @param {String} roomName
* @private
* @throws
*/
function _throwIfRoomNotExists(roomName) {
    if (!lodash.has(_rooms, roomName)) {
        throw new Error("Room does not exist");
    }
}

/**
* Checks if a music exists and gets its index. 
*   If it doesn't, throws.
* @param {String} roomName
* @param {String} musicId
*/
function _throwIfMusicNotExists(roomName, musicId) {
    var musicIndex = lodash.findIndex(_rooms[roomName].musicList, 
                                      function (musicInfoObj) {
        if (String(musicInfoObj.id) === String(musicId)) {
            return true;
        }

        return false;
    });

    if (musicIndex === -1) {
        throw new Error("That music " + musicId + 
                        " does not exist in this room!");
    }

    return musicIndex;
}

/**
* Checks if a user exists.
* @param {String} roomName
* @param {String} username
* @returns {Boolean}
*/
function _checkUserExists(roomName, username) {
    var userIndex = _rooms[roomName].membersList.indexOf(username);

    if (userIndex === -1) {
        return false;
    }

    return true;
}

/*
* Checks if music exists in a room.
* @param {String} roomName
* @param {String} musicId
* @returns {Boolean}
*/
function _checkMusicExists(roomName, musicId) {
    var musicExistence = false;

    _rooms[roomName].musicList.forEach(function (musicInfoObj) {
        if (String(musicInfoObj.id) === String(musicId)) {
            musicExistence = true;
        }
    });

    return musicExistence;
}

function _sortMusicListByVotes(roomName) {
    _rooms[roomName].musicList.sort(function (musicA, musicB) {
        if (musicA.voteCount > musicB.voteCount) {
            return 1;
        }
        else if (musicA.voteCount < musicB.voteCount) {
            return -1;
        }
        else {
            return 0;
        }
    });
}

/**
* Creates a room and adds the initial user at this room
* @param {String} hostUsername - username of the room's host
* @return {String} The name of the room
*/
function createRoom(hostUsername) {
    var roomName = randomstring.generate({
        length: 7,
        capitalization: "lowercase"
    });
    while (lodash.has(_rooms, roomName)) {
        roomName = randomstring.generate({
            length: 7,
            capitalization: "lowercase"
        });
    }

    _rooms[roomName] = {
        host: hostUsername,
        musicList: [],
        membersList: [hostUsername]
    };

    return roomName;
}

/**
* Destroys the room
* @param {String} roomName - The name of the room
*/
function removeRoom(roomName) {
    _throwIfRoomNotExists(roomName);

    delete _rooms[roomName];
}

/**
* Provides a list of usernames on a specific room
* @param {String} roomName - The name of the room
* @returns {Array<String>} List of usernames on that specific room
*/
function getRoomMembers(roomName) {
    _throwIfRoomNotExists(roomName);

    return lodash.clone(_rooms[roomName].membersList);
}

/**
* Provides a list of music queued for a room
* @param {String} roomName - The name of the room
* @returns {Array<Object>} List of music queued on that specific room
*/
function getRoomMusicList(roomName) {
    _throwIfRoomNotExists(roomName);

    return lodash.cloneDeep(_rooms[roomName].musicList);
}

/**
* Adds a user to a room
* @param {String} roomName - The name of the room
* @param {String} username - username
*/
function addRoomMember(roomName, username) {
    _throwIfRoomNotExists(roomName);
    if (_checkUserExists(roomName, username)) {
        throw new Error("User already exists");
    }

    _rooms[roomName].membersList.push(username);
}

/**
* Checks if a user is in the room
* @param {String} roomName - The name of the room
* @param {String} username - username
* @returns {Boolean} TRUE if user exists, FALSE otherwise
*/
function memberInRoom(roomName, username) {
    return _checkUserExists(roomName, username);
}

/**
* Remove a user and their music from the room
* @param {String} roomName - The name of the room
* @param {String} username - username
*/
function removeRoomMember(roomName, username) {
    _throwIfRoomNotExists(roomName);

    // Remove that member from the room
    lodash.remove(_rooms[roomName].membersList, function (someUsername) {
        return String(someUsername) === String(username);
    });
    // Remove that member's music from the room
    lodash.remove(_rooms[roomName].musicList, function (musicInfoObj) {
        return String(musicInfoObj.username) === 
            String(musicInfoObj.username);
    });
}

/**
* Adds music to a queue on a room
* @param {String} roomName - The name of the room
* @param {String} musicInfoObj - {torrentLink, musicName, username}
* @returns {String} - The generated id for the music that's just added
*/
function addMusic(roomName, musicInfoObj) {
    _throwIfRoomNotExists(roomName);

    // Check that musicInfoObj abides by an interface
    var requiredProperties = ["torrentLink", "musicName", "username"], 
        requiredPropsNotInObj = 
        requiredProperties.filter(function (propertyName) {
            if (!lodash.has(_rooms, roomName)) {
                return true;
            }

            return false;
        });
    if (requiredPropsNotInObj.length > 1) {
        throw new Error("Tried adding a music without " + 
                        requiredPropsNotInObj.join(" ") + " properties!");
    }
    // Check that the user who is adding music, exists in the room
    if (!_checkUserExists(roomName, musicInfoObj.username)) {
        throw new Error("That user does not exist in the room");
    }
    // Invalid provided torrent link
    if (typeof musicInfoObj.torrentLink !== "string" || 
        musicInfoObj.torrentLink.length === 0) {
        throw new Error("Invalid Music Torrent URL");
    }
    // Invalid provided music name
    if (typeof musicInfoObj.musicName !== "string" || 
        musicInfoObj.musicName.length === 0) {
        throw new Error("Invalid Music name");
    }

    var musicId = _rooms[roomName].musicList.length;
    _rooms[roomName].musicList.push({
        id: musicId,
        torrentlink: musicInfoObj.torrentlink,
        musicName: musicInfoObj.musicName,
        username: musicInfoObj.username, 
        votes: {},
        voteCount: 0
    });
    
    _sortMusicListByVotes(roomName);
    return musicId;
}


/**
* Removes music on the queue of a room
* @param {String} roomName - The name of the room
* @param {String} musicId - The id of the music in that room's queue
*/
function removeMusic(roomName, musicId) {
    _throwIfRoomNotExists(roomName);

    // Remove the music from the queue of the room
    lodash.remove(_rooms[roomName].musicList, function (musicInfoObj) {
        if (String(musicInfoObj.id) === String(musicId)) {
            return true;
        }

        return false;
    });
}

/**
* Upvote a music on the queue of a room
* @param {String} roomName - The name of the room
* @param {String} musicId - The id of the music in that room's queue
*/
function upvoteMusic(roomName, musicId, username) {
    _throwIfRoomNotExists(roomName);
    if (!_checkMusicExists(roomName, musicId)) {
        throw new Error("That music does not exist in the room's queue");
    }

    var musicIndex = _throwIfMusicNotExists(roomName, musicId), 
        votesObj = _rooms[roomName].musicList[musicIndex].votes, 
        voteCount = _rooms[roomName].musicList[musicIndex].voteCount;

    if (lodash.has(votesObj, username)) {
        // Second time they are upvoting? Reject
        if (votesObj[username].type === "upvote") {
            throw new Error("Already voted");
        }
        // They downvoted before? Reverse the downvote
        else if (votesObj[username].type === "downvote") {
            _rooms[roomName].musicList[musicIndex].voteCount++;
        }
    }
    
    votesObj[username] = {
        type: "upvote", 
        user: username
    };
    _rooms[roomName].musicList[musicIndex].voteCount++;
    
    // Sort music by votes
    _sortMusicListByVotes(roomName);
}

/**
* Downvote a music on the queue of a room
* @param {String} roomName - The name of the room
* @param {String} musicId - The id of the music in that room's queue
*/
function downvoteMusic(roomName, musicId, username) {
    _throwIfRoomNotExists(roomName);
    if (!_checkMusicExists(roomName, musicId)) {
        throw new Error("That music does not exist in the room's queue");
    }

    var musicIndex = _throwIfMusicNotExists(roomName, musicId), 
        votesObj = _rooms[roomName].musicList[musicIndex].votes, 
        voteCount = _rooms[roomName].musicList[musicIndex].voteCount;

    if (lodash.has(votesObj, username)) {
        // Second time they are downvoting? Reject
        if (votesObj[username].type === "downvote") {
            throw new Error("Already voted");
        }
        // They upvoted before? Reverse the upvote
        else if (votesObj[username].type === "upvote") {
            _rooms[roomName].musicList[musicIndex].voteCount--;
        }
    }
    
    votesObj[username] = {
        type: "downvote", 
        user: username
    };
    _rooms[roomName].musicList[musicIndex].voteCount--;
    
    // Sort music by votes
    _sortMusicListByVotes(roomName);
}

/**
* Downvote a music on the queue of a room
* @param {String} roomName - The name of the room
* @param {String} musicId - The id of the music in that room's queue
* @returns {Number} votes, in Numbers
*/
function getVotes(roomName, musicId) {
    _throwIfRoomNotExists(roomName);

    if (!_checkMusicExists(roomName, musicId)) {
        throw new Error("That music does not exist in the room's queue");
    }

    var musicIndex = lodash.findIndex(_rooms[roomName].musicList, 
                                      function (musicInfoObj) {
        if (String(musicInfoObj.id) === musicId) {
            return true;
        }

        return false;
    });

    return _rooms[roomName].musicList[musicIndex].voteCount;
}


exports.createRoom = createRoom;
exports.removeRoom = removeRoom;
exports.getRoomMembers = getRoomMembers;
exports.getRoomMusicList = getRoomMusicList;
exports.addRoomMember = addRoomMember;
exports.memberInRoom = memberInRoom;
exports.removeRoomMember = removeRoomMember;
exports.addMusic = addMusic;
exports.removeMusic = removeMusic;
exports.upvoteMusic = upvoteMusic;
exports.downvoteMusic = downvoteMusic;
exports.getVotes = getVotes;
const PLAYER_X = 'X';
const PLAYER_O = 'O';
const superTicTacToeSocket = (io) => {
    const existingRooms = new Set();
    const playerX = new Set();
    const playerO = new Set();
    const userRooms = new Map();
    io.on('connection', (socket) => {
        console.log('Super TicTacToe Connection Established');
          
        socket.on('Supercreate', (callback) => {
            const previousRooms = userRooms.get(socket.id) || [];
            previousRooms.forEach((roomID) => {
                socket.leave(roomID);
                existingRooms.delete(roomID)
                console.log(`Left room: ${roomID}`);
            });

            const random = Math.floor(1000000000 + Math.random() * 9000000000);
            const roomID = random + "ROOM" ;
            existingRooms.add(roomID);
            socket.join(roomID);
            const play = socket.id
            playerX.add(play)
            userRooms.set(socket.id, [roomID]);
            io.to(roomID).emit('Superroom', roomID);
            if (callback) callback(roomID); 
        })

        socket.on('Superjoin', (roomID, callback) => {
            if (existingRooms.has(roomID)) {
                socket.join(roomID);
                const play = socket.id
                playerO.add(play)
                io.to(roomID).emit('SuperJoined', roomID)
                userRooms.set(socket.id, [roomID]);

                if (callback) callback(true);
            } else {
                console.log("Failed to join:", roomID, "Room does not exist.");
                if (callback) callback(false);
            }
        });
        socket.on('playerAssignment', (roomID) =>{
            if(playerX.has(roomID.turnID)){
                console.log("X", roomID.turnID)
                io.to(roomID.turnID).emit('Player', PLAYER_X)
            } else if(playerO.has(roomID.turnID)){
                console.log("O", roomID.turnID)
                io.to(roomID.turnID).emit('Player', PLAYER_O)
            }
        })
        socket.on('SupermakeMove', (roomID) => {
            console.log(roomID.roomID, roomID.newTiles, roomID.turnID, "index", roomID.index, "big", roomID.newInd);
            if(playerX.has(roomID.turnID) && roomID.playerTurn === PLAYER_X){
                roomID.playerTurn = 'O'
                io.to(roomID.roomID).emit('SupermadeMove', roomID.index, roomID.newTiles, roomID.playerTurn, roomID.newInd)
            } else if (playerO.has(roomID.turnID) && roomID.playerTurn === PLAYER_O){
                roomID.playerTurn = 'X'
                io.to(roomID.roomID).emit('SupermadeMove', roomID.index, roomID.newTiles, roomID.playerTurn, roomID.newInd)
            }
        } )
    
        
        socket.on('disconnect', () => {
            console.log('disconnected')
            const previousRooms = userRooms.get(socket.id) || [];
            previousRooms.forEach((roomID) => {
                io.to(roomID).emit('Superleft')
                socket.leave(roomID);
                console.log(`Left room: ${roomID}`);
            });
            userRooms.delete(socket.id);
            playerX.delete(socket.id)
            playerO.delete(socket.id)
        });
    });
}

export default superTicTacToeSocket;
const PLAYER_X = 'X';
const PLAYER_O = 'O';
const ticTacToeSocket = (io) => {
    const existingRooms = new Set();
    const playerX = new Set();
    const playerO = new Set();
    const userRooms = new Map();
    io.on('connection', (socket) => {
        console.log('TicTacToe Connection Established');
          
        socket.on('Ticcreate', (callback) => {
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
            console.log("roomId server:", roomID);
            userRooms.set(socket.id, [roomID]);
            io.to(roomID).emit('Ticroom', roomID);
            if (callback) callback(roomID); 
        })

        socket.on('Ticjoin', (roomID, callback) => {
            if (existingRooms.has(roomID)) {
                socket.join(roomID);
                console.log("Joined:", roomID);
                const play = socket.id
                playerO.add(play)
                io.to(roomID).emit('TicJoined', roomID)
                userRooms.set(socket.id, [roomID]);

                if (callback) callback(true);
            } else {
                console.log("Failed to join:", roomID, "Tic Room does not exist.");
                if (callback) callback(false);
            }
        });
        socket.on('TicplayerAssignment', (roomID) =>{
            if(playerX.has(roomID.turnID)){
                console.log("X", roomID.turnID)
                io.to(roomID.turnID).emit('TicPlayer', PLAYER_X)
            } else if(playerO.has(roomID.turnID)){
                console.log("O", roomID.turnID)
                io.to(roomID.turnID).emit('TicPlayer', PLAYER_O)
            }
        })
        socket.on('TicmakeMove', (roomID) => {
            console.log(roomID.roomID, roomID.newTiles, roomID.turnID);
            if(playerX.has(roomID.turnID) && roomID.playerTurn === PLAYER_X){
                roomID.playerTurn = 'O'
                io.to(roomID.roomID).emit('TicmadeMove', roomID.newTiles, roomID.playerTurn)
            } else if (playerO.has(roomID.turnID) && roomID.playerTurn === PLAYER_O){
                roomID.playerTurn = 'X'
                io.to(roomID.roomID).emit('TicmadeMove', roomID.newTiles, roomID.playerTurn)
            }
        } )
    

        socket.on('disconnect', () => {
            console.log('disconnected')
            const previousRooms = userRooms.get(socket.id) || [];
            previousRooms.forEach((roomID) => {
                io.to(roomID).emit('Ticleft')
                socket.leave(roomID);
                console.log(`Left room: ${roomID}`);
            });
            userRooms.delete(socket.id);
            playerX.delete(socket.id)
            playerO.delete(socket.id)
        });
    });
}

export default ticTacToeSocket;
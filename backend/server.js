const http = require('http');
const express = require('express');

const { Server } = require('socket.io'); 

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 5000;

const roomState = {}; 

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    const updateParticipantCount = (roomId) => {
        const participantCount = roomState[roomId] ? roomState[roomId].size : 0;
        io.to(roomId).emit('participant_count_update', { count: participantCount });
        return participantCount;
    };

    socket.on('join', (data) => {
        const roomId = data.roomId;
        const username = data.username;

        if (!roomState[roomId]) {
            roomState[roomId] = new Set();
        }

        socket.data.username = username;

        const currentClients = roomState[roomId].size;
        
        if (currentClients >= 2) { 
            socket.emit('room-full', roomId);
            return;
        }

        socket.join(roomId);
        roomState[roomId].add(socket.id); 
        socket.data.roomId = roomId; 

        const newCount = roomState[roomId].size;

        if (newCount === 1) {
            console.log(`User ${username} [${socket.id}] created room: ${roomId}. Count: 1`);
        } else { // newCount === 2
            
            const existingPeerSocketId = Array.from(roomState[roomId]).find(id => id !== socket.id);
            const existingPeerSocket = io.sockets.sockets.get(existingPeerSocketId);

            console.log(`User ${username} [${socket.id}] joined room: ${roomId}. Count: 2`);
            
            if (existingPeerSocket) {
                existingPeerSocket.emit('start-offer'); 

                // 2. Send the NEW user's name to the EXISTING peer
                existingPeerSocket.emit('remote_user_joined', { username: data.username });

                // 3. Send the EXISTING user's name back to the NEW user
                if (existingPeerSocket.data.username) {
                     socket.emit('remote_user_joined', { username: existingPeerSocket.data.username });
                }
            }
        }

        updateParticipantCount(roomId); 
    });

    socket.on('offer', (data) => {
        socket.to(data.roomId).emit('offer', data.sdp); 
        console.log(`Offer sent to room: ${data.roomId}`);
    });

    socket.on('answer', (data) => {
        socket.to(data.roomId).emit('answer', data.sdp);
        console.log(`Answer sent to room: ${data.roomId}`);
    });

    socket.on('candidate', (data) => {
        socket.to(data.roomId).emit('candidate', data.candidate);
        console.log(`Candidate sent to room: ${data.roomId}`);
    });

    socket.on('video_status_change', ({ roomId, videoEnabled }) => {
      socket.to(roomId).emit('remote_video_status_change', { videoEnabled });
    });

    socket.on('user_leaving', ({ roomId }) => {
        if (roomState[roomId] && roomState[roomId].has(socket.id)) {
            socket.to(roomId).emit('remote_user_left');
            roomState[roomId].delete(socket.id);
            socket.leave(roomId); 
            
            const participantCount = roomState[roomId].size;
            socket.to(roomId).emit('participant_count_update', { count: participantCount });
            
            console.log(`User ${socket.data.username || socket.id} gracefully left room ${roomId}.`);
            if (participantCount === 0) {
                delete roomState[roomId];
            }
        }
    });

socket.on('chat-message', (data) => {
    const { roomId, sender, text } = data;
    
    console.log(`[Chat Relay] Broadcasting from ${sender} in room ${roomId}`);
    socket.to(roomId).emit('chat-message', { 
        sender: sender, 
        text: text 
    });

});
    
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        const roomId = socket.data.roomId; 
        
        if (roomId && roomState[roomId] && roomState[roomId].has(socket.id)) {
            
            roomState[roomId].delete(socket.id);
            
            console.log(`User ${socket.data.username || socket.id} disconnected from room ${roomId}.`);

            const participantCount = updateParticipantCount(roomId);
            
            if (participantCount === 0) {
                delete roomState[roomId];
            }
        }
    });
});


server.listen(PORT, () => {
    console.log(`Signaling Server listening on port ${PORT}`);
    console.log(`Awaiting client connections...`);
});
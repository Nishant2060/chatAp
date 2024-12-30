const { Server } = require('socket.io');
const express = require('express');
const app = express();
let server = app.listen(3000);
let io = new Server(server, {
  cors: {
    origin: '*',
  },
});

let users = {}; // Store connected users

io.on('connection', (socket) => {
  // Handle new user joining
  socket.on('joined-user', ({ myname }) => {
    users[socket.id] = myname; // Map socket ID to username
    socket.broadcast.emit('user-joined', myname); // Notify others
  });

  // Handle sending messages
  socket.on('send-msg', (data) => {
    io.emit('incomming-msg', { data }); // Broadcast the message to everyone
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const username = users[socket.id];
    delete users[socket.id]; // Remove the user from the list
    console.log(`${username} has disconnected.`);
  });
});

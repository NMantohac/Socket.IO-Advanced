const express = require('express');
const app = express();
const socketio = require('socket.io');

let namespaces = require('./data/namespaces');
// console.log(namespaces);
// console.log(namespaces[0]);

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(9000);
const io = socketio(expressServer);

// io.on = io.of('/').on
io.on('connection', (socket) => {
  // Build an array to send back the img and endpoint for each NS
  let nsData = namespaces.map((ns) => {
    return {
      img: ns.img,
      endpoint: ns.endpoint
    }
  })
  // console.log(nsData);

  // Send the nsData back to the client and we need to use socket (NOT io) 
  // because we want it to go to just this client
  socket.emit('nsList', nsData);
});

// Loop through each namespace and listen for a connection
namespaces.forEach( (namespace) => {
  // console.log(namespace)
  // const thisNs = io.of(namespace.endpoint)
  io.of(namespace.endpoint).on('connection', (nsSocket) => {
    console.log(`${nsSocket.id} has joined ${namespace.endpoint}`);
    // A socket has connected to one of our chatgroup namespaces
    // Send that ns group info back
    nsSocket.emit('nsRoomLoad', namespaces[0].rooms);
    nsSocket.on('joinRoom', (roomToJoin, numberofUsersCallback) => {
      // Deal with history... once we have it
      nsSocket.join(roomToJoin);
      io.of('/wiki').in(roomToJoin).clients( (error, clients) => {
        console.log(clients.length);
        numberofUsersCallback(clients.length);
      })
    })
    nsSocket.on('newMessageToServer', (msg) => {
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: 'rbunch',
        avatar: 'https://via.placeholder.com/30'
      }
      console.log(fullMsg);
      // Send this message to ALL the sockets that are in the room that THIS socket is in
      // How can we find out what rooms THIS socket is in
      console.log(nsSocket.rooms);
      // The user will be in the 2nd room in the object list
      // This is because the socket ALWAYS joins its own room on connection
      // Get the keys
      const roomTitle = Object.keys(nsSocket.rooms)[1];
      // console.log(roomTitle);
      io.of('/wiki').to(roomTitle).emit('messageToClients', fullMsg);
    })
  })
});

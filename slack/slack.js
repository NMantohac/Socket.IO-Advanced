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
  io.of(namespace.endpoint).on('connection', (socket) => {
    console.log(`${socket.id} has joined ${namespace.endpoint}`);
  })
});

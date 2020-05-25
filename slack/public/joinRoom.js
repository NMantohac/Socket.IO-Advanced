function joinRoom(roomName) {
  // Send this roomNameto the server!
  nsSocket.emit('joinRoom', roomName, (newNumberofMembers) => {
    // We want to update the room member total now that we have joined!
    document.querySelector('.curr-room-num-users').innerHTML = `${newNumberofMembers} <span class="glyphicon glyphicon-user"></span>`
  });
};

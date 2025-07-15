
const {Server} = require ('socket.io');

const io = new Server (8000, {
  cors: {
    origin: '*', 
  },
});

io.on ('connection', socket => {
  console.log ('Socket connected:', socket.id);

  socket.on ('room join', ({email, room}) => {
    console.log (`${email} joined room ${room}`);
    socket.join (room);
    socket.to (room).emit ('user:joined', {email, id: socket.id});
    socket.emit ('room join', {email, room});
  });

  socket.on ('user:call', ({to, offer}) => {
    io.to (to).emit ('incoming:call', {from: socket.id, offer});
  });

  socket.on ('call:accepted', ({to, answer}) => {
    io.to (to).emit ('call:accepted', {from: socket.id, answer});
  });

  socket.on ('peer:nego:needed', ({offer, to}) => {
    io.to (to).emit ('peer:nego:needed', {from: socket.id, offer});
  });

  socket.on ('peer:nego:done', ({answer, to}) => {
    io.to (to).emit ('peer:nego:final', {from: socket.id, answer});
  });

  socket.on ('disconnect', () => {
    console.log ('Socket disconnected:', socket.id);
  });
});

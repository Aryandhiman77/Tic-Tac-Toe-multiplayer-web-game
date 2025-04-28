const mongoose = require('mongoose');

const mongoDBUrl = 'mongodb://127.0.0.1:27017/TicTacToe'; 

mongoose.connect(mongoDBUrl)
  .then(() => {
    console.log('MongoDB connected !');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

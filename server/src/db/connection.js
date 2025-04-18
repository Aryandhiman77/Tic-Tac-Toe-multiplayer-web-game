const mongoose = require('mongoose');
const mongoDBUrl = 'mongodb://127.0.0.1/TicTacToe';

mongoose.connect(mongoDBUrl)
.then(() => {
  console.log('MongoDB connected successfully!');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
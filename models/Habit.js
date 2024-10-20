const mongoose = require('mongoose')

const ProgressSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  completed: { type: Boolean, default: false },
})

const HabitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, default: Date.now },
  progress: [ProgressSchema],
})

module.exports = mongoose.model('Habit', HabitSchema)

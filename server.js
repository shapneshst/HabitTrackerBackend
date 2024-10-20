// server.js
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(cors())
// app.use(cors({ origin: 'https://your-frontend-domain.com' }))


// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/habits', require('./routes/habits'))

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err))

// Start Server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

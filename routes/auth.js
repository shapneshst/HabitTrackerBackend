const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Register Route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body

  try {
    // Check if user exists
    let user = await User.findOne({ email })
    if (user) return res.status(400).json({ message: 'User already exists' })

    // Create new user
    user = new User({ username, email, password })

    // Hash password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    await user.save()

    // Create JWT
    const payload = { userId: user.id }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })

    res.status(201).json({ token })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    // Check user
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' })

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid Credentials' })

    // Create JWT
    const payload = { userId: user.id }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })

    res.json({ token })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router

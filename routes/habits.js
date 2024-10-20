const express = require('express')
const router = express.Router()
const Habit = require('../models/Habit')
const auth = require('../middleware/auth')

// Create a new habit
router.post('/', auth, async (req, res) => {
  const { title, description } = req.body

  try {
    const newHabit = new Habit({
      user: req.user.userId,
      title,
      description,
    })

    const habit = await newHabit.save()
    res.status(201).json(habit)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Get all habits for a user
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.userId })
    res.json(habits)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Get a single habit
router.get('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id)
    if (!habit) return res.status(404).json({ message: 'Habit not found' })

    // Ensure user owns the habit
    if (habit.user.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    res.json(habit)
  } catch (err) {
    console.error(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Habit not found' })
    }
    res.status(500).send('Server error')
  }
})

// Update a habit
router.put('/:id', auth, async (req, res) => {
  const { title, description } = req.body

  try {
    let habit = await Habit.findById(req.params.id)
    if (!habit) return res.status(404).json({ message: 'Habit not found' })

    // Ensure user owns the habit
    if (habit.user.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    // Update fields
    if (title) habit.title = title
    if (description) habit.description = description

    habit = await habit.save()
    res.json(habit)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Delete a habit
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id)
    if (!habit) return res.status(404).json({ message: 'Habit not found' })

    // Ensure user owns the habit
    if (habit.user.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    await habit.remove()
    res.json({ message: 'Habit removed' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Get habit progress for a specific month
router.get('/:id/progress', auth, async (req, res) => {
  const { month, year } = req.query

  try {
    const habit = await Habit.findById(req.params.id)
    if (!habit) return res.status(404).json({ message: 'Habit not found' })

    // Ensure user owns the habit
    if (habit.user.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    // Filter progress based on month and year
    const progress = habit.progress.filter((entry) => {
      const entryDate = new Date(entry.date)
      return (
        entryDate.getMonth() + 1 === parseInt(month) &&
        entryDate.getFullYear() === parseInt(year)
      )
    })

    res.json(progress.map((p) => ({ date: p.date, completed: p.completed })))
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Mark a day as completed
router.post('/:id/mark', auth, async (req, res) => {
  const { date } = req.body

  try {
    const habit = await Habit.findById(req.params.id)
    if (!habit) return res.status(404).json({ message: 'Habit not found' })

    // Ensure user owns the habit
    if (habit.user.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    // Check if date already exists
    const existing = habit.progress.find(
      (entry) =>
        new Date(entry.date).toDateString() === new Date(date).toDateString()
    )

    if (existing) {
      existing.completed = true
    } else {
      habit.progress.push({ date: new Date(date), completed: true })
    }

    await habit.save()
    res.json(habit)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// Unmark a day as completed
router.post('/:id/unmark', auth, async (req, res) => {
  const { date } = req.body

  try {
    const habit = await Habit.findById(req.params.id)
    if (!habit) return res.status(404).json({ message: 'Habit not found' })

    // Ensure user owns the habit
    if (habit.user.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    // Remove the progress entry for the date
    habit.progress = habit.progress.filter(
      (entry) =>
        new Date(entry.date).toDateString() !== new Date(date).toDateString()
    )

    await habit.save()
    res.json(habit)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router

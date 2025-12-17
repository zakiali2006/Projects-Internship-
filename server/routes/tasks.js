const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Get tasks for a user by email
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const tasks = await Task.find({ userEmail: email }).sort({ createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { userEmail, text, date } = req.body;
    if (!userEmail || !text) return res.status(400).json({ message: 'Missing fields' });
    const task = new Task({ userEmail, text, date });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

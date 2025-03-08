// routes/categories.js
const express = require('express');
const router = express.Router();

const Issue = require('../models/issueModel');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Issue.distinct('category');
    res.json(categories);
  } catch (err) {
    console.error('Error in GET /categories:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (Admin only)
router.post('/', async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ msg: 'Category is required' });
    }

    // Check if category already exists
    const existingCategory = await Issue.findOne({ category });
    if (existingCategory) {
      return res.status(400).json({ msg: 'Category already exists' });
    }

    // Add category to an issue (for demonstration)
    const newIssue = new Issue({
      title: 'Sample Issue',
      description: 'This is a sample issue for the new category',
      category,
      reportedBy: req.user.id,
    });

    await newIssue.save();

    res.json({ msg: 'Category created successfully', category });
  } catch (err) {
    console.error('Error in POST /categories:', err.message);
    res.status(500).send('Server Error');

  }
});

module.exports = router;
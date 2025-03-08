// routes/categories.js
const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new category (admin only)
router.post('/', [auth, roleCheck(['admin'])], async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    
    // Check if category already exists
    let category = await Category.findOne({ name });
    if (category) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    
    category = new Category({
      name,
      description,
      icon,
      color
    });
    
    await category.save();
    
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update category (admin only)
router.put('/:id', [auth, roleCheck(['admin'])], async (req, res) => {
  try {
    const { name, description, icon, color, isActive } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, color, isActive },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, data: category });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete category (admin only) - soft delete by setting isActive to false
router.delete('/:id', [auth, roleCheck(['admin'])], async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, message: 'Category removed successfully' });
  } catch (err) {
    console.error('Error removing category:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
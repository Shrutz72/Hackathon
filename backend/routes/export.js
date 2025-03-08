// routes/export.js
const express = require('express');
const router = express.Router();
const Issue = require('../models/issueModel');
const { Parser } = require('json2csv');

// @route   GET /api/export/issues
// @desc    Export issues to CSV
// @access  Private
router.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find({}).populate('reportedBy', 'name email');

    const fields = [
      'title',
      'description',
      'category',
      'priority',
      'status',
      'reportedBy.name',
      'reportedBy.email',
      'createdAt',
      'updatedAt',
    ];

    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(issues);

    res.header('Content-Type', 'text/csv');
    res.attachment('issues.csv');
    res.send(csv);
  } catch (err) {
    console.error('Error in GET /export/issues:', err.message);
    res.status(500).send('Server Error');

  }
});

module.exports = router;
// routes/export.js
const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const json2csv = require('json2csv').Parser;

// Export issues as CSV
router.get('/issues/csv', [auth, roleCheck(['admin', 'gov_official'])], async (req, res) => {
  try {
    const { 
      status, 
      category,
      startDate,
      endDate
    } = req.query;
    
    const query = {};
    
    // Apply filters if provided
    if (status) query.status = status;
    if (category) query.category = category;
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .lean();
    
    // Transform data for CSV
    const issuesForExport = issues.map(issue => ({
      ID: issue._id,
      Title: issue.title,
      Description: issue.description,
      Category: issue.category,
      Status: issue.status,
      Address: issue.address,
      Latitude: issue.location.coordinates[1],
      Longitude: issue.location.coordinates[0],
      ReportedBy: issue.reportedBy ? issue.reportedBy.name : 'Unknown',
      ReporterEmail: issue.reportedBy ? issue.reportedBy.email : 'Unknown',
      AssignedTo: issue.assignedTo ? issue.assignedTo.name : 'Unassigned',
      Upvotes: issue.upvotes,
      CreatedAt: issue.createdAt,
      UpdatedAt: issue.updatedAt
    }));
    
    // Generate CSV
    const fields = Object.keys(issuesForExport[0] || {});
    const json2csvParser = new json2csv({ fields });
    const csv = json2csvParser.parse(issuesForExport);
    
    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=issues-export.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);
  } catch (err) {
    console.error('Error exporting issues:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

// MongoDB connection string from environment variables
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/community-issues';

// Create mongoose connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Initialize global variables
let gfs;

// Initialize GridFS stream when the connection is open
conn.once('open', () => {
  // Initialize GridFS stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads',
  });
  console.log('GridFS connection successfully established');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // Generate a random 16 character filename
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }

        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
          metadata: {
            originalName: file.originalname,
            uploadedBy: req.user ? req.user._id : 'anonymous',
            contentType: file.mimetype,
            uploadDate: new Date(),
            issueId: req.body.issueId || null,
            category: req.body.category || 'uncategorized',
            geoLocation: req.body.location || null,
          },
        };

        resolve(fileInfo);
      });
    });
  },
});

// Create the multer upload middleware with the storage configuration
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    // Accept images and PDF only
    const filetypes = /jpeg|jpg|png|gif|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: Only images and PDF files are allowed!'));
  },
});

// Function to retrieve a file by filename
const getFileByFilename = (filename) => {
  return new Promise((resolve, reject) => {
    const files = gfs.find({ filename }).toArray((err, files) => {
      if (err) {
        return reject(err);
      }

      if (!files || files.length === 0) {
        return reject(new Error('File not found'));
      }

      resolve(files[0]);
    });
  });
};

// Function to create a readable stream for a file
const createReadStream = (filename) => {
  return gfs.openDownloadStreamByName(filename);
};

// Function to delete a file by filename
const deleteFile = (filename) => {
  return new Promise((resolve, reject) => {
    gfs.find({ filename }).toArray((err, files) => {
      if (err) {
        return reject(err);
      }

      if (!files || files.length === 0) {
        return reject(new Error('File not found'));
      }

      const fileId = files[0]._id;
      gfs.delete(fileId, (err) => {
        if (err) {
          return reject(err);
        }
        resolve({ message: 'File deleted successfully' });
      });
    });
  });
};

// Function to get all files associated with an issue
const getFilesByIssueId = (issueId) => {
  return new Promise((resolve, reject) => {
    gfs.find({ 'metadata.issueId': issueId }).toArray((err, files) => {
      if (err) {
        return reject(err);
      }

      if (!files || files.length === 0) {
        return resolve([]);
      }

      resolve(files);
    });
  });
};

// Export all functions and variables
module.exports = {
  upload,
  getFileByFilename,
  createReadStream,
  deleteFile,
  getFilesByIssueId,
  connection: conn,
};
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const authMiddleware = require('../middleware/auth');
const upload = require('../utils/upload');

// Sabhi routes protected hain — login zaroori hai
router.use(authMiddleware);

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/', fileController.getFiles);
router.delete('/:id', fileController.deleteFile);
router.patch('/:id/star', fileController.toggleStar);
router.patch('/:id/trash', fileController.trashFile);

module.exports = router;
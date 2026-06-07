const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/tag/:id', aiController.tagFile);
router.post('/summarize/:id', aiController.summarizeFile);
router.post('/search', aiController.smartSearch);

module.exports = router;
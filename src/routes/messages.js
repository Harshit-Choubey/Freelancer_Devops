const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const messageValidator = require('../validators/messageValidator');
const {
  sendMessage,
  getJobMessages,
  getMyConversations,
} = require('../controllers/messageController');

const router = express.Router();

// All message routes require authentication
router.use(authenticate);

router.post('/', validate(messageValidator.sendMessage), sendMessage);
router.get('/conversations', getMyConversations);
router.get('/job/:jobId', getJobMessages);

module.exports = router;
const messageService = require('../services/messageService');
const catchAsync = require('../utils/catchAsync');

const sendMessage = catchAsync(async (req, res) => {
  const { jobId, content } = req.body;
  const message = await messageService.sendMessage(jobId, content, req.user.id);
  
  res.status(201).json({
    success: true,
    message,
  });
});

const getJobMessages = catchAsync(async (req, res) => {
  const messages = await messageService.getJobMessages(req.params.jobId, req.user.id);
  
  res.json({
    success: true,
    messages,
  });
});

const getMyConversations = catchAsync(async (req, res) => {
  const conversations = await messageService.getMyConversations(req.user.id);
  
  res.json({
    success: true,
    conversations,
  });
});

module.exports = {
  sendMessage,
  getJobMessages,
  getMyConversations,
};
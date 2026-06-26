const User = require('../../models/User');
const MentorshipRequest = require('../../models/MentorshipRequest');

// Get peers at a similar level (user.level ± 1)
const getPeers = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const peers = await User.find({
      _id: { $ne: user._id },
      level: { $gte: Math.max(1, user.level - 1), $lte: user.level + 1 }
    }).select('name email level xp streak badges');

    res.json(peers);
  } catch (err) {
    next(err);
  }
};

// Get potential mentors (seniors 2+ levels above user)
const getSeniors = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const mentors = await User.find({
      _id: { $ne: user._id },
      level: { $gte: user.level + 2 }
    }).select('name email level xp streak badges');

    res.json(mentors);
  } catch (err) {
    next(err);
  }
};

// Request mentorship from a senior
const requestMentorship = async (req, res, next) => {
  try {
    const { mentorId, message } = req.body;
    const requesterId = req.user.id;

    if (mentorId === requesterId) {
      return res.status(400).json({ message: 'You cannot request mentorship from yourself' });
    }

    const requester = await User.findById(requesterId);
    const mentor = await User.findById(mentorId);

    if (!requester || !mentor) {
      return res.status(404).json({ message: 'User(s) not found' });
    }

    // Level rule verification: mentor must be 2+ levels above requester
    if (mentor.level < requester.level + 2) {
      return res.status(400).json({ 
        message: 'Mentors must be seniors who are at least 2 levels above you' 
      });
    }

    // Check if request already exists
    const existingRequest = await MentorshipRequest.findOne({
      requester: requesterId,
      mentor: mentorId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A pending mentorship request already exists for this senior' });
    }

    const newRequest = new MentorshipRequest({
      requester: requesterId,
      mentor: mentorId,
      message
    });

    await newRequest.save();
    res.status(201).json({ message: 'Mentorship request sent successfully', request: newRequest });
  } catch (err) {
    next(err);
  }
};

// Get all mentorship requests (both received and sent)
const getRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sentRequests = await MentorshipRequest.find({ requester: userId })
      .populate('mentor', 'name email level xp badges');
    
    const receivedRequests = await MentorshipRequest.find({ mentor: userId })
      .populate('requester', 'name email level xp badges');

    res.json({ sent: sentRequests, received: receivedRequests });
  } catch (err) {
    next(err);
  }
};

// Accept or reject mentorship request
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const requestId = req.params.id;
    const userId = req.user.id;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update value' });
    }

    const request = await MentorshipRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Verify user is the mentor receiving the request
    if (request.mentor.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    request.status = status;
    await request.save();

    res.json({ message: `Mentorship request ${status} successfully`, request });
  } catch (err) {
    next(err);
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const peerId = req.params.peerId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: peerId },
        { sender: peerId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPeers,
  getSeniors,
  requestMentorship,
  getRequests,
  updateRequestStatus,
  getChatHistory
};

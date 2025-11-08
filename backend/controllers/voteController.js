const Category = require('../models/Category');
const Candidate = require('../models/Candidate');
const User = require('../models/User');

// @desc    Get active categories with candidates
// @route   GET /api/vote
// @access  Private
const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    const categoriesWithCandidates = await Promise.all(
      categories.map(async (category) => {
        const candidates = await Candidate.find({ category: category._id });
        const hasVoted = req.user.votedCategories.includes(category._id);
        return {
          ...category.toObject(),
          candidates,
          hasVoted
        };
      })
    );

    res.json(categoriesWithCandidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cast a vote
// @route   POST /api/vote/cast
// @access  Private
const castVote = async (req, res) => {
  try {
    const { candidateId, categoryId } = req.body;
    const userId = req.user._id;

    // Check if category is active
    const category = await Category.findById(categoryId);
    if (!category || !category.isActive) {
      return res.status(400).json({ message: 'Voting is not active for this category' });
    }

    // Check if user has already voted in this category
    const user = await User.findById(userId);
    if (user.votedCategories.includes(categoryId)) {
      return res.status(400).json({ message: 'You have already voted in this category' });
    }

    // Check if candidate exists and belongs to the category
    const candidate = await Candidate.findById(candidateId);
    if (!candidate || candidate.category.toString() !== categoryId) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Update candidate votes
    candidate.votes += 1;
    candidate.voters.push(userId);
    await candidate.save();

    // Update user's voted categories
    user.votedCategories.push(categoryId);
    await user.save();

    // Get updated results for this category
    const candidates = await Candidate.find({ category: categoryId });

    // Emit Socket.IO event for real-time update
    const io = req.app.get('io');
    io.emit('voteUpdate', {
      categoryId,
      candidates
    });

    res.json({ message: 'Vote cast successfully', candidates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get voting results for ALL categories (active and closed)
// @route   GET /api/vote/results
// @access  Public
const getResults = async (req, res) => {
  try {
    // Get ALL categories, not just active ones
    const categories = await Category.find({}).sort({ createdAt: -1 });
    const results = await Promise.all(
      categories.map(async (category) => {
        const candidates = await Candidate.find({ category: category._id })
          .select('name votes')
          .sort({ votes: -1 });
        
        return {
          categoryId: category._id,
          categoryName: category.name,
          isActive: category.isActive,
          createdAt: category.createdAt,
          candidates
        };
      })
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getActiveCategories, castVote, getResults };
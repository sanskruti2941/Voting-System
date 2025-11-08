const express = require('express');
const { getActiveCategories, castVote, getResults } = require('../controllers/voteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getActiveCategories);
router.post('/cast', protect, castVote);
router.get('/results', getResults);

module.exports = router;
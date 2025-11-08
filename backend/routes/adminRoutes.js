const express = require('express');
const { 
  createCategory, 
  addCandidate, 
  toggleVoting, 
  getAllCategories, 
  deleteCategory 
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/create-category', protect, adminOnly, createCategory);
router.post('/add-candidate', protect, adminOnly, addCandidate);
router.patch('/toggle-voting', protect, adminOnly, toggleVoting);
router.get('/categories', protect, adminOnly, getAllCategories);
router.delete('/delete-category/:id', protect, adminOnly, deleteCategory);

module.exports = router;
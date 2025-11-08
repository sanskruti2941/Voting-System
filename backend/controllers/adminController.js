const Category = require('../models/Category');
const Candidate = require('../models/Candidate');

// @desc    Create a new voting category
// @route   POST /api/admin/create-category
// @access  Private/Superadmin
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      description,
      createdBy: req.user._id
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a candidate to a category
// @route   POST /api/admin/add-candidate
// @access  Private/Superadmin
const addCandidate = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const candidate = await Candidate.create({
      name,
      description,
      category: categoryId
    });

    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle voting status for a category
// @route   PATCH /api/admin/toggle-voting
// @access  Private/Superadmin
const toggleVoting = async (req, res) => {
  try {
    const { categoryId, isActive } = req.body;

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.isActive = isActive;
    await category.save();

    res.json({ message: 'Voting status updated', category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all categories with candidates
// @route   GET /api/admin/categories
// @access  Private/Superadmin
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    const categoriesWithCandidates = await Promise.all(
      categories.map(async (category) => {
        const candidates = await Candidate.find({ category: category._id });
        return {
          ...category.toObject(),
          candidates
        };
      })
    );

    res.json(categoriesWithCandidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category (only if voting is closed)
// @route   DELETE /api/admin/delete-category/:id
// @access  Private/Superadmin
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if voting is still active
    if (category.isActive) {
      return res.status(400).json({ 
        message: 'Cannot delete category while voting is active. Please stop voting first.' 
      });
    }

    // Delete all candidates in this category
    await Candidate.deleteMany({ category: id });

    // Delete the category
    await Category.findByIdAndDelete(id);

    res.json({ message: 'Category and all its candidates deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createCategory, 
  addCandidate, 
  toggleVoting, 
  getAllCategories, 
  deleteCategory 
};
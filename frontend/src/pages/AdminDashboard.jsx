import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showCandidateForm, setShowCandidateForm] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  const [candidateForm, setCandidateForm] = useState({
    name: '',
    description: '',
    categoryId: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getAllCategories();
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load categories');
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await adminAPI.createCategory(categoryForm);
      setSuccess('Category created successfully!');
      setCategoryForm({ name: '', description: '' });
      setShowCategoryForm(false);
      fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await adminAPI.addCandidate(candidateForm);
      setSuccess('Candidate added successfully!');
      setCandidateForm({ name: '', description: '', categoryId: '' });
      setShowCandidateForm(false);
      fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add candidate');
    }
  };

  const handleToggleVoting = async (categoryId, currentStatus) => {
    setError('');
    setSuccess('');

    try {
      await adminAPI.toggleVoting({ categoryId, isActive: !currentStatus });
      setSuccess(`Voting ${!currentStatus ? 'started' : 'stopped'} successfully!`);
      fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to toggle voting status');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    setError('');
    setSuccess('');

    try {
      await adminAPI.deleteCategory(categoryId);
      setSuccess('Category deleted successfully!');
      setDeleteConfirm(null);
      fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete category');
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage voting categories and candidates</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setShowCategoryForm(!showCategoryForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition"
          >
            {showCategoryForm ? 'Cancel' : '+ Create Category'}
          </button>
          <button
            onClick={() => setShowCandidateForm(!showCandidateForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition"
          >
            {showCandidateForm ? 'Cancel' : '+ Add Candidate'}
          </button>
        </div>

        {/* Create Category Form */}
        {showCategoryForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Create New Category</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition"
              >
                Create Category
              </button>
            </form>
          </div>
        )}

        {/* Add Candidate Form */}
        {showCandidateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Add New Candidate</h2>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Category
                </label>
                <select
                  required
                  value={candidateForm.categoryId}
                  onChange={(e) => setCandidateForm({ ...candidateForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  required
                  value={candidateForm.name}
                  onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={candidateForm.description}
                  onChange={(e) => setCandidateForm({ ...candidateForm, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition"
              >
                Add Candidate
              </button>
            </form>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this category and all its candidates? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleDeleteCategory(deleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-6">
          {categories.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No categories created yet.</p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                    <div className="mt-2">
                      {category.isActive ? (
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                          🔴 ACTIVE
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                          CLOSED
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleVoting(category._id, category.isActive)}
                      className={`px-6 py-2 rounded-md font-medium transition ${
                        category.isActive
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {category.isActive ? 'Stop Voting' : 'Start Voting'}
                    </button>
                    {!category.isActive && (
                      <button
                        onClick={() => setDeleteConfirm(category._id)}
                        className="px-6 py-2 rounded-md font-medium transition bg-red-500 hover:bg-red-600 text-white"
                        title="Delete category (only available when voting is closed)"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Candidates ({category.candidates?.length || 0})
                  </h4>
                  {!category.candidates || category.candidates.length === 0 ? (
                    <p className="text-gray-500">No candidates added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.candidates.map((candidate) => (
                        <div
                          key={candidate._id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <h5 className="font-semibold text-gray-900">{candidate.name}</h5>
                          {candidate.description && (
                            <p className="text-sm text-gray-600 mt-1">{candidate.description}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            Votes: <span className="font-semibold">{candidate.votes || 0}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
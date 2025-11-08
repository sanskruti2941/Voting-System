import React, { useState, useEffect } from 'react';
import { voteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Vote = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [voting, setVoting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await voteAPI.getActiveCategories();
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load categories');
      setLoading(false);
    }
  };

  const handleVote = async (candidateId, categoryId) => {
    setVoting(true);
    setError('');
    setSuccess('');

    try {
      const response = await voteAPI.castVote({ candidateId, categoryId });
      setSuccess(response.data.message);
      
      // Refresh categories to update hasVoted status
      await fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cast Your Vote</h1>
          <p className="mt-2 text-gray-600">Select your preferred candidate in each active category</p>
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

        {categories.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No active voting categories at the moment.</p>
            <p className="text-gray-500 mt-2">Please check back later.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-600 text-white px-6 py-4">
                  <h2 className="text-2xl font-bold">{category.name}</h2>
                  <p className="text-blue-100 mt-1">{category.description}</p>
                  {category.hasVoted && (
                    <span className="inline-block mt-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ✓ You have voted in this category
                    </span>
                  )}
                </div>

                <div className="p-6">
                  {category.candidates.length === 0 ? (
                    <p className="text-gray-500">No candidates available in this category.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.candidates.map((candidate) => (
                        <div
                          key={candidate._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {candidate.name}
                          </h3>
                          {candidate.description && (
                            <p className="text-gray-600 text-sm mb-4">{candidate.description}</p>
                          )}
                          <button
                            onClick={() => handleVote(candidate._id, category._id)}
                            disabled={category.hasVoted || voting}
                            className={`w-full py-2 px-4 rounded-md font-medium transition ${
                              category.hasVoted
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {category.hasVoted ? 'Already Voted' : voting ? 'Voting...' : 'Vote'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vote;
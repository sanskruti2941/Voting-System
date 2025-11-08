import React, { useState, useEffect } from 'react';
import { voteAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { io } from 'socket.io-client';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();

    // Connect to Socket.IO for real-time updates
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('voteUpdate', (data) => {
      console.log('Vote update received:', data);
      fetchResults();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchResults = async () => {
    try {
      const response = await voteAPI.getResults();
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load results');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Loading results...</div>
      </div>
    );
  }

  // Separate active and closed categories
  const activeResults = results.filter(cat => cat.isActive);
  const closedResults = results.filter(cat => !cat.isActive);

  const renderCategory = (category) => {
    const totalVotes = category.candidates.reduce((sum, c) => sum + c.votes, 0);
    
    return (
      <div key={category.categoryId} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className={`${category.isActive ? 'bg-blue-600' : 'bg-gray-600'} text-white px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{category.categoryName}</h2>
              <p className="text-blue-100 mt-1">Total Votes: {totalVotes}</p>
            </div>
            <div>
              {category.isActive ? (
                <span className="bg-green-500 px-4 py-2 rounded-full text-sm font-semibold">
                  🔴 LIVE
                </span>
              ) : (
                <span className="bg-gray-400 px-4 py-2 rounded-full text-sm font-semibold">
                  CLOSED
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {category.candidates.length === 0 ? (
            <p className="text-gray-500">No candidates in this category yet.</p>
          ) : (
            <>
              {/* Bar Chart */}
              <div className="mb-8">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={category.candidates}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="votes" fill="#3B82F6" name="Votes">
                      {category.candidates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table View */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Votes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {category.candidates.map((candidate, index) => (
                      <tr key={candidate._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {candidate.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {candidate.votes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium">
                              {totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Voting Results</h1>
          <p className="mt-2 text-gray-600">View live and historical voting results</p>
          {activeResults.length > 0 && (
            <div className="mt-2 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm text-gray-600">Live Updates Active</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {results.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No voting results available yet.</p>
            <p className="text-gray-500 mt-2">Results will appear once voting begins.</p>
          </div>
        ) : (
          <>
            {/* Active Voting Categories */}
            {activeResults.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></span>
                  Live Voting
                </h2>
                <div className="space-y-8">
                  {activeResults.map(renderCategory)}
                </div>
              </div>
            )}

            {/* Closed Voting Categories */}
            {closedResults.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Previous Results</h2>
                <div className="space-y-8">
                  {closedResults.map(renderCategory)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Results;
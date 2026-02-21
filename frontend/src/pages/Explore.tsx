import React, { useState } from 'react';
import { Search, TrendingUp, Hash, Users, Leaf, Recycle, Globe } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useLocation } from 'react-router-dom';

const Explore: React.FC = () => {
  const location = useLocation();
  const initialQuery = new URLSearchParams(location.search).get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const trendingTopics = [
    { tag: 'zerowaste', posts: 1234, icon: <Recycle className="w-4 h-4" /> },
    { tag: 'sustainableliving', posts: 987, icon: <Leaf className="w-4 h-4" /> },
    { tag: 'ecofriendly', posts: 756, icon: <Globe className="w-4 h-4" /> },
    { tag: 'plantbased', posts: 543, icon: <Leaf className="w-4 h-4" /> },
    { tag: 'renewableenergy', posts: 432, icon: <TrendingUp className="w-4 h-4" /> },
    { tag: 'climateaction', posts: 321, icon: <Globe className="w-4 h-4" /> },
  ];

  const ecoCategories = [
    { name: 'Zero Waste', color: 'bg-green-100 text-green-800', count: 234 },
    { name: 'Renewable Energy', color: 'bg-blue-100 text-blue-800', count: 189 },
    { name: 'Sustainable Fashion', color: 'bg-purple-100 text-purple-800', count: 156 },
    { name: 'Plant Care', color: 'bg-emerald-100 text-emerald-800', count: 298 },
    { name: 'Upcycling', color: 'bg-orange-100 text-orange-800', count: 167 },
    { name: 'Green Technology', color: 'bg-teal-100 text-teal-800', count: 134 },
  ];

  const featuredUsers = [
    { username: 'eco_warrior', followers: '12.5K', avatar: '🌱' },
    { username: 'zero_waste_life', followers: '8.9K', avatar: '♻️' },
    { username: 'plant_parent', followers: '15.2K', avatar: '🌿' },
    { username: 'solar_powered', followers: '6.7K', avatar: '☀️' },
  ];

  return (
    <Layout showParticles={false}>
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <Search className="w-8 h-8 text-green-600" />
            Explore Green Content
          </h1>
          <p className="text-gray-600 text-lg">
            Discover eco-friendly content, sustainable practices, and connect with the green community
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for eco-friendly content, users, or hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trending Topics */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Trending Topics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-green-600">{topic.icon}</div>
                      <div>
                        <p className="font-semibold text-gray-800">#{topic.tag}</p>
                        <p className="text-sm text-gray-600">{topic.posts.toLocaleString()} posts</p>
                      </div>
                    </div>
                    <Hash className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Eco Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Leaf className="w-6 h-6 text-green-600" />
                Eco Categories
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ecoCategories.map((category, index) => (
                  <div
                    key={index}
                    className={`${category.color} px-4 py-3 rounded-lg text-center cursor-pointer hover:opacity-80 transition-opacity`}
                  >
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-sm opacity-75">{category.count} posts</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Eco Warriors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Featured Eco Warriors
              </h3>
              <div className="space-y-4">
                {featuredUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">@{user.username}</p>
                        <p className="text-sm text-gray-600">{user.followers} followers</p>
                      </div>
                    </div>
                    <button className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Posts</span>
                  <span className="font-semibold text-green-600">12,456</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-semibold text-green-600">3,789</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trees Planted</span>
                  <span className="font-semibold text-green-600">45,123</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">CO₂ Saved</span>
                  <span className="font-semibold text-green-600">2.3 tons</span>
                </div>
              </div>
            </div>

            {/* Eco Tip of the Day */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-xl font-bold mb-3">🌱 Eco Tip of the Day</h3>
              <p className="text-green-50">
                Switch to LED bulbs to reduce energy consumption by up to 80% and last 25 times longer than traditional bulbs!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default Explore;
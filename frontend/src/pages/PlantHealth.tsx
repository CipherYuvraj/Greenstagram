import React from 'react';
import PlantDetector from '../components/plants/PlantDetector';
import { Leaf, Info } from 'lucide-react';

const PlantHealth: React.FC = () => {
  const handleDetectionComplete = (result: any) => {
    console.log('Plant detection completed:', result);
    // You can add additional logic here, like saving to posts, etc.
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="w-12 h-12 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Plant Health Monitor
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload a photo of your plant and get instant identification and health analysis
            powered by PlantNet AI
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Tips for best results:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                <li>Take photos in good natural lighting</li>
                <li>Include distinctive features like leaves, flowers, or bark</li>
                <li>Avoid blurry or distant shots</li>
                <li>One plant per photo works best</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Plant Detector Component */}
        <PlantDetector onDetectionComplete={handleDetectionComplete} />

        {/* Features Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI-Powered Identification
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Advanced machine learning identifies plants from millions of species in our database
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Health Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Get detailed health scores and insights about your plant's condition
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Care Recommendations
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Receive personalized care tips to keep your plants thriving
            </p>
          </div>
        </div>

        {/* Community Section */}
        <div className="mt-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Join the Greenstagram Community
          </h2>
          <p className="text-green-50 mb-6 max-w-2xl mx-auto">
            Share your plant journey, get tips from fellow plant enthusiasts, and track your
            collection's growth over time
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
              Share Your Plant
            </button>
            <button className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors border border-green-400">
              Browse Community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantHealth;

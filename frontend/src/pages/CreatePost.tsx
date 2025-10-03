import React, { useState, useRef } from 'react';
import { Camera, Image, MapPin, Hash, Leaf, Upload, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const CreatePost: React.FC = () => {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ecoTags = [
    'zerowaste', 'sustainableliving', 'ecofriendly', 'plantbased',
    'renewableenergy', 'climateaction', 'upcycling', 'composting',
    'solarpowered', 'organicgardening', 'minimalism', 'greentechnology',
    'carbonfootprint', 'biodegradable', 'recycling', 'conservation'
  ];

  const impactCategories = [
    { name: 'Energy Saved', icon: '⚡', unit: 'kWh' },
    { name: 'Water Conserved', icon: '💧', unit: 'liters' },
    { name: 'Waste Reduced', icon: '♻️', unit: 'kg' },
    { name: 'Trees Planted', icon: '🌳', unit: 'trees' },
    { name: 'CO₂ Reduced', icon: '🌍', unit: 'kg CO₂' },
  ];

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedImages(newImages);
    setPreviewUrls(newPreviewUrls);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 10) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      toast.error('Maximum 10 tags allowed');
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim()) && selectedTags.length < 10) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!caption.trim()) {
      toast.error('Please add a caption');
      return;
    }

    if (selectedImages.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Post created successfully! 🌱');
      
      // Reset form
      setCaption('');
      setLocation('');
      setSelectedTags([]);
      setSelectedImages([]);
      setPreviewUrls([]);
      
      // Revoke all preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
    } catch (error) {
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <Camera className="w-8 h-8 text-green-600" />
            Share Your Green Journey
          </h1>
          <p className="text-gray-600 text-lg">
            Inspire others with your eco-friendly activities and sustainable lifestyle
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Upload */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-green-600" />
                  Upload Images
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {selectedImages.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors"
                    >
                      <Upload className="w-6 h-6 mb-2" />
                      <span className="text-sm">Add Image</span>
                    </button>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                <p className="text-sm text-gray-500">
                  Upload up to 5 images. Supported formats: JPG, PNG, WebP
                </p>
              </div>

              {/* Caption */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Caption</h2>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share your eco-friendly story... What sustainable practice are you showcasing? How does it help the environment?"
                  rows={6}
                  className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                  maxLength={2000}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Share your impact and inspire others to go green!
                  </p>
                  <span className="text-sm text-gray-400">
                    {caption.length}/2000
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Location (Optional)
                </h2>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where was this eco-friendly activity done?"
                  className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Eco Tags */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-green-600" />
                  Eco Tags
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {ecoTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Custom tag"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {selectedTags.length}/10 tags
                </p>
              </div>

              {/* Environmental Impact */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Environmental Impact
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Track the positive impact of your eco-friendly activity:
                </p>
                
                <div className="space-y-3">
                  {impactCategories.map((category, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <div className="flex-1">
                        <label className="text-sm text-gray-700">{category.name}</label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="number"
                            placeholder="0"
                            className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-transparent outline-none"
                            min="0"
                            step="0.1"
                          />
                          <span className="text-xs text-gray-500 self-center">{category.unit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Post...
                  </>
                ) : (
                  <>
                    <Leaf className="w-5 h-5" />
                    Share Green Post
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
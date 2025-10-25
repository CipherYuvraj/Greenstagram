import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader, Leaf, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';

interface PlantDetectionResult {
  species: string;
  confidence: number;
  healthScore?: number;
  tips?: string[];
  condition?: 'healthy' | 'warning' | 'unhealthy';
  commonNames?: string[];
}

interface PlantDetectorProps {
  onDetectionComplete?: (result: PlantDetectionResult) => void;
  className?: string;
}

const PlantDetector: React.FC<PlantDetectorProps> = ({ 
  onDetectionComplete,
  className = '' 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<PlantDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setDetectionResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const detectPlantCondition = async () => {
    if (!imageFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsDetecting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      // Call the plant identification API
      const result = await apiService.identifyPlant(formData);
      
      setDetectionResult(result);
      toast.success('Plant detected successfully!');
      
      if (onDetectionComplete) {
        onDetectionComplete(result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to detect plant';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDetecting(false);
    }
  };

  const resetDetector = () => {
    setSelectedImage(null);
    setImageFile(null);
    setDetectionResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getHealthColor = (healthScore?: number) => {
    if (!healthScore) return 'text-gray-500';
    if (healthScore >= 80) return 'text-green-500';
    if (healthScore >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthIcon = (healthScore?: number) => {
    if (!healthScore) return <Leaf className="w-5 h-5" />;
    if (healthScore >= 80) return <CheckCircle className="w-5 h-5" />;
    if (healthScore >= 60) return <AlertCircle className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Plant Condition Detector
          </h2>
        </div>
        {selectedImage && (
          <button
            onClick={resetDetector}
            className="p-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            aria-label="Reset detector"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Image Upload Area */}
      {!selectedImage ? (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="plant-image-input"
          />
          
          <label
            htmlFor="plant-image-input"
            className="flex flex-col items-center justify-center w-full h-64 transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 mb-4 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, JPEG (MAX. 10MB)
              </p>
            </div>
          </label>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            <Camera className="w-5 h-5" />
            Choose Plant Photo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={selectedImage}
              alt="Selected plant"
              className="object-contain w-full h-auto bg-gray-100 max-h-96 dark:bg-gray-700"
            />
          </div>

          {/* Detection Button */}
          {!detectionResult && (
            <button
              onClick={detectPlantCondition}
              disabled={isDetecting}
              className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isDetecting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Analyzing Plant...
                </>
              ) : (
                <>
                  <Leaf className="w-5 h-5" />
                  Detect Plant Condition
                </>
              )}
            </button>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Detection Failed
                  </h3>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detection Results */}
          {detectionResult && (
            <div className="p-6 space-y-4 border border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 dark:border-green-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Detection Results
                  </h3>
                  
                  {/* Species */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Species:
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {detectionResult.species}
                      </span>
                    </div>

                    {/* Common Names */}
                    {detectionResult.commonNames && detectionResult.commonNames.length > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Common names: {detectionResult.commonNames.join(', ')}
                      </div>
                    )}

                    {/* Confidence */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confidence:
                      </span>
                      <div className="flex-1 max-w-xs">
                        <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-600">
                          <div
                            className="h-2 transition-all duration-500 bg-green-600 rounded-full"
                            style={{ width: `${detectionResult.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {(detectionResult.confidence * 100).toFixed(1)}%
                      </span>
                    </div>

                    {/* Health Score */}
                    {detectionResult.healthScore !== undefined && (
                      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-green-200 dark:border-green-800">
                        <div className={getHealthColor(detectionResult.healthScore)}>
                          {getHealthIcon(detectionResult.healthScore)}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Health Score:
                        </span>
                        <span className={`text-sm font-bold ${getHealthColor(detectionResult.healthScore)}`}>
                          {detectionResult.healthScore}/100
                        </span>
                        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
                          detectionResult.healthScore >= 80
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : detectionResult.healthScore >= 60
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {detectionResult.healthScore >= 80
                            ? 'Healthy'
                            : detectionResult.healthScore >= 60
                            ? 'Needs Attention'
                            : 'Unhealthy'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Care Tips */}
              {detectionResult.tips && detectionResult.tips.length > 0 && (
                <div className="pt-4 mt-4 border-t border-green-200 dark:border-green-800">
                  <h4 className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <Leaf className="w-4 h-4 text-green-600" />
                    Care Tips
                  </h4>
                  <ul className="space-y-2">
                    {detectionResult.tips.map((tip, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="mt-1 text-green-600">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={resetDetector}
                  className="flex-1 px-4 py-2 font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Analyze Another Plant
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Footer */}
      <div className="p-4 mt-6 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Powered by PlantNet API</strong> - Upload a clear photo of the plant for best results. 
          Make sure the image is well-lit and shows distinctive features like leaves, flowers, or bark.
        </p>
      </div>
    </div>
  );
};

export default PlantDetector;

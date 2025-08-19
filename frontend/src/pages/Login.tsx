import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Leaf, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import AnimatedButton from '../components/ui/AnimatedButton';
import ParticleBackground from '../components/ui/ParticleBackground';
import FloatingElements from '../components/ui/FloatingElements';

const schema = yup.object({
  emailOrUsername: yup.string().required('Email or username is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
});

type LoginFormData = yup.InferType<typeof schema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.emailOrUsername, data.password);
      toast.success('Welcome back to Greenstagram! 🌱');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Background Effects */}
      <ParticleBackground 
        particleCount={100} 
        theme="nature" 
        interactive={true}
      />
      <FloatingElements count={30} theme="nature" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Logo and Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mb-4 relative"
            >
              <Leaf className="w-8 h-8 text-white" />
              
              {/* Particle trail around logo */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary-400 rounded-full"
                  animate={{
                    x: [0, Math.cos(i * Math.PI / 4) * 30],
                    y: [0, Math.sin(i * Math.PI / 4) * 30],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-emerald-600 bg-clip-text text-transparent">
              Greenstagram
            </h1>
            <p className="text-gray-600 mt-2">Welcome back to your eco-journey</p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-8 relative overflow-hidden"
          >
            {/* Form glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-secondary-500/5 rounded-2xl" />
            
            <div className="relative z-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email/Username Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register('emailOrUsername')}
                      type="text"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                        errors.emailOrUsername ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email or username"
                    />
                  </div>
                  <AnimatePresence>
                    {errors.emailOrUsername && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.emailOrUsername.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Remember & Forgot */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <AnimatedButton
                    type="submit"
                    variant="eco"
                    size="lg"
                    className="w-full"
                    loading={isLoading}
                    icon={ArrowRight}
                    particleEffect={true}
                    glowEffect={true}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </AnimatedButton>
                </motion.div>
              </form>

              {/* Sign Up Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-6 text-center"
              >
                <span className="text-gray-600">Don't have an account? </span>
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  Join the eco-community
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8 grid grid-cols-3 gap-4 text-center"
          >
            {[
              { icon: '🌱', label: 'Eco Posts' },
              { icon: '🏆', label: 'Challenges' },
              { icon: '🌍', label: 'Community' }
            ].map((feature) => (
              <motion.div
                key={feature.label}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/50"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <div className="text-sm text-gray-600">{feature.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

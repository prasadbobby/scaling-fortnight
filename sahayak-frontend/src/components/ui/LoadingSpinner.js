// src/components/ui/LoadingSpinner.js
'use client';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Brain, PenTool } from 'lucide-react';

export default function LoadingSpinner() {
  const features = [
    { icon: PenTool, text: 'Content Generation' },
    { icon: Brain, text: 'AI Assistance' },
    { icon: BookOpen, text: 'Lesson Planning' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Logo Animation */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <div className="w-32 h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
            <BookOpen className="text-white" size={56} />
          </div>
          <motion.div
            className="absolute -top-4 -right-4"
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="text-yellow-800" size={24} />
            </div>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1 
          className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Sahayak AI
        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-600 mb-8 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Empowering Teachers with AI
        </motion.p>

        {/* Feature Pills */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2 + index * 0.1, type: "spring" }}
            >
              <feature.icon size={16} className="text-blue-500" />
              <span className="text-sm font-medium text-gray-700">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Loading Animation */}
        <motion.div 
          className="flex items-center justify-center space-x-3 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.3, 1]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </motion.div>

        <motion.p
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          Initializing your AI teaching assistant...
        </motion.p>
      </div>
    </div>
  );
}
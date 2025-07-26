'use client';
import { Menu, X, BookOpen, Bell, User, Search, Settings, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar({ onMenuToggle, sidebarOpen }) {
  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 px-4 lg:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 lg:hidden transform hover:scale-105"
          >
            <motion.div
              animate={{ rotate: sidebarOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.div>
          </button>
          
          {/* Logo - Only show on desktop when sidebar is hidden */}
          <motion.div 
            className="lg:hidden flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sahayak AI
              </h1>
            </div>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search content, lessons, tools..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* AI Assistant Button */}
          <motion.button 
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles size={16} />
            <span className="text-sm">AI Assistant</span>
          </motion.button>

          {/* Notifications */}
          <motion.button 
            className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
          </motion.button>

          {/* Settings */}
          <motion.button 
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 hidden sm:block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings size={20} className="text-gray-600" />
          </motion.button>
          
          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-md"
              whileHover={{ scale: 1.05 }}
            >
              <User size={18} className="text-white" />
            </motion.div>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-gray-700">Priya Sharma</p>
              <p className="text-xs text-gray-500">Mathematics Teacher</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
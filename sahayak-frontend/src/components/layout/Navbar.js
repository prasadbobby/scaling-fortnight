// src/components/layout/Navbar.js
'use client';
import { useState } from 'react';
import { Menu, X, BookOpen, Bell, User, Search, Settings, Sparkles, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar({ onMenuToggle, sidebarOpen }) {
  const { currentUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const result = await logout();
      if (!result.success) {
        console.error('Logout failed:', result.error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
      setShowUserMenu(false);
    }
  };

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
          
          {/* Logo - Always visible */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={window.innerWidth >= 1024 ? 28 : 24} />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sahayak AI
              </h1>
              <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">Teaching Assistant</p>
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
          
          {/* User Profile Dropdown */}
          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-xl transition-all duration-200 p-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-md overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                >
                  {currentUser?.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'User'} 
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <User size={18} className="text-white" style={{ display: currentUser?.photoURL ? 'none' : 'block' }} />
                </motion.div>
                
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-700 truncate max-w-32">
                    {currentUser?.displayName || 'Teacher'}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-32">
                    {currentUser?.email || 'teacher@school.edu'}
                  </p>
                </div>
                
                <motion.div
                  animate={{ rotate: showUserMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden lg:block"
                >
                  <ChevronDown size={16} className="text-gray-400" />
                </motion.div>
              </div>
            </motion.button>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50"
                >
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center overflow-hidden">
                        {currentUser?.photoURL ? (
                          <img 
                            src={currentUser.photoURL} 
                            alt={currentUser.displayName || 'User'} 
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <User size={20} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {currentUser?.displayName || 'Teacher'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {currentUser?.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <motion.button 
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                      whileHover={{ x: 4 }}
                    >
                      <User size={18} className="text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">Profile Settings</p>
                        <p className="text-xs text-gray-500">Manage your account</p>
                      </div>
                    </motion.button>

                    <motion.button 
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                      whileHover={{ x: 4 }}
                    >
                      <Settings size={18} className="text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">Preferences</p>
                        <p className="text-xs text-gray-500">Language, notifications</p>
                      </div>
                    </motion.button>

                    <motion.button 
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                      whileHover={{ x: 4 }}
                    >
                      <BookOpen size={18} className="text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">My Content</p>
                        <p className="text-xs text-gray-500">View created materials</p>
                      </div>
                    </motion.button>

                    <div className="border-t border-gray-100 my-2"></div>

                    {/* Logout Button */}
                    <motion.button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ x: 4 }}
                    >
                      {loggingOut ? (
                        <>
                          <div className="w-[18px] h-[18px] border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                          <div>
                            <p className="font-medium text-red-600">Signing out...</p>
                            <p className="text-xs text-red-500">Please wait</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <LogOut size={18} className="text-red-600" />
                          <div>
                            <p className="font-medium text-red-600">Sign Out</p>
                            <p className="text-xs text-red-500">See you again soon!</p>
                          </div>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <motion.div 
        className="md:hidden mt-4"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Click outside to close dropdown */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}
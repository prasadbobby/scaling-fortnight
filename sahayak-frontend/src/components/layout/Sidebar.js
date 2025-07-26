'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ navigationItems, activeTab, onTabChange, isOpen, onClose }) {
  const getColorClasses = (color, isActive) => {
    const colorMap = {
      blue: isActive ? 'from-blue-500 to-blue-600' : 'hover:bg-blue-50 hover:text-blue-600',
      purple: isActive ? 'from-purple-500 to-purple-600' : 'hover:bg-purple-50 hover:text-purple-600',
      green: isActive ? 'from-green-500 to-green-600' : 'hover:bg-green-50 hover:text-green-600',
      orange: isActive ? 'from-orange-500 to-orange-600' : 'hover:bg-orange-50 hover:text-orange-600',
      red: isActive ? 'from-red-500 to-red-600' : 'hover:bg-red-50 hover:text-red-600',
      indigo: isActive ? 'from-indigo-500 to-indigo-600' : 'hover:bg-indigo-50 hover:text-indigo-600',
      cyan: isActive ? 'from-cyan-500 to-cyan-600' : 'hover:bg-cyan-50 hover:text-cyan-600',
      pink: isActive ? 'from-pink-500 to-pink-600' : 'hover:bg-pink-50 hover:text-pink-600',
      emerald: isActive ? 'from-emerald-500 to-emerald-600' : 'hover:bg-emerald-50 hover:text-emerald-600',
    };
    return colorMap[color] || (isActive ? 'from-gray-500 to-gray-600' : 'hover:bg-gray-50 hover:text-gray-600');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.div 
        className={`
          fixed left-0 top-0 h-screen w-80 bg-white shadow-2xl transform transition-all duration-300 z-50 border-r border-gray-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:transform-none
        `}
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Sahayak AI</h2>
              <p className="text-xs text-gray-500">Teaching Assistant</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-240px)] custom-scrollbar">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-300 group
                  ${isActive 
                    ? `bg-gradient-to-r ${getColorClasses(item.color, true)} text-white shadow-lg transform scale-[1.02]` 
                    : `text-gray-700 ${getColorClasses(item.color, false)} transform hover:scale-[1.02]`
                  }
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.3 }}
                whileHover={{ x: isActive ? 0 : 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`p-2.5 rounded-xl ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-white group-hover:shadow-md'} transition-all`}>
                  <Icon size={20} className={`transition-colors ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-700'}`} />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div 
                    className="w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
          <motion.div 
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-semibold text-gray-800 text-sm mb-1">Need Help?</h3>
            <p className="text-xs text-gray-600 mb-3">Get AI-powered assistance</p>
            <motion.button 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs py-2.5 px-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Ask Sahayak AI
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
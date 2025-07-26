'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/Dashboard';
import ContentGenerator from '@/components/ContentGenerator';
import LessonPlanner from '@/components/LessonPlanner';
import MaterialDifferentiator from '@/components/MaterialDifferentiator';
import SpeechAssessment from '@/components/SpeechAssessment';
import VisualGenerator from '@/components/VisualGenerator';
import Analytics from '@/components/Analytics';
import ContentLibrary from '@/components/ContentLibrary';
import KnowledgeBase from '@/components/KnowledgeBase';
import { 
  BookOpen, PenTool, Layers, Mic, Image, BarChart3, 
  FolderOpen, Brain, Home as HomeIcon, Sparkles 
} from 'lucide-react';

export default function ClientWrapper() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const teacherId = 'teacher_001';

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, color: 'blue' },
    { id: 'content', label: 'Content Generator', icon: PenTool, color: 'purple' },
    { id: 'lessons', label: 'Lesson Planner', icon: BookOpen, color: 'green' },
    { id: 'materials', label: 'Material Differentiator', icon: Layers, color: 'orange' },
    { id: 'speech', label: 'Speech Assessment', icon: Mic, color: 'red' },
    { id: 'visuals', label: 'Visual Generator', icon: Image, color: 'indigo' },
    { id: 'knowledge', label: 'Knowledge Base', icon: Brain, color: 'cyan' },
    { id: 'library', label: 'Content Library', icon: FolderOpen, color: 'pink' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'emerald' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const renderActiveComponent = () => {
    const props = { teacherId };
    const components = {
      dashboard: Dashboard,
      content: ContentGenerator,
      lessons: LessonPlanner,
      materials: MaterialDifferentiator,
      speech: SpeechAssessment,
      visuals: VisualGenerator,
      knowledge: KnowledgeBase,
      library: ContentLibrary,
      analytics: Analytics
    };

    const Component = components[activeTab] || Dashboard;
    return <Component {...props} />;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <BookOpen className="text-white" size={56} />
            </div>
            <motion.div
              className="absolute -top-4 -right-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="text-yellow-800" size={20} />
              </div>
            </motion.div>
          </motion.div>

          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Sahayak AI
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 mb-12 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Empowering Teachers with AI
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      
      <div className="flex">
        <Sidebar
          navigationItems={navigationItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 lg:ml-80 transition-all duration-300 min-h-screen">
          <div className="p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderActiveComponent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Floating AI Assistant Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
      >
        <motion.button 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <Sparkles size={28} />
        </motion.button>
      </motion.div>
    </div>
  );
}
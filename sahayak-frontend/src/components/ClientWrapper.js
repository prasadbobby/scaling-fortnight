// src/components/ClientWrapper.js
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
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  BookOpen, PenTool, Layers, Mic, Image, BarChart3, 
  FolderOpen, Brain, Home as HomeIcon, Sparkles 
} from 'lucide-react';

export default function ClientWrapper() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    // Simulate app initialization
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Check if API is available
        try {
          const response = await fetch('http://localhost:8080/health');
          if (!response.ok) {
            throw new Error('Backend not available');
          }
        } catch (apiError) {
          console.log('Backend not available, running in offline mode');
        }
        
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setLoading(false);
      } catch (error) {
        console.error('Initialization error:', error);
        setLoading(false);
      }
    };

    initializeApp();
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <motion.div 
          className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      
      <div className="relative flex">
        <Sidebar
          navigationItems={navigationItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        {/* Main Content - Removed the margin left issue */}
        <main className="flex-1 w-full min-h-screen">
          <div className="w-full px-4 py-6 lg:px-8 lg:py-8">
            <div className="max-w-full mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  {renderActiveComponent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Help Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <motion.button 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          title="Need Help?"
        >
          <Sparkles size={24} />
        </motion.button>
      </motion.div>
    </div>
  );
}
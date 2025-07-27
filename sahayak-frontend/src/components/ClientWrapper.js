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
import GoogleADKWorkflow from '@/components/GoogleADKWorkflow'; // Updated import
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import QuizBuilder from '@/components/QuizBuilder';
import { 
  BookOpen, PenTool, Layers, Mic, Image, BarChart3, 
  FolderOpen, Brain, Home as HomeIcon, Sparkles, Workflow 
} from 'lucide-react';

export default function ClientWrapper() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const teacherId = 'teacher_001';

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, color: 'blue' },
    { id: 'agentic', label: 'Google ADK Agents', icon: Workflow, color: 'purple' }, // Updated label
    { id: 'content', label: 'Content Generator', icon: PenTool, color: 'green' },
    { id: 'lessons', label: 'Lesson Planner', icon: BookOpen, color: 'orange' },
    { id: 'materials', label: 'Material Differentiator', icon: Layers, color: 'red' },
    { id: 'quizbuilder', label: 'Quiz Builder', icon: Brain, color: 'purple' },
    { id: 'speech', label: 'Speech Assessment', icon: Mic, color: 'indigo' },
    { id: 'visuals', label: 'Visual Generator', icon: Image, color: 'cyan' },
    { id: 'knowledge', label: 'Knowledge Base', icon: Brain, color: 'pink' },
    { id: 'library', label: 'Content Library', icon: FolderOpen, color: 'emerald' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'orange' }
  ];

  useEffect(() => {
    // Simple initialization
    const initializeApp = async () => {
      setLoading(true);
      
      // Simulate loading time for smooth UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLoading(false);
    };

    initializeApp();
  }, []);

  const renderActiveComponent = () => {
    const props = { teacherId };
    const components = {
      dashboard: Dashboard,
      agentic: GoogleADKWorkflow, // Updated component reference
      content: ContentGenerator,
      lessons: LessonPlanner,
      quizbuilder: QuizBuilder,
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

  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}
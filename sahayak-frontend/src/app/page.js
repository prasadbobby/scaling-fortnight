'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import ContentGenerator from '@/components/ContentGenerator';
import LessonPlanner from '@/components/LessonPlanner';
import MaterialDifferentiator from '@/components/MaterialDifferentiator';
import SpeechAssessment from '@/components/SpeechAssessment';
import VisualGenerator from '@/components/VisualGenerator';
import Analytics from '@/components/Analytics';
import ContentLibrary from '@/components/ContentLibrary';
import { BookOpen, PenTool, Layers, Mic, Image, BarChart3, FolderOpen } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const teacherId = 'teacher_001';

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'content', label: 'Content Generator', icon: PenTool },
    { id: 'lessons', label: 'Lesson Planner', icon: BookOpen },
    { id: 'materials', label: 'Material Differentiator', icon: Layers },
    { id: 'speech', label: 'Speech Assessment', icon: Mic },
    { id: 'visuals', label: 'Visual Generator', icon: Image },
    { id: 'library', label: 'Content Library', icon: FolderOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const renderActiveComponent = () => {
    const props = { teacherId };
    switch (activeTab) {
      case 'dashboard': return <Dashboard {...props} />;
      case 'content': return <ContentGenerator {...props} />;
      case 'lessons': return <LessonPlanner {...props} />;
      case 'materials': return <MaterialDifferentiator {...props} />;
      case 'speech': return <SpeechAssessment {...props} />;
      case 'visuals': return <VisualGenerator {...props} />;
      case 'library': return <ContentLibrary {...props} />;
      case 'analytics': return <Analytics {...props} />;
      default: return <Dashboard {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        
        <main className="flex-1 lg:ml-72 transition-all duration-300">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="animate-in slide-in-from-right-4 duration-300">
              {renderActiveComponent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
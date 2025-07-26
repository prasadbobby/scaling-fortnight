'use client';
import { Menu, X, BookOpen, Bell, User } from 'lucide-react';

export default function Navbar({ onMenuToggle, sidebarOpen }) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sahayak AI
              </h1>
              <p className="text-xs text-gray-500">Teaching Assistant</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-700">Teacher</p>
              <p className="text-xs text-gray-500">educator@school.edu</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
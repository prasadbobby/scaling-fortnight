// src/components/Dashboard.js - Update the main container
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, TrendingUp, Clock, Award, Target, 
  Plus, ArrowRight, Sparkles, Calendar, Brain, PenTool,
  ChevronRight, Star, Zap, Layers, Mic, Image,
} from 'lucide-react';

export default function Dashboard({ teacherId }) {
  const [stats, setStats] = useState({
    totalContent: 12,
    studentsAssessed: 45,
    weeklyGrowth: 15,
    hoursUsed: 24
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // Mock recent activity
  useEffect(() => {
    setRecentActivity([
      {
        id: 1,
        type: 'story',
        title: 'The Water Cycle Adventure',
        subject: 'Science',
        grade: 5,
        created_at: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: 2,
        type: 'lesson_plan',
        title: 'Mathematics Week 1',
        subject: 'Mathematics',
        grade: 6,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed'
      },
      {
        id: 3,
        type: 'assessment',
        title: 'Reading Fluency Test',
        subject: 'Hindi',
        grade: 4,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        status: 'completed'
      }
    ]);
  }, []);

  const statCards = [
    {
      title: 'Content Created',
      value: stats.totalContent,
      icon: BookOpen,
      color: 'blue',
      change: '+12%',
      gradient: 'from-blue-500 to-blue-600',
      description: 'Stories, worksheets & more'
    },
    {
      title: 'Students Helped',
      value: stats.studentsAssessed,
      icon: Users,
      color: 'green',
      change: '+8%',
      gradient: 'from-green-500 to-emerald-600',
      description: 'Through assessments'
    },
    {
      title: 'Weekly Growth',
      value: `${stats.weeklyGrowth}%`,
      icon: TrendingUp,
      color: 'purple',
      change: '+5%',
      gradient: 'from-purple-500 to-indigo-600',
      description: 'In teaching efficiency'
    },
    {
      title: 'Time Saved',
      value: `${stats.hoursUsed}h`,
      icon: Clock,
      color: 'orange',
      change: '+20%',
      gradient: 'from-orange-500 to-red-500',
      description: 'This month'
    }
  ];

  const quickActions = [
    {
      title: 'Create Story',
      description: 'Generate culturally relevant educational stories',
      icon: BookOpen,
      gradient: 'from-blue-400 to-purple-500',
      action: 'content',
      popular: true
    },
    {
      title: 'Plan Lessons',
      description: 'AI-powered weekly lesson planning',
      icon: Calendar,
      gradient: 'from-green-400 to-teal-500',
      action: 'lessons',
      popular: false
    },
    {
      title: 'Assess Reading',
      description: 'Voice-based reading assessments',
      icon: Award,
      gradient: 'from-pink-400 to-red-500',
      action: 'speech',
      popular: true
    },
    {
      title: 'Ask AI',
      description: 'Get instant concept explanations',
      icon: Brain,
      gradient: 'from-cyan-400 to-blue-500',
      action: 'knowledge',
      popular: false
    }
  ];

  const getActivityIcon = (type) => {
    const icons = {
      story: BookOpen,
      lesson_plan: Calendar,
      assessment: Award,
      worksheet: PenTool
    };
    return icons[type] || BookOpen;
  };

  const getActivityColor = (type) => {
    const colors = {
      story: 'from-blue-500 to-blue-600',
      lesson_plan: 'from-green-500 to-green-600',
      assessment: 'from-purple-500 to-purple-600',
      worksheet: 'from-orange-500 to-orange-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="w-full space-y-8">
      {/* Welcome Header */}
      <motion.div 
        className="text-center py-6 lg:py-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="flex flex-col lg:flex-row items-center justify-center gap-4 mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
            <Sparkles className="text-white" size={32} />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Welcome back!
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mt-2">Ready to create amazing learning experiences?</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={index} 
              className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
                    <TrendingUp size={14} />
                    {stat.change}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-base lg:text-lg font-semibold text-gray-800 mb-1">{stat.title}</p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Rest of the component remains the same but with responsive classes... */}
      {/* Quick Actions */}
      <motion.div 
        className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Zap className="text-yellow-500" size={28} />
              Quick Actions
            </h2>
            <p className="text-gray-600 mt-2">Jump into AI-powered teaching tools</p>
          </div>
          <motion.button 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group mt-4 lg:mt-0"
            whileHover={{ x: 5 }}
          >
            View All Tools
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button 
                key={index}
                className="group relative p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-transparent hover:border-gray-200 transition-all duration-300 text-left hover:shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                {action.popular && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star size={10} fill="currentColor" />
                      Popular
                    </div>
                  </div>
                )}
                
                <div className={`w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base lg:text-lg group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{action.description}</p>
                <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700">
                  Get Started 
                  <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity & AI Tips */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Activity */}
        <motion.div 
          className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <motion.div 
                    key={activity.id} 
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${getActivityColor(activity.type)} rounded-xl flex items-center justify-center shadow-md`}>
                      <Icon className="text-white" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.subject} • Grade {activity.grade}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0"></div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No recent activity</h3>
                <p className="text-gray-500 mb-6">Start creating content to see your activity here!</p>
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                  Create Your First Content
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* AI Tips */}
        <motion.div 
          className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-2xl p-6 lg:p-8 border border-blue-200"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-800">AI Teaching Tips</h3>
              <p className="text-gray-600 text-sm lg:text-base">Maximize your impact with Sahayak AI</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              {
                title: "Start with Stories",
                tip: "Create engaging stories in local languages to make concepts memorable and culturally relevant.",
                icon: BookOpen
              },
              {
                title: "Differentiate Materials",
                tip: "Upload textbook pages to instantly create materials for different grade levels in your classroom.",
                icon: Layers
              },
              {
                title: "Assess with Speech",
                tip: "Use voice-based reading assessments to evaluate student progress in real-time.",
                icon: Mic
              }
            ].map((tip, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl p-4 lg:p-6 shadow-md border border-blue-100 hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <tip.icon className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2 text-sm lg:text-base">{tip.title}</h4>
                    <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">{tip.tip}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
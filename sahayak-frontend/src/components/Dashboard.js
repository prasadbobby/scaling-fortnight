'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, TrendingUp, Clock, Award, Target, 
  Plus, ArrowRight, Sparkles, Calendar, Brain, PenTool 
} from 'lucide-react';
import api from '@/lib/api';

export default function Dashboard({ teacherId }) {
  const [stats, setStats] = useState({
    totalContent: 0,
    studentsAssessed: 0,
    weeklyGrowth: 0,
    hoursUsed: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [teacherId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [analyticsResponse, contentResponse] = await Promise.allSettled([
        api.getTeacherAnalytics(teacherId, { days: 30 }),
        api.getContentLibrary(teacherId, { limit: 5 })
      ]);

      // Handle analytics data
      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value.success) {
        const data = analyticsResponse.value.data;
        setStats({
          totalContent: data.content_stats?.total_content || 0,
          studentsAssessed: data.assessment_insights?.total_assessments || 0,
          weeklyGrowth: 15,
          hoursUsed: 24
        });
      }

      // Handle content data
      if (contentResponse.status === 'fulfilled' && contentResponse.value.success) {
        setRecentActivity(contentResponse.value.data.slice(0, 4));
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError('Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Content Created',
      value: stats.totalContent,
      icon: BookOpen,
      color: 'blue',
      change: '+12%',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Students Assessed',
      value: stats.studentsAssessed,
      icon: Users,
      color: 'green',
      change: '+8%',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Weekly Growth',
      value: `${stats.weeklyGrowth}%`,
      icon: TrendingUp,
      color: 'purple',
      change: '+5%',
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      title: 'Hours Saved',
      value: stats.hoursUsed,
      icon: Clock,
      color: 'orange',
      change: '+20%',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const quickActions = [
    {
      title: 'Create Educational Story',
      description: 'Generate culturally relevant stories',
      icon: BookOpen,
      gradient: 'from-blue-400 to-purple-500',
      action: 'content'
    },
    {
      title: 'Plan Weekly Lessons',
      description: 'AI-powered lesson planning',
      icon: Calendar,
      gradient: 'from-green-400 to-teal-500',
      action: 'lessons'
    },
    {
      title: 'Assess Reading Skills',
      description: 'Speech-based assessments',
      icon: Award,
      gradient: 'from-pink-400 to-red-500',
      action: 'speech'
    },
    {
      title: 'Ask AI Assistant',
      description: 'Get instant explanations',
      icon: Brain,
      gradient: 'from-cyan-400 to-blue-500',
      action: 'knowledge'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-xl w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="h-24 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="inline-flex items-center gap-3 mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="text-white" size={32} />
          </div>
          <div className="text-left">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Welcome back, Teacher!
            </h1>
            <p className="text-xl text-gray-600 mt-2">Let's create amazing learning experiences today</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={index} 
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={28} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm font-semibold text-green-600">{stat.change}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">{stat.title}</p>
                <p className="text-xs text-gray-500">from last week</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div 
        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-gray-600 mt-2">Start creating with AI-powered tools</p>
          </div>
          <motion.button 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group"
            whileHover={{ x: 5 }}
          >
            View All 
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button 
                key={index}
                className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-transparent hover:border-gray-200 transition-all duration-300 text-left hover:shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700">
                  Get Started 
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            View All Activity
          </button>
        </div>
        
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <motion.div 
                key={index} 
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <PenTool className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Created {activity.content_type}: "{activity.metadata?.topic || 'Untitled'}"
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString()} • Grade {activity.metadata?.grade_level}
                  </p>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <BookOpen size={64} className="mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No recent activity</h3>
              <p className="text-gray-500 mb-6">Start creating content to see your activity here!</p>
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                Create Your First Content
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* AI Tips Section */}
      <motion.div 
        className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl p-8 border border-blue-200"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">AI-Powered Teaching Tips</h3>
            <p className="text-gray-600">Maximize your impact with Sahayak AI</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Start with Stories",
              tip: "Create engaging stories in local languages to make concepts memorable and culturally relevant."
            },
            {
              title: "Differentiate Materials",
              tip: "Upload textbook pages to instantly create materials for different grade levels in your classroom."
            },
            {
              title: "Assess with Speech",
              tip: "Use voice-based reading assessments to evaluate student progress in real-time."
            }
          ].map((tip, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-md border border-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 + index * 0.1 }}
            >
              <h4 className="font-semibold text-blue-800 mb-2">{tip.title}</h4>
              <p className="text-sm text-gray-600">{tip.tip}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
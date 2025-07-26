'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Users, TrendingUp, Clock, Award, Target } from 'lucide-react';

export default function Dashboard({ teacherId }) {
  const [stats] = useState({
    totalContent: 24,
    studentsAssessed: 156,
    weeklyGrowth: 15,
    hoursUsed: 24
  });

  const statCards = [
    {
      title: 'Content Created',
      value: stats.totalContent,
      icon: BookOpen,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Students Assessed',
      value: stats.studentsAssessed,
      icon: Users,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Weekly Growth',
      value: `${stats.weeklyGrowth}%`,
      icon: TrendingUp,
      color: 'purple',
      change: '+5%'
    },
    {
      title: 'Hours Saved',
      value: stats.hoursUsed,
      icon: Clock,
      color: 'orange',
      change: '+20%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your teaching overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change} from last week</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-500 rounded-xl flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors group">
            <BookOpen className="mx-auto mb-3 text-blue-500 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-medium text-gray-900 mb-1">Create Story</h3>
            <p className="text-sm text-gray-600">Generate educational stories</p>
          </button>
          
          <button className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors group">
            <Target className="mx-auto mb-3 text-green-500 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-medium text-gray-900 mb-1">Plan Lesson</h3>
            <p className="text-sm text-gray-600">Create lesson plans</p>
          </button>
          
          <button className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-colors group">
            <Award className="mx-auto mb-3 text-purple-500 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-medium text-gray-900 mb-1">Assess Students</h3>
            <p className="text-sm text-gray-600">Evaluate student progress</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { action: 'Created story about "Solar System"', time: '2 hours ago', color: 'blue' },
            { action: 'Generated worksheet for Grade 5 Math', time: '5 hours ago', color: 'green' },
            { action: 'Assessed reading fluency for 12 students', time: '1 day ago', color: 'purple' },
            { action: 'Created lesson plan for Science Week', time: '2 days ago', color: 'orange' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 bg-${activity.color}-500 rounded-full`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
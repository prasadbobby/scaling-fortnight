'use client';
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Award, BookOpen } from 'lucide-react';

import api from '@/lib/api';


export default function Analytics({ teacherId }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [teacherId, timeRange]);

const fetchAnalytics = async () => {
  try {
    setLoading(true);
    const response = await api.getTeacherAnalytics(teacherId, {
      days: timeRange
    });
    
    if (response.success) {
      setDashboardData(response.data);
    }
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center text-gray-500 py-12">
        <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
        <p>No analytics data available</p>
      </div>
    );
  }

  const contentStats = dashboardData.content_stats || {};
  const usagePatterns = dashboardData.usage_patterns || {};
  const assessmentInsights = dashboardData.assessment_insights || {};
  const recommendations = dashboardData.recommendations || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-blue-600" size={28} />
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 3 months</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">{contentStats.total_content || 0}</p>
              <p className="text-sm text-green-600">+12% from last period</p>
            </div>
            <BookOpen className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{assessmentInsights.total_assessments || 0}</p>
              <p className="text-sm text-green-600">+8% improvement</p>
            </div>
            <Award className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(assessmentInsights.avg_accuracy || 0)}%</p>
              <p className="text-sm text-green-600">Trending positive</p>
            </div>
            <TrendingUp className="text-purple-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Saved</p>
              <p className="text-2xl font-bold text-gray-900">24h</p>
              <p className="text-sm text-green-600">+20% efficiency</p>
            </div>
            <Clock className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      {/* Content Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Content by Type</h2>
          <div className="space-y-3">
            {Object.entries(contentStats.by_type || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">{type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / Math.max(...Object.values(contentStats.by_type || {}))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Content by Subject</h2>
          <div className="space-y-3">
            {Object.entries(contentStats.by_subject || {}).map(([subject, count]) => (
              <div key={subject} className="flex items-center justify-between">
                <span className="text-gray-700">{subject}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(count / Math.max(...Object.values(contentStats.by_subject || {}))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Language Distribution */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Language Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(contentStats.by_language || {}).map(([language, count]) => (
            <div key={language} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{language}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Patterns */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Usage Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Peak Usage Hours</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {(usagePatterns.peak_hours || []).map(hour => (
                <span key={hour} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {hour}:00
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Favorite Features</h3>
            <div className="space-y-2">
              {(usagePatterns.favorite_features || []).map(feature => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 capitalize">{feature.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Personalized Recommendations</h2>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-1">{rec.type.replace('_', ' ').toUpperCase()}</h3>
                <p className="text-sm text-gray-600 mb-2">{rec.message}</p>
                <button className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                  {rec.action.replace('_', ' ').toUpperCase()}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Activity Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Daily Activity</h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {Object.entries(contentStats.daily_activity || {}).slice(-7).map(([date, count]) => (
            <div key={date} className="flex flex-col items-center gap-2">
              <div 
                className="bg-blue-500 rounded-t w-8 min-h-[4px]"
                style={{ height: `${(count / Math.max(...Object.values(contentStats.daily_activity || {}))) * 200}px` }}
              ></div>
              <span className="text-xs text-gray-600 transform -rotate-45 origin-top-left">
                {new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
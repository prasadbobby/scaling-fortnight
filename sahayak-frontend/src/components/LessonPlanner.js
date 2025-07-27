'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Clock, Users, Plus, Download, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

export default function LessonPlanner({ teacherId }) {
  const [formData, setFormData] = useState({
    subjects: ['Mathematics'],
    grade_levels: [5],
    language: 'hi',
    duration_days: 5
  });
  const [lessonPlan, setLessonPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableSubjects = [
    'Mathematics', 'Science', 'Hindi', 'English', 'Social Studies',
    'History', 'Geography', 'Physics', 'Chemistry', 'Biology'
  ];

  const languages = {
    hi: 'हिंदी (Hindi)',
    en: 'English',
    mr: 'मराठी (Marathi)',
    bn: 'বাংলা (Bengali)',
    te: 'తెలుగు (Telugu)',
    ta: 'தமிழ் (Tamil)',
    gu: 'ગુજરાતી (Gujarati)'
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleGradeToggle = (grade) => {
    setFormData(prev => ({
      ...prev,
      grade_levels: prev.grade_levels.includes(grade)
        ? prev.grade_levels.filter(g => g !== grade)
        : [...prev.grade_levels, grade]
    }));
  };

  const generateLessonPlan = async () => {
    if (formData.subjects.length === 0 || formData.grade_levels.length === 0) {
      alert('Please select at least one subject and grade level');
      return;
    }

    setLoading(true);
    try {
      const response = await api.generateLessonPlan({
        ...formData,
        teacher_id: teacherId
      });

      if (response.success) {
        setLessonPlan(response.data);
      }
    } catch (error) {
      console.error('Failed to generate lesson plan:', error);
      alert('Failed to generate lesson plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
          <BookOpen className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Lesson Planner</h1>
          <p className="text-gray-600">Create comprehensive lesson plans with AI assistance</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">Plan Configuration</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Subjects</label>
              <div className="grid grid-cols-1 gap-2">
                {availableSubjects.map(subject => (
                  <label key={subject} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Grade Levels</label>
              <div className="grid grid-cols-4 gap-2">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                  <label key={grade} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.grade_levels.includes(grade)}
                      onChange={() => handleGradeToggle(grade)}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{grade}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                className="select-field"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Duration (Days)</label>
              <select
                value={formData.duration_days}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                className="select-field"
              >
                <option value={5}>5 Days (1 Week)</option>
                <option value={10}>10 Days (2 Weeks)</option>
                <option value={15}>15 Days (3 Weeks)</option>
                <option value={20}>20 Days (4 Weeks)</option>
              </select>
            </div>

            <motion.button
              onClick={generateLessonPlan}
              disabled={loading}
              className="btn btn-success w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <div className="loading"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Generate Lesson Plan
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Lesson Plan Display */}
        <div className="xl:col-span-2">
          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Generated Lesson Plan</h2>
                {lessonPlan && (
                  <button className="btn btn-secondary">
                    <Download size={16} />
                    Export PDF
                  </button>
                )}
              </div>

              {lessonPlan ? (
                <div className="space-y-6">
                  {/* Plan Summary */}
                  <motion.div 
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="text-green-600" size={20} />
                      <h3 className="font-bold text-green-800">Plan Summary</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Subjects:</span> 
                        <p className="text-gray-600">{formData.subjects.join(', ')}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Grades:</span> 
                        <p className="text-gray-600">{formData.grade_levels.join(', ')}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Duration:</span> 
                        <p className="text-gray-600">{formData.duration_days} days</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Language:</span> 
                        <p className="text-gray-600">{languages[formData.language]}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Daily Plans */}
                  <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                    {Object.entries(lessonPlan.weekly_plans || {}).map(([day, dayPlan], dayIndex) => (
                      <motion.div 
                        key={day} 
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * dayIndex }}
                      >
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-3">
                          <Calendar size={18} className="text-blue-500" />
                          {day.replace('_', ' ')}
                        </h3>
                        
                        <div className="space-y-4">
                          {Object.entries(dayPlan).map(([subject, gradeContent]) => (
                            <div key={subject} className="border-l-4 border-blue-400 pl-4">
                              <h4 className="font-semibold text-gray-700 mb-2">{subject}</h4>
                              {typeof gradeContent === 'object' ? (
                                Object.entries(gradeContent).map(([grade, content]) => (
                                  <div key={grade} className="mb-3">
                                    <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{grade}:</span>
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                      {typeof content === 'string' ? content.substring(0, 200) + '...' : JSON.stringify(content).substring(0, 200) + '...'}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {gradeContent.substring(0, 200)}...
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Weekly Summary */}
                  {lessonPlan.summary && (
                    <motion.div 
                      className="border border-blue-200 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h3 className="font-bold text-blue-800 mb-3">Weekly Summary & Assessment Plan</h3>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {lessonPlan.summary.substring(0, 400)}...
                      </p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-16">
                  <Calendar size={64} className="mx-auto mb-6 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Plan!</h3>
                  <p className="text-sm mb-4">Your AI-generated lesson plan will appear here</p>
                  <p className="text-xs text-gray-400">Configure your settings and click &ldquo;Generate Lesson Plan&rdquo;</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
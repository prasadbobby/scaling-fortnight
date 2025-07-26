'use client';
import { useState } from 'react';
import { BookOpen, Calendar, Clock, Users, Plus, Download } from 'lucide-react';
import apiService from '@/services/api';

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
      const response = await apiService.post('/planning/generate-lesson-plan', {
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="text-green-600" size={28} />
        <h1 className="text-3xl font-bold text-gray-900">Lesson Planner</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Plan Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
              <div className="grid grid-cols-2 gap-2">
                {availableSubjects.map(subject => (
                  <label key={subject} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Levels</label>
              <div className="grid grid-cols-4 gap-2">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                  <label key={grade} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={formData.grade_levels.includes(grade)}
                      onChange={() => handleGradeToggle(grade)}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{grade}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="hi">Hindi</option>
                <option value="en">English</option>
                <option value="mr">Marathi</option>
                <option value="bn">Bengali</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days)</label>
              <select
                value={formData.duration_days}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value={5}>5 Days (1 Week)</option>
                <option value={10}>10 Days (2 Weeks)</option>
                <option value={15}>15 Days (3 Weeks)</option>
                <option value={20}>20 Days (4 Weeks)</option>
              </select>
            </div>

            <button
              onClick={generateLessonPlan}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
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
            </button>
          </div>
        </div>

        {/* Lesson Plan Display */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Generated Lesson Plan</h2>
            {lessonPlan && (
              <button className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <Download size={16} />
                Export PDF
              </button>
            )}
          </div>

          {lessonPlan ? (
            <div className="space-y-6">
              {/* Plan Summary */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Plan Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Subjects:</span> {formData.subjects.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Grades:</span> {formData.grade_levels.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {formData.duration_days} days
                  </div>
                  <div>
                    <span className="font-medium">Language:</span> {formData.language}
                  </div>
                </div>
              </div>

              {/* Daily Plans */}
              <div className="space-y-4">
                {Object.entries(lessonPlan.weekly_plans || {}).map(([day, dayPlan]) => (
                  <div key={day} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Calendar size={16} />
                      {day.replace('_', ' ')}
                    </h3>
                    
                    <div className="space-y-3">
                      {Object.entries(dayPlan).map(([subject, gradeContent]) => (
                        <div key={subject} className="border-l-4 border-blue-400 pl-4">
                          <h4 className="font-medium text-gray-700 mb-2">{subject}</h4>
                          {typeof gradeContent === 'object' ? (
                            Object.entries(gradeContent).map(([grade, content]) => (
                              <div key={grade} className="mb-2">
                                <span className="text-sm font-medium text-blue-600">{grade}:</span>
                                <p className="text-sm text-gray-600 mt-1 max-h-20 overflow-hidden">
                                  {typeof content === 'string' ? content.substring(0, 150) + '...' : JSON.stringify(content).substring(0, 150) + '...'}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">
                              {gradeContent.substring(0, 150)}...
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Summary */}
              {lessonPlan.summary && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-blue-800 mb-2">Weekly Summary</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {lessonPlan.summary.substring(0, 300)}...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Your lesson plan will appear here</p>
              <p className="text-sm">Configure your settings and click "Generate Lesson Plan"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
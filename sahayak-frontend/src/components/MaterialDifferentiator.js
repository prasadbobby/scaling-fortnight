'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Upload, FileText, Download, Eye, CheckCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

export default function MaterialDifferentiator({ teacherId }) {
  const [activeTab, setActiveTab] = useState('textbook');
  const [textbookData, setTextbookData] = useState({
    image: null,
    grade_levels: [5],
    language: 'hi'
  });
  const [assessmentData, setAssessmentData] = useState({
    topic: '',
    grade_levels: [5],
    language: 'hi'
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const languages = {
    hi: 'हिंदी (Hindi)',
    en: 'English',
    mr: 'मराठी (Marathi)',
    bn: 'বাংলা (Bengali)',
    te: 'తెলুগু (Telugu)',
    ta: 'தமிழ் (Tamil)',
    gu: 'ગુજરાતી (Gujarati)'
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTextbookData(prev => ({ ...prev, image: file }));
    }
  };

  const handleGradeToggle = (grade, type) => {
    const data = type === 'textbook' ? textbookData : assessmentData;
    const setter = type === 'textbook' ? setTextbookData : setAssessmentData;
    
    setter(prev => ({
      ...prev,
      grade_levels: prev.grade_levels.includes(grade)
        ? prev.grade_levels.filter(g => g !== grade)
        : [...prev.grade_levels, grade]
    }));
  };

  const processTextbook = async () => {
    if (!textbookData.image) {
      alert('Please upload a textbook image');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('textbook_image', textbookData.image);
      formData.append('language', textbookData.language);
      formData.append('teacher_id', teacherId);
      textbookData.grade_levels.forEach(grade => {
        formData.append('grade_levels', grade);
      });

      const response = await api.differentiateTextbook(formData);
      
      if (response.success) {
        setResults(response.data);
      }
    } catch (error) {
      console.error('Failed to process textbook:', error);
      alert('Failed to process textbook. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createAssessment = async () => {
    if (!assessmentData.topic) {
      alert('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const response = await api.createAssessment({
        ...assessmentData,
        teacher_id: teacherId
      });

      if (response.success) {
        setResults(response.data);
      }
    } catch (error) {
      console.error('Failed to create assessment:', error);
      alert('Failed to create assessment. Please try again.');
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
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Layers className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Material Differentiator</h1>
          <p className="text-gray-600">Create differentiated materials for multi-grade classrooms</p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('textbook')}
            className={`flex-1 px-6 py-4 font-semibold text-sm transition-all duration-200 ${
              activeTab === 'textbook'
                ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <FileText size={16} className="inline mr-2" />
            Textbook Differentiator
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`flex-1 px-6 py-4 font-semibold text-sm transition-all duration-200 ${
              activeTab === 'assessment'
                ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <FileText size={16} className="inline mr-2" />
            Assessment Creator
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'textbook' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Textbook Upload Section */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold text-gray-800">Upload Textbook Page</h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-400 transition-colors group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="textbook-upload"
                  />
                  <label htmlFor="textbook-upload" className="cursor-pointer">
                    <Upload size={48} className="mx-auto mb-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    <p className="text-gray-600 font-medium mb-2">Click to upload textbook page</p>
                    <p className="text-sm text-gray-500">Supports JPG, PNG, PDF</p>
                  </label>
                </div>

                {textbookData.image && (
                  <motion.div 
                    className="border border-green-200 rounded-xl p-4 bg-green-50"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={20} />
                      <p className="text-sm font-semibold text-green-600">
                        File uploaded: {textbookData.image.name}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Target Grade Levels</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                      <label key={grade} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={textbookData.grade_levels.includes(grade)}
                          onChange={() => handleGradeToggle(grade, 'textbook')}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{grade}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Language</label>
                  <select
                    value={textbookData.language}
                    onChange={(e) => setTextbookData(prev => ({ ...prev, language: e.target.value }))}
                    className="select-field"
                  >
                    {Object.entries(languages).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                <motion.button
                  onClick={processTextbook}
                  disabled={loading || !textbookData.image}
                  className="btn btn-primary w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="loading"></div>
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Layers size={20} />
                      Differentiate Material
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Preview Section */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-bold text-gray-800">Differentiated Materials</h2>
                
                {results && results.differentiated_materials ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                    {Object.entries(results.differentiated_materials).map(([grade, material], index) => (
                      <motion.div 
                        key={grade} 
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-gray-800">Grade {grade}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              material.difficulty_level === 'Basic' ? 'bg-green-100 text-green-800' :
                              material.difficulty_level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {material.difficulty_level}
                            </span>
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock size={14} />
                              <span className="text-xs">{material.estimated_time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm max-h-32 overflow-y-auto custom-scrollbar">
                          {material.worksheet.substring(0, 300)}...
                        </div>
                        <button className="mt-3 text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1 font-medium">
                          <Eye size={12} />
                          View Full Material
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-16">
                    <Layers size={64} className="mx-auto mb-6 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">Ready to Differentiate!</h3>
                    <p className="text-sm mb-4">Differentiated materials will appear here</p>
                    <p className="text-xs text-gray-400">Upload a textbook page to get started</p>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Assessment Creation Section */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold text-gray-800">Create Multi-Level Assessment</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Topic</label>
                  <input
                    type="text"
                    value={assessmentData.topic}
                    onChange={(e) => setAssessmentData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Fractions, Photosynthesis, World War II"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Grade Levels</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                      <label key={grade} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={assessmentData.grade_levels.includes(grade)}
                          onChange={() => handleGradeToggle(grade, 'assessment')}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{grade}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Language</label>
                  <select
                    value={assessmentData.language}
                    onChange={(e) => setAssessmentData(prev => ({ ...prev, language: e.target.value }))}
                    className="select-field"
                  >
                    {Object.entries(languages).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                <motion.button
                  onClick={createAssessment}
                  disabled={loading || !assessmentData.topic}
                  className="btn btn-primary w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="loading"></div>
                      Creating with AI...
                    </>
                  ) : (
                    <>
                      <FileText size={20} />
                      Create Assessment
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Assessment Preview */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-bold text-gray-800">Generated Assessments</h2>
                
                {results && results.assessments ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                    {Object.entries(results.assessments).map(([grade, assessment], index) => (
                      <motion.div 
                        key={grade} 
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <h3 className="font-bold text-gray-800 mb-4">Grade {grade} Assessment</h3>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm max-h-32 overflow-y-auto custom-scrollbar">
                          {assessment.substring(0, 300)}...
                        </div>
                        <button className="mt-3 text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1 font-medium">
                          <Eye size={12} />
                          View Full Assessment
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-16">
                    <FileText size={64} className="mx-auto mb-6 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">Ready to Assess!</h3>
                    <p className="text-sm mb-4">Generated assessments will appear here</p>
                    <p className="text-xs text-gray-400">Enter a topic to create assessments</p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
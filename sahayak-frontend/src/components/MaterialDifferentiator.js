'use client';
import { useState } from 'react';
import { Layers, Upload, FileText, Download, Eye } from 'lucide-react';
import apiService from '@/services/api';

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

      const response = await apiService.upload('/materials/differentiate-textbook', formData);
      
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
      const response = await apiService.post('/materials/create-assessment', {
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Layers className="text-purple-600" size={28} />
        <h1 className="text-3xl font-bold text-gray-900">Material Differentiator</h1>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('textbook')}
            className={`px-6 py-3 font-medium text-sm rounded-t-xl transition-colors ${
              activeTab === 'textbook'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FileText size={16} className="inline mr-2" />
            Textbook Differentiator
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-6 py-3 font-medium text-sm rounded-t-xl transition-colors ${
              activeTab === 'assessment'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FileText size={16} className="inline mr-2" />
            Assessment Creator
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'textbook' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Textbook Upload Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Upload Textbook Page</h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="textbook-upload"
                  />
                  <label htmlFor="textbook-upload" className="cursor-pointer">
                    <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Click to upload textbook page</p>
                    <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG, PDF</p>
                  </label>
                </div>

                {textbookData.image && (
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium text-green-600 mb-2">
                      ✓ File uploaded: {textbookData.image.name}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Grade Levels</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                      <label key={grade} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={textbookData.grade_levels.includes(grade)}
                          onChange={() => handleGradeToggle(grade, 'textbook')}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{grade}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={textbookData.language}
                    onChange={(e) => setTextbookData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="hi">Hindi</option>
                    <option value="en">English</option>
                    <option value="mr">Marathi</option>
                    <option value="bn">Bengali</option>
                  </select>
                </div>

                <button
                  onClick={processTextbook}
                  disabled={loading || !textbookData.image}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="loading"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Layers size={20} />
                      Differentiate Material
                    </>
                  )}
                </button>
              </div>

              {/* Preview Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Differentiated Materials</h2>
                
                {results && results.differentiated_materials ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(results.differentiated_materials).map(([grade, material]) => (
                      <div key={grade} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-800">Grade {grade}</h3>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {material.difficulty_level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Estimated time: {material.estimated_time}
                        </p>
                        <div className="bg-gray-50 rounded p-3 text-sm max-h-32 overflow-y-auto">
                          {material.worksheet.substring(0, 200)}...
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <Layers size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Differentiated materials will appear here</p>
                    <p className="text-sm">Upload a textbook page to get started</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assessment Creation Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Create Multi-Level Assessment</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <input
                    type="text"
                    value={assessmentData.topic}
                    onChange={(e) => setAssessmentData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Fractions, Photosynthesis, World War II"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade Levels</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                      <label key={grade} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={assessmentData.grade_levels.includes(grade)}
                          onChange={() => handleGradeToggle(grade, 'assessment')}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{grade}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={assessmentData.language}
                    onChange={(e) => setAssessmentData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="hi">Hindi</option>
                    <option value="en">English</option>
                    <option value="mr">Marathi</option>
                    <option value="bn">Bengali</option>
                  </select>
                </div>

                <button
                  onClick={createAssessment}
                  disabled={loading || !assessmentData.topic}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="loading"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText size={20} />
                      Create Assessment
                    </>
                  )}
                </button>
              </div>

              {/* Assessment Preview */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Generated Assessments</h2>
                
                {results && results.assessments ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(results.assessments).map(([grade, assessment]) => (
                      <div key={grade} className="border rounded-lg p-4">
                        <h3 className="font-medium text-gray-800 mb-2">Grade {grade} Assessment</h3>
                        <div className="bg-gray-50 rounded p-3 text-sm max-h-32 overflow-y-auto">
                          {assessment.substring(0, 200)}...
                        </div>
                        <button className="mt-2 text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1">
                          <Eye size={12} />
                          View Full Assessment
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Generated assessments will appear here</p>
                    <p className="text-sm">Enter a topic to create assessments</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';
import { useState } from 'react';
import { PenTool, Wand2, Download, Eye } from 'lucide-react';
import apiService from '@/services/api';

export default function ContentGenerator({ teacherId }) {
  const [formData, setFormData] = useState({
    topic: '',
    language: 'hi',
    cultural_context: 'Indian rural',
    content_type: 'story',
    grade_level: 5,
    include_visual: false
  });
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const languages = {
    hi: 'Hindi',
    en: 'English',
    mr: 'Marathi',
    bn: 'Bengali',
    te: 'Telugu',
    ta: 'Tamil',
    gu: 'Gujarati'
  };

  const contentTypes = {
    story: 'Educational Story',
    worksheet: 'Worksheet',
    activity: 'Activity',
    assessment: 'Assessment'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        teacher_id: teacherId
      };

      let response;
      if (formData.content_type === 'story') {
        response = await apiService.post('/content/generate-story', payload);
      } else {
        response = await apiService.post('/content/generate-game', {
          topic: formData.topic,
          grade_level: formData.grade_level,
          language: formData.language,
          teacher_id: teacherId
        });
      }

      if (response.success) {
        setGeneratedContent(response.data);
      }
    } catch (error) {
      console.error('Content generation failed:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <PenTool className="text-blue-600" size={28} />
        <h1 className="text-3xl font-bold text-gray-900">Content Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Create New Content</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="e.g., Solar System, Photosynthesis, Addition"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(languages).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                <select
                  name="grade_level"
                  value={formData.grade_level}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <select
                name="content_type"
                value={formData.content_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(contentTypes).map(([type, name]) => (
                  <option key={type} value={type}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cultural Context</label>
              <select
                name="cultural_context"
                value={formData.cultural_context}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Indian rural">Indian Rural</option>
                <option value="Indian urban">Indian Urban</option>
                <option value="Indian tribal">Indian Tribal</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="include_visual"
                checked={formData.include_visual}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">Include Visual Aid</label>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.topic}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="loading"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  Generate Content
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Generated Content</h2>
          
          {generatedContent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="text-blue-600" size={20} />
                  <span className="font-medium text-gray-700">Preview</span>
                </div>
                <button className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Download size={16} />
                  Export
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {generatedContent.content || generatedContent.game_content}
                </pre>
              </div>

              {generatedContent.visual && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Generated Visual</h3>
                  <img 
                    src={`data:image/png;base64,${generatedContent.visual}`}
                    alt="Generated visual aid"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}

              {generatedContent.metadata && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-medium mb-2 text-blue-800">Content Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Topic:</span> {generatedContent.metadata.topic}</div>
                    <div><span className="font-medium">Language:</span> {generatedContent.metadata.language}</div>
                    <div><span className="font-medium">Grade:</span> {generatedContent.metadata.grade_level}</div>
                    <div><span className="font-medium">Type:</span> {generatedContent.metadata.content_type}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <PenTool size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Your generated content will appear here</p>
              <p className="text-sm">Fill out the form and click "Generate Content"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
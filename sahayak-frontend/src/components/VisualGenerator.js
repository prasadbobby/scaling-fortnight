'use client';
import { useState } from 'react';
import { Image, Video, Wand2, Download, Eye, AlertCircle } from 'lucide-react';
import api from '@/lib/api';


export default function VisualGenerator({ teacherId }) {
  const [activeTab, setActiveTab] = useState('diagram');
  const [diagramData, setDiagramData] = useState({
    concept: '',
    grade_level: 5
  });
  const [visualData, setVisualData] = useState({
    description: '',
    style: 'simple line drawing'
  });
  const [videoData, setVideoData] = useState({
    description: '',
    duration: 30
  });
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);

  const visualStyles = [
    'simple line drawing',
    'colorful illustration',
    'scientific diagram',
    'cartoon style',
    'realistic illustration',
    'minimalist design'
  ];

const checkServiceStatus = async () => {
  try {
    const response = await api.get('/visuals/service-status');
    if (response.success) {
      setServiceStatus(response.services);
    }
  } catch (error) {
    console.error('Failed to check service status:', error);
  }
};

  useState(() => {
    checkServiceStatus();
  }, []);

const generateDiagram = async () => {
  if (!diagramData.concept) {
    alert('Please enter a concept');
    return;
  }

  setLoading(true);
  try {
    const response = await api.generateDiagram(diagramData);
    
    if (response.success) {
      setGeneratedContent({
        type: 'image',
        data: response.data
      });
    } else {
      setGeneratedContent({
        type: 'fallback',
        data: response
      });
    }
  } catch (error) {
    console.error('Diagram generation failed:', error);
    alert('Failed to generate diagram. Please try again.');
  } finally {
    setLoading(false);
  }
};

const generateVisualAid = async () => {
  if (!visualData.description) {
    alert('Please enter a description');
    return;
  }

  setLoading(true);
  try {
    const response = await api.generateVisual(visualData);
    
    if (response.success) {
      setGeneratedContent({
        type: 'image',
        data: response.data
      });
    } else {
      setGeneratedContent({
        type: 'fallback',
        data: response
      });
    }
  } catch (error) {
    console.error('Visual aid generation failed:', error);
    alert('Failed to generate visual aid. Please try again.');
  } finally {
    setLoading(false);
  }
};

const generateVideo = async () => {
  if (!videoData.description) {
    alert('Please enter a description');
    return;
  }

  setLoading(true);
  try {
    const response = await api.post('/visuals/generate-video', videoData);
    
    if (response.success) {
      setGeneratedContent({
        type: 'video',
        data: response.data
      });
    } else {
      setGeneratedContent({
        type: 'fallback',
        data: response
      });
    }
  } catch (error) {
    console.error('Video generation failed:', error);
    alert('Failed to generate video. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const renderServiceStatus = () => {
    if (!serviceStatus) return null;

    return (
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Service Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${serviceStatus.imagen?.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>Image Generation: {serviceStatus.imagen?.available ? 'Available' : 'Unavailable'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${serviceStatus.veo?.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>Video Generation: {serviceStatus.veo?.available ? 'Available' : 'Unavailable'}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderFallbackContent = (fallbackData) => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-yellow-600 mt-1" size={20} />
        <div>
          <h3 className="font-medium text-yellow-800 mb-2">Service Unavailable</h3>
          <p className="text-sm text-yellow-700 mb-3">{fallbackData.message}</p>
          {fallbackData.fallback && (
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-gray-800 mb-2">Alternative Suggestion:</h4>
              <p className="text-sm text-gray-600">{fallbackData.fallback.suggestion}</p>
              {fallbackData.fallback.text_description && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Description:</strong> {fallbackData.fallback.text_description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Image className="text-indigo-600" size={28} />
        <h1 className="text-3xl font-bold text-gray-900">Visual Generator</h1>
      </div>

      {renderServiceStatus()}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('diagram')}
            className={`px-6 py-3 font-medium text-sm rounded-t-xl transition-colors ${
              activeTab === 'diagram'
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Image size={16} className="inline mr-2" />
            Educational Diagrams
          </button>
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-6 py-3 font-medium text-sm rounded-t-xl transition-colors ${
              activeTab === 'visual'
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Image size={16} className="inline mr-2" />
            Visual Aids
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-6 py-3 font-medium text-sm rounded-t-xl transition-colors ${
              activeTab === 'video'
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Video size={16} className="inline mr-2" />
            Educational Videos
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              {activeTab === 'diagram' && (
                <>
                  <h2 className="text-xl font-semibold">Generate Educational Diagram</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Concept</label>
                    <input
                      type="text"
                      value={diagramData.concept}
                      onChange={(e) => setDiagramData(prev => ({ ...prev, concept: e.target.value }))}
                      placeholder="e.g., Water Cycle, Human Heart, Plant Cell"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                    <select
                      value={diagramData.grade_level}
                      onChange={(e) => setDiagramData(prev => ({ ...prev, grade_level: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                        <option key={grade} value={grade}>Grade {grade}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={generateDiagram}
                    disabled={loading || !diagramData.concept}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="loading"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 size={20} />
                        Generate Diagram
                      </>
                    )}
                  </button>
                </>
              )}

              {activeTab === 'visual' && (
                <>
                  <h2 className="text-xl font-semibold">Generate Visual Aid</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={visualData.description}
                      onChange={(e) => setVisualData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what you want to visualize..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                    <select
                      value={visualData.style}
                      onChange={(e) => setVisualData(prev => ({ ...prev, style: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      {visualStyles.map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={generateVisualAid}
                    disabled={loading || !visualData.description}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="loading"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 size={20} />
                        Generate Visual
                      </>
                    )}
                  </button>
                </>
              )}

              {activeTab === 'video' && (
                <>
                  <h2 className="text-xl font-semibold">Generate Educational Video</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={videoData.description}
                      onChange={(e) => setVideoData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the educational video you want to create..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (seconds)</label>
                    <select
                      value={videoData.duration}
                      onChange={(e) => setVideoData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                      <option value={120}>2 minutes</option>
                    </select>
                  </div>
                  <button
                    onClick={generateVideo}
                    disabled={loading || !videoData.description}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="loading"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 size={20} />
                        Generate Video
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Generated Content</h2>
                {generatedContent && generatedContent.type !== 'fallback' && (
                  <button className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Download size={16} />
                    Download
                  </button>
                )}
              </div>

              {generatedContent ? (
                <div className="border rounded-lg p-4">
                  {generatedContent.type === 'image' && (
                    <div className="space-y-3">
                      <img
                        src={`data:image/png;base64,${generatedContent.data.image}`}
                        alt="Generated visual"
                        className="w-full rounded-lg border"
                      />
                      <div className="text-sm text-gray-600">
                        <p><strong>Description:</strong> {generatedContent.data.description || generatedContent.data.concept}</p>
                        <p><strong>Format:</strong> {generatedContent.data.format}</p>
                      </div>
                    </div>
                  )}

                  {generatedContent.type === 'video' && (
                    <div className="space-y-3">
                      <video
                        controls
                        className="w-full rounded-lg border"
                        src={`data:video/mp4;base64,${generatedContent.data.video}`}
                      />
                      <div className="text-sm text-gray-600">
                        <p><strong>Description:</strong> {generatedContent.data.description}</p>
                        <p><strong>Duration:</strong> {generatedContent.data.duration} seconds</p>
                        <p><strong>Format:</strong> {generatedContent.data.format}</p>
                      </div>
                    </div>
                  )}

                  {generatedContent.type === 'fallback' && renderFallbackContent(generatedContent.data)}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12 border rounded-lg">
                  <Image size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Your generated visual will appear here</p>
                  <p className="text-sm">Fill out the form and click generate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
        <h3 className="font-semibold text-indigo-800 mb-3">Visual Generation Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-indigo-700">
          <div>
            <h4 className="font-medium mb-2">For Diagrams:</h4>
            <ul className="space-y-1">
              <li>• Use specific scientific terms</li>
              <li>• Mention key components to include</li>
              <li>• Specify the grade level appropriately</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">For Visual Aids:</h4>
            <ul className="space-y-1">
              <li>• Be descriptive about what you want</li>
              <li>• Choose appropriate style for age group</li>
              <li>• Consider classroom display needs</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">For Videos:</h4>
            <ul className="space-y-1">
              <li>• Describe the concept clearly</li>
              <li>• Keep duration appropriate for attention span</li>
              <li>• Include key learning objectives</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
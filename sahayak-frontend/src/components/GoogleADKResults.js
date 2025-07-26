// sahayak-frontend/src/components/GoogleADKResults.js
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, Eye, FileText, BookOpen, CheckCircle, 
  Award, Layers, Target, Brain, Star, BarChart3,
  ChevronRight, ExternalLink, Printer, Share2
} from 'lucide-react';

export default function GoogleADKResults({ results }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const downloadPackage = async (format = 'pdf') => {
    try {
      // Implementation for downloading complete package
      console.log(`Downloading package in ${format} format`);
      // API call to download endpoint
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const renderOverview = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Quality Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(results.quality_metrics || {}).map(([metric, value], index) => (
          <motion.div 
            key={metric}
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(value * 100)}%
              </div>
              <div className="text-xs text-gray-600 mt-1 capitalize">
                {metric.replace('_', ' ')}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Workflow Summary */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target size={20} className="text-green-500" />
          Workflow Execution Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Agents Executed:</span>
              <span className="font-semibold">{results.workflow_metadata?.total_agents_executed || 4}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completion Time:</span>
              <span className="font-semibold">
                {new Date(results.workflow_metadata?.execution_completed_at || Date.now()).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Orchestration Quality:</span>
              <span className="font-semibold text-green-600 capitalize">
                {results.workflow_metadata?.orchestration_quality || 'High'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Content Items Generated:</span>
              <span className="font-semibold">
                {Object.keys(results.content_package?.stories || {}).length + 
                 Object.keys(results.content_package?.worksheets || {}).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Assessment Types:</span>
              <span className="font-semibold">
                {Object.keys(results.assessment_system || {}).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Differentiation Levels:</span>
              <span className="font-semibold">
                {Object.keys(results.differentiated_materials?.difficulty_levels || {}).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Execution Steps</h3>
        {Object.entries(results.step_details || {}).map(([stepId, stepData], index) => (
          <motion.div 
            key={stepId}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection(stepId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{stepData.metadata?.step}. {stepData.agent_id}</h4>
                    <p className="text-sm text-gray-600">{stepData.task}</p>
                  </div>
                </div>
                <ChevronRight 
                  size={20} 
                  className={`text-gray-400 transition-transform ${
                    expandedSections[stepId] ? 'rotate-90' : ''
                  }`} 
                />
              </div>
            </div>
            
            {expandedSections[stepId] && (
              <motion.div 
                className="px-4 pb-4 border-t border-gray-100"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="mt-3 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <h5 className="font-medium text-sm mb-2">Agent Output:</h5>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {stepData.result?.substring(0, 500)}...
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                      <Eye size={12} className="inline mr-1" />
                      View Full Output
                    </button>
                    <button className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors">
                      <Download size={12} className="inline mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderContent = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Content Package Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <BookOpen size={24} className="mx-auto text-blue-600 mb-2" />
          <div className="text-xl font-bold text-blue-600">
            {Object.keys(results.content_package?.stories || {}).length}
          </div>
          <div className="text-sm text-gray-600">Educational Stories</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <FileText size={24} className="mx-auto text-green-600 mb-2" />
          <div className="text-xl font-bold text-green-600">
            {Object.keys(results.content_package?.worksheets || {}).length}
          </div>
          <div className="text-sm text-gray-600">Interactive Worksheets</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <Layers size={24} className="mx-auto text-purple-600 mb-2" />
          <div className="text-xl font-bold text-purple-600">
            {Object.keys(results.content_package?.activities || {}).length}
          </div>
          <div className="text-sm text-gray-600">Learning Activities</div>
        </div>
      </div>

      {/* Detailed Content Display */}
      <div className="space-y-6">
        {/* Stories Section */}
        {results.content_package?.stories && Object.keys(results.content_package.stories).length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-500" />
              Educational Stories
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(results.content_package.stories).map(([key, story], index) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{story.title || `Story ${index + 1}`}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {story.content?.substring(0, 150)}...
                  </p>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded">
                      Read Full Story
                    </button>
                    <button className="text-xs px-3 py-1 bg-gray-100 text-gray-800 rounded">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Worksheets Section */}
        {results.content_package?.worksheets && Object.keys(results.content_package.worksheets).length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-green-500" />
              Interactive Worksheets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(results.content_package.worksheets).map(([key, worksheet], index) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{worksheet.title || `Worksheet ${index + 1}`}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {worksheet.content?.substring(0, 150)}...
                  </p>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded">
                      View Worksheet
                    </button>
                    <button className="text-xs px-3 py-1 bg-gray-100 text-gray-800 rounded">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderAssessments = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Assessment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <Award size={24} className="mx-auto text-orange-600 mb-2" />
          <div className="text-xl font-bold text-orange-600">
            {Object.keys(results.assessment_system?.formative_assessments || {}).length}
          </div>
          <div className="text-sm text-gray-600">Formative</div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <CheckCircle size={24} className="mx-auto text-red-600 mb-2" />
          <div className="text-xl font-bold text-red-600">
            {Object.keys(results.assessment_system?.summative_assessments || {}).length}
          </div>
          <div className="text-sm text-gray-600">Summative</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <BarChart3 size={24} className="mx-auto text-purple-600 mb-2" />
          <div className="text-xl font-bold text-purple-600">
            {Object.keys(results.assessment_system?.rubrics || {}).length}
          </div>
          <div className="text-sm text-gray-600">Rubrics</div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <Target size={24} className="mx-auto text-blue-600 mb-2" />
          <div className="text-xl font-bold text-blue-600">
            {Math.round((results.quality_metrics?.assessment_alignment || 0.88) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Alignment</div>
        </div>
      </div>

      {/* Assessment Details */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Assessment System Details</h3>
        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {results.assessment_system?.raw_output || 'No assessment details available'}
          </pre>
        </div>
      </div>
    </motion.div>
  );

  const renderImplementation = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Implementation Guide */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain size={20} className="text-indigo-500" />
          Implementation Guide
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Getting Started</h4>
            <p className="text-sm text-gray-600 mb-4">
              {results.implementation_guide?.getting_started || 
               'Follow the step-by-step guide to implement the generated educational content in your classroom.'}
            </p>
            
            <h4 className="font-semibold mb-3">Timeline</h4>
            <p className="text-sm text-gray-600">
              {results.implementation_guide?.timeline || 
               'Suggested implementation timeline spans 1-2 weeks for complete integration.'}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Resources Needed</h4>
            <p className="text-sm text-gray-600 mb-4">
              {results.implementation_guide?.resources_needed || 
               'Basic classroom materials, printed worksheets, and access to digital content.'}
            </p>
            
            <h4 className="font-semibold mb-3">Troubleshooting</h4>
            <p className="text-sm text-gray-600">
              {results.implementation_guide?.troubleshooting || 
               'Common issues and solutions are provided in the complete implementation guide.'}
            </p>
          </div>
        </div>
      </div>

      {/* Download Package */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download size={20} className="text-blue-600" />
          Download Complete Package
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Available Formats</h4>
            <div className="space-y-2">
              {(results.download_package?.available_formats || ['PDF', 'Word', 'ZIP']).map(format => (
                <button 
                  key={format}
                  onClick={() => downloadPackage(format.toLowerCase())}
                  className="block w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors"
                >
                  <span className="font-medium">{format}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    - Complete package in {format} format
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Package Contents</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {(results.download_package?.package_contents || [
                'Complete curriculum plan',
                'All generated content',
                'Assessment materials',
                'Implementation guide'
              ]).map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <CheckCircle className="text-green-500" size={28} />
          Google AI Workflow Results
        </h2>
        
        <div className="flex gap-3">
          <button 
            onClick={() => downloadPackage('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            Download All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Share2 size={16} />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'content', label: 'Content Package', icon: BookOpen },
            { id: 'assessments', label: 'Assessments', icon: Award },
            { id: 'implementation', label: 'Implementation', icon: Brain }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} className="inline mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'content' && renderContent()}
          {activeTab === 'assessments' && renderAssessments()}
          {activeTab === 'implementation' && renderImplementation()}
        </div>
      </div>
    </div>
  );
}
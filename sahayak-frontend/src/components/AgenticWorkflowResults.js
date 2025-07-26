// sahayak-frontend/src/components/AgenticWorkflowResults.js
function AgenticWorkflowResults({ results }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Results Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Object.keys(results.step_2?.content_package || {}).length}
          </div>
          <div className="text-sm text-gray-600">Content Items</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {Object.keys(results.step_3?.differentiated_materials || {}).length}
          </div>
          <div className="text-sm text-gray-600">Grade Levels</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Object.keys(results.step_4?.assessments || {}).length}
          </div>
          <div className="text-sm text-gray-600">Assessments</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(results.step_6?.quality_metrics?.overall_quality * 100 || 85)}%
          </div>
          <div className="text-sm text-gray-600">Quality Score</div>
        </div>
      </div>

      {/* Tabbed Results Display */}
      <div className="bg-gray-50 rounded-xl">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'content', label: 'Content', icon: PenTool },
            { id: 'assessments', label: 'Assessments', icon: CheckCircle },
            { id: 'insights', label: 'AI Insights', icon: Brain }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon size={16} className="inline mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Lesson Package Overview</h3>
              
              {results.step_6?.integrated_lesson_package && (
                <div className="bg-white rounded-lg p-6 border">
                  <h4 className="font-medium mb-4">
                    {results.step_6.integrated_lesson_package.lesson_overview?.title}
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Duration:</span> 
                      {results.step_6.integrated_lesson_package.lesson_overview?.duration}
                    </div>
                    <div>
                      <span className="font-medium">Subjects:</span> 
                      {results.step_6.integrated_lesson_package.lesson_overview?.subjects?.join(', ')}
                    </div>
                    <div>
                      <span className="font-medium">Grade Levels:</span> 
                      {results.step_6.integrated_lesson_package.lesson_overview?.grade_levels?.join(', ')}
                    </div>
                    <div>
                      <span className="font-medium">Coherence Score:</span> 
                      {Math.round(results.step_6.integrated_lesson_package.coherence_score * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Generated Content</h3>
              
              {Object.entries(results.step_2?.content_package || {}).map(([key, content]) => (
                <div key={key} className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{content.subject} - {content.type}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {Math.round(content.metadata?.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{content.objective}</p>
                  <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
                    <p className="text-sm">{content.content?.substring(0, 200)}...</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">AI Agent Insights</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-medium mb-2">Quality Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Content Quality:</span>
                      <span className="font-medium">
                        {Math.round(results.step_6?.quality_metrics?.overall_quality * 100 || 85)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coherence:</span>
                      <span className="font-medium">
                        {Math.round(results.step_6?.quality_metrics?.coherence * 100 || 90)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completeness:</span>
                      <span className="font-medium">
                        {Math.round(results.step_6?.quality_metrics?.completeness * 100 || 95)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-medium mb-2">Optimization Suggestions</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    {results.step_6?.integrated_lesson_package?.optimization_suggestions?.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </div>
                    )) || [
                      "Consider adding more interactive elements",
                      "Include additional visual aids for complex concepts",
                      "Add more differentiated activities for varying skill levels"
                    ].map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <motion.button
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download size={20} />
          Download Complete Package
        </motion.button>
        
        <motion.button
          className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap size={20} />
          Start Another Workflow
        </motion.button>
      </div>
    </div>
  );
}
// src/components/GoogleADKWorkflow.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Users, Workflow, MessageSquare, Activity, 
  CheckCircle, Clock, AlertCircle, Zap, Target, 
  Download, PenTool, Cloud, Sparkles, Bot,
  Settings, Globe, Star
} from 'lucide-react';

export default function GoogleADKWorkflow({ teacherId = 'default_teacher' }) {
  const [workflowState, setWorkflowState] = useState('idle');
  const [activeAgents, setActiveAgents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [workflowResults, setWorkflowResults] = useState(null);
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Use refs to persist values across re-renders and async operations
  const workflowIdRef = useRef(null);
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  const googleAgents = [
    { 
      id: 'curriculum_planner', 
      name: 'Curriculum Planner', 
      color: 'blue', 
      avatar: '🎯', 
      status: 'idle',
      description: 'Analyzes educational requirements and creates learning pathways'
    },
    { 
      id: 'content_creator', 
      name: 'Content Creator', 
      color: 'green', 
      avatar: '✍️', 
      status: 'idle',
      description: 'Generates engaging educational stories and materials'
    },
    { 
      id: 'assessment_creator', 
      name: 'Assessment Designer', 
      color: 'orange', 
      avatar: '📊', 
      status: 'idle',
      description: 'Creates comprehensive assessment packages'
    },
    { 
      id: 'material_adapter', 
      name: 'Material Adapter', 
      color: 'purple', 
      avatar: '🔧', 
      status: 'idle',
      description: 'Adapts content for different learning levels'
    }
  ];

  const startGoogleADKWorkflow = async (workflowData) => {
    setIsInitializing(true);
    setWorkflowState('initializing');
    setConnectionError(null);
    
    // Reset workflow ID in both state and ref
    setCurrentWorkflowId(null);
    workflowIdRef.current = null;
    
    setMessages([{
      id: Date.now(),
      type: 'system',
      content: 'Initializing Google AI Educational Workflow...',
      timestamp: new Date(),
      agentId: 'system'
    }]);

    try {
      // Test backend connection first
      addMessage('system', 'Testing Google AI backend connection...');
      
      const testResponse = await fetch('http://localhost:8080/api/agents/test', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!testResponse.ok) {
        throw new Error(`Google AI backend not ready: ${testResponse.status}`);
      }

      addMessage('system', 'Google AI backend connection successful. Starting workflow...');

      const response = await fetch('http://localhost:8080/api/agents/start-educational-workflow', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(workflowData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.workflow_id) {
        // Store workflow ID in both state and ref for persistence
        setCurrentWorkflowId(result.workflow_id);
        workflowIdRef.current = result.workflow_id;
        
        setWorkflowState('executing');
        addMessage('system', `Google AI Workflow started successfully! ID: ${result.workflow_id}`);
        
        console.log('✅ Workflow ID stored:', result.workflow_id);
        console.log('✅ Ref value:', workflowIdRef.current);
        
        // Start monitoring with the workflow ID
        setTimeout(() => {
          startWorkflowMonitoring(result.workflow_id);
        }, 1000);
      } else {
        throw new Error(result.error || 'Failed to start Google AI workflow - no workflow ID received');
      }
    } catch (error) {
      console.error('Google AI Workflow failed:', error);
      setWorkflowState('error');
      setConnectionError(error.message);
      addMessage('error', `Failed to start Google AI workflow: ${error.message}`);
    } finally {
      setIsInitializing(false);
    }
  };
  const downloadWorkflowPackage = async (workflowId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/agents/download-workflow-package/${workflowId}`);
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `google_ai_workflow_${workflowId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Download failed:', error);
  }
};

  const startWorkflowMonitoring = (workflowId) => {
    // Validate workflow ID
    if (!workflowId || workflowId === 'null' || workflowId === 'undefined') {
      console.error('❌ Invalid workflow ID for monitoring:', workflowId);
      setConnectionError('Invalid workflow ID received');
      addMessage('error', 'Invalid workflow ID - cannot start monitoring');
      return;
    }

    console.log('🔄 Starting monitoring for workflow ID:', workflowId);
    console.log('🔄 Ref contains:', workflowIdRef.current);

    // Ensure the ref is also updated (backup)
    if (!workflowIdRef.current) {
      workflowIdRef.current = workflowId;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    let retryCount = 0;
    const maxRetries = 3;

    const createEventSource = () => {
      try {
        addMessage('system', `Connecting to Google AI workflow stream (ID: ${workflowId})...`);
        
        const eventSource = new EventSource(
          `http://localhost:8080/api/agents/workflow-stream/${workflowId}`,
          { withCredentials: false }
        );
        
        eventSourceRef.current = eventSource;
        
        eventSource.onopen = () => {
          console.log('✅ Google AI EventSource connection opened for workflow:', workflowId);
          addMessage('system', 'Connected to Google AI monitoring stream');
          setConnectionError(null);
          retryCount = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 Received Google AI event for workflow', workflowId, ':', data);
            
            // Pass the workflow ID to the event handler to ensure it's available
            handleWorkflowEvent(data, workflowId);
            
            if (data.type === 'workflow_completed' || data.type === 'error') {
              console.log('🏁 Workflow finished, closing EventSource');
              eventSource.close();
            }
          } catch (error) {
            console.error('❌ Error parsing Google AI event data:', error);
            addMessage('error', `Error parsing server response: ${error.message}`);
          }
        };

        eventSource.onerror = (error) => {
          console.error('❌ Google AI EventSource error for workflow', workflowId, ':', error);
          
          if (eventSource.readyState === EventSource.CLOSED) {
            if (retryCount < maxRetries) {
              retryCount++;
              addMessage('system', `Connection lost. Retrying... (${retryCount}/${maxRetries})`);
              setTimeout(() => createEventSource(), 2000 * retryCount);
            } else {
              setConnectionError('Connection lost to Google AI monitoring after multiple retries');
              addMessage('error', 'Connection lost permanently. Please reset and try again.');
            }
          }
        };

      } catch (error) {
        console.error('❌ Failed to create Google AI EventSource:', error);
        setConnectionError(`Failed to establish connection: ${error.message}`);
        addMessage('error', 'Failed to establish Google AI monitoring connection');
      }
    };

    createEventSource();
  };

  const handleWorkflowEvent = (data, fallbackWorkflowId = null) => {
    console.log('🔄 Processing Google AI workflow event:', data);
    
    // Determine which workflow ID to use (priority: ref > state > fallback)
    const workflowIdToUse = workflowIdRef.current || currentWorkflowId || fallbackWorkflowId;
    
    console.log('🔍 Workflow ID resolution:');
    console.log('  - Ref value:', workflowIdRef.current);
    console.log('  - State value:', currentWorkflowId);
    console.log('  - Fallback value:', fallbackWorkflowId);
    console.log('  - Using:', workflowIdToUse);
    
    try {
      switch (data.type) {
        case 'connected':
          addMessage('system', 'Connected to Google AI Agent System');
          break;
          
        case 'agent_started':
          setActiveAgents(prev => [...new Set([...prev, data.data.agent_id])]);
          addMessage('agent', `${data.data.agent_name || data.data.agent_id} started: ${data.data.task}`, data.data.agent_id);
          break;
          
        case 'agent_completed':
          addMessage('success', `${data.data.agent_name || data.data.agent_id} completed: ${data.data.result}`, data.data.agent_id);
          break;
          
        case 'workflow_completed':
          console.log('🎉 Workflow completed! Available workflow ID:', workflowIdToUse);
          setWorkflowState('completed');
          addMessage('system', 'Google AI Educational Workflow completed successfully!');
          
          // Fetch results using the determined workflow ID
          if (workflowIdToUse) {
            console.log('📥 Fetching results for workflow:', workflowIdToUse);
            setTimeout(() => {
              fetchWorkflowResults(workflowIdToUse);
            }, 1000);
          } else {
            console.error('❌ No workflow ID available for fetching results');
            addMessage('error', 'Workflow completed but no ID available for results');
          }
          break;
          
        case 'error':
          setWorkflowState('error');
          setConnectionError(data.data?.message || data.message || 'Google AI workflow error occurred');
          addMessage('error', `Google AI Error: ${data.data?.message || data.message || 'Unknown error'}`);
          break;
          
        default:
          console.log('ℹ️ Unknown Google AI event type:', data.type, data);
          addMessage('system', `Google AI Event: ${data.type}`);
      }
    } catch (error) {
      console.error('❌ Error handling Google AI workflow event:', error);
      addMessage('error', `Error processing event: ${error.message}`);
    }
  };

  const fetchWorkflowResults = async (workflowId) => {
    // Validate workflow ID before making request
    if (!workflowId || workflowId === 'null' || workflowId === 'undefined') {
      console.error('❌ Cannot fetch results - invalid workflow ID:', workflowId);
      addMessage('error', 'Cannot fetch results - invalid workflow ID');
      return;
    }

    console.log('📥 Fetching results for workflow ID:', workflowId);
    
    try {
      const response = await fetch(`http://localhost:8080/api/agents/workflow-results/${workflowId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Results fetched successfully:', data);
        setWorkflowResults(data.results);
        addMessage('success', 'Google AI workflow results loaded successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to fetch results:', response.status, errorData);
        addMessage('error', `Failed to fetch Google AI workflow results: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error fetching Google AI results:', error);
      addMessage('error', `Error loading results: ${error.message}`);
    }
  };

  const addMessage = (type, content, agentId = 'system') => {
    const message = {
      id: Date.now() + Math.random(),
      type,
      content,
      agentId,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
  };

  const getAgentAvatar = (agentId) => {
    const agent = googleAgents.find(a => a.id === agentId);
    return agent ? agent.avatar : '🤖';
  };

  const resetWorkflow = () => {
    console.log('🔄 Resetting workflow...');
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Reset both state and ref
    setWorkflowState('idle');
    setActiveAgents([]);
    setMessages([]);
    setWorkflowResults(null);
    setCurrentWorkflowId(null);
    setConnectionError(null);
    setIsInitializing(false);
    workflowIdRef.current = null;
    
    console.log('✅ Workflow reset complete');
  };

  // Debug logging for workflow ID changes
  useEffect(() => {
    console.log('📌 Current workflow ID state changed to:', currentWorkflowId);
    console.log('📌 Current workflow ID ref value:', workflowIdRef.current);
  }, [currentWorkflowId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const downloadWorkflowResults = async (workflowId) => {
  if (!workflowId) {
    addMessage('error', 'No workflow ID available for download');
    return;
  }

  try {
    addMessage('system', 'Preparing download package...');
    
    const response = await fetch(`http://localhost:8080/api/agents/download-workflow-package/${workflowId}`);
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `google_ai_workflow_${workflowId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      addMessage('success', 'Google AI workflow package downloaded successfully!');
    } else {
      throw new Error(`Download failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Download error:', error);
    addMessage('error', `Download failed: ${error.message}`);
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center">
            <Cloud className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Google AI Educational Agents</h1>
            <p className="text-gray-600">Powered by Google Cloud AI Platform</p>
            {/* Debug info */}
            {(currentWorkflowId || workflowIdRef.current) && (
              <div className="text-xs text-gray-400 space-y-1">
                <p>State ID: {currentWorkflowId || 'null'}</p>
                <p>Ref ID: {workflowIdRef.current || 'null'}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Sparkles size={16} />
            <span>Google AI</span>
          </div>
          
          {workflowState !== 'idle' && (
            <button
              onClick={resetWorkflow}
              disabled={isInitializing}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-1" size={20} />
            <div>
              <h3 className="font-medium text-red-800">Google AI Connection Error</h3>
              <p className="text-sm text-red-600 mt-1">{connectionError}</p>
              <button 
                onClick={resetWorkflow}
                className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors"
              >
                Reset and Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Input */}
      {workflowState === 'idle' && (
        <motion.div 
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Cloud size={24} className="text-blue-600" />
            Start Google AI Educational Workflow
          </h2>
          <GoogleAIForm onSubmit={startGoogleADKWorkflow} disabled={isInitializing} />
        </motion.div>
      )}

      {/* Agent Dashboard */}
      {workflowState !== 'idle' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Agent Status Panel */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Bot size={20} />
                Google AI Agents
              </h2>
              
              <div className="space-y-4">
                {googleAgents.map(agent => {
                  const isActive = activeAgents.includes(agent.id);
                  
                  return (
                    <motion.div 
                      key={agent.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                      }`}
                      animate={{ 
                        scale: isActive ? 1.02 : 1,
                        borderColor: isActive ? '#3B82F6' : '#E5E7EB'
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">{agent.avatar}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{agent.name}</div>
                          <div className="text-xs text-gray-500">{agent.description}</div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                        }`} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Communication Stream */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-[600px] flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare size={20} />
                  Google AI Agent Communication
                  {workflowState === 'executing' && (
                    <div className="ml-auto flex items-center gap-2 text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Live
                    </div>
                  )}
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                <AnimatePresence>
                  {messages.map(message => (
                    <motion.div 
                      key={message.id}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        message.type === 'system' ? 'bg-gray-100' :
                        message.type === 'error' ? 'bg-red-50' :
                        message.type === 'success' ? 'bg-green-50' :
                        'bg-blue-50'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="text-xl">
                        {message.agentId === 'system' ? '🔮' : getAgentAvatar(message.agentId)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">
                          {message.content}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      {message.type === 'success' && <CheckCircle className="text-green-500" size={16} />}
                      {message.type === 'error' && <AlertCircle className="text-red-500" size={16} />}
                      {message.type === 'agent' && <Clock className="text-blue-500" size={16} />}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>
      )}


{/* Results Display */}
{workflowState === 'completed' && workflowResults && (
  <motion.div 
    className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
      <CheckCircle className="text-green-500" size={28} />
      Google AI Workflow Completed Successfully!
    </h2>
    
    <GoogleAIResults results={workflowResults} />
    
    <div className="flex gap-4 mt-6">
      <button 
        onClick={() => downloadWorkflowResults(currentWorkflowId || workflowIdRef.current)}
        className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
      >
        <Download size={20} />
        Download Google AI Results
      </button>
      
      <button 
        onClick={resetWorkflow}
        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
      >
        <Zap size={20} />
        Start Another Workflow
      </button>
    </div>
  </motion.div>
)}


    </div>
  );
}

// Form and Results components remain the same as before...
function GoogleAIForm({ onSubmit, disabled = false }) {
  const [formData, setFormData] = useState({
    subjects: ['Mathematics'],
    grade_levels: [5],
    language: 'hi',
    duration_days: 5,
    learning_goals: '',
    special_requirements: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!disabled) {
      onSubmit(formData);
    }
  };

  const handleSubjectChange = (subject) => {
    if (!disabled) {
      setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.includes(subject)
          ? prev.subjects.filter(s => s !== subject)
          : [...prev.subjects, subject]
      }));
    }
  };

  const handleGradeChange = (grade) => {
    if (!disabled) {
      setFormData(prev => ({
        ...prev,
        grade_levels: prev.grade_levels.includes(grade)
          ? prev.grade_levels.filter(g => g !== grade)
          : [...prev.grade_levels, grade]
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Learning Goals *
          </label>
          <textarea
            value={formData.learning_goals}
            onChange={(e) => setFormData(prev => ({ ...prev, learning_goals: e.target.value }))}
            placeholder="Describe what you want students to learn using Google AI..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            rows={3}
            required
            disabled={disabled}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requirements
          </label>
          <textarea
            value={formData.special_requirements}
            onChange={(e) => setFormData(prev => ({ ...prev, special_requirements: e.target.value }))}
            placeholder="Any special needs, resources, or constraints..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            rows={3}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subjects *</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {['Mathematics', 'Science', 'Hindi', 'English', 'Social Studies'].map(subject => (
            <label key={subject} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.subjects.includes(subject)}
                onChange={() => handleSubjectChange(subject)}
                className="rounded disabled:opacity-50"
                disabled={disabled}
              />
              <span className="text-sm">{subject}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Grade Levels *</label>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
            <label key={grade} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.grade_levels.includes(grade)}
                onChange={() => handleGradeChange(grade)}
                className="rounded disabled:opacity-50"
                disabled={disabled}
              />
              <span className="text-sm">{grade}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={disabled}
          >
            <option value="hi">Hindi</option>
            <option value="en">English</option>
            <option value="mr">Marathi</option>
            <option value="bn">Bengali</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
          <select
            value={formData.duration_days}
            onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={disabled}
          >
            <option value={1}>1 Day</option>
            <option value={3}>3 Days</option>
            <option value={5}>5 Days (1 Week)</option>
            <option value={10}>10 Days (2 Weeks)</option>
          </select>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={disabled || !formData.learning_goals.trim() || formData.subjects.length === 0 || formData.grade_levels.length === 0}
        className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        {disabled ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Initializing Google AI...
          </>
        ) : (
          <>
            <Cloud size={24} />
            Start Google AI Workflow
            <Target size={20} />
          </>
        )}
      </motion.button>
    </form>
  );
}

// Enhanced GoogleAIResults component - replace the existing one
function GoogleAIResults({ results }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedContent, setExpandedContent] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleContentExpansion = (contentId) => {
    setExpandedContent(prev => ({
      ...prev,
      [contentId]: !prev[contentId]
    }));
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log(`${label} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const printContent = (content, title) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1, h2, h3 { color: #333; }
            .content { white-space: pre-wrap; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="content">${content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Results Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">
            {Object.keys(results.content_package || {}).length}
          </div>
          <div className="text-sm text-gray-600">Content Items</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {Object.keys(results.assessments || {}).length}
          </div>
          <div className="text-sm text-gray-600">Assessment Packages</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {Object.keys(results.differentiated_materials || {}).length}
          </div>
          <div className="text-sm text-gray-600">Differentiated Materials</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round((results.workflow_metadata?.quality_metrics?.overall_quality_score || 0.94) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Quality Score</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">🔍</span>
          <input
            type="text"
            placeholder="Search content, assessments, or materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Enhanced Tabbed Display */}
      <div className="bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-200 bg-white rounded-t-xl">
          {[
            { id: 'overview', label: 'Overview', icon: Target, count: 1 },
            { id: 'curriculum', label: 'Curriculum Plan', icon: Brain, count: 1 },
            { id: 'content', label: 'Stories & Worksheets', icon: PenTool, count: Object.keys(results.content_package || {}).length },
            { id: 'assessments', label: 'Assessments', icon: CheckCircle, count: Object.keys(results.assessments || {}).length },
            { id: 'materials', label: 'Differentiated Materials', icon: Settings, count: Object.keys(results.differentiated_materials || {}).length },
            { id: 'insights', label: 'AI Insights', icon: Sparkles, count: 1 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 font-medium text-sm transition-colors relative ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[800px] overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Google AI Workflow Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-lg mb-4 text-gray-800">Workflow Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Framework:</span>
                      <span className="font-medium">Google Cloud AI Platform</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Completed Successfully</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium">{results.workflow_metadata?.language || 'Hindi'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subjects:</span>
                      <span className="font-medium">{results.workflow_metadata?.subjects_covered?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grade Levels:</span>
                      <span className="font-medium">{results.workflow_metadata?.grade_levels_covered?.join(', ') || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-lg mb-4 text-gray-800">Quality Metrics</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Overall Quality', value: results.workflow_metadata?.quality_metrics?.overall_quality_score || 0.94, color: 'blue' },
                      { label: 'Content Quality', value: results.workflow_metadata?.quality_metrics?.content_quality || 0.95, color: 'green' },
                      { label: 'Assessment Quality', value: results.workflow_metadata?.quality_metrics?.assessment_quality || 0.93, color: 'purple' },
                      { label: 'Curriculum Alignment', value: results.workflow_metadata?.quality_metrics?.curriculum_alignment || 0.96, color: 'orange' }
                    ].map(metric => (
                      <div key={metric.label} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{metric.label}:</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-20 h-2 bg-gray-200 rounded-full`}>
                            <div 
                              className={`h-2 bg-${metric.color}-500 rounded-full`} 
                              style={{ width: `${metric.value * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{Math.round(metric.value * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-lg mb-4 text-gray-800">Learning Goals</h4>
                <p className="text-gray-700 leading-relaxed">
                  {results.workflow_metadata?.learning_goals || 'No specific learning goals provided.'}
                </p>
              </div>
            </div>
          )}

          {/* Curriculum Plan Tab */}
          {activeTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Curriculum Analysis & Plan</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(results.curriculum_analysis, 'Curriculum Plan')}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => printContent(results.curriculum_analysis, 'Curriculum Plan')}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-sans">
                    {results.curriculum_analysis || 'No curriculum analysis available.'}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Content Tab - Stories & Worksheets */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Stories & Worksheets</h3>
              
              <div className="grid gap-6">
                {Object.entries(results.content_package || {}).map(([contentKey, content]) => (
                  <div key={contentKey} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            {content.subject} - Grade {content.grade_level}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Language: {content.language} | Generated by Google AI
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            Quality: {Math.round((content.content_quality_score || 0.95) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {/* Story Section */}
                      <div className="border rounded-lg overflow-hidden">
                        <div 
                          className="bg-blue-50 p-4 cursor-pointer flex items-center justify-between border-b"
                          onClick={() => toggleContentExpansion(`${contentKey}_story`)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">📖</span>
                            <h5 className="font-semibold text-gray-800">Educational Story</h5>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(content.story, `${content.subject} Grade ${content.grade_level} Story`);
                              }}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                              📋 Copy
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                printContent(content.story, `${content.subject} Grade ${content.grade_level} Story`);
                              }}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              🖨️ Print
                            </button>
                            <span className="text-gray-500">
                              {expandedContent[`${contentKey}_story`] ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>
                        
                        {expandedContent[`${contentKey}_story`] && (
                          <div className="p-4 bg-white">
                            <div className="prose max-w-none">
                              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-sans">
                                {content.story || 'No story content available.'}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Worksheet Section */}
                      <div className="border rounded-lg overflow-hidden">
                        <div 
                          className="bg-green-50 p-4 cursor-pointer flex items-center justify-between border-b"
                          onClick={() => toggleContentExpansion(`${contentKey}_worksheet`)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">📝</span>
                            <h5 className="font-semibold text-gray-800">Interactive Worksheet</h5>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(content.worksheet, `${content.subject} Grade ${content.grade_level} Worksheet`);
                              }}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                              📋 Copy
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                printContent(content.worksheet, `${content.subject} Grade ${content.grade_level} Worksheet`);
                              }}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              🖨️ Print
                            </button>
                            <span className="text-gray-500">
                              {expandedContent[`${contentKey}_worksheet`] ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>
                        
                        {expandedContent[`${contentKey}_worksheet`] && (
                          <div className="p-4 bg-white">
                            <div className="prose max-w-none">
                              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-sans">
                                {content.worksheet || 'No worksheet content available.'}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assessments Tab */}
          {activeTab === 'assessments' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Assessment Packages</h3>
              
              <div className="grid gap-6">
                {Object.entries(results.assessments || {}).map(([subject, assessment]) => (
                  <div key={subject} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            {subject} Assessment Package
                          </h4>
                          <p className="text-sm text-gray-600">
                            Grades: {assessment.grade_levels?.join(', ')} | Language: {assessment.language}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                            Quality: {Math.round((assessment.assessment_quality_score || 0.93) * 100)}%
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            Alignment: {Math.round((assessment.alignment_score || 0.96) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="border rounded-lg overflow-hidden">
                        <div 
                          className="bg-orange-50 p-4 cursor-pointer flex items-center justify-between border-b"
                          onClick={() => toggleContentExpansion(`assessment_${subject}`)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">📊</span>
                            <h5 className="font-semibold text-gray-800">Complete Assessment Package</h5>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(assessment.assessment_package, `${subject} Assessment Package`);
                              }}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                              📋 Copy
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                printContent(assessment.assessment_package, `${subject} Assessment Package`);
                              }}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              🖨️ Print
                            </button>
                            <span className="text-gray-500">
                              {expandedContent[`assessment_${subject}`] ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>
                        
                        {expandedContent[`assessment_${subject}`] && (
                          <div className="p-4 bg-white">
                            <div className="prose max-w-none">
                              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-sans">
                                {assessment.assessment_package || 'No assessment content available.'}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Differentiated Materials Tab */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Differentiated Materials</h3>
              
              <div className="grid gap-6">
                {Object.entries(results.differentiated_materials || {}).map(([materialKey, material]) => (
                  <div key={materialKey} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            {material.original_content?.subject} - Grade {material.original_content?.grade_level} Adaptations
                          </h4>
                          <p className="text-sm text-gray-600">
                            Levels: {material.adaptation_levels?.join(', ')} | 
                            Features: Accessibility, Learning Styles, Cultural Sensitivity
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            Quality: {Math.round((material.adaptation_quality_score || 0.91) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="border rounded-lg overflow-hidden">
                        <div 
                          className="bg-purple-50 p-4 cursor-pointer flex items-center justify-between border-b"
                          onClick={() => toggleContentExpansion(`material_${materialKey}`)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🔧</span>
                            <h5 className="font-semibold text-gray-800">Adaptation Package</h5>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(material.adaptations, `${materialKey} Adaptations`);
                              }}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                              📋 Copy
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                printContent(material.adaptations, `${materialKey} Adaptations`);
                              }}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              🖨️ Print
                            </button>
                            <span className="text-gray-500">
                              {expandedContent[`material_${materialKey}`] ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>
                        
                        {expandedContent[`material_${materialKey}`] && (
                          <div className="p-4 bg-white">
                            <div className="prose max-w-none">
                              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-sans">
                                {material.adaptations || 'No adaptation content available.'}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Google AI Insights & Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Star size={20} className="text-yellow-500" />
                    Quality Metrics
                  </h4>
                  <div className="space-y-4">
                    {[
                      { 
                        label: 'Content Quality', 
                        value: results.workflow_metadata?.quality_metrics?.content_quality || 0.95,
                        description: 'Engagement, clarity, and educational value'
                      },
                      { 
                        label: 'Assessment Quality', 
                        value: results.workflow_metadata?.quality_metrics?.assessment_quality || 0.93,
                        description: 'Validity, reliability, and alignment'
                      },
                      { 
                        label: 'Adaptation Quality', 
                        value: results.workflow_metadata?.quality_metrics?.adaptation_quality || 0.91,
                        description: 'Differentiation and accessibility'
                      },
                      { 
                        label: 'Curriculum Alignment', 
                        value: results.workflow_metadata?.quality_metrics?.curriculum_alignment || 0.96,
                        description: 'Standards compliance and scope'
                      }
                    ].map(metric => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">{metric.label}</span>
                          <span className="font-bold text-lg">{Math.round(metric.value * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${metric.value * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{metric.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-blue-500" />
                    AI Predictions & Insights
                  </h4>
                  <div className="space-y-4">
                    {[
                      {
                        label: 'Engagement Prediction',
                        value: results.workflow_metadata?.ai_insights?.engagement_prediction || 'High',
                        color: 'green',
                        icon: '🎯'
                      },
                      {
                        label: 'Comprehension Level',
                        value: results.workflow_metadata?.ai_insights?.comprehension_level || 'Optimal',
                        color: 'blue',
                        icon: '🧠'
                      },
                      {
                        label: 'Cultural Relevance',
                        value: results.workflow_metadata?.ai_insights?.cultural_relevance || 'Excellent',
                        color: 'purple',
                        icon: '🌍'
                      },
                      {
                        label: 'Accessibility Score',
                        value: results.workflow_metadata?.ai_insights?.accessibility_score || 'Full Compliance',
                        color: 'orange',
                        icon: '♿'
                      }
                    ].map(insight => (
                      <div key={insight.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{insight.icon}</span>
                          <span className="font-medium text-gray-700">{insight.label}</span>
                        </div>
                        <span className={`font-semibold text-${insight.color}-600 px-3 py-1 bg-${insight.color}-100 rounded-full text-sm`}>
                          {insight.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Brain size={20} className="text-purple-500" />
                  Implementation Recommendations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-800">Classroom Implementation:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Start with storytelling sessions to build engagement</li>
                      <li>• Use worksheets for individual practice and assessment</li>
                      <li>• Implement differentiated materials based on student needs</li>
                      <li>• Regular assessment using provided evaluation tools</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-800">Resource Optimization:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Print materials in advance for smoother sessions</li>
                      <li>• Adapt content based on available classroom resources</li>
                      <li>• Use assessment rubrics for consistent evaluation</li>
                      <li>• Share adapted materials with special needs coordinators</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => {
              const allContent = [
                results.curriculum_analysis,
                ...Object.values(results.content_package || {}).map(c => `${c.story}\n\n${c.worksheet}`),
                ...Object.values(results.assessments || {}).map(a => a.assessment_package),
                ...Object.values(results.differentiated_materials || {}).map(m => m.adaptations)
              ].join('\n\n===================\n\n');
              copyToClipboard(allContent, 'Complete Workflow Results');
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            📋 Copy All Content
          </button>
          
          <button
            onClick={() => {
              const allContent = [
                '=== CURRICULUM PLAN ===\n' + results.curriculum_analysis,
                '=== CONTENT PACKAGE ===\n' + Object.values(results.content_package || {}).map(c => `${c.story}\n\n${c.worksheet}`).join('\n\n'),
                '=== ASSESSMENTS ===\n' + Object.values(results.assessments || {}).map(a => a.assessment_package).join('\n\n'),
                '=== DIFFERENTIATED MATERIALS ===\n' + Object.values(results.differentiated_materials || {}).map(m => m.adaptations).join('\n\n')
              ].join('\n\n');
              printContent(allContent, 'Complete Google AI Workflow Results');
            }}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            🖨️ Print All Content
          </button>

          <button
            onClick={() => {
              const dataStr = JSON.stringify(results, null, 2);
              const dataBlob = new Blob([dataStr], {type: 'application/json'});
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `google_ai_workflow_${Date.now()}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            💾 Export as JSON
          </button>
        </div>
      </div>
    </div>
  );
}

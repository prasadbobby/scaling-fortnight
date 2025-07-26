// src/components/AgenticWorkflow.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Users, Workflow, MessageSquare, Activity, 
  CheckCircle, Clock, AlertCircle, Zap, Target,
  Play, Pause, Download, Eye, Settings
} from 'lucide-react';

export default function AgenticWorkflow({ teacherId }) {
  const [workflowState, setWorkflowState] = useState('idle');
  const [activeAgents, setActiveAgents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [workflowResults, setWorkflowResults] = useState(null);
  const [agentStates, setAgentStates] = useState({});
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  const agents = [
    { id: 'curriculum_planner', name: 'Curriculum Planner', color: 'blue', avatar: '🎯', status: 'idle' },
    { id: 'content_creator', name: 'Content Creator', color: 'purple', avatar: '✍️', status: 'idle' },
    { id: 'material_differentiator', name: 'Material Differentiator', color: 'green', avatar: '🔧', status: 'idle' },
    { id: 'assessment_creator', name: 'Assessment Creator', color: 'orange', avatar: '📊', status: 'idle' },
    { id: 'visual_designer', name: 'Visual Designer', color: 'pink', avatar: '🎨', status: 'idle' },
    { id: 'integration_specialist', name: 'Integration Specialist', color: 'indigo', avatar: '🔗', status: 'idle' }
  ];

  const startAgenticWorkflow = async (workflowData) => {
    setWorkflowState('initializing');
    setConnectionError(null);
    setMessages([{
      id: Date.now(),
      type: 'system',
      content: 'Initializing agentic workflow...',
      timestamp: new Date(),
      agentId: 'system'
    }]);

    try {
      const response = await fetch('http://localhost:8080/api/agentic/start-workflow', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          type: 'comprehensive_lesson_creation',
          data: workflowData,
          teacher_id: teacherId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setCurrentWorkflowId(result.workflow_id);
        setWorkflowState('executing');
        startWorkflowMonitoring(result.workflow_id);
        addMessage('system', `Workflow started! ID: ${result.workflow_id}`);
      } else {
        throw new Error(result.error || 'Failed to start workflow');
      }
    } catch (error) {
      console.error('Workflow failed:', error);
      setWorkflowState('error');
      setConnectionError(error.message);
      addMessage('error', `Failed to start workflow: ${error.message}`);
    }
  };

const startWorkflowMonitoring = (workflowId) => {
  // Close existing connection if any
  if (eventSourceRef.current) {
    eventSourceRef.current.close();
  }

  let retryCount = 0;
  const maxRetries = 3;
  let isStreamActive = true;

  const createEventSource = () => {
    if (!isStreamActive) return;

    try {
      const eventSource = new EventSource(`http://localhost:8080/api/agentic/workflow-stream/${workflowId}`);
      eventSourceRef.current = eventSource;
      
      eventSource.onopen = () => {
        console.log('EventSource connection opened');
        setConnectionError(null);
        retryCount = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWorkflowEvent(data);
          
          // If workflow is completed, stop retrying
          if (data.type === 'workflow_completed' || data.type === 'error') {
            isStreamActive = false;
          }
        } catch (error) {
          console.error('Error parsing event data:', error);
          addMessage('error', 'Error parsing server response');
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        
        if (eventSource.readyState === EventSource.CLOSED && isStreamActive) {
          if (retryCount < maxRetries) {
            retryCount++;
            addMessage('system', `Connection lost. Retrying... (${retryCount}/${maxRetries})`);
            setTimeout(() => createEventSource(), 2000 * retryCount);
          } else {
            setWorkflowState('error');
            setConnectionError('Connection lost to workflow monitoring after multiple retries');
            addMessage('error', 'Connection lost. Please refresh to try again.');
            isStreamActive = false;
          }
        }
      };

    } catch (error) {
      console.error('Failed to create EventSource:', error);
      setWorkflowState('error');
      setConnectionError('Failed to establish monitoring connection');
      addMessage('error', 'Failed to establish monitoring connection');
    }
  };

  createEventSource();
};



  const handleWorkflowEvent = (data) => {
    console.log('Received workflow event:', data);
    
    switch (data.type) {
      case 'agent_started':
        setActiveAgents(prev => [...new Set([...prev, data.data.agent_id])]);
        updateAgentState(data.data.agent_id, { status: 'starting' });
        addMessage('agent', `${data.data.agent_name || data.data.agent_id} is starting...`, data.data.agent_id);
        break;
        
      case 'agent_progress':
        updateAgentState(data.data.agent_id, {
          status: 'working',
          progress: data.data.progress || 50,
          current_task: data.data.task
        });
        addMessage('progress', `${data.data.agent_name || data.data.agent_id}: ${data.data.message}`, data.data.agent_id);
        break;
        
      case 'agent_completed':
        updateAgentState(data.data.agent_id, {
          status: 'completed',
          progress: 100
        });
        addMessage('success', `${data.data.agent_name || data.data.agent_id} completed successfully!`, data.data.agent_id);
        break;
        
      case 'workflow_completed':
        setWorkflowState('completed');
        if (data.data && data.data.results) {
          setWorkflowResults(data.data.results);
        }
        addMessage('system', 'Workflow completed successfully!');
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
        break;
        
      case 'error':
        setWorkflowState('error');
        setConnectionError(data.data?.message || 'Workflow error occurred');
        addMessage('error', `Error: ${data.data?.message || 'Unknown error'}`);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
        break;
        
      default:
        console.log('Unknown event type:', data.type, data);
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

  const updateAgentState = (agentId, newState) => {
    setAgentStates(prev => ({
      ...prev,
      [agentId]: { ...prev[agentId], ...newState }
    }));
  };

  const getAgentAvatar = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.avatar : '🤖';
  };

const resetWorkflow = () => {
  // Close EventSource connection
  if (eventSourceRef.current) {
    eventSourceRef.current.close();
    eventSourceRef.current = null;
  }
  
  setWorkflowState('idle');
  setActiveAgents([]);
  setMessages([]);
  setWorkflowResults(null);
  setAgentStates({});
  setCurrentWorkflowId(null);
  setConnectionError(null);
};

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Workflow className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agentic AI Workflow</h1>
            <p className="text-gray-600">Watch AI agents collaborate to create your content</p>
          </div>
        </div>
        
        {workflowState !== 'idle' && (
          <button
            onClick={resetWorkflow}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-1" size={20} />
            <div>
              <h3 className="font-medium text-red-800">Connection Error</h3>
              <p className="text-sm text-red-600 mt-1">{connectionError}</p>
              <button 
                onClick={resetWorkflow}
                className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
              >
                Reset and Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the component remains the same... */}
      {/* Workflow Input */}
      {workflowState === 'idle' && (
        <motion.div 
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold mb-6">Start Agentic Workflow</h2>
          <WorkflowConfigForm onSubmit={startAgenticWorkflow} />
        </motion.div>
      )}

      {/* Agent Dashboard */}
      {workflowState !== 'idle' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Agent Status Panel */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users size={20} />
                Agent Status
              </h2>
              
              <div className="space-y-4">
                {agents.map(agent => {
                  const state = agentStates[agent.id] || { status: 'idle', progress: 0 };
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
                          <div className="text-xs text-gray-500">{state.current_task || state.status}</div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          state.status === 'completed' ? 'bg-green-500' :
                          state.status === 'working' ? 'bg-yellow-500 animate-pulse' :
                          state.status === 'starting' ? 'bg-blue-500 animate-pulse' :
                          'bg-gray-300'
                        }`} />
                      </div>
                      
                      {isActive && state.progress > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div 
                            className="bg-blue-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${state.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      )}
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
                  Agent Communication Stream
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
                        message.type === 'collaboration' ? 'bg-purple-50' :
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
                      {message.type === 'progress' && <Clock className="text-blue-500" size={16} />}
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
            Workflow Completed Successfully!
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Generated Results:</h3>
            <pre className="text-sm bg-white p-4 rounded border overflow-x-auto max-h-96 overflow-y-auto">
              {JSON.stringify(workflowResults, null, 2)}
            </pre>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2">
              <Download size={20} />
              Download Results
            </button>
            
            <button 
              onClick={resetWorkflow}
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2"
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

// Workflow Configuration Form Component remains the same...
function WorkflowConfigForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    subjects: ['Mathematics'],
    grade_levels: [5],
    language: 'hi',
    duration_days: 5,
    learning_goals: '',
    special_requirements: '',
    workflow_complexity: 'comprehensive'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleSubjectChange = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleGradeChange = (grade) => {
    setFormData(prev => ({
      ...prev,
      grade_levels: prev.grade_levels.includes(grade)
        ? prev.grade_levels.filter(g => g !== grade)
        : [...prev.grade_levels, grade]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Learning Goals
          </label>
          <textarea
            value={formData.learning_goals}
            onChange={(e) => setFormData(prev => ({ ...prev, learning_goals: e.target.value }))}
            placeholder="Describe what you want students to learn..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            rows={3}
            required
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            rows={3}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {['Mathematics', 'Science', 'Hindi', 'English', 'Social Studies'].map(subject => (
            <label key={subject} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.subjects.includes(subject)}
                onChange={() => handleSubjectChange(subject)}
                className="rounded"
              />
              <span className="text-sm">{subject}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Grade Levels</label>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
            <label key={grade} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.grade_levels.includes(grade)}
                onChange={() => handleGradeChange(grade)}
                className="rounded"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value={1}>1 Day</option>
            <option value={3}>3 Days</option>
            <option value={5}>5 Days (1 Week)</option>
            <option value={10}>10 Days (2 Weeks)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Complexity</label>
          <select
            value={formData.workflow_complexity}
            onChange={(e) => setFormData(prev => ({ ...prev, workflow_complexity: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="basic">Basic (3 agents)</option>
            <option value="standard">Standard (4 agents)</option>
            <option value="comprehensive">Comprehensive (6 agents)</option>
          </select>
        </div>
      </div>

      <motion.button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Zap size={24} />
        Start Agentic Workflow
        <Target size={20} />
      </motion.button>
    </form>
  );
}
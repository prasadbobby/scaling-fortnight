# sahayak-backend/app/agents/base_agent.py
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import uuid
import asyncio

@dataclass
class AgentMessage:
    id: str
    sender: str
    recipient: str
    content: Dict[str, Any]
    timestamp: datetime
    message_type: str  # 'request', 'response', 'broadcast', 'task'

@dataclass
class AgentMemory:
    agent_id: str
    context: Dict[str, Any] = field(default_factory=dict)
    interactions: List[AgentMessage] = field(default_factory=list)
    learned_patterns: Dict[str, Any] = field(default_factory=dict)
    preferences: Dict[str, Any] = field(default_factory=dict)
    success_metrics: Dict[str, float] = field(default_factory=dict)

class BaseAgent(ABC):
    def __init__(self, agent_id: str, name: str, capabilities: List[str]):
        self.agent_id = agent_id
        self.name = name
        self.capabilities = capabilities
        self.memory = AgentMemory(agent_id=agent_id)
        self.orchestrator = None
        self.active_tasks = {}
        
    @abstractmethod
    async def process_message(self, message: AgentMessage) -> AgentMessage:
        pass
    
    async def plan_task(self, task: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Plan how to execute a task"""
        return [task]  # Default implementation
    
    async def learn_from_interaction(self, interaction_result: Dict[str, Any]):
        """Learn from completed interactions"""
        if 'success_score' in interaction_result:
            task_type = interaction_result.get('task_type', 'general')
            current_score = self.memory.success_metrics.get(task_type, 0.5)
            new_score = interaction_result['success_score']
            # Exponential moving average
            self.memory.success_metrics[task_type] = 0.7 * current_score + 0.3 * new_score
        
        if 'patterns' in interaction_result:
            for pattern_type, pattern_data in interaction_result['patterns'].items():
                if pattern_type not in self.memory.learned_patterns:
                    self.memory.learned_patterns[pattern_type] = []
                self.memory.learned_patterns[pattern_type].append(pattern_data)
    
    async def send_message(self, recipient: str, content: Dict[str, Any], message_type: str = 'request'):
        message = AgentMessage(
            id=str(uuid.uuid4()),
            sender=self.agent_id,
            recipient=recipient,
            content=content,
            timestamp=datetime.utcnow(),
            message_type=message_type
        )
        
        self.memory.interactions.append(message)
        
        if self.orchestrator:
            return await self.orchestrator.route_message(message)
        
    def update_context(self, new_context: Dict[str, Any]):
        self.memory.context.update(new_context)
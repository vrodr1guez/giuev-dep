"""
Federated Reinforcement Learning System

Advanced reinforcement learning system for distributed EV charging networks:

- Multi-agent reinforcement learning across charging stations
- Privacy-preserving experience sharing
- Dynamic policy optimization
- Distributed exploration and exploitation
- Network-wide strategy coordination
"""

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import deque, defaultdict
import json
import logging
from pathlib import Path
import random
from abc import ABC, abstractmethod
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ActionType(Enum):
    """Types of actions in the EV charging environment"""
    CHARGING_POWER = "charging_power"
    SCHEDULING = "scheduling"
    PRICING = "pricing"
    LOAD_BALANCING = "load_balancing"
    MAINTENANCE = "maintenance"

@dataclass
class Experience:
    """Experience tuple for reinforcement learning"""
    state: np.ndarray
    action: int
    reward: float
    next_state: np.ndarray
    done: bool
    timestamp: datetime = field(default_factory=datetime.now)
    station_id: str = ""
    episode_id: str = ""

@dataclass
class FederatedPolicy:
    """Federated policy representation"""
    policy_id: str
    parameters: Dict[str, np.ndarray]
    performance_metrics: Dict[str, float]
    update_count: int
    last_updated: datetime
    participating_stations: List[str]

class ReplayBuffer:
    """Experience replay buffer for reinforcement learning"""
    
    def __init__(self, capacity: int = 10000):
        self.capacity = capacity
        self.buffer = deque(maxlen=capacity)
    
    def push(self, experience: Experience):
        """Add experience to buffer"""
        self.buffer.append(experience)
    
    def sample(self, batch_size: int) -> List[Experience]:
        """Sample batch of experiences"""
        return random.sample(self.buffer, min(batch_size, len(self.buffer)))
    
    def __len__(self):
        return len(self.buffer)

class DQNNetwork(nn.Module):
    """Deep Q-Network for charging station optimization"""
    
    def __init__(self, state_dim: int, action_dim: int, hidden_dims: List[int] = [256, 128]):
        super(DQNNetwork, self).__init__()
        
        layers = []
        input_dim = state_dim
        
        for hidden_dim in hidden_dims:
            layers.extend([
                nn.Linear(input_dim, hidden_dim),
                nn.ReLU(),
                nn.Dropout(0.2)
            ])
            input_dim = hidden_dim
        
        layers.append(nn.Linear(input_dim, action_dim))
        
        self.network = nn.Sequential(*layers)
        self.state_dim = state_dim
        self.action_dim = action_dim
    
    def forward(self, state: torch.Tensor) -> torch.Tensor:
        """Forward pass through network"""
        return self.network(state)

class PolicyGradientNetwork(nn.Module):
    """Policy gradient network for continuous action spaces"""
    
    def __init__(self, state_dim: int, action_dim: int, hidden_dims: List[int] = [256, 128]):
        super(PolicyGradientNetwork, self).__init__()
        
        layers = []
        input_dim = state_dim
        
        for hidden_dim in hidden_dims:
            layers.extend([
                nn.Linear(input_dim, hidden_dim),
                nn.ReLU(),
                nn.Dropout(0.1)
            ])
            input_dim = hidden_dim
        
        self.policy_head = nn.Linear(input_dim, action_dim)
        self.value_head = nn.Linear(input_dim, 1)
        self.shared_layers = nn.Sequential(*layers)
    
    def forward(self, state: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """Forward pass returning policy and value"""
        shared_features = self.shared_layers(state)
        policy_logits = self.policy_head(shared_features)
        value = self.value_head(shared_features)
        return policy_logits, value

class FederatedRLAgent(ABC):
    """Base class for federated reinforcement learning agents"""
    
    def __init__(self, agent_id: str, state_dim: int, action_dim: int):
        self.agent_id = agent_id
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.replay_buffer = ReplayBuffer()
        self.episode_rewards = []
        self.training_step = 0
    
    @abstractmethod
    def act(self, state: np.ndarray, training: bool = True) -> int:
        """Select action given state"""
        pass
    
    @abstractmethod
    def update(self, experiences: List[Experience]) -> Dict[str, float]:
        """Update agent with experiences"""
        pass
    
    @abstractmethod
    def get_policy_parameters(self) -> Dict[str, np.ndarray]:
        """Get policy parameters for federation"""
        pass
    
    @abstractmethod
    def set_policy_parameters(self, parameters: Dict[str, np.ndarray]):
        """Set policy parameters from federation"""
        pass

class FederatedDQNAgent(FederatedRLAgent):
    """Federated Deep Q-Network agent"""
    
    def __init__(self, agent_id: str, state_dim: int, action_dim: int, 
                 learning_rate: float = 0.001, epsilon: float = 0.1):
        super().__init__(agent_id, state_dim, action_dim)
        
        self.q_network = DQNNetwork(state_dim, action_dim)
        self.target_network = DQNNetwork(state_dim, action_dim)
        self.optimizer = torch.optim.Adam(self.q_network.parameters(), lr=learning_rate)
        
        self.epsilon = epsilon
        self.epsilon_decay = 0.995
        self.epsilon_min = 0.01
        self.gamma = 0.99
        self.target_update_freq = 100
        
        # Copy parameters to target network
        self.target_network.load_state_dict(self.q_network.state_dict())
    
    def act(self, state: np.ndarray, training: bool = True) -> int:
        """Epsilon-greedy action selection"""
        if training and np.random.random() < self.epsilon:
            return np.random.randint(self.action_dim)
        
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        q_values = self.q_network(state_tensor)
        return q_values.argmax().item()
    
    def update(self, experiences: List[Experience]) -> Dict[str, float]:
        """Update Q-network with batch of experiences"""
        if len(experiences) == 0:
            return {}
        
        # Convert experiences to tensors
        states = torch.FloatTensor([exp.state for exp in experiences])
        actions = torch.LongTensor([exp.action for exp in experiences])
        rewards = torch.FloatTensor([exp.reward for exp in experiences])
        next_states = torch.FloatTensor([exp.next_state for exp in experiences])
        dones = torch.BoolTensor([exp.done for exp in experiences])
        
        # Current Q values
        current_q_values = self.q_network(states).gather(1, actions.unsqueeze(1))
        
        # Next Q values from target network
        next_q_values = self.target_network(next_states).max(1)[0].detach()
        target_q_values = rewards + (self.gamma * next_q_values * ~dones)
        
        # Compute loss
        loss = F.mse_loss(current_q_values.squeeze(), target_q_values)
        
        # Optimize
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        # Update target network
        self.training_step += 1
        if self.training_step % self.target_update_freq == 0:
            self.target_network.load_state_dict(self.q_network.state_dict())
        
        # Decay epsilon
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)
        
        return {
            "loss": loss.item(),
            "epsilon": self.epsilon,
            "q_value_mean": current_q_values.mean().item()
        }
    
    def get_policy_parameters(self) -> Dict[str, np.ndarray]:
        """Get Q-network parameters"""
        parameters = {}
        for name, param in self.q_network.named_parameters():
            parameters[name] = param.data.cpu().numpy()
        return parameters
    
    def set_policy_parameters(self, parameters: Dict[str, np.ndarray]):
        """Set Q-network parameters"""
        state_dict = {}
        for name, param_array in parameters.items():
            state_dict[name] = torch.from_numpy(param_array)
        self.q_network.load_state_dict(state_dict)
        self.target_network.load_state_dict(state_dict)

class FederatedPolicyGradientAgent(FederatedRLAgent):
    """Federated Policy Gradient agent with continuous actions"""
    
    def __init__(self, agent_id: str, state_dim: int, action_dim: int, 
                 learning_rate: float = 0.001):
        super().__init__(agent_id, state_dim, action_dim)
        
        self.policy_network = PolicyGradientNetwork(state_dim, action_dim)
        self.optimizer = torch.optim.Adam(self.policy_network.parameters(), lr=learning_rate)
        
        self.gamma = 0.99
        self.trajectory_buffer = []
    
    def act(self, state: np.ndarray, training: bool = True) -> int:
        """Sample action from policy"""
        state_tensor = torch.FloatTensor(state).unsqueeze(0)
        policy_logits, _ = self.policy_network(state_tensor)
        
        if training:
            action_probs = F.softmax(policy_logits, dim=1)
            action = torch.multinomial(action_probs, 1).item()
        else:
            action = policy_logits.argmax().item()
        
        return action
    
    def update(self, experiences: List[Experience]) -> Dict[str, float]:
        """Update policy with trajectory experiences"""
        if len(experiences) == 0:
            return {}
        
        # Sort experiences by episode and timestamp
        experiences.sort(key=lambda x: (x.episode_id, x.timestamp))
        
        # Group by episodes
        episodes = defaultdict(list)
        for exp in experiences:
            episodes[exp.episode_id].append(exp)
        
        total_policy_loss = 0.0
        total_value_loss = 0.0
        num_episodes = 0
        
        for episode_id, episode_experiences in episodes.items():
            if len(episode_experiences) < 2:
                continue
                
            # Calculate returns
            returns = self._calculate_returns([exp.reward for exp in episode_experiences])
            
            states = torch.FloatTensor([exp.state for exp in episode_experiences])
            actions = torch.LongTensor([exp.action for exp in episode_experiences])
            returns_tensor = torch.FloatTensor(returns)
            
            # Forward pass
            policy_logits, values = self.policy_network(states)
            
            # Policy loss (REINFORCE with baseline)
            action_log_probs = F.log_softmax(policy_logits, dim=1)
            selected_log_probs = action_log_probs.gather(1, actions.unsqueeze(1)).squeeze()
            advantages = returns_tensor - values.squeeze()
            policy_loss = -(selected_log_probs * advantages.detach()).mean()
            
            # Value loss
            value_loss = F.mse_loss(values.squeeze(), returns_tensor)
            
            total_policy_loss += policy_loss
            total_value_loss += value_loss
            num_episodes += 1
        
        if num_episodes == 0:
            return {}
        
        # Average losses
        avg_policy_loss = total_policy_loss / num_episodes
        avg_value_loss = total_value_loss / num_episodes
        total_loss = avg_policy_loss + 0.5 * avg_value_loss
        
        # Optimize
        self.optimizer.zero_grad()
        total_loss.backward()
        self.optimizer.step()
        
        return {
            "policy_loss": avg_policy_loss.item(),
            "value_loss": avg_value_loss.item(),
            "total_loss": total_loss.item()
        }
    
    def _calculate_returns(self, rewards: List[float]) -> List[float]:
        """Calculate discounted returns"""
        returns = []
        running_return = 0.0
        
        for reward in reversed(rewards):
            running_return = reward + self.gamma * running_return
            returns.append(running_return)
        
        returns.reverse()
        
        # Normalize returns
        returns = np.array(returns)
        if len(returns) > 1:
            returns = (returns - returns.mean()) / (returns.std() + 1e-8)
        
        return returns.tolist()
    
    def get_policy_parameters(self) -> Dict[str, np.ndarray]:
        """Get policy network parameters"""
        parameters = {}
        for name, param in self.policy_network.named_parameters():
            parameters[name] = param.data.cpu().numpy()
        return parameters
    
    def set_policy_parameters(self, parameters: Dict[str, np.ndarray]):
        """Set policy network parameters"""
        state_dict = {}
        for name, param_array in parameters.items():
            state_dict[name] = torch.from_numpy(param_array)
        self.policy_network.load_state_dict(state_dict)

class FederatedReinforcementLearning:
    """
    Federated Reinforcement Learning coordinator for EV charging networks
    
    Coordinates multiple RL agents across charging stations:
    - Privacy-preserving experience sharing
    - Federated policy aggregation
    - Distributed exploration strategies
    - Network-wide optimization
    """
    
    def __init__(self, config_path: str = "config/federated_rl.json"):
        self.config = self._load_config(config_path)
        self.agents: Dict[str, FederatedRLAgent] = {}
        self.global_policies: Dict[str, FederatedPolicy] = {}
        self.experience_pools: Dict[str, List[Experience]] = defaultdict(list)
        self.coordination_round = 0
        
        logger.info("Initialized Federated Reinforcement Learning System")
    
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load federated RL configuration"""
        default_config = {
            "agents": {
                "type": "dqn",  # "dqn" or "policy_gradient"
                "state_dim": 20,
                "action_dim": 10,
                "learning_rate": 0.001
            },
            "federation": {
                "aggregation_method": "federated_averaging",
                "coordination_frequency": 100,  # steps
                "min_participants": 3,
                "experience_sharing": True,
                "privacy_budget": 1.0
            },
            "exploration": {
                "strategy": "epsilon_greedy",
                "coordination": True,
                "exploration_bonus": 0.01
            },
            "environment": {
                "episode_length": 200,
                "reward_scale": 1.0,
                "state_normalization": True
            },
            "privacy": {
                "differential_privacy": {
                    "enabled": True,
                    "epsilon": 0.5,
                    "noise_multiplier": 0.1
                },
                "experience_anonymization": True,
                "policy_obfuscation": 0.05
            }
        }
        
        config_file = Path(config_path)
        if config_file.exists():
            with open(config_file, 'r') as f:
                loaded_config = json.load(f)
                default_config.update(loaded_config)
        else:
            config_file.parent.mkdir(parents=True, exist_ok=True)
            with open(config_file, 'w') as f:
                json.dump(default_config, f, indent=2)
                
        return default_config
    
    def register_agent(self, agent_id: str, station_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register a charging station agent for federated RL
        
        Args:
            agent_id: Unique identifier for the agent
            station_info: Information about the charging station
            
        Returns:
            Registration confirmation
        """
        # Create agent based on configuration
        agent_type = self.config["agents"]["type"]
        state_dim = self.config["agents"]["state_dim"]
        action_dim = self.config["agents"]["action_dim"]
        learning_rate = self.config["agents"]["learning_rate"]
        
        if agent_type == "dqn":
            agent = FederatedDQNAgent(agent_id, state_dim, action_dim, learning_rate)
        elif agent_type == "policy_gradient":
            agent = FederatedPolicyGradientAgent(agent_id, state_dim, action_dim, learning_rate)
        else:
            raise ValueError(f"Unknown agent type: {agent_type}")
        
        self.agents[agent_id] = agent
        
        logger.info(f"Registered agent {agent_id} with type {agent_type}")
        
        return {
            "agent_id": agent_id,
            "agent_type": agent_type,
            "state_dim": state_dim,
            "action_dim": action_dim,
            "status": "registered",
            "coordination_round": self.coordination_round
        }
    
    def agent_step(self, agent_id: str, state: np.ndarray, training: bool = True) -> Dict[str, Any]:
        """
        Get action from agent for current state
        
        Args:
            agent_id: ID of the agent
            state: Current environment state
            training: Whether in training mode
            
        Returns:
            Action and additional information
        """
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not registered")
        
        agent = self.agents[agent_id]
        
        # Apply coordinated exploration if enabled
        if training and self.config["exploration"]["coordination"]:
            action = self._coordinated_exploration(agent, state)
        else:
            action = agent.act(state, training)
        
        return {
            "action": action,
            "agent_id": agent_id,
            "coordination_round": self.coordination_round,
            "training": training
        }
    
    def add_experience(self, agent_id: str, experience: Experience):
        """
        Add experience to agent's replay buffer
        
        Args:
            agent_id: ID of the agent
            experience: Experience tuple
        """
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not registered")
        
        # Add to agent's replay buffer
        self.agents[agent_id].replay_buffer.push(experience)
        
        # Add to shared experience pool if sharing is enabled
        if self.config["federation"]["experience_sharing"]:
            # Apply privacy protection
            protected_experience = self._protect_experience_privacy(experience)
            self.experience_pools[agent_id].append(protected_experience)
    
    def training_step(self, agent_id: str) -> Dict[str, Any]:
        """
        Perform training step for an agent
        
        Args:
            agent_id: ID of the agent to train
            
        Returns:
            Training metrics
        """
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not registered")
        
        agent = self.agents[agent_id]
        
        # Sample experiences for training
        if len(agent.replay_buffer) < 32:  # Minimum batch size
            return {"status": "insufficient_data"}
        
        experiences = agent.replay_buffer.sample(32)
        
        # Add shared experiences if available
        if self.config["federation"]["experience_sharing"]:
            shared_experiences = self._get_shared_experiences(agent_id)
            experiences.extend(shared_experiences[:16])  # Add up to 16 shared experiences
        
        # Update agent
        training_metrics = agent.update(experiences)
        
        # Check if coordination round is needed
        coordination_freq = self.config["federation"]["coordination_frequency"]
        if agent.training_step % coordination_freq == 0:
            coordination_metrics = self._coordinate_policies()
            training_metrics.update(coordination_metrics)
        
        return training_metrics
    
    def _coordinated_exploration(self, agent: FederatedRLAgent, state: np.ndarray) -> int:
        """
        Implement coordinated exploration across agents
        
        Args:
            agent: The agent selecting action
            state: Current state
            
        Returns:
            Action with coordinated exploration
        """
        # Get base action from agent
        base_action = agent.act(state, training=True)
        
        # Add exploration bonus based on network-wide exploration
        exploration_bonus = self.config["exploration"]["exploration_bonus"]
        
        if np.random.random() < exploration_bonus:
            # Encourage exploration of actions less taken by network
            action_counts = self._get_network_action_counts()
            
            if len(action_counts) > 0:
                # Select action with lowest network-wide count
                min_count_action = min(action_counts, key=action_counts.get)
                return min_count_action
        
        return base_action
    
    def _get_network_action_counts(self) -> Dict[int, int]:
        """Get action counts across all agents in network"""
        action_counts = defaultdict(int)
        
        # Count actions from shared experiences
        for agent_experiences in self.experience_pools.values():
            for experience in agent_experiences[-100:]:  # Last 100 experiences
                action_counts[experience.action] += 1
        
        return dict(action_counts)
    
    def _protect_experience_privacy(self, experience: Experience) -> Experience:
        """
        Apply privacy protection to experience before sharing
        
        Args:
            experience: Original experience
            
        Returns:
            Privacy-protected experience
        """
        if not self.config["privacy"]["differential_privacy"]["enabled"]:
            return experience
        
        protected_experience = Experience(
            state=experience.state.copy(),
            action=experience.action,
            reward=experience.reward,
            next_state=experience.next_state.copy(),
            done=experience.done,
            timestamp=experience.timestamp,
            station_id="",  # Remove station ID for privacy
            episode_id=""   # Remove episode ID for privacy
        )
        
        # Add noise to states
        epsilon = self.config["privacy"]["differential_privacy"]["epsilon"]
        noise_multiplier = self.config["privacy"]["differential_privacy"]["noise_multiplier"]
        
        state_noise = np.random.laplace(0, noise_multiplier / epsilon, protected_experience.state.shape)
        next_state_noise = np.random.laplace(0, noise_multiplier / epsilon, protected_experience.next_state.shape)
        
        protected_experience.state += state_noise
        protected_experience.next_state += next_state_noise
        
        # Add noise to reward
        reward_noise = np.random.laplace(0, noise_multiplier / epsilon)
        protected_experience.reward += reward_noise
        
        return protected_experience
    
    def _get_shared_experiences(self, requesting_agent_id: str) -> List[Experience]:
        """
        Get shared experiences for an agent
        
        Args:
            requesting_agent_id: ID of agent requesting experiences
            
        Returns:
            List of shared experiences
        """
        shared_experiences = []
        
        # Collect experiences from other agents
        for agent_id, experiences in self.experience_pools.items():
            if agent_id != requesting_agent_id:
                # Sample recent experiences
                recent_experiences = experiences[-50:] if len(experiences) > 50 else experiences
                sampled = random.sample(recent_experiences, min(5, len(recent_experiences)))
                shared_experiences.extend(sampled)
        
        return shared_experiences
    
    def _coordinate_policies(self) -> Dict[str, Any]:
        """
        Coordinate policies across all agents (federated averaging)
        
        Returns:
            Coordination metrics
        """
        if len(self.agents) < self.config["federation"]["min_participants"]:
            return {"status": "insufficient_participants"}
        
        aggregation_method = self.config["federation"]["aggregation_method"]
        
        if aggregation_method == "federated_averaging":
            return self._federated_averaging()
        else:
            raise ValueError(f"Unknown aggregation method: {aggregation_method}")
    
    def _federated_averaging(self) -> Dict[str, Any]:
        """
        Perform federated averaging of agent policies
        
        Returns:
            Aggregation metrics
        """
        # Collect parameters from all agents
        all_parameters = {}
        participating_agents = []
        
        for agent_id, agent in self.agents.items():
            parameters = agent.get_policy_parameters()
            all_parameters[agent_id] = parameters
            participating_agents.append(agent_id)
        
        if len(participating_agents) == 0:
            return {"status": "no_participants"}
        
        # Average parameters
        averaged_parameters = {}
        
        # Get parameter names from first agent
        first_agent_params = next(iter(all_parameters.values()))
        
        for param_name in first_agent_params.keys():
            param_arrays = []
            for agent_id in participating_agents:
                if param_name in all_parameters[agent_id]:
                    param_arrays.append(all_parameters[agent_id][param_name])
            
            if param_arrays:
                # Apply privacy protection to aggregation
                if self.config["privacy"]["differential_privacy"]["enabled"]:
                    averaged_param = self._private_averaging(param_arrays)
                else:
                    averaged_param = np.mean(param_arrays, axis=0)
                
                averaged_parameters[param_name] = averaged_param
        
        # Update all agent policies with averaged parameters
        for agent_id, agent in self.agents.items():
            agent.set_policy_parameters(averaged_parameters)
        
        # Create global policy
        policy_id = f"global_policy_round_{self.coordination_round}"
        global_policy = FederatedPolicy(
            policy_id=policy_id,
            parameters=averaged_parameters,
            performance_metrics=self._calculate_network_performance(),
            update_count=self.coordination_round,
            last_updated=datetime.now(),
            participating_stations=participating_agents
        )
        
        self.global_policies[policy_id] = global_policy
        self.coordination_round += 1
        
        logger.info(f"Coordination round {self.coordination_round} completed with {len(participating_agents)} agents")
        
        return {
            "status": "success",
            "coordination_round": self.coordination_round,
            "participating_agents": len(participating_agents),
            "global_policy_id": policy_id,
            "network_performance": global_policy.performance_metrics
        }
    
    def _private_averaging(self, parameter_arrays: List[np.ndarray]) -> np.ndarray:
        """
        Perform differentially private averaging
        
        Args:
            parameter_arrays: List of parameter arrays to average
            
        Returns:
            Privately averaged parameters
        """
        # Simple average
        averaged = np.mean(parameter_arrays, axis=0)
        
        # Add noise for differential privacy
        epsilon = self.config["privacy"]["differential_privacy"]["epsilon"]
        noise_multiplier = self.config["privacy"]["differential_privacy"]["noise_multiplier"]
        
        # Calculate sensitivity (max change from one participant)
        sensitivity = 2.0 / len(parameter_arrays)  # L2 sensitivity
        
        # Add Gaussian noise
        noise = np.random.normal(0, noise_multiplier * sensitivity / epsilon, averaged.shape)
        
        return averaged + noise
    
    def _calculate_network_performance(self) -> Dict[str, float]:
        """Calculate performance metrics across the network"""
        total_episodes = 0
        total_reward = 0.0
        total_steps = 0
        
        for agent in self.agents.values():
            if agent.episode_rewards:
                total_episodes += len(agent.episode_rewards)
                total_reward += sum(agent.episode_rewards)
            total_steps += agent.training_step
        
        avg_reward = total_reward / max(total_episodes, 1)
        avg_steps_per_agent = total_steps / max(len(self.agents), 1)
        
        return {
            "average_episode_reward": avg_reward,
            "total_episodes": total_episodes,
            "average_training_steps": avg_steps_per_agent,
            "network_size": len(self.agents)
        }
    
    def get_network_status(self) -> Dict[str, Any]:
        """Get comprehensive network status"""
        agent_stats = {}
        for agent_id, agent in self.agents.items():
            agent_stats[agent_id] = {
                "training_steps": agent.training_step,
                "episodes_completed": len(agent.episode_rewards),
                "replay_buffer_size": len(agent.replay_buffer),
                "recent_performance": agent.episode_rewards[-10:] if agent.episode_rewards else []
            }
        
        return {
            "coordination_round": self.coordination_round,
            "total_agents": len(self.agents),
            "global_policies": len(self.global_policies),
            "shared_experiences": sum(len(pool) for pool in self.experience_pools.values()),
            "network_performance": self._calculate_network_performance(),
            "agent_statistics": agent_stats,
            "configuration": self.config
        }

# Environment simulation for demonstration
class ChargingStationEnvironment:
    """Simulated charging station environment for RL agents"""
    
    def __init__(self, station_id: str, seed: int = None):
        self.station_id = station_id
        self.state_dim = 20
        self.action_dim = 10
        self.current_step = 0
        self.episode_length = 200
        
        if seed is not None:
            np.random.seed(seed)
        
        self.reset()
    
    def reset(self) -> np.ndarray:
        """Reset environment to initial state"""
        self.current_step = 0
        self.state = self._generate_initial_state()
        return self.state
    
    def step(self, action: int) -> Tuple[np.ndarray, float, bool, Dict]:
        """Take action and return next state, reward, done, info"""
        # Simulate environment dynamics
        self.current_step += 1
        
        # Calculate reward based on action and state
        reward = self._calculate_reward(action)
        
        # Update state
        self.state = self._update_state(action)
        
        # Check if episode is done
        done = self.current_step >= self.episode_length
        
        info = {
            "step": self.current_step,
            "station_id": self.station_id
        }
        
        return self.state, reward, done, info
    
    def _generate_initial_state(self) -> np.ndarray:
        """Generate initial state"""
        # Simulate charging station state
        state = np.random.uniform(0, 1, self.state_dim)
        
        # Add some structure
        state[0] = np.random.uniform(0.2, 0.8)  # Battery level
        state[1] = np.random.uniform(0.1, 0.9)  # Grid demand
        state[2] = np.random.uniform(0.0, 1.0)  # Time of day
        state[3] = np.random.uniform(0.0, 0.5)  # Number of vehicles
        
        return state
    
    def _calculate_reward(self, action: int) -> float:
        """Calculate reward for action"""
        # Reward based on efficiency, cost, and service quality
        base_reward = 1.0
        
        # Efficiency reward (based on action and current demand)
        efficiency = 1.0 - abs(action / self.action_dim - self.state[1])
        efficiency_reward = base_reward * efficiency
        
        # Cost penalty (higher actions cost more)
        cost_penalty = 0.1 * (action / self.action_dim)
        
        # Service quality reward
        service_quality = min(1.0, (action + 1) / max(self.state[3] * self.action_dim, 1))
        service_reward = 0.5 * service_quality
        
        total_reward = efficiency_reward + service_reward - cost_penalty
        
        # Add some noise
        noise = np.random.normal(0, 0.1)
        
        return total_reward + noise
    
    def _update_state(self, action: int) -> np.ndarray:
        """Update state based on action"""
        new_state = self.state.copy()
        
        # Update based on action effects
        action_effect = action / self.action_dim
        
        # Battery level changes
        new_state[0] += action_effect * 0.1 + np.random.normal(0, 0.05)
        new_state[0] = np.clip(new_state[0], 0, 1)
        
        # Grid demand evolves
        new_state[1] += np.random.normal(0, 0.1)
        new_state[1] = np.clip(new_state[1], 0, 1)
        
        # Time progresses
        new_state[2] = (self.current_step / self.episode_length) % 1.0
        
        # Vehicle count changes
        new_state[3] += np.random.normal(0, 0.05)
        new_state[3] = np.clip(new_state[3], 0, 1)
        
        # Random evolution for other features
        for i in range(4, self.state_dim):
            new_state[i] += np.random.normal(0, 0.02)
            new_state[i] = np.clip(new_state[i], 0, 1)
        
        return new_state

# Demonstration and testing
async def demo_federated_reinforcement_learning():
    """Demonstrate federated reinforcement learning"""
    
    print("\n🤖 FEDERATED REINFORCEMENT LEARNING DEMO")
    print("=" * 60)
    
    # Initialize federated RL system
    fed_rl = FederatedReinforcementLearning()
    
    # Create simulated charging stations
    stations = [
        {"id": "station_alpha", "location": "downtown", "capacity": 50},
        {"id": "station_beta", "location": "suburbs", "capacity": 30},
        {"id": "station_gamma", "location": "highway", "capacity": 40},
        {"id": "station_delta", "location": "mall", "capacity": 35}
    ]
    
    # Register agents
    print("📝 Registering RL agents...")
    environments = {}
    for i, station in enumerate(stations):
        registration = fed_rl.register_agent(station["id"], station)
        environments[station["id"]] = ChargingStationEnvironment(station["id"], seed=i*42)
        print(f"✅ {station['id']}: registered as {registration['agent_type']} agent")
    
    # Training simulation
    print(f"\n🏋️ Training federated RL agents...")
    
    num_episodes = 5
    episode_rewards = defaultdict(list)
    
    for episode in range(num_episodes):
        print(f"\n📈 Episode {episode + 1}/{num_episodes}")
        
        # Reset environments
        states = {}
        for station_id, env in environments.items():
            states[station_id] = env.reset()
        
        episode_reward_sum = defaultdict(float)
        episode_id = f"episode_{episode}"
        
        # Run episode for all agents
        for step in range(100):  # Shorter episodes for demo
            for station_id in stations:
                station_id = station["id"]
                env = environments[station_id]
                current_state = states[station_id]
                
                # Get action from agent
                action_result = fed_rl.agent_step(station_id, current_state, training=True)
                action = action_result["action"]
                
                # Take action in environment
                next_state, reward, done, info = env.step(action)
                
                # Create experience
                experience = Experience(
                    state=current_state,
                    action=action,
                    reward=reward,
                    next_state=next_state,
                    done=done,
                    station_id=station_id,
                    episode_id=episode_id
                )
                
                # Add experience to agent
                fed_rl.add_experience(station_id, experience)
                
                # Update state
                states[station_id] = next_state
                episode_reward_sum[station_id] += reward
                
                # Train agent
                if step % 10 == 0:  # Train every 10 steps
                    training_result = fed_rl.training_step(station_id)
                    if "coordination_round" in training_result:
                        print(f"      🔄 Coordination round {training_result['coordination_round']} completed")
        
        # Record episode rewards
        for station_id, total_reward in episode_reward_sum.items():
            episode_rewards[station_id].append(total_reward)
            fed_rl.agents[station_id].episode_rewards.append(total_reward)
        
        # Show episode summary
        avg_reward = np.mean(list(episode_reward_sum.values()))
        print(f"      Average reward: {avg_reward:.2f}")
    
    # Final performance analysis
    print(f"\n📊 FEDERATED RL PERFORMANCE ANALYSIS")
    print("=" * 60)
    
    network_status = fed_rl.get_network_status()
    
    print(f"Network Overview:")
    print(f"   Total Agents: {network_status['total_agents']}")
    print(f"   Coordination Rounds: {network_status['coordination_round']}")
    print(f"   Global Policies: {network_status['global_policies']}")
    print(f"   Shared Experiences: {network_status['shared_experiences']}")
    
    print(f"\nNetwork Performance:")
    perf = network_status['network_performance']
    print(f"   Average Episode Reward: {perf['average_episode_reward']:.2f}")
    print(f"   Total Episodes: {perf['total_episodes']}")
    print(f"   Average Training Steps: {perf['average_training_steps']:.1f}")
    
    print(f"\nAgent Statistics:")
    for agent_id, stats in network_status['agent_statistics'].items():
        recent_perf = np.mean(stats['recent_performance']) if stats['recent_performance'] else 0
        print(f"   {agent_id}:")
        print(f"     Training Steps: {stats['training_steps']}")
        print(f"     Episodes: {stats['episodes_completed']}")
        print(f"     Recent Performance: {recent_perf:.2f}")
        print(f"     Replay Buffer: {stats['replay_buffer_size']} experiences")
    
    # Show learning curves
    print(f"\n📈 Learning Curves:")
    for station_id, rewards in episode_rewards.items():
        if len(rewards) > 1:
            improvement = rewards[-1] - rewards[0]
            print(f"   {station_id}: {rewards[0]:.2f} → {rewards[-1]:.2f} (Δ{improvement:+.2f})")
    
    # Coordination analysis
    if network_status['coordination_round'] > 0:
        print(f"\n🤝 Coordination Analysis:")
        print(f"   Coordination rounds completed: {network_status['coordination_round']}")
        print(f"   Experience sharing: {network_status['shared_experiences']} total experiences")
        print(f"   Policy synchronization: All agents share federated policy")
        
        # Show benefits of coordination
        individual_avg = np.mean([np.mean(rewards) for rewards in episode_rewards.values()])
        network_avg = perf['average_episode_reward']
        coordination_benefit = network_avg - individual_avg
        print(f"   Coordination benefit: {coordination_benefit:+.2f} reward improvement")
    
    print(f"\n🎉 Federated Reinforcement Learning Demo Complete!")
    print(f"🚀 Distributed learning and coordination demonstrated!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(demo_federated_reinforcement_learning()) 
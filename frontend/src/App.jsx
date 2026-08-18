import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import LandingHero from './components/LandingHero';
import PipelineStepper from './components/PipelineStepper';
import AgentMatrix from './components/AgentMatrix';
import TerminalLogs from './components/TerminalLogs';
import SystemDesignModal from './components/SystemDesignModal';
import { AGENTS_METADATA, SAMPLE_REQUIREMENTS } from './data/agentInfo';

const API_BASE_URL = 'http://localhost:8000';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sh_theme') || 'dark';
  });

  // Server health state
  const [serverStatus, setServerStatus] = useState('checking');

  // Input & execution state
  const [requirements, setRequirements] = useState(SAMPLE_REQUIREMENTS.sample_default);
  const [isRunning, setIsRunning] = useState(false);
  const [runId, setRunId] = useState(null);
  const [pipelineStatus, setPipelineStatus] = useState('idle'); // 'idle' | 'running' | 'completed' | 'error'
  const [runError, setRunError] = useState(null);
  const [finalOutput, setFinalOutput] = useState(null);

  // 8 Agent states
  const [agentStates, setAgentStates] = useState(() => 
    AGENTS_METADATA.map(() => ({ status: 'pending', output: '' }))
  );
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(null);

  // Timer & logs state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  const eventSourceRef = useRef(null);
  const timerRef = useRef(null);

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sh_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Health check polling
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
        if (res.ok) {
          setServerStatus('connected');
        } else {
          setServerStatus('error');
        }
      } catch (err) {
        setServerStatus('error');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, type, message }]);
  };

  const handleReset = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsRunning(false);
    setRunId(null);
    setPipelineStatus('idle');
    setRunError(null);
    setFinalOutput(null);
    setElapsedSeconds(0);
    setCurrentAgentIndex(null);
    setSelectedAgentIndex(0);
    setAgentStates(AGENTS_METADATA.map(() => ({ status: 'pending', output: '' })));
    setLogs([]);
    addLog('system', 'Pipeline reset to default state.');
  };

  const handleStartRun = async () => {
    if (!requirements.trim() || isRunning) return;

    // Reset previous run data
    setIsRunning(true);
    setPipelineStatus('running');
    setRunError(null);
    setFinalOutput(null);
    setElapsedSeconds(0);
    setAgentStates(AGENTS_METADATA.map(() => ({ status: 'pending', output: '' })));
    setLogs([]);
    setSelectedAgentIndex(0);

    addLog('system', 'Sending requirements to backend POST /api/run...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requirements }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const newRunId = data.run_id;
      setRunId(newRunId);
      addLog('system', `Run initialized successfully. Assigned run_id: ${newRunId}`);
      addLog('system', `Connecting to Server-Sent Events stream: /api/stream/${newRunId}`);

      // Connect to SSE Stream
      const es = new EventSource(`${API_BASE_URL}/api/stream/${newRunId}`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type === 'agent_start') {
            const idx = payload.index;
            setCurrentAgentIndex(idx);
            setSelectedAgentIndex(idx);
            setAgentStates(prev => {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], status: 'running' };
              return updated;
            });
            addLog('agent_start', `Agent [${payload.agent}] started execution.`);
          } 
          else if (payload.type === 'agent_done') {
            const idx = payload.index;
            setAgentStates(prev => {
              const updated = [...prev];
              updated[idx] = { 
                status: 'completed', 
                output: payload.output 
              };
              return updated;
            });
            setSelectedAgentIndex(idx);
            addLog('agent_done', `Agent [${payload.agent}] finished task successfully.`);
          } 
          else if (payload.type === 'done') {
            setPipelineStatus('completed');
            setIsRunning(false);
            setFinalOutput(payload.final_output);
            addLog('done', 'Entire 8-Agent Software House pipeline executed successfully!');
            es.close();
          } 
          else if (payload.type === 'error') {
            setPipelineStatus('error');
            setIsRunning(false);
            setRunError(payload.message);
            addLog('error', `Execution error encountered: ${payload.message}`);
            es.close();
          }
        } catch (err) {
          console.error('SSE JSON parse error:', err);
          addLog('error', `Failed to parse SSE event: ${err.message}`);
        }
      };

      es.onerror = (err) => {
        console.error('EventSource connection error:', err);
        // Only mark error if we didn't complete normally
        if (pipelineStatus !== 'completed') {
          addLog('system', 'EventSource stream disconnected.');
        }
        es.close();
      };

    } catch (err) {
      console.error('Run launch error:', err);
      setIsRunning(false);
      setPipelineStatus('error');
      setRunError(err.message);
      addLog('error', `Failed to launch run: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      {/* Dynamic Background Mesh */}
      <div className="bg-mesh" />

      {/* Top Glass Navigation */}
      <Navbar 
        theme={theme}
        toggleTheme={toggleTheme}
        serverStatus={serverStatus}
        onReset={handleReset}
        isRunning={isRunning}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        
        {/* Landing Hero & Input Console */}
        <LandingHero 
          requirements={requirements}
          setRequirements={setRequirements}
          onStartRun={handleStartRun}
          isRunning={isRunning}
          runError={runError}
        />

        {/* Live Pipeline Stepper */}
        <PipelineStepper 
          agentStates={agentStates}
          currentAgentIndex={currentAgentIndex}
          onSelectAgent={(idx) => setSelectedAgentIndex(idx)}
          selectedAgentIndex={selectedAgentIndex}
          pipelineStatus={pipelineStatus}
          elapsedSeconds={elapsedSeconds}
        />

        {/* Agent Outputs Matrix Dashboard */}
        <AgentMatrix 
          agentStates={agentStates}
          selectedAgentIndex={selectedAgentIndex}
          onSelectAgent={(idx) => setSelectedAgentIndex(idx)}
          finalOutput={finalOutput}
        />

        {/* Terminal SSE Event Stream */}
        <TerminalLogs 
          logs={logs}
          onClearLogs={() => setLogs([])}
        />

      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px 0',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        marginTop: '32px'
      }}>
        <p style={{ margin: 0 }}>
          Autonomous Software House Multi-Agent System • Powered by CrewAI & FastAPI • Built with React & Vite
        </p>
      </footer>

      {/* System Architecture Modal */}
      <SystemDesignModal 
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />
    </div>
  );
}

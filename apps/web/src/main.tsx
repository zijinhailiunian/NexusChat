import React from 'react';
import ReactDOM from 'react-dom/client';
import { Background, Controls, MiniMap, ReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: 'input', position: { x: 100, y: 100 }, data: { label: 'Input Node' }, type: 'input' },
  { id: 'agent', position: { x: 300, y: 100 }, data: { label: 'Agent Node' } },
  { id: 'output', position: { x: 500, y: 100 }, data: { label: 'Output Node' }, type: 'output' },
];

const initialEdges = [
  { id: 'e1-2', source: 'input', target: 'agent' },
  { id: 'e2-3', source: 'agent', target: 'output' },
];

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

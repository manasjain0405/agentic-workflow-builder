import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  OnConnect,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

type NodeType = 'AGENT' | 'SUPERVISOR';

interface NodeConfig {
  node_name: string;
  node_description: string;
  instructions: string;
  type: NodeType;
  is_start_node: boolean;
  humans: string[];
}

let id = 0;
const getId = () => `node_${id++}`;

const initialNodes: Node<NodeConfig>[] = [];

const initialEdges: Edge[] = [];

const FlowBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeConfig>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  const addNode = useCallback((type: NodeType) => {
    const newNode: Node<NodeConfig> = {
      id: getId(),
      type,
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: {
        node_name: '',
        node_description: '',
        instructions: '',
        type,
        is_start_node: false,
        humans: [],
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleConnect: OnConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;

    const newEdge: Edge = {
      ...params,
      id: `${params.source}-${params.target}`,
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  useEffect(() => {
    const predefinedJSON = {
      nodes: [
        {
          id: getId(),
          type: 'AGENT' as NodeType,
          position: { x: 100, y: 100 },
          data: {
            node_name: 'Agent 1',
            node_description: 'Description for Agent 1',
            instructions: 'Do something',
            type: 'AGENT',
            is_start_node: true,
            humans: [],
          },
        },
        {
          id: getId(),
          type: 'SUPERVISOR' as NodeType,
          position: { x: 400, y: 200 },
          data: {
            node_name: 'Supervisor 1',
            node_description: 'Oversee Agent 1',
            instructions: 'Monitor',
            type: 'SUPERVISOR',
            is_start_node: false,
            humans: [],
          },
        },
      ],
      edges: [
        {
          id: 'node_0-node_1',
          source: 'node_0',
          target: 'node_1',
          sourceHandle: null,
          targetHandle: null,
        },
      ],
    };

    setNodes(predefinedJSON.nodes);
    setEdges(predefinedJSON.edges);
  }, [setNodes, setEdges]);

  return (
    <div className="w-full h-screen">
      <div className="p-4 flex gap-2 bg-gray-100 border-b border-gray-300">
        <button onClick={() => addNode('AGENT')} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Agent
        </button>
        <button onClick={() => addNode('SUPERVISOR')} className="bg-green-500 text-white px-4 py-2 rounded">
          Add Supervisor
        </button>
      </div>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          fitView
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default FlowBuilder;

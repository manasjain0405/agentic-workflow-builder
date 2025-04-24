
import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import SupervisorNode from './nodes/SupervisorNode';
import AgentNode from './nodes/AgentNode';
import { ConfigPanel } from './ConfigPanel';
import type { WorkflowNode, WorkflowData } from '@/lib/types';
import { Button } from './ui/button';
import { NODE_TYPES } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Save, Trash2, Copy } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

type FlowNode = {
  id: string;
  type: "supervisor" | "agent";
  position: { x: number; y: number };
  data: {
    label: string;
    isStartNode: boolean;
    flowNode: WorkflowNode;
  };
};

const nodeTypes: NodeTypes = {
  [NODE_TYPES.SUPERVISOR]: SupervisorNode,
  [NODE_TYPES.AGENT]: AgentNode,
};

const initialNodes: FlowNode[] = [];

export const FlowEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [workflowJson, setWorkflowJson] = useState("");

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (_: React.MouseEvent, node: any) => {
    setSelectedNode(node.data.flowNode);
    setSelectedNodeId(node.id);
  };

  const handleExport = () => {
    const workflowData: WorkflowData = {
      nodes: nodes.map(node => node.data.flowNode),
      adjacency_list: edges.reduce((acc: Record<string, string[]>, edge: Edge) => {
        if (!acc[edge.source]) {
          acc[edge.source] = [];
        }
        acc[edge.source].push(edge.target);
        return acc;
      }, {})
    };
    
    setWorkflowJson(JSON.stringify(workflowData, null, 2));
    setShowJson(true);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(workflowJson);
      toast.success("JSON copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy JSON");
    }
  };

  const handleSaveWorkflow = () => {
    console.log("Saving workflow:", workflowJson);
    setShowJson(false);
  };

  const onNodeUpdate = (updatedFlowNode: WorkflowNode) => {
    setNodes((nds) => nds.map(node => {
      if (node.id === selectedNodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            flowNode: updatedFlowNode,
            label: updatedFlowNode.node_name
          }
        };
      }
      return node;
    }));
    setSelectedNode(updatedFlowNode);
  };

  const addNewNode = (type: "SUPERVISOR" | "AGENT") => {
    const nodeId = type === "SUPERVISOR" 
      ? `supervisor_${nodes.length + 1}` 
      : `agent_${nodes.length + 1}`;
    
    const reactFlowType = type === "SUPERVISOR" ? NODE_TYPES.SUPERVISOR : NODE_TYPES.AGENT;
    
    const newNode: FlowNode = {
      id: nodeId,
      type: type === "SUPERVISOR" ? 'supervisor' : 'agent',
      position: { 
        x: Math.random() * 300 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        label: nodeId,
        isStartNode: false,
        flowNode: {
          node_name: nodeId,
          node_description: `${type === "SUPERVISOR" ? "Supervisor" : "Agent"} Node`,
          type: type,
          instructions: '',
          humans: type === "SUPERVISOR" ? [] : undefined,
          tools: type === "AGENT" ? [] : undefined
        }
      }
    };
    
    setNodes((nds) => [...nds, newNode]);
  };

  const handleClearWorkflow = () => {
    setNodes(initialNodes);
    setEdges([]);
    setSelectedNode(null);
    setSelectedNodeId(null);
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 h-full relative">
        <div className="absolute top-4 right-4 z-10 space-x-2 flex items-center">
          <ThemeToggle />
          <Button onClick={() => addNewNode("SUPERVISOR")} variant="outline" className="bg-white/80 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border-gray-600">
            <Plus className="h-4 w-4 mr-2" /> Add Supervisor
          </Button>
          <Button onClick={() => addNewNode("AGENT")} variant="outline" className="bg-white/80 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border-gray-600">
            <Plus className="h-4 w-4 mr-2" /> Add Agent
          </Button>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background className="dark:bg-gray-900" />
          <Controls className="dark:bg-gray-800 dark:text-white dark:border-gray-700" />
        </ReactFlow>
        <div className="absolute bottom-4 left-4 z-10 space-x-2">
          <Button onClick={handleExport} variant="outline" className="bg-white/80 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border-gray-600">
            <Save className="h-4 w-4 mr-2" /> Save Workflow
          </Button>
          <Button onClick={handleClearWorkflow} variant="destructive" className="bg-red-500">
            <Trash2 className="h-4 w-4 mr-2" /> Clear Workflow
          </Button>
        </div>
      </div>
      <ConfigPanel 
        selectedNode={selectedNode}
        selectedNodeId={selectedNodeId}
        onNodeUpdate={onNodeUpdate}
      />
            <Dialog open={showJson} onOpenChange={setShowJson}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Workflow JSON</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-96">
              {workflowJson}
            </pre>
            <Button
              onClick={handleCopyJson}
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border-gray-600"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJson(false)} className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border-gray-600">
              Cancel
            </Button>
            <Button onClick={handleSaveWorkflow}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlowEditor;

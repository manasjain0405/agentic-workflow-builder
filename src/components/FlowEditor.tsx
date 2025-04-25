
import React, { useCallback, useState, useRef } from 'react';
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
import { Plus, Save, Trash2, Copy, Download, Upload } from "lucide-react";
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

function createNodeIdToNameMap(nodes: Node[]): Record<string, string> {
  return nodes.reduce((map, node) => {
    map[node.id] = node.data.flowNode.node_name;
    return map;
  }, {} as Record<string, string>);
}

export const FlowEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [workflowJson, setWorkflowJson] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (_: React.MouseEvent, node: any) => {
    setSelectedNode(node.data.flowNode);
    setSelectedNodeId(node.id);
  };

  const handleExport = () => {
    const id_name_map = createNodeIdToNameMap(nodes)
    console.log(id_name_map)
    const workflowData: WorkflowData = {
      nodes: nodes.map(node => node.data.flowNode),
      adjacency_list: edges.reduce((acc: Record<string, string[]>, edge: Edge) => {
        if (!acc[id_name_map[edge.source]]) {
          acc[id_name_map[edge.source]] = [];
        }
        acc[id_name_map[edge.source]].push(id_name_map[edge.target]);
        return acc;
      }, {})
    };
    
    // Store the complete state for restoration
    const completeState = {
      workflowData,
      flowState: {
        nodes,
        edges
      }
    };
    
    setWorkflowJson(JSON.stringify(completeState, null, 2));
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

    const handleDownloadJson = () => {
    const element = document.createElement("a");
    const file = new Blob([workflowJson], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = "workflow.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("JSON file downloaded");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedContent = JSON.parse(content);
        
        if (parsedContent.flowState) {
          // Restore the complete flow state
          setNodes(parsedContent.flowState.nodes);
          setEdges(parsedContent.flowState.edges);
          toast.success("Workflow loaded successfully");
        } else {
          toast.error("Invalid workflow format");
        }
      } catch (err) {
        console.error("Error parsing JSON file:", err);
        toast.error("Failed to load workflow");
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveWorkflow = () => {
    console.log("Saving workflow:", workflowJson);
    setShowJson(false);
  };

  const onNodeUpdate = (updatedFlowNode: WorkflowNode) => {
    if (!selectedNodeId) return;
    
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: updatedFlowNode.node_name,
              flowNode: updatedFlowNode,
            },
          };
        }
        return node;
      })
    );
    
    setSelectedNode(updatedFlowNode);
  };

  const addNewNode = (type: "SUPERVISOR" | "AGENT") => {
    const nodeId = type === "SUPERVISOR" 
      ? `supervisor_${nodes.length + 1}` 
      : `agent_${nodes.length + 1}`;
    
    const reactFlowType = type === "SUPERVISOR" ? NODE_TYPES.SUPERVISOR : NODE_TYPES.AGENT;
    
    const newNode: FlowNode = {
      id: nodeId,
      type: reactFlowType,
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
        <div className="absolute bottom-4 left-4 z-10 space-x-2 flex">
          <Button onClick={handleExport} variant="outline" className="bg-white/80 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border-gray-600">
            <Save className="h-4 w-4 mr-2" /> Save Workflow
          </Button>
          <Button onClick={handleClearWorkflow} variant="destructive" className="bg-red-500">
            <Trash2 className="h-4 w-4 mr-2" /> Clear Workflow
          </Button>
          <Button onClick={triggerFileInput} variant="outline" className="bg-white/80 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border-gray-600">
            <Upload className="h-4 w-4 mr-2" /> Load Workflow
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".json" 
            className="hidden" 
          />
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
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button
                onClick={handleCopyJson}
                variant="outline"
                size="sm"
                className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border-gray-600"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleDownloadJson}
                variant="outline"
                size="sm"
                className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border-gray-600"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
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

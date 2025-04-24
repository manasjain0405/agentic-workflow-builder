
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TOOLS_LIST, HUMAN_NODE_TYPES } from '@/lib/constants';
import type { WorkflowNode, Tool, HumanNodeType } from '@/lib/types';
import { Button } from './ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface ConfigPanelProps {
  selectedNode: WorkflowNode | null;
  selectedNodeId: string | null;
  onNodeUpdate: (node: WorkflowNode) => void;
}

export const ConfigPanel = ({ selectedNode, selectedNodeId, onNodeUpdate }: ConfigPanelProps) => {
  if (!selectedNode) {
    return (
      <div className="w-[300px] border-l p-4 bg-white dark:bg-gray-800 dark:text-white h-full">
        <p className="text-gray-500 dark:text-gray-400 text-center">Select a node to configure</p>
      </div>
    );
  }

  const updateNode = (updates: Partial<WorkflowNode>) => {
    onNodeUpdate({ ...selectedNode, ...updates });
  };

  const addHumanNode = () => {
    const newHuman = {
      node_name: `human_${(selectedNode.humans?.length || 0) + 1}`,
      node_description: "New human node",
      instructions: "",
      type: HUMAN_NODE_TYPES[0] as HumanNodeType
    };
    
    updateNode({ 
      humans: [...(selectedNode.humans || []), newHuman] 
    });
  };

  const removeHumanNode = (index: number) => {
    const newHumans = [...(selectedNode.humans || [])];
    newHumans.splice(index, 1);
    updateNode({ humans: newHumans });
  };

  const handleToolSelection = (value: Tool) => {
    const currentTools = selectedNode.tools || [];
    if (!currentTools.includes(value)) {
      updateNode({ tools: [...currentTools, value] });
    }
  };

  const removeTool = (toolToRemove: Tool) => {
    const currentTools = selectedNode.tools || [];
    updateNode({ tools: currentTools.filter(tool => tool !== toolToRemove) });
  };

  return (
    <div className="w-[300px] border-l p-4 bg-white dark:bg-gray-800 dark:text-white h-full overflow-y-auto">
      <h3 className="font-semibold mb-4">Node Configuration</h3>
      
      <div className="space-y-4">
        <div>
          <Label>Node Name</Label>
          <Input 
            value={selectedNode.node_name} 
            onChange={(e) => updateNode({ node_name: e.target.value })}
            className="dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Input 
            value={selectedNode.node_description} 
            onChange={(e) => updateNode({ node_description: e.target.value })}
            className="dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <Label>Instructions</Label>
          <Textarea 
            value={selectedNode.instructions} 
            onChange={(e) => updateNode({ instructions: e.target.value })}
            className="h-32 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {selectedNode.type === "SUPERVISOR" && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Human Nodes</Label>
              <Button 
                onClick={addHumanNode} 
                variant="outline" 
                size="sm"
                className="h-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:dark:bg-gray-600"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {selectedNode.humans?.map((human, index) => (
              <div key={index} className="mt-2 p-2 border rounded dark:border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">Human Node {index + 1}</Label>
                  <Button 
                    onClick={() => removeHumanNode(index)} 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <Input 
                  value={human.node_name}
                  onChange={(e) => {
                    const newHumans = [...(selectedNode.humans || [])];
                    newHumans[index] = { ...human, node_name: e.target.value };
                    updateNode({ humans: newHumans });
                  }}
                  placeholder="Node Name"
                  className="mb-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <Input 
                  value={human.node_description}
                  onChange={(e) => {
                    const newHumans = [...(selectedNode.humans || [])];
                    newHumans[index] = { ...human, node_description: e.target.value };
                    updateNode({ humans: newHumans });
                  }}
                  placeholder="Description"
                  className="mb-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <Textarea
                  value={human.instructions}
                  onChange={(e) => {
                    const newHumans = [...(selectedNode.humans || [])];
                    newHumans[index] = { ...human, instructions: e.target.value };
                    updateNode({ humans: newHumans });
                  }}
                  placeholder="Instructions"
                  className="mb-2 h-20 dark:bg-gray-700 dark:border-gray-600"
                />
                <Select
                  value={human.type}
                  onValueChange={(value) => {
                    const newHumans = [...(selectedNode.humans || [])];
                    newHumans[index] = { ...human, type: value as HumanNodeType };
                    updateNode({ humans: newHumans });
                  }}
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700">
                    {HUMAN_NODE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}

        {selectedNode.type === "AGENT" && (
          <div className="space-y-2">
            <Label>Tools</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(selectedNode.tools || []).map((tool) => (
                <div 
                  key={tool}
                  className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-md"
                >
                  <span className="text-sm">{tool}</span>
                  <button
                    onClick={() => removeTool(tool)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <Select onValueChange={handleToolSelection}>
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                <SelectValue placeholder="Add tool" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700">
                {TOOLS_LIST.map((tool) => (
                  <SelectItem 
                    key={tool} 
                    value={tool}
                    disabled={(selectedNode.tools || []).includes(tool)}
                  >
                    {tool}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

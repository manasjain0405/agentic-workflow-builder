
import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface AgentNodeProps {
  data: {
    label: string;
    flowNode?: {
      node_name: string;
    };
  };
}

const AgentNode = ({ data }: AgentNodeProps) => {
  // Use flowNode.node_name if available, otherwise fall back to label
  const displayLabel = data.flowNode?.node_name || data.label;
  
  return (
    <div className="px-4 py-2 shadow-lg rounded-md bg-gradient-to-b from-[#0EA5E9] to-[#0284C7] text-white min-w-[150px] dark:from-[#0284C7] dark:to-[#036599]">
      <Handle type="target" position={Position.Top} className="!bg-[#0EA5E9] dark:!bg-[#0284C7]" />
      <div className="flex flex-col items-center">
        <div className="font-medium">{displayLabel}</div>
        <div className="text-xs">Agent</div>
      </div>
      {/*<Handle type="source" position={Position.Bottom} className="!bg-[#0284C7] dark:!bg-[#036599]" />*/}
    </div>
  );
};

export default AgentNode;

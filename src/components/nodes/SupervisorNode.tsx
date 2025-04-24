
import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface SupervisorNodeProps {
  data: {
    label: string;
    isStartNode?: boolean;
    flowNode?: {
      node_name: string;
    };
  };
}

const SupervisorNode = ({ data }: SupervisorNodeProps) => {
  // Use flowNode.node_name if available, otherwise fall back to label
  const displayLabel = data.flowNode?.node_name || data.label;
  
  return (
    <div className="px-4 py-2 shadow-lg rounded-md bg-gradient-to-b from-[#9b87f5] to-[#7E69AB] text-white min-w-[150px] dark:from-[#7E69AB] dark:to-[#574979]">
      <Handle type="target" position={Position.Top} className="!bg-[#9b87f5] dark:!bg-[#7E69AB]" />
      <div className="flex flex-col items-center">
        {data.isStartNode && (
          <div className="text-xs bg-white/20 px-2 py-0.5 rounded mb-1">Start Node</div>
        )}
        <div className="font-medium">{displayLabel}</div>
        <div className="text-xs">Supervisor</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[#7E69AB] dark:!bg-[#574979]" />
    </div>
  );
};

export default SupervisorNode;

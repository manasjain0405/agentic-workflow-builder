
import { TOOLS_LIST, SOP_FUNCTION_LIST, HUMAN_NODE_TYPES, NODE_TYPES } from './constants';

export type Tool = typeof TOOLS_LIST[number];
export type SopFunction = typeof SOP_FUNCTION_LIST[number];
export type HumanNodeType = typeof HUMAN_NODE_TYPES[number];
export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];

export interface HumanNode {
  node_name: string;
  node_description: string;
  instructions: string;
  type: HumanNodeType;
}

export interface WorkflowNode {
  node_name: string;
  node_description: string;
  type: "SUPERVISOR" | "AGENT";
  instructions: string;
  is_start_node?: boolean;
  humans?: HumanNode[];
  tools?: Tool[];
  sop_functions?: SOP_FUNCTION_LIST[];
}

export interface WorkflowData {
  nodes: WorkflowNode[];
  adjacency_list: Record<string, string[]>;
}
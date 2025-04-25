
export const TOOLS_LIST = [
  "get_order_details_mf",
  "get_cancelled_sip_mf",
] as const;

export const SOP_FUNCTION_LIST = [
  "get_sip_sop",
] as const;


export const HUMAN_NODE_TYPES = [
  "ORDER_PICKER",
  "TEXT"
] as const;

export const NODE_TYPES = {
  SUPERVISOR: "supervisor",
  AGENT: "agent"
} as const;

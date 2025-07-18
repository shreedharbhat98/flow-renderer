export interface GraphNodeData {
  id: string;
  label: string;
  type: string;
  alerts: number;
  misconfigs: number;
  children?: string[];
}

export interface GraphEdgeData {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}

export interface CloudGraphDashboardProps {
  data?: GraphData;
}


export interface CloudNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  alerts: number;
  misconfigs: number;
  children?: string[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  level: number;
}

export interface CloudNodeProps {
  data: CloudNodeData;
  selected?: boolean;
}

export interface FilterBarProps {
  activeFilter: 'all' | 'alerts' | 'misconfigurations';
  onFilterChange: (filter: 'all' | 'alerts' | 'misconfigurations') => void;
  totalAlerts: number;
  totalMisconfigurations: number;
}

export interface NodeDetailsPanelProps {
  node: CloudNodeData | null;
  onClose: () => void;
}

export interface SimpleFilterState {
  type: 'all' | 'alerts' | 'misconfigurations';
  nodeType: string;
  alertThreshold: number[];
  misconfigThreshold: number[];
  expandedOnly: boolean;
}

export interface SimpleFilterPanelProps {
  filters: SimpleFilterState;
  onFiltersChange: (filters: SimpleFilterState) => void;
  stats: {
    totalAlerts: number;
    totalMisconfigs: number;
    cloudNodes: number;
    awsNodes: number;
    gcpNodes: number;
    serviceNodes: number;
  };
  isOpen: boolean;
  onToggle: () => void;
}

export interface StatsPanelProps {
  totalAlerts: number;
  totalMisconfigurations: number;
  totalProviders: number;
  criticalAlerts: number;
}

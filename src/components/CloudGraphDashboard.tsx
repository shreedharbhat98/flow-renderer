import React, { useState, useCallback, useMemo } from 'react';
import { ReactFlow, Node, Edge, useNodesState, useEdgesState, Background, Controls, MiniMap, BackgroundVariant, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CloudNode from './CloudNode';
import NodeDetailsPanel from './NodeDetailsPanel';
import StatsPanel from './StatsPanel';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/Command';
import { ExpandIcon, Minimize2, RefreshCw, ChevronDown, Check } from 'lucide-react';
import { defaultSampleData } from '@/data/data';
import { CloudGraphDashboardProps, CloudNodeData, SimpleFilterState } from '@/types';

const nodeTypes = {
  cloudNode: CloudNode
};

export default function CloudGraphDashboard({ data = defaultSampleData }: CloudGraphDashboardProps) {
  const rootNodes = useMemo(() => {
    const targets = new Set(data.edges.map(edge => edge.target));
    return data.nodes.filter(node => !targets.has(node.id));
  }, [data]);

  const nodeHierarchy = useMemo(() => {
    const hierarchy = new Map<string, { level: number; parentId?: string; siblingIndex: number }>();
    const visited = new Set<string>();
    
    const buildHierarchy = (nodeId: string, level: number, parentId?: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const siblings = data.edges
        .filter(edge => edge.source === parentId)
        .map(edge => edge.target);
      
      const siblingIndex = siblings.indexOf(nodeId);
      
      hierarchy.set(nodeId, { level, parentId, siblingIndex: siblingIndex >= 0 ? siblingIndex : 0 });
      
      const children = data.edges
        .filter(edge => edge.source === nodeId)
        .map(edge => edge.target);
      
      children.forEach(childId => {
        buildHierarchy(childId, level + 1, nodeId);
      });
    };

    rootNodes.forEach((rootNode, index) => {
      hierarchy.set(rootNode.id, { level: 0, siblingIndex: index });
      const children = data.edges
        .filter(edge => edge.source === rootNode.id)
        .map(edge => edge.target);
      
      children.forEach(childId => {
        buildHierarchy(childId, 1, rootNode.id);
      });
    });

    return hierarchy;
  }, [rootNodes, data]);

  const defaultExpandedNodes = useMemo(() => {
    const expanded = new Set<string>();
    rootNodes.forEach(root => {
      expanded.add(root.id);
      const children = data.edges
        .filter(edge => edge.source === root.id)
        .map(edge => edge.target);
      children.forEach(childId => expanded.add(childId));
    });
    return expanded;
  }, [rootNodes, data]);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(defaultExpandedNodes);
  const [selectedNode, setSelectedNode] = useState<CloudNodeData | null>(null);
  const [filters, setFilters] = useState<SimpleFilterState>({
    type: 'all',
    nodeType: 'all',
    alertThreshold: [0],
    misconfigThreshold: [0],
    expandedOnly: false
  });

  const availableNodeTypes = useMemo(() => {
    const types = new Set(data.nodes.map(node => node.type));
    return Array.from(types).map(type => ({
      key: type,
      label: type.charAt(0).toUpperCase() + type.slice(1)
    }));
  }, [data]);

  const { nodes: calculatedNodes, edges: calculatedEdges } = useMemo(() => {
    const nodes: Node<CloudNodeData>[] = [];
    const edges: Edge[] = [];

    const LEVEL_SPACING_X = 280;
    const NODE_SPACING_Y = 180;

    const visibleNodes: any[] = [];
    data.nodes.forEach((nodeData) => {
      let shouldShow = true;
      
      const parentEdge = data.edges.find(edge => edge.target === nodeData.id);
      if (parentEdge) {
        shouldShow = expandedNodes.has(parentEdge.source);
      }

      if (shouldShow) {
        const hierarchyInfo = nodeHierarchy.get(nodeData.id);
        const level = hierarchyInfo?.level || 0;
        visibleNodes.push({ nodeData, level });
      }
    });

    const nodesByLevel = new Map<number, any[]>();
    visibleNodes.forEach(({ nodeData, level }) => {
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(nodeData);
    });

    visibleNodes.forEach(({ nodeData, level }) => {
      const nodesAtLevel = nodesByLevel.get(level) || [];
      const indexAtLevel = nodesAtLevel.findIndex(n => n.id === nodeData.id);

      const reactFlowNode: Node<CloudNodeData> = {
        id: nodeData.id,
        type: 'cloudNode',
        position: { 
          x: level * LEVEL_SPACING_X + 50, 
          y: indexAtLevel * NODE_SPACING_Y + 50 
        },
        data: {
          label: nodeData.label,
          type: nodeData.type,
          alerts: nodeData.alerts,
          misconfigs: nodeData.misconfigs,
          children: nodeData.children,
          isExpanded: expandedNodes.has(nodeData.id),
          onToggleExpand: () => {
            const newExpanded = new Set(expandedNodes);
            if (newExpanded.has(nodeData.id)) {
              newExpanded.delete(nodeData.id);
              // Also collapse all children
              nodeData.children?.forEach(childId => {
                newExpanded.delete(childId);
              });
            } else {
              newExpanded.add(nodeData.id);
            }
            setExpandedNodes(newExpanded);
          },
          level
        }
      };
      nodes.push(reactFlowNode);
    });

    data.edges.forEach(edgeData => {
      const sourceVisible = nodes.some(n => n.id === edgeData.source);
      const targetVisible = nodes.some(n => n.id === edgeData.target);
      
      if (sourceVisible && targetVisible) {
        edges.push({
          id: `${edgeData.source}-${edgeData.target}`,
          source: edgeData.source,
          target: edgeData.target,
          type: 'default',
          style: { 
            stroke: 'hsl(var(--connection-line))', 
            strokeWidth: 2,
            strokeDasharray: '0'
          },
          markerEnd: {
            type: MarkerType.Arrow,
            width: 20,
            height: 20,
            color: 'hsl(var(--connection-line))'
          },
          animated: false
        });
      }
    });

    return { nodes, edges };
  }, [expandedNodes, nodeHierarchy, data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(calculatedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(calculatedEdges);

  // Update nodes when calculated nodes change
  React.useEffect(() => {
    setNodes(calculatedNodes);
    setEdges(calculatedEdges);
  }, [calculatedNodes, calculatedEdges, setNodes, setEdges]);

  // Apply filters
  const filteredNodes = useMemo(() => {
    return nodes.map(node => {
      let hidden = false;

      // Type filter
      if (filters.type === 'alerts' && node.data.alerts === 0) hidden = true;
      if (filters.type === 'misconfigurations' && node.data.misconfigs === 0) hidden = true;

      // Node type filter
      if (filters.nodeType !== 'all' && node.data.type !== filters.nodeType) hidden = true;

      // Threshold filters
      if (node.data.alerts < filters.alertThreshold[0]) hidden = true;
      if (node.data.misconfigs < filters.misconfigThreshold[0]) hidden = true;

      // Expanded only filter
      if (filters.expandedOnly && !node.data.isExpanded && node.data.children && node.data.children.length > 0) hidden = true;

      return { ...node, hidden };
    });
  }, [nodes, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const visibleNodes = filteredNodes.filter(n => !n.hidden);
    const totalAlerts = visibleNodes.reduce((sum, node) => sum + node.data.alerts, 0);
    const totalMisconfigs = visibleNodes.reduce((sum, node) => sum + node.data.misconfigs, 0);
    const criticalAlerts = visibleNodes.filter(node => node.data.alerts > 100).length;
    const cloudNodes = visibleNodes.filter(node => node.data.type === 'cloud').length;
    const awsNodes = visibleNodes.filter(node => node.data.type === 'aws').length;
    const gcpNodes = visibleNodes.filter(node => node.data.type === 'gcp').length;
    const serviceNodes = visibleNodes.filter(node => node.data.type === 'service').length;
    const totalProviders = new Set(visibleNodes.map(node => node.data.type)).size;

    return { 
      totalAlerts, 
      totalMisconfigurations: totalMisconfigs,
      criticalAlerts, 
      totalProviders,
      cloudNodes,
      awsNodes,
      gcpNodes,
      serviceNodes,
      totalMisconfigs
    };
  }, [filteredNodes]);

  const expandAll = useCallback(() => {
    const allNodeIds = new Set(data.nodes.map(n => n.id));
    setExpandedNodes(allNodeIds);
  }, [data]);

  const collapseAll = useCallback(() => {
    const rootNodeIds = rootNodes.map(node => node.id);
    setExpandedNodes(new Set(rootNodeIds));
  }, [rootNodes]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const nodeData = node.data as CloudNodeData;
    setSelectedNode(nodeData);
    
    if (nodeData.children && nodeData.children.length > 0) {
      nodeData.onToggleExpand?.();
    }
  }, []);

  return (
    <div className="h-screen bg-graph-bg p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Cloud Infrastructure Graph
            </h1>
            <p className="text-muted-foreground mt-1">
              Interactive exploration of cloud hierarchy with alerts and misconfigurations
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Expand/Collapse Controls */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                <ExpandIcon className="w-4 h-4 mr-2" />
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                <Minimize2 className="w-4 h-4 mr-2" />
                Collapse All
              </Button>
            </div>
          </div>
        </div>

        {/* Inline Filter Controls */}
        <Card className="p-4 border-graph-border">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Filter Type */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Issue Type:</span>
              {[
                { key: 'all', label: 'All' },
                { key: 'alerts', label: 'Alerts' },
                { key: 'misconfigurations', label: 'Misconfigs' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={filters.type === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters({ ...filters, type: key as any })}
                >
                  {label}
                </Button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Node Type Filter - Searchable Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Node Type:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-[120px] justify-between">
                    {filters.nodeType === 'all' ? 'All Types' : 
                     availableNodeTypes.find(t => t.key === filters.nodeType)?.label || 'Select...'}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 bg-background border z-50" align="start">
                  <Command>
                    <CommandInput placeholder="Search node types..." />
                    <CommandList>
                      <CommandEmpty>No node type found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          key="all"
                          value="All Types"
                          onSelect={() => {
                            setFilters({ ...filters, nodeType: 'all' });
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              filters.nodeType === 'all' ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          All Types
                        </CommandItem>
                        {availableNodeTypes.map(({ key, label }) => (
                          <CommandItem
                            key={key}
                            value={label}
                            onSelect={() => {
                              setFilters({ ...filters, nodeType: key });
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                filters.nodeType === key ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Reset Filters */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({
                type: 'all',
                nodeType: 'all',
                alertThreshold: [0],
                misconfigThreshold: [0],
                expandedOnly: false
              })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </Card>
      </div>

      {/* Stats Panel */}
      <StatsPanel {...stats} />

      {/* Active Filters */}
      {(filters.type !== 'all' || filters.nodeType !== 'all' || 
        filters.alertThreshold[0] > 0 || filters.misconfigThreshold[0] > 0 || filters.expandedOnly) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.type !== 'all' && (
            <Badge variant="secondary">{filters.type}</Badge>
          )}
          {filters.nodeType !== 'all' && (
            <Badge variant="secondary">{filters.nodeType} nodes</Badge>
          )}
          {filters.alertThreshold[0] > 0 && (
            <Badge variant="secondary">≥{filters.alertThreshold[0]} alerts</Badge>
          )}
          {filters.misconfigThreshold[0] > 0 && (
            <Badge variant="secondary">≥{filters.misconfigThreshold[0]} misconfigs</Badge>
          )}
          {filters.expandedOnly && (
            <Badge variant="secondary">expanded only</Badge>
          )}
        </div>
      )}

      {/* Main Graph */}
      <Card className="h-[700px] border-graph-border overflow-hidden">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          minZoom={0.3}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          style={{ background: 'transparent' }}
        >
            <Background 
              color="#93c5fd" 
              gap={20} 
              size={2}
              variant={BackgroundVariant.Dots}
            />
            <Controls className="bg-card border-graph-border shadow-md" />
            <MiniMap 
              className="bg-card border border-graph-border rounded-lg shadow-md"
              nodeColor={(node) => {
                const type = node.data?.type;
                switch (type) {
                  case 'aws': return 'hsl(var(--aws-primary))';
                  case 'gcp': return 'hsl(var(--gcp-primary))';
                  case 'cloud': return 'hsl(var(--cloud-primary))';
                  case 'saas': return 'hsl(var(--muted))';
                  case 'service': return 'hsl(var(--secondary))';
                  default: return 'hsl(var(--muted))';
                }
              }}
              nodeStrokeWidth={2}
              maskColor="hsl(var(--background) / 0.8)"
              pannable
            />
            
            {/* Node Details Panel - Inside Canvas */}
            <NodeDetailsPanel 
              node={selectedNode} 
              onClose={() => setSelectedNode(null)} 
            />
        </ReactFlow>
      </Card>
    </div>
  );
}
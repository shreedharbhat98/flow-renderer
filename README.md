# Cloud Infrastructure Graph Visualization

An interactive React-based graph visualization tool for exploring cloud infrastructure hierarchy with real-time filtering and collapsible nodes.

## Setup Instructions

### Prerequisites
- Node.js 18
- npm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clonegit@github.com:shreedharbhat98/flow-renderer.git
   cd flow-renderer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application.

### Build for Production
```bash
npm run build
```

## 🏗️ Architecture Overview

### Technology Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Flow** - Graph visualization library
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **Vite** - Build tool

### Data Structure
The application uses a hierarchical data model with nodes and edges:

```typescript
interface NodeData {
  id: string;
  label: string;
  type: 'cloud' | 'aws' | 'gcp' | 'saas' | 'service';
  alerts: number;
  misconfigs: number;
  children?: string[];
}
```

## Collapsible Node Functionality

### How It Works

**State Management**
- Uses a `Set<string>` to track expanded node IDs
- Parent-child relationships defined in the data structure via `children` arrays

**Expand/Collapse Logic**
1. **Node Click**: Toggles the node's expanded state
2. **Visibility Calculation**: Child nodes are only rendered if their parent is expanded
3. **Cascade Collapse**: When a parent collapses, all descendant nodes are also collapsed
4. **Edge Management**: Edges are only rendered between visible nodes

**Implementation Details**
```typescript
const toggleExpand = (nodeId: string) => {
  const newExpanded = new Set(expandedNodes);
  if (newExpanded.has(nodeId)) {
    // Collapse: remove node and all children
    newExpanded.delete(nodeId);
    node.children?.forEach(childId => newExpanded.delete(childId));
  } else {
    // Expand: add node to expanded set
    newExpanded.add(nodeId);
  }
  setExpandedNodes(newExpanded);
};
```

**Visual Feedback**
- Expand/collapse icons (➕/➖) indicate node state
- Smooth animations during state transitions
- Dynamic positioning based on hierarchy level

## 🔍 Filtering Logic

### Filter Types

**1. Issue Type Filter**
- **All**: Shows all nodes
- **Alerts**: Shows only nodes with alerts > 0
- **Misconfigurations**: Shows only nodes with misconfigs > 0

**2. Node Type Filter**
- Filter by cloud provider or service type
- Options: All, Cloud, AWS, GCP, SaaS, Service

**3. Threshold Filters**
- **Alert Threshold**: Minimum number of alerts (slider 0-150)
- **Misconfiguration Threshold**: Minimum number of misconfigs (slider 0-20)

**4. Expanded Only Filter**
- Shows only nodes that are currently expanded
- Useful for focusing on actively explored branches

### Filter Implementation

**Real-time Filtering**
```typescript
const filteredNodes = useMemo(() => {
  return nodes.map(node => {
    let hidden = false;
    
    // Apply each filter condition
    if (filters.type === 'alerts' && node.data.alerts === 0) hidden = true;
    if (filters.nodeType !== 'all' && node.data.type !== filters.nodeType) hidden = true;
    if (node.data.alerts < filters.alertThreshold[0]) hidden = true;
    // ... other conditions
    
    return { ...node, hidden };
  });
}, [nodes, filters]);
```

**Filter Persistence**
- Filter state maintained in React state
- Filters combine using AND logic
- Active filters displayed as badges
- Real-time statistics update based on filtered results

## 📊 Key Features

### Interactive Graph
- **Pan & Zoom**: Navigate large hierarchies easily
- **Node Selection**: Click nodes for detailed information
- **Mini-map**: Overview navigation for large graphs
- **Custom Icons**: Provider-specific styling (AWS orange, GCP blue, etc.)

### Visual Indicators
- **Severity Coloring**: Red (critical), yellow (warning), green (normal)
- **Alert Badges**: 🔺 for alerts, 🛠️ for misconfigurations
- **Expand/Collapse Icons**: ➕ to expand, ➖ to collapse

### Controls
- **Expand All**: Opens entire hierarchy
- **Collapse All**: Closes all nodes except root
- **Filter Panel**: Toggle advanced filtering options
- **Statistics Dashboard**: Real-time metrics

### Responsive Design
- Mobile-friendly layout
- Adaptive filter panel (collapsible on smaller screens)
- Scalable node sizing

## 🎨 Styling System

The application uses a semantic design system with HSL color tokens:

```css
/* Custom CSS variables for theming */
--cloud-primary: 210 100% 50%;    /* Blue */
--aws-primary: 232 89% 78%;       /* Orange */
--gcp-primary: 221 83% 53%;       /* Google Blue */
--alert-critical: 0 84% 60%;      /* Red */
--alert-warning: 38 92% 50%;      /* Yellow */
```

## 🧪 Sample Data

The application includes sample data in `src/data/data.ts` representing:
- 1 Cloud root node
- 4 Cloud accounts (2 AWS, 1 GCP, 1 SaaS)
- 2 Services (S3, RDS)
- Total: 253 alerts, 18 misconfigurations

## 🏗️ Detailed Component Architecture

### Component-Based Design Principles
- **Separation of Concerns**: Each component handles a specific domain
- **Unidirectional Data Flow**: Props down, events up pattern
- **Performance Optimization**: Memoized components and computed values
- **Type Safety**: Full TypeScript coverage for reliable development

### Data Flow Architecture
```
CloudGraphDashboard (State Management)
├── Filter State & Node State
├── Computed Values (useMemo)
└── Event Handlers
    ├── → SimpleFilterPanel (Filter Controls)
    ├── → StatsPanel (Computed Statistics)
    ├── → ReactFlow (Graph Rendering)
    │   └── → CloudNode (Individual Nodes)
    └── → NodeDetailsPanel (Selected Node Details)
```

### Performance Optimization Strategy
- **Memoization**: `useMemo` for expensive filtering operations
- **React.memo**: Components re-render only when props change
- **State Batching**: Multiple state updates grouped together
- **Selective Rendering**: Only visible nodes and edges are rendered

## 🧩 Component Structure

### Core Components

#### 1. `CloudGraphDashboard.tsx` - Main Container
**Responsibilities:**
- State management for nodes, edges, filters, and UI state
- Data processing and filtering logic
- Event handling coordination
- Layout management

**Key Features:**
```typescript
// State Management
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
const [filters, setFilters] = useState<SimpleFilterState>({ ... });
const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

// Computed Values
const filteredNodes = useMemo(() => { ... }, [nodes, filters]);
const filteredEdges = useMemo(() => { ... }, [edges, filteredNodes]);
const stats = useMemo(() => { ... }, [filteredNodes]);
```

#### 2. `CloudNode.tsx` - Individual Node Renderer  
**Responsibilities:**
- Renders individual graph nodes with custom styling
- Handles node-specific interactions (expand/collapse)
- Displays node status indicators and badges
- Manages node icons and colors based on type

**Key Features:**
```typescript
interface CloudNodeData {
  label: string;
  type: 'cloud' | 'aws' | 'gcp' | 'saas' | 'service';
  alerts: number;
  misconfigs: number;
  children?: string[];
  isExpanded: boolean;
  onToggleExpand: (nodeId: string) => void;
  level: number;
}
```

#### 3. `NodeDetailsPanel.tsx` - Node Information Display
**Responsibilities:**
- Shows detailed information for selected nodes
- Displays hierarchical child node relationships
- Provides node metrics and status
- Handles panel visibility and interactions

**Key Features:**
- Click-outside-to-close functionality
- Hierarchical child node display
- Dynamic icon and color theming
- Responsive design with backdrop overlay

#### 4. `SimpleFilterPanel.tsx` - Filter Controls
**Responsibilities:**
- Provides filtering interface with multiple filter types
- Manages filter state and validation
- Displays active filter indicators
- Handles filter reset functionality

**Filter Types Supported:**
- Issue Type: All, Alerts, Misconfigurations
- Node Type: All, Cloud, AWS, GCP, SaaS, Service  
- Threshold Sliders: Alert count (0-150), Misconfiguration count (0-20)
- Visibility: Expanded nodes only

#### 5. `StatsPanel.tsx` - Statistics Dashboard
**Responsibilities:**
- Displays real-time calculated statistics
- Shows filtered vs total counts
- Provides visual summary of current data state
- Updates automatically based on active filters

**Metrics Displayed:**
```typescript
interface StatsData {
  totalNodes: number;
  visibleNodes: number;
  totalAlerts: number;
  totalMisconfigs: number;
  filteredAlerts: number;
  filteredMisconfigs: number;
}
```

#### 6. `FilterBar.tsx` - Quick Filter Actions
**Responsibilities:**
- Provides quick access to common filter operations
- Displays filter state indicators
- Handles expand/collapse all operations
- Shows active filter count

### UI Components (Shadcn/ui)
The application leverages a comprehensive set of UI components in `src/components/ui/`:

```
src/components/ui/
├── AspectRatio.tsx      # Aspect ratio container
├── Badge.tsx            # Status indicators
├── Button.tsx           # Interactive elements  
├── Card.tsx             # Container components
├── Command.tsx          # Command palette
├── Input.tsx            # Input fields
├── Label.tsx            # Form labels
├── Popover.tsx          # Popover overlays
├── Progress.tsx         # Progress bars
├── Separator.tsx        # Layout dividers
├── Skeleton.tsx         # Loading skeletons
├── Slider.tsx           # Range inputs
├── Sonner.tsx           # Toast notifications
├── TextArea.tsx         # Multiline input
├── Toast.tsx            # Toast component
├── Toaster.tsx          # Toast container
├── Tooltip.tsx          # Tooltips
├── useToast.ts          # Toast hook
```

## 🔧 Development & Extension

### Project Structure
```
src/
├── components/
│   ├── CloudGraphDashboard.tsx    # 🏠 Main dashboard orchestrator
│   ├── CloudNode.tsx              # 🎯 Custom node renderer
│   ├── NodeDetailsPanel.tsx       # 📊 Selected node details
│   ├── SimpleFilterPanel.tsx      # 🔍 Advanced filtering
│   ├── FilterBar.tsx              # ⚡ Quick filter actions
│   ├── StatsPanel.tsx             # 📈 Real-time statistics
│   └── ui/                        # 🎨 Reusable UI components
├── pages/
│   ├── Index.tsx                  # 🚀 Application entry point
│   └── NotFound.tsx               # 🔍 404 error page
├── hooks/
│   ├── useMobile.tsx              # 📱 Responsive utilities
│   └── useToast.tsx               # 🔔 Notification system
├── lib/
│   └── utils.ts                   # 🛠️ Helper functions
├── data/
│   └── data.ts                    # 🗂️ Sample data
├── types/
│   └── index.ts                  # 📝 TypeScript types
├── index.css                      # 🎨 Global styles & design tokens
└── main.tsx                       # ⚡ React app initialization
```

### Development Workflow

**1. Adding New Node Types**
```typescript
// 1. Update type definition
// In src/types/index.ts or relevant file
export type NodeType = 'cloud' | 'aws' | 'gcp' | 'saas' | 'service' | 'kubernetes';

// 2. Add styling in index.css
:root {
  --kubernetes-primary: 326 100% 74%;
  --kubernetes-accent: 326 100% 84%;
}

// 3. Update getTypeColors() in CloudNode.tsx
case 'kubernetes':
  return {
    background: 'bg-kubernetes-primary/10',
    border: 'border-kubernetes-primary/30',
    // ...
  };
```

**2. Custom Data Integration**
```typescript
// Replace sample data with API
data fetch logic in CloudGraphDashboard.tsx
const CloudGraphDashboard = () => {
  const [rawData, setRawData] = useState(null);
  
  useEffect(() => {
    fetchInfrastructureData()
      .then(data => {
        const processedNodes = transformToNodes(data);
        const processedEdges = generateEdges(processedNodes);
        setNodes(processedNodes);
        setEdges(processedEdges);
      });
  }, []);
};
```

**3. Adding Custom Filters**
```typescript
// Extend filter interface
interface SimpleFilterState {
  // ... existing filters
  customFilter: {
    enabled: boolean;
    criteria: string;
  };
}

// Add filter logic
const filteredNodes = useMemo(() => {
  return nodes.filter(node => {
    // ... existing conditions
    if (filters.customFilter.enabled) {
      return node.data.someProperty === filters.customFilter.criteria;
    }
    return true;
  });
}, [nodes, filters]);
```

### Extending the Application

**Adding New Node Types**
1. Update the `type` union in `CloudNodeData` and type definitions
2. Add corresponding colors in `index.css`
3. Update the filter options in `SimpleFilterPanel`

**Custom Data Sources**
Replace the sample data in `src/data/data.ts` with your API data.

**Additional Filters**
Extend the `SimpleFilterState` interface and add new filter logic in the `filteredNodes` useMemo hook.

## 📈 Performance Considerations

- **Memoization**: Heavy computations cached with `useMemo`
- **Tree Shaking**: Only visible nodes and edges are rendered
- **Efficient Updates**: State updates batched for smooth interactions
- **Lazy Rendering**: Large hierarchies render incrementally


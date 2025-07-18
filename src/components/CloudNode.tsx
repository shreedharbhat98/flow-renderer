import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { getNodeIcon } from '@/lib/utils';
import { CloudNodeProps } from '@/types';


const getTypeColors = (type: string) => {
  const colorMap = {
    'cloud': {
      bg: 'bg-cloud-secondary',
      border: 'border-cloud',
      icon: 'text-cloud',
      accent: 'bg-cloud'
    },
    'aws': {
      bg: 'bg-aws-secondary',
      border: 'border-aws',
      icon: 'text-aws',
      accent: 'bg-aws'
    },
    'gcp': {
      bg: 'bg-gcp-secondary',
      border: 'border-gcp',
      icon: 'text-gcp',
      accent: 'bg-gcp'
    },
    'azure': {
      bg: 'bg-azure-secondary',
      border: 'border-azure',
      icon: 'text-azure',
      accent: 'bg-azure'
    },
    'saas': {
      bg: 'bg-muted',
      border: 'border-muted-foreground',
      icon: 'text-muted-foreground',
      accent: 'bg-muted-foreground'
    },
    'service': {
      bg: 'bg-secondary',
      border: 'border-secondary',
      icon: 'text-secondary-foreground',
      accent: 'bg-secondary-foreground'
    }
  };

  return colorMap[type] || colorMap.service;
};

const CloudNode = memo(({ data, selected }: CloudNodeProps) => {
  const { bg, border } = getTypeColors(data.type);
  const IconComponent = getNodeIcon(data.type, data.label);

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-graph-connection border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-graph-connection border-2 border-background"
      />
      
      <div 
        className={`
        relative w-20 h-20 rounded-lg p-2 border-2 transition-all duration-200
        ${bg} ${border} ${selected ? 'shadow-lg scale-105' : 'shadow-md hover:shadow-lg hover:scale-[1.02]'}
        flex flex-col items-center justify-center
        cursor-pointer
      `}
      >
        
        {/* Status badges on top */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex gap-1">
          {data.alerts > 0 && (
            <div className="bg-white border border-alert-critical text-alert-critical text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <span>🔺</span>
              <span className="font-medium">{data.alerts}</span>
            </div>
          )}
          {data.misconfigs > 0 && (
            <div className="bg-white border border-alert-warning text-alert-warning text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <span>🛠️</span>
              <span className="font-medium">{data.misconfigs}</span>
            </div>
          )}
        </div>

        {/* Main icon */}
        <div className="mb-1">
          <IconComponent className="w-8 h-8" />
        </div>

        {/* Node name */}
        <div className="text-xs font-medium text-center break-words px-1">
          {data.label}
        </div>
      </div>
    </>
  );
});

CloudNode.displayName = 'CloudNode';

export default CloudNode;
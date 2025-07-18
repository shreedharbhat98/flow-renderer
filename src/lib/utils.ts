import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { 
  Cloud, 
  Database, 
  HardDrive, 
  Shield, 
  Building,
  Layers
} from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getNodeIcon = (type: string, label?: string) => {
  if (type === 'cloud') return Building;
  if (type === 'service') {
    if (label?.toLowerCase().includes('s3')) return HardDrive;
    if (label?.toLowerCase().includes('rds')) return Database;
    return Layers;
  }
  if (type === 'aws') return Cloud;
  if (type === 'gcp') return Cloud;
  if (type === 'azure') return Cloud;
  if (type === 'saas') return Shield;
  return Cloud;
};


export const getTypeColors = (type: string) => {
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
import { memo } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, BarChart3, Grid3X3 } from 'lucide-react';
import { FilterBarProps } from '@/types';


const FilterBar = memo(({ activeFilter, onFilterChange, totalAlerts, totalMisconfigurations }: FilterBarProps) => {
  const filters = [
    {
      key: 'all' as const,
      label: 'All',
      icon: Grid3X3,
      count: null,
      color: 'default'
    },
    {
      key: 'alerts' as const,
      label: 'Alerts',
      icon: AlertTriangle,
      count: totalAlerts,
      color: 'destructive'
    },
    {
      key: 'misconfigurations' as const,
      label: 'Misconfigurations',
      icon: BarChart3,
      count: totalMisconfigurations,
      color: 'warning'
    }
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-card border rounded-lg">
      {filters.map(({ key, label, icon: Icon, count, color }) => (
        <Button
          key={key}
          variant={activeFilter === key ? "default" : "ghost"}
          size="sm"
          onClick={() => onFilterChange(key)}
          className={`
            flex items-center gap-2 transition-all duration-200
            ${activeFilter === key ? 'shadow-sm' : 'hover:bg-muted/50'}
            ${color === 'destructive' && activeFilter === key ? 'bg-alert-critical/10 text-alert-critical border-alert-critical/20' : ''}
            ${color === 'warning' && activeFilter === key ? 'bg-alert-warning/10 text-alert-warning border-alert-warning/20' : ''}
          `}
        >
          <Icon className="w-4 h-4" />
          <span className="font-medium">{label}</span>
          {count !== null && (
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-bold
              ${activeFilter === key 
                ? 'bg-white/20 text-current' 
                : color === 'destructive' 
                  ? 'bg-alert-critical/10 text-alert-critical'
                  : color === 'warning'
                    ? 'bg-alert-warning/10 text-alert-warning'
                    : 'bg-muted text-muted-foreground'
              }
            `}>
              {count}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
});

FilterBar.displayName = 'FilterBar';

export default FilterBar;
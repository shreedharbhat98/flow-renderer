import { memo } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Slider";
import {
  AlertTriangle,
  BarChart3,
  Grid3X3,
  Building,
  Cloud,
  Layers,
  Filter,
  X,
  RefreshCw,
} from "lucide-react";
import { SimpleFilterPanelProps, SimpleFilterState } from "@/types";

const SimpleFilterPanel = memo(
  ({
    filters,
    onFiltersChange,
    stats,
    isOpen,
    onToggle,
  }: SimpleFilterPanelProps) => {
    const handleFilterChange = (key: keyof SimpleFilterState, value: any) => {
      onFiltersChange({ ...filters, [key]: value });
    };

    const resetFilters = () => {
      onFiltersChange({
        type: "all",
        nodeType: "all",
        alertThreshold: [0],
        misconfigThreshold: [0],
        expandedOnly: false,
      });
    };

    const activeFilterCount = Object.entries(filters).reduce(
      (count, [key, value]) => {
        if (key === "type" && value !== "all") return count + 1;
        if (key === "nodeType" && value !== "all") return count + 1;
        if (key === "alertThreshold" && Array.isArray(value) && value[0] > 0)
          return count + 1;
        if (
          key === "misconfigThreshold" &&
          Array.isArray(value) &&
          value[0] > 0
        )
          return count + 1;
        if (key === "expandedOnly" && value) return count + 1;
        return count;
      },
      0
    );

    if (!isOpen) {
      return (
        <Button
          variant="outline"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      );
    }

    return (
      <Card className="p-6 space-y-6 border-graph-border min-w-[300px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <h3 className="font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <Building className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{stats.cloudNodes}</div>
            <div className="text-xs text-muted-foreground">Cloud</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <Cloud className="w-4 h-4 mx-auto mb-1 text-aws" />
            <div className="text-lg font-bold">{stats.awsNodes}</div>
            <div className="text-xs text-muted-foreground">AWS</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <Cloud className="w-4 h-4 mx-auto mb-1 text-gcp" />
            <div className="text-lg font-bold">{stats.gcpNodes}</div>
            <div className="text-xs text-muted-foreground">GCP</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <Layers className="w-4 h-4 mx-auto mb-1 text-secondary" />
            <div className="text-lg font-bold">{stats.serviceNodes}</div>
            <div className="text-xs text-muted-foreground">Services</div>
          </div>
        </div>

        <Separator />

        {/* Filter Type */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Filter by Issue Type</h4>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all", label: "All", icon: Grid3X3 },
              { key: "alerts", label: "Alerts Only", icon: AlertTriangle },
              {
                key: "misconfigurations",
                label: "Misconfigs Only",
                icon: BarChart3,
              },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={filters.type === key ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("type", key)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Node Type Filter */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Filter by Node Type</h4>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all", label: "All" },
              { key: "cloud", label: "Cloud" },
              { key: "aws", label: "AWS" },
              { key: "gcp", label: "GCP" },
              { key: "saas", label: "SaaS" },
              { key: "service", label: "Services" },
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={filters.nodeType === key ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange("nodeType", key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Threshold Filters */}
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Minimum Alerts</h4>
            <Slider
              value={filters.alertThreshold}
              onValueChange={(value) =>
                handleFilterChange("alertThreshold", value)
              }
              max={Math.max(stats.totalAlerts / 10, 100)}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              Showing nodes with ≥ {filters.alertThreshold[0]} alerts
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Minimum Misconfigurations</h4>
            <Slider
              value={filters.misconfigThreshold}
              onValueChange={(value) =>
                handleFilterChange("misconfigThreshold", value)
              }
              max={Math.max(stats.totalMisconfigs / 10, 20)}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              Showing nodes with ≥ {filters.misconfigThreshold[0]}{" "}
              misconfigurations
            </div>
          </div>
        </div>

        <Separator />

        {/* Additional Options */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Additional Options</h4>
          <Button
            variant={filters.expandedOnly ? "default" : "outline"}
            size="sm"
            onClick={() =>
              handleFilterChange("expandedOnly", !filters.expandedOnly)
            }
            className="w-full"
          >
            {filters.expandedOnly
              ? "Showing Expanded Only"
              : "Show Expanded Only"}
          </Button>
        </div>
      </Card>
    );
  }
);

SimpleFilterPanel.displayName = "SimpleFilterPanel";

export default SimpleFilterPanel;

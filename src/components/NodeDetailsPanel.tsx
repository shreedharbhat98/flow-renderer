import { memo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { X, AlertTriangle, BarChart3 } from "lucide-react";
import { NodeDetailsPanelProps } from "@/types";
import { getNodeIcon } from "@/lib/utils";

const getTypeColors = (type: string) => {
  const colorMap = {
    'cloud': 'bg-cloud text-white',
    'aws': 'bg-aws text-white',
    'gcp': 'bg-gcp text-white',
    'azure': 'bg-azure text-white',
    'saas': 'bg-muted text-muted-foreground',
    'service': 'bg-secondary text-secondary-foreground'
  };
  return colorMap[type] || colorMap.service;
};

const NodeDetailsPanel = memo(({ node, onClose }: NodeDetailsPanelProps) => {
  if (!node) return null;

  const IconComponent = getNodeIcon(node.type, node.label);
  const typeColors = getTypeColors(node.type);

  return (
    <>
      <div className="absolute inset-0 z-40" onClick={onClose} />

      <div className="absolute top-6 right-6 z-50 w-64">
        <Card className="border-graph-border shadow-lg bg-background">
          <div className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${typeColors}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{node.label}</h3>
                <Badge variant="outline" className="text-xs">
                  {node.type.toUpperCase()}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-1 bg-alert-critical/10 rounded border border-alert-critical/20">
                <div className="flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-alert-critical" />
                  <span className="text-lg font-bold text-alert-critical">
                    {node.alerts}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">Alerts</div>
              </div>
              <div className="text-center p-1 bg-alert-warning/10 rounded border border-alert-warning/20">
                <div className="flex items-center justify-center gap-1">
                  <BarChart3 className="w-3 h-3 text-alert-warning" />
                  <span className="text-lg font-bold text-alert-warning">
                    {node.misconfigs}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">Misconfigs</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <h4 className="font-medium text-sm">Node Information</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                    {node.label.toLowerCase().replace(/\s+/g, "-")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize">{node.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level:</span>
                  <span>{node.level + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      node.alerts > 100
                        ? "bg-red-100 text-red-700"
                        : node.alerts > 50
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {node.alerts > 100
                      ? "Critical"
                      : node.alerts > 50
                      ? "Warning"
                      : "Normal"}
                  </span>
                </div>
              </div>
            </div>

            {node.children && node.children.length > 0 && (
              <>
                <Separator />
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Child Nodes</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Children Count:
                      </span>
                      <span>{node.children.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expanded:</span>
                      <span
                        className={
                          node.isExpanded
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }
                      >
                        {node.isExpanded ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {node.children.map((childId) => (
                      <Badge
                        key={childId}
                        variant="secondary"
                        className="text-xs"
                      >
                        {childId}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
});

NodeDetailsPanel.displayName = "NodeDetailsPanel";

export default NodeDetailsPanel;

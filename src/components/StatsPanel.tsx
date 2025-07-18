import { memo } from "react";
import { Card } from "@/components/ui/Card";
import { AlertTriangle, BarChart3, TrendingUp, Shield } from "lucide-react";
import { StatsPanelProps } from "@/types";

const StatsPanel = memo(
  ({
    totalAlerts,
    totalMisconfigurations,
    totalProviders,
    criticalAlerts,
  }: StatsPanelProps) => {
    const stats = [
      {
        label: "Total Alerts",
        value: totalAlerts,
        icon: AlertTriangle,
        color: "text-alert-critical",
        bg: "bg-alert-critical/10",
      },
      {
        label: "Misconfigurations",
        value: totalMisconfigurations,
        icon: BarChart3,
        color: "text-alert-warning",
        bg: "bg-alert-warning/10",
      },
      {
        label: "Critical Issues",
        value: criticalAlerts,
        icon: TrendingUp,
        color: "text-destructive",
        bg: "bg-destructive/10",
      },
      {
        label: "Providers",
        value: totalProviders,
        icon: Shield,
        color: "text-primary",
        bg: "bg-primary/10",
      },
    ];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="p-4 border-graph-border">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {label}
                </p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
);

StatsPanel.displayName = "StatsPanel";

export default StatsPanel;

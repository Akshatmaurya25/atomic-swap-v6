import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  formatCurrency,
  formatPercentage,
  timeAgo,
  truncateAddress,
} from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type:
    | "arbitrage"
    | "deposit"
    | "withdrawal"
    | "bot_start"
    | "bot_stop"
    | "trade";
  status: "success" | "failed" | "pending";
  timestamp: Date;
  description: string;
  amount?: number;
  profit?: number;
  profitPercentage?: number;
  txHash?: string;
  fromChain?: string;
  toChain?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  maxItems?: number;
}

export function RecentActivity({
  activities,
  maxItems = 10,
}: RecentActivityProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-400" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-400 animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="success" size="sm">
            Success
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="error" size="sm">
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" size="sm">
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="sm">
            Unknown
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "arbitrage":
        return <TrendingUp className="h-4 w-4 text-yellow-400" />;
      case "deposit":
        return <ArrowDownRight className="h-4 w-4 text-green-400" />;
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-blue-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Recent Activity</span>
          <Badge variant="default" size="sm">
            {activities.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors duration-200"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(activity.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(activity.type)}
                      <p className="text-sm font-medium text-white truncate">
                        {activity.description}
                      </p>
                    </div>
                    {getStatusBadge(activity.status)}
                  </div>

                  {/* Additional details based on activity type */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span>{timeAgo(activity.timestamp)}</span>

                    {activity.amount && (
                      <span>Amount: {formatCurrency(activity.amount)}</span>
                    )}

                    {activity.profit && activity.profitPercentage && (
                      <span className="text-green-400">
                        Profit: {formatCurrency(activity.profit)} (
                        {formatPercentage(activity.profitPercentage)})
                      </span>
                    )}

                    {activity.fromChain && activity.toChain && (
                      <span>
                        {activity.fromChain} → {activity.toChain}
                      </span>
                    )}

                    {activity.txHash && (
                      <button
                        className="flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                        onClick={() =>
                          window.open(
                            `https://etherscan.io/tx/${activity.txHash}`,
                            "_blank"
                          )
                        }
                      >
                        <span>{truncateAddress(activity.txHash)}</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

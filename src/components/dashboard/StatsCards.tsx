import React, { useMemo } from "react";
import { useLanguage } from "@/contexts/language-context";
import {
  Wrench,
  Users,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalJobs: number;
    activeCustomers: number;
    totalTechnicians: number;
    pendingJobs: number;
    completedJobs: number;
    inProgressJobs: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = React.memo(({ stats }) => {
  const { t } = useLanguage();
  
  const cards = useMemo(() => [
    {
      title: t("stats.totalJobs"),
      value: stats.totalJobs,
      icon: Wrench,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      gradient: "from-blue-500 to-blue-600",
      description: t("stats.allTimeJobs"),
    },
    {
      title: t("stats.activeCustomers"),
      value: stats.activeCustomers,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
      gradient: "from-green-500 to-green-600",
      description: t("stats.engagedCustomers"),
    },
    {
      title: t("stats.technicians"),
      value: stats.totalTechnicians,
      icon: User,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      gradient: "from-purple-500 to-purple-600",
      description: t("stats.teamMembers"),
    },
    {
      title: t("stats.pendingJobs"),
      value: stats.pendingJobs,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      gradient: "from-orange-500 to-orange-600",
      description: t("stats.awaitingStart"),
    },
    {
      title: t("stats.inProgress"),
      value: stats.inProgressJobs,
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      gradient: "from-yellow-500 to-yellow-600",
      description: t("stats.currentlyWorking"),
    },
    {
      title: t("stats.completed"),
      value: stats.completedJobs,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      gradient: "from-emerald-500 to-emerald-600",
      description: t("stats.successfullyFinished"),
    },
  ], [t, stats]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="group bg-white overflow-hidden shadow-sm hover:shadow-lg rounded-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 card-hover"
            tabIndex={0}
            role="button"
            aria-label={`View ${card.title.toLowerCase()} statistics`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                // Could add click handler here for future functionality
              }
            }}
          >
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-2 md:p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`h-5 w-5 md:h-6 md:w-6 ${card.color}`} />
                </div>
                {/* Status indicator based on value */}
                <div className="flex items-center space-x-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      card.value > 0 ? "bg-green-500" : "bg-gray-300"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-gray-500 font-medium">
                    {card.value > 0 ? t("stats.active") : t("stats.none")}
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {card.title}
                </dt>
                <dd className="text-2xl md:text-3xl font-bold text-gray-900">
                  {card.value.toLocaleString()}
                </dd>
              </div>

              <p className="text-xs text-gray-400">{card.description}</p>
            </div>

            {/* Gradient accent line */}
            <div
              className={`h-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              aria-hidden="true"
            />
          </div>
        );
      })}
    </div>
  );
});


"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ServiceItem, ServiceStatus } from "@/lib/api/getstatus";
import { CheckCircle2, XCircle, Activity } from "lucide-react";

export function ServicesStatus( {services} : {services:ServiceItem[]}) {
  const unhealthyCount = services.filter(
    (service) => service.status !== "healthy"
  ).length;

  return (
    <Card className="w-full shadow-sm rounded-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-500" />
            System Status
          </CardTitle>
          <CardDescription className="mt-1">
            Current health of microservices
          </CardDescription>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            unhealthyCount === 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {unhealthyCount === 0
            ? "All Operational"
            : `${unhealthyCount} Issue(s)`}
        </span>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={service.service}>
              <div className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-3">
                  {service.status === "healthy" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}

                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {service.service}
                  </span>
                </div>

                <span
                  className={`text-xs font-medium ${
                    service.status === "healthy"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {service.status}
                </span>
              </div>

              {index !== services.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

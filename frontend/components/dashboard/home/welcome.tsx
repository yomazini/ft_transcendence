
"use client";

import { Moon, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSelectedJobId } from "@/hooks/useSelectedJob";
import { useExportReport } from "@/hooks/use-exportReport";
import { toast } from "sonner";

export default function Welcome() {
  const { name } = useCurrentUser();
  const { expLoading, exportRep } = useExportReport();
  const id = useSelectedJobId();

  const handleExport = async (format: "CSV" | "XLSX" | "JSON") => {
    try {
      await exportRep(id, format);

      toast.success("Report exported successfully!", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Export Failed", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong",
        duration: 4000,
      });
    }
  };

  return (
    <section className="relative grid min-w-0 grid-cols-1 overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/50 to-purple-100/70 shadow-sm dark:border-white/10 dark:from-zinc-950 dark:via-zinc-900 dark:to-violet-950/60 lg:grid-cols-3">

      {/* Decorative gradient */}
      <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-[65%] rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-600/10" />

      {/* Welcome content */}
      <div className="relative z-10 flex min-h-[220px] min-w-0 flex-col justify-center gap-4 p-6 sm:p-8 lg:col-span-2">

        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
            <Moon className="size-5" />
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
            Good Evening{name ? `, ${name}` : ""} 👋
          </h1>
        </div>

        <p className="max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Stay informed with today&apos;s analytics. Get a quick
          snapshot of key statistics.
        </p>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  disabled={expLoading}
                  className="h-10 gap-2 rounded-xl bg-violet-600 px-5 font-medium text-white shadow-sm shadow-violet-500/20 transition-all hover:bg-violet-700 hover:shadow-md hover:shadow-violet-500/20 dark:bg-violet-600 dark:hover:bg-violet-500"
                >
                  <Download className="size-4" />
                  {expLoading ? "Exporting..." : "Export data"}
                </Button>
              }
            />

            <DropdownMenuContent
              align="start"
              className="w-44 rounded-xl"
            >
              <DropdownMenuItem
                onClick={() => handleExport("CSV")}
              >
                Export as CSV
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleExport("XLSX")}
              >
                Export as XLSX
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleExport("JSON")}
              >
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 sm:flex">
            <Sparkles className="size-3.5 text-violet-500" />
            Your analytics workspace
          </div>
        </div>
      </div>

      {/* Illustration */}
      <div className="relative hidden min-h-[220px] items-end justify-end lg:flex">
        <div className="absolute bottom-0 right-0 h-44 w-72 rounded-tl-[100px] bg-violet-200/30 dark:bg-violet-500/10" />

        <Image
          src="/analytic-user.svg"
          width={320}
          height={320}
          alt="Analytics illustration"
          className="relative z-10 max-h-[235px] w-auto object-contain object-bottom"
          priority
        />
      </div>
    </section>
  );
}

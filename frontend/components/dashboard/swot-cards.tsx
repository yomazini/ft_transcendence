
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

import type { LucideIcon } from "lucide-react";

type CardItem =
  | string
  | {
      point?: string;
      action?: string;
      text?: string;
      [key: string]: unknown;
    };

type CardsProps = {
  items: CardItem[] | string | null;
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: string;
};

export function Cards({
  items,
  icon: Icon,
  title,
  description,
  iconColor,
}: CardsProps) {
  const textOf = (item: CardItem): string => {
    if (typeof item === "string") {
      return item;
    }

    return String(
      item.point ??
      item.action ??
      item.text ??
      JSON.stringify(item)
    );
  };

  const normalizedItems: CardItem[] =
    items === null
      ? []
      : typeof items === "string"
        ? [items]
        : items;

  return (
    <Card
      className="
        stat-card group
        flex flex-col
        h-[250px]
        w-full
        min-w-0
        max-w-full
        overflow-hidden
      "
    >
      <CardHeader className="shrink-0 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <h3 className="min-w-0 truncate text-base font-semibold text-zinc-900 dark:text-white">
            {title}
          </h3>

          <div className="
          flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300">
            <Icon
              className={`size-5 ${iconColor} size-4 text-amber-500 dark:text-amber-400`}
            />
          </div>
        </div>

        <p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-200">
          {description}
        </p>
      </CardHeader>

      <CardContent
        className="
          relative
          min-h-0
          min-w-0
          flex-1
          overflow-y-auto
          overflow-x-hidden
          pr-3
        "
      >
        {normalizedItems.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nothing found for this job.
          </p>
        ) : (
          <ul className="flex min-w-0 flex-col gap-2">
            {normalizedItems.map((item, index) => (
              <li
                key={`${title}-${index}`}
                className="stat-list-item group flex min-w-0 items-start gap-2"
              >
                <span className="stat-list-dot mt-1.5 shrink-0" />

                <span className="min-w-0 flex-1 whitespace-normal break-words [overflow-wrap:anywhere] text-sm  text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {textOf(item)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

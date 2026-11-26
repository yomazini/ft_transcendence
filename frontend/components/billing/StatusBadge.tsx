


export function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        succeeded: "bg-green-500/10 text-green-600 dark:text-green-400",
        active: "bg-green-500/10 text-green-600 dark:text-green-400",
        pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        failed: "bg-red-500/10 text-red-600 dark:text-red-400",
        canceled: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        expired: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
        free: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    };

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status] ?? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
        >
            {status}
        </span>
    );
}
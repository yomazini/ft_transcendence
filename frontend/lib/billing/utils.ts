

export function formatDate(value: string | null) {
    return value
        ? new Date(value).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : "—";
}

export function formatAmount(cents: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(cents / 100);
}


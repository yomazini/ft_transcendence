import { type Payment } from "@/lib/api/billing";
import { formatAmount, formatDate } from "@/lib/billing/utils";
import { CreditCard, Download } from "lucide-react";

export default function PaymentHistory({ payments }: { payments: Payment[] }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mt-20">
        Payment history
      </h2>
      <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
        {payments.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <div className="mb-3 rounded-xl bg-orange-50 p-3 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
              <CreditCard className="size-7" />
            </div>
            <p className="font-medium">No payments yet</p>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              Your payment history will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-zinc-800/50 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Amount</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-white/10"
                  >
                    <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      {formatAmount(payment.amount_cents, payment.currency)}
                    </td>
                    <td className="px-5 py-4 capitalize">
                      {payment.status ?? "Unknown"}
                    </td>
                    <td className="px-5 py-4">
                      {payment.invoice_pdf ? (
                        <a
                          href={payment.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-500 dark:text-orange-400"
                        >
                          <Download className="size-4" />
                          PDF
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
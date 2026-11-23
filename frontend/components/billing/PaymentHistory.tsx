import { type Payment } from "@/lib/api/billing";
import { formatAmount, formatDate } from "@/lib/billing/utils";
import { CreditCard } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import PendingPayment from "./PendingPayment";



export default function PaymentHistory({ payments }: { payments: Payment[] }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mt-20">Payment history</h2>
      <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
        {payments.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <div className="mb-3 rounded-xl bg-orange-50 p-3 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
              <CreditCard className="size-7" />
            </div>
            <p className="font-medium">No payments yet</p>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">Your payment history will appear here.</p>
          </div>
        ) : (
          <>
            <PendingPayment paymentsID={payments[0]} />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-zinc-800/50 dark:text-zinc-400">
                  <tr>
                    <th className="px-5 py-4 font-medium">Plan</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 font-medium">Amount</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-zinc-100 last:border-0 dark:border-white/10">
                      <td className="px-5 py-4 font-medium capitalize">{payment.plan}</td>
                      <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300">{formatDate(payment.created_at)}</td>
                      <td className="px-5 py-4">{formatAmount(payment.amount_cents, payment.currency)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={payment.status} />
                        {payment.status === "failed" && payment.failure_reason && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{payment.failure_reason}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

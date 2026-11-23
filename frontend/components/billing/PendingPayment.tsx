"use client";

import { useEffect, useState } from "react";
import { CreditCard, ArrowRight, Clock3 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { cancelPending, type Payment } from "@/lib/api/billing";
import { getMe, User } from "@/lib/auth";
import { toast } from "sonner";

export default function PendingPayment({ paymentsID }: { paymentsID: Payment }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    // console.log(paymentsID);

    useEffect(() => {
        if (paymentsID.status == "pending")
            setOpen(true);
    }, []);

    async function resumePayment() {
        try {

            const me = await getMe();
            window.location.assign(
                `/${me.id}/billing/checkout?payment_id=${encodeURIComponent(paymentsID.id)}`
            );
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to create checkout.",
            );
        }
    }

    async function cancelPayment() {
        if (loading) return;

        setLoading(true);

        try {
            await cancelPending(paymentsID.id);
            toast.success("Payment cancelled successfully");
            setOpen(false);
            window.location.reload();
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to cancel payment."
            );
        }
        //  finally {
        //     setLoading(false);
        // }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md rounded-2xl border-zinc-200 bg-white p-7 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
                <DialogHeader className="items-center text-center sm:text-center">
                    <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-500/10">
                        <CreditCard className="size-8 text-orange-500" />
                    </div>

                    <DialogTitle className="text-2xl font-bold text-zinc-900 dark:text-white">
                        Pending Payment
                    </DialogTitle>

                    <DialogDescription className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                        You have an unfinished payment <span className="text-orange-500">{paymentsID.plan}</span> . Would you like to
                        continue your checkout?
                    </DialogDescription>
                </DialogHeader>

                <div className="my-3 flex items-center justify-center gap-2 rounded-xl bg-orange-50 px-4 py-3 dark:bg-orange-500/10">
                    <Clock3 className="size-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                        Waiting for payment
                    </span>
                </div>

                <DialogFooter className="mt-3 flex gap-3 sm:justify-center">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={cancelPayment}
                        className="h-12 flex-1 rounded-xl border border-zinc-200 bg-white px-5 text-base font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        {loading ? "Cancelling..." : "Cancel"}
                    </button>

                    <button
                        type="button"
                        onClick={resumePayment}
                        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 px-5 text-base font-semibold text-white shadow-md shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600"
                    >
                        Continue
                        <ArrowRight className="size-5" />
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}



"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    Loader2,
    LockKeyhole,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { getMe } from "@/lib/auth";

import {
    getPayments,
    simulatePayment as submitSimulatedPayment,
    type Payment,
    type SimulationOutcome,
} from "@/lib/api/billing";

const PLANS = {
    premium: {
        name: "Premium",
        price: 29,
        maxUsers: 5,
    },
    extra: {
        name: "Extra",
        price: 59,
        maxUsers: 20,
    },
} as const;

export default function CheckoutPage() {
    const router = useRouter();
    const params = useParams<{ "uuid-user": string }>();
    const searchParams = useSearchParams();

    const userId = params["uuid-user"];
    const paymentId = searchParams.get("payment_id");

    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] =
  useState<SimulationOutcome | null>(null);
    const [error, setError] = useState<string | null>(null);

    const billingUrl = `/${userId}/billing`;

    useEffect(() => {
        let active = true;

        async function initialize() {
            try {
                if (!paymentId) {
                    throw new Error("Missing payment ID.");
                }

                const user = await getMe();

                if (!active) return;

                if (user.id !== userId) {
                    router.replace(`/${user.id}/dashboard`);
                    return;
                }

                if (user.role !== "Admin") {
                    router.replace(billingUrl);
                    return;
                }

                const payments = await getPayments();

                if (!active) return;

                const currentPayment = payments.find(
                    (item) => item.id === paymentId,
                );

                if (!currentPayment) {
                    throw new Error("Payment not found.");
                }

                if (currentPayment.status !== "pending") {
                    throw new Error(
                        `Payment is already ${currentPayment.status}.`,
                    );
                }

                if (
                    currentPayment.plan !== "premium" &&
                    currentPayment.plan !== "extra"
                ) {
                    throw new Error("Invalid payment plan.");
                }

                setPayment(currentPayment);
            } catch (err) {
                if (!active) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load checkout.",
                );
            } finally {
                if (active) setLoading(false);
            }
        }

        void initialize();

        return () => {
            active = false;
        };
    }, [paymentId, userId, router, billingUrl]);


    async function simulatePayment(outcome: SimulationOutcome) {
        if (!paymentId || !payment || processing) return;

        setProcessing(outcome);

        try {
            const result = await submitSimulatedPayment(
                paymentId,
                outcome,
            );

            if (
                result.status !== "succeeded" &&
                result.status !== "failed"
            ) {
                throw new Error("Unexpected payment status.");
            }

            if (result.status === "succeeded") {
                toast.success("Simulated payment completed.");
            } else {
                toast.error("Simulated payment declined.");
            }

            router.replace(
                `${billingUrl}?payment_id=${encodeURIComponent(paymentId)}`,
            );
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to process payment.",
            );

            setProcessing(null);
        }
    }


    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !payment) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
                    <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />

                    <h1 className="text-xl font-semibold">
                        Checkout unavailable
                    </h1>

                    <p className="mt-3 text-sm text-muted-foreground">
                        {error ?? "Unable to load payment."}
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push(billingUrl)}
                        className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                        Return to billing
                    </button>
                </div>
            </div>
        );
    }

    const plan =
        payment.plan === "premium"
            ? PLANS.premium
            : PLANS.extra;

    return (
        <main className="min-h-screen bg-background px-4 py-12 text-foreground">
            <div className="mx-auto w-full max-w-lg">
                {/* Header */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => router.push(billingUrl)}
                        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to billing
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-3">
                            <CreditCard className="h-6 w-6 text-primary" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                InsightFlow Checkout
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Stripe Mock — Development Environment
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order summary */}
                <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="border-b p-6">
                        <h2 className="text-lg font-semibold">
                            Order summary
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Review your simulated purchase.
                        </p>
                    </div>

                    <div className="space-y-6 p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-semibold">
                                    InsightFlow {plan.name}
                                </h3>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Up to {plan.maxUsers} organization members
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    30 days of access
                                </p>
                            </div>

                            <span className="text-xl font-bold">
                                ${(payment.amount_cents / 100).toFixed(2)}
                            </span>
                        </div>

                        <div className="border-t pt-5">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Total</span>

                                <span className="text-2xl font-bold">
                                    ${(payment.amount_cents / 100).toFixed(2)}
                                </span>
                            </div>

                            <p className="mt-2 text-xs text-muted-foreground">
                                Currency: {payment.currency}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Payment simulator */}
                <section className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />

                        <h2 className="text-lg font-semibold">
                            Simulate payment
                        </h2>
                    </div>

                    <p className="mb-6 text-sm leading-6 text-muted-foreground">
                        Choose a payment outcome to test your billing
                        integration. No real card information or money
                        is involved.
                    </p>

                    <div className="space-y-3">
                        <button
                            type="button"
                            disabled={processing !== null}
                            onClick={() => simulatePayment("succeeded")}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing === "succeeded" ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5" />
                            )}

                            Simulate successful payment
                        </button>

                        <button
                            type="button"
                            disabled={processing !== null}
                            onClick={() => simulatePayment("failed")}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 px-4 py-3 font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing === "failed" ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <XCircle className="h-5 w-5" />
                            )}

                            Simulate declined payment
                        </button>
                    </div>

                    <div className="mt-6 flex items-start gap-2 rounded-xl bg-muted/50 p-4">
                        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                        <p className="text-xs leading-5 text-muted-foreground">
                            This is a local testing interface. Stripe Mock
                            validates API requests, while your NestJS
                            backend records simulated payment outcomes.
                            This is not a real Stripe Checkout page.
                        </p>
                    </div>
                </section>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-muted-foreground">
                    InsightFlow Billing — Development Only
                </p>
            </div>
        </main>
    );
}

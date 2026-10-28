
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
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
  premium: { name: "Premium", maxUsers: 5 },
  extra: { name: "Extra", maxUsers: 20 },
} as const;

// Test-only card numbers. Never accept real card data.
const TEST_CARDS: Record<string, SimulationOutcome> = {
  "4242424242424242": "succeeded",
  "4000000000000002": "failed",
  "4000000000009995": "failed",
};

function formatCard(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function validExpiry(value: string) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();

  if (month < 1 || month > 12) return false;

  return (
    year > now.getFullYear() ||
    (year === now.getFullYear() &&
      month >= now.getMonth() + 1)
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams<{ "uuid-user": string }>();
  const searchParams = useSearchParams();

  const userId = params["uuid-user"];
  const paymentId = searchParams.get("payment_id");
  const billingUrl = `/${userId}/billing`;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholder, setCardholder] = useState("");

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        if (!paymentId) throw new Error("Missing payment ID.");

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

  async function handlePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!payment || !paymentId || processing) return;

    const number = cardNumber.replace(/\s/g, "");

    if (!cardholder.trim()) {
      toast.error("Enter the cardholder name.");
      return;
    }

    if (!validExpiry(expiry)) {
      toast.error("Enter a valid future expiration date.");
      return;
    }

    if (!/^\d{3}$/.test(cvc)) {
      toast.error("Enter a valid 3-digit test CVC.");
      return;
    }

    const outcome = TEST_CARDS[number];

    if (!outcome) {
      toast.error(
        "Unsupported test card. Use one of the provided test numbers.",
      );
      return;
    }

    setProcessing(true);

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
        toast.success("Test payment successful!");
      } else {
        toast.error("Test payment declined.");
      }

      router.replace(
        `${billingUrl}?payment_id=${encodeURIComponent(paymentId)}`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to process test payment.",
      );
    } finally {
      setProcessing(false);
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
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold">
            Checkout unavailable
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {error ?? "Unable to load payment."}
          </p>
          <button
            onClick={() => router.push(billingUrl)}
            className="mt-6 rounded-lg bg-primary px-6 py-3 text-primary-foreground"
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

  const total = (payment.amount_cents / 100).toFixed(2);

  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto w-full max-w-lg">
        <button
          type="button"
          onClick={() => router.push(billingUrl)}
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to billing
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              InsightFlow Checkout
            </h1>
            <p className="text-sm text-muted-foreground">
              Test payment environment — no real charges
            </p>
          </div>
        </div>

        {/* Order summary */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">
            Order summary
          </h2>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium">
                InsightFlow {plan.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Up to {plan.maxUsers} members
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                30 days of access
              </p>
            </div>
            <span className="font-semibold">${total}</span>
          </div>

          <div className="mt-6 flex justify-between border-t pt-5">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold">
              ${total}
            </span>
          </div>
        </section>

        {/* Test card form */}
        <section className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              Pay with test card
            </h2>
          </div>

          <p className="mb-6 text-sm text-muted-foreground">
            Use the test card details below. Never enter
            real payment information.
          </p>

          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <label
                htmlFor="cardholder"
                className="mb-2 block text-sm font-medium"
              >
                Cardholder name
              </label>
              <input
                id="cardholder"
                type="text"
                autoComplete="off"
                placeholder="Test User"
                value={cardholder}
                onChange={(e) =>
                  setCardholder(e.target.value)
                }
                required
                className="h-11 w-full rounded-lg border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label
                htmlFor="card-number"
                className="mb-2 block text-sm font-medium"
              >
                Card number
              </label>
              <div className="relative">
                <input
                  id="card-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCard(e.target.value))
                  }
                  required
                  maxLength={19}
                  className="h-11 w-full rounded-lg border bg-background px-3 pr-11 outline-none focus:ring-2 focus:ring-ring"
                />
                <CreditCard className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="expiry"
                  className="mb-2 block text-sm font-medium"
                >
                  Expiration date
                </label>
                <input
                  id="expiry"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) =>
                    setExpiry(formatExpiry(e.target.value))
                  }
                  required
                  className="h-11 w-full rounded-lg border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="cvc"
                  className="mb-2 block text-sm font-medium"
                >
                  CVC
                </label>
                <input
                  id="cvc"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="123"
                  maxLength={3}
                  value={cvc}
                  onChange={(e) =>
                    setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  required
                  className="h-11 w-full rounded-lg border bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <LockKeyhole className="h-4 w-4" />
                  Pay ${total}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium">
              Available test cards
            </p>
            <p className="text-xs text-muted-foreground">
              Success: 4242 4242 4242 4242
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Declined: 4000 0000 0000 0002
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Use a future expiration date and any 3-digit
              test CVC.
            </p>
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          InsightFlow Billing — Local Test Simulator Only
        </p>
      </div>
    </main>
  );
}

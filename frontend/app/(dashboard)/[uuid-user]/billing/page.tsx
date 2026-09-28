import { CreditCard, Users, ReceiptText } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="mx-auto w-full max-w-4xl border-x border-border bg-background border-t border-b">
      <div className="border-b border-border px-6 py-7">
        <h1 className="text-2xl font-semibold tracking-tight">
          Billing
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription, payment method and billing information.
        </p>
      </div>

      <div className="h-8 border-b border-border bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:16px_16px]" />

      <section className="px-6 py-12">
        <div>
          <h2 className="text-lg font-semibold">Current plan</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your current subscription and usage.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between rounded-lg border border-border p-5">
          <div>
            <p className="text-sm text-muted-foreground">Your plan</p>

            <div className="mt-1 flex items-center gap-3">
              <h3 className="text-xl font-semibold">Free</h3>

              <span className="rounded-full  px-2.5 py-1 text-xs font-medium bg-green-200 ">
                Current plan
              </span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Up to 3 users
            </p>
          </div>

          <button className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90">
            Upgrade plan
          </button>
        </div>
      </section>

      <div className="h-8 border-y border-border bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:16px_16px]" />

      <section className="px-6 py-12">
        <div>
          <h2 className="text-lg font-semibold">Usage</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor your team's usage for the current plan.
          </p>
        </div>

        <div className="mt-8 border-t border-border">
          <div className="flex items-center justify-between border-b border-border py-5">
            <div className="flex items-center gap-3">
              <Users className="size-4 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">Team members</p>
                <p className="text-sm text-muted-foreground">
                  Users in your organization
                </p>
              </div>
            </div>

            <p className="text-sm font-medium">
              2 / 3
            </p>
          </div>

          <div className="py-5">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">
                Usage
              </span>

              <span className="font-medium">
                67%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: "67%" }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="h-8 border-y border-border bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:16px_16px]" />

      <section className="px-6 py-12">
        <div>
          <h2 className="text-lg font-semibold">Payment method</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the payment method used for your subscription.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-md border border-border">
              <CreditCard className="size-4 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm font-medium">
                No payment method
              </p>

              <p className="text-sm text-muted-foreground">
                Add a payment method when upgrading your plan.
              </p>
            </div>
          </div>

          <button className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            Add payment method
          </button>
        </div>
      </section>

      <div className="h-8 border-y border-border bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:16px_16px]" />

      <section className="px-6 py-12">
        <div>
          <h2 className="text-lg font-semibold">Billing history</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            View your previous invoices and payments.
          </p>
        </div>

        <div className="mt-8 border-t border-border">
          <div className="flex items-center justify-between border-b border-border py-5">
            <div className="flex items-center gap-3">
              <ReceiptText className="size-4 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">
                  No invoices yet
                </p>

                <p className="text-sm text-muted-foreground">
                  Your invoices will appear here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


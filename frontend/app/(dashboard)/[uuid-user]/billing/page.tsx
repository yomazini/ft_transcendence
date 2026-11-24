"use client";

import AvailablePlans from "@/components/billing/AvailablePlans";
import BillingHeader from "@/components/billing/BillingHeader";
import CurrentPlanCard from "@/components/billing/CurrentPlanCard";
import PaymentHistory from "@/components/billing/PaymentHistory";
import TeamUsageCard from "@/components/billing/TeamUsageCard";
import { type Billing, getBilling, getPayments, Payment } from "@/lib/api/billing";
import { useEffect, useState } from "react";


export default function BillingPage() {

  const [billingInformation, setBillingInformation] = useState<Billing | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);


  async function loadBilling() {
    try {
      const getbilling = await getBilling();
      setBillingInformation(getbilling);

      const getpayments = await getPayments();
      setPayments(getpayments);
    } catch (err) {
      console.error("Unable to load billing:", err);
      throw err;
    }
  }

  useEffect(() => {
    void loadBilling();
  }, []);

  if (!billingInformation ) {
    // || !payments
    return (
      <div className="">Loding</div>
    )
  }

  return (
    <div className="page-d">
      <BillingHeader />
      <div className="grid gap-4 md:grid-cols-2">
        <CurrentPlanCard billinginfo={billingInformation} onCancelledPlan={loadBilling} />
        <TeamUsageCard billinginfo={billingInformation} />
      </div>
      <AvailablePlans billinginfo={billingInformation} />
      <PaymentHistory payments={payments} />
    </div>
  )
}
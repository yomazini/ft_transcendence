import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";

import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Verify Your Email"
          description="We've sent a verification link to your email address. Please verify your account before signing in."
        />

        <div className="space-y-6">

          {/* Email Illustration */}

          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-5xl">
              📧
            </div>
          </div>

          {/* Information */}

          <div className="rounded-2xl border bg-muted/30 p-6 text-center">

            <p className="leading-7 text-muted-foreground">
              Check your inbox and click the verification link.
              If you don't see it within a few minutes,
              be sure to check your spam or junk folder.
            </p>

          </div>

          {/* Actions */}

          <div className="space-y-3">

            <Button
              className="w-full"
              size="lg"
            >
              Resend Verification Email
            </Button>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              
            >
              <Link href="/login">
                Back to Sign In
              </Link>
            </Button>

          </div>

        </div>

        <AuthFooter
          text="Already verified your email?"
          linkText="Sign in"
          href="/login"
        />
      </AuthCard>
    </AuthLayout>
  );
}
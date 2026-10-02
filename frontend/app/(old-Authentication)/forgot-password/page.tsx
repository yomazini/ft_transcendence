import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Forgot Your Password?"
          description="Enter the email address associated with your account and we'll send you a link to reset your password."
        />

        <form className="space-y-6">

          {/* Email */}

          <div className="space-y-2">

            <Label htmlFor="email">
              Email Address
            </Label>

            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              autoComplete="email"
            />

          </div>

          {/* Submit */}

          <Button
            type="submit"
            size="lg"
            className="w-full"
          >
            Send Reset Link
          </Button>

        </form>

        {/* Extra Help */}

        <div className="mt-6 rounded-2xl border bg-muted/30 p-4 text-center">

          <p className="text-sm leading-6 text-muted-foreground">
            Remember to check your spam or junk folder if you don't receive
            the email within a few minutes.
          </p>

        </div>

        <AuthFooter
          text="Remember your password?"
          linkText="Sign in"
          href="/login"
        />
      </AuthCard>
    </AuthLayout>
  );
}


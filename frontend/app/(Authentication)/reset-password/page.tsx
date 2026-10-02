import { AuthCard } from "@/components/auth/auth-card";
import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Reset Your Password"
          description="Choose a strong password to secure your account."
        />

        <form className="space-y-6">

          {/* New Password */}

          <div className="space-y-2">

            <Label htmlFor="password">
              New Password
            </Label>

            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />

          </div>

          {/* Confirm Password */}

          <div className="space-y-2">

            <Label htmlFor="confirmPassword">
              Confirm New Password
            </Label>

            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />

          </div>

          {/* Submit */}

          <Button
            type="submit"
            size="lg"
            className="w-full"
          >
            Reset Password
          </Button>

        </form>

        <AuthFooter
          text="Remember your password?"
          linkText="Sign in"
          href="/login"
        />
      </AuthCard>
    </AuthLayout>
  );
}
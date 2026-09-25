import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SocialLogin } from "@/components/auth/social-login";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Create Your Account"
          description="Start transforming customer conversations into actionable insights."
        />

        <form className="space-y-6">

          {/* Name */}

          <div className="grid gap-4 md:grid-cols-2">

            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name
              </Label>

              <Input
                id="firstName"
                placeholder="John"
                autoComplete="given-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name
              </Label>

              <Input
                id="lastName"
                placeholder="Doe"
                autoComplete="family-name"
              />
            </div>

          </div>

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

          {/* Password */}

          <div className="space-y-2">

            <Label htmlFor="password">
              Password
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
              Confirm Password
            </Label>

            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />

          </div>

          {/* Terms */}

          <div className="flex items-start space-x-2">

            <Checkbox
              id="terms"
              className="mt-1"
            />

            <Label
              htmlFor="terms"
              className="font-normal leading-6"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-primary hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </Label>

          </div>

          {/* Submit */}

          <Button
            type="submit"
            className="w-full"
            size="lg"
          >
            Create Account
          </Button>

        </form>

        <SocialLogin />

        <AuthFooter
          text="Already have an account?"
          linkText="Sign in"
          href="/login"
        />
      </AuthCard>
    </AuthLayout>
  );
}
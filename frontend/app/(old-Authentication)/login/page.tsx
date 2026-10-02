import Link from "next/link"

import { AuthFooter } from "@/components/auth/auth-footer"
import { AuthHeader } from "@/components/auth/auth-header"
import { AuthLayout } from "@/components/auth/auth-layout"
import { SocialLogin } from "@/components/auth/social-login"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <AuthLayout>

      <div className="w-full max-w-md space-y-8">

        <AuthHeader
          title="Welcome Back"
          description="Sign in to your account to continue."
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

          {/* Password */}
          <div className="space-y-2">

            <div className="flex items-center justify-between">

              <Label htmlFor="password">
                Password
              </Label>

              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>

            </div>

            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />

          </div>

          {/* Remember */}
          <div className="flex items-center space-x-2">

            <Checkbox id="remember" />

            <Label
              htmlFor="remember"
              className="font-normal"
            >
              Remember me
            </Label>

          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
          >
            Sign In
          </Button>

        </form>

        <SocialLogin />

        <AuthFooter
          text="Don't have an account?"
          linkText="Create one"
          href="/register"
        />

      </div>

    </AuthLayout>
  )
}
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface SocialLoginProps {
  google?: boolean;
  github?: boolean;
}

export function SocialLogin({
  google = true,
  github = true,
}: SocialLoginProps) {
  if (!google && !github) {
    return null;
  }

  return (
    <div className="mt-8">

      {/* Divider */}

      <div className="relative">

        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>

        <div className="relative flex justify-center text-sm uppercase">
          <span className="bg-background px-4 text-muted-foreground">
            Or continue with
          </span>
        </div>

      </div>

      {/* Buttons */}

      <div className="mt-6 grid gap-4">

        {google && (
          <Button
            variant="outline"
            
            className="h-11"
          >
            <Link href="/api/auth/google">
              Continue with Google
            </Link>
          </Button>
        )}

        {github && (
          <Button
            variant="outline"
            
            className="h-11"
          >
            <Link href="/api/auth/github">
              Continue with GitHub
            </Link>
          </Button>
        )}

      </div>

    </div>
  );
}
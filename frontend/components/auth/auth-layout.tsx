import Link from "next/link"
import { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-background">

      <div className="flex min-h-screen ">

        {/* LEFT SIDE */}
        <div className="relative hidden w-[45%] overflow-hidden lg:flex">

          {/* Background image */}
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source
              src="https://images.shadcnspace.com/assets/video/wave-video-loop.mp4"
              type="video/mp4"
            />
          </video>


          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between p-12 text-white">

            {/* Logo */}
            <div>
              <Link href={"/"} >
                <h1 className="text-2xl font-bold">
                  InsightFlow
                </h1>
              </Link>
            </div>

            {/* Main content */}
            <div className="max-w-lg">

              <h2 className="text-4xl font-semibold leading-tight">
                Turn conversations into
                <br />
                actionable insights.
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-white/75">
                Understand what your community is saying,
                discover trends, and transform Reddit
                conversations into meaningful insights.
              </p>

            </div>

            {/* Bottom */}
            <p className="text-sm text-white/60">
              Social intelligence powered by InsightFlow
            </p>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex min-h-screen items-center justify-center px-6 py-12  w-full">

          <div className="flex w-full max-w-md flex-col">

            {children}

            <p className="mt-8 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} InsightFlow. All rights reserved.
            </p>

          </div>

        </div>

      </div>

    </main>
  )
}

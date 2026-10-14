import Link from "next/link";

const product = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Roadmap", href: "/about#roadmap" },
  { label: "Changelog", href: "#" },
];

const resources = [
  { label: "Documentation", href: "#" },
  { label: "API Reference", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Help Center", href: "#" },
];

const company = [
  { label: "About", href: "/about" },
  { label: "Careers", href: "#" },
  { label: "Contact", href: "/contact" },
];

const legal = [
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Cookie Policy", href: "#" },
];

const social = [
  { label: "GitHub", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Discord", href: "#" },
  { label: "X", href: "#" },
];

export function FooterSection() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* Top */}

        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">

          {/* Brand */}

          <div>

            <Link
              href="/"
              className="text-2xl font-bold"
            >
              InsightFlow
            </Link>

            <p className="mt-6 max-w-sm leading-7 text-muted-foreground">
              Building AI-powered market intelligence that helps
              founders, startups, and product teams understand
              customer conversations and build better products.
            </p>

            <p className="mt-6 text-sm text-muted-foreground">
              Building the future of AI, one release at a time.
            </p>

          </div>

          {/* Product */}

          <div>

            <h3 className="font-semibold">
              Product
            </h3>

            <ul className="mt-6 space-y-3">

              {product.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

            </ul>

          </div>

          {/* Resources */}

          <div>

            <h3 className="font-semibold">
              Resources
            </h3>

            <ul className="mt-6 space-y-3">

              {resources.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

            </ul>

          </div>

          {/* Company */}

          <div>

            <h3 className="font-semibold">
              Company
            </h3>

            <ul className="mt-6 space-y-3">

              {company.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

            </ul>

          </div>

          {/* Legal */}

          <div>

            <h3 className="font-semibold">
              Legal
            </h3>

            <ul className="mt-6 space-y-3">

              {legal.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

            </ul>

          </div>

        </div>

        {/* Bottom */}

        <div className="mt-16 border-t pt-8">

          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} InsightFlow.
              All rights reserved.
            </p>

            <div className="flex items-center gap-6">

              {social.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}

            </div>

          </div>

          <div className="mt-8 text-center">

            <p className="text-sm text-muted-foreground">
              Made with ❤️ by the InsightFlow Team.
            </p>

          </div>

        </div>

      </div>
    </footer>
  );
}
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Terms of Service | InsightFlow",
  description: "Terms of Service for InsightFlow (v1.0).",
};

const CONTACT_EMAIL = "norehamza31@gmail.com";

function Mail() {
  return (
    <a
      className="font-medium text-orange-300 underline decoration-orange-400/40 underline-offset-4 transition hover:text-orange-200 hover:decoration-orange-300"
      href={`mailto:${CONTACT_EMAIL}`}
    >
      {CONTACT_EMAIL}
    </a>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={`section-${n}`}
      className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg shadow-black/20 backdrop-blur-md transition hover:border-orange-400/40 hover:bg-white/[0.07]"
    >
      <h2 className="mb-3 flex items-center gap-3 text-lg font-semibold text-white">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-white shadow-md shadow-orange-500/30">
          {n}
        </span>
        {title}
      </h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-white/75">
        {children}
      </div>
    </section>
  );
}

function List({ children }: { children: ReactNode }) {
  return (
    <ul className="space-y-2 marker:text-orange-400 [&>li]:pl-1 list-disc pl-5">
      {children}
    </ul>
  );
}

export default function TermsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* Background glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-orange-500/30 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-8rem] top-1/3 h-[26rem] w-[26rem] rounded-full bg-amber-500/20 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-10rem] left-1/4 h-[30rem] w-[30rem] rounded-full bg-orange-600/20 blur-[140px]"
      />

      <main className="relative mx-auto max-w-3xl px-6 py-14">
        {/* Header */}
        <header className="mb-10 rounded-3xl border border-white/15 bg-white/[0.06] p-8 shadow-2xl shadow-orange-500/10 backdrop-blur-xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-orange-300">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            Legal
          </span>
          <h1 className="bg-gradient-to-r from-orange-300 via-orange-400 to-amber-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-white/60">
            InsightFlow · Version 1.0 · Last updated: 24 October 2026
          </p>
        </header>

        <div className="space-y-5">
          <Section n={1} title="Who we are">
            <p>
              InsightFlow (&quot;the Service&quot;, &quot;we&quot;) is a
              student project built by a team of five students at 1337 (42
              Network) as part of the 42 curriculum (project ft_transcendence).
              It is a learning project, not a company. You can reach us at{" "}
              <Mail />.
            </p>
          </Section>

          <Section n={2} title="Accepting these terms">
            <p>
              By creating an account, logging in with 42, or accepting an
              invitation, you agree to these Terms and to our Privacy Policy. If
              you do not agree, do not use the Service.
            </p>
          </Section>

          <Section n={3} title="What the Service does">
            <p>
              InsightFlow lets you collect public discussions from Reddit about
              a keyword, a subreddit, a post or a user, analyse their sentiment,
              and receive reports (SWOT analysis, Blue Ocean strategy canvas)
              generated with the help of an AI language model. You can export
              reports and ask follow-up questions about the collected comments.
            </p>
          </Section>

          <Section n={4} title="Your account">
            <List>
              <li>
                You must give a valid email address and keep your password
                secret. You are responsible for what happens under your account.
              </li>
              <li>
                If you sign up with 42, you also follow the 42 intra&apos;s own
                rules.
              </li>
              <li>
                You must be at least 16 years old, or the minimum age for
                digital consent in your country.
              </li>
              <li>One account per person. Do not share your account.</li>
            </List>
          </Section>

          <Section n={5} title="Organizations and roles">
            <p>
              Every account belongs to one organization. The
              organization&apos;s Admins can invite members, change their role
              (Admin, Analyst, Viewer) and remove them. Removing a member or
              deleting the organization deletes the related accounts and their
              data. Admins are responsible for who they invite.
            </p>
          </Section>

          <Section n={6} title="Acceptable use">
            <p>You agree not to:</p>
            <List>
              <li>
                break the law, or use the Service to harass, profile or target a
                private person;
              </li>
              <li>
                collect or use personal data from Reddit in ways that break
                Reddit&apos;s terms or data-protection law (for example building
                files on individuals);
              </li>
              <li>
                try to access another organization&apos;s data, bypass the
                access controls, the rate limits or the firewall, or test the
                security of the Service without our written permission;
              </li>
              <li>
                overload the Service (automated mass requests, denial of
                service);
              </li>
              <li>upload malicious content or code.</li>
            </List>
            <p>We may suspend or delete an account that breaks these rules.</p>
          </Section>

          <Section n={7} title="Third-party content and services">
            <List>
              <li>
                Reddit content belongs to its authors and is subject to
                Reddit&apos;s User Agreement and Data API terms. We only process
                publicly available content, and we do not claim any right over
                it.
              </li>
              <li>
                Reports are generated with a third-party AI model provider. Your
                job&apos;s comments and questions are sent to that provider to
                produce the report.
              </li>
              <li>
                We are not responsible for third-party services (Reddit, the 42
                intra, the AI provider, the email provider) or their
                availability.
              </li>
            </List>
          </Section>

          <Section n={8} title="AI-generated reports">
            <p>
              Reports and chat answers are produced automatically and may be
              wrong, incomplete or biased. They are not professional, financial
              or legal advice. Check important information yourself before
              relying on it.
            </p>
          </Section>

          <Section n={9} title="Your data">
            <p>
              How we collect, use, keep and delete personal data is described in
              our Privacy Policy. You can export your data and delete your
              account at any time from your account settings.
            </p>
          </Section>

          <Section n={10} title="Availability">
            <p>
              The Service is a student project hosted for learning and
              evaluation. It is provided &quot;as is&quot;, may be interrupted,
              changed or shut down at any time, and data may be reset. Keep your
              own copy of any report you need (use the export feature).
            </p>
          </Section>

          <Section n={11} title="Liability">
            <p>
              To the extent allowed by law, the team is not liable for any
              indirect loss, loss of data or loss of profit resulting from the
              use of the Service or of its reports.
            </p>
          </Section>

          <Section n={12} title="Ending your use">
            <p>
              You can stop using the Service and delete your account at any
              time. We may close accounts that break these Terms, or when the
              project ends.
            </p>
          </Section>

          <Section n={13} title="Changes to these Terms">
            <p>
              We may update these Terms. The version number and date at the top
              will change; important changes are announced on the Service. Using
              the Service after a change means you accept the new Terms.
            </p>
          </Section>

          <Section n={14} title="Contact">
            <p>
              Questions about these Terms: <Mail />.
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}
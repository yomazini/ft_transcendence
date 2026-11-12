import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacy Policy | InsightFlow",
  description: "Privacy Policy for InsightFlow (v1.0).",
};

const CONTACT_EMAIL = "norehamza31@gmail.com";
const BACKUP_RETENTION = "30 days";

const DATA_ROWS: { data: string; why: string; source: string }[] = [
  {
    data: "Email address",
    why: "your login, invitations, password reset and security emails",
    source: "you, or your 42 account",
  },
  {
    data: "Password",
    why: "to log you in — stored only as an argon2 hash, never in plain text",
    source: "you",
  },
  {
    data: "42 login and profile basics",
    why: "to create or link your account when you log in with 42",
    source: "the 42 intra (OAuth)",
  },
  {
    data: "Organization name and description, your role",
    why: "to run your workspace and its permissions",
    source: "you, or your organization's Admin",
  },
  {
    data: "Jobs you create (search targets), questions you ask in the chat and the answers",
    why: "to provide the analyses and the chat history",
    source: "you",
  },
  {
    data: "Technical data: IP address, request logs, error and performance metrics",
    why: "security (firewall, rate limiting), keeping the Service working",
    source: "your browser",
  },
];

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

function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-orange-200">{children}</strong>;
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
    <ul className="list-disc space-y-2 pl-5 marker:text-orange-400 [&>li]:pl-1">
      {children}
    </ul>
  );
}

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-white/60">
            InsightFlow · Version 1.0 · Last updated: 24 October 2026
          </p>
        </header>

        <div className="space-y-5">
          <Section n={1} title="Who is responsible">
            <p>
              InsightFlow is a student project built by a team of five students
              at 1337 (42 Network) for the ft_transcendence project. The team is
              responsible for the personal data processed by the Service.
              Contact: <Mail />.
            </p>
          </Section>

          <Section n={2} title="Data we collect about you">
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[34rem] border-separate border-spacing-0 overflow-hidden rounded-xl border border-white/10 text-left text-sm">
                <thead>
                  <tr className="bg-orange-500/15 text-orange-200">
                    <th className="px-4 py-3 font-semibold">Data</th>
                    <th className="px-4 py-3 font-semibold">Why</th>
                    <th className="px-4 py-3 font-semibold">
                      Where it comes from
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DATA_ROWS.map((row) => (
                    <tr
                      key={row.data}
                      className="align-top transition hover:bg-white/[0.05]"
                    >
                      <td className="border-t border-white/10 px-4 py-3 font-medium text-white">
                        {row.data}
                      </td>
                      <td className="border-t border-white/10 px-4 py-3">
                        {row.why}
                      </td>
                      <td className="border-t border-white/10 px-4 py-3">
                        {row.source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              We do not collect payment data, location, contacts, or advertising
              identifiers.
            </p>
          </Section>

          <Section n={3} title="Data from Reddit">
            <p>
              When you run a job, the Service collects publicly available Reddit
              comments (text, author name, score) linked to your search. They
              are used only to compute statistics and reports for your
              organization. We do not build profiles of individual Reddit users
              and we do not publish or sell this data.
            </p>
          </Section>

          <Section n={4} title="Legal basis">
            <List>
              <li>
                <Strong>Contract:</Strong> to provide the Service you signed up
                for (account, organization, jobs, reports).
              </li>
              <li>
                <Strong>Legitimate interest:</Strong> security, abuse prevention
                and keeping the Service running.
              </li>
              <li>
                <Strong>Consent:</Strong> when you accept these documents at
                signup. You can withdraw it by deleting your account.
              </li>
            </List>
          </Section>

          <Section n={5} title="Who receives your data">
            <p>
              We never sell your data. Some providers help us run the Service:
            </p>
            <List>
              <li>
                <Strong>AI model provider</Strong> — receives the comments of a
                job and your chat questions to produce reports and answers.
              </li>
              <li>
                <Strong>Email provider</Strong> — sends invitation,
                password-reset and confirmation emails.
              </li>
              <li>
                <Strong>42 intra</Strong> — only if you choose &quot;Log in with
                42&quot;.
              </li>
              <li>
                <Strong>Reddit</Strong> — receives our search requests (not your
                personal data).
              </li>
            </List>
            <p>
              Inside the Service, members of your organization see the
              organization&apos;s jobs, reports and member list, according to
              their role. Other organizations can never see your data.
            </p>
          </Section>

          <Section n={6} title="Cookies and browser storage">
            <p>
              We use no advertising or tracking cookies. Your login token is
              kept in your browser&apos;s storage (localStorage if you tick
              &quot;Remember me&quot;, otherwise sessionStorage, which is
              cleared when you close the browser) and removed when you log out.
            </p>
          </Section>

          <Section n={7} title="How long we keep data">
            <List>
              <li>
                <Strong>Account and organization data:</Strong> until you delete
                your account (or the Admin removes you).
              </li>
              <li>
                <Strong>Jobs, comments, reports and chat history:</Strong> until
                they are deleted, or the organization is deleted.
              </li>
              <li>
                <Strong>Database backups:</Strong> kept for {BACKUP_RETENTION},
                then deleted. Deleted data disappears from backups when they
                expire.
              </li>
              <li>
                <Strong>Login tokens</Strong> expire after 1 hour; logging out
                blocks the token immediately.
              </li>
            </List>
          </Section>

          <Section n={8} title="Security">
            <p>
              Passwords are hashed with argon2; the connection is encrypted
              (HTTPS); a web application firewall filters attacks; secrets are
              stored in HashiCorp Vault; every request on organization data is
              checked against your organization; backups are signed to detect
              tampering.
            </p>
          </Section>

          <Section n={9} title="Your rights (GDPR)">
            <p>You can, at any time:</p>
            <List>
              <li>
                <Strong>access and export your data</Strong> — Settings →
                Export my data (JSON file);
              </li>
              <li>
                <Strong>correct your email or password</Strong> — Settings;
              </li>
              <li>
                <Strong>delete your account</Strong> — Settings → Delete account
                (asks your password). If you are the last member, the
                organization and all its data are deleted too. A confirmation
                email is sent;
              </li>
              <li>
                <Strong>object or ask a question</Strong> — write to <Mail />.
              </li>
            </List>
            <p>
              You can also complain to your data-protection authority (in
              Morocco: the CNDP; in the EU: your national authority).
            </p>
          </Section>

          <Section n={10} title="Children">
            <p>The Service is not intended for people under 16.</p>
          </Section>

          <Section n={11} title="Changes">
            <p>
              We may update this policy. The version and date at the top will
              change, and important changes are announced on the Service.
            </p>
          </Section>

          <Section n={12} title="Contact">
            <p>
              Questions about your data: <Mail />.
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}

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
      href={`mailto:${CONTACT_EMAIL}`}
      className="underline underline-offset-4"
    >
      {CONTACT_EMAIL}
    </a>
  );
}

function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-semibold">{children}</strong>;
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
    <section id={`section-${n}`} className="space-y-4">
      <h2 className="text-xl font-semibold">
        {n}. {title}
      </h2>

      <div className="space-y-4 leading-7">
        {children}
      </div>
    </section>
  );
}

function List({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-6 leading-7">
      {children}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
      {/* Header */}
      <header className="mb-16 space-y-4 text-center">
        <p className="text-sm font-medium uppercase tracking-widest">
          Legal
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Privacy Policy
        </h1>

        <p className="text-sm">
          InsightFlow · Version 1.0 · Last updated: 24 October 2026
        </p>
      </header>

      <div className="space-y-12">
        <Section n={1} title="Who is responsible">
          <p>
            InsightFlow is a student project built by a team of five students
            at 1337 (42 Network) for the ft_transcendence project. The team is
            responsible for the personal data processed by the Service.
            Contact: <Mail />.
          </p>
        </Section>

        <Section n={2} title="Data we collect about you">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-3 font-semibold">
                    Data
                  </th>
                  <th className="px-3 py-3 font-semibold">
                    Why
                  </th>
                  <th className="px-3 py-3 font-semibold">
                    Where it comes from
                  </th>
                </tr>
              </thead>

              <tbody>
                {DATA_ROWS.map((row) => (
                  <tr key={row.data} className="border-b">
                    <td className="px-3 py-4 align-top font-medium">
                      {row.data}
                    </td>
                    <td className="px-3 py-4 align-top">
                      {row.why}
                    </td>
                    <td className="px-3 py-4 align-top">
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
          <p>
            The Service is not intended for people under 16.
          </p>
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
  );
}

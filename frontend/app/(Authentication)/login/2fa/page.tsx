"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";
import { OtpInput } from "@/components/auth/otp-input";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { saveToken, verifyTwoFactor, homePath } from "@/lib/auth";

export default function TwoFactorPage() {

    const router = useRouter();
    const [token, setToken] = useState<string>("");
    const [remember, setRemember] = useState<boolean>(false);
    const [code, setCode] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    /**
     * We use useEffect because:
        the token sits in `window.location.hash`, and window only exists in the browser. Next.js first renders pages on the server, where there's no window, so reading it straight in the component body would crash or read nothing. useEffect runs after the page is shown in the browser, so window is safe to read there.
     */
    useEffect(() => {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const two_factor_token = params.get("two_factor_token");
        if (!two_factor_token) {
            router.replace("/login");
            return;
        }
        setToken(two_factor_token);
        setRemember(params.get("remember") === "1");
        history.replaceState(null, "", "/login/2fa");
    }, [router])

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        if (!/^\d{6}$/.test(code)) {
            setError("Enter the 6-digit code from your authenticator app.");
            return;
        }
        setLoading(true);
        try {
            const { access_token, user } = await verifyTwoFactor(token, code);
            saveToken(access_token, remember);
            router.replace(homePath(user.id));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong.";
            if (message.includes("2fa token")) {
                setToken("");
                setError("Your session expired. Log in again.");
            } else {
                setError(message);
            }
            setCode("");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout>
            <AuthCard>
                <AuthHeader
                    title="Two-factor authentication"
                    description="Open your authenticator app and enter the 6-digit code for InsightFlow."
                />

                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="code">Authentication code</Label>
                        <OtpInput
                            id="code"
                            value={code}
                            onChange={setCode}
                            disabled={loading || !token}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <Button type="submit" className="w-full" size="lg" disabled={loading || !token || code.length !== 6}>
                        {loading ? "Verifying..." : "Verify"}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Lost access to your app?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Back to login
                    </Link>
                </p>
            </AuthCard>
        </AuthLayout>
    );
}

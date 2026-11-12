"use client";
import { Check, Copy, Eye, EyeOff, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getApiKey, createApiKey, revokeApiKey, type ApiKeyInfo } from "@/lib/api/apiKey";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function ApiKey({ orgId }: { orgId: string }) {
    const [info, setInfo] = useState<ApiKeyInfo | null>(null);
    const [apiKey, setApiKey] = useState("");
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getApiKey(orgId)
            .then((res) => setInfo(res.key))
            .catch((err) => setError(err.message));
    }, [orgId]);

    async function copy(value: string) {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setError("Could not copy the key, please copy it manually.");
        }
    }

    async function handleGenerate() {
        setError("");
        setShow(false);
        setLoading(true);

        try {
            const { key, ...rest } = await createApiKey(orgId);
            setApiKey(key);
            setInfo({ ...rest, last_used_at: null });
            copy(key);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    async function handleRevoke() {
        if (!window.confirm("Revoke this API key?")) return;

        setError("");
        setLoading(true);

        try {
            await revokeApiKey(orgId);
            setInfo(null);
            setApiKey("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">API key</h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
                Your key is copied when you generate it and can't be shown again later.
            </p>

            <Separator className="my-6" />

            <div className="space-y-4">
                {info && (
                    <div className="rounded-lg border bg-muted/40 p-4">
                        <p className="font-mono font-bold">{info.prefix}••••••••</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Created {new Date(info.created_at).toLocaleDateString()}
                        </p>
                    </div>
                )}

                {apiKey && (
                    <div className="space-y-2">
                        <Label htmlFor="api-key">Your new API key</Label>

                        <div className="relative">
                            <Input
                                id="api-key"
                                type={show ? "text" : "password"}
                                value={apiKey}
                                readOnly
                                className="rounded-lg pr-20 font-mono"
                            />

                            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 gap-2 text-muted-foreground">
                                <button type="button" onClick={() => setShow(!show)}>
                                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>

                                <button type="button" onClick={() => copy(apiKey)}>
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex justify-end">
                    {info ? (
                        <Button variant="outline" onClick={handleRevoke} disabled={loading}>
                            {loading ? "Revoking..." : "Revoke key"}
                        </Button>
                    ) : (
                        <Button onClick={handleGenerate} disabled={loading}>
                            {loading ? "Generating..." : "Generate API key"}
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}
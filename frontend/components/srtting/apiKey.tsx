
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
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
            <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-white">
                    API key
                </h2>
            </div>

            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Your key is copied when you generate it and can't be shown again later.
                {" "}
                <a
                    href="/api/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-orange-500 hover:text-orange-600 hover:underline dark:text-orange-400 dark:hover:text-orange-300"
                >
                    View API Documentation
                </a>
            </p>

            <Separator className="my-6" />

            <div className="space-y-4">
                {info && (
                    <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-4 dark:border-orange-500/20 dark:bg-orange-500/5">
                        <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            {info.prefix}••••••••
                        </p>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                            Created {new Date(info.created_at).toLocaleDateString()}
                        </p>
                    </div>
                )}

                {apiKey && (
                    <div className="space-y-2">
                        <Label
                            htmlFor="api-key"
                            className="text-zinc-800 dark:text-zinc-200"
                        >
                            Your new API key
                        </Label>

                        <div className="relative">
                            <Input
                                id="api-key"
                                type={show ? "text" : "password"}
                                value={apiKey}
                                readOnly
                                className="rounded-xl border-orange-200 bg-orange-50/30 pr-20 font-mono text-zinc-900 focus-visible:border-orange-400 focus-visible:ring-orange-500/20 dark:border-orange-500/20 dark:bg-zinc-800/50 dark:text-zinc-100"
                            />

                            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 gap-3 text-zinc-500 dark:text-zinc-400">
                                <button
                                    type="button"
                                    onClick={() => setShow(!show)}
                                    className="transition-colors hover:text-orange-600 dark:hover:text-orange-400"
                                >
                                    {show ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => copy(apiKey)}
                                    className="transition-colors hover:text-orange-600 dark:hover:text-orange-400"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}

                <div className="flex justify-end">
                    {info ? (
                        <Button
                            variant="outline"
                            onClick={handleRevoke}
                            disabled={loading}
                            className="rounded-xl border-red-200 bg-white px-5 font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-500/20 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                        >
                            <span className="text-white">
                                {loading ? "Revoking..." : "Revoke key"}
                            </span>
                        </Button>
                    ) : (
                        <Button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="rounded-xl bg-gradient-to-r text-white from-orange-500 via-orange-400 to-amber-500 px-5 font-medium text-white shadow-sm shadow-orange-500/20 transition-all hover:from-orange-600 hover:via-orange-500 hover:to-amber-600 hover:shadow-md hover:shadow-orange-500/25 dark:text-zinc-950"
                        >
                            <span className="text-white">
                                {loading ? "Generating..." : "Generate API key"}
                            </span>
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}

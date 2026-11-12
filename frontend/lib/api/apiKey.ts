import { send } from "./billing";

export type ApiKeyInfo = {
    id: string;
    prefix: string;
    label: string | null;
    created_at: string;
    last_used_at: string | null;
};

export type CreatedApiKey = {
    id: string;
    key: string;
    prefix: string;
    label: string | null;
    created_at: string;
};



export const getApiKey = (orgId: string) =>
    send<{ key: ApiKeyInfo | null }>(`/api/orgs/${orgId}/api-key`);

export const createApiKey = (orgId: string, body: { label?: string } = {}) =>
    send<CreatedApiKey>(`/api/orgs/${orgId}/api-key`, {
        method: "POST",
        body: JSON.stringify(body),
    });

export const revokeApiKey = (orgId: string) =>
    send<{ revoked: boolean; revoked_at: string }>(`/api/orgs/${orgId}/api-key`, {
        method: "DELETE",
    });
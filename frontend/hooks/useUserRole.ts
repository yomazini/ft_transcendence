import { useCurrentUser } from "@/hooks/useCurrentUser";

export function useUserRole() {
	const { user } = useCurrentUser();

	return user?.role ?? null;
}

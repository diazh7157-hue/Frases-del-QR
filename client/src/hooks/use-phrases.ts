import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertPhrase } from "@shared/schema";

// GET /api/phrases
export function usePhrases() {
  return useQuery({
    queryKey: [api.phrases.list.path],
    queryFn: async () => {
      const res = await fetch(api.phrases.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch phrases");
      return api.phrases.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/phrases/random
export function useRandomPhrase() {
  return useQuery({
    queryKey: [api.phrases.random.path],
    queryFn: async () => {
      const res = await fetch(api.phrases.random.path, { credentials: "include" });
      if (res.status === 404) return null; // Handle no phrases case
      if (!res.ok) throw new Error("Failed to fetch random phrase");
      return api.phrases.random.responses[200].parse(await res.json());
    },
    refetchOnWindowFocus: false, // Don't refetch just by switching tabs, let user click refresh
  });
}

// POST /api/phrases
export function useCreatePhrase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPhrase) => {
      const validated = api.phrases.create.input.parse(data);
      const res = await fetch(api.phrases.create.path, {
        method: api.phrases.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.phrases.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create phrase");
      }
      return api.phrases.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.phrases.list.path] });
      // Also invalidate random so it might include the new one next time
      queryClient.invalidateQueries({ queryKey: [api.phrases.random.path] });
    },
  });
}

// DELETE /api/phrases/:id
export function useDeletePhrase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.phrases.delete.path, { id });
      const res = await fetch(url, {
        method: api.phrases.delete.method,
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Phrase not found");
        throw new Error("Failed to delete phrase");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.phrases.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.phrases.random.path] });
    },
  });
}

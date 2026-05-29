"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getGlobalFeed,
  getGroupFeed,
  createPost as apiCreatePost,
} from "@/lib/api/feed";
import { getMyGroups } from "@/lib/api/groups";
import { toggleReaction } from "@/lib/api/social";
import type { Publication } from "@/lib/types";

// Helper: extract flat Publication[] from a paginated infinite query result
function flattenPages(pages: any[]): Publication[] {
  return pages.flatMap((p) => {
    const paginator = p.data as any;
    if (Array.isArray(paginator?.data)) return paginator.data;
    if (Array.isArray(paginator)) return paginator;
    return [];
  });
}

function buildInfiniteQuery(
  queryKey: unknown[],
  queryFn: (page: number) => Promise<any>,
) {
  return {
    queryKey,
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) => queryFn(pageParam),
    initialPageParam: 1 as number,
    getNextPageParam: (lastPage: any) => {
      const paginator = lastPage.data as any;
      const current = paginator?.current_page ?? 1;
      const last = paginator?.last_page ?? 1;
      return current < last ? current + 1 : undefined;
    },
  };
}

// ── Global feed ───────────────────────────────────────────────────────────────
export function useGlobalFeed() {
  const queryClient = useQueryClient();

  const feed = useInfiniteQuery(
    buildInfiniteQuery(["feed", "global"], getGlobalFeed),
  );

  const react = useMutation({
    mutationFn: (publicationId: string) =>
      toggleReaction("publications", publicationId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["feed", "global"] }),
  });

  return {
    publications: flattenPages(feed.data?.pages ?? []),
    isLoading: feed.isLoading,
    isError: feed.isError,
    isFetchingNextPage: feed.isFetchingNextPage,
    hasNextPage: feed.hasNextPage,
    fetchNextPage: feed.fetchNextPage,
    refetch: feed.refetch,
    react: react.mutate,
  };
}

// ── Group-specific feed ───────────────────────────────────────────────────────
export function useGroupFeed(groupId: string) {
  const queryClient = useQueryClient();

  const feed = useInfiniteQuery({
    ...buildInfiniteQuery(["feed", "group", groupId], (page) =>
      getGroupFeed(groupId, page),
    ),
    enabled: !!groupId,
  });

  const react = useMutation({
    mutationFn: (publicationId: string) =>
      toggleReaction("publications", publicationId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["feed", "group", groupId] }),
  });

  return {
    publications: flattenPages(feed.data?.pages ?? []),
    isLoading: feed.isLoading,
    isError: feed.isError,
    isFetchingNextPage: feed.isFetchingNextPage,
    hasNextPage: feed.hasNextPage,
    fetchNextPage: feed.fetchNextPage,
    refetch: feed.refetch,
    react: react.mutate,
  };
}

// ── User's own groups (filière + clubs) ───────────────────────────────────────
export function useMyGroups() {
  const query = useQuery({
    queryKey: ["groups", "mine"],
    queryFn: () => getMyGroups(),
    staleTime: 5 * 60 * 1000,
  });

  const data = (query.data?.data as any)?.data;

  return {
    filiereGroup: (data?.filiere_group ?? null) as
      | import("@/lib/types").Group
      | null,
    clubs: (data?.clubs ?? []) as import("@/lib/types").Group[],
    isLoading: query.isLoading,
  };
}

// ── Create post (FormData — multipart) ───────────────────────────────────────
export function useCreatePost(groupId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => apiCreatePost(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed", "global"] });
      if (groupId)
        queryClient.invalidateQueries({ queryKey: ["feed", "group", groupId] });
    },
  });
}

// ── Legacy hook kept for backwards compatibility ──────────────────────────────
export function useFeed() {
  const queryClient = useQueryClient();

  const feed = useInfiniteQuery(buildInfiniteQuery(["feed"], getGlobalFeed));

  const createPost = useMutation({
    mutationFn: (data: { content: string; group_id?: string }) => {
      const fd = new FormData();
      fd.append("content", data.content);
      if (data.group_id) fd.append("group_id", data.group_id);
      return apiCreatePost(fd);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });

  return {
    publications: flattenPages(feed.data?.pages ?? []),
    isLoading: feed.isLoading,
    isError: feed.isError,
    isFetchingNextPage: feed.isFetchingNextPage,
    hasNextPage: feed.hasNextPage,
    fetchNextPage: feed.fetchNextPage,
    refetch: feed.refetch,
    createPost: createPost.mutate,
    isCreating: createPost.isPending,
    createError: createPost.error,
  };
}

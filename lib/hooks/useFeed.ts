'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPublications, reactToPublication, createPublication } from '@/lib/api/publications';

export function useFeed() {
  const queryClient = useQueryClient();

  const feed = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 1 }) => getPublications(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // PublicationController returns raw paginator {current_page, last_page, data:[...]}
      const paginator = lastPage.data as any;
      const current = paginator?.current_page ?? 1;
      const last    = paginator?.last_page ?? 1;
      return current < last ? current + 1 : undefined;
    },
  });

  const react = useMutation({
    mutationFn: (publicationId: string) => reactToPublication(publicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const createPost = useMutation({
    mutationFn: (data: { content: string; group_id: string }) => createPublication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const publications = feed.data?.pages.flatMap((p) => {
    // PublicationController returns raw paginator — p.data is the paginator
    const paginator = p.data as any;
    if (Array.isArray(paginator?.data)) return paginator.data;
    if (Array.isArray(paginator)) return paginator;
    return [];
  }) ?? [];

  return {
    publications,
    isLoading: feed.isLoading,
    isError: feed.isError,
    refetch: feed.refetch,
    isFetchingNextPage: feed.isFetchingNextPage,
    hasNextPage: feed.hasNextPage,
    fetchNextPage: feed.fetchNextPage,
    react: react.mutate,
    createPost: createPost.mutate,
    isCreating: createPost.isPending,
    createError: createPost.error,
  };
}

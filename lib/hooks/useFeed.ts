'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPublications, reactToPublication } from '@/lib/api/publications';

export function useFeed() {
  const queryClient = useQueryClient();

  const feed = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 1 }) => getPublications(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.data;
      return current_page < last_page ? current_page + 1 : undefined;
    },
  });

  const react = useMutation({
    mutationFn: (publicationId: string) => reactToPublication(publicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const publications = feed.data?.pages.flatMap((p) => p.data.data) ?? [];

  return {
    publications,
    isLoading: feed.isLoading,
    isFetchingNextPage: feed.isFetchingNextPage,
    hasNextPage: feed.hasNextPage,
    fetchNextPage: feed.fetchNextPage,
    react: react.mutate,
  };
}

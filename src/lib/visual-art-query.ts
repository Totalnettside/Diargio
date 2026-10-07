import { queryOptions } from '@tanstack/react-query';
import { getVisualArt } from './visual-art.functions';
export const visualArtOptions = () => queryOptions({ queryKey: ['visual-art'], queryFn: () => getVisualArt(), staleTime: 15000, refetchInterval: 15000, refetchOnWindowFocus: true });
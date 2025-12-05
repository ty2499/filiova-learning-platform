import { useState, useCallback, useRef } from 'react';

export type TransitionType = 'fade' | 'slide-right' | 'slide-left' | 'scale' | 'slide-up' | 'instant';

interface PageTransitionState {
  isTransitioning: boolean;
  isLoading: boolean;
  transitionType: TransitionType;
  currentPage: string;
  nextPage: string | null;
  loadingProgress: number;
  isExiting: boolean;
}

export const usePageTransition = (initialPage: string = 'home') => {
  const [transitionState, setTransitionState] = useState<PageTransitionState>({
    isTransitioning: false,
    isLoading: false,
    transitionType: 'fade',
    currentPage: initialPage,
    nextPage: null,
    loadingProgress: 0,
    isExiting: false,
  });
  
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigateToPage = useCallback((
    newPage: string, 
    transitionType: TransitionType = 'fade'
  ) => {
    if (newPage === transitionState.currentPage) {
      return;
    }

    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Instant scroll to top (no animation)
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (transitionType === 'instant') {
      // Instant transition - no animation
      setTransitionState(prev => ({
        ...prev,
        isTransitioning: false,
        isExiting: false,
        transitionType,
        currentPage: newPage,
        nextPage: null,
        loadingProgress: 100,
        isLoading: false,
      }));
      return;
    }

    // Start exit animation with loading progress
    setTransitionState(prev => ({
      ...prev,
      isTransitioning: true,
      isExiting: true,
      isLoading: true,
      loadingProgress: 30,
      nextPage: newPage,
      transitionType,
    }));

    // Progress simulation
    setTimeout(() => {
      setTransitionState(prev => ({ ...prev, loadingProgress: 60 }));
    }, 100);

    setTimeout(() => {
      setTransitionState(prev => ({ ...prev, loadingProgress: 80 }));
    }, 180);

    // After exit animation, switch page and start enter animation
    transitionTimeoutRef.current = setTimeout(() => {
      setTransitionState(prev => ({
        ...prev,
        isExiting: false,
        currentPage: newPage,
        nextPage: null,
        loadingProgress: 100,
      }));

      // Complete transition
      setTimeout(() => {
        setTransitionState(prev => ({
          ...prev,
          isTransitioning: false,
          isLoading: false,
          loadingProgress: 0,
        }));
      }, 200);
    }, 250);
  }, [transitionState.currentPage]);

  const completeTransition = useCallback(() => {
    setTransitionState(prev => ({
      ...prev,
      isTransitioning: false,
      isExiting: false,
      isLoading: false,
    }));
  }, []);

  return {
    ...transitionState,
    navigateToPage,
    completeTransition,
  };
};

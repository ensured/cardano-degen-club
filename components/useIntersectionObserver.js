import { useEffect } from 'react';

const useIntersectionObserver = (targetRef, callback, options) => {
  useEffect(() => {
    const observer = new IntersectionObserver(callback, options);
    const currentTarget = targetRef.current;

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [targetRef, callback, options]);
};

export default useIntersectionObserver;

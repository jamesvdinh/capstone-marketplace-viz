import { useEffect, useRef, useState } from "react";

// Google's lh3.googleusercontent.com thumbnail host rate-limits bursts of
// concurrent requests - the browser's native `loading="lazy"` prefetches
// much further ahead than this app's dense card grid can tolerate at scale
// (~200 projects), so this drives image loading off a tighter, explicit
// IntersectionObserver margin instead.
export const useInView = <T extends Element>(rootMargin = "200px") => {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView] as const;
};

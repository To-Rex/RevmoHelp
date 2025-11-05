import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  start?: number;
  delay?: number;
  easing?: (t: number) => number;
}

export const useCountUp = ({
  end,
  duration = 2000,
  start = 0,
  delay = 0,
  easing = (t: number) => t * t * (3 - 2 * t) // smooth ease-in-out
}: UseCountUpOptions) => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!isVisible || hasStarted) return;

    setHasStarted(true);
    
    const startTime = Date.now() + delay;
    const startValue = start;
    const endValue = end;
    const totalDuration = duration;

    const animate = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - startTime);
      const progress = Math.min(elapsed / totalDuration, 1);
      
      if (progress < 1) {
        const easedProgress = easing(progress);
        const currentValue = Math.round(startValue + (endValue - startValue) * easedProgress);
        setCount(currentValue);
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    if (Date.now() >= startTime) {
      animate();
    } else {
      setTimeout(animate, delay);
    }
  }, [isVisible, hasStarted, start, end, duration, delay, easing]);

  return { count, ref: elementRef };
};

export default useCountUp;
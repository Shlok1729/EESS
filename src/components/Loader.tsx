import { useEffect, useState } from 'react';

const Loader = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Initial quick jump
    setProgress(20);
    
    const timer1 = setTimeout(() => setProgress(60), 100);
    const timer2 = setTimeout(() => setProgress(90), 250);
    const timer3 = setTimeout(() => setProgress(100), 400);
    
    // Hide after progress reaches 100% and gives time for CSS fade
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[9999] pointer-events-none">
      <div 
        className="h-1 bg-ees-red shadow-[0_0_10px_#cc0000]"
        style={{ 
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: 'width, opacity',
          transitionDuration: '300ms',
          transitionTimingFunction: 'ease-out'
        }}
      ></div>
    </div>
  );
};

export default Loader;

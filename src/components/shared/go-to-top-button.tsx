'use client';

import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export function GoToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          className='fixed right-4 bottom-4 z-50 h-10 w-10 rounded-full p-2 shadow-lg'
          aria-label='Go to top'
        >
          <ChevronUp className='h-5 w-5' />
        </Button>
      )}
    </>
  );
}

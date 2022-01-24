import { useEffect, useState } from 'react';

/**
 * Returns if the browser is in full screen.
 */
export const useCheckIsFullscreen = (): { isFullscreen: boolean } => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fullscreenHandler = (): void => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', fullscreenHandler);

    return (): void =>
      document.removeEventListener('fullscreenchange', fullscreenHandler);
  }, [setIsFullscreen]);

  return { isFullscreen };
};

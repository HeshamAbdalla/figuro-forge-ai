
import { useState, useEffect } from 'react';

export const useMobileDevice = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent;
      setUserAgent(ua);
      
      // Check if device is mobile
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(ua));
      
      // Check if device has camera access
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.enumerateDevices()
          .then(devices => {
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setHasCamera(videoDevices.length > 0);
          })
          .catch(() => setHasCamera(false));
      } else {
        setHasCamera(false);
      }
    };

    checkDevice();
  }, []);

  return {
    isMobile,
    hasCamera,
    userAgent,
    isTablet: /iPad|Android(?!.*Mobile)/i.test(userAgent),
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/i.test(userAgent)
  };
};

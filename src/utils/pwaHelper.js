/**
 * Al Uswah Green PWA Utility & Smart Installer Helpers
 */

export const isStandaloneMode = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

export const isIOSDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );
};

export const getInstallUrl = () => {
  if (typeof window === 'undefined') return 'https://ecoschola.netlify.app/?install=true';
  const origin = window.location.origin;
  return `${origin}/?install=true`;
};

export const shareAppInvite = async () => {
  const url = getInstallUrl();
  const shareData = {
    title: 'Al Uswah Green - SMPIT Al Uswah Banyuwangi',
    text: 'Yuk pasang aplikasi Al Uswah Green di HP kamu! Klik link ini untuk menginstal:',
    url: url
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'share' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, aborted: true };
      }
    }
  }

  // Fallback to clipboard copy
  try {
    await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
    return { success: true, method: 'clipboard' };
  } catch (err) {
    return { success: false, error: err };
  }
};

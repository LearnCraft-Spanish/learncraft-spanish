import BannerDisplayContext from '@application/coordinators/contexts/BannerDisplayContext';
import { use } from 'react';

export function useBannerDisplay() {
  const context = use(BannerDisplayContext);

  if (!context) {
    throw new Error(
      'useBannerDisplay must be used within a BannerDisplayProvider',
    );
  }

  return context;
}

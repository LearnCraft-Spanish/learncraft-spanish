import { createContext } from 'react';

export interface BannerDisplayContextType {
  isBannerVisible: boolean;
  closeBanner: () => void;
}

export default createContext<BannerDisplayContextType>({
  isBannerVisible: false,
  closeBanner: () => {},
});

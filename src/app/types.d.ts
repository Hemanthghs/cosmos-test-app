import { Keplr } from '@keplr-wallet/types';
declare global {
  interface WalletWindow extends Window {
    keplr: Keplr;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    leap: any;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    wallet: Keplr | any;
  }
}

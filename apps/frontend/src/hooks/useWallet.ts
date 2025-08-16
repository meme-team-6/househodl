import { useUserWallets } from "@dynamic-labs/sdk-react-core";

export const useWallet = () => {
  const wallets = useUserWallets();

  if (!wallets.length) {
    console.warn("No wallets were found, we may still be loading.", wallets);
    return undefined;
  }

  const wallet = wallets[0];

  return wallet;
};

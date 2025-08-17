import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export const useWallet = () => {
  const { primaryWallet } = useDynamicContext();

  return primaryWallet;
};

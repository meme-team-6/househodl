import { masterTransactionManagerAbi, masterTransactionManagerAddress } from "@/abis/MasterTransactionManager";
import { evmProvidersSelector } from "@dynamic-labs/ethereum-core";
import { useRpcProviders } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { useWallet } from "./useWallet";

export const useHodls = () => {
  const wallet = useWallet();
  const rpcProvider = useRpcProviders(evmProvidersSelector);

  const [isLoading, setIsLoading] = useState(true);
  const [hodls, setHodls] = useState<string[]>([]);

  useEffect(() => {
    if (!wallet) return;
    console.log({ wallet });
    console.log("Calling RPC");
    setIsLoading(true);
    rpcProvider.defaultProvider?.provider
      .readContract({
        address: masterTransactionManagerAddress,
        abi: masterTransactionManagerAbi,
        functionName: "getUserHodls",
        args: [wallet.address],
      })
      .then((newHodls) => {
        setHodls(newHodls as string[]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [rpcProvider.defaultProvider?.provider, wallet]);

  return { isLoading, hodls };
};

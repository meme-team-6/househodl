import {
  masterTransactionManagerAbi,
  masterTransactionManagerAddress,
  masterTransactionManagerChainId,
} from "@/abis/MasterTransactionManager";
import { useCallback, useState } from "react";
import { isEthereumWallet } from "@dynamic-labs/ethereum";

import { useWallet } from "./useWallet";
import { useSwitchNetwork } from "@dynamic-labs/sdk-react-core";

export const useAddUserToHodl = (hodlId: string) => {
  const wallet = useWallet();
  const switchNetwork = useSwitchNetwork();

  const [isLoading, setIsLoading] = useState(false);

  const addUserToHodl = useCallback(
    async ({
      newUserAddress,
      newUserEid,
    }: {
      newUserAddress: string;
      newUserEid: string;
    }) => {
      if (!wallet || !isEthereumWallet(wallet)) {
        return;
      }
      setIsLoading(true);
      switchNetwork({ wallet, network: masterTransactionManagerChainId });

      try {
        const walletClient = await wallet.getWalletClient();

        await walletClient.writeContract({
          address: masterTransactionManagerAddress,
          abi: masterTransactionManagerAbi,
          functionName: "addUserToHodl",
          args: [newUserAddress, wallet.address, hodlId, newUserEid],
        });
      } finally {
        setIsLoading(false);
      }
    },
    [hodlId, switchNetwork, wallet]
  );

  return { isLoading, addUserToHodl };
};

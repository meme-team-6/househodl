import {
  masterTransactionManagerAbi,
  masterTransactionManagerAddress,
} from "@/abis/MasterTransactionManager";
import { useCallback, useState } from "react";
import { isEthereumWallet } from "@dynamic-labs/ethereum";

import { useWallet } from "./useWallet";

export const useAddUserToHodl = (hodlId: string) => {
  const wallet = useWallet();

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
    [hodlId, wallet]
  );

  return { isLoading, addUserToHodl };
};

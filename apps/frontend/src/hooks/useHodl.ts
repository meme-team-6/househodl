import {
  masterTransactionManagerAbi,
  masterTransactionManagerAddress,
} from "@/abis/MasterTransactionManager";
import { Hodl } from "@/lib/types";
import { evmProvidersSelector } from "@dynamic-labs/ethereum-core";
import { useRpcProviders } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";

export const useHodl = (hodlId: string) => {
  const rpcProvider = useRpcProviders(evmProvidersSelector);

  const [isLoading, setIsLoading] = useState(true);
  const [hodl, setHodl] = useState<Hodl | undefined>();

  useEffect(() => {
    setIsLoading(true);
    rpcProvider.defaultProvider?.provider
      .readContract({
        address: masterTransactionManagerAddress,
        abi: masterTransactionManagerAbi,
        functionName: "getHodlUsersWithEid",
        args: [hodlId],
      })
      .then((newHodl) => {
        setHodl({
          name: "NYC Eth Global Trip",
          spendLimit: 300,
          pendingExpenses: 185,
          members: [
            {
              chain: "polygon",
              address: "0x91989eF0853CE8EEf5458b5Da65ff8406e8bBB5e",
              debt: 150,
              usdcBalance: 30,
            },
          ],
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [hodlId, rpcProvider.defaultProvider?.provider]);

  return { isLoading, hodl };
};

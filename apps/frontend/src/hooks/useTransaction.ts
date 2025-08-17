import { evmProvidersSelector } from "@dynamic-labs/ethereum-core";
import { useWallet } from "./useWallet";
import { useRpcProviders } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState, useCallback } from "react";
import {
  masterTransactionManagerAbi,
  masterTransactionManagerAddress,
  masterTransactionManagerChainId,
} from "@/abis/MasterTransactionManager";

interface PendingTransaction {
  hodlId: string;
  id: string;
  transaction: {
    approvalVotes: unknown[];
    disapprovalVotes: unknown[];
    amountUsd: bigint;
    createdAt: number;
    originatingUser: string;
    vanityName: string;
  };
}

interface UseTransactionOptions {
  transactionId: string;
}

export const usePendingTransaction = ({
  transactionId,
}: UseTransactionOptions) => {
  const wallet = useWallet();
  const rpcProvider = useRpcProviders(evmProvidersSelector);

  const [transaction, setTransaction] = useState<
    PendingTransaction | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);

  const fetchTransaction = useCallback(() => {
    if (!wallet) return;

    setLoading(true);
    setTransaction(undefined);

    rpcProvider
      .getProviderByChainId(masterTransactionManagerChainId)
      ?.provider.readContract({
        address: masterTransactionManagerAddress,
        abi: masterTransactionManagerAbi,
        functionName: "getPendingTransaction",
        args: [transactionId],
      })
      .then((tx) => {
        setTransaction(tx as PendingTransaction);
      })
      .finally(() => setLoading(false));
  }, [rpcProvider, transactionId, wallet]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  return {
    transaction,
    loading,
    refetch: fetchTransaction,
  };
};

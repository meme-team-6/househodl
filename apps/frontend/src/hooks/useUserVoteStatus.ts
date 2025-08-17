import {
  masterTransactionManagerAbi,
  masterTransactionManagerAddress,
  masterTransactionManagerChainId,
} from "@/abis/MasterTransactionManager";
import { useEffect, useState, useCallback } from "react";
import { evmProvidersSelector } from "@dynamic-labs/ethereum-core";
import { useWallet } from "./useWallet";
import { useRpcProviders } from "@dynamic-labs/sdk-react-core";

interface UserVoteStatus {
  hasVoted: boolean;
  isApproval: boolean | null;
}

export const useUserVoteStatus = (transactionId: string) => {
  const wallet = useWallet();
  const rpcProvider = useRpcProviders(evmProvidersSelector);

  const [voteStatus, setVoteStatus] = useState<UserVoteStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVoteStatus = useCallback(() => {
    if (!wallet?.address || !transactionId) {
      setVoteStatus(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    rpcProvider
      .getProviderByChainId(masterTransactionManagerChainId)
      ?.provider.readContract({
        address: masterTransactionManagerAddress,
        abi: masterTransactionManagerAbi,
        functionName: "hasUserVoted",
        args: [transactionId, wallet.address],
      })
      .then((result) => {
        const [hasVoted, isApproval] = result as [boolean, boolean];
        setVoteStatus({
          hasVoted,
          isApproval: hasVoted ? isApproval : null,
        });
      })
      .catch((error) => {
        console.error("Error checking user vote status:", error);
        setVoteStatus(null);
      })
      .finally(() => setLoading(false));
  }, [rpcProvider, transactionId, wallet?.address]);

  useEffect(() => {
    fetchVoteStatus();
  }, [fetchVoteStatus]);

  return {
    voteStatus,
    loading,
    refetch: fetchVoteStatus,
  };
};

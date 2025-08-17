import {
  masterTransactionManagerAbi,
  masterTransactionManagerAddress,
  masterTransactionManagerChainId,
} from "@/abis/MasterTransactionManager";
import { useCallback, useState } from "react";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { useWallet } from "./useWallet";
import { useSwitchNetwork } from "@dynamic-labs/sdk-react-core";

export const useVoteOnTransaction = () => {
  const wallet = useWallet();
  const switchNetwork = useSwitchNetwork();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voteOnTransaction = useCallback(
    async (transactionId: string, approve: boolean) => {
      if (!wallet || !isEthereumWallet(wallet)) {
        setError("No wallet connected");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Switch to the correct network
        await switchNetwork({ 
          wallet, 
          network: masterTransactionManagerChainId 
        });

        const walletClient = await wallet.getWalletClient();
        
        // Call voteOnTransaction function with transactionId and approve boolean
        const txHash = await walletClient.writeContract({
          address: masterTransactionManagerAddress,
          abi: masterTransactionManagerAbi,
          functionName: "voteOnTransaction",
          args: [transactionId, approve],
        });

        console.log("Vote submitted successfully:", { txHash, transactionId, approve });
        return txHash;

      } catch (error: unknown) {
        console.error("Error voting on transaction:", error);
        
        // Handle specific error types
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("User not part of hodl")) {
          setError("You are not a member of this hodl");
        } else if (errorMessage.includes("Transaction does not exist")) {
          setError("Transaction not found");
        } else if (errorMessage.includes("User rejected")) {
          setError("Transaction cancelled by user");
        } else {
          setError("Failed to submit vote. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [wallet, switchNetwork]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { 
    voteOnTransaction, 
    isLoading, 
    error, 
    clearError 
  };
};

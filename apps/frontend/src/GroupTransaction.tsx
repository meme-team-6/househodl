import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Receipt, CheckCircle, XCircle } from "lucide-react";
import { useHodl } from "./hooks/useHodl";
import { VotingStatus } from "./VotingStatus";
import { useMemo, useEffect } from "react";
import { usePendingTransaction } from "./hooks/useTransaction";
import { useReverseEns } from "./hooks/useENS";

// Extend Window interface to include our custom property
declare global {
  interface Window {
    openMobileSidebar?: () => void;
  }
}

interface TransactionData {
  id: string;
  title: string;
  description: string;
  amount: number;
  submittedBy: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  votesRequired: number;
  currentVotes: {
    approve: number;
    reject: number;
  };
  voters: Array<{
    name: string;
    vote: "approve" | "reject" | null;
    avatar: string;
  }>;
}

function GroupTransaction() {
  const { id, transactionId } = useParams<{
    id: string;
    transactionId: string;
  }>();

  const { isLoading: isHodlLoading, hodl } = useHodl(id || "");
  const { isLoading: isTxLoading, transaction } = usePendingTransaction({
    transactionId: transactionId || "",
  });

  const status = useMemo(() => {
    if (
      transaction?.transaction.approvalVotes.length ??
      0 > (hodl?.members.length ?? 1) / 2
    )
      return "approved";
    else if (
      transaction?.transaction.disapprovalVotes.length ??
      0 > (hodl?.members.length ?? 1) / 2
    )
      return "rejected";
    else return "pending";
  }, []);

  const { ensName, ensAvatar } = useReverseEns(
    transaction?.transaction.originatingUser ||
      "0x0000000000000000000000000000000000000000"
  );

  const transactionAmount = useMemo(
    () => Number(transaction?.transaction.amountUsd ?? 0n) / 1000000,
    [transaction?.transaction.amountUsd]
  );

  const vanityName = useMemo(() => {
    return (
      transaction?.transaction.vanityName
        .split(/(\w\w)/g)
        .filter((p) => !!p)
        .map((c) => String.fromCharCode(parseInt(c, 16)))
        .join("") || "Unnamed Transaction"
    );
  }, [transaction]);

  useEffect(() => {
    console.log(transaction);
  }, [transaction]);

  const handleMobileMenuClick = () => {
    if (typeof window !== "undefined" && window.openMobileSidebar) {
      window.openMobileSidebar();
    }
  };

  // Mock transaction data
  const transactionData: TransactionData = {
    id: transactionId || "1",
    title: "Team dinner expenses",
    description:
      "Dinner at local restaurant for team building event. Includes appetizers, main courses, and drinks for 4 people.",
    amount: 120,
    submittedBy: "Alex Chen",
    submittedAt: "2 hours ago",
    status: "pending",
    votesRequired: 3,
    currentVotes: {
      approve: 1,
      reject: 0,
    },
    voters: [
      {
        name: "Russell Bloxwich",
        vote: "approve",
        avatar: "https://avatars.githubusercontent.com/u/23006558",
      },
      {
        name: "Sarah Kim",
        vote: null,
        avatar: "https://avatars.githubusercontent.com/u/20110627",
      },
      {
        name: "Mike Johnson",
        vote: null,
        avatar: "https://avatars.githubusercontent.com/u/106103625",
      },
      {
        name: "Emma Davis",
        vote: null,
        avatar: "https://avatars.githubusercontent.com/u/59228569",
      },
    ],
  };

  const handleVote = (vote: "approve" | "reject") => {
    // In a real app, this would make an API call
    console.log(`Voted ${vote} on transaction ${transactionId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Househodl" onMobileMenuClick={handleMobileMenuClick} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/10">
          {/* Back Navigation */}
          <div className="mb-6 max-w-4xl mx-auto">
            <Link
              to={`/group/${id}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Hodl
            </Link>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Transaction Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{vanityName}</CardTitle>
                      <CardDescription className="mt-1">
                        Submitted by{" "}
                        {ensName || transaction?.transaction.originatingUser} •{" "}
                        {new Date(
                          transaction?.transaction.createdAt ?? ""
                        ).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground italic">
                      No Description
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <h4 className="font-medium">Amount</h4>
                      <p className="text-2xl font-bold">
                        ${transactionAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Per Person</h4>
                      <p className="text-2xl font-bold">
                        $
                        {(
                          transactionAmount / (hodl?.members.length || 1)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <VotingStatus
              hodlId={id || ""}
              approvedVotes={transaction?.transaction.approvalVotes.length ?? 0}
              disapprovalVotes={
                transaction?.transaction.disapprovalVotes.length ?? 0
              }
            />

            {/* Voting Actions */}
            {transactionData.status === "pending" && (
              <Card>
                <CardHeader>
                  <CardTitle>Cast Your Vote</CardTitle>
                  <CardDescription>
                    Review the transaction details and vote to approve or reject
                    this expense.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleVote("approve")}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Transaction
                    </Button>
                    <Button
                      onClick={() => handleVote("reject")}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Transaction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Receipt */}
            <Card>
              <CardHeader>
                <CardTitle>Receipt</CardTitle>
                <CardDescription>
                  Attached receipt for this transaction.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-gray-800">
                        Sakura Ramen House
                      </h3>
                      <p className="text-sm text-gray-600">
                        123 Main Street, NYC
                      </p>
                      <p className="text-sm text-gray-600">
                        Tel: (555) 123-4567
                      </p>
                    </div>
                    <div className="border-t border-dashed border-gray-300 pt-3">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Tonkotsu Ramen x2</span>
                          <span>$32.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gyoza (6pc) x2</span>
                          <span>$24.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Edamame x2</span>
                          <span>$12.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Green Tea x4</span>
                          <span>$16.00</span>
                        </div>
                        <div className="border-t border-dashed border-gray-300 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>$84.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax (8.25%):</span>
                            <span>$6.93</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tip (18%):</span>
                            <span>$16.37</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t border-gray-400 pt-1 mt-1">
                            <span>Total:</span>
                            <span>$107.30</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-4 text-xs text-gray-500">
                      <p>Thank you for dining with us!</p>
                      <p>Date: Jan 15, 2025 7:30 PM</p>
                      <p>Server: Mike | Table: 12</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Receipt automatically processed and verified.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default GroupTransaction;

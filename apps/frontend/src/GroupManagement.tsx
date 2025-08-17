import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/header";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  Receipt,
  Plus,
  X,
  Upload,
  Camera,
  ArrowLeft,
  ArrowRight,
  UserPlus,
  Settings,
  FileText,
  Vote,
  UserMinus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { AvatarCircles } from "./components/magicui/avatar-circles";
import { Separator } from "./components/ui/separator";
import { useHodl } from "./hooks/useHodl";
import { useHodlPendingTransactions } from "./hooks/useHodlPendingTransactions";
import { useCreateTransaction } from "./hooks/useCreateTransaction";
import { useAddUserToHodl } from "./hooks/useAddUserToHodl";
import { masterTransactionManagerChainId } from "./abis/MasterTransactionManager";

// Mock data - in real app this would come from API based on id
const defaultAvatars = [
  {
    imageUrl: "https://avatars.githubusercontent.com/u/23006558",
    profileUrl: "https://github.com/dillionverma",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/20110627",
    profileUrl: "https://github.com/tomonarifeehan",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/106103625",
    profileUrl: "https://github.com/BankkRoll",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/59228569",
    profileUrl: "https://github.com/safethecode",
  },
];

const pastExpenses: ActivityItem[] = [
  {
    id: "6",
    type: "payment",
    title: "Office rent payment",
    description: "Monthly office space rental",
    amount: 800,
    user: "Alex Chen",
    timestamp: "1 week ago",
    icon: Receipt,
  },
  {
    id: "5",
    type: "payment",
    title: "Office supplies",
    description: "Stationery and equipment",
    amount: 75,
    user: "David Lee",
    timestamp: "1 week ago",
    icon: Receipt,
  },
  {
    id: "7",
    type: "payment",
    title: "Team lunch",
    description: "Weekly team bonding meal",
    amount: 150,
    user: "Sarah Kim",
    timestamp: "2 weeks ago",
    icon: Receipt,
  },
  {
    id: "3",
    type: "member_joined",
    title: "New member joined",
    description: "Mike Johnson joined the group",
    user: "Mike Johnson",
    timestamp: "2 weeks ago",
    icon: UserPlus,
  },
];

// Extend Window interface to include our custom property
declare global {
  interface Window {
    openMobileSidebar?: () => void;
  }
}

interface ActivityItem {
  id: string;
  type: "expense" | "payment" | "member_joined";
  title: string;
  description: string;
  amount?: number;
  user: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
}

type ExpenseStep = "upload" | "details" | "confirmation";

interface ExpenseData {
  receipt: File | null;
  businessName: string;
  reason: string;
  amount: string;
}

const GroupManagement = () => {
  const { id } = useParams<{ id: string }>();
  const { isLoading, hodl } = useHodl(id || "");
  const { transactions: upcomingExpenses } = useHodlPendingTransactions(
    id || ""
  );

  const { addUserToHodl } = useAddUserToHodl(id || "");

  const { createTransaction } = useCreateTransaction(id || "");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseStep, setExpenseStep] = useState<ExpenseStep>("upload");
  const [expenseData, setExpenseData] = useState<ExpenseData>({
    businessName: "",
    reason: "",
    amount: "",
    receipt: null,
  });
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState<string>("");

  const [inviteAddresses, setInviteAddresses] = useState<string>("");

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsData, setSettingsData] = useState<{ name?: string }>({
    name: "",
  });
  const [showCloseGroupConfirm, setShowCloseGroupConfirm] = useState(false);
  const [showLeaveGroupConfirm, setShowLeaveGroupConfirm] = useState(false);

  const handleMobileMenuClick = () => {
    if (typeof window !== "undefined" && window.openMobileSidebar) {
      window.openMobileSidebar();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setExpenseData((prev) => ({ ...prev, receipt: file }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setExpenseStep("details");
    }
  };

  const handleExpenseInputChange = (
    field: keyof ExpenseData,
    value: string
  ) => {
    setExpenseData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExpenseSubmit = () => {
    console.log("Submitting expense:", expenseData);
    createTransaction({
      name: expenseData.businessName,
      amount: +expenseData.amount,
    });
    // Here you would make API call
    setShowExpenseModal(false);
    setExpenseStep("upload");
    setExpenseData({ receipt: null, businessName: "", reason: "", amount: "" });
  };

  const resetExpenseModal = () => {
    setShowExpenseModal(false);
    setExpenseStep("upload");
    setExpenseData({ receipt: null, businessName: "", reason: "", amount: "" });
    setReceiptPreview(null);
  };

  // Settings modal handlers
  const openSettingsModal = () => {
    setSettingsData({
      name: hodl?.name,
    });
    setShowSettingsModal(true);
  };

  const handleSettingsChange = (
    field: "name" | "description",
    value: string
  ) => {
    setSettingsData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    console.log("Saving settings:", settingsData);
    // Here you would make API call to update group settings
    setShowSettingsModal(false);
  };

  const handleVoteToCloseGroup = () => {
    console.log("Creating vote to close group");
    // Here you would create a vote to close the group
    setShowCloseGroupConfirm(false);
    setShowSettingsModal(false);
  };

  const handleLeaveGroup = () => {
    console.log("Leaving group");
    // Here you would make API call to leave the group
    setShowLeaveGroupConfirm(false);
    setShowSettingsModal(false);
  };

  const handleInviteSubmit = () => {
    const addresses = inviteAddresses
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    const handle = async () => {
      for (const address of addresses) {
        addUserToHodl({
          newUserAddress: address,
          newUserChainId: String(masterTransactionManagerChainId),
        });
      }
    };
    handle();
  };

  const resetInviteModal = () => {
    setShowInviteModal(false);
    setInviteEmails("");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Househodl" onMobileMenuClick={handleMobileMenuClick} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/10">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          {/* Group Header */}
          <div className="mb-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-semibold tracking-tighter mb-2">
                  {hodl?.name}
                </h1>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowExpenseModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowInviteModal(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
                <Button variant="outline" onClick={openSettingsModal}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Group Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Available Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    ${hodl?.spendLimit.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Your Share
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    $
                    {Math.round(
                      (hodl?.spendLimit || 0) / (hodl?.members.length || 1)
                    ).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className=" hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold">{hodl?.members.length}</p>
                    <AvatarCircles
                      numPeople={hodl?.members.length}
                      avatarUrls={defaultAvatars}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    $
                    {upcomingExpenses
                      .reduce(
                        (total, transaction) => total + transaction.amountUsd,
                        0
                      )
                      .toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Upcoming Expenses */}
          <Card className="max-w-6xl mx-auto mb-6">
            <CardHeader>
              <CardTitle>Pending</CardTitle>
              <CardDescription>
                Pending expenses and actions awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingExpenses.map((transaction) => (
                  <Link
                    to={`/group/${id}/${transaction.id}`}
                    key={transaction.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">
                      <Receipt className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm text-[#00D57F]">
                          {transaction.vanityName}
                        </h4>
                        {transaction.amountUsd && (
                          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                            ${transaction.amountUsd}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {transaction.originatingUser}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            transaction.submittedAt * 1000
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Past Expenses */}
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle>Past </CardTitle>
              <CardDescription>
                Completed transactions and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastExpenses.map((activity) => (
                  <Link
                    to={`/group/${id}/${activity.id}`}
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                      <activity.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm text-[#00D57F]">
                          {activity.title}
                        </h4>
                        {activity.amount && (
                          <span
                            className={`text-sm font-medium ${
                              activity.type === "payment"
                                ? "text-green-600"
                                : "text-foreground"
                            }`}
                          >
                            {activity.type === "payment" ? "+" : "-"}$
                            {activity.amount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {activity.user}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Add Expense Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Add Expense</h2>
                <Button variant="ghost" size="sm" onClick={resetExpenseModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Step 1: Receipt Upload */}
              {expenseStep === "upload" && (
                <div className="p-6 space-y-4">
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      Upload Receipt or Quote
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Take a photo or upload an image of your receipt
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* File Upload */}
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                      <input
                        type="file"
                        id="receipt-upload"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="cursor-pointer"
                      >
                        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload</p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG up to 10MB
                        </p>
                      </label>
                    </div>

                    {/* Camera Option */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        document.getElementById("receipt-upload")?.click()
                      }
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Expense Details */}
              {expenseStep === "details" && (
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Receipt Preview */}
                    <div className="flex flex-col">
                      {receiptPreview && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Receipt</h3>
                          <div className="relative">
                            <img
                              src={receiptPreview}
                              alt="Receipt preview"
                              className="w-full max-w-md mx-auto rounded-lg border shadow-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Form Fields */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Expense Details</h3>

                      {/* Business Name */}
                      <div>
                        <Label htmlFor="businessName">Name *</Label>
                        <Input
                          id="businessName"
                          placeholder="e.g. Starbucks, Office Depot, Uber"
                          value={expenseData.businessName}
                          onChange={(e) =>
                            handleExpenseInputChange(
                              "businessName",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* Reason */}
                      <div>
                        <Label htmlFor="reason">Reason for Expense</Label>
                        <Textarea
                          id="reason"
                          placeholder="e.g. Team lunch, office supplies, transportation"
                          value={expenseData.reason}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) =>
                            handleExpenseInputChange("reason", e.target.value)
                          }
                          rows={3}
                        />
                      </div>

                      {/* Amount */}
                      <div>
                        <Label htmlFor="amount">Amount *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-10"
                            value={expenseData.amount}
                            onChange={(e) =>
                              handleExpenseInputChange("amount", e.target.value)
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                          {" "}
                          <Button
                            onClick={() => setExpenseStep("confirmation")}
                            disabled={
                              !expenseData.businessName || !expenseData.amount
                            }
                          >
                            Review
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setExpenseStep("upload")}
                          >
                            Cancel
                          </Button>
                          <div className="h-[1px] bg-muted-foreground/25 my-4" />
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full max-w-md mx-auto"
                            onClick={() => {
                              setReceiptPreview(null);
                              setExpenseData((prev) => ({
                                ...prev,
                                receipt: null,
                              }));
                              setExpenseStep("upload");
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Change Receipt
                          </Button>
                        </div>{" "}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {expenseStep === "confirmation" && (
                <div className="p-6 space-y-4">
                  <div className="text-center mb-6">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium">Review Expense</h3>
                    <p className="text-sm text-muted-foreground">
                      Please review the details before submitting
                    </p>
                  </div>

                  {/* Expense Summary */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Business:
                      </span>
                      <span className="text-sm font-medium">
                        {expenseData.businessName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Amount:
                      </span>
                      <span className="text-sm font-medium">
                        ${expenseData.amount}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">
                        Reason:
                      </span>
                      <span className="text-sm font-medium text-right max-w-[200px]">
                        {expenseData.reason}
                      </span>
                    </div>
                    {expenseData.receipt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Receipt:
                        </span>
                        <span className="text-sm font-medium">
                          {expenseData.receipt.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Split Preview */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Split Details</h4>
                    <p className="text-sm text-muted-foreground">
                      This expense will be split equally among{" "}
                      {hodl?.members.length} members
                    </p>
                    <p className="text-sm font-medium mt-1">
                      Each member owes: $
                      {(
                        parseFloat(expenseData.amount) /
                        (hodl?.members.length || 1)
                      ).toFixed(2)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setExpenseStep("details")}
                      className="flex-1"
                    >
                      Edit Details
                    </Button>
                    <Button onClick={handleExpenseSubmit} className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invite Members Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}

              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Invite Members</h2>
                <Button variant="ghost" size="sm" onClick={resetInviteModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Address Input Section */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invite-addresses">Wallet Addresses</Label>
                    <Textarea
                      id="invite-addresses"
                      placeholder="Enter wallet addresses separated by commas&#10;e.g. 0x1234567890123456789012345678901234567890, 0x1234567890123456789012345678901234567890"
                      value={inviteAddresses}
                      onChange={(e) => setInviteAddresses(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Separate multiple email addresses with commas. Adds
                      members to the group.
                    </p>
                  </div>

                  <Button
                    onClick={handleInviteSubmit}
                    disabled={!inviteAddresses.trim()}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Members
                  </Button>
                </div>
              </div>

              <Separator />
              <div className="p-6 space-y-6">
                {/* Email Input Section */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invite-emails">Email Addresses</Label>
                    <Textarea
                      id="invite-emails"
                      placeholder="Enter email addresses separated by commas&#10;e.g. john@example.com, jane@example.com, bob@example.com"
                      value={inviteEmails}
                      onChange={(e) => setInviteEmails(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Separate multiple email addresses with commas. Invites
                      members to the platform.
                    </p>
                  </div>

                  <Button
                    onClick={handleInviteSubmit}
                    disabled={!inviteEmails.trim()}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Send Invitations
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Group Settings</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettingsModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Group Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Group Information</h3>

                  <div>
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input
                      id="group-name"
                      value={settingsData.name}
                      onChange={(e) =>
                        handleSettingsChange("name", e.target.value)
                      }
                      placeholder="Enter group name"
                    />
                  </div>

                  <Button
                    onClick={handleSaveSettings}
                    className="w-full"
                    disabled={!settingsData?.name?.trim()}
                  >
                    Save Changes
                  </Button>
                </div>

                {/* Dangerous Actions */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-medium text-red-600">
                    Dangerous Actions
                  </h3>

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowCloseGroupConfirm(true)}
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Vote className="h-4 w-4 mr-2" />
                      Vote to Close Group
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowLeaveGroupConfirm(true)}
                      className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Leave Group
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Close Group Confirmation */}
        {showCloseGroupConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Vote className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Vote to Close Group</h3>
                </div>

                <p className="text-muted-foreground mb-6">
                  This will create a vote to permanently close the group. All
                  members will be able to vote on this decision. If the vote
                  passes, the group and all its data will be permanently
                  deleted.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCloseGroupConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleVoteToCloseGroup}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Create Vote
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leave Group Confirmation */}
        {showLeaveGroupConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <UserMinus className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Leave Group</h3>
                </div>

                <p className="text-muted-foreground mb-6">
                  Are you sure you want to leave this group? You will lose
                  access to all group data and transactions. You can only rejoin
                  if another member invites you back.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowLeaveGroupConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLeaveGroup}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    Leave Group
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>{" "}
    </div>
  );
};

export default GroupManagement;

import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/header";
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, Receipt, Plus, X, Upload, Camera, ArrowLeft, ArrowRight, UserPlus, Settings, FileText, Mail, Trash2, Vote, UserMinus, CheckCircle, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from './components/ui/textarea'
import { AvatarCircles } from "./components/magicui/avatar-circles";

// Extend Window interface to include our custom property
declare global {
  interface Window {
    openMobileSidebar?: () => void;
  }
}

interface GroupData {
  id: string;
  name: string;
  description: string;
  availableAmount: number;
  pendingExpenses: number;
  memberCount: number;
  avatars: Array<{
    imageUrl: string;
    profileUrl: string;
  }>;
}

interface ActivityItem {
  id: string;
  type: 'expense' | 'payment' | 'member_joined';
  title: string;
  description: string;
  amount?: number;
  user: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
}

type ExpenseStep = 'upload' | 'details' | 'confirmation';

interface ExpenseData {
  receipt: File | null;
  businessName: string;
  reason: string;
  amount: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  profileUrl: string;
  joinedAt: Date;
  role: 'admin' | 'member';
}

interface VoteData {
  id: string;
  type: 'add' | 'remove';
  targetMember?: Member;
  targetEmail?: string;
  targetName?: string;
  createdBy: string;
  createdAt: Date;
  votesFor: string[];
  votesAgainst: string[];
  status: 'active' | 'passed' | 'failed';
  requiredVotes: number;
}

const GroupManagement = () => {
  const { id } = useParams<{ id: string }>();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseStep, setExpenseStep] = useState<ExpenseStep>('upload');
  const [expenseData, setExpenseData] = useState<ExpenseData>({
    businessName: '',
    reason: '',
    amount: '',
    receipt: null
  })
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  
  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmails, setInviteEmails] = useState<string>('')
  const [sentInvites, setSentInvites] = useState<Array<{id: string, email: string, status: 'pending' | 'accepted' | 'invalid', sentAt: Date}>>([{
    id: '1',
    email: 'john@example.com',
    status: 'pending',
    sentAt: new Date('2024-01-15')
  }, {
    id: '2', 
    email: 'invalid-email@nonexistent.com',
    status: 'invalid',
    sentAt: new Date('2024-01-14')
  }]);

  // Member management modal state
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [activeVotes, setActiveVotes] = useState<VoteData[]>([]);

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [settingsData, setSettingsData] = useState({
    name: '',
    description: ''
  })
  const [showCloseGroupConfirm, setShowCloseGroupConfirm] = useState(false)
  const [showLeaveGroupConfirm, setShowLeaveGroupConfirm] = useState(false)

  const handleMobileMenuClick = () => {
    if (typeof window !== 'undefined' && window.openMobileSidebar) {
      window.openMobileSidebar();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setExpenseData(prev => ({ ...prev, receipt: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setExpenseStep('details');
    }
  };

  const handleExpenseInputChange = (field: keyof ExpenseData, value: string) => {
    setExpenseData(prev => ({ ...prev, [field]: value }));
  };

  const handleExpenseSubmit = () => {
    console.log('Submitting expense:', expenseData);
    // Here you would make API call
    setShowExpenseModal(false);
    setExpenseStep('upload');
    setExpenseData({ receipt: null, businessName: '', reason: '', amount: '' });
  };

  const resetExpenseModal = () => {
    setShowExpenseModal(false);
    setExpenseStep('upload');
    setExpenseData({ receipt: null, businessName: '', reason: '', amount: '' });
    setReceiptPreview(null);
  };

  // Settings modal handlers
  const openSettingsModal = () => {
    setSettingsData({
      name: groupData.name,
      description: groupData.description
    });
    setShowSettingsModal(true);
  };

  const handleSettingsChange = (field: 'name' | 'description', value: string) => {
    setSettingsData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    console.log('Saving settings:', settingsData);
    // Here you would make API call to update group settings
    setShowSettingsModal(false);
  };

  const handleVoteToCloseGroup = () => {
    console.log('Creating vote to close group');
    // Here you would create a vote to close the group
    setShowCloseGroupConfirm(false);
    setShowSettingsModal(false);
  };

  const handleLeaveGroup = () => {
    console.log('Leaving group');
    // Here you would make API call to leave the group
    setShowLeaveGroupConfirm(false);
    setShowSettingsModal(false);
  };

  const handleInviteSubmit = () => {
    const emails = inviteEmails.split(',').map(email => email.trim()).filter(email => email);
    const newInvites = emails.map(email => ({
      id: Math.random().toString(36).substr(2, 9),
      email,
      status: 'pending' as const,
      sentAt: new Date()
    }));
    
    setSentInvites(prev => [...prev, ...newInvites]);
    setInviteEmails('');
    console.log('Sending invites to:', emails);
  };

  const removeInvite = (inviteId: string) => {
    setSentInvites(prev => prev.filter(invite => invite.id !== inviteId));
  };

  const resetInviteModal = () => {
    setShowInviteModal(false);
    setInviteEmails('');
  };

  // Member management handlers
  const resetMemberModal = () => {
    setShowMemberModal(false);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const handleVoteToAdd = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    
    const newVote: VoteData = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'add',
      targetEmail: newMemberEmail,
      targetName: newMemberName,
      createdBy: 'Current User', // In real app, this would be the current user
      createdAt: new Date(),
      votesFor: ['current-user'], // Creator automatically votes for
      votesAgainst: [],
      status: 'active',
      requiredVotes: Math.ceil(groupData.memberCount / 2) + 1
    };
    
    setActiveVotes(prev => [...prev, newVote]);
    setNewMemberName('');
    setNewMemberEmail('');
    console.log('Created vote to add member:', newVote);
  };

  const handleVoteToRemove = (member: Member) => {
    const newVote: VoteData = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'remove',
      targetMember: member,
      createdBy: 'Current User',
      createdAt: new Date(),
      votesFor: ['current-user'],
      votesAgainst: [],
      status: 'active',
      requiredVotes: Math.ceil(groupData.memberCount / 2) + 1
    };
    
    setActiveVotes(prev => [...prev, newVote]);
    console.log('Created vote to remove member:', newVote);
  };

  const handleVote = (voteId: string, support: boolean) => {
    setActiveVotes(prev => prev.map(vote => {
      if (vote.id !== voteId) return vote;
      
      const userId = 'current-user'; // In real app, get from auth
      let newVotesFor = [...vote.votesFor];
      let newVotesAgainst = [...vote.votesAgainst];
      
      // Remove user from both arrays first
      newVotesFor = newVotesFor.filter(id => id !== userId);
      newVotesAgainst = newVotesAgainst.filter(id => id !== userId);
      
      // Add to appropriate array
      if (support) {
        newVotesFor.push(userId);
      } else {
        newVotesAgainst.push(userId);
      }
      
      // Check if vote passes or fails
      let newStatus = vote.status;
      if (newVotesFor.length >= vote.requiredVotes) {
        newStatus = 'passed';
      } else if (newVotesAgainst.length >= vote.requiredVotes) {
        newStatus = 'failed';
      }
      
      return {
        ...vote,
        votesFor: newVotesFor,
        votesAgainst: newVotesAgainst,
        status: newStatus
      };
    }));
  };

  // Mock data - in real app this would come from API based on id
  const defaultAvatars = [
    {
      imageUrl: "https://avatars.githubusercontent.com/u/16860528",
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

  // Mock members data
  const members: Member[] = [
    {
      id: '1',
      name: 'Dillion Verma',
      email: 'dillion@example.com',
      imageUrl: 'https://avatars.githubusercontent.com/u/16860528',
      profileUrl: 'https://github.com/dillionverma',
      joinedAt: new Date('2024-01-01'),
      role: 'admin'
    },
    {
      id: '2',
      name: 'Tomon Arifeehan',
      email: 'tomon@example.com',
      imageUrl: 'https://avatars.githubusercontent.com/u/20110627',
      profileUrl: 'https://github.com/tomonarifeehan',
      joinedAt: new Date('2024-01-05'),
      role: 'member'
    },
    {
      id: '3',
      name: 'BankkRoll',
      email: 'bankk@example.com',
      imageUrl: 'https://avatars.githubusercontent.com/u/106103625',
      profileUrl: 'https://github.com/BankkRoll',
      joinedAt: new Date('2024-01-10'),
      role: 'member'
    },
    {
      id: '4',
      name: 'SafeTheCode',
      email: 'safe@example.com',
      imageUrl: 'https://avatars.githubusercontent.com/u/59228569',
      profileUrl: 'https://github.com/safethecode',
      joinedAt: new Date('2024-01-15'),
      role: 'member'
    }
  ];

  const groupData: GroupData = {
    id: id || "1",
    name: id === "1" ? "NYC Hacker House" : id === "2" ? "Blockchain Maker Club" : "ETHGlobal NYC 2025",
    description: "Shared expenses for our group activities and events",
    availableAmount: 1230,
    pendingExpenses: 0,
    memberCount: 4,
    avatars: defaultAvatars
  };

  // Mock activity data - split into upcoming and past expenses
  const upcomingExpenses: ActivityItem[] = [
    {
      id: "1",
      type: "expense",
      title: "Team dinner expenses",
      description: "Approved in 2 days",
      amount: 120,
      user: "Alex Chen",
      timestamp: "2 hours ago",
      icon: Receipt
    },
    {
      id: "2", 
      type: "expense",
      title: "Grocery expenses",
      description: "Approved in 1 day",
      amount: 45,
      user: "Sarah Kim",
      timestamp: "1 day ago",
      icon: Receipt
    },
    {
      id: "4",
      type: "expense",
      title: "Transportation to venue",
      description: "Approved in 5 days",
      amount: 28,
      user: "Emma Davis",
      timestamp: "3 days ago",
      icon: Receipt
    }
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
      icon: Receipt
    },
    {
      id: "5",
      type: "payment",
      title: "Office supplies",
      description: "Stationery and equipment",
      amount: 75,
      user: "David Lee",
      timestamp: "1 week ago",
      icon: Receipt
    },
    {
      id: "7",
      type: "payment",
      title: "Team lunch",
      description: "Weekly team bonding meal",
      amount: 150,
      user: "Sarah Kim",
      timestamp: "2 weeks ago",
      icon: Receipt
    },
    {
      id: "3",
      type: "member_joined",
      title: "New member joined",
      description: "Mike Johnson joined the group",
      user: "Mike Johnson",
      timestamp: "2 weeks ago",
      icon: UserPlus
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          title="Househodl" 
          onMobileMenuClick={handleMobileMenuClick}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/10">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link to="/home-filled" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          {/* Group Header */}
          <div className="mb-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-semibold tracking-tighter mb-2">{groupData.name}</h1>
                <p className="text-muted-foreground">{groupData.description}</p>
              </div><div className="flex gap-3"> <Button onClick={() => setShowExpenseModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
            <Button variant="outline" onClick={() => setShowInviteModal(true)}>
              <Users className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
              <Button variant="outline" onClick={openSettingsModal}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button></div>
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
                  <p className="text-2xl font-bold">${groupData.availableAmount.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Your Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${Math.round(groupData.availableAmount / groupData.memberCount).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setShowMemberModal(true)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold">{groupData.memberCount}</p>
                    <AvatarCircles numPeople={groupData.memberCount} avatarUrls={groupData.avatars} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{groupData.pendingExpenses}</p>
                </CardContent>
              </Card>
              
            
            </div>
          </div>

        
          {/* Upcoming Expenses */}
          <Card className="max-w-6xl mx-auto mb-6">
            <CardHeader>
              <CardTitle>Upcoming </CardTitle>
              <CardDescription>Pending expenses and actionsawaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingExpenses.map((activity) => (
                  <a href={`/group/${id}/${activity.id}`} key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">
                      <activity.icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm text-[#00D57F]">{activity.title}</h4>
                        {activity.amount && (
                          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                            ${activity.amount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{activity.user}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Past Expenses */}
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle>Past </CardTitle>
              <CardDescription>Completed transactions and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastExpenses.map((activity) => (
                  <a href={`/group/${id}/${activity.id}`} key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                      <activity.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm text-[#00D57F]">{activity.title}</h4>
                        {activity.amount && (
                          <span className={`text-sm font-medium ${
                            activity.type === 'payment' ? 'text-green-600' : 'text-foreground'
                          }`}>
                            {activity.type === 'payment' ? '+' : '-'}${activity.amount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{activity.user}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      </div>
                    </div>
                  </a>
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
              {expenseStep === 'upload' && (
                <div className="p-6 space-y-4">
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Upload Receipt or Quote</h3>
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
                      <label htmlFor="receipt-upload" className="cursor-pointer">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                      </label>
                    </div>

                    {/* Camera Option */}
                    <Button variant="outline" className="w-full" onClick={() => document.getElementById('receipt-upload')?.click()}>
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Expense Details */}
              {expenseStep === 'details' && (
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full max-w-md mx-auto"
                            onClick={() => {
                              setReceiptPreview(null);
                              setExpenseData(prev => ({ ...prev, receipt: null }));
                              setExpenseStep('upload');
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Change Receipt
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Form Fields */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Expense Details</h3>
                      
                      {/* Business Name */}
                      <div>
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input
                          id="businessName"
                          placeholder="e.g. Starbucks, Office Depot, Uber"
                          value={expenseData.businessName}
                          onChange={(e) => handleExpenseInputChange('businessName', e.target.value)}
                        />
                      </div>

                      {/* Reason */}
                      <div>
                        <Label htmlFor="reason">Reason for Expense *</Label>
                        <Textarea
                          id="reason"
                          placeholder="e.g. Team lunch, office supplies, transportation"
                          value={expenseData.reason}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleExpenseInputChange('reason', e.target.value)}
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
                            onChange={(e) => handleExpenseInputChange('amount', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => setExpenseStep('upload')}
                    >
                    Cancel
                    </Button>
                    <Button 
                      onClick={() => setExpenseStep('confirmation')}
                      disabled={!expenseData.businessName || !expenseData.reason || !expenseData.amount}
                    >
                      Review
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {expenseStep === 'confirmation' && (
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
                      <span className="text-sm text-muted-foreground">Business:</span>
                      <span className="text-sm font-medium">{expenseData.businessName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="text-sm font-medium">${expenseData.amount}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">Reason:</span>
                      <span className="text-sm font-medium text-right max-w-[200px]">{expenseData.reason}</span>
                    </div>
                    {expenseData.receipt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Receipt:</span>
                        <span className="text-sm font-medium">{expenseData.receipt.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Split Preview */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Split Details</h4>
                    <p className="text-sm text-muted-foreground">
                      This expense will be split equally among {groupData.memberCount} members
                    </p>
                    <p className="text-sm font-medium mt-1">
                      Each member owes: ${(parseFloat(expenseData.amount) / groupData.memberCount).toFixed(2)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setExpenseStep('details')} className="flex-1">
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

        {/* Member Management Modal */}
        {showMemberModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Member Management</h2>
                <Button variant="ghost" size="sm" onClick={resetMemberModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Current Members */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Current Members ({members.length})</h3>
                  <div className="grid gap-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <img 
                            src={member.imageUrl} 
                            alt={member.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{member.name}</span>
                              {member.role === 'admin' && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined {member.joinedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {member.role !== 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVoteToRemove(member)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Vote to Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Member */}
               

                {/* Active Votes */}
                {activeVotes.length > 0 && (
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium">Active Votes ({activeVotes.length})</h3>
                    <div className="space-y-3">
                      {activeVotes.map((vote) => (
                        <div key={vote.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  vote.type === 'add' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {vote.type === 'add' ? 'Add Member' : 'Remove Member'}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  vote.status === 'active' 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : vote.status === 'passed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {vote.status}
                                </span>
                              </div>
                              <p className="font-medium">
                                {vote.type === 'add' 
                                  ? `Add ${vote.targetName} (${vote.targetEmail})`
                                  : `Remove ${vote.targetMember?.name}`
                                }
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Created by {vote.createdBy} • {vote.createdAt.toLocaleDateString()}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  {vote.votesFor.length} for
                                </span>
                                <span className="flex items-center gap-1">
                                  <XCircle className="h-4 w-4 text-red-600" />
                                  {vote.votesAgainst.length} against
                                </span>
                                <span className="text-muted-foreground">
                                  ({vote.requiredVotes} needed to pass)
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {vote.status === 'active' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleVote(vote.id, true)}
                                className="flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Vote For
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVote(vote.id, false)}
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Vote Against
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                      Separate multiple email addresses with commas
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleInviteSubmit}
                    disabled={!inviteEmails.trim()}
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitations
                  </Button>
                </div>

                {/* Sent Invites Management */}
                {sentInvites.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Sent Invitations</h3>
                      <span className="text-sm text-muted-foreground">
                        {sentInvites.length} total
                      </span>
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {sentInvites.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{invite.email}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                invite.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : invite.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {invite.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Sent {invite.sentAt.toLocaleDateString()}
                            </p>
                          </div>
                          
                          {(invite.status === 'pending' || invite.status === 'invalid') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeInvite(invite.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                <Button variant="ghost" size="sm" onClick={() => setShowSettingsModal(false)}>
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
                      onChange={(e) => handleSettingsChange('name', e.target.value)}
                      placeholder="Enter group name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="group-description">Description</Label>
                    <Textarea
                      id="group-description"
                      value={settingsData.description}
                      onChange={(e) => handleSettingsChange('description', e.target.value)}
                      placeholder="Enter group description"
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <Button 
                    onClick={handleSaveSettings}
                    className="w-full"
                    disabled={!settingsData.name.trim()}
                  >
                    Save Changes
                  </Button>
                </div>

                {/* Dangerous Actions */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-medium text-red-600">Dangerous Actions</h3>
                  
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
                  This will create a vote to permanently close the group. All members will be able to vote on this decision. 
                  If the vote passes, the group and all its data will be permanently deleted.
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
                  Are you sure you want to leave this group? You will lose access to all group data and transactions. 
                  You can only rejoin if another member invites you back.
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
      </div>    </div>
    );
};

export default GroupManagement;

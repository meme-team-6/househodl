import { useParams } from "react-router-dom";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Plus, Settings, ArrowLeft, Receipt, UserPlus } from "lucide-react";
import { AvatarCircles } from "@/components/magicui/avatar-circles";
import { Link } from "react-router-dom";

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

function GroupManagement() {
  const { id } = useParams<{ id: string }>();

  const handleMobileMenuClick = () => {
    if (typeof window !== 'undefined' && window.openMobileSidebar) {
      window.openMobileSidebar();
    }
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

  const groupData: GroupData = {
    id: id || "1",
    name: id === "1" ? "NYC Hacker House" : id === "2" ? "Blockchain Maker Club" : "ETHGlobal NYC 2025",
    description: "Shared expenses for our group activities and events",
    availableAmount: 1230,
    pendingExpenses: 0,
    memberCount: 4,
    avatars: defaultAvatars
  };

  // Mock recent activity data
  const recentActivity: ActivityItem[] = [
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
      id: "3",
      type: "member_joined",
      title: "New member joined",
      description: "Mike Johnson joined the group",
      user: "Mike Johnson",
      timestamp: "2 days ago",
      icon: UserPlus
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
    },
    {
      id: "5",
      type: "expense",
      title: "Office supplies",
      description: "Approved in 3 days",
      amount: 75,
      user: "David Lee",
      timestamp: "1 week ago",
      icon: Receipt
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
              </div><div className="flex gap-3"> <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
              <Button variant="outline" >
                
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
              <Card>
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

        
          {/* Recent Activity */}
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest transactions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <a href={`/group/${id}/${activity.id}`} key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm">{activity.title}</h4>
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
      </div>
    </div>
  );
}

export default GroupManagement;

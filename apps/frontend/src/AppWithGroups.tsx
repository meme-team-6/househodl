
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button";
import { AvatarCircles } from "@/components/magicui/avatar-circles";
import FadeContent from "./components/ui/FadeContent";


// Extend Window interface to include our custom property
declare global {
  interface Window {
    openMobileSidebar?: () => void;
  }
}

interface GroupData {
  id: string;
  name: string;
  availableAmount: number;
  pendingExpenses: number;
  memberCount: number;
  avatars: Array<{
    imageUrl: string;
    profileUrl: string;
  }>;
}

function AppWithGroups() {
  const handleMobileMenuClick = () => {
    // Use the openMobileSidebar function exposed by the Sidebar component
    if (typeof window !== 'undefined' && window.openMobileSidebar) {
      window.openMobileSidebar();
    }
  };

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
    {
      imageUrl: "https://avatars.githubusercontent.com/u/59442788",
      profileUrl: "https://github.com/sanjay-mali",
    },
    {
      imageUrl: "https://avatars.githubusercontent.com/u/89768406",
      profileUrl: "https://github.com/itsarghyadas",
    },
  ];

  const groupsData: GroupData[] = [
    {
      id: "1",
      name: "Auckland Hacker House",
      availableAmount: 1230,
      pendingExpenses: 0,
      memberCount: 4,
      avatars: defaultAvatars
    },
    {
      id: "2", 
      name: "Blockchain Maker Club",
      availableAmount: 1230,
      pendingExpenses: 0,
      memberCount: 4,
      avatars: defaultAvatars
    },
    {
      id: "3",
      name: "ETHGlobal NYC 2025", 
      availableAmount: 1230,
      pendingExpenses: 0,
      memberCount: 4,
      avatars: defaultAvatars
    }
  ];
  
  return (
    <div className="flex h-screen overflow-hidden">
     
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          title=" Househodl" 
          onMobileMenuClick={handleMobileMenuClick}
        />
        <main className="flex-1 overflow-auto  border-x  w-full max-w-[1200px] mx-auto"><div className="flex justify-between items-center p-6 flex-wrap">
        <h1 className="text-4xl font-semibold tracking-tighter">Home</h1><a href="/group/create"><Button>Create Group</Button></a></div>
        <section className="grid grid-cols-2  border-t  border-b"><div className="p-6 border-r max-md:border-r-0 max-md:border-b"><h3>Available Balance</h3><FadeContent><p className="text-4xl font-semibold">$0</p></FadeContent></div><div className="p-6"><h3>Invested </h3><FadeContent><p className="text-4xl font-semibold">$0</p></FadeContent></div></section>
        <h2 className="text-2xl font-bold m-6 tracking-tight " >0 outstanding transactions</h2>
        <section className="grid grid-cols-3 gap-4 max-2xl:grid-cols-2 max-lg:grid-cols-1 max-md:grid-cols-1 m-6">
          {groupsData.map((group) => (
            <a key={group.id} className="border rounded-lg p-4 bg-background flex flex-col gap-2" href={`/group/${group.id}`}>
              <div>
                <h2 className="text-xl font-semibold text-[#00D57F] underline mb-2 tracking-tighter">
                  {group.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  ${group.availableAmount.toLocaleString()} available &nbsp;·&nbsp; {group.pendingExpenses} pending expenses
                </p>
              </div>
              <p></p>
              <AvatarCircles numPeople={group.memberCount} avatarUrls={group.avatars} />
            </a>
          ))}
        </section>



        </main>
      </div>
    </div>
  );
}

export default AppWithGroups;

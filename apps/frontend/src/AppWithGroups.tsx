import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import BlurText from "./components/BlurText";
import Orb from './components/Orb';
import { LineChart, DollarSign, ArrowUpRight, ArrowDownRight, Clock, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarCircles } from "@/components/magicui/avatar-circles";

import { useState } from "react";

// Extend Window interface to include our custom property
declare global {
  interface Window {
    openMobileSidebar?: () => void;
  }
}

function AppWithGroups() {
  const [activeTab, setActiveTab] = useState("overview");

  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };

  const handleMobileMenuClick = () => {
    // Use the openMobileSidebar function exposed by the Sidebar component
    if (typeof window !== 'undefined' && window.openMobileSidebar) {
      window.openMobileSidebar();
    }
  };

  const avatars = [
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
  
  return (
    <div className="flex h-screen overflow-hidden">
     
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          title=" Househodl" 
          onMobileMenuClick={handleMobileMenuClick}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/10">
        <h1 className="text-2xl font-bold mb-6" >Groups</h1>
        <section className="grid grid-cols-3 gap-4 max-2xl:grid-cols-2 max-lg:grid-cols-1 max-md:grid-cols-1">
          <div className="border rounded-lg p-4 bg-background flex flex-col gap-2"> <div><h2 className="text-xl font-semibold">ETHGlobal NYC 2025</h2><p className="text-sm text-muted-foreground">$1,230 - 0 outstanding expenses</p></div><p></p><AvatarCircles numPeople={4} avatarUrls={avatars} /></div>
          <div className="border rounded-lg p-4 bg-background flex flex-col gap-2"> <div><h2 className="text-xl font-semibold">ETHGlobal NYC 2025</h2><p className="text-sm text-muted-foreground">$1,230 - 0 outstanding expenses</p></div><p></p><AvatarCircles numPeople={4} avatarUrls={avatars} /></div>
          <div className="border rounded-lg p-4 bg-background flex flex-col gap-2"> <div><h2 className="text-xl font-semibold">ETHGlobal NYC 2025</h2><p className="text-sm text-muted-foreground">$1,230 - 0 outstanding expenses</p></div><p></p><AvatarCircles numPeople={4} avatarUrls={avatars} /></div>
        </section>



        </main>
      </div>
    </div>
  );
}

export default AppWithGroups;

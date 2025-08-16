import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import BlurText from "./components/BlurText";
import Orb from './components/Orb';
import { LineChart, DollarSign, ArrowUpRight, ArrowDownRight, Clock, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Extend Window interface to include our custom property
declare global {
  interface Window {
    openMobileSidebar?: () => void;
  }
}

function App() {
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


  return (
    <div className="flex h-screen overflow-hidden">
     
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          title=" AAAA" 
          onMobileMenuClick={handleMobileMenuClick}
        />
      
<main className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/10  w-full max-w-[1200px] mx-auto"><div className="flex justify-between items-center mb-4 flex-wrap">



<div className="flex justify-between items-center mb-4 flex-wrap w-full">
<h1 className="text-4xl font-semibold tracking-tighter">Home</h1><a href="/group/create"><Button>Create Group</Button></a></div>

  <div style={{ 
    position: 'absolute', 
    top: '50%', 
    left: '50%', 
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    textAlign: 'center'
  }}>

    <BlurText
      text="You have no groups"
      delay={150}
      animateBy="words"
      direction="top"
      onAnimationComplete={handleAnimationComplete}
      className="text-5xl font-semibold tracking-tight"
    />
<p className="mt-4 text-xl max-w-sm mx-auto font-light text-gray-400 tracking-tight text-center">
      Create a group to start managing shared expenses with your people</p>
  <Button className="mt-4 min-w-sm">Create Group</Button>
  </div>
</div>


      
        </main>
      </div>
    </div>
  );
}

export default App;

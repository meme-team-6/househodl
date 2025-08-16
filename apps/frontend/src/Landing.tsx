import { Link } from "react-router-dom";
import BlurText from "./components/BlurText";
import { Button } from "@/components/ui/button";
import ShaderBackground from "@/components/ShaderBackground";
import Galaxy from "./components/ui/Galaxy";

function Landing() {
  const handleAnimationComplete = () => {
    // no-op for now
  };

  return (
    <div className="relative min-h-screen text-foreground flex flex-col">
      {/* Fullscreen WebGL background */}
       {/* Top Nav */}
       <header className=" z-10 flex items-center justify-between px-6 py-4 sticky top-0">
        <Link to="/" className="text-lg font-semibold tracking-tight">
      <img src="/logo.svg" alt="Logo" className="h-5 w-auto" />
        </Link>
        <div className="space-x-3">
          <Link to="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link to="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>
      <div className="absolute inset-0 w-full h-screen border-b z-0 opacity-30 blur">
        <Galaxy 
     
          density={1.5}
          glowIntensity={0.5}
          saturation={0.8}
          hueShift={32}
        />
      </div>
      
     

      {/* Hero */}
      <main className="relative z-10 flex-1">
        <div className="relative mx-auto max-w-6xl px-6 py-8">
          <div className="relative ">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full items-center">
                 {/* Left side - iPhone mockup placeholder */}
                 <div className="flex justify-center col-span-2 ">
                <div className="relative">
                  {/* iPhone frame placeholder */}
                <img src="/hero-1.png" alt="iPhone" className="h-[70vh] w-full max-md:hidden" />
                </div>
              </div>
           
              
              {/* Right side - Hero text */}
              <div className="flex flex-col justify-center text-start col-span-3">
                <BlurText
                  text="Settle up in seconds."
                  delay={120}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                  className="text-4xl sm:text-6xl font-semibold tracking-tighter"
                />
                <p className="mt-4 max-w-xl text-gray-300">
                  Turn messy receipts and group chats into clear, trackable balances. Househodl helps you manage group finances automatically with crypto, earning you interest on your money in the background.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Link to="/home-filled">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">Sign in</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
    
        <section className="text-center mb-20 mt-12"><div className="flex justify-center gap-8 items-center"><p>Powered by </p><img className=" h-10" src="/product/eth.png"/> <img className=" h-10" src="/product/circle.png"/> <img className=" h-10" src="/product/dynamic.png"/>  <img className=" h-10" src="/product/layerzero.png"/> </div></section>

    

        {/* How It Works */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground">Get started with crypto-native expense sharing in three simple steps</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Create Your Group</h3>
                <p className="text-sm text-muted-foreground">Create an account and invite friends to join your expense-sharing group.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Pool & Earn</h3>
                <p className="text-sm text-muted-foreground">Deposit funds into your group. Funds automatically earn interest through DeFi protocols while waiting to be spent.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Vote & Split</h3>
                <p className="text-sm text-muted-foreground">Submit expenses for group approval. Househodl handles voting, splitting, and payments automatically.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Who It's For</h2>
              <p className="text-muted-foreground">Perfect for groups who want to manage shared expenses efficiently</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <h3 className="font-semibold mb-3">Hacker Houses</h3>
                <p className="text-sm text-muted-foreground">Split rent, utilities, and shared supplies among housemates. Earn yield on security deposits and common funds.</p>
              </div>
              
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <h3 className="font-semibold mb-3">Travel Groups</h3>
                <p className="text-sm text-muted-foreground">Manage trip expenses, accommodation costs, and activities. Pool funds in advance and earn interest while planning.</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <h3 className="font-semibold mb-3">Crypto Teams</h3>
                <p className="text-sm text-muted-foreground">Handle project expenses, tool subscriptions, and team activities. Native crypto payments with multi-chain support.</p>
              </div>
              
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <h3 className="font-semibold mb-3">Event Organizers</h3>
                <p className="text-sm text-muted-foreground">Coordinate hackathon expenses, conference costs, and team meals. Transparent voting on all group purchases.</p>
              </div>
              
              
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <h3 className="font-semibold mb-3">Student Clubs</h3>
                <p className="text-sm text-muted-foreground">Manage club events, competition fees, and social activities. Pool funds for tournaments, conferences, and team building.</p>
              </div>
              
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <h3 className="font-semibold mb-3">Small Businesses</h3>
                <p className="text-sm text-muted-foreground">Manage team expenses, office supplies, and client entertainment. Automated expense approval workflows.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What People Are Saying</h2>
              <p className="text-muted-foreground">Hear from groups already using HouseHodl</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <p className="text-sm text-muted-foreground mb-4">"HouseHodl transformed how our hacker house manages expenses. The yield earning feature means our security deposit is actually growing while we live here. Game changer!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">CH</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Connor Hare</p>
                    <p className="text-xs text-muted-foreground">Hacker House Resident</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <p className="text-sm text-muted-foreground mb-4">"Finally, a crypto-native solution for group expenses. The multi-chain support saved us so much on transaction fees during our European trip."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">RB</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Russell Bloxwich</p>
                    <p className="text-xs text-muted-foreground">Travel Group Organizer</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <p className="text-sm text-muted-foreground mb-4">"The transparent voting system eliminated all arguments about expenses. Everyone can see exactly how decisions are made and funds are allocated."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">JM</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Jasper Miller-Waugh</p>
                    <p className="text-xs text-muted-foreground">Event Organizer</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <p className="text-sm text-muted-foreground mb-4">"As a crypto team, we needed something that understood our workflow. HouseHodl's native Web3 integration is exactly what we were looking for."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">DD</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Danuka de Alwis</p>
                    <p className="text-xs text-muted-foreground">Crypto developer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 text-center text-xs text-muted-foreground border-t border-border/40">
        © {new Date().getFullYear()} HouseHodl. All rights reserved.
      </footer>
    </div>
  );
}

export default Landing;

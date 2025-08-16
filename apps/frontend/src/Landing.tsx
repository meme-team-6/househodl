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
          HouseHodl
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
                <img src="/hero-1.png" alt="iPhone" className="w-80" />
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
                  Turn messy receipts and group chats into clear, trackable balances. Finances are handled automatically with crypto, earning you interest on your money in the background.
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

        {/* Features */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-lg border border-border/40 bg-card p-6">
              <h3 className="font-medium mb-2">Split expenses</h3>
              <p className="text-sm text-muted-foreground">Create budgets and track monthly progress.</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-card p-6">
              <h3 className="font-medium mb-2">Insights</h3>
              <p className="text-sm text-muted-foreground">Visualize trends and discover opportunities.</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-card p-6">
              <h3 className="font-medium mb-2">Secure</h3>
              <p className="text-sm text-muted-foreground">Your data stays private with modern security.</p>
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

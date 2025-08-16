import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import FadeContent from "./components/ui/FadeContent";
import { useHodls } from "./hooks/useHodls";
import { Hodl } from "./Hodl";
import { Loader } from "lucide-react";

// Extend Window interface to include our custom property
declare global {
  interface Window {
    openMobileSidebar?: () => void;
  }
}

function AppWithGroups() {
  const { isLoading, hodls } = useHodls();
  const handleMobileMenuClick = () => {
    // Use the openMobileSidebar function exposed by the Sidebar component
    if (typeof window !== "undefined" && window.openMobileSidebar) {
      window.openMobileSidebar();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title=" Househodl" onMobileMenuClick={handleMobileMenuClick} />
        <main className="flex-1 overflow-auto  border-x  w-full max-w-[1200px] mx-auto">
          <div className="flex justify-between items-center p-6 flex-wrap">
            <h1 className="text-4xl font-semibold tracking-tighter">Home</h1>
            <a href="/group/create">
              <Button>Create Group</Button>
            </a>
          </div>
          <section className="grid grid-cols-2  border-t  border-b">
            <div className="p-6 border-r max-md:border-r-0 max-md:border-b">
              <h3>Available Balance</h3>
              <FadeContent>
                <p className="text-4xl font-semibold">$0</p>
              </FadeContent>
            </div>
            <div className="p-6">
              <h3>Invested </h3>
              <FadeContent>
                <p className="text-4xl font-semibold">$0</p>
              </FadeContent>
            </div>
          </section>
          <h2 className="text-2xl font-bold m-6 tracking-tight ">
            0 outstanding transactions
          </h2>

          <section className="grid grid-cols-3 gap-4 max-2xl:grid-cols-2 max-lg:grid-cols-1 max-md:grid-cols-1 m-6">
            {isLoading && <Loader />}
            {hodls.map((hodlId) => (
              <Hodl key={hodlId} hodlId={hodlId} />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}

export default AppWithGroups;

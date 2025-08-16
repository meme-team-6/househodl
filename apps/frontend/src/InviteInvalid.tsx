import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import LightRays from "./components/ui/LightRays";

export function InviteInvalid() {
  return (
    <>
      <div style={{ width: '100%', height: '100vh', position: 'absolute' }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#ff4444"
          raysSpeed={1.2}
          lightSpread={1.5}
          rayLength={3.8}
          followMouse={false}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
        <div className="w-full h-full absolute top-0 z-20">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              {/* Invalid invitation card */}
              <div className="bg-[#111]/20 rounded-2xl shadow-xl overflow-hidden border-gray-750 border">
                {/* Header with warning icon */}
                <div className="px-6 py-8 text-white text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2 text-red-400">Invalid Invitation</h1>
                  <p className="text-gray-300">This invitation link is not valid</p>
                </div>

                {/* Error details */}
                <div className="p-6 space-y-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-100 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-400 text-sm mb-4">
                      This invitation link may have expired, been revoked, or doesn't exist.
                    </p>
                  </div>

                  {/* Possible reasons */}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-red-400 mb-2">Possible reasons:</h3>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• The invitation has expired</li>
                      <li>• The link was typed incorrectly</li>
                      <li>• The group owner revoked the invitation</li>
                      <li>• You've already joined this group</li>
                    </ul>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3">
                    <Link to="/" className="block">
                      <Button className="w-full bg-[#00D57F] hover:bg-[#00D57F]/90">
                        <Home className="h-4 w-4 mr-2" />
                        Go to Home
                      </Button>
                    </Link>
                    
                  
                  </div>

                  <p className="text-xs text-center text-gray-500 mt-4">
                    If you believe this is an error, please contact the person who sent you this invitation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

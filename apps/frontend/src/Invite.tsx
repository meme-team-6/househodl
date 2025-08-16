import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserPlus, Wallet, Mail, User, CheckCircle, MapPin, Calendar, DollarSign, Ticket } from "lucide-react";
import LightRays from "./components/ui/LightRays";

// Mock data for the invitation
const mockInviteData = {
  id: "beach-house-2025",
  groupName: "ETHGlobal NYC 2025 ",
  inviterName: "Sarah Chen",
  inviterAvatar: "SC",
  memberCount: 5,
  description: "Split expenses for our upcoming ETHGlobal New York City Trip on the 15th-17th of August 2025",

  estimatedCost: "$320"
};

type Step = 'invitation' | 'auth' | 'details' | 'confirmation';

export function Invite() {
  const { id } = useParams();
  console.log("Invite ID:", id); // Use the id parameter
  const [step, setStep] = useState<Step>('invitation');
  const [authMethod, setAuthMethod] = useState<'wallet' | 'email' | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    walletAddress: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAcceptInvitation = () => {
    setStep('auth');
  };

  const handleAuthMethod = (method: 'wallet' | 'email') => {
    setAuthMethod(method);
    setStep('details');
  };

  const handleContinue = () => {
    if (authMethod === 'wallet' && formData.name) {
      setStep('confirmation');
    } else if (authMethod === 'email' && formData.name && formData.email) {
      setStep('confirmation');
    }
  };

  const handleJoinGroup = () => {
    console.log("Joining group with data:", formData, "Auth method:", authMethod);
    // Here you would make API call and redirect
  };

  const renderInvitationTicket = () => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Ticket-style invitation */}
        <div className="bg-[#111]/20  rounded-2xl shadow-xl overflow-hidden  border-gray-950">
          {/* Header with avatar */}
          <div className=" px-6 py-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
             <Ticket/>
            </div>
            <h1 className="text-2xl font-bold mb-2">You're Invited!</h1>
            <p className="text-blue-100">{mockInviteData.inviterName} invited you to join a group</p>
          </div>

          {/* Event details */}
          <div className="p-6 space-y-4">
            <div className="text-start">
              <h2 className="text-xl font-bold text-gray-100 mb-2">{mockInviteData.groupName}</h2>
              <p className="text-gray-400 text-sm">{mockInviteData.description}</p>
            </div>

            {/* Event info grid */}
            <div className="grid grid-cols-2 gap-4 py-4">
          
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-200">{mockInviteData.memberCount} people</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-gray-200">Your share is {mockInviteData.estimatedCost}</span>
              </div>
            </div>

            {/* Action button */}
            <Button onClick={handleAcceptInvitation} className="w-full bg-[#00D57F]">
              Accept Invitation
            </Button>

            <p className="text-xs text-center text-gray-500 mt-4">
              By accepting, you'll join the group and can start splitting expenses. This invitation was intended for russell@nevera.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuthSelection = () => (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Choose how to join</CardTitle>
            <CardDescription>Select your preferred sign-in method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => handleAuthMethod('wallet')} 
              variant="outline" 
              className="w-full h-16 flex items-center justify-start gap-3 text-left"
            >
              <Wallet className="h-6 w-6 text-blue-500" />
              <div>
                <div className="font-medium">Connect Wallet</div>
                <div className="text-sm text-muted-foreground">Use your crypto wallet</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => handleAuthMethod('email')} 
              variant="outline" 
              className="w-full h-16 flex items-center justify-start gap-3 text-left"
            >
              <Mail className="h-6 w-6 text-green-500" />
              <div>
                <div className="font-medium">Sign up with Email</div>
                <div className="text-sm text-muted-foreground">Create account with email</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle>Your Information</CardTitle>
            <CardDescription>
              {authMethod === 'wallet' ? 'Connect your wallet and tell us your name' : 'Create your account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authMethod === 'wallet' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Wallet className="h-4 w-4" />
                  <span className="font-medium">Wallet Connection</span>
                </div>
                <p className="text-sm text-blue-600">Connect your wallet to continue</p>
                <Button variant="outline" size="sm" className="mt-2 border-blue-300 text-blue-700">
                  Connect Wallet
                </Button>
              </div>
            )}

            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            {authMethod === 'email' && (
              <>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </>
            )}

            <Button 
              onClick={handleContinue}
              className="w-full"
              disabled={
                (authMethod === 'wallet' && !formData.name) ||
                (authMethod === 'email' && (!formData.name || !formData.email))
              }
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <CardTitle>Ready to Join!</CardTitle>
            <CardDescription>Review your information and join the group</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Group summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">{mockInviteData.groupName}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
            
                <div>👥 {mockInviteData.memberCount} members</div>
              </div>
            </div>

            {/* User info summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="text-sm font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Method:</span>
                <span className="text-sm font-medium capitalize">{authMethod}</span>
              </div>
              {authMethod === 'email' && formData.email && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm font-medium">{formData.email}</span>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3">
              By joining this group, you agree to split expenses fairly and settle balances promptly. 
              All transactions will be recorded and visible to group members.
            </div>

            <Button onClick={handleJoinGroup} className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Join {mockInviteData.groupName}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <><div style={{ width: '100%', height: '100vh', position: 'absolute' }}>
    <LightRays
      raysOrigin="top-center"
      raysColor="#00ffff"
      raysSpeed={1.5}
      lightSpread={1.8}
      rayLength={4.2}
      followMouse={false}
      mouseInfluence={0.1}
      noiseAmount={0.1}
      distortion={0.05}
      className="custom-rays"
    />
    <div className="w-full h-full absolute top-0 z-20">

      {step === 'invitation' && renderInvitationTicket()}
      {step === 'auth' && renderAuthSelection()}
      {step === 'details' && renderDetailsForm()}
      {step === 'confirmation' && renderConfirmation()}  </div></div>
    </>
  );
}

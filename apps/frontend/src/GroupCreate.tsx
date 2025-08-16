import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { X, Plus, Users, DollarSign, CheckCircle, ArrowLeft, ArrowRight, CreditCard, Wallet } from "lucide-react";

interface GroupDetails {
  name: string;
  description: string;
  spendingLimit: string;
}

interface Invite {
  id: string;
  email: string;
}

interface GroupData {
  details: GroupDetails;
  invites: Invite[];
}

interface PaymentMethod {
  id: 'credit-card' | 'coinbase';
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CreditCardData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

function GroupCreate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [groupData, setGroupData] = useState<GroupData>({
    details: {
      name: "",
      description: "",
      spendingLimit: ""
    },
    invites: []
  });
  
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    spendingLimit?: string;
    invites?: string;
    payment?: string;
  }>({});
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'credit-card' | 'coinbase' | null>(null);
  const [creditCardData, setCreditCardData] = useState<CreditCardData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  
  const [newInviteEmail, setNewInviteEmail] = useState("");
  
  const paymentMethods: PaymentMethod[] = [
    { id: 'credit-card', name: 'Credit Card', icon: CreditCard },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: Wallet }
  ];
  
  // Calculate payment amount per person
  const totalMembers = groupData.invites.length + 1; // +1 for current user
  const paymentPerPerson = groupData.details.spendingLimit ? 
    (parseFloat(groupData.details.spendingLimit) / totalMembers).toFixed(2) : '0.00';

  // Step 1: Group Details
  function handleDetailsChange(field: keyof GroupDetails, value: string) {
    setGroupData(prev => ({
      ...prev,
      details: { ...prev.details, [field]: value }
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }

  function validateStep1(): boolean {
    const newErrors: typeof errors = {};
    
    if (!groupData.details.name.trim()) {
      newErrors.name = "Group name is required";
    } else if (groupData.details.name.trim().length < 3) {
      newErrors.name = "Group name must be at least 3 characters";
    }
    
    if (!groupData.details.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!groupData.details.spendingLimit.trim()) {
      newErrors.spendingLimit = "Spending limit is required";
    } else if (isNaN(Number(groupData.details.spendingLimit)) || Number(groupData.details.spendingLimit) <= 0) {
      newErrors.spendingLimit = "Please enter a valid amount";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Step 2: Invites
  function addInvite() {
    if (!newInviteEmail.trim()) return;
    
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(newInviteEmail)) {
      setErrors({ invites: "Please enter a valid email address" });
      return;
    }
    
    if (groupData.invites.some(invite => invite.email === newInviteEmail)) {
      setErrors({ invites: "This email has already been invited" });
      return;
    }
    
    const newInvite: Invite = {
      id: Date.now().toString(),
      email: newInviteEmail
    };
    
    setGroupData(prev => ({
      ...prev,
      invites: [...prev.invites, newInvite]
    }));
    
    setNewInviteEmail("");
    setErrors(prev => ({ ...prev, invites: undefined }));
  }

  function removeInvite(id: string) {
    setGroupData(prev => ({
      ...prev,
      invites: prev.invites.filter(invite => invite.id !== id)
    }));
  }

  function handleInviteKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addInvite();
    }
  }

  // Navigation
  function goToNextStep() {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep < 3) {
      setCurrentStep(prev => (prev + 1) as 1 | 2 | 3);
    }
  }

  function goToPreviousStep() {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as 1 | 2 | 3);
    }
  }

  // Payment method handlers
  function handleCreditCardChange(field: keyof CreditCardData, value: string) {
    setCreditCardData(prev => ({ ...prev, [field]: value }));
  }
  
  function validatePayment(): boolean {
    if (!selectedPaymentMethod) {
      setErrors({ payment: 'Please select a payment method' });
      return false;
    }
    
    if (selectedPaymentMethod === 'credit-card') {
      const { cardNumber, expiryDate, cvv, name } = creditCardData;
      if (!cardNumber || !expiryDate || !cvv || !name) {
        setErrors({ payment: 'Please fill in all credit card details' });
        return false;
      }
    }
    
    return true;
  }
  
  // Final submission with payment
  async function processPayment() {
    if (!validatePayment()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Navigate to success page or dashboard
      navigate("/home");
    } catch (error) {
      console.error("Payment failed:", error);
      setErrors({ payment: 'Payment failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  const steps = [
    { number: 1, title: "Group Details", icon: DollarSign },
    { number: 2, title: "Invite People", icon: Users },
    { number: 3, title: "Pay Your Share", icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/home")}
            className="mb-4 p-0 h-auto font-normal"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Create New Group</h1>
          <p className="text-muted-foreground mt-2">
            Set up a new group to manage shared expenses
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : isActive 
                    ? "border-primary text-primary" 
                    : "border-muted-foreground text-muted-foreground"
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-4 ${
                    isCompleted ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card className="border-none shadow-lg">
          {/* Step 1: Group Details */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Group Details
                </CardTitle>
                <CardDescription>
                  Tell us about your group and set a spending limit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Group Name *</Label>
                  <Input
                    id="groupName"
                    placeholder="e.g., Weekend Trip, Roommate Expenses"
                    value={groupData.details.name}
                    onChange={(e) => handleDetailsChange("name", e.target.value)}
                    isError={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    placeholder="Describe what this group is for..."
                    value={groupData.details.description}
                    onChange={(e) => handleDetailsChange("description", e.target.value)}
                    className={`flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                      errors.description ? "border-destructive" : "border-input bg-background"
                    }`}
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spendingLimit">Total Amount Needed*</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="spendingLimit"
                      type="number"
                      placeholder="1000"
                      value={groupData.details.spendingLimit}
                      onChange={(e) => handleDetailsChange("spendingLimit", e.target.value)}
                      className="pl-8"
                      isError={!!errors.spendingLimit}
                    />
                  </div>
                  {errors.spendingLimit && (
                    <p className="text-sm text-destructive">{errors.spendingLimit}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Total amount needed for this group expense
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Invite People */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Invite People
                </CardTitle>
                <CardDescription>
                  Add people to your group by email (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder="friend@example.com"
                      value={newInviteEmail}
                      onChange={(e) => setNewInviteEmail(e.target.value)}
                      onKeyPress={handleInviteKeyPress}
                      isError={!!errors.invites}
                    />
                    <Button onClick={addInvite} size="sm" className="gap-2">
                      <Plus className="h-4 w-4" /> Invite
                    </Button>
                  </div>
                  {errors.invites && (
                    <p className="text-sm text-destructive">{errors.invites}</p>
                  )}
                </div>

                {groupData.invites.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Invited People ({groupData.invites.length})</div>
                    <div className="space-y-2">
                      {groupData.invites.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="text-sm">{invite.email}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInvite(invite.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tip:</strong> You can always invite more people later from the group settings.
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pay Your Share
                </CardTitle>
                <CardDescription>
                  Complete payment to create the group
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Group Summary */}
                <div className="p-4 bg-muted/20 rounded-lg border">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Group Summary
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Group Name:</span>
                      <p className="font-medium">{groupData.details.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Description:</span>
                      <p className="text-sm">{groupData.details.description}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Total Amount:</span>
                      <p className="font-semibold">${groupData.details.spendingLimit}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Members ({totalMembers}):</span>
                      <div className="mt-1">
                        <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs mr-2">
                          You
                        </span>
                        {groupData.invites.map((invite) => (
                          <span key={invite.id} className="inline-block bg-muted px-2 py-1 rounded text-xs mr-2 mb-1">
                            {invite.email}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Total Amount:</span>
                    <span className="text-lg font-bold">${groupData.details.spendingLimit}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Split between {totalMembers} {totalMembers === 1 ? 'person' : 'people'}:</span>
                    <span className="text-sm text-muted-foreground">{totalMembers === 1 ? 'Just you' : `You + ${groupData.invites.length} others`}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Your Share:</span>
                      <span className="text-xl font-bold text-primary">${paymentPerPerson}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Choose Payment Method</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`p-4 border-2 rounded-lg transition-all hover:border-primary/50 ${
                            selectedPaymentMethod === method.id
                              ? 'border-primary bg-primary/5'
                              : 'border-muted hover:border-muted-foreground/30'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="h-6 w-6" />
                            <span className="font-medium">{method.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Credit Card Form */}
                {selectedPaymentMethod === 'credit-card' && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Credit Card Details
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={creditCardData.name}
                          onChange={(e) => handleCreditCardChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={creditCardData.cardNumber}
                          onChange={(e) => handleCreditCardChange('cardNumber', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={creditCardData.expiryDate}
                            onChange={(e) => handleCreditCardChange('expiryDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={creditCardData.cvv}
                            onChange={(e) => handleCreditCardChange('cvv', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Coinbase Wallet */}
                {selectedPaymentMethod === 'coinbase' && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Coinbase Wallet
                    </h4>
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">
                        You'll be redirected to Coinbase to complete your payment of <strong>${paymentPerPerson}</strong>
                      </p>
                      <div className="bg-muted/50 p-3 rounded text-xs text-muted-foreground">
                        💡 Make sure you have sufficient funds in your Coinbase wallet
                      </div>
                    </div>
                  </div>
                )}

                {errors.payment && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {errors.payment}
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Footer with Navigation */}
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button onClick={goToNextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={processPayment} disabled={isLoading || !selectedPaymentMethod}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  `Pay $${paymentPerPerson}`
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default GroupCreate;

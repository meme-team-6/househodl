import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { DollarSign, ArrowLeft } from "lucide-react";
import { useCreateHodl } from "./hooks/useCreateHodl";

interface GroupDetails {
  name: string;
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

function GroupCreate() {
  const { createHodl } = useCreateHodl();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [groupData, setGroupData] = useState<GroupData>({
    details: {
      name: "",
      spendingLimit: "",
    },
    invites: [],
  });

  const [errors, setErrors] = useState<{
    name?: string;
    spendingLimit?: string;
    invites?: string;
    payment?: string;
  }>({});

  // Step 1: Group Details
  function handleDetailsChange(field: keyof GroupDetails, value: string) {
    setGroupData((prev) => ({
      ...prev,
      details: { ...prev.details, [field]: value },
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validateStep1(): boolean {
    const newErrors: typeof errors = {};

    if (!groupData.details.name.trim()) {
      newErrors.name = "Group name is required";
    } else if (groupData.details.name.trim().length < 3) {
      newErrors.name = "Group name must be at least 3 characters";
    }

    if (!groupData.details.spendingLimit.trim()) {
      newErrors.spendingLimit = "Spending limit is required";
    } else if (
      isNaN(Number(groupData.details.spendingLimit)) ||
      Number(groupData.details.spendingLimit) <= 0
    ) {
      newErrors.spendingLimit = "Please enter a valid amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Navigation
  function goToNextStep() {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      createHodl({
        name: groupData.details.name,
        maximumSpend: Number(groupData.details.spendingLimit),
      }).then(() => {
        navigate("/home");
      });
    }
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  }

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

        {/* Step Content */}
        <Card className="border-none shadow-lg">
          {/* Step 1: Group Details */}

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
              <Label htmlFor="spendingLimit">Total Amount Needed*</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="spendingLimit"
                  type="number"
                  placeholder="1000"
                  value={groupData.details.spendingLimit}
                  onChange={(e) =>
                    handleDetailsChange("spendingLimit", e.target.value)
                  }
                  className="pl-8"
                  isError={!!errors.spendingLimit}
                />
              </div>
              {errors.spendingLimit && (
                <p className="text-sm text-destructive">
                  {errors.spendingLimit}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Total amount this group can expense
              </p>
            </div>
          </CardContent>

          {/* Footer with Navigation */}
          <CardFooter className="flex justify-end">
            <Button onClick={goToNextStep}>Create</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default GroupCreate;

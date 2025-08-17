import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { useHodl } from "./hooks/useHodl";
import { Voter, VoteState } from "./components/Voter";

export const VotingStatus = ({
  hodlId,
  approvedVotes,
  disapprovalVotes,
}: {
  hodlId: string;
  approvedVotes: number;
  disapprovalVotes: number;
}) => {
  const { isLoading, hodl } = useHodl(hodlId);

  if (isLoading) {
    return (
      <Card>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Voting Status
        </CardTitle>
        <CardDescription>
          {disapprovalVotes} of {hodl?.members.length} votes required
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Vote Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">
                {approvedVotes}
              </div>
              <div className="text-sm text-green-600">Approve</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50">
              <div className="text-2xl font-bold text-red-600">
                {disapprovalVotes}
              </div>
              <div className="text-sm text-red-600">Reject</div>
            </div>
          </div>

          {/* Individual Votes */}
          <div className="space-y-3">
            <h4 className="font-medium">Member Votes</h4>
            {hodl?.members.map((member, index) => (
              <Voter
                key={index}
                voterAddress={member.address}
                vote={VoteState.Pending}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

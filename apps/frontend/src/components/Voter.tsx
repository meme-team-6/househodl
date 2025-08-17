import { useReverseEns } from "@/hooks/useEns";
import { CheckCircle, Clock, XCircle } from "lucide-react";

const avatar = "https://avatars.githubusercontent.com/u/23006558";

const getVoteIcon = (vote: VoteState) => {
  if (vote === VoteState.Approve)
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  if (vote === VoteState.Reject)
    return <XCircle className="h-4 w-4 text-red-600" />;
  return <Clock className="h-4 w-4 text-gray-400" />;
};

const getVoteText = (vote: VoteState) => {
  if (vote === VoteState.Approve) return "Approve";
  if (vote === VoteState.Reject) return "Reject";
  return "Pending";
};

export enum VoteState {
  Pending,
  Approve,
  Reject,
}

export const Voter = ({
  voterAddress,
  vote,
}: {
  voterAddress: string;
  vote: VoteState;
}) => {
  const { ensName: memberName, ensAvatar: memberAvatar } =
    useReverseEns(voterAddress);
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-3">
        <img
          src={memberAvatar || avatar}
          alt="avatar"
          className="w-8 h-8 rounded-full"
        />
        <span className="font-medium">{memberName}</span>
      </div>
      <div className="flex items-center gap-2">
        {getVoteIcon(vote)}
        <span className="text-sm text-muted-foreground">
          {getVoteText(vote)}
        </span>
      </div>
    </div>
  );
};

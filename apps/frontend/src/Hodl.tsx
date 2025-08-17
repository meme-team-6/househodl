import { Link } from "react-router";
import { AvatarCircles } from "./components/magicui/avatar-circles";
import { useHodl } from "./hooks/useHodl";
import { useHodlPendingTransactions } from "./hooks/useHodlPendingTransactions";
import { useMemo } from "react";
const defaultAvatars = [
  {
    imageUrl: "https://avatars.githubusercontent.com/u/23006558",
    profileUrl: "https://github.com/RussellBloxwich",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/20110627",
    profileUrl: "https://github.com/tomonarifeehan",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/106103625",
    profileUrl: "https://github.com/BankkRoll",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/59228569",
    profileUrl: "https://github.com/safethecode",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/59442788",
    profileUrl: "https://github.com/sanjay-mali",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/89768406",
    profileUrl: "https://github.com/itsarghyadas",
  },
];
export const Hodl = ({ hodlId }: { hodlId: string }) => {
  const { hodl } = useHodl(hodlId);
  const { transactions } = useHodlPendingTransactions(hodlId);

  const pendingExpenses = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => acc + (transaction?.amountUsd || 0),
      0
    );
  }, [transactions]);

  return (
    <Link
      key={hodlId}
      className="border rounded-lg p-4 bg-background flex flex-col gap-2"
      to={`/group/${hodlId}`}
    >
      <div>
        <h2 className="text-xl font-semibold text-[#00D57F] underline mb-2 tracking-tighter">
          {hodl?.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          ${((hodl?.spendLimit || 0) - pendingExpenses).toLocaleString()}{" "}
          available &nbsp;·&nbsp; ${pendingExpenses} pending expenses
        </p>
      </div>
      <p></p>
      <AvatarCircles
        numPeople={hodl?.members.length}
        avatarUrls={defaultAvatars}
      />
    </Link>
  );
};

export type Hodl = {
  name: string;
  spendLimit: number;
  pendingExpenses: number; // to come from transactions?
  members: {
    chain: string;
    address: string;
    debt: number;
    usdcBalance: number;
  }[];
};

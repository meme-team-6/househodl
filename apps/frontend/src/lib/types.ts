export type Hodl = {
  name: string;
  spendLimit: number;
  members: {
    chain: string;
    address: string;
    debt: number;
    usdcBalance: number;
  }[];
};

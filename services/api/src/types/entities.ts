export type User = {
  userId: string;
  email: string;
  passwordHash: string;
};

export type PublicUser = {
  userId: string;
  email: string;
};

export type AuthUser = {
  id: string;
  email: string;
  createdAt: string;
};

export type AuthPayload = {
  user: AuthUser;
};

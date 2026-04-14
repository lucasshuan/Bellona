export type AuthenticatedUser = {
  id: string;
  username: string;
  isAdmin: boolean;
  permissions: string[];
};

export type GraphqlRequestContext = {
  req: {
    user?: AuthenticatedUser;
  };
};

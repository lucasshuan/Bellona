import { type Game, type Ranking as RankingModel } from "@ares/db";

export type GroupedRankingEntry = {
  id: string;
  playerId: string;
  userId: string | null;
  country: string | null;
  currentElo: number;
  primaryUsernameId: string | null;
  usernames: Array<{
    id: string;
    username: string;
  }>;
  fallbackName: string;
  updatedAt: Date | null;
};

export type PublicGame = Pick<
  Game,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "thumbnailImageUrl"
  | "backgroundImageUrl"
  | "steamUrl"
  | "status"
  | "authorId"
  | "createdAt"
  | "updatedAt"
> & {
  rankingCount: number;
  playerCount: number;
  tourneyCount: number;
  postCount: number;
};

export type GameAuthor = {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
};

export type PublicRankingEntry = {
  id: string;
  playerId: string;
  userId: string | null;
  country: string | null;
  currentElo: number;
  position: number;
  displayName: string;
  usernames: string[];
};

export type PublicRanking = {
  id: string;
  name: string;
  slug: string;
  entries: PublicRankingEntry[];
};

export type PublicGamesState = {
  games: PublicGame[];
  isDatabaseUnavailable: boolean;
};

export type GamePageData =
  | {
      game: PublicGame;
      author: GameAuthor | null;
      rankings: PublicRanking[];
      isDatabaseUnavailable: false;
    }
  | {
      game: null;
      author: null;
      rankings: [];
      isDatabaseUnavailable: true;
    }
  | null;

export type FullRankingData = {
  ranking: RankingModel;
  game: Game;
  entries: PublicRankingEntry[];
};

export type PublicGamesOptions = {
  limit?: number;
  search?: string;
  orderBy?: "name" | "popular";
  viewerId?: string;
  canManageGames?: boolean;
};

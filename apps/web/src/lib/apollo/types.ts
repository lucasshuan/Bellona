export interface User {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  bio: string | null;
  profileColor: string | null;
  country: string | null;
  isAdmin: boolean;
  createdAt: string;
  players?: Player[];
}

export type GameStatus = "APPROVED" | "PENDING" | "approved" | "pending";

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnailImageUrl: string | null;
  backgroundImageUrl: string | null;
  steamUrl: string | null;
  status: GameStatus;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
  author?: User;
  rankings?: Ranking[];
  _count?: {
    events: number;
    players: number;
    tourneys?: number;
    posts?: number;
  };
}

export interface Ranking {
  id: string;
  gameId: string;
  name: string;
  slug: string;
  description: string | null;
  initialElo: number;
  ratingSystem: string;
  allowDraw: boolean;
  kFactor: number;
  scoreRelevance: number;
  inactivityDecay: number;
  inactivityThresholdHours: number;
  inactivityDecayFloor: number;
  pointsPerWin: number;
  pointsPerDraw: number;
  pointsPerLoss: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  game: Game;
  entries: RankingEntry[];
}

export interface PlayerUsername {
  id: string;
  username: string;
}

export interface Player {
  id: string;
  gameId: string;
  userId?: string | null;
  currentElo: number;
  user?: User;
  game?: Game;
  rankingEntries?: RankingEntry[];
  usernames?: PlayerUsername[];
}

export interface RankingEntry {
  id: string;
  rankingId: string;
  playerId: string;
  currentElo: number;
  position: number;
  player?: Player;
  ranking?: Ranking;
}
export interface Paginated<T> {
  nodes: T[];
  totalCount: number;
  hasNextPage: boolean;
}

export interface PaginationInput {
  skip?: number;
  take?: number;
}

export type PaginatedGames = Paginated<Game>;
export type PaginatedUsers = Paginated<User>;
export type PaginatedRankings = Paginated<Ranking>;

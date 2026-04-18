/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation RequestUploadUrl($filename: String!, $contentType: String!) {\n    requestUploadUrl(filename: $filename, contentType: $contentType) {\n      uploadUrl\n      finalUrl\n    }\n  }\n": typeof types.RequestUploadUrlDocument,
    "\n  mutation CreateGame($input: CreateGameInput!) {\n    createGame(input: $input) {\n      id\n      name\n      slug\n      status\n    }\n  }\n": typeof types.CreateGameDocument,
    "\n  mutation UpdateGame($id: ID!, $input: UpdateGameInput!) {\n    updateGame(id: $id, input: $input) {\n      id\n      name\n      slug\n    }\n  }\n": typeof types.UpdateGameDocument,
    "\n  mutation ApproveGame($id: ID!) {\n    approveGame(id: $id) {\n      id\n      status\n    }\n  }\n": typeof types.ApproveGameDocument,
    "\n  query GetGames($pagination: PaginationInput, $search: String) {\n    games(pagination: $pagination, search: $search) {\n      nodes {\n        id\n        name\n        slug\n        description\n        thumbnailImageUrl\n        backgroundImageUrl\n        steamUrl\n        status\n        createdAt\n        updatedAt\n        _count {\n          leagues\n          players\n        }\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n": typeof types.GetGamesDocument,
    "\n  query GetGame($slug: String!) {\n    game(slug: $slug) {\n      id\n      name\n      slug\n      description\n      thumbnailImageUrl\n      backgroundImageUrl\n      steamUrl\n      status\n      authorId\n      createdAt\n      updatedAt\n      author {\n        id\n        name\n        username\n        imageUrl\n      }\n      leagues {\n        id\n        name\n        slug\n        description\n        initialElo\n        ratingSystem\n        isApproved\n        startDate\n        endDate\n        createdAt\n        entries {\n          id\n          currentElo\n          position\n          player {\n            id\n            user {\n              id\n              name\n              username\n              country\n            }\n          }\n        }\n      }\n      _count {\n        leagues\n        players\n      }\n    }\n  }\n": typeof types.GetGameDocument,
    "\n  query GetGamesSimple($pagination: PaginationInput, $search: String) {\n    games(pagination: $pagination, search: $search) {\n      nodes {\n        id\n        name\n        slug\n        description\n        thumbnailImageUrl\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n": typeof types.GetGamesSimpleDocument,
    "\n  mutation CreateLeague($input: CreateLeagueInput!) {\n    createLeague(input: $input) {\n      id\n      name\n      slug\n    }\n  }\n": typeof types.CreateLeagueDocument,
    "\n  mutation AddPlayerToLeague($leagueId: ID!, $playerId: ID!, $initialElo: Int) {\n    addPlayerToLeague(\n      leagueId: $leagueId\n      playerId: $playerId\n      initialElo: $initialElo\n    ) {\n      id\n      currentElo\n    }\n  }\n": typeof types.AddPlayerToLeagueDocument,
    "\n  mutation RegisterSelfToLeague($leagueId: ID!) {\n    registerSelfToLeague(leagueId: $leagueId) {\n      id\n    }\n  }\n": typeof types.RegisterSelfToLeagueDocument,
    "\n  mutation UpdateLeague($id: ID!, $input: UpdateLeagueInput!) {\n    updateLeague(id: $id, input: $input) {\n      id\n      name\n      slug\n    }\n  }\n": typeof types.UpdateLeagueDocument,
    "\n  query GetLeagues($pagination: PaginationInput) {\n    leagues(pagination: $pagination) {\n      nodes {\n        id\n        name\n        slug\n        description\n        type\n        ratingSystem\n        isApproved\n        createdAt\n        game {\n          id\n          name\n          slug\n          thumbnailImageUrl\n        }\n        entries {\n          id\n          currentElo\n          position\n          player {\n            id\n            user {\n              id\n              name\n              username\n              country\n            }\n          }\n        }\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n": typeof types.GetLeaguesDocument,
    "\n  query GetLeague($gameSlug: String!, $leagueSlug: String!) {\n    league(gameSlug: $gameSlug, slug: $leagueSlug) {\n      id\n      name\n      slug\n      description\n      initialElo\n      ratingSystem\n      type\n      allowDraw\n      kFactor\n      scoreRelevance\n      inactivityDecay\n      inactivityThresholdHours\n      inactivityDecayFloor\n      pointsPerWin\n      pointsPerDraw\n      gameId\n      isApproved\n      pointsPerLoss\n      allowedFormats\n      createdAt\n      updatedAt\n      game {\n        id\n        name\n        slug\n        thumbnailImageUrl\n        status\n      }\n      entries {\n        id\n        leagueId\n        playerId\n        currentElo\n        position\n        player {\n          id\n          userId\n          user {\n            id\n            name\n            username\n            imageUrl\n            country\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetLeagueDocument,
    "\n  mutation AddPlayerToGame($input: AddPlayerToGameInput!) {\n    addPlayerToGame(input: $input) {\n      id\n    }\n  }\n": typeof types.AddPlayerToGameDocument,
    "\n  query SearchPlayers($gameId: ID!, $query: String!) {\n    searchPlayers(gameId: $gameId, query: $query) {\n      nodes {\n        id\n        username\n        player {\n          id\n          user {\n            id\n            country\n          }\n        }\n      }\n    }\n  }\n": typeof types.SearchPlayersDocument,
    "\n  query GetPlayer($id: ID!) {\n    player(id: $id) {\n      id\n      currentElo\n      user {\n        name\n        username\n        imageUrl\n        country\n        createdAt\n      }\n      usernames {\n        id\n        username\n      }\n    }\n  }\n": typeof types.GetPlayerDocument,
    "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      username\n      name\n      imageUrl\n    }\n  }\n": typeof types.UpdateProfileDocument,
    "\n  query GetUser($username: String!) {\n    user(username: $username) {\n      id\n      name\n      username\n      imageUrl\n      bio\n      profileColor\n      isAdmin\n      createdAt\n      players {\n        id\n        game {\n          id\n          name\n          slug\n          backgroundImageUrl\n        }\n        leagueEntries {\n          id\n          currentElo\n          position\n          league {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetUserDocument,
    "\n  query SearchUsers($pagination: PaginationInput, $query: String) {\n    searchUsers(pagination: $pagination, query: $query) {\n      nodes {\n        id\n        name\n        username\n        imageUrl\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n": typeof types.SearchUsersDocument,
};
const documents: Documents = {
    "\n  mutation RequestUploadUrl($filename: String!, $contentType: String!) {\n    requestUploadUrl(filename: $filename, contentType: $contentType) {\n      uploadUrl\n      finalUrl\n    }\n  }\n": types.RequestUploadUrlDocument,
    "\n  mutation CreateGame($input: CreateGameInput!) {\n    createGame(input: $input) {\n      id\n      name\n      slug\n      status\n    }\n  }\n": types.CreateGameDocument,
    "\n  mutation UpdateGame($id: ID!, $input: UpdateGameInput!) {\n    updateGame(id: $id, input: $input) {\n      id\n      name\n      slug\n    }\n  }\n": types.UpdateGameDocument,
    "\n  mutation ApproveGame($id: ID!) {\n    approveGame(id: $id) {\n      id\n      status\n    }\n  }\n": types.ApproveGameDocument,
    "\n  query GetGames($pagination: PaginationInput, $search: String) {\n    games(pagination: $pagination, search: $search) {\n      nodes {\n        id\n        name\n        slug\n        description\n        thumbnailImageUrl\n        backgroundImageUrl\n        steamUrl\n        status\n        createdAt\n        updatedAt\n        _count {\n          leagues\n          players\n        }\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n": types.GetGamesDocument,
    "\n  query GetGame($slug: String!) {\n    game(slug: $slug) {\n      id\n      name\n      slug\n      description\n      thumbnailImageUrl\n      backgroundImageUrl\n      steamUrl\n      status\n      authorId\n      createdAt\n      updatedAt\n      author {\n        id\n        name\n        username\n        imageUrl\n      }\n      leagues {\n        id\n        name\n        slug\n        description\n        initialElo\n        ratingSystem\n        isApproved\n        startDate\n        endDate\n        createdAt\n        entries {\n          id\n          currentElo\n          position\n          player {\n            id\n            user {\n              id\n              name\n              username\n              country\n            }\n          }\n        }\n      }\n      _count {\n        leagues\n        players\n      }\n    }\n  }\n": types.GetGameDocument,
    "\n  query GetGamesSimple($pagination: PaginationInput, $search: String) {\n    games(pagination: $pagination, search: $search) {\n      nodes {\n        id\n        name\n        slug\n        description\n        thumbnailImageUrl\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n": types.GetGamesSimpleDocument,
    "\n  mutation CreateLeague($input: CreateLeagueInput!) {\n    createLeague(input: $input) {\n      id\n      name\n      slug\n    }\n  }\n": types.CreateLeagueDocument,
    "\n  mutation AddPlayerToLeague($leagueId: ID!, $playerId: ID!, $initialElo: Int) {\n    addPlayerToLeague(\n      leagueId: $leagueId\n      playerId: $playerId\n      initialElo: $initialElo\n    ) {\n      id\n      currentElo\n    }\n  }\n": types.AddPlayerToLeagueDocument,
    "\n  mutation RegisterSelfToLeague($leagueId: ID!) {\n    registerSelfToLeague(leagueId: $leagueId) {\n      id\n    }\n  }\n": types.RegisterSelfToLeagueDocument,
    "\n  mutation UpdateLeague($id: ID!, $input: UpdateLeagueInput!) {\n    updateLeague(id: $id, input: $input) {\n      id\n      name\n      slug\n    }\n  }\n": types.UpdateLeagueDocument,
    "\n  query GetLeagues($pagination: PaginationInput) {\n    leagues(pagination: $pagination) {\n      nodes {\n        id\n        name\n        slug\n        description\n        type\n        ratingSystem\n        isApproved\n        createdAt\n        game {\n          id\n          name\n          slug\n          thumbnailImageUrl\n        }\n        entries {\n          id\n          currentElo\n          position\n          player {\n            id\n            user {\n              id\n              name\n              username\n              country\n            }\n          }\n        }\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n": types.GetLeaguesDocument,
    "\n  query GetLeague($gameSlug: String!, $leagueSlug: String!) {\n    league(gameSlug: $gameSlug, slug: $leagueSlug) {\n      id\n      name\n      slug\n      description\n      initialElo\n      ratingSystem\n      type\n      allowDraw\n      kFactor\n      scoreRelevance\n      inactivityDecay\n      inactivityThresholdHours\n      inactivityDecayFloor\n      pointsPerWin\n      pointsPerDraw\n      gameId\n      isApproved\n      pointsPerLoss\n      allowedFormats\n      createdAt\n      updatedAt\n      game {\n        id\n        name\n        slug\n        thumbnailImageUrl\n        status\n      }\n      entries {\n        id\n        leagueId\n        playerId\n        currentElo\n        position\n        player {\n          id\n          userId\n          user {\n            id\n            name\n            username\n            imageUrl\n            country\n          }\n        }\n      }\n    }\n  }\n": types.GetLeagueDocument,
    "\n  mutation AddPlayerToGame($input: AddPlayerToGameInput!) {\n    addPlayerToGame(input: $input) {\n      id\n    }\n  }\n": types.AddPlayerToGameDocument,
    "\n  query SearchPlayers($gameId: ID!, $query: String!) {\n    searchPlayers(gameId: $gameId, query: $query) {\n      nodes {\n        id\n        username\n        player {\n          id\n          user {\n            id\n            country\n          }\n        }\n      }\n    }\n  }\n": types.SearchPlayersDocument,
    "\n  query GetPlayer($id: ID!) {\n    player(id: $id) {\n      id\n      currentElo\n      user {\n        name\n        username\n        imageUrl\n        country\n        createdAt\n      }\n      usernames {\n        id\n        username\n      }\n    }\n  }\n": types.GetPlayerDocument,
    "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      username\n      name\n      imageUrl\n    }\n  }\n": types.UpdateProfileDocument,
    "\n  query GetUser($username: String!) {\n    user(username: $username) {\n      id\n      name\n      username\n      imageUrl\n      bio\n      profileColor\n      isAdmin\n      createdAt\n      players {\n        id\n        game {\n          id\n          name\n          slug\n          backgroundImageUrl\n        }\n        leagueEntries {\n          id\n          currentElo\n          position\n          league {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n": types.GetUserDocument,
    "\n  query SearchUsers($pagination: PaginationInput, $query: String) {\n    searchUsers(pagination: $pagination, query: $query) {\n      nodes {\n        id\n        name\n        username\n        imageUrl\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n": types.SearchUsersDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RequestUploadUrl($filename: String!, $contentType: String!) {\n    requestUploadUrl(filename: $filename, contentType: $contentType) {\n      uploadUrl\n      finalUrl\n    }\n  }\n"): (typeof documents)["\n  mutation RequestUploadUrl($filename: String!, $contentType: String!) {\n    requestUploadUrl(filename: $filename, contentType: $contentType) {\n      uploadUrl\n      finalUrl\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateGame($input: CreateGameInput!) {\n    createGame(input: $input) {\n      id\n      name\n      slug\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation CreateGame($input: CreateGameInput!) {\n    createGame(input: $input) {\n      id\n      name\n      slug\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateGame($id: ID!, $input: UpdateGameInput!) {\n    updateGame(id: $id, input: $input) {\n      id\n      name\n      slug\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateGame($id: ID!, $input: UpdateGameInput!) {\n    updateGame(id: $id, input: $input) {\n      id\n      name\n      slug\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ApproveGame($id: ID!) {\n    approveGame(id: $id) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation ApproveGame($id: ID!) {\n    approveGame(id: $id) {\n      id\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetGames($pagination: PaginationInput, $search: String) {\n    games(pagination: $pagination, search: $search) {\n      nodes {\n        id\n        name\n        slug\n        description\n        thumbnailImageUrl\n        backgroundImageUrl\n        steamUrl\n        status\n        createdAt\n        updatedAt\n        _count {\n          leagues\n          players\n        }\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n"): (typeof documents)["\n  query GetGames($pagination: PaginationInput, $search: String) {\n    games(pagination: $pagination, search: $search) {\n      nodes {\n        id\n        name\n        slug\n        description\n        thumbnailImageUrl\n        backgroundImageUrl\n        steamUrl\n        status\n        createdAt\n        updatedAt\n        _count {\n          leagues\n          players\n        }\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetGame($slug: String!) {\n    game(slug: $slug) {\n      id\n      name\n      slug\n      description\n      thumbnailImageUrl\n      backgroundImageUrl\n      steamUrl\n      status\n      authorId\n      createdAt\n      updatedAt\n      author {\n        id\n        name\n        username\n        imageUrl\n      }\n      leagues {\n        id\n        name\n        slug\n        description\n        initialElo\n        ratingSystem\n        isApproved\n        startDate\n        endDate\n        createdAt\n        entries {\n          id\n          currentElo\n          position\n          player {\n            id\n            user {\n              id\n              name\n              username\n              country\n            }\n          }\n        }\n      }\n      _count {\n        leagues\n        players\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetGame($slug: String!) {\n    game(slug: $slug) {\n      id\n      name\n      slug\n      description\n      thumbnailImageUrl\n      backgroundImageUrl\n      steamUrl\n      status\n      authorId\n      createdAt\n      updatedAt\n      author {\n        id\n        name\n        username\n        imageUrl\n      }\n      leagues {\n        id\n        name\n        slug\n        description\n        initialElo\n        ratingSystem\n        isApproved\n        startDate\n        endDate\n        createdAt\n        entries {\n          id\n          currentElo\n          position\n          player {\n            id\n            user {\n              id\n              name\n              username\n              country\n            }\n          }\n        }\n      }\n      _count {\n        leagues\n        players\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetGamesSimple($pagination: PaginationInput, $search: String) {\n    games(pagination: $pagination, search: $search) {\n      nodes {\n        id\n        name\n        slug\n        description\n        thumbnailImageUrl\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n"): (typeof documents)["\n  query GetGamesSimple($pagination: PaginationInput, $search: String) {\n    games(pagination: $pagination, search: $search) {\n      nodes {\n        id\n        name\n        slug\n        description\n        thumbnailImageUrl\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateLeague($input: CreateLeagueInput!) {\n    createLeague(input: $input) {\n      id\n      name\n      slug\n    }\n  }\n"): (typeof documents)["\n  mutation CreateLeague($input: CreateLeagueInput!) {\n    createLeague(input: $input) {\n      id\n      name\n      slug\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddPlayerToLeague($leagueId: ID!, $playerId: ID!, $initialElo: Int) {\n    addPlayerToLeague(\n      leagueId: $leagueId\n      playerId: $playerId\n      initialElo: $initialElo\n    ) {\n      id\n      currentElo\n    }\n  }\n"): (typeof documents)["\n  mutation AddPlayerToLeague($leagueId: ID!, $playerId: ID!, $initialElo: Int) {\n    addPlayerToLeague(\n      leagueId: $leagueId\n      playerId: $playerId\n      initialElo: $initialElo\n    ) {\n      id\n      currentElo\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RegisterSelfToLeague($leagueId: ID!) {\n    registerSelfToLeague(leagueId: $leagueId) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation RegisterSelfToLeague($leagueId: ID!) {\n    registerSelfToLeague(leagueId: $leagueId) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateLeague($id: ID!, $input: UpdateLeagueInput!) {\n    updateLeague(id: $id, input: $input) {\n      id\n      name\n      slug\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateLeague($id: ID!, $input: UpdateLeagueInput!) {\n    updateLeague(id: $id, input: $input) {\n      id\n      name\n      slug\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetLeagues($pagination: PaginationInput) {\n    leagues(pagination: $pagination) {\n      nodes {\n        id\n        name\n        slug\n        description\n        type\n        ratingSystem\n        isApproved\n        createdAt\n        game {\n          id\n          name\n          slug\n          thumbnailImageUrl\n        }\n        entries {\n          id\n          currentElo\n          position\n          player {\n            id\n            user {\n              id\n              name\n              username\n              country\n            }\n          }\n        }\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n"): (typeof documents)["\n  query GetLeagues($pagination: PaginationInput) {\n    leagues(pagination: $pagination) {\n      nodes {\n        id\n        name\n        slug\n        description\n        type\n        ratingSystem\n        isApproved\n        createdAt\n        game {\n          id\n          name\n          slug\n          thumbnailImageUrl\n        }\n        entries {\n          id\n          currentElo\n          position\n          player {\n            id\n            user {\n              id\n              name\n              username\n              country\n            }\n          }\n        }\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetLeague($gameSlug: String!, $leagueSlug: String!) {\n    league(gameSlug: $gameSlug, slug: $leagueSlug) {\n      id\n      name\n      slug\n      description\n      initialElo\n      ratingSystem\n      type\n      allowDraw\n      kFactor\n      scoreRelevance\n      inactivityDecay\n      inactivityThresholdHours\n      inactivityDecayFloor\n      pointsPerWin\n      pointsPerDraw\n      gameId\n      isApproved\n      pointsPerLoss\n      allowedFormats\n      createdAt\n      updatedAt\n      game {\n        id\n        name\n        slug\n        thumbnailImageUrl\n        status\n      }\n      entries {\n        id\n        leagueId\n        playerId\n        currentElo\n        position\n        player {\n          id\n          userId\n          user {\n            id\n            name\n            username\n            imageUrl\n            country\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetLeague($gameSlug: String!, $leagueSlug: String!) {\n    league(gameSlug: $gameSlug, slug: $leagueSlug) {\n      id\n      name\n      slug\n      description\n      initialElo\n      ratingSystem\n      type\n      allowDraw\n      kFactor\n      scoreRelevance\n      inactivityDecay\n      inactivityThresholdHours\n      inactivityDecayFloor\n      pointsPerWin\n      pointsPerDraw\n      gameId\n      isApproved\n      pointsPerLoss\n      allowedFormats\n      createdAt\n      updatedAt\n      game {\n        id\n        name\n        slug\n        thumbnailImageUrl\n        status\n      }\n      entries {\n        id\n        leagueId\n        playerId\n        currentElo\n        position\n        player {\n          id\n          userId\n          user {\n            id\n            name\n            username\n            imageUrl\n            country\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddPlayerToGame($input: AddPlayerToGameInput!) {\n    addPlayerToGame(input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation AddPlayerToGame($input: AddPlayerToGameInput!) {\n    addPlayerToGame(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchPlayers($gameId: ID!, $query: String!) {\n    searchPlayers(gameId: $gameId, query: $query) {\n      nodes {\n        id\n        username\n        player {\n          id\n          user {\n            id\n            country\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query SearchPlayers($gameId: ID!, $query: String!) {\n    searchPlayers(gameId: $gameId, query: $query) {\n      nodes {\n        id\n        username\n        player {\n          id\n          user {\n            id\n            country\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPlayer($id: ID!) {\n    player(id: $id) {\n      id\n      currentElo\n      user {\n        name\n        username\n        imageUrl\n        country\n        createdAt\n      }\n      usernames {\n        id\n        username\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetPlayer($id: ID!) {\n    player(id: $id) {\n      id\n      currentElo\n      user {\n        name\n        username\n        imageUrl\n        country\n        createdAt\n      }\n      usernames {\n        id\n        username\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      username\n      name\n      imageUrl\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      username\n      name\n      imageUrl\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUser($username: String!) {\n    user(username: $username) {\n      id\n      name\n      username\n      imageUrl\n      bio\n      profileColor\n      isAdmin\n      createdAt\n      players {\n        id\n        game {\n          id\n          name\n          slug\n          backgroundImageUrl\n        }\n        leagueEntries {\n          id\n          currentElo\n          position\n          league {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetUser($username: String!) {\n    user(username: $username) {\n      id\n      name\n      username\n      imageUrl\n      bio\n      profileColor\n      isAdmin\n      createdAt\n      players {\n        id\n        game {\n          id\n          name\n          slug\n          backgroundImageUrl\n        }\n        leagueEntries {\n          id\n          currentElo\n          position\n          league {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchUsers($pagination: PaginationInput, $query: String) {\n    searchUsers(pagination: $pagination, query: $query) {\n      nodes {\n        id\n        name\n        username\n        imageUrl\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n"): (typeof documents)["\n  query SearchUsers($pagination: PaginationInput, $query: String) {\n    searchUsers(pagination: $pagination, query: $query) {\n      nodes {\n        id\n        name\n        username\n        imageUrl\n      }\n      totalCount\n      hasNextPage\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;
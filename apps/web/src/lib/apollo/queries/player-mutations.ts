import { gql } from "@apollo/client";

export const ADD_PLAYER_TO_GAME = gql`
  mutation AddPlayerToGame($input: AddPlayerToGameInput!) {
    addPlayerToGame(input: $input) {
      id
    }
  }
`;

export const SEARCH_PLAYERS = gql`
  query SearchPlayers($gameId: ID!, $query: String!) {
    searchPlayers(gameId: $gameId, query: $query) {
      id
      username
      player {
        id
        user {
          id
          country
        }
      }
    }
  }
`;

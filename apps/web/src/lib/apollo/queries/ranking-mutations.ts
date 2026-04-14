import { gql } from "@apollo/client";

export const CREATE_RANKING = gql`
  mutation CreateRanking($input: CreateRankingInput!) {
    createRanking(input: $input) {
      id
      name
      slug
    }
  }
`;

export const ADD_PLAYER_TO_RANKING = gql`
  mutation AddPlayerToRanking(
    $rankingId: ID!
    $playerId: ID!
    $initialElo: Int
  ) {
    addPlayerToRanking(
      rankingId: $rankingId
      playerId: $playerId
      initialElo: $initialElo
    ) {
      id
      currentElo
    }
  }
`;

export const REGISTER_SELF_TO_RANKING = gql`
  mutation RegisterSelfToRanking($rankingId: ID!, $userId: ID!) {
    registerSelfToRanking(rankingId: $rankingId, userId: $userId) {
      id
    }
  }
`;

export const UPDATE_RANKING = gql`
  mutation UpdateRanking($id: ID!, $input: UpdateRankingInput!) {
    updateRanking(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`;

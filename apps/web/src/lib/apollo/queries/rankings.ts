import { gql } from "@apollo/client";

export const GET_RANKING = gql`
  query GetRanking($gameSlug: String!, $rankingSlug: String!) {
    ranking(gameSlug: $gameSlug, slug: $rankingSlug) {
      id
      name
      slug
      description
      initialElo
      ratingSystem
      createdAt
      game {
        id
        name
        slug
        thumbnailImageUrl
        status
      }
      entries {
        id
        currentElo
        position
        player {
          id
          userId
          user {
            id
            name
            username
            image
            country
          }
        }
      }
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

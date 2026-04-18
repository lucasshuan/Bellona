import { gql } from "@apollo/client";

export const GET_LEAGUES = gql`
  query GetLeagues($pagination: PaginationInput) {
    leagues(pagination: $pagination) {
      nodes {
        id
        name
        slug
        description
        type
        ratingSystem
        isApproved
        createdAt
        game {
          id
          name
          slug
          thumbnailImageUrl
        }
        entries {
          id
          currentElo
          position
          player {
            id
            user {
              id
              name
              username
              country
            }
          }
        }
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_LEAGUE = gql`
  query GetLeague($gameSlug: String!, $leagueSlug: String!) {
    league(gameSlug: $gameSlug, slug: $leagueSlug) {
      id
      name
      slug
      description
      initialElo
      ratingSystem
      type
      allowDraw
      kFactor
      scoreRelevance
      inactivityDecay
      inactivityThresholdHours
      inactivityDecayFloor
      pointsPerWin
      pointsPerDraw
      gameId
      isApproved
      pointsPerLoss
      allowedFormats
      createdAt
      updatedAt
      game {
        id
        name
        slug
        thumbnailImageUrl
        status
      }
      entries {
        id
        leagueId
        playerId
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

export const UPDATE_LEAGUE = gql`
  mutation UpdateLeague($id: ID!, $input: UpdateLeagueInput!) {
    updateLeague(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`;

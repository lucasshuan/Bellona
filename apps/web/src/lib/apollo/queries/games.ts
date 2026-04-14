import { gql } from "@apollo/client";

export const GET_GAMES = gql`
  query GetGames($search: String) {
    games(search: $search) {
      id
      name
      slug
      description
      thumbnailImageUrl
      backgroundImageUrl
      steamUrl
      status
      createdAt
      updatedAt
      _count {
        rankings
        players
      }
    }
  }
`;

export const GET_GAME = gql`
  query GetGame($slug: String!) {
    game(slug: $slug) {
      id
      name
      slug
      description
      thumbnailImageUrl
      backgroundImageUrl
      steamUrl
      status
      authorId
      createdAt
      updatedAt
      author {
        id
        name
        username
        image
      }
      rankings {
        id
        name
        slug
        description
        initialElo
        ratingSystem
        isApproved
        startDate
        endDate
        createdAt
      }
      _count {
        rankings
        players
      }
    }
  }
`;

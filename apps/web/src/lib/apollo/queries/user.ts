import { gql } from "@apollo/client";

export const GET_USER = gql`
  query GetUser($username: String!) {
    user(username: $username) {
      id
      name
      username
      image
      bio
      profileColor
      isAdmin
      createdAt
      players {
        id
        game {
          id
          name
          slug
          backgroundImageUrl
        }
        rankingEntries {
          id
          currentElo
          position
          ranking {
            id
            name
          }
        }
      }
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($pagination: PaginationInput, $query: String) {
    searchUsers(pagination: $pagination, query: $query) {
      nodes {
        id
        name
        username
        image
      }
      totalCount
      hasNextPage
    }
  }
`;

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
            event {
              id
              name
            }
          }
        }
      }
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      name
      username
      image
    }
  }
`;

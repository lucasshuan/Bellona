import { gql } from "@apollo/client";

export const GET_PLAYER = gql`
  query GetPlayer($id: ID!) {
    player(id: $id) {
      id
      currentElo
      user {
        name
        username
        image
        country
        createdAt
      }
      usernames {
        id
        username
      }
    }
  }
`;

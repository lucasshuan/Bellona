import { gql } from "@apollo/client";

export const CREATE_GAME = gql`
  mutation CreateGame($input: CreateGameInput!) {
    createGame(input: $input) {
      id
      name
      slug
      status
    }
  }
`;

export const UPDATE_GAME = gql`
  mutation UpdateGame($id: ID!, $input: UpdateGameInput!) {
    updateGame(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`;

export const APPROVE_GAME = gql`
  mutation ApproveGame($id: ID!) {
    approveGame(id: $id) {
      id
      status
    }
  }
`;

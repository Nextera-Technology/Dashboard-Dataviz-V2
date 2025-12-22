import { gql } from "@apollo/client/core";

export const gqlUpdateNotification = gql`
  mutation updateNotification($id: String!, $input: UpdateNotificationInput!) {
    updateNotification(_id: $id, input: $input) {
      _id
    }
  }
`;

import { gql } from "@apollo/client/core";

export const gqlGetAllNotification = gql`
  query getAllNotification(
    $pagination: PaginationDto
    $filter: NotificationFilterInput
    $sort: NotificationSortInput
  ) {
    getAllNotification(
      pagination: $pagination
      filter: $filter
      sort: $sort
    ) {
      totalData
      data {
        _id
        reference
        recipients {
          userId {
            _id
            email
            firstName
            lastName
            name
          }
          email
          type
          isImportant
          isStarred
          isRead
          readAt
          isSpam
        }
        senders {
          userId {
            _id
            email
            firstName
            lastName
            name
          }
          email
          type
          isImportant
          isStarred
          isRead
          readAt
          isSpam
        }
        content
        attachments
        isDraft
        sendDate
        status
      }
    }
  }
`;

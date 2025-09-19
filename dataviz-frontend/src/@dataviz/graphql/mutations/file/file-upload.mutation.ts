import { gql } from "@apollo/client/core";

// Updated to match backend schema: accepts an input object and returns Asset.fileName
export const gqlUploadPublicAsset = gql`
  mutation UploadPublicAsset($input: UploadFileInput!) {
    uploadPublicAsset(input: $input) {
      fileName
      s3Key
    }
  }
`;


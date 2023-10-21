import { gql } from "../../deps.ts";

export const test = gql`
  query test($src: String!, $packageManager: String!) {
    test(src: $src, packageManager: $packageManager)
  }
`;

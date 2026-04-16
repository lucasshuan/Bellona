/** @type {import("@graphql-codegen/cli").CodegenConfig} */
const config = {
  overwrite: true,
  schema: "../api/src/schema.gql",
  documents: "src/lib/apollo/queries/**/*.ts",
  generates: {
    "src/lib/apollo/generated/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;

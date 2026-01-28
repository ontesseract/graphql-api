# GraphQL API

Plugin for GraphQL Codegen https://the-guild.dev/graphql/codegen

TODO:

- [ ] optimize for dead code removal if necessary (see https://babeljs.io/docs/babel-plugin-minify-dead-code-elimination)
- [ ] Add support for subscriptions in graphql-typed-client-generator and graphql-client using AsyncIterable

like from typescript-generic-sdk (export type Requester<C = {}> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>)
https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-generic-sdk

Example:

```Typescript
import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:4000/graphql',
  documents: ['src/**/*.graphql'],
  generates: {
    './lib/graphql/generated/graphql-api.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-document-nodes', '@ontesseract/graphql-api'],
    },
  },
};

export default config;
```

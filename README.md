# GraphQL API

Plugin for GraphQL Codegen https://the-guild.dev/graphql/codegen

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

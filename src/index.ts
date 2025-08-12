import { Types } from "@graphql-codegen/plugin-helpers";
import Case from "case";
import { GraphQLSchema, Kind, OperationDefinitionNode } from "graphql";
import { format } from "prettier";

const prepend = `import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { DocumentNode } from 'graphql';
`;

export function returnFieldMatchesOperationName(
  definition: OperationDefinitionNode
): boolean {
  for (const node of definition.selectionSet.selections) {
    if (
      node.kind === Kind.FIELD &&
      (node.alias?.value === definition.name?.value ||
        (!node.alias && node.name?.value === definition.name?.value))
    ) {
      return true;
    }
  }
  return false;
}

function generateRequestArguments(
  pascalCaseName: string,
  nameSuffix: string
): string {
  return `${pascalCaseName}${nameSuffix}, variables`;
}

function generateQueryFunction(
  definition: OperationDefinitionNode,
  nameSuffix: string
): string {
  const name = definition.name?.value;
  if (!name) {
    return "";
  }
  const pascalCaseName = Case.pascal(name);
  const returnMatchesName = returnFieldMatchesOperationName(definition);
  if (returnMatchesName) {
    return `async ${name}(variables: ${pascalCaseName}QueryVariables): Promise<${pascalCaseName}Query['${name}']> {
      const data = await client.request<${pascalCaseName}Query>(${generateRequestArguments(pascalCaseName, nameSuffix)})
      return data['${name}']
    }`;
  }
  return `async ${name}(variables: ${pascalCaseName}QueryVariables): Promise<${pascalCaseName}Query> {
    return client.request<${pascalCaseName}Query>(${generateRequestArguments(pascalCaseName, nameSuffix)})
  }`;
}

function generateMutationFunction(
  definition: OperationDefinitionNode,
  nameSuffix: string
): string {
  const name = definition.name?.value;
  if (!name) {
    return "";
  }
  const pascalCaseName = Case.pascal(name);
  const returnMatchesName = returnFieldMatchesOperationName(definition);
  if (returnMatchesName) {
    return `async ${name}(variables: ${pascalCaseName}MutationVariables): Promise<${pascalCaseName}Mutation['${name}']> {
      const data = await client.request<${pascalCaseName}Mutation>(${generateRequestArguments(pascalCaseName, nameSuffix)})
      return data['${name}']
    }`;
  }
  return `async ${name}(variables: ${pascalCaseName}MutationVariables): Promise<${pascalCaseName}Mutation> {
    return client.request<${pascalCaseName}Mutation>(${generateRequestArguments(pascalCaseName, nameSuffix)})
  }`;
}

export async function plugin(
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  options: { nameSuffix?: string } = {}
): Promise<Types.ComplexPluginOutput> {
  const functions: string[] = [];

  for (const doc of documents) {
    if (!doc.document) {
      continue;
    }
    for (const definition of doc.document.definitions) {
      if (definition.kind === Kind.OPERATION_DEFINITION) {
        if (definition.operation === "query") {
          functions.push(
            generateQueryFunction(definition, options.nameSuffix ?? "")
          );
        }
        if (definition.operation === "mutation") {
          functions.push(
            generateMutationFunction(definition, options.nameSuffix ?? "")
          );
        }
      }
    }
  }

  let content = `
  export type GenericGraphQLClient<C = {}> = {
    request<TData = any, V = any>(
      document: string | DocumentNode | TypedDocumentNode<TData, V>,
      variables?: V,
      options?: C
    ): Promise<TData>;
  };

  export function getAPI(client: GenericGraphQLClient) {
    return {
      ${functions.join(",\n")}
    }
  }
  export type GraphQLAPI = ReturnType<typeof getAPI>;`;

  content = await format(content, { parser: "typescript" });

  return { content, prepend: [prepend] };
}

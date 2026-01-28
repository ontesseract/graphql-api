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
  return `${pascalCaseName}${nameSuffix}, variables, options`;
}

function generateQueryFunction(
  definition: OperationDefinitionNode,
  nameSuffix: string = "",
  withWrapper: boolean = true
): string {
  const name = definition.name?.value;
  if (!name) {
    return "";
  }
  const pascalCaseName = Case.pascal(name);
  const returnMatchesName = returnFieldMatchesOperationName(definition);
  const functionName = withWrapper ? name : `function fetch${pascalCaseName}`;
  const clientArg = withWrapper ? "" : `client: GenericGraphQLClient, `;
  if (returnMatchesName) {
    return `async ${functionName}(${clientArg}variables: ${pascalCaseName}QueryVariables, options?: RequestOptions): Promise<${pascalCaseName}Query['${name}']> {
      const data = await client.request<${pascalCaseName}Query>(${generateRequestArguments(pascalCaseName, nameSuffix)})
      return data['${name}']
    }`;
  }
  return `async ${functionName}(${clientArg}variables: ${pascalCaseName}QueryVariables, options?: RequestOptions): Promise<${pascalCaseName}Query> {
    return client.request<${pascalCaseName}Query>(${generateRequestArguments(pascalCaseName, nameSuffix)})
  }`;
}

function generateMutationFunction(
  definition: OperationDefinitionNode,
  nameSuffix: string = "",
  withWrapper: boolean = true
): string {
  const name = definition.name?.value;
  if (!name) {
    return "";
  }
  const pascalCaseName = Case.pascal(name);
  const returnMatchesName = returnFieldMatchesOperationName(definition);
  const functionName = withWrapper ? name : `function ${name}`;
  const clientArg = withWrapper ? "" : `client: GenericGraphQLClient, `;
  if (returnMatchesName) {
    return `async ${functionName}(${clientArg}variables: ${pascalCaseName}MutationVariables, options?: RequestOptions): Promise<${pascalCaseName}Mutation['${name}']> {
      const data = await client.request<${pascalCaseName}Mutation>(${generateRequestArguments(pascalCaseName, nameSuffix)})
      return data['${name}']
    }`;
  }
  return `async ${functionName}(${clientArg}variables: ${pascalCaseName}MutationVariables, options?: RequestOptions): Promise<${pascalCaseName}Mutation> {
    return client.request<${pascalCaseName}Mutation>(${generateRequestArguments(pascalCaseName, nameSuffix)})
  }`;
}

function generateSubscribeArguments(
  pascalCaseName: string,
  nameSuffix: string
): string {
  return `${pascalCaseName}${nameSuffix}, variables`;
}

function generateSubscriptionFunction(
  definition: OperationDefinitionNode,
  nameSuffix: string = "",
  withWrapper: boolean = true
): string {
  const name = definition.name?.value;
  if (!name) {
    return "";
  }
  const pascalCaseName = Case.pascal(name);
  const returnMatchesName = returnFieldMatchesOperationName(definition);
  const functionName = withWrapper
    ? name
    : `function subscribe${pascalCaseName}`;
  const clientArg = withWrapper ? "" : `client: GenericGraphQLClient, `;
  const isStream = name.endsWith("Stream");

  // For stream subscriptions, always yield the entire array
  if (isStream) {
    return `${functionName}(${clientArg}variables: ${pascalCaseName}SubscriptionVariables, onUnexpectedClose?: () => void): AsyncIterable<${pascalCaseName}Subscription['${name}']> {
      return (async function* () {
        for await (const data of client.subscribeAsync<${pascalCaseName}Subscription>(${generateSubscribeArguments(pascalCaseName, nameSuffix)}, onUnexpectedClose)) {
          yield data['${name}'];
        }
      })();
    }`;
  }

  // For regular subscriptions, check if return matches name
  if (returnMatchesName) {
    // Regular subscription - yield the field value
    return `${functionName}(${clientArg}variables: ${pascalCaseName}SubscriptionVariables, onUnexpectedClose?: () => void): AsyncIterable<${pascalCaseName}Subscription['${name}']> {
      return (async function* () {
        for await (const data of client.subscribeAsync<${pascalCaseName}Subscription>(${generateSubscribeArguments(pascalCaseName, nameSuffix)}, onUnexpectedClose)) {
          yield data['${name}'];
        }
      })();
    }`;
  }

  // If return doesn't match name, yield the entire subscription result
  return `${functionName}(${clientArg}variables: ${pascalCaseName}SubscriptionVariables, onUnexpectedClose?: () => void): AsyncIterable<${pascalCaseName}Subscription> {
    return client.subscribeAsync<${pascalCaseName}Subscription>(${generateSubscribeArguments(pascalCaseName, nameSuffix)}, onUnexpectedClose);
  }`;
}

export async function plugin(
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  options: { nameSuffix?: string; withWrapper?: boolean } = {}
): Promise<Types.ComplexPluginOutput> {
  const withWrapper = options.withWrapper ?? true;
  const functions: string[] = [];

  for (const doc of documents) {
    if (!doc.document) {
      continue;
    }
    for (const definition of doc.document.definitions) {
      if (definition.kind === Kind.OPERATION_DEFINITION) {
        if (definition.operation === "query") {
          functions.push(
            generateQueryFunction(definition, options.nameSuffix, withWrapper)
          );
        }
        if (definition.operation === "mutation") {
          functions.push(
            generateMutationFunction(
              definition,
              options.nameSuffix,
              withWrapper
            )
          );
        }
        if (definition.operation === "subscription") {
          functions.push(
            generateSubscriptionFunction(
              definition,
              options.nameSuffix,
              withWrapper
            )
          );
        }
      }
    }
  }

  const genericGraphQLClient = `

  export type RequestOptions = {
    requestHeaders?: HeadersInit;
    signal?: RequestInit['signal'];
  };

  export type GenericGraphQLClient = {
    request<TData = any, V = any>(
      document: string | DocumentNode | TypedDocumentNode<TData, V>,
      variables?: V,
      options?: RequestOptions
    ): Promise<TData>;
    subscribeAsync<TData = any, V = any>(
      document: string | DocumentNode | TypedDocumentNode<TData, V>,
      variables?: V,
      onUnexpectedClose?: () => void
    ): AsyncIterable<TData>;
  };
  `;

  let content = "";

  const validFunctions = functions.filter(Boolean);
  if (withWrapper) {
    content = `
    ${genericGraphQLClient}

    export function getAPI(client: GenericGraphQLClient) {
      return {
        ${validFunctions.join(",\n")}
      }
    };
    export type GraphQLAPI = ReturnType<typeof getAPI>;`;
  } else {
    content = `
    ${genericGraphQLClient}
    ${validFunctions.join(";\n")}
    `;
  }

  content = await format(content, { parser: "typescript" });

  return { content, prepend: [prepend] };
}

import { Types } from "@graphql-codegen/plugin-helpers";
import { GraphQLSchema, OperationDefinitionNode } from "graphql";
export declare function returnFieldMatchesOperationName(definition: OperationDefinitionNode): boolean;
export declare function plugin(schema: GraphQLSchema, documents: Types.DocumentFile[], options?: {
    nameSuffix?: string;
    withWrapper?: boolean;
}): Promise<Types.ComplexPluginOutput>;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnFieldMatchesOperationName = returnFieldMatchesOperationName;
exports.plugin = plugin;
var case_1 = __importDefault(require("case"));
var graphql_1 = require("graphql");
var prettier_1 = require("prettier");
var prepend = "import { TypedDocumentNode } from '@graphql-typed-document-node/core';\nimport { DocumentNode } from 'graphql';\n";
function returnFieldMatchesOperationName(definition) {
    var _a, _b, _c, _d;
    for (var _i = 0, _e = definition.selectionSet.selections; _i < _e.length; _i++) {
        var node = _e[_i];
        if (node.kind === graphql_1.Kind.FIELD &&
            (((_a = node.alias) === null || _a === void 0 ? void 0 : _a.value) === ((_b = definition.name) === null || _b === void 0 ? void 0 : _b.value) ||
                (!node.alias && ((_c = node.name) === null || _c === void 0 ? void 0 : _c.value) === ((_d = definition.name) === null || _d === void 0 ? void 0 : _d.value)))) {
            return true;
        }
    }
    return false;
}
function generateRequestArguments(pascalCaseName, nameSuffix) {
    return "".concat(pascalCaseName).concat(nameSuffix, ", variables, options");
}
function generateQueryFunction(definition, nameSuffix, withWrapper) {
    var _a;
    if (nameSuffix === void 0) { nameSuffix = ""; }
    if (withWrapper === void 0) { withWrapper = true; }
    var name = (_a = definition.name) === null || _a === void 0 ? void 0 : _a.value;
    if (!name) {
        return "";
    }
    var pascalCaseName = case_1.default.pascal(name);
    var returnMatchesName = returnFieldMatchesOperationName(definition);
    var functionName = withWrapper ? name : "function fetch".concat(pascalCaseName);
    var clientArg = withWrapper ? "" : "client: GenericGraphQLClient, ";
    if (returnMatchesName) {
        return "async ".concat(functionName, "(").concat(clientArg, "variables: ").concat(pascalCaseName, "QueryVariables, options?: RequestOptions): Promise<").concat(pascalCaseName, "Query['").concat(name, "']> {\n      const data = await client.request<").concat(pascalCaseName, "Query>(").concat(generateRequestArguments(pascalCaseName, nameSuffix), ")\n      return data['").concat(name, "']\n    }");
    }
    return "async ".concat(functionName, "(").concat(clientArg, "variables: ").concat(pascalCaseName, "QueryVariables, options?: RequestOptions): Promise<").concat(pascalCaseName, "Query> {\n    return client.request<").concat(pascalCaseName, "Query>(").concat(generateRequestArguments(pascalCaseName, nameSuffix), ")\n  }");
}
function generateMutationFunction(definition, nameSuffix, withWrapper) {
    var _a;
    if (nameSuffix === void 0) { nameSuffix = ""; }
    if (withWrapper === void 0) { withWrapper = true; }
    var name = (_a = definition.name) === null || _a === void 0 ? void 0 : _a.value;
    if (!name) {
        return "";
    }
    var pascalCaseName = case_1.default.pascal(name);
    var returnMatchesName = returnFieldMatchesOperationName(definition);
    var functionName = withWrapper ? name : "function ".concat(name);
    var clientArg = withWrapper ? "" : "client: GenericGraphQLClient, ";
    if (returnMatchesName) {
        return "async ".concat(functionName, "(").concat(clientArg, "variables: ").concat(pascalCaseName, "MutationVariables, options?: RequestOptions): Promise<").concat(pascalCaseName, "Mutation['").concat(name, "']> {\n      const data = await client.request<").concat(pascalCaseName, "Mutation>(").concat(generateRequestArguments(pascalCaseName, nameSuffix), ")\n      return data['").concat(name, "']\n    }");
    }
    return "async ".concat(functionName, "(").concat(clientArg, "variables: ").concat(pascalCaseName, "MutationVariables, options?: RequestOptions): Promise<").concat(pascalCaseName, "Mutation> {\n    return client.request<").concat(pascalCaseName, "Mutation>(").concat(generateRequestArguments(pascalCaseName, nameSuffix), ")\n  }");
}
function generateSubscribeArguments(pascalCaseName, nameSuffix) {
    return "".concat(pascalCaseName).concat(nameSuffix, ", variables");
}
function generateSubscriptionFunction(definition, nameSuffix, withWrapper) {
    var _a;
    if (nameSuffix === void 0) { nameSuffix = ""; }
    if (withWrapper === void 0) { withWrapper = true; }
    var name = (_a = definition.name) === null || _a === void 0 ? void 0 : _a.value;
    if (!name) {
        return "";
    }
    var pascalCaseName = case_1.default.pascal(name);
    var returnMatchesName = returnFieldMatchesOperationName(definition);
    var functionName = withWrapper
        ? name
        : "function subscribe".concat(pascalCaseName);
    var clientArg = withWrapper ? "" : "client: GenericGraphQLClient, ";
    var isStream = name.endsWith("Stream");
    // For stream subscriptions, always yield the entire array
    if (isStream) {
        return "".concat(functionName, "(").concat(clientArg, "variables: ").concat(pascalCaseName, "SubscriptionVariables, onUnexpectedClose?: () => void): AsyncIterable<").concat(pascalCaseName, "Subscription['").concat(name, "']> {\n      return (async function* () {\n        for await (const data of client.subscribeAsync<").concat(pascalCaseName, "Subscription>(").concat(generateSubscribeArguments(pascalCaseName, nameSuffix), ", onUnexpectedClose)) {\n          yield data['").concat(name, "'];\n        }\n      })();\n    }");
    }
    // For regular subscriptions, check if return matches name
    if (returnMatchesName) {
        // Regular subscription - yield the field value
        return "".concat(functionName, "(").concat(clientArg, "variables: ").concat(pascalCaseName, "SubscriptionVariables, onUnexpectedClose?: () => void): AsyncIterable<").concat(pascalCaseName, "Subscription['").concat(name, "']> {\n      return (async function* () {\n        for await (const data of client.subscribeAsync<").concat(pascalCaseName, "Subscription>(").concat(generateSubscribeArguments(pascalCaseName, nameSuffix), ", onUnexpectedClose)) {\n          yield data['").concat(name, "'];\n        }\n      })();\n    }");
    }
    // If return doesn't match name, yield the entire subscription result
    return "".concat(functionName, "(").concat(clientArg, "variables: ").concat(pascalCaseName, "SubscriptionVariables, onUnexpectedClose?: () => void): AsyncIterable<").concat(pascalCaseName, "Subscription> {\n    return client.subscribeAsync<").concat(pascalCaseName, "Subscription>(").concat(generateSubscribeArguments(pascalCaseName, nameSuffix), ", onUnexpectedClose);\n  }");
}
function plugin(schema_1, documents_1) {
    return __awaiter(this, arguments, void 0, function (schema, documents, options) {
        var withWrapper, functions, _i, documents_2, doc, _a, _b, definition, genericGraphQLClient, content, validFunctions;
        var _c;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    withWrapper = (_c = options.withWrapper) !== null && _c !== void 0 ? _c : true;
                    functions = [];
                    for (_i = 0, documents_2 = documents; _i < documents_2.length; _i++) {
                        doc = documents_2[_i];
                        if (!doc.document) {
                            continue;
                        }
                        for (_a = 0, _b = doc.document.definitions; _a < _b.length; _a++) {
                            definition = _b[_a];
                            if (definition.kind === graphql_1.Kind.OPERATION_DEFINITION) {
                                if (definition.operation === "query") {
                                    functions.push(generateQueryFunction(definition, options.nameSuffix, withWrapper));
                                }
                                if (definition.operation === "mutation") {
                                    functions.push(generateMutationFunction(definition, options.nameSuffix, withWrapper));
                                }
                                if (definition.operation === "subscription") {
                                    functions.push(generateSubscriptionFunction(definition, options.nameSuffix, withWrapper));
                                }
                            }
                        }
                    }
                    genericGraphQLClient = "\n\n  export type RequestOptions = {\n    requestHeaders?: HeadersInit;\n    signal?: RequestInit['signal'];\n  };\n\n  export type GenericGraphQLClient = {\n    request<TData = any, V = any>(\n      document: string | DocumentNode | TypedDocumentNode<TData, V>,\n      variables?: V,\n      options?: RequestOptions\n    ): Promise<TData>;\n    subscribeAsync<TData = any, V = any>(\n      document: string | DocumentNode | TypedDocumentNode<TData, V>,\n      variables?: V,\n      onUnexpectedClose?: () => void\n    ): AsyncIterable<TData>;\n  };\n  ";
                    content = "";
                    validFunctions = functions.filter(Boolean);
                    if (withWrapper) {
                        content = "\n    ".concat(genericGraphQLClient, "\n\n    export function getAPI(client: GenericGraphQLClient) {\n      return {\n        ").concat(validFunctions.join(",\n"), "\n      }\n    };\n    export type GraphQLAPI = ReturnType<typeof getAPI>;");
                    }
                    else {
                        content = "\n    ".concat(genericGraphQLClient, "\n    ").concat(validFunctions.join(";\n"), "\n    ");
                    }
                    return [4 /*yield*/, (0, prettier_1.format)(content, { parser: "typescript" })];
                case 1:
                    content = _d.sent();
                    return [2 /*return*/, { content: content, prepend: [prepend] }];
            }
        });
    });
}

import { Types } from "@graphql-codegen/plugin-helpers";
import { buildSchema, parse } from "graphql";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { plugin } from "..";

async function main() {
  const testDataDir = join(__dirname, "test-data");
  const outputPath = join(__dirname, "test-output.ts");

  console.log("Loading schema and documents from:", testDataDir);

  try {
    // Load schema
    const schemaPath = join(testDataDir, "schema.graphql");
    const schemaSource = readFileSync(schemaPath, "utf-8");
    console.log(`Loaded schema (${schemaSource.length} chars)`);

    const schema = buildSchema(schemaSource);
    console.log("Schema built successfully");

    // Load documents
    const documentsPath = join(testDataDir, "documents.graphql");
    const documentsSource = readFileSync(documentsPath, "utf-8");
    console.log(`Loaded documents (${documentsSource.length} chars)`);

    const documentNode = parse(documentsSource);
    console.log(
      `Parsed ${documentNode.definitions.length} definitions from documents`
    );

    const documents: Types.DocumentFile[] = [
      {
        document: documentNode,
        location: documentsPath,
      },
    ];

    // Run the plugin
    console.log("\nRunning plugin...");
    const output = await plugin(schema, documents, {
      nameSuffix: "Document",
      withWrapper: true,
    });

    // Write output
    const fullOutput =
      "// @ts-nocheck\n\n" +
      (output.prepend || []).join("\n") +
      "\n" +
      output.content;
    writeFileSync(outputPath, fullOutput);
    console.log(`\nOutput written to: ${outputPath}`);
    console.log(`Output size: ${fullOutput.length} chars`);
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

main();

// Advanced WebMCP Tool Schema Validator with ajv
// Run: npm run validate:webmcp

const fs = require('fs');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true, strict: false });

const content = fs.readFileSync('webmcp.js', 'utf8');

console.log('🔍 Running advanced WebMCP + JSON Schema validation...\n');

let errors = 0;

// Extract registerTool calls
const toolRegex = /registerTool\s*\(\s*\{([\s\S]*?)\}\s*(?:,\s*\{[^}]*\})?\s*\)/g;
const tools = [];
let match;

while ((match = toolRegex.exec(content)) !== null) {
  const toolBody = match[1];
  
  const nameMatch = toolBody.match(/name\s*:\s*["']([^"']+)["']/);
  const descMatch = toolBody.match(/description\s*:\s*["']([^"']+)["']/);
  const schemaMatch = toolBody.match(/inputSchema\s*:\s*(\{[\s\S]*?\})/);
  
  if (nameMatch) {
    tools.push({
      name: nameMatch[1],
      description: descMatch ? descMatch[1] : null,
      rawSchema: schemaMatch ? schemaMatch[1] : null
    });
  }
}

console.log(`Found ${tools.length} registered tools\n`);

tools.forEach((tool) => {
  console.log(`Tool: ${tool.name}`);
  
  if (!tool.description || tool.description.length < 15) {
    console.error(`  ❌ Error: Description missing or too short`);
    errors++;
  } else {
    console.log(`  ✅ Description OK`);
  }
  
  if (!tool.rawSchema) {
    console.error(`  ❌ Error: No inputSchema defined`);
    errors++;
  } else {
    try {
      // Clean up the schema string for parsing
      let schemaStr = tool.rawSchema
        .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')  // Quote keys
        .replace(/'/g, '"');                          // Single to double quotes
      
      const schema = JSON.parse(schemaStr);
      
      const validate = ajv.compile(schema);
      
      if (validate.errors) {
        console.error(`  ❌ Error: Invalid inputSchema - ${ajv.errorsText(validate.errors)}`);
        errors++;
      } else {
        console.log(`  ✅ inputSchema is valid JSON Schema`);
      }
    } catch (e) {
      console.error(`  ❌ Error: Failed to parse inputSchema - ${e.message}`);
      errors++;
    }
  }
  
  console.log('');
});

if (errors === 0) {
  console.log('✅ All WebMCP tools passed advanced schema validation!');
} else {
  console.log(`\n❌ Validation failed with ${errors} error(s)`);
  process.exit(1);
}

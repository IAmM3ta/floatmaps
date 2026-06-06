// Advanced WebMCP Tool Schema Validator
// Run locally: node scripts/validate-webmcp.js

const fs = require('fs');

const content = fs.readFileSync('webmcp.js', 'utf8');

console.log('🔍 Running advanced WebMCP validation...\n');

let errors = 0;
let warnings = 0;

// Extract registerTool calls using regex (simple but effective for this structure)
const toolRegex = /registerTool\s*\(\s*\{([\s\S]*?)\}\s*(?:,\s*\{[^}]*\})?\s*\)/g;
const tools = [];
let match;

while ((match = toolRegex.exec(content)) !== null) {
  const toolBody = match[1];
  
  // Extract key fields
  const nameMatch = toolBody.match(/name\s*:\s*["']([^"']+)["']/);
  const descMatch = toolBody.match(/description\s*:\s*["']([^"']+)["']/);
  const schemaMatch = toolBody.match(/inputSchema\s*:\s*(\{[\s\S]*?\})/);
  
  if (nameMatch) {
    const tool = {
      name: nameMatch[1],
      description: descMatch ? descMatch[1] : null,
      hasInputSchema: !!schemaMatch,
      rawSchema: schemaMatch ? schemaMatch[1] : null
    };
    tools.push(tool);
  }
}

console.log(`Found ${tools.length} registered tools:\n`);

// Validate each tool
tools.forEach((tool, index) => {
  console.log(`Tool #${index + 1}: ${tool.name}`);
  
  if (!tool.description || tool.description.length < 10) {
    console.warn(`  ⚠️  Warning: Description is missing or too short`);
    warnings++;
  } else {
    console.log(`  ✅ Description present`);
  }
  
  if (!tool.hasInputSchema) {
    console.warn(`  ⚠️  Warning: No inputSchema defined`);
    warnings++;
  } else {
    console.log(`  ✅ inputSchema present`);
    
    // Basic schema structure validation
    if (tool.rawSchema.includes('type') && tool.rawSchema.includes('properties')) {
      console.log(`  ✅ Schema has basic structure (type + properties)`);
    } else {
      console.warn(`  ⚠️  Warning: inputSchema may be missing 'type' or 'properties'`);
      warnings++;
    }
    
    // Check for required fields if present
    if (tool.rawSchema.includes('required')) {
      console.log(`  ✅ Has 'required' array`);
    }
  }
  
  console.log('');
});

// Summary
if (errors === 0 && warnings === 0) {
  console.log('✅ All WebMCP tools passed advanced validation!');
} else {
  console.log(`\nValidation complete: ${errors} errors, ${warnings} warnings`);
  if (errors > 0) process.exit(1);
}

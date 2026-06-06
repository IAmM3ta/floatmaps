// Simple validation script for WebMCP tools
// Run with: node scripts/validate-webmcp.js

const fs = require('fs');

const content = fs.readFileSync('webmcp.js', 'utf8');

console.log('Validating WebMCP integration...');

// Check for registerTool usage
const toolMatches = content.match(/registerTool\s*\(/g);
if (!toolMatches) {
  console.error('❌ No tools registered');
  process.exit(1);
}

console.log(`✅ Found ${toolMatches.length} tool registration(s)`);

// Check for startSimulatedRide specifically
if (content.includes('startSimulatedRide')) {
  console.log('✅ startSimulatedRide tool found');
} else {
  console.warn('⚠️  startSimulatedRide tool not found');
}

console.log('WebMCP validation complete.');

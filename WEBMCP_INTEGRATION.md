# WebMCP Integration for FloatMaps

**Goal**: Expose FloatMaps functionality as structured tools so AI agents can interact with and optimize the platform.

## What is WebMCP?

WebMCP (Web Model Context Protocol) is a browser-native standard that allows web apps to expose "tools" (JavaScript functions with schemas and descriptions) that AI agents can discover and call directly.

It is the client-side equivalent of Anthropic's Model Context Protocol (MCP).

## Recommended Tools to Expose

### High Priority
- `startSimulatedRide` - Launch first-person ride simulation (ties into 360 camera pipeline)
- `createGroupRide`
- `joinFloatila`
- `searchMarketplace`

### Implementation

See `webmcp.js` for the module.

Tools are registered using:
```js
document.modelContext.registerTool({ name, description, inputSchema, execute })
```

## Integration with Simulated Ride Feature

The `startSimulatedRide` tool directly supports the QooCam 360 video workflow:
- Uses pre-processed Gaussian Splats from 360 footage
- Drives first-person camera using VESC physics
- Optional AI enhancement layer (Runway / Kling)

## Next Steps
- Register initial tools
- Add feature flag for WebMCP
- Document exposed tools for agents
- Combine with backend MCP for full-stack agent capabilities

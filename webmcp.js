// webmcp.js - WebMCP integration for FloatMaps
// Exposes structured tools for AI agents

export function initWebMCP() {
  if (!('modelContext' in document)) {
    console.log('[WebMCP] Not supported in this browser');
    return;
  }

  console.log('[WebMCP] Initializing FloatMaps tools...');
  registerCoreTools();
}

function registerCoreTools() {
  // startSimulatedRide tool
  document.modelContext.registerTool({
    name: "startSimulatedRide",
    description: "Start a first-person simulated ride preview for a given route. Supports both procedural rendering and AI-enhanced video.",
    inputSchema: {
      type: "object",
      properties: {
        routeId: { type: "string", description: "ID of a saved route or GroupRide" },
        boardType: { type: "string", enum: ["FunWheel X7", "EUC", "E-Bike", "Custom VESC"] },
        style: { type: "string", enum: ["cruiser", "aggressive", "efficient", "touring"] },
        useAIEnhancement: { type: "boolean", description: "Use AI video generation on top of 3D scene" }
      },
      required: ["routeId"]
    },
    async execute({ routeId, boardType = "FunWheel X7", style = "cruiser", useAIEnhancement = false }) {
      await startSimulatedRide({ routeId, boardType, style, useAIEnhancement });
      return {
        content: [{ type: "text", text: `Started ${style} simulated ride on route ${routeId}` }]
      };
    }
  });

  // Add more tools here (createGroupRide, joinFloatila, etc.)
}

# FloatMaps Development Notes - Comprehensive Summary

**Date**: June 2026
**Repository**: IAmM3ta/floatmaps

## WebMCP Integration (Latest Addition)

Added support for **WebMCP** (Web Model Context Protocol) so AI agents can interact with FloatMaps in a structured, reliable way.

### Key Files Added
- `webmcp.js` - Module to register tools
- `WEBMCP_INTEGRATION.md` - Detailed integration plan

### Tools Registered (Initial Set)
- `startSimulatedRide` (with support for 360 video + AI enhancement)
- `createGroupRide`
- `joinFloatila`
- `searchMarketplace`

This enables future agentic optimization of routes, Floatilas, GroupRides, and the simulated ride feature.

---

## Previous Notes (Summarized)

### Simulated Ride-Through using 360 Video Capture
- Use QooCam 8K 360 camera to record real rider POV
- Process into Gaussian Splats
- Drive first-person camera in Three.js with VESC physics
- Optional AI video enhancement layer

### FloatILA Protocol
- Persistent BLE advertisements + Schnorr proofs
- Crowdsourced location reporting
- Companion BLE module firmware

### Other Major Systems
- VESC integration with safety constraints
- Livestreaming (WebRTC + LiveKit)
- Marketplace with map overlay
- Ghost Mode
- Comprehensive documentation and financial models

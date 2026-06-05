# FloatMaps Development Notes - Comprehensive Summary

**Date**: June 2026
**Repository**: IAmM3ta/floatmaps

This document consolidates all major discussions, decisions, implementations, and next steps from the development thread.

## 1. Project Vision & Core Philosophy

FloatMaps is the spatial and social coordination layer for the open PEV (Personal Electric Vehicle) ecosystem.
- **Key Principles**:
  - Open hardware first (VESC-native telemetry and control)
  - Privacy-first (Ghost Mode)
  - Safety-first (motor commands disabled while riding)
  - Rider-owned economics
  - Cryptographic ownership verification

**Three-Layer Architecture**:
- **FloatMaps**: The main platform (mapping, AR, social, marketplace, streaming)
- **FloatILA** (Inter-device Location Architecture): The mesh protocol layer (persistent BLE advertisements, Schnorr proofs, crowdsourced location reporting)
- **Floatilas**: Shared/membership-based fleets of high-performance PEVs

## 2. Major Features & Subsystems

### Mapping & AR Layer
- Leaflet base map + Three.js/WebXR immersive AR
- Gaussian Splats and Cesium 3D Tiles support (TrailView)
- Marker clustering with Web Worker icon generation
- Location-based marketplace overlay with two-stage tap (preview → full modal)
- AR beacons, persistent anchors, hit-testing, haptics

### VESC Integration
- Real BLE telemetry parsing with CRC-16 validation
- Motor control (strictly disabled while recording rides or in Ghost Mode; voice commands blocked)
- Device simulator with realistic packet generation
- Explicit exclusion of FutureMotion/Onewheel from VESC layer (proprietary BMS/controllers + litigation history)

### Social & Realtime Features
- GroupRides with proximity detection and AR overlays
- Bidirectional pings with haptic feedback
- Walkie-talkie style voice notes (MediaRecorder + silence detection)
- Supabase Realtime (presence, broadcasts, Postgres changes) with comprehensive RLS

### Marketplace
- Full CRUD for boards, parts, 3D prints, gear, accessories
- Location-aware map overlay with clustering
- Interests/leads system
- VESC-compatible tagging

### Livestreaming Stack
- Platform linking (Twitch, YouTube, etc.)
- Custom RTMP ingestion + HLS playback
- WebRTC low-latency publishing and viewing (initially Supabase Realtime, scaled with LiveKit SFU)
- Simulcast + SVC configuration (`L3T3_KEY` with VP9)
- Error handling with specific Sentry codes

### Theft Mesh / FloatILA Protocol
- Persistent BLE advertisements (defined service UUID + manufacturer data format)
- Schnorr proofs (Ed25519) for cryptographic ownership verification
- Crowdsourced location reporting by participating nodes
- Opt-in mesh participation with Ghost Mode exclusion
- Capacitor background scanning layer (Android foreground service + iOS opportunistic)
- Companion BLE module firmware (ESP32/nRF) for persistent device advertising
- Formal protocol spec documented in FLOATILA-PROTOCOL.md

### Floatilas (Shared Fleets)
- Owner-created collections of high-performance PEVs
- Member discovery, reservation, and access control
- Usage tracking via VESC telemetry
- Location via FloatILA mesh
- Flexible return/handover mechanics
- Strong potential synergy with simulated ride previews

### Privacy & Safety Systems
- **Ghost Mode**: Global toggle suppressing location sharing, live indicators, mesh reporting, and motor commands across all layers
- **Cryptographic Ownership**: Ed25519 keypairs + Schnorr proofs
- **Physical Safety**: Motor control locked while riding or in Ghost Mode

### Supporting Infrastructure
- Comprehensive RLS policies
- Offline queue with exponential backoff + IndexedDB
- Error monitoring with specific Sentry codes
- Web Workers for performance (cluster icons)
- Capacitor native wrapper for iOS/Android

## 3. Key Technical Decisions & Naming

- **FloatILA** = Inter-device Location Architecture (official protocol name)
- **Floatilas** = Shared fleets (plural form)
- FutureMotion/Onewheel explicitly excluded from VESC interface
- Motor control safety is non-negotiable
- Hybrid AI + procedural approaches preferred for simulated rides

## 4. Hardware & Capture Strategy (Latest Direction)

**QooCam 8K 360 Camera Approach** (actionable path for simulated ride-throughs):
- Record high-quality 8K HDR 360 video while riding a route using QooCam + selfie stick
- Optionally sync with VESC telemetry for accurate speed/physics
- Process 360 video into Gaussian Splats or navigable 3D scene
- Drive first-person camera in Three.js/WebXR using route + VESC motion model
- Add optional AI enhancement layer (Runway Gen-4 or Kling AI) for stylized versions
- Benefits: High authenticity, leverages existing splat + AR pipeline, excellent for Floatilas previews

## 5. AI Integration (Gemini Omni & Alternatives)

**Original Idea**: Use Gemini Omni (or alternatives) for AI-generated trajectory-based videos from map paths.

**Shifted Focus**: Move from drone fly-throughs to **first-person simulated ride** experiences.

**Recommended Alternatives to Gemini Omni** (as of June 2026):
- **Kling AI**: Excellent physics and motion coherence
- **Runway Gen-4**: Best trajectory control and editing
- **Seedance 2.0**: Top benchmark quality
- **Stability Virtual Camera**: Best explicit 3D camera trajectory support (strong synergy with Gaussian Splats)
- Open-source options via fal.ai or self-host for cost/privacy

**Hybrid Recommendation**: Procedural Three.js camera path (using splats + VESC physics) as instant fallback + AI video layer for high-fidelity output.

## 6. GitHub & Package Management

- Created `packages/floatila/` structure for the FloatILA client library
- `package.json` configured for GitHub Packages (`@floatmaps/floatila`)
- Added `tsconfig.json`, `src/index.ts` (Schnorr proof implementation), and publish workflow
- Updated `README.md` with installation and usage instructions
- Created `NOTES.md` as a dedicated notes section

## 7. Financials, Pitch & Documentation

- Detailed financial projections and monthly cash flow model created
- Pitch deck outline, executive summary, and capital investment proposal drafted
- Multiple spec files created: PILOT_PLAN, BUSINESS_MODEL, INVESTMENT_STRATEGY, etc.
- Strong trademark availability for FloatMaps and FloatILA

## 8. Current Status & Momentum

**Implemented & Functional**:
- Core mapping/AR, VESC layer, realtime social features, marketplace, livestreaming stack, FloatILA foundation (BLE + proofs + background scanning), Ghost Mode

**In Active Development**:
- Full Schnorr proof integration
- Floatilas platform (data model, discovery, access)
- Hardware partnership path
- Native app packaging and store submission

## 9. Open Items & Recommended Next Priorities

**High Priority**:
- Complete Schnorr proof integration + Edge Function verifier
- Build core Floatilas data model and discovery layer
- Finalize companion BLE module firmware alignment with FloatILA spec
- Add Android foreground service refinements

**Strategic**:
- Hardware partnership discussions (companion module + potential MFi path)
- Execute App Store / Play Store submission
- Expand simulated ride feature using 360 camera capture pipeline

## 10. Overall Assessment

FloatMaps has evolved from a mapping app into a comprehensive platform with strong technical depth across AR, realtime, cryptography, mesh networking, and shared mobility. The combination of FloatMaps + FloatILA + Floatilas creates multiple defensible network effects and revenue paths while staying true to open hardware and rider-owned principles.

All major pieces are well-documented and ready for continued development without loss of context.
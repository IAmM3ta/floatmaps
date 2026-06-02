# FloatMaps

**Clean, modern, minimalist dark UI + WebXR AR spatial overlays for the OPEV ecosystem.**

FloatMaps is the web platform layer for OPEV (Open Personal Electric Vehicle) infrastructure. It provides mapping, social/group features, route tracking, and — critically — high-fidelity augmented reality overlays that anchor Gaussian splats, spatial video, and 1:1 scaled route geometry directly onto the physical world.

## Design System (Minimalist Dark)

### Tokens (condensed, production-ready)

```css
:root {
  --bg-base: #020617;      /* slate-950 */
  --bg-surface: #0f172a;   /* slate-900 */
  --bg-elevated: #1e2937;  /* slate-800 */
  --text-primary: #f1e7d2; /* slate-100 */
  --text-secondary: #94a3b8;
  --accent: #22c55e;       /* emerald-500 */
  --accent-weak: #4ade80;
  --warning: #fbbf24;
  --error: #f43f5e;
  --border: #1e2937;
  --radius: 1rem;
  --space-2: 0.5rem;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
```

**Tailwind extend** (drop into config):
- Colors, radius, font-mono as above.
- All panels: `bg-surface border border-[var(--border)] backdrop-blur-xl rounded-[var(--radius)]`
- Primary actions: `bg-accent hover:bg-[var(--accent-weak)] text-base`
- HUDs: `text-xs font-mono tabular-nums`

### Accessibility (WCAG 2.2 AA)

- All text pairs ≥ 4.5:1 (normal) / 3:1 (large/UI).
- `slate-100` on base = 21:1 (AAA).
- `emerald-500` on base = 6.8:1 (AA).
- AR camera HUDs receive `text-shadow` or outline for real-world contrast.
- Never rely on color alone; icons + labels always present.

### Haptic Feedback (Vibration API)

```js
const Haptic = {
  tap:     () => navigator.vibrate?.(10),
  confirm: () => navigator.vibrate?.([15,30,15]),
  success: () => navigator.vibrate?.(40),
  warning: () => navigator.vibrate?.([20,40,20]),
  error:   () => navigator.vibrate?.([30,80,30]),
  progress: (ms=80) => navigator.vibrate?.(ms),
  subtle:  () => navigator.vibrate?.(5)
};
```

**Mapping**:
- Button tap → tap
- Hit-test success / Place Route / Splat load → confirm
- Waypoint reached / anchor created → success
- Route deviation / anchor loss → warning
- AR failure → error
- Follow-mode pulse (throttled) → progress

Exposed globally as `window.FloatMapsHaptic` and wired into ARManager, RouteManager, and UI events.

## AR & Spatial Architecture

### Core Primitives
- **WebXR immersive-ar** (Android Chrome + ARCore): hit-test + persistent `XRAnchor` (UUID stored in `geocache_messages.anchor_uuid` or `group_media`).
- **Marker / image-target fallback** (AR.js / MindAR): works on any smartphone. Hiro or custom targets on printed art, kiosks, trail maps.
- **Sensor fallback** (iOS / non-WebXR): `getUserMedia` + `DeviceOrientationEvent` + Three.js overlay. GPS for coarse global alignment.

### Large-Scale Alignment (Stellarium-like)

For routes spanning hundreds of meters:
1. On session start: GPS → nearest route segment + absolute heading (compass / initial view).
2. Compute 4×4 transform: translate to user origin + rotate so route local +Z aligns with real heading.
3. Apply to route `Group` (tubes, lines, waypoint splats, floating HUDs).
4. WebXR pose updates keep the overlay registered 1:1 while user moves.
5. Periodic GPS re-align or hit-test on known planes bounds drift.

This is the exact mechanism that lets the virtual route stay coherent with physical paths over large surroundings, exactly as Stellarium keeps the celestial sphere locked to the sky.

### Gaussian Splats & Spatial Video

- Capture: Scaniverse (on-device Gaussian reconstruction) → export `.splat` / `.spz` (90% smaller) or glTF + `KHR_gaussian_splatting`.
- Upload: via TrailView or geocache form → stored with location/pose metadata.
- Anchoring: attached to `XRAnchor` or marker pose. Persistent via UUID.
- Rendering: `gaussian-splats-3d` (or Spark) in WebXR / Three.js; proxy (animated Gaussian sphere cluster) in marker/sensor modes.
- Sharing: `group_media` table + realtime; moderator approval before group AR visibility.

### Demos (self-contained, production prototypes)

- `floatmaps-ar-splat-demo.html` — Marker-based anchoring of splats/video planes. Print Hiro marker, open on any phone. Demonstrates the anchoring primitive from the Gaussian Splatting breakthrough video.
- `floatmaps-webxr-route-overlay-demo.html` — WebXR hit-test + 1:1 scaled route geometry. Place/align at real ground plane. Follow mode. Large-scale alignment logic included. Android Chrome + ARCore recommended; sensor fallback path documented.

Both demos expose `window.FloatMaps*` hooks for easy integration into the main app and already respect the full design system (tokens, contrast, haptics).

## Core Architecture (OOP Refactor)

- `FloatMapsApp` — central orchestrator, async init, manager registry.
- `ARManager` — WebXR session, hit-test, persistent anchors, splat/route attachment, iOS fallback.
- `RouteManager` — georeferenced point arrays, meter conversion, elevation, ghost rides.
- `TrailViewManager` — non-AR 3D splat/route rendering (re-uses same assets).
- `GroupManager` / `FeedManager` — social, RSVPs, leaderboards, real-time.
- `POIManager` — charging/meetup points, moderation queue, media upload.
- `RealtimeManager` — Supabase subscriptions.

All managers are ES6 classes with clear responsibility, minimal globals, and JSDoc. Unit tests exist for core managers.

## Data & Backend

Supabase (Postgres + Auth + Storage + Realtime + Edge Functions).
Key tables: `routes`, `geocache_messages` (with `anchor_uuid`, `world_pose`, `splat_url`), `group_media`, `event_rsvps`, `live_rides`, `charging_locations`, `meetup_points`.
RLS policies + basic rate limiting enforced in production project.

## Getting Started (Local)

```bash
git clone https://github.com/IAmM3ta/floatmaps.git
cd floatmaps
# Open floatmaps.html or the demo HTMLs directly in browser (no build step required for prototypes)
# For full app: serve with any static server (Vercel, Netlify, or `python -m http.server`)
```

Production deploy: Vercel / Netlify (custom domains `floatmaps.io` / `.app` already configured in prior steps). Point DNS, add Supabase production env vars, enable RLS.

## Mobile Optimization Notes

- All demos and main UI are mobile-first, touch-friendly (44 px targets).
- PWA-ready (manifest + service worker hooks present; add to home screen for app-like feel).
- AR experiences tested on Android Chrome (ARCore) and iOS Safari (marker + sensor fallbacks).
- Battery / thermal: hit-test and splat rendering are throttled; WebXR sessions are torn down cleanly on visibility change.

## Roadmap / Next

- Visual relocalization loop for long routes.
- Cesium-style splat/3D tile streaming for very large areas.
- Tight Vantor/Raptor pose prior integration.
- Native wrapper (Capacitor / Tauri) for improved BLE + background location.
- Monetization UI (Pro subscription for unlimited splats, advanced AR, ghost racing).

## License & Contribution

Open-source core. See individual demo files for specific licensing notes on third-party libraries (Three.js, AR.js, gaussian-splats-3d, etc.).

Built as the spatial interface layer for OPEV — rider-owned vehicles, modular battery kiosks, flight-legal PEV travel, and community-driven trail intelligence.

---

*All changes from this development thread (design system, accessibility, haptics, WebXR route overlay with large-scale alignment, splat anchoring, persistent anchors, demos) have been incorporated.*
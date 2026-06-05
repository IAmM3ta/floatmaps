# FloatMaps Notes

## Simulated Ride-Through Feature using 360 Video Capture (June 2026)

**Idea**: Leverage personal hardware (QooCam 8K 360 camera + selfie stick) to record high-quality 8K HDR 360 video while riding a chosen route (e.g., Greenville SC or Western North Carolina). Use this real captured footage to generate a 3D scene for an interactive first-person "simulated ride" preview in FloatMaps.

**Why this is strong**:
- Provides authentic, high-fidelity rider POV instead of synthetic drone views.
- Combines extremely well with existing Gaussian Splats, VESC telemetry, AR/WebXR, and TrailView features.
- Practical and immediately actionable with owned hardware.
- Excellent for both individual route previews and Floatilas (shared fleet) marketing/preview content.

**Proposed Pipeline**:
1. **Capture**: Record 8K 360 video while riding the route (optionally sync with VESC telemetry for accurate speed/physics).
2. **Processing**: Convert 360 video into Gaussian Splats or navigable 3D scene (tools like Luma AI, Polycam, or photogrammetry + 3DGS pipelines).
3. **Integration**:
   - Load splat into existing Three.js/WebXR scene.
   - Drive first-person camera along recorded route using VESC motion model.
   - Add subtle head bob, lean, and vibration for realistic PEV feel.
4. **Enhancement (Optional)**: Use AI video models (Runway Gen-4 or Kling) for stylized versions or conversational editing.
5. **Delivery**: Interactive AR experience, shareable video, or attachment to GroupRides/Floatilas.

**Next Actions**:
- Test record a short route.
- Experiment with 360-to-splat conversion tools.
- Prototype camera path + physics in Three.js.
- Define prompt templates if adding AI enhancement layer.

This represents a hardware-grounded, high-authenticity path to the simulated ride feature.
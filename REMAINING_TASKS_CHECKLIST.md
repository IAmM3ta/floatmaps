# Detailed Checklist of Remaining Tasks

## Technical / Product
- [ ] Wire real Supabase Auth into the demo (sign up / sign in flows)
- [ ] Connect frontend calls to all Edge Functions (tunings, rides, devices, gifting, etc.)
- [ ] Implement full IndexedDB → Supabase migration path
- [ ] Add real QR code library (qrcodejs) and test gifting flow end-to-end
- [ ] Build kiosk return flow simulation with SoC input and net consumption display
- [ ] Add "My Credits & Gifts" dashboard with live data
- [ ] Implement device lookup + add to profile functionality
- [ ] Add rate limiting + anti-abuse logic testing
- [ ] Create basic admin/kiosk dashboard for testing returns and gifts

## Backend / Infrastructure
- [ ] Deploy all Edge Functions to Supabase
- [ ] Set up proper RLS policies testing
- [ ] Add auth trigger and test auto rider creation
- [ ] Implement energy_transactions and gift reconciliation logic
- [ ] Add push notification backend (VAPID + sending worker)
- [ ] Set up storage for media (geocache notes)

## Hardware & Kiosk
- [ ] Define kiosk hardware requirements (inverters, BMS communication, cell balancing)
- [ ] Prototype kiosk return/pickup flow with SoC reading
- [ ] Design grid-tie / bidirectional power capability
- [ ] Create initial BOM and supplier list for kiosks + modular packs

## Business & Fundraising
- [ ] Build full financial model in spreadsheet from outline
- [ ] Create investor pitch deck (problem, solution, market, traction, team, ask)
- [ ] Refine cap table and founder equity split
- [ ] Prepare data room (IP filings plan, financials, technical docs)
- [ ] Identify target investors (climate tech, mobility, infrastructure, utilities)

## Legal & IP
- [ ] File provisional patent(s) on core inventions (modular interface, kiosk balancing + grid feedback, gifting protocol)
- [ ] Review and file for trademarks (FloatMaps, OPEV)
- [ ] Draft terms of service and privacy policy
- [ ] Consider entity formation (Delaware C-Corp)

## Go-to-Market & Pilot
- [ ] Finalize Greenville pilot scope and timeline
- [ ] Identify initial kiosk locations and permitting path
- [ ] Recruit pilot users (local PEV community)
- [ ] Define success metrics for pilot (user adoption, energy throughput, retention)

## Content & Documentation
- [ ] Update main README with current architecture and how to run locally
- [ ] Create onboarding guide for new developers/contributors
- [ ] Prepare one-pager for investors and partners

## Nice-to-Haves (Post-MVP)
- [ ] Integrate real 360 video upload and basic processing pipeline
- [ ] Build native mobile app shell (or PWA improvements)
- [ ] Add social features (friend connections, group rides)
- [ ] Explore partnerships with VESC / FloatControl / Floaty teams
# NeuronStack AI Demo MVP Plan

## Summary
Goal: turn the current static React/Babel prototype into a clean **demo MVP** focused on the core app flow: login, onboarding, dashboard shell, navigation, settings/tweaks, and reliable page interactions.

Current state: the project is mostly UI mockups with simulated data. It looks rich, but it has no real app structure, backend, persistence, routing, tests, or deployment setup.

Estimated time for one full-time solo developer: **7-10 working days** for a solid demo MVP.

A polished production SaaS version would be **8-14+ weeks**, because auth, backend, billing, database, security, APIs, and deployment all need real implementation.

## What Is Missing
- **Project foundation:** no `package.json`, no Vite/Next build setup, no component modules, no lint/test tooling.
- **Real persistence:** login, onboarding, settings, API keys, agents, images, and dashboards reset in memory.
- **Real backend:** no API server, database, auth service, billing, model routing, file upload, or image generation.
- **Routing:** page changes are internal state only, no browser URLs/deep links.
- **Reliability:** many buttons are visual only; some flows simulate success but do not save real data.
- **Testing/deployment:** no automated tests, no build command, no deploy target.
- **Text encoding cleanup:** several characters render incorrectly, such as arrows, multiplication signs, bullets, and copyright symbols.

## Key Changes
- Convert the app into a proper Vite React project while preserving the current design and UI.
- Split global JSX files into importable modules with a clear structure:
  - app shell and routing
  - shared UI components
  - pages
  - mock data/services
  - styles
- Add browser routing with stable paths:
  - `/login`
  - `/onboarding`
  - `/admin`
  - `/dashboard`
  - `/playground`
  - `/models`
  - `/agents`
  - `/settings`
  - and the existing sidebar pages.
- Add local demo persistence using `localStorage`:
  - auth/session state
  - onboarding completion
  - selected workspace
  - theme/tweaks
  - created API keys
  - created agents
- Make core actions actually affect UI state:
  - create API key adds a key to the table
  - create agent adds an agent card
  - logout clears session
  - onboarding saves workspace choices
  - settings save visible workspace values
- Clean broken encoded characters across visible UI.
- Add responsive fixes for dashboard tables, mobile sidebar, settings, and major grid pages.
- Keep AI/model/image features as realistic simulations for demo MVP, not real API integrations.

## Implementation Plan
1. **Project Setup, 0.5-1 day**
   - Add Vite React setup.
   - Move current HTML bootstrapping into React entry files.
   - Preserve `styles.css`.
   - Add `npm run dev`, `npm run build`, and `npm run preview`.

2. **App Architecture, 1-1.5 days**
   - Replace global `Object.assign(window, ...)` pattern with imports/exports.
   - Create app providers for auth, toast, confirm, tweaks, and demo data.
   - Keep UI behavior visually identical during migration.

3. **Routing And Core Flow, 1 day**
   - Add React Router.
   - Route unauthenticated users to login.
   - Route first-time users to onboarding.
   - Route onboarded users into the main shell.
   - Support sidebar navigation through real URLs.

4. **Demo Data Persistence, 1.5-2 days**
   - Create a local demo store backed by `localStorage`.
   - Persist workspace, user, onboarding, tweaks, agents, API keys, and basic settings.
   - Add reset/demo seed behavior so the app can be restored to a known demo state.

5. **Make Main Actions Work, 1.5-2 days**
   - API key creation creates a new masked key row.
   - Agent wizard creates a new agent card.
   - Workspace switcher stores active workspace.
   - Settings save values and show confirmation.
   - Profile logout returns to login.

6. **Polish And Bug Cleanup, 1-1.5 days**
   - Fix visible encoding issues.
   - Improve mobile/sidebar behavior.
   - Check key pages for overflow, table usability, modal sizing, and button states.
   - Remove or disable dead buttons where behavior is not part of the MVP.

7. **Testing And Demo Readiness, 1 day**
   - Add basic smoke tests for login, onboarding, dashboard navigation, create API key, create agent, and settings save.
   - Run production build.
   - Verify the app manually in desktop and mobile widths.

## Test Plan
- `npm run build` passes without errors.
- Login with password path reaches 2FA, then onboarding.
- Magic link simulation reaches onboarding.
- Onboarding saves workspace and enters app shell.
- Refresh keeps session, workspace, tweaks, and created demo data.
- Sidebar navigation updates URL and active page.
- Create API key adds a visible key.
- Create agent adds a visible agent.
- Logout returns to login and clears authenticated state.
- Mobile viewport shows usable navigation and no major overlapping text.

## Timeline
- **Frontend Polish only:** 3-5 working days.
- **Recommended Demo MVP:** 7-10 working days.
- **Production SaaS foundation:** 8-14+ weeks.
- **Full real AI platform:** 3-6+ months depending on billing, model provider integrations, voice, image/video generation, team roles, observability, and compliance needs.

## Assumptions
- Target is **Demo MVP**, not production SaaS.
- Priority is **core app flow first**.
- Estimate is for **one solo full-time developer**.
- Real AI APIs, billing, database, team permissions, and deployment automation are out of scope for this MVP unless added later.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TrueEarth Project Rules

## 1. State Management
- **Primary Store**: Use `src/store/useGlobalStore.ts` (Zustand) for all cross-component state (e.g., active layers, news feed, market tickers).
- **Persistence**: Certain UI states (like active tab) should be persisted via the store's middleware.
- **Performance**: Use selectors to prevent unnecessary re-renders.

## 2. Real-Time Data & Web Workers
- **High-Frequency Assets**: Satellites and vehicle positions MUST be processed in Web Workers located in `src/lib/workers/`.
- **Worker Communication**: Use the standardized `postMessage` protocol defined in the workers to minimize main-thread lag.
- **Polling**: Keep RSS fetching and ticker updates in the server-side API routes or background intervals, not tied to component mount cycles where possible.

## 3. Intelligence & News Feed
- **Verification Logic**: Every news item must pass through the `legitimacyScore` calculator in `src/lib/rss-sources.ts`.
- **Source Management**: Add new RSS sources to `src/lib/rss-sources.ts` using the `RSSSource` interface.
- **Categorization**: Use the `EventCategory` union type from `src/types/global.ts` for consistent filtering.

## 4. UI & Components
- **Theming**: Use the dark-mode, high-tech aesthetic. CSS modules or Vanilla CSS are preferred for maximum performance.
- **Asset Details**: Use the `AssetDetailsPopup` for all interactive map/globe entities.
- **Types**: Always import common interfaces from `src/types/global.ts`.

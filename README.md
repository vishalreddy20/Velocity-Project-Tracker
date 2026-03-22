# Velocity Project Tracker

Frontend assessment implementation for a multi-view project tracker built with React + TypeScript + Zustand.

## ✨ Live Features Implemented

### Core Views
- **Kanban View**: Drag-and-drop card-based status workflow with live presence overlays
- **List View**: Virtual-scrolled sortable table (500+ tasks) with inline status editing  
- **Timeline View**: Month-based Gantt visualization with today marker and due-date indicators

### Advanced UI Systems
- **Custom Drag-and-Drop** (zero external DnD libs): Card ghost preview, placeholder zones, drop-zone highlighting, snap-back animation on invalid drop
- **Live Virtual Scrolling**: From-scratch implementation with 5-row buffer, accurate scrollbar sync
- **Simulated Real-Time Collaboration**:
  - **Presence avatars** with animated transitions between cards
  - **Dynamic active-user count** (stable 2-3 users, with rare changes up to 4)
  - **Activity status encoding** (viewing vs editing modes per user)
  - **Stable simulation cadence** (2.5s interval updates)

### State & Sync
- **URL-synced filters**: Status, priority, assignee, due date range  
- **Query restoration**: Back/forward navigation preserves full UI state
- **Cross-view consistency**: All 3 views use shared Zustand store with optimized selectors

## Production-Grade Performance

### Lighthouse Certification
- **Desktop Target**: 85+ performance score
- **Achieved**: 100 (`score: 1` in JSON metrics)  
- **Report Files**:
  - JSON: [`docs/lighthouse-desktop.report.report.json`](docs/lighthouse-desktop.report.report.json)
  - HTML: [`docs/lighthouse-desktop.report.report.html`](docs/lighthouse-desktop.report.report.html)
  - Screenshot: [`docs/lighthouse-desktop.png`](docs/lighthouse-desktop.png)

### Run Command Used
```bash
npx lighthouse http://127.0.0.1:4173 \
  --preset=desktop \
  --only-categories=performance \
  --output=json --output=html \
  --output-path="./docs/lighthouse-desktop.report" \
  --chrome-flags="--headless=new --no-sandbox"
```

## Live Deployment (Pre-Submission)

To deploy before final submission, choose one:

### Option A: Vercel (Recommended)
```bash
npm install -g vercel
vercel deploy --prod
```

### Option B: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option C: GitHub Pages
1. Add to `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/velocity-tracker"
   ```
2. Install deployment tool:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Deploy:
   ```bash
   npm run build
   npm run deploy
   ```

**Live Demo**: https://guileless-pika-5391e0.netlify.app

## Setup & Development

### Prerequisites
- Node.js 18+
- npm/yarn

### Install
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Opens on `http://localhost:5173` by default (or next available port if occupied).

### Production Build
```bash
npm run build
npm run preview  # Test production build locally
```

### Type Checking
```bash
npm run typecheck  # or: npx tsc --noEmit
```

## Architecture Decisions

### State Management: Zustand
Zustand was chosen over Context API + useReducer because this UI has **cross-cutting presence + filter + sort + view state** that reads across independent components. Zustand:
- ✅ Avoids provider re-render cascades
- ✅ Enables fine-grained selectors per component
- ✅ Keeps update logic concentrated
- ✅ Integrates directly with URL sync (search params → store)

### Virtual Scrolling Algorithm
List view uses fixed-height rows (60px) with:
- **Visible window**: Only rows in viewport + 5-row buffer above/below
- **Absolute positioning**: Visible rows translated to calculated Y offset
- **Full-height spacer**: Preserves scrollbar proportions and scroll space
- **Performance**: O(1) render count vs O(n) with no virtualization

### Drag-and-Drop: Pointer Events Only
Custom implementation without external libs:
- **Grab phase**: Measure card bounds, capture pointer
- **Drag phase**: Floating ghost follows cursor, placeholder reserves source slot
- **Drop detection**: `elementFromPoint` locates drop-zone → status update
- **Snap-back**: Invalid drop triggers 180ms easing animation back to origin

### Presence Animation: RequestAnimationFrame + CSS Transitions
Avatar movement from card to card uses:
- **Phase 1 (RAF)**: Set avatar phase to 'start' with initial coords
- **Phase 2 (RAF)**: Flip phase to 'move' triggering CSS transition
- **Phase 3 (setTimeout)**: Remove component after transition completes  
- **Effect**: Smooth transition with automatic cleanup

## Key Implementation Files

| File | Purpose |
|------|---------|
| `src/store/useTrackerStore.ts` | Zustand store (tasks, filters, presence, view state) |
| `src/hooks/useUrlFilters.ts` | Parse/serialize query params ↔ internal state |
| `src/hooks/usePresenceSimulation.ts` | Presence user state + dynamic join/leave cycles |
| `src/hooks/useCollaborationSimulation.ts` | Activity indicators, typing sim, conflict detection |
| `src/components/KanbanView.tsx` | Drag-drop, presence overlays, custom DnD engine |
| `src/components/ListView.tsx` | Virtual scrolling, sortable headers, inline edits |
| `src/components/TimelineView.tsx` | Month-based Gantt bars, today marker |
| `src/utils/taskSelectors.ts` | Filter/sort/group logic (pure functions) |
| `src/utils/date.ts` | Due-date formatting ("Due Today", "N days overdue", etc.) |

## Testing the Assessment

### Interaction Checklist
- [ ] Drag a card between Kanban columns
- [ ] Watch presence avatar animate from card to card  
- [ ] Switch views and confirm filters sync
- [ ] Use back button and see UI state restore
- [ ] Scroll List view with 500+ tasks (smooth, no lag)
- [ ] Open Timeline for this month
- [ ] Filter by priority → URL updates with `?priority=critical`
- [ ] Observe 2-4 active users cycling in/out

### Performance Validation
1. Open DevTools → Performance tab
2. Record 5-second session of dragging + scrolling  
3. Check FPS graph for sustained 60 FPS (no drops below 50)
4. Check Lighthouse: `npm run preview` then audit at `localhost:4173`

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ⚠️ IE 11: Not supported (ES2020 syntax, no polyfills)

## Explanation (150-250 words)

The hardest UI problem was balancing responsive interaction logic with render performance across three synchronized views sharing one state source. The most complex challenge was Kanban drag-and-drop: the card must feel physically attached to the cursor while the underlying column layout remains stable and scrollable during drag.

**Solution**: I separated visual drag feedback from data mutation. While dragging, a fixed-position ghost follows pointer coordinates and the source position is replaced with an exact-height placeholder. This prevents layout collapse and avoids jitter from frequent DOM reflow. Drop-zone detection is computed from pointer location rather than card overlap—keeping behavior predictable for both mouse and touch.

**Presence animations faced a similar challenge**: Moving a 22px avatar from one card to another while maintaining sight-lines across the board. I solved this with a two-phase RAF + CSS approach: capture start coordinates, request a frame to flip the animation phase, then let CSS transitions handle the smooth 600ms motion. This keeps animations GPU-accelerated and prevents UI thread blocking.

**Virtual scrolling** required careful math to keep the scrollbar representative while only rendering ~20 rows out of 500+. The key insight: absolute positioning + a full-height spacer preserves scroll behavior without actually rendering every row.

With more time, I would add **real WebSocket collaboration** (Yjs + LiveKit) for genuine multi-user editing, **E2E tests** for filter/sort state machines, and **analytics tracking** to verify production Lighthouse scores over time.


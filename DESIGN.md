# DevTinder App — Frontend Design

React 18 · Vite 5 · TypeScript · HeroUI + Tailwind 3 · React Router 6 · TanStack Query 5 · Zustand 5 · react-hook-form + zod · framer-motion / motion · socket.io-client · Vercel (SPA rewrite in `vercel.json`)

Backend contract: [`../dev-tinder-server/API.md`](../dev-tinder-server/API.md).

## Running

```bash
bun install
bun run dev      # http://localhost:5173
```

`.env`: `VITE_API_URL=http://localhost:5000`. Some calls still hard-code `localhost:5000` (`queries/chatQueries.ts`, `utils/socket.ts`, the Google button in `pages/login.tsx`).

## Folder layout

```
src/
  main.tsx                 QueryProvider → BrowserRouter → HeroUI Provider (+ Toasts) → App
  App.tsx                  routes + initial ["user"] query (boot spinner)
  pages/
    home.tsx               landing (hero + navbar)
    login.tsx, signup.tsx  auth forms (zod)
    dashboard.tsx          swipe feed (index of /dashboard)
    layouts/dashboardLayout.tsx   app shell: geolocation, socket, sidebar / bottom nav
    profile-view.tsx       own profile (mobile menu / desktop card)
    profile-edit.tsx       edit + preview tabs, photo upload, bottom drawer editors
    settings.tsx           logout
    connectionsPage.tsx    mobile: requests entry + chat list
    request-review.tsx     mobile: accept/reject + profile modal
    connection-profile-view.tsx   desktop: requester's profile
    chat.tsx               chat screen
    about/blog/docs/pricing/index.tsx   HeroUI template leftovers
  components/
    feed-card.tsx          draggable card + SlideDescription (shared preview text)
    profile-edit/*         EditAbout, EditGoal, EditSkills(+Dropdown), EditEssentials, ProfilePhotoUpload, CardHeader
    chat-header, chat-scroller, message-bubble, send-message-bar
    protected-route, public-route, navbar, Loader, no-chats, no-requests
  queries/                 axios calls + response types (profile.ts, chatQueries.ts, auth-queries.ts, types.ts)
  store/                   Zustand stores
  utils/                   helpers (cn, getAge, dates, photo fallbacks), socket factory, zod schema, constants
```

## Routing

| Path | Guard | Element |
|---|---|---|
| `/`, `/login`, `/signup`, `/about` | `PublicRoute` (redirects logged-in users to `/dashboard`) | Home / Login / Signup / Docs |
| `/dashboard` | `ProtectedRoute` (redirects to `/login`) | `DashboardLayout` → `Dashboard` |
| `/dashboard/profile` · `/profile/edit` · `/profile/settings` | protected | ProfileView / ProfileEdit / ProfileSettings |
| `/dashboard/connection/profile/:id` | protected | ConnectionProfileView (desktop) |
| `/dashboard/chat/:connectionId` | protected | Chat |
| `/dashboard/connections` · `/connections/review` | protected, **registered only when width ≤ 895px** | ConnectionsPage / RequestReview |
| `*` | — | NotFound |

Auth bootstrap: `App` runs `useQuery(userQueryOptions)` (`GET /profile`). On success, `getProfile` calls `authStore.login(user)`. A 401 anywhere in `handleApiRequest` sets `isAuthenticated=false`. After a successful login the client invalidates `["user"]`; the refetch flips the store, and `PublicRoute` redirects to the dashboard.

## State

### TanStack Query keys
| Key | Source | Used by |
|---|---|---|
| `["user"]` | `GET /profile` | App boot, ConnectionProfileView |
| `["feed"]` | `GET /user/feed?page=` | Dashboard, swipe mutation (optimistic `slice(1)`) |
| `["profile-completion"]` | `GET /profile/completion` | Dashboard gate (≥70%), ProfileView badge |
| `["request-received"]` | `GET /user/requests/received` | Layout sidebar, ConnectionsPage, RequestReview, ConnectionProfileView |
| `["user-connections"]` | `GET /user/connections` | Layout, copied into `connectionStore` |
| `["chatInfo", connectionId]` | `GET /chat/initilize/:id` | Chat |
| `["messages", chatId, cursor?, dir?]` | `GET /chat/:id/messages` | Chat (via `fetchQuery`) |
| `["chat-participant", userId]` | `GET /user/connection-profile/:id` | ChatHeader |

### Zustand stores (`src/store`)
| Store | Holds |
|---|---|
| `authStore` | `isAuthenticated`, `user`, `login/logout/changeAuthStatus`, `setLocation([lng,lat])` |
| `socketStore` | the single `Socket` instance |
| `connectionStore` | `userConnections`, `onlineUsers: Set<string>` |
| `notificationStore` | `newChatMessages: { [connectionId]: Message[] }`, which drives unread badges and the "Unread" anchor |
| `chatsStore` | `chats: { [chatId]: Message[] }`, with `initilizeChatMessages`, `addMessageToChatBefore/After`, `updateMessageOfChat` (swaps the temp id for the server id), `updateMessageStatus` |
| `sidebarStore` | `isFullModeActive`, which toggles the feed card into the expanded profile view |

## Key flows

### App shell (`DashboardLayout`)
1. It requests `navigator.geolocation`. If you deny it, a full-screen "Please Provide location service" message replaces the app.
2. With coordinates, it calls `createSocketConnection({lat,lng})` and stores the socket. It listens for `onlineFriends`, `friendOnline` and `friendOffline` and updates `connectionStore.onlineUsers`.
3. Once the socket connects, it pages through `fetchUnread` into `notificationStore` and sends `messageReceivedAck` for each message. It listens for `chatUpdate` and `messageDeliveredAck`.
4. On desktop (>895px) it shows the sidebar: a header (avatar / home, settings gear) and Requests / Chat tabs, with the `<Outlet>` centered. On mobile it shows a top title bar, the outlet, and a bottom nav (feed ★, chats with an unread badge, profile avatar).
5. The outlet context is `{ isFullModeActive, isBottomNavActive, geoLocation }`.

### Feed (`Dashboard` + `FeedCard`)
- The feed is gated on profile completion ≥ 70%. Below that, a chip links to the editor.
- The cards are stacked (`feed.map`). Each card is a `motion.div` you drag along the x axis: past +100px it sends `interested`, past −100px it sends `ignore`. Rotation and opacity follow the drag, and the ✕/♥ buttons grow as you drag toward them.
- Tapping cycles through photos, with progress bars at the top. `SlideDescription` changes its caption per slide: distance (geolib, from your stored coordinates) → about → skills (shared skills highlighted) → looking-for.
- The ⌃ button toggles full mode, which shows the read-only profile blocks: `EditGoal`, `EditEssentials`, `EditAbout`, `EditSkills`.

### Profile edit
- react-hook-form with `updateSchema` (zod). Tabs: **edit** / **preview**. Preview merges the current form values into a copy of the user.
- Photos use `react-dropzone`. New files are kept as `File` objects in the `pictures` field array and previewed with `createObjectURL`.
- Single-field editors (DOB DatePicker, gender radios, education, add skill) open in a bottom drawer.
- On submit: (1) upload the new `File`s to `/profile/upload-picture`, (2) combine them with the existing URLs, (3) `PATCH /profile` with `essentials.education`, (4) invalidate `["user"]`.

### Requests
- Desktop: the sidebar Requests tab has ✓ / ✕ buttons, and clicking a row opens `/dashboard/connection/profile/:id`, read from the `request-received` cache.
- Mobile: `/dashboard/connections` → "Cupid requests" → `RequestReview`, a list with accept/reject buttons and a profile modal. Accepting or rejecting removes the row optimistically.

### Chat
1. `chatinitData(connectionId)` returns the `chatId` and participants.
2. The first page loads `loadType=unread` if there are notifications for this connection, otherwise `recent`.
3. `ChatScroller` is a `flex-col-reverse` scroll container. Sentinel divs at the top and bottom use `useInView` to call `fetchBefore` / `fetchAfter` with the server's cursors.
4. In `MessageBubble`, an incoming unread message that scrolls into view emits `messageRead` and removes itself from notifications. It renders date dividers, an "Unread" divider, a tail on the last bubble in a run, and status ticks (🕒 → ✓ → ✓✓ → blue ✓✓).
5. `SendMessageBar` adds an optimistic message with a `nanoid` temp id, emits `sendMessage`, and swaps in the server message from the ack.

## Visual language
- Dark theme (HeroUI). `secondary-*` purple gradients for headers and panels, `primary` pink accents (`#FCADF9` glow), `bg-background` cards.
- Cards and profile views are a fixed-width column (`w-[20–25rem]`) on desktop and full width on mobile.
- Icons: Iconify (`@iconify/react`) and lucide-react. Animations: framer-motion springs on empty states and the drag-to-swipe card.
- Responsive breakpoint is **895px** (`useMediaQuery`), used in the layout, routes and toast placement.

## Dead / unused code
`utils/messageProcessor.ts`, `utils/socket-handlers.ts` (calls hooks outside a component, which would throw), `components/unread-message.tsx`, `components/profile-card.tsx`, `components/dropdown-content/*`, `components/profile-edit/{dropzone,remove-photo-button}.tsx`, `layouts/default.tsx`, `pages/{index,blog,docs,pricing}.tsx`, `pages/layouts/home-layout.tsx`, the `newData`/`messages` fixtures in `utils/constants.ts`, and `authStore.checkAuthStatus`.

---

Known issues and planned changes are tracked in [`../dev-tinder-server/progress.md`](../dev-tinder-server/progress.md).

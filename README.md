# Kerala School Finder

> **Discover government higher secondary schools in Kerala, with your post for transfer application.**

Kerala School Finder is a web app that helps teachers find Kerala government higher secondary schools based on location, preferences and their designation which could be used to create the list of schools for transfer application.

---

## How It Works
1. **Search:** Enter your location, select districts.
2. **Geocoding & Proximity:** The app geocodes your location to latitude/longitude, then finds nearby railway stations and schools for accurate results.
3. **Smart Processing:** The app fetches and filters government higher secondary schools using an optimized backend and caching for speed.
4. **Route Calculation:** For each school, routes and relevant info are fetched and displayed with minimal delay.
5. **Explore Results:** Review, sort and interact with school cards—each showing details and route.

---

## Tech Stack
- **Framework:** Next.js (App Router, Server Components)
- **Language:** TypeScript
- **backend:** Supabase
- **Routing Intelligence:** Gemini API

---

## Getting Started
```bash
pnpm install
pnpm run dev
```

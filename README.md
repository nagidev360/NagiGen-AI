# NagiGen AI

AI image studio starter: Next.js website + Expo Android client.

## Features in this starter
- Prompt-to-image generation through a server-side API route
- Realistic, Anime, Logo, Poster, 3D and Watercolor prompt styles
- Square, portrait and landscape image sizes
- Responsive dark UI and image download
- Expo Android starter that calls the same API
- Supabase SQL schema for future user generation history

## Run website locally
Requirements: Node.js 20+.
```bash
cd web
cp .env.example .env.local
# Add your image provider key to .env.local
npm install
npm run dev
```
Open http://localhost:3000. Without `OPENAI_API_KEY`, generation returns a setup error rather than a fake image.

## Run Android client
```bash
cd mobile
npm install
cp .env.example .env
npx expo start
```
Set `EXPO_PUBLIC_API_BASE_URL` to your running website API. Android emulator: `http://10.0.2.2:3000`. A physical phone needs your computer's LAN IP.

## Deploy
- Website: deploy the `web` folder on Vercel or Render.
- Add `OPENAI_API_KEY` as a server-side environment variable. Never expose it as a `NEXT_PUBLIC_*` or `EXPO_PUBLIC_*` value.
- Android installable build: use Expo EAS Build: https://docs.expo.dev/build/setup/

## Important
This is an MVP starter, not a production-complete subscription service. Supabase login, image storage/history integration, usage limits, payments, moderation, and monitoring must be implemented before public launch. API usage may incur charges.

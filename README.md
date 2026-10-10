# NagiGen AI

AI image studio MVP: Next.js website + Expo Android client.

## Included
- AI image generation using a server-side OpenAI Images API route
- Realistic, Anime, Logo, Poster, 3D and Watercolor styles
- Square, portrait and landscape output sizes
- Responsive website and image download
- Optional Supabase email/password sign-up and sign-in
- Signed-in users can save images to Supabase Storage and revisit recent history
- Expo Android starter client using the same generation API
- GitHub Actions build workflow and Render Blueprint

## Website setup
Requirements: Node.js 20+.
```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```
Open http://localhost:3000. Set `OPENAI_API_KEY` in `.env.local` for image generation. The API key must stay server-side.

### Enable accounts and history
1. Create a Supabase project.
2. Run `supabase/schema.sql` in its SQL Editor.
3. Copy the project URL and anon/public key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Add the same two variables to the website hosting environment and redeploy.
5. In Supabase Authentication, configure email sign-up/confirmation settings and your site's allowed redirect URLs.

Without Supabase values, image generation still works, but account/history features stay disabled. Never put a Supabase service-role key in browser-visible variables.

## Android setup
```bash
cd mobile
npm install
cp .env.example .env
npx expo start
```
Set `EXPO_PUBLIC_API_BASE_URL` to the deployed website URL. Android emulator can use `http://10.0.2.2:3000`; a physical phone needs your computer's LAN IP. Build an installable Android package using Expo EAS Build: https://docs.expo.dev/build/setup/

## Deployment
Deploy the `web` folder on Render or Vercel. Configure `OPENAI_API_KEY`, `IMAGE_MODEL`, and the optional Supabase public variables in hosting settings. Image API use can incur charges.

## Not yet production complete
Premium payments, free-tier quotas, provider-independent open-source generation, image editing, anti-abuse rate limits, operational monitoring, and a signed Android release still need implementation/testing before a public launch.

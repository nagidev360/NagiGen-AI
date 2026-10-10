# NagiGen AI

AI image studio for web and Android. The website uses Next.js; the Android client uses Expo React Native. Both call the same server-side image-generation API, so the OpenAI secret is never bundled into the client app.

## Features
- Prompt-to-image generation using the OpenAI Images API
- Realistic, Anime, Logo, Poster, 3D, and Watercolor styles
- Square, portrait, and landscape output
- Responsive web interface and image download
- Optional Supabase email/password accounts and saved generation history
- Android client with style/size choices and save-to-photos support
- Server-side input validation, request timeout, clear provider errors, and a basic per-process request limit
- GitHub Actions build check and Render deployment blueprint

## Website: local setup
Requirements: Node.js 20+.
```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```
Open http://localhost:3000. Put your API key in `web/.env.local` as `OPENAI_API_KEY=...`. Keep it server-side; never prefix it with `NEXT_PUBLIC_`.

## Android: local setup
Requirements: Node.js 20+, Expo Go for development.
```bash
cd mobile
cp .env.example .env
npm install
npx expo start
```
Set `EXPO_PUBLIC_API_BASE_URL` to your deployed website URL. Android emulator default `http://10.0.2.2:3000` is for a local development server only; a physical phone needs your computer's LAN IP. For a public app, use HTTPS.

## Build an Android APK with EAS
1. Install and sign in: `npm install -g eas-cli`, then `eas login`.
2. From `mobile/`, run `eas build:configure` and follow its prompts.
3. Replace the placeholder EAS project ID in `app.json` with the ID EAS gives you, or remove `extra.eas.projectId` before running configuration.
4. Run `eas build --platform android --profile preview` to create an installable APK. Use `eas build --platform android --profile production` for a store-oriented build.
5. Download the APK from the EAS build page after the remote build succeeds. No APK is committed to this repository yet.

## Deploy the website on Render
Create a Web Service from this repository. Set root directory to `web`, build command `npm install && npm run build`, and start command `npm start`. Set:
- `OPENAI_API_KEY` (secret)
- `IMAGE_MODEL` (optional; default `gpt-image-1`)
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional, only for accounts/history)

The included `render.yaml` provides a starting blueprint. You must add secrets in the Render dashboard and complete deployment there. OpenAI API usage can incur charges and depends on account/model access.

## Optional accounts and history
1. Create a Supabase project.
2. Run `supabase/schema.sql` in its SQL Editor.
3. Configure the two public Supabase environment variables in the website host.
4. Configure email confirmation and allowed redirect URLs in Supabase Auth.

Do not expose a Supabase service-role key. The schema uses row-level security to restrict generation records and uploads by user. The storage bucket is public for displaying saved image URLs, so only store images you are comfortable serving publicly.

## Production readiness notes
The built-in request limit is best-effort and resets when the server process restarts; it is not a substitute for a shared rate limiter, bot protection, quotas, billing controls, or monitoring on a public multi-instance service. Add those before opening access broadly. Premium payments, full image editing, abuse review, and store signing/release management are not included. Validate all provider charges and mobile permission behavior with your own credentials and devices.

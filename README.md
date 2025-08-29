# Ranked Voting App

## Quick start

1. Install deps:
   npm install

2. (Optional) set environment variables:
   ADMIN_USER, ADMIN_PASSWORD, FRONTEND_URL, CORS_ORIGIN

3. Start backend:
   npm start

4. Serve frontend files (e.g. `npx serve frontend`) or deploy to Netlify.

## Generate tokens CSV offline
   npm run generate-csv

## Notes
- Replace API_URL placeholders in frontend with your deployed backend URL.
- Tokens are stored in backend/tokens.json; votes in backend/votes.json.
- For production, set ADMIN_USER/ADMIN_PASSWORD and CORS_ORIGIN securely.


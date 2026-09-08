// Vercel serverless entry point. Every /api/* request is rewritten here by
// vercel.json, and the Express app routes it from there.
export { default } from "../server/src/app.js";

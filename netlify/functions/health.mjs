import { denied, json } from '../lib/auth.mjs';
export default async (req) => {
  const d = denied(req);
  return json({
    tts: !!process.env.ELEVENLABS_API_KEY,
    img: !!process.env.FAL_KEY,
    plan: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_BASE_URL),
    needCode: !!process.env.APP_CODE,
    codeOk: !d,
  });
};
export const config = { path: '/api/health' };

import { denied, json } from '../lib/auth.mjs';
// Lista las voces de tu cuenta de ElevenLabs (para elegir voces argentinas de la biblioteca).
export default async (req) => {
  const d = denied(req); if (d) return d;
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return json({ error: 'Falta ELEVENLABS_API_KEY' }, 503);
  const r = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': key } });
  if (!r.ok) return json({ error: 'No pude leer tus voces (' + r.status + ')' }, r.status);
  const j = await r.json();
  return json({ voices: (j.voices || []).map(v => ({ id: v.voice_id, name: v.name, labels: v.labels || {}, cat: v.category })) });
};
export const config = { path: '/api/voices' };

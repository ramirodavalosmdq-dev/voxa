import { denied, json } from '../lib/auth.mjs';
// Voz humana con ElevenLabs + tiempos por letra (para mover la boca exacto).
export default async (req) => {
  const d = denied(req); if (d) return d;
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return json({ error: 'Falta ELEVENLABS_API_KEY en Netlify' }, 503);
  let b; try { b = await req.json(); } catch { return json({ error: 'JSON inválido' }, 400); }
  const text = String(b.text || '').slice(0, 2500);
  const voiceId = String(b.voiceId || '').replace(/[^A-Za-z0-9]/g, '');
  if (!text.trim() || !voiceId) return json({ error: 'Falta texto o voz' }, 400);
  const model = /^[a-z0-9_]+$/.test(b.model || '') ? b.model : 'eleven_multilingual_v2';
  const s = b.settings || {};
  const voice_settings = {
    stability: num(s.stability, .38, 0, 1),
    similarity_boost: num(s.similarity_boost, .8, 0, 1),
    style: num(s.style, .45, 0, 1),
    use_speaker_boost: true,
    speed: num(s.speed, 1, .7, 1.2),
  };
  const body = { text, model_id: model, voice_settings, language_code: 'es' };
  if (model === 'eleven_multilingual_v2' || model.startsWith('eleven_turbo') || model.startsWith('eleven_flash')) {
    if (b.prev) body.previous_text = String(b.prev).slice(-400);
    if (b.next) body.next_text = String(b.next).slice(0, 400);
  }
  const call = (bd) => fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify(bd) });
  let r = await call(body);
  if (r.status === 400 || r.status === 422) { // algunos modelos no aceptan todos los parámetros: reintento simple
    delete body.language_code; delete body.previous_text; delete body.next_text; r = await call(body);
  }
  if (!r.ok) {
    let msg = await r.text(); try { const j = JSON.parse(msg); msg = j.detail?.message || j.detail?.status || j.detail || msg; } catch {}
    return json({ error: String(msg).slice(0, 300) }, r.status);
  }
  const j = await r.json();
  return json({ audio: j.audio_base64, al: j.alignment || j.normalized_alignment || null });
};
function num(v, def, lo, hi) { v = Number(v); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : def; }
export const config = { path: '/api/tts' };

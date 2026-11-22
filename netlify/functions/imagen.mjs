import { denied, json } from '../lib/auth.mjs';
// Genera una ilustración rápida con FLUX schnell (fal.ai) cuando no hay foto real.
export default async (req) => {
  const d = denied(req); if (d) return d;
  const key = process.env.FAL_KEY;
  if (!key) return json({ error: 'Falta FAL_KEY' }, 503);
  let b; try { b = await req.json(); } catch { return json({ error: 'JSON inválido' }, 400); }
  const prompt = String(b.prompt || '').slice(0, 800);
  if (!prompt.trim()) return json({ error: 'Falta descripción' }, 400);
  const r = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST', headers: { Authorization: 'Key ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image_size: 'landscape_4_3', num_inference_steps: 4, num_images: 1, enable_safety_checker: true }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return json({ error: String(j.detail?.[0]?.msg || j.detail || 'Error de fal.ai').slice(0, 200) }, r.status);
  return json({ url: j.images?.[0]?.url || null });
};
export const config = { path: '/api/imagen' };

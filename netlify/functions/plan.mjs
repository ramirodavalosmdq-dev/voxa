import { GoogleGenAI } from '@google/genai';
import { denied, json } from '../lib/auth.mjs';
// Lee el texto completo y decide qué imagen mostrar en cada escena (usa la IA de Netlify, sin cuentas extra).
const MODELS = [process.env.PLAN_MODEL, 'gemini-3.8-flash', 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'].filter(Boolean);
export default async (req) => {
  const d = denied(req); if (d) return d;
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GEMINI_BASE_URL) return json({ error: 'IA de Netlify no activa' }, 503);
  let b; try { b = await req.json(); } catch { return json({ error: 'JSON inválido' }, 400); }
  const scenes = (b.scenes || []).slice(0, 60).map(s => String(s).slice(0, 600));
  if (!scenes.length) return json({ scenes: [] });
  const style = b.style === 'historia'
    ? 'oil painting or vintage engraving style, warm sepia tones, museum quality, historically accurate'
    : 'cinematic photorealistic still, dramatic soft lighting, rich detail';
  const prompt = `Sos el director de arte de un narrador visual. Para cada escena numerada de este texto en español, devolvé qué imagen mostrar de fondo mientras se narra.
Devolvé SOLO JSON: {"scenes":[{"i":0,"wiki_es":"...","wiki_en":"...","prompt":"..."}, ...]} con una entrada por escena, en orden.
- wiki_es / wiki_en: búsqueda corta (2 a 5 palabras) para encontrar en Wikipedia una FOTO o PINTURA REAL de la persona, lugar, objeto, obra o evento concreto que se menciona en esa escena (por ejemplo "Batalla de Maipú", "José de San Martín", "Torre Eiffel"). Si la escena es abstracta o no menciona nada real y concreto, dejalas vacías "".
- prompt: en inglés, una descripción visual concreta de la escena para generar una ilustración (sujeto, lugar, época, ambiente), estilo: ${style}. Sin texto ni letras en la imagen. Máximo 45 palabras.
Usá el contexto de todo el texto para que la época y el lugar sean coherentes entre escenas.

${scenes.map((s, i) => `[${i}] ${s}`).join('\n')}`;
  const ai = new GoogleGenAI({});
  let last;
  for (const model of MODELS) {
    try {
      const r = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json', temperature: 0.4 } });
      const t = (r.text || '').trim().replace(/^```json|```$/g, '');
      const j = JSON.parse(t);
      return json({ scenes: Array.isArray(j) ? j : (j.scenes || []), model });
    } catch (e) { last = e; }
  }
  return json({ error: String(last?.message || last).slice(0, 300) }, 502);
};
export const config = { path: '/api/plan' };

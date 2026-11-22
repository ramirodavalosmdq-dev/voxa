# VOXA · Lector holográfico 3D

Pegás un texto, tocás **HABLAR** y un personaje 3D (androide o anciano sabio) se materializa y lo lee con voz humana,
moviendo la boca sincronizada con el audio, mientras alrededor aparecen imágenes de lo que se está contando.

## Variables de entorno (Netlify → Project configuration → Environment variables)

| Variable | Obligatoria | Para qué |
|---|---|---|
| `ELEVENLABS_API_KEY` | Sí | Voces humanas (ElevenLabs) |
| `FAL_KEY` | No | Ilustraciones con IA cuando no hay foto real (fal.ai, FLUX schnell) |
| `APP_CODE` | Recomendada | Código de acceso para que nadie más gaste tus créditos |
| `PLAN_MODEL` | No | Modelo Gemini para planificar escenas (por defecto prueba varios) |

La planificación de escenas usa la **IA de Netlify (AI Gateway)**, sin cuentas extra: se activa sola después del primer deploy de producción.
Las fotos reales salen de Wikipedia / Wikimedia Commons (gratis).

## Estructura
- `public/index.html` — la app (se genera desde `dev/src.html` + `dev/device.js` + `dev/bgs.js` + el modelo de cara).
- `netlify/functions/` — `tts` (voz + tiempos por letra), `voices`, `plan`, `imagen`, `health`.

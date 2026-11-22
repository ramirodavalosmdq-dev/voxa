# VOXA · Lector holográfico 3D

Pegás un texto, tocás **HABLAR** y un personaje 3D (androide o anciano sabio) se materializa y lo lee con voz humana,
moviendo la boca sincronizada con el audio, mientras alrededor aparecen imágenes de lo que se está contando.

Publicada con **GitHub Pages** (sin servidor). Las claves se cargan en **Ajustes → Claves** y quedan guardadas
solo en el navegador de cada dispositivo; nunca se suben al repositorio.

| Clave | Para qué | Dónde se saca |
|---|---|---|
| ElevenLabs | Voces humanas (obligatoria para la voz con IA) | elevenlabs.io → perfil → API Keys |
| fal.ai | Ilustraciones con IA cuando no hay foto real (opcional) | fal.ai → Dashboard → Keys |
| Gemini | Elegir qué imagen va en cada escena (opcional, tiene uso gratis) | aistudio.google.com → Get API key |

Sin claves funciona igual con la voz del dispositivo. Las fotos reales salen de Wikipedia / Wikimedia Commons.

## Desarrollo
`index.html` se genera con `python3 dev/build.py` a partir de `dev/src.html`, `dev/device.js`, `dev/bgs.js` y `dev/face.glb`.

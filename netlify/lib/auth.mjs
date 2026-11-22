// Si APP_CODE está definido en Netlify, las funciones piden ese código (evita que extraños gasten tus créditos).
export function denied(req){
  const code = process.env.APP_CODE;
  if(!code) return null;
  if((req.headers.get('x-voxa-code')||'') === code) return null;
  return Response.json({ error: 'Código de acceso incorrecto' }, { status: 401 });
}
export const json = (o, status=200) => Response.json(o, { status });

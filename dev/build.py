# Arma public/index.html a partir de las piezas de dev/
import base64, pathlib
d = pathlib.Path(__file__).parent
s = (d/'src.html').read_text()
s = s.replace('/*__DEVICE__*/', (d/'device.js').read_text()).replace('/*__BGS__*/', (d/'bgs.js').read_text())
s = s.replace('__GLB__', base64.b64encode((d/'face.glb').read_bytes()).decode())
(d.parent/'public'/'index.html').write_text(s)
print('ok', len(s))

#!/usr/bin/env python3
"""Descarga a assets/photos/ las fotos de Pexels usadas por el mockup.

Uso:
    python3 descargar_fotos.py
    python3 descargar_fotos.py --force

No requiere dependencias de terceros.
"""
from pathlib import Path
import argparse, json, urllib.request, time, sys

HERE=Path(__file__).resolve().parent
manifest=json.loads((HERE/'assets/image_manifest.json').read_text(encoding='utf-8'))
parser=argparse.ArgumentParser()
parser.add_argument('--force',action='store_true',help='Volver a descargar fotos existentes')
args=parser.parse_args()
failed=[]
for n,(key,data) in enumerate(manifest.items(),1):
    target=HERE/data['local']
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists() and target.stat().st_size>12000 and not args.force:
        print(f'[{n:02d}/{len(manifest)}] OK existente: {key}')
        continue
    url=data['cdn']
    last=None
    for attempt in range(3):
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; BA-Mockup/1.0)','Accept':'image/jpeg,*/*','Referer':'https://www.pexels.com/'})
            with urllib.request.urlopen(req,timeout=25) as r:
                raw=r.read()
                kind=r.headers.get('Content-Type','')
            if not raw.startswith(bytes.fromhex('ffd8ff')):
                raise ValueError(f'Recibido {kind} en vez de imagen JPEG')
            if len(raw)<12000:
                raise ValueError('Archivo sospechosamente pequeño')
            target.write_bytes(raw)
            print(f'[{n:02d}/{len(manifest)}] OK {key}: {len(raw)//1024} KB')
            last=None
            break
        except Exception as e:
            last=e
            time.sleep(.6*(attempt+1))
    if last:
        print(f'[{n:02d}/{len(manifest)}] ERROR {key}: {last}',file=sys.stderr)
        failed.append((key,data['source']))

print(f'\nFotos listas: {len(manifest)-len(failed)}/{len(manifest)}')
if failed:
    print('Verificá tu conexión o abrí las fuentes en el navegador:')
    for key,link in failed:
        print(f'  {key}: {link}')
    sys.exit(1)
print('Listo. Podés abrir index.html incluso sin conexión.')

from pathlib import Path
import json,re,subprocess,tempfile,urllib.parse
root=Path(__file__).resolve().parents[1]
html=list(root.rglob('*.html'))
bad=[];jsok=0;refcount=0;missing=[]
for p in html:
 s=p.read_text(encoding='utf-8-sig')
 if '\ufffd' in s:bad.append(p.relative_to(root).as_posix())
 for value in re.findall(r'''(?:href|src)=["']([^"']+)["']''',s):
  if value.startswith(('http:','https:','data:','#','mailto:','tel:','javascript:','blob:','//')) or '${' in value:continue
  path=urllib.parse.urlsplit(value).path
  if not path:continue
  target=p.parent/path
  refcount+=1
  if not target.exists():missing.append((p.name,value))
 for script in re.findall(r'<script([^>]*)>(.*?)</script>',s,re.S|re.I):
  attrs,body=script
  if 'src=' in attrs or 'application/json' in attrs or 'application/ld+json' in attrs or not body.strip():continue
  with tempfile.NamedTemporaryFile('w',suffix='.js',encoding='utf-8',delete=False) as f:
   f.write(body);tmp=f.name
  z=subprocess.run(['node','--check',tmp],text=True,capture_output=True,encoding="utf-8",errors="replace")
  Path(tmp).unlink(missing_ok=True)
  if z.returncode:bad.append((p.name,z.stderr[-300:]))
  jsok+=1
for p in root.glob('*.js'):
 z=subprocess.run(['node','--check',str(p)],text=True,capture_output=True,encoding="utf-8",errors="replace")
 if z.returncode:bad.append((p.name,z.stderr[-300:]))
m=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
for x in m['shortcuts']:
 if not (root/x['url'].replace('./','')).exists():bad.append(('manifest',x['url']))
print(json.dumps({'pages':len(html),'inline_scripts':jsok,'assets_checked':refcount,'missing':missing[:20],'bad':bad[:20],'cache':(root/'sw.js').read_text(encoding='utf-8').splitlines()[0]},ensure_ascii=True,indent=2))
if bad or missing:raise SystemExit(2)

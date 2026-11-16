import sys
src,dst,title=sys.argv[1],sys.argv[2],sys.argv[3]
s=open(src,encoding='utf8').read()
import re
for f in re.findall(r'<script src="([^"]+)"></script>',s):
    s=s.replace(f'<script src="{f}"></script>','<script>'+open(f,encoding='utf8').read()+'</script>')
s=re.sub(r'<title>.*?</title>',f'<title>{title}</title>',s)
open(dst,'w',encoding='utf8').write(s)

// إحداثيات الطاولات على المخطط (مساحة 1568×782)
const IMG_W = 1568, IMG_H = 782;
const TABLES = {
 74:[420,55],72:[468,55],70:[517,55],68:[566,55],66:[616,55],64:[665,55],
 63:[1081,58],65:[1130,58],67:[1180,58],69:[1230,58],71:[1279,58],73:[1328,58],
 62:[435,172],60:[435,238],58:[435,298],56:[435,352],54:[435,413],52:[435,473],50:[435,528],48:[435,583],
 32:[527,165],34:[527,228],36:[527,288],38:[527,342],40:[527,407],42:[527,465],44:[527,522],46:[527,577],
 30:[610,217],28:[610,280],26:[610,339],
 24:[616,441],22:[616,506],20:[616,572],
 4:[702,165],6:[702,368],
 18:[693,437],16:[693,500],14:[693,565],8:[775,437],10:[775,500],12:[775,565],
 3:[1036,170],5:[1036,370],
 7:[973,437],9:[973,500],11:[973,565],17:[1040,437],15:[1040,500],13:[1040,565],
 23:[1122,441],21:[1122,506],19:[1122,572],
 29:[1131,217],27:[1131,282],25:[1131,339],
 31:[1216,170],33:[1216,233],35:[1216,294],37:[1216,347],39:[1216,412],41:[1216,470],43:[1216,527],45:[1216,582],
 61:[1308,170],59:[1308,238],57:[1308,296],55:[1308,349],53:[1308,412],51:[1308,470],49:[1308,527],47:[1308,582]
};
// الطاولات الفردية = زياد، الزوجية = نغم
function ownerOf(t){ return t % 2 ? 'زياد محمد فتح الله' : 'نغم أشرف'; }
function capacityOf(t){ return t >= 63 ? 10 : t >= 43 ? 7 : 8; }

async function api(method, body){
  const r = await fetch('/api/guests',{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  if(!r.ok) throw new Error('خطأ في الحفظ');
  return r.json();
}
const NS='http://www.w3.org/2000/svg';
// يرسم المخطط داخل عنصر ويعيد SVG
function drawPlan(host, {onClick, guests={}, highlight=null}={}){
  host.innerHTML='';
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox',`0 0 ${IMG_W} ${IMG_H}`);
  const img=document.createElementNS(NS,'image');
  img.setAttribute('href','plan.png');img.setAttribute('width',IMG_W);img.setAttribute('height',IMG_H);
  svg.appendChild(img);
  if(highlight){ // تعتيم كل المخطط ماعدا الطاولة
    const dim=document.createElementNS(NS,'rect');
    dim.setAttribute('width',IMG_W);dim.setAttribute('height',IMG_H);dim.setAttribute('fill','rgba(255,255,255,.55)');
    svg.appendChild(dim);
  }
  for(const [t,[x,y]] of Object.entries(TABLES)){
    const g=document.createElementNS(NS,'g');g.setAttribute('class','tbl');
    const isH = highlight==t;
    const count=(guests[t]||[]).length;
    const r=document.createElementNS(NS,'rect');
    const w=isH?58:44,h=isH?58:44;
    r.setAttribute('x',x-w/2);r.setAttribute('y',y-h/2);r.setAttribute('width',w);r.setAttribute('height',h);r.setAttribute('rx',8);
    r.setAttribute('class','hit'+(isH?' hl':'')+(count?' has':''));
    g.appendChild(r);
    if(isH){
      const c=document.createElementNS(NS,'circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',46);c.setAttribute('class','pulse');g.appendChild(c);
    }
    if(count&&!isH){
      const b=document.createElementNS(NS,'text');b.setAttribute('x',x+20);b.setAttribute('y',y-14);b.setAttribute('class','badge');b.textContent=count;g.appendChild(b);
    }
    if(onClick) g.addEventListener('click',()=>onClick(+t));
    const ti=document.createElementNS(NS,'title');ti.textContent='طاولة '+t;g.appendChild(ti);
    svg.appendChild(g);
  }
  host.appendChild(svg);
  return svg;
}

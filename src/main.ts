const I18N={"en":{"view":"View","controls":"Controls","zin":"＋ Zoom in","zout":"－ Zoom out","reset":"↺ Reset view","params":"Parameters","iter":"Iterations","palette":"Palette","julia":"Julia","mandel":"Mandelbrot","juliacheck":"Julia set","zoom":"Zoom","hint":"scroll to zoom · drag to pan · click to center"},"de":{"view":"Ansicht","controls":"Steuerung","zin":"＋ Vergrößern","zout":"－ Verkleinern","reset":"↺ Ansicht zurücksetzen","params":"Parameter","iter":"Iterationen","palette":"Palette","julia":"Julia","mandel":"Mandelbrot","juliacheck":"Julia-Menge","zoom":"Zoom","hint":"scrollen zum Zoomen · ziehen zum Schwenken · klicken zum Zentrieren"}};
let lang=localStorage.getItem('lang')||'en';
const t=k=>I18N[lang][k]||k;
function applyLang(){document.documentElement.lang=lang;document.querySelectorAll('[data-i]').forEach(el=>el.textContent=t(el.dataset.i));document.querySelectorAll('.lang button').forEach(b=>b.classList.toggle('on',b.dataset.lang===lang));}
document.querySelectorAll('.lang button').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.setItem('lang',lang);applyLang();});

const cv=document.getElementById('cv'),ctx=cv.getContext('2d');const $=id=>document.getElementById(id);
let W,H,img;
const PALS=[
 ['#0b1020','#4dd8ff','#b18cff','#ff6ec7'],
 ['#140b02','#ff8a80','#ffd479','#fff3e0'],
 ['#020b14','#4dd8ff','#5eead4','#e0faff'],
 ['#1a0512','#ff9ecb','#ffd479','#fff0f7']
];
let cx=-0.6,cy=0,scale=2.8,fractal='mandel',iter=250,pal=0,jx=0.285,jy=0.01,drag=null,moved=false;
function resize(){const r=cv.parentElement.getBoundingClientRect();W=cv.width=r.width*devicePixelRatio;H=cv.height=r.height*devicePixelRatio;render();}
addEventListener('resize',resize);resize();
function hue(t,p){const c=PALS[p];const i=Math.floor(t*(c.length-1));const f=t*(c.length-1)-i;return lerp3(c[i],c[Math.min(i+1,c.length-1)],f);}
function lerp3(a,b,f){const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16);const r=((pa>>16)&255)+(((pb>>16)&255)-((pa>>16)&255))*f|0,g=((pa>>8)&255)+(((pb>>8)&255)-((pa>>8)&255))*f|0,bl=(pa&255)+((pb&255)-(pa&255))*f|0;return 'rgb('+r+','+g+','+bl+')';}
let rendering=false,renderDirty=false;
async function render(){
  if(rendering){renderDirty=true;return;}
  rendering=true;
  img=ctx.createImageData(W,H);const d=img.data;
  const aspect=W/H;
  for(let y0=0;y0<H;y0+=48){
    const y1=Math.min(y0+48,H);
    for(let y=y0;y<y1;y++){
      const im=y/H-0.5;
      for(let x=0;x<W;x++){
        const re=cx+(x/W-0.5)*scale*aspect, im2=cy+im*scale;
        let zr=fractal==='julia'?jx:re, zi=fractal==='julia'?jy:im2, cr=fractal==='julia'?re:jx, ci=fractal==='julia'?im2:jy;
        let n=0;
        while(n<iter&&zr*zr+zi*zi<4){const t=zr*zr-zi*zi+cr;zi=2*zr*zi+ci;zr=t;n++;}
        const o=(y*W+x)*4;
        if(n>=iter){d[o]=8;d[o+1]=8;d[o+2]=20;d[o+3]=255;}
        else{const t=n/iter;const c=hue(Math.pow(t,0.6),pal);const m=c.match(/\d+/g);d[o]=+m[0];d[o+1]=+m[1];d[o+2]=+m[2];d[o+3]=255;}
      }
    }
    ctx.putImageData(img,0,0);
    await new Promise(r=>setTimeout(r,0));
  }
  rendering=false;
  $('zoom').textContent=(2.8/scale).toFixed(0)+'×';
  if(renderDirty){renderDirty=false;render();}
}
$('iter').oninput=e=>{iter=+e.target.value;render();};
$('pal').onchange=e=>{pal=+e.target.value;render();};
document.querySelectorAll('[data-fractal]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('[data-fractal]').forEach(x=>x.style.opacity=.5);
  b.style.opacity=1;fractal=b.dataset.fractal;
  $('julialbl').style.display=fractal==='julia'?'flex':'none';
  cx=-0.6;cy=0;scale=2.8;jx=0.285;jy=0.01;render();
});
$('julia-mode').onchange=e=>{const on=e.target.checked;
  if(on){fractal='julia';$('julialbl').style.display='flex';}else{fractal='mandel';}
  document.querySelectorAll('[data-fractal]').forEach(x=>x.style.opacity=.5);
  document.querySelector('[data-fractal="'+fractal+'"]').style.opacity=1;
  cx=-0.6;cy=0;scale=2.8;render();};
function zoom(f){scale*=f;render();}
$('zoom-in').onclick=()=>zoom(0.5);$('zoom-out').onclick=()=>zoom(2);
$('reset').onclick=()=>{cx=-0.6;cy=0;scale=2.8;render();};
cv.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?1.15:0.87);},{passive:false});
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,cx,cy};moved=false;});
cv.addEventListener('pointermove',e=>{if(!drag)return;moved=true;const r=cv.getBoundingClientRect();cx=drag.cx-(e.clientX-drag.x)/r.width*scale*(W/H);cy=drag.cy+(e.clientY-drag.y)/r.height*scale;render();});
cv.addEventListener('pointerup',e=>{if(drag&&!moved){const r=cv.getBoundingClientRect();cx+=(e.clientX-r.left)/r.width*scale*(W/H)-scale*(W/H)/2;cy-=((e.clientY-r.top)/r.height-0.5)*scale;render();}drag=null;});
$('julia-mode').checked=true;
render();applyLang();
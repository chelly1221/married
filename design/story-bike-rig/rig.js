(() => {
'use strict';
const ns='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id);
const make=(tag,attrs,parent)=>{const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);parent.appendChild(e);return e;};
const hip={x:181,y:179},crank={x:200,y:274},radius=25,thigh=59,shin=65;
const wheels=[];
for(const[x,y]of[[124,267],[310,267]]){
 const g=make('g',{},$('wheels'));
 make('circle',{cx:x,cy:y,r:51.5,fill:'#f4efe6',stroke:'#39352d','stroke-width':6.5},g);
 make('circle',{cx:x,cy:y,r:50.2,fill:'none',stroke:'#9d9381','stroke-width':1.4},g);
 make('circle',{cx:x,cy:y,r:47.8,fill:'none',stroke:'#716858','stroke-width':.8},g);
 const spokes=make('g',{},g);wheels.push({el:spokes,x,y});
 for(let i=0;i<20;i++){
  const a=i*Math.PI/10;make('path',{d:`M${x+Math.cos(a+.3)*5} ${y+Math.sin(a+.3)*5}L${x+Math.cos(a)*47.5} ${y+Math.sin(a)*47.5}`,stroke:i%2?'#c5bba9':'#b6ab97','stroke-width':.75},spokes);
 }
 make('circle',{cx:x,cy:y,r:4.3,fill:'#a38c6b',stroke:'#483d2d','stroke-width':1.5},g);
}
for(let i=0;i<8;i++){
 const a=i*Math.PI/4;make('circle',{cx:200+Math.cos(a)*10,cy:274+Math.sin(a)*10,r:2.6,fill:'#39362e'},$('chainring'));
}
function legGroup(parent,far){
 const arm=make('path',{fill:'none',stroke:far?'#655845':'#8b7d66','stroke-width':3.3,'stroke-linecap':'round'},parent);
 const pedal=make('path',{fill:'none',stroke:'#302d27','stroke-width':3.4,'stroke-linecap':'round'},parent);
 const outline=make('path',{fill:'none',stroke:'#382f27','stroke-width':24,'stroke-linejoin':'round','stroke-linecap':'round'},parent);
 const fabric=make('path',{fill:'none',stroke:far?'url(#far-pants)':'url(#pants)','stroke-width':21,'stroke-linejoin':'round','stroke-linecap':'round'},parent);
 const texture=make('path',{fill:'none',stroke:'url(#cloth)','stroke-width':20,'stroke-linejoin':'round','stroke-linecap':'round'},parent);
 const seam=make('path',{fill:'none',stroke:far?'#74624d':'#99836a','stroke-width':.65,opacity:.45},parent);
 const shoe=make('path',{fill:far?'#d8cbb4':'#ebe0cc',stroke:'#796a52','stroke-width':1.1,'stroke-linejoin':'round'},parent);
 const sole=make('path',{fill:'none',stroke:far?'#9f8f73':'#c4b495','stroke-width':1.2},parent);
 const laces=make('path',{fill:'none',stroke:'#baac93','stroke-width':.8},parent);
 return {arm,pedal,outline,fabric,texture,seam,shoe,sole,laces};
}
const far=legGroup($('far-leg'),true),near=legGroup($('near-leg'),false);
function solve(theta){
 const pedal={x:crank.x+radius*Math.cos(theta),y:crank.y+radius*Math.sin(theta)};
 const ankle={x:pedal.x-9,y:pedal.y-12};
 const dx=ankle.x-hip.x,dy=ankle.y-hip.y,d=Math.hypot(dx,dy);
 if(d>=thigh+shin||d<=Math.abs(thigh-shin))throw new Error('Unreachable pedal position');
 const a=(thigh*thigh-shin*shin+d*d)/(2*d),height=Math.sqrt(thigh*thigh-a*a);
 const knee={x:hip.x+dx*a/d+dy*height/d,y:hip.y+dy*a/d-dx*height/d};
 return {hip,knee,ankle,pedal};
}
function drawLeg(group,pose){
 const {knee:k,ankle:a,pedal:p}=pose;
 const path=`M${hip.x} ${hip.y}L${k.x} ${k.y}L${a.x} ${a.y-3}`;
 for(const e of[group.outline,group.fabric,group.texture])e.setAttribute('d',path);
 group.seam.setAttribute('d',`M${hip.x+5} ${hip.y+2}L${k.x+5} ${k.y}L${a.x+3} ${a.y-5}`);
 group.arm.setAttribute('d',`M200 274L${p.x} ${p.y}`);
 group.pedal.setAttribute('d',`M${p.x-9} ${p.y+1}H${p.x+11}`);
 const x=a.x,y=a.y;
 group.shoe.setAttribute('d',`M${x-8} ${y-5}Q${x-1} ${y-3} ${x+5} ${y-5}L${x+10} ${y+1}Q${x+12} ${y+4} ${x+20} ${y+6}Q${x+25} ${y+8} ${x+24} ${y+11}Q${x+9} ${y+14} ${x-7} ${y+10}Z`);
 group.sole.setAttribute('d',`M${x-7} ${y+8}Q${x+9} ${y+12} ${x+23} ${y+9}`);
 group.laces.setAttribute('d',`M${x+3} ${y}l6 -1m-3 4l6 -1m-3 4l6 -1`);
}
function render(phase){
 const angle=phase*Math.PI*2;
 const a=solve(angle),b=solve(angle+Math.PI);
 drawLeg(far,b);drawLeg(near,a);
 for(const w of wheels)w.el.setAttribute('transform',`rotate(${phase*720} ${w.x} ${w.y})`);
 $('chainring').setAttribute('transform',`rotate(${phase*360} 200 274)`);
 const frame=Math.min(8,Math.floor(phase*9));
 $('old').style.transform=`translate(${-frame%3*100/3}%, ${-Math.floor(frame/3)*100/3}%)`;
 $('skeleton').setAttribute('d',`M181 179L${a.knee.x} ${a.knee.y}L${a.ankle.x} ${a.ankle.y}L${a.pedal.x} ${a.pedal.y}L200 274`);
 for(const[id,p]of[['hip-dot',hip],['knee-dot',a.knee],['ankle-dot',a.ankle]]){ $(id).setAttribute('cx',p.x);$(id).setAttribute('cy',p.y);}
 $('phase').value=String(Math.round(phase*1000));$('progress').value=`${Math.round(phase*100)}%`;
 return {near:a,far:b};
}
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let playing=!preference.matches,phase=0,speed=1,last=0,raf=0;
function sync(){ $('play').textContent=playing?'일시정지':'재생';$('play').setAttribute('aria-pressed',String(playing)); }
function tick(now){if(last&&playing)phase=(phase+Math.min(now-last,100)*speed/2880)%1;last=now;render(phase);raf=playing?requestAnimationFrame(tick):0;}
function setPlaying(value){playing=value;sync();last=0;if(raf)cancelAnimationFrame(raf);raf=playing?requestAnimationFrame(tick):0;}
$('play').addEventListener('click',()=>setPlaying(!playing));
$('speed').addEventListener('change',e=>{speed=Number(e.target.value);});
$('joints').addEventListener('change',e=>$('overlay').classList.toggle('visible',e.target.checked));
$('phase').addEventListener('input',e=>{setPlaying(false);phase=Number(e.target.value)/1000;render(phase===1?0:phase);});
preference.addEventListener('change',e=>{if(e.matches)setPlaying(false);});
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0;}else if(!document.hidden&&playing&&!raf)raf=requestAnimationFrame(tick);});
window.bicycleRig={solve,render,setPlaying,constants:{hip,crank,radius,thigh,shin},get phase(){return phase;},get playing(){return playing;}};
render(0);setPlaying(playing);
})();

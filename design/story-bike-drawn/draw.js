/* Original Canvas drawing. Every outline, fill and texture is authored below.
   No source photograph, generated illustration, image API, or traced bitmap is used. */
(() => {
'use strict';
const PAPER='#f4efe6', INK='#443a30';
let c;
const rand = seed => () => {seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
function line(d,color=INK,width=1){c.strokeStyle=color;c.lineWidth=width;c.stroke(new Path2D(d));}
function ellipse(x,y,rx,ry,fill,stroke,width=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function shape(d,fill,box,seed=1,width=1.1){
 const p=new Path2D(d);c.fillStyle=fill;c.fill(p);
 if(box){c.save();c.clip(p);const r=rand(seed),[x,y,w,h]=box;const skin=['#edc8a1','#e4b88e','#e4b990','#e9c19a','#e6bf99'].includes(fill);
  // Fine pencil grain stays attached to the drawing, not randomized on each frame.
  for(let i=0;i<w*h/2;i++){const px=x+r()*w,py=y+r()*h,a=skin?.006+r()*.018:.012+r()*.055;c.strokeStyle=`rgba(49,38,24,${a})`;c.lineWidth=.25+r()*.5;c.beginPath();c.moveTo(px,py);c.lineTo(px+.5+r()*2,py-1+r()*2);c.stroke();}
  c.restore();
 }
 if(width){c.strokeStyle=INK;c.lineWidth=width;c.stroke(p);}
}
function wheel(x,y,phase){
 ellipse(x,y,53,53,PAPER,'#4c4437',5.8);ellipse(x,y,52,52,null,'#8c806b',1.15);ellipse(x,y,49.7,49.7,null,'#4d4436',.8);
 const a=phase*Math.PI*4;
 for(let i=0;i<28;i++){const theta=i*Math.PI/14+a;const sx=x+Math.cos(theta+.5)*5,sy=y+Math.sin(theta+.5)*5;line(`M${sx} ${sy}L${x+Math.cos(theta)*49} ${y+Math.sin(theta)*49}`,i%2?'#c2b6a0':'#b0a28a',.55);}
 ellipse(x,y,4.8,4.8,'#a69476','#504332',1.1);ellipse(x,y,1.5,1.5,'#65533c');
 line(`M${x-28} ${y-42}Q${x-47} ${y-22} ${x-49} ${y+5}`,'#b5a78d',.65);
}
const HIP={x:187,y:179}, CRANK={x:208,y:271}, R=24, U=58, L=64;
function pose(t){const pedal={x:CRANK.x+R*Math.cos(t),y:CRANK.y+R*Math.sin(t)},ankle={x:pedal.x-9,y:pedal.y-11};const dx=ankle.x-HIP.x,dy=ankle.y-HIP.y,d=Math.hypot(dx,dy),a=(U*U-L*L+d*d)/(2*d),h=Math.sqrt(U*U-a*a);return{hip:HIP,knee:{x:HIP.x+dx*a/d+dy*h/d,y:HIP.y+dy*a/d-dx*h/d},ankle,pedal};}
function leg(p,far){
 const {hip:h,knee:k,ankle:a,pedal:f}=p;
 line(`M208 271L${f.x} ${f.y}`,'#5e5140',3.7);line(`M208 270L${f.x} ${f.y-1}`,'#a18c6c',1);
 line(`M${f.x-10} ${f.y+1}L${f.x+11} ${f.y+1}`,'#42382d',3.5);
 // Anatomical tapered trouser silhouette, curved around the bent knee.
 const n1={x:-(k.y-h.y)/U,y:(k.x-h.x)/U},n2={x:-(a.y-k.y)/L,y:(a.x-k.x)/L};
 const v=(p,n,r)=>`${p.x+n.x*r} ${p.y+n.y*r}`;
 const d=`M${v(h,n1,14)} Q${v(h,n1,16)} ${v(k,n1,11)} Q${k.x+n1.x*11+n2.x*3} ${k.y+n1.y*11+n2.y*3} ${v(k,n2,10)} L${v(a,n2,7)} Q${a.x} ${a.y+2} ${v(a,n2,-7)} L${v(k,n2,-10)} Q${k.x-n1.x*11-n2.x*3} ${k.y-n1.y*11-n2.y*3} ${v(k,n1,-11)} L${v(h,n1,-14)}Z`;
 shape(d,far?'#615340':'#635744',[155,167,110,140],far?23:29,1.2);
 c.save();c.clip(new Path2D(d));
 line(`M${h.x+3} ${h.y+4}Q${k.x+3} ${k.y-6} ${a.x+3} ${a.y-4}`,far?'#807058':'#8e7b60',.7);
 line(`M${k.x-8} ${k.y-5}q8 3 12 -2m-11 6q6 3 10 0`,'#443a2e',.65);
 line(`M${h.x-8} ${h.y+8}q10 7 15 7`,'#41382b',.7);
 c.restore();
 // Small fabric cuff and a cream lace-up shoe, drawn in ankle-local coordinates.
 c.save();c.translate(a.x,a.y);
 shape('M-7 -5L7 -4 7 0 -7 0Z',far?'#4d4437':'#544b3d',[-8,-6,16,7],71,.7);
 shape('M-6 -1Q0 1 6 -2L11 3Q15 5 21 6Q26 8 24 11Q12 14 -7 10L-8 3Z',far?'#d9ccb4':'#eadfc9',[-9,-3,35,18],91,.95);
 line('M-7 8Q9 12 24 9','#a8987d',.8);line('M-4 0L-4 6M5 0L12 5M3 2l6 -1m-3 4l6 -1m-2 4l5 -1','#b1a084',.65);
 c.restore();
}
function bikeFrame(phase){
 const tube='M112 270L175 193 208 271 112 270M175 193L281 187 208 271M275 158L287 210 315 270';
 line(tube,'#44362b',7.2);line(tube,'#a75238',4.7);line('M114 267L175 193M177 192L278 186M211 268L281 189M289 211L315 267','#d39a75',.9);
 line('M175 193L171 181','#60513f',4);
 shape('M154 180Q169 176 191 181L190 185Q172 189 155 185Z','#534432',[154,176,38,13],11,1);
 line('M76 231Q84 218 99 217L137 218','#5e4934',4.1);line('M276 222Q307 204 334 217','#66513b',3.7);
 line('M84 208L157 208M89 208L112 270M151 208L131 242','#78634a',2);
 line('M112 265L208 259Q226 271 208 284L111 274Q104 270 112 265Z','#62523c',1.4);
 ellipse(208,271,16,16,'#6b5a42','#403528',1.6);
 for(let i=0;i<8;i++){const t=i*Math.PI/4+phase*Math.PI*2;ellipse(208+10*Math.cos(t),271+10*Math.sin(t),2.7,2.7,'#342f27');}
 ellipse(208,271,3.3,3.3,'#b09b78','#4a3d2c',.8);
 line('M280 158Q295 148 307 156Q315 172 292 216M279 161Q300 154 303 165Q303 186 287 204','#74644f',1.05);
 line('M273 154L282 149Q299 145 306 152','#4a4033',3.4);line('M274 153L282 148Q299 145 305 151','#af9470',1.25);
}
function bag(){
 shape('M87 199Q98 193 142 197L150 204 147 240Q129 250 90 244L84 220Z','#837055',[84,194,67,55],111,1.3);
 shape('M84 200Q110 190 146 198L151 207Q119 214 85 206Z','#9a8260',[83,193,68,22],114,1.1);
 shape('M96 206Q119 212 141 205L139 238Q117 244 98 238Z','#887456',[94,203,50,40],118,.8);
 for(const x of[101,134]){shape(`M${x} 195L${x+4} 196 ${x+3} 239 ${x-1} 239Z`,'#5c4a34',[x-2,194,8,48],x,.7);shape(`M${x-2} 215h8v9h-8Z`,'#b6a07b',[x-2,215,8,9],3,.8);line(`M${x+1} 216v7`,'#51442e',.7);}
 line('M92 236Q112 242 140 236','#655239',.65);
}
function body(){
 // Trouser waist anchored to the saddle. It sits beneath the fixed sweater hem.
 shape('M164 162Q180 164 195 162L203 176Q192 189 176 187L164 181Z','#5e503d',[162,159,45,32],51,1.15);
 // Back, torso and ribbed hem.
 shape('M206 94Q191 95 182 112Q173 127 163 152Q158 164 165 171Q181 176 197 169L214 151Q225 136 221 115L215 101Z','#e3d6ba',[158,93,68,83],131,1.3);
 shape('M164 164Q179 169 199 163L197 170Q181 177 165 171Z','#d8c9ab',[162,161,40,17],19,.65);
 for(let x=168;x<195;x+=3)line(`M${x} 168l-.2 4`,'#a99675',.45);
 line('M182 120Q178 136 166 150M172 151q8 5 15 2M172 158q8 4 18 0M193 107q-2 8 -5 10','#b8a482',.8);
 // Far sleeve and hand.
 shape('M212 109Q221 109 228 122L246 141 276 149 273 157Q251 157 237 150L215 133Z','#d6c7a9',[210,107,72,54],138,.95);
 shape('M270 148Q280 146 286 150L290 153 286 158Q281 156 278 154L273 157Z','#e6bf99',[268,144,26,17],91,.8);
 // Near shoulder and sleeve, with soft folds rather than a tube.
 shape('M200 109Q210 105 216 115L223 130Q237 143 265 147L274 151 271 160Q247 160 231 153Q216 147 207 136L196 124Z','#eadfc7',[194,105,84,58],139,1.2);
 line('M207 117Q208 128 217 135M217 142q7 1 9 -1M239 150q12 4 20 2','#b8a483',.8);
 shape('M262 145L273 149 271 160 260 157Z','#d5c3a2',[258,143,18,20],144,.7);
 for(let i=0;i<4;i++)line(`M${262+i*2} ${147+i*.4}l-1 9`,'#ad9875',.5);
 shape('M273 150Q279 148 285 152Q292 154 292 158L289 163Q285 163 283 157L279 156 280 162Q276 164 272 160Z','#e9c19a',[270,147,26,19],152,.95);
 line('M282 154l3 5m1 -6l3 6','#ba8966',.65);
 // Neck and a small knitted collar.
 shape('M209 83L208 100Q214 108 220 102L226 91Z','#e4b990',[206,82,24,28],161,1);
 line('M210 96q4 6 9 4','#c89770',.8);
 shape('M204 95Q209 103 218 105L216 110Q208 108 200 100Z','#d8c7a6',[199,94,22,18],162,.7);
 for(let i=0;i<5;i++)line(`M${203+i*2.5} ${99+i*1.3}l-1 3`,'#ab9471',.5);
}
function head(){
 // Profile with a gently projecting nose, rounded cheek, and a small warm smile.
 shape('M207 49Q220 37 237 46Q249 52 249 66L246 75Q248 79 251 81L248 84Q248 96 240 100Q229 104 217 91L208 81Q199 68 207 49Z','#edc8a1',[200,40,57,65],201,1.15);
 shape('M215 72Q208 65 205 74Q203 83 215 86Z','#e4b88e',[203,68,15,20],204,.8);
 line('M209 74q5 -2 4 6','#bd8e69',.75);
 ellipse(242,77,1.6,2.1,'#403127');line('M239 72q3 -2 5 0','#6c4a34',.8);
 line('M243 89q3 2 6 -1','#855339',.9);ellipse(239,86,3.6,1.7,'rgba(192,105,76,.16)');
 // Hair is an authored irregular silhouette with overlapping pencil strands.
 shape('M207 77Q200 71 201 63L197 65 200 53 197 55Q200 45 206 40L203 40Q212 31 222 33L221 30Q230 31 235 35L240 33 240 37Q249 38 253 45L256 46 253 48Q260 55 254 66L249 72 248 59Q244 65 238 66L240 56Q232 66 222 68L223 62Q218 69 215 74L214 81Z','#4b3c2f',[195,28,64,55],211,1.3);
 const strands=[
 'M203 58Q203 44 218 38','M207 55Q211 39 229 38','M207 66Q211 48 225 43','M214 60Q222 43 236 42','M223 60Q235 46 245 48','M232 58Q238 52 240 46','M244 55Q251 51 251 60','M208 42Q217 33 229 37','M230 36Q243 36 249 43','M203 64q2 7 6 10','M216 46q10 -9 18 -6','M218 65q5 -3 8 -9'];
 strands.forEach((d,i)=>line(d,i%3?'#71604b':'#382c23',i%3?.6:.75));
 line('M205 37q7 -5 16 -4M247 37q5 3 7 6','#66523e',.65);
}
function draw(canvas,index){
 c=canvas.getContext('2d');c.save();c.setTransform(canvas.width/432,0,0,canvas.height/352,0,0);c.clearRect(0,0,432,352);c.fillStyle=PAPER;c.fillRect(0,0,432,352);c.lineCap='round';c.lineJoin='round';
 const phase=((index%9)+9)%9/9,theta=phase*Math.PI*2+Math.PI/9;
 ellipse(218,326,149,2.3,'rgba(119,95,61,.08)');
 wheel(112,270,phase);wheel(315,270,phase);leg(pose(theta+Math.PI),true);bikeFrame(phase);leg(pose(theta),false);bag();body();head();
 c.restore();return{frame:((index%9)+9)%9,near:pose(theta),far:pose(theta+Math.PI)};
}
window.drawBicycleFrame=draw;window.bicycleGeometry={pose,HIP,CRANK,R,U,L};
})();

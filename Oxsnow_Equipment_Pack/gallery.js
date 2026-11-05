'use strict';
const grid=document.querySelector('#grid'),review=document.querySelector('#review'),dialog=document.querySelector('#lightbox');
let active='all';
const categories=[['all','All'],['cameras','Cameras'],['sound','Sound'],['accessories','Accessories'],['support','Support']];
const labels={standalone:'Standalone product view',promotional:'Supplied promotional image','rig-reference':'Rig reference · attachments shown; not hire inclusions','model-review':'Model identification required'};
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;}
function usable(row){return row.images.filter(x=>review.checked||['standalone','promotional'].includes(x.role));}
function gallery(row,images,enlarged=false){
 const wrap=el('div','gallery');let index=0,startX=0,startY=0;
 const img=el('img','photo');img.loading=enlarged?'eager':'lazy';img.decoding='async';
 const caption=el('div','caption');const dots=el('div','dots');
 const prev=el('button','slide-arrow prev','‹'),next=el('button','slide-arrow next','›');
 prev.setAttribute('aria-label','Previous image of '+row.name);next.setAttribute('aria-label','Next image of '+row.name);
 const dotButtons=images.map((_,i)=>{const b=el('button','dot');b.setAttribute('aria-label','Show image '+(i+1)+' of '+row.name);b.onclick=()=>show(i);dots.append(b);return b;});
 function show(i){index=(i+images.length)%images.length;img.src=images[index].src;img.alt=row.name+' — '+labels[images[index].role];caption.textContent=(index+1)+' / '+images.length+' · '+labels[images[index].role];dotButtons.forEach((b,j)=>b.setAttribute('aria-current',String(index===j)));}
 prev.onclick=()=>show(index-1);next.onclick=()=>show(index+1);
 if(!enlarged){img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','Enlarge '+row.name);const open=()=>{document.querySelector('#lightbox-title').textContent=row.name;document.querySelector('#lightbox-gallery').replaceChildren(gallery(row,images,true));dialog.showModal();};img.onclick=open;img.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};}
 wrap.append(img);if(images.length>1)wrap.append(prev,next,dots);else dots.style.display='none';wrap.append(caption);
 wrap.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX;startY=e.changedTouches[0].clientY;},{passive:true});
 wrap.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))show(index+(dx<0?1:-1));},{passive:true});show(0);return wrap;
}
function render(){
 const rows=window.EQUIPMENT.filter(r=>(review.checked||r.category!=='review')&&(active==='all'||r.category===active));grid.replaceChildren();
 for(const row of rows){const card=el('article','card'),images=usable(row);if(images.length)card.append(gallery(row,images));else{const empty=el('div','empty');empty.append(el('strong','',row.status==='needs-model'?'MODEL TO CONFIRM':'PHOTO TO ADD'),el('span','',row.name));card.append(empty);}
 const details=el('div','details');details.append(el('span','category',row.category),el('h3','',row.name),el('span','badge',images.length?images.length+' available view'+(images.length===1?'':'s'):'Awaiting image / model check'));
 if(row.note)details.append(el('p','',row.note));card.append(details);grid.append(card);}
 document.querySelector('#count').textContent=rows.length+' equipment records · '+rows.reduce((n,r)=>n+usable(r).length,0)+' visible photos';
}
for(const [id,label] of categories){const b=el('button','',label);b.setAttribute('aria-pressed',String(id===active));b.onclick=()=>{active=id;document.querySelectorAll('#filters button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();};document.querySelector('#filters').append(b);}
review.onchange=render;document.querySelector('.close').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}};render();

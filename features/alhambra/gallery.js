/* Alhambra gallery: native dialog focus containment, keyboard and touch controls. */
(()=>{'use strict';
window.BH_ALHAMBRA_BIND=function(){
 const feature=document.querySelector('.alh-feature'); if(!feature)return;
 const dialog=feature.querySelector('#alh-lightbox'); if(!dialog)return;
 const photos=window.BH_ALHAMBRA_PHOTOS||[];
 const image=dialog.querySelector('.alh-lb-image');
 const caption=dialog.querySelector('.alh-lb-caption');
 const count=dialog.querySelector('.alh-lb-count');
 let active=0,previous=null,down=null;
 const show=(n)=>{active=(n+photos.length)%photos.length;const p=photos[active];if(!p)return;image.src=p.large;image.alt=p.title+'. '+p.caption;caption.textContent=p.title+' · '+p.caption;count.textContent=(active+1)+' / '+photos.length;};
 const close=()=>{dialog.close();image.removeAttribute('src')};
 feature.querySelectorAll('.alh-photo-button[data-gallery-index]').forEach(b=>b.addEventListener('click',()=>{previous=document.activeElement;show(Number(b.dataset.galleryIndex));dialog.showModal();dialog.querySelector('.alh-lb-close').focus();}));
 dialog.querySelector('.alh-lb-close').addEventListener('click',close);
 dialog.querySelector('.alh-lb-prev').addEventListener('click',()=>show(active-1));
 dialog.querySelector('.alh-lb-next').addEventListener('click',()=>show(active+1));
 dialog.addEventListener('close',()=>{previous?.focus();previous=null;});
 dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
 dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(active-1)}else if(e.key==='ArrowRight'){e.preventDefault();show(active+1)}});
 dialog.addEventListener('touchstart',e=>{if(e.touches.length===1){down={x:e.touches[0].clientX,y:e.touches[0].clientY}}},{passive:true});
 dialog.addEventListener('touchend',e=>{if(!down||!e.changedTouches.length)return;let dx=e.changedTouches[0].clientX-down.x,dy=e.changedTouches[0].clientY-down.y;down=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.25)show(active+(dx<0?1:-1));},{passive:true});
};
})();

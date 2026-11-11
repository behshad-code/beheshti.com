/* Lightweight, accessible gallery for the Maldives editorial feature. */
(()=>{'use strict';
  const dialog=document.querySelector('.mdv-lightbox');
  if(!dialog)return;
  const anchors=[...document.querySelectorAll('a[data-mdv-lightbox]')];
  const image=dialog.querySelector('img');
  const caption=dialog.querySelector('figcaption');
  let index=0,lastTrigger=null;
  const show=(n)=>{
    index=(n+anchors.length)%anchors.length;
    const a=anchors[index];
    image.src=a.getAttribute('href');
    image.alt=a.querySelector('img')?.alt||'';
    caption.textContent=`${index+1} / ${anchors.length} · ${a.closest('figure')?.querySelector('figcaption')?.textContent||''}`;
  };
  anchors.forEach((a,i)=>a.addEventListener('click',e=>{
    e.preventDefault(); lastTrigger=a;show(i);if(typeof dialog.showModal==='function')dialog.showModal();else window.location.href=a.href;
    dialog.querySelector('.mdv-close').focus();
  }));
  dialog.querySelector('.mdv-close').addEventListener('click',()=>dialog.close());
  dialog.querySelector('.mdv-prev').addEventListener('click',()=>show(index-1));
  dialog.querySelector('.mdv-next').addEventListener('click',()=>show(index+1));
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(index-1)}if(e.key==='ArrowRight'){e.preventDefault();show(index+1)}});
  dialog.addEventListener('close',()=>{image.removeAttribute('src');if(lastTrigger?.isConnected)lastTrigger.focus();});
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
})();
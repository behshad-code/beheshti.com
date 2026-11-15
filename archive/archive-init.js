window.addEventListener('load',()=>{const id=new URLSearchParams(location.search).get('story');if(id&&typeof openArticle==='function')openArticle(id)});

// Preserve the archive's existing navigation without inline event attributes.
document.addEventListener('click', event => {
  const target = event.target.closest('[data-archive-action],[data-archive-tab],[data-archive-story]');
  if (!target) return;
  if (target.dataset.archiveAction === 'home') showHome();
  else if (target.dataset.archiveAction === 'close') closeArticle();
  else if (target.hasAttribute('data-archive-tab')) showTab(target.dataset.archiveTab);
  else if (target.hasAttribute('data-archive-story')) openArticle(target.dataset.archiveStory);
});

'use strict';
const $=id=>document.getElementById(id);
const byPublished=arr=>(Array.isArray(arr)?arr:[]).filter(item=>item.publie===true);
const element=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
function safeImagePath(path){if(typeof path!=='string')return '';if(!/^assets\/images\/[a-zA-Z0-9_./-]+\.(webp|png|jpe?g|avif|gif|svg)$/i.test(path)||path.includes('..'))return '';return path;}
function emptyState(title,message){const box=element('div','empty-state');box.append(element('span','empty-symbol','✳'),element('strong','',title),element('p','',message));return box;}
function createCard(universe,index){const card=element('article','universe-card');if(universe.image && safeImagePath(universe.image)){card.classList.add('with-image');card.style.setProperty('--cover-image',`url("${safeImagePath(universe.image)}")`);}const kicker=element('div','card-kicker');kicker.append(element('span','',universe.surtitre||'UNIVERS'),element('span','',String(index+1).padStart(2,'0')));const bottom=element('div','card-bottom'),title=element('h3','',universe.titre),desc=element('p','',universe.resume),btn=element('button','','Entrer dans cet univers ↗');btn.type='button';btn.addEventListener('click',()=>openUniverse(universe));bottom.append(title,desc,btn);card.append(kicker,bottom);return card;}
function openUniverse(item){const d=$('universe-dialog'),content=$('dialog-content');content.replaceChildren();const hero=element('div','detail-hero');const img=safeImagePath(item.image);if(img){const picture=element('img');picture.src=img;picture.alt='Illustration de '+item.titre;hero.append(picture);}else hero.textContent='✳';const main=element('div','detail-body');main.append(element('span','section-index',item.surtitre||'UNIVERS'),element('h2','',item.titre),element('p','',item.resume||''),element('p','',item.presentation||''),element('p','note','Publication contrôlée : les brouillons et les documents privés ne sont pas diffusés.'));content.append(hero,main);d.showModal();}
function createVisual(item){const path=safeImagePath(item.fichier);if(!path)return null;const btn=element('button','visual-card');btn.type='button';const img=element('img');img.src=path;img.alt=item.alt||item.titre;img.loading='lazy';const metadata=element('div','visual-meta');metadata.append(element('small','',item.univers||'UNIVERS'),element('strong','',item.titre||'Sans titre'));btn.append(img,metadata);btn.addEventListener('click',()=>{const lightbox=$('lightbox');$('lightbox-image').src=path;$('lightbox-image').alt=item.alt||item.titre;$('lightbox-caption').textContent=item.legende||item.titre;lightbox.showModal();});return btn;}
function drawGallery(data,selected='tous'){const gallery=$('gallery-list');gallery.replaceChildren();const candidates=byPublished(data.visuels).filter(x=>safeImagePath(x.fichier));const included=selected==='tous'?candidates:candidates.filter(x=>x.univers===selected);if(!included.length){gallery.append(emptyState('Galerie en préparation','Ajoutez un visuel validé depuis l’atelier local : il apparaîtra ici, avec son titre et sa légende.'));return;}included.forEach(item=>{const card=createVisual(item);if(card)gallery.append(card);});}
const encyclopediaTypes={personnage:'Personnages',lieu:'Lieux',repere:'Repères'};
function renderEncyclopedia(data,worlds){
 const items=byPublished(data.encyclopedie).filter(item=>item&&typeof item.titre==='string'&&item.titre.trim()&&Object.hasOwn(encyclopediaTypes,item.categorie)&&worlds.some(w=>w.id===item.univers));
 const container=$('encyclopedia-list'),filters=$('encyclopedia-categories'),summary=$('encyclopedia-summary'),search=$('encyclopedia-search');
 let category='tous';
 const normalise=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function openEntry(item){
  const dialog=$('universe-dialog'),content=$('dialog-content');content.replaceChildren();
  const hero=element('div','detail-hero'),image=safeImagePath(item.image);
  if(image){const picture=element('img');picture.src=image;picture.alt='Illustration de '+item.titre;hero.append(picture);}else{hero.textContent='✳';}
  const body=element('div','detail-body'),world=worlds.find(w=>w.id===item.univers);
  body.append(element('span','section-index',encyclopediaTypes[item.categorie]+' · '+world.titre),element('h2','',item.titre));
  if(item.resume)body.append(element('p','',item.resume));
  if(item.description)body.append(element('p','',item.description));
  body.append(element('p','note','Fiche affichée avec autorisation. Ne placez jamais d’archives privées dans les fichiers du site.'));
  content.append(hero,body);dialog.showModal();
 }
 function draw(){
  const query=normalise(search.value.trim()),visible=items.filter(item=>category==='tous'||item.categorie===category).filter(item=>{
   const world=worlds.find(w=>w.id===item.univers);
   return normalise([item.titre,item.resume,item.description,world?.titre].join(' ')).includes(query);
  });
  container.replaceChildren();summary.textContent=visible.length+' fiche'+(visible.length>1?'s':'')+' publique'+(visible.length>1?'s':'')+' affichée'+(visible.length>1?'s':'');
  if(!visible.length){
   container.append(emptyState(items.length?'Aucune fiche correspondante':'Les archives s’ouvriront ici',items.length?'Changez de catégorie ou de recherche.':'Personnages, lieux et repères apparaîtront lorsqu’une fiche aura été validée pour publication.'));
   return;
  }
  for(const item of visible){
   const world=worlds.find(w=>w.id===item.univers),button=element('button','encyclopedia-card');button.type='button';
   button.setAttribute('aria-label','Consulter la fiche '+item.titre);
   const image=safeImagePath(item.image);if(image){const picture=element('img');picture.src=image;picture.alt='';picture.loading='lazy';button.append(picture);}
   const content=element('div','encyclopedia-card-content');
   content.append(element('small','',encyclopediaTypes[item.categorie]),element('strong','',item.titre),element('span','',item.resume||'Présentation publique à découvrir'),element('em','',world.titre+' ↗'));
   button.append(content);button.addEventListener('click',()=>openEntry(item));container.append(button);
  }
 }
 filters.replaceChildren();
 for(const [key,label] of [['tous','Toutes'],...Object.entries(encyclopediaTypes)]){
  const button=element('button','',label);button.type='button';button.setAttribute('aria-pressed',String(key===category));
  button.addEventListener('click',()=>{category=key;for(const child of filters.children)child.setAttribute('aria-pressed',String(child===button));draw();});
  filters.append(button);
 }
 search.addEventListener('input',draw);draw();
}
function render(data){const s=data.site||{};document.title=(s.titre||'La Trame')+' — '+(s.sousTitre||'Visions d’Univers');const brand=document.querySelector('.brand span');const brandSub=document.createElement('small');brandSub.textContent=s.sousTitre||'Visions d’Univers';brand.replaceChildren(document.createTextNode(s.titre||'La Trame'),brandSub);$('hero-signature').textContent=s.signature||'Un atelier d’univers en devenir';$('hero-acroche').textContent=s.accroche||'Les mondes prennent forme.';$('hero-intro').textContent=s.introduction||'';const universe=$('universe-list');universe.replaceChildren();const worlds=byPublished(data.univers);worlds.forEach((item,i)=>universe.append(createCard(item,i)));const placeholder=element('article','universe-card card-placeholder');const bottom=element('div','card-bottom');bottom.append(element('h3','','Un nouvel horizon'),element('p','','Ce portail est conçu pour accueillir de nouveaux univers et leurs galeries, sans limite de catégories prédéfinies.'));placeholder.append(element('span','card-kicker','À VENIR'),bottom);universe.append(placeholder);
 const filters=$('gallery-filters');filters.replaceChildren();const list=[['tous','Tout voir'],...worlds.map(w=>[w.id,w.titre])];let current='tous';list.forEach(([key,label])=>{const b=element('button','',label);b.type='button';b.setAttribute('aria-pressed',String(key===current));b.addEventListener('click',()=>{current=key;Array.from(filters.children).forEach(c=>c.setAttribute('aria-pressed',String(c===b)));drawGallery(data,current);});filters.append(b);});drawGallery(data);renderEncyclopedia(data,worlds);
 const writing=$('writing-list');writing.replaceChildren();const extracts=byPublished(data.extraits);if(!extracts.length)writing.append(emptyState('Les premiers textes arrivent ici','Publiez des extraits choisis, des notes d’auteur ou des présentations — jamais le manuscrit complet par défaut.'));else extracts.forEach(item=>{const card=element('article','writing-card');card.append(element('span','type-label',item.type||'EXTRAIT'),element('h3','',item.titre||'Extrait'),element('p','',item.texte||''));const target=item.id==='prologue-un'?'un':item.id==='griffe-arrivee'?'griffe':null;if(target){const link=element('a','', 'Lire la suite ↗');link.href='lectures.html#'+target;link.setAttribute('aria-label','Lire : '+item.titre);card.append(link);}writing.append(card);});
 const journal=$('journal-list');journal.replaceChildren();const entries=byPublished(data.journal).sort((a,b)=>(b.date||'').localeCompare(a.date||''));if(!entries.length)journal.append(emptyState('Le carnet s’ouvrira bientôt','L’auteur ajoutera ici les publications officielles et les avancées qu’il souhaite partager.'));else entries.forEach(item=>{const row=element('article','journal-entry'),date=element('time','',formatDate(item.date));date.dateTime=item.date||'';const text=element('div');text.append(element('h3','',item.titre||''),element('p','',item.texte||''));row.append(date,text,element('span','journal-type',item.type||'ACTUALITÉ'));journal.append(row);});
 $('current-year').textContent=String(new Date().getFullYear());const home=safeImagePath(s.imageAccueil);if(home){const hero=document.querySelector('.hero');hero.style.backgroundImage=`linear-gradient(90deg,rgba(9,11,13,.98),rgba(9,11,13,.58)),url("${home}")`;hero.style.backgroundSize='cover';hero.style.backgroundPosition='center';}}
function formatDate(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v||''))return 'DATE À VENIR';const [year,month,day]=v.split('-');return `${day}.${month}.${year}`;}
document.querySelectorAll('dialog .dialog-close').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();}));const menu=document.querySelector('.menu-toggle');menu.addEventListener('click',()=>{const nav=$('navigation');const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});$('navigation').addEventListener('click',event=>{if(event.target.closest('a')){$('navigation').classList.remove('open');menu.setAttribute('aria-expanded','false');}});
fetch('contenu/site.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('Contenu non accessible');return r.json();}).then(render).catch(err=>{console.error(err);$('universe-list').append(emptyState('Contenu inaccessible','Lancez ce site avec un serveur local, ou publiez-le sur GitHub Pages. Reportez-vous au fichier README.'));});

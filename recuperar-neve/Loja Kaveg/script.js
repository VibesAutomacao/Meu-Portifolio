/* script.js - Lógica do site KVEG
   - Carrinho simples em localStorage
   - Validações de formulários
   - Simulação de login
   - Mensagens amigáveis
*/

// ======== Utilitários ========
const q = (sel,root=document)=> root.querySelector(sel);
const qa = (sel,root=document)=> Array.from(root.querySelectorAll(sel));

// Carrinho: key no localStorage
const CART_KEY = 'kveg_cart_v1';
const USER_KEY = 'kveg_user_v1';

function getCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){ return []; }
}
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function addToCart(item){
  const cart = getCart();
  const found = cart.find(i => i.id === item.id);
  if(found) found.qty += 1; else cart.push({...item, qty:1});
  saveCart(cart);
  updateCartCount();
  toast(`Adicionado: ${item.name}`);
}

function clearCart(){ localStorage.removeItem(CART_KEY); updateCartCount(); renderCart(); }

function removeFromCart(id){
  let cart = getCart();
  cart = cart.filter(i=>i.id !== id);
  saveCart(cart); updateCartCount(); renderCart();
}

// Renderiza o conteúdo do carrinho no modal
function renderCart(){
  const panel = q('#cartItems');
  const cart = getCart();
  panel.innerHTML = '';
  if(cart.length === 0){ panel.innerHTML = '<p>Seu carrinho está vazio.</p>'; return; }
  let total = 0;
  cart.forEach(item =>{
    const el = document.createElement('div');
    el.className = 'cart-item';
    const itemPrice = item.price ? item.price : 0;
    const subtotal = itemPrice * item.qty;
    total += subtotal;
    el.innerHTML = `<div><strong>${item.name}</strong><p>${item.desc || ''}</p></div>
      <div style="text-align:right">${formatPrice(itemPrice)} x${item.qty}<br><strong>${formatPrice(subtotal)}</strong><br><button class='btn ghost remove' data-id='${item.id}'>Remover</button></div>`;
    panel.appendChild(el);
  });
  const totalEl = document.createElement('div');
  totalEl.className = 'cart-total';
  totalEl.innerHTML = `<div style="text-align:right;margin-top:12px"><strong>Total: ${formatPrice(total)}</strong></div>`;
  panel.appendChild(totalEl);
  qa('.remove', panel).forEach(btn=> btn.addEventListener('click', e=> removeFromCart(btn.dataset.id)));
}

function updateCartCount(){
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  qa('#cartCount, #cartCount2, #cartCount3, #cartCount4, #cartCount5').forEach(el=> el.textContent = count);
}

// Toast simples
function toast(msg,timeout=2400){
  const t = document.createElement('div');
  t.className = 'kveg-toast';
  t.textContent = msg;
  Object.assign(t.style,{position:'fixed',right:'16px',bottom:'16px',background:'#111827',color:'#fff',padding:'10px 14px',borderRadius:'8px',zIndex:120});
  document.body.appendChild(t);
  setTimeout(()=> t.style.opacity=0, timeout-300);
  setTimeout(()=> t.remove(), timeout);
}

// ======== Inicialização de UI ========
function init(){
  // Interações do menu e cart
  const menuToggle = qa('.menu-toggle');
  menuToggle.forEach(btn=> btn.addEventListener('click', toggleMobileMenu));

  qa('.cart-btn').forEach(btn=> btn.addEventListener('click', openCart));
  q('#closeCart')?.addEventListener('click', closeCart);
  q('#checkoutBtn')?.addEventListener('click', checkout);
  q('#clearCart')?.addEventListener('click', ()=>{ clearCart(); toast('Carrinho limpo'); });

  updateCartCount(); renderCart();

  // Botões Comprar
  qa('.buy-btn').forEach(btn=> btn.addEventListener('click', onBuyClick));

  // Contact form
  const contactForm = q('#contactForm');
  if(contactForm) contactForm.addEventListener('submit', onContactSubmit);

  // Login form
  const loginForm = q('#loginForm');
  if(loginForm) loginForm.addEventListener('submit', onLoginSubmit);

  // Produtos dinâmicos (poderia vir de API no futuro)
  seedProducts();
}

function toggleMobileMenu(){
  const nav = q('.nav');
  if(!nav) return;
  if(nav.style.display === 'flex'){ nav.style.display = ''; }
  else nav.style.display = 'flex';
}

// Cart modal controls
function openCart(){
  const modal = q('#cartModal');
  if(!modal) return;
  modal.setAttribute('aria-hidden','false'); renderCart();
}
function closeCart(){ const modal = q('#cartModal'); if(modal) modal.setAttribute('aria-hidden','true'); }

function checkout(){
  const cart = getCart();
  if(cart.length === 0){ toast('Seu carrinho está vazio'); return; }
  // Simulação de checkout
  clearCart(); closeCart();
  toast('Compra simulada com sucesso — obrigado!');
}

// Compras: evento do botão
function onBuyClick(e){
  const id = e.currentTarget.dataset.id;
  // Dados do produto (no futuro via API)
  const products = getProductCatalog();
  const p = products.find(x=>x.id === id);
  if(!p) return toast('Produto não encontrado');
  addToCart({id:p.id,name:p.name,desc:p.desc,price:p.price});
}

// ======== Produtos (catalogo local) ========
function getProductCatalog(){
  return [
    {id:'p1',name:'Pacote Inicial',desc:'Kit com serviços básicos para iniciar o seu projeto.', price:499.00},
    {id:'p2',name:'Design Premium',desc:'Projeto visual completo para sua marca e materiais.', price:1299.00},
    {id:'p3',name:'Implantação Pro',desc:'Executamos e acompanhamos a implantação do projeto.', price:2499.00},
    {id:'p4',name:'Suporte Mensal',desc:'Assinatura para suporte e melhorias contínuas.', price:199.00}
  ];
}

function seedProducts(){
  const grid = q('#products');
  if(!grid) return;
  const catalog = getProductCatalog();
  // Evitar duplicar se já houver conteúdo
  if(grid.dataset.seeded === '1') return;
  grid.dataset.seeded = '1';
  // Remover artigos estáticos se existirem
  grid.innerHTML = '';
  catalog.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-id', p.id);
    card.innerHTML = `<div class="product-media"><svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="120" height="80" rx="8" fill="#f3f6ff"/></svg></div>
      <h3>${p.name}</h3>
      <p class="muted">${p.desc}</p>
      <div class="price">${formatPrice(p.price)}</div>
      <button class="btn buy-btn" data-id="${p.id}">Comprar</button>`;
    grid.appendChild(card);
  });
  qa('.buy-btn').forEach(btn=> btn.addEventListener('click', onBuyClick));
}

function formatPrice(value){
  if(value === undefined || value === null) return '';
  return value.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
}

// ======== Formulários ========
function onContactSubmit(e){
  e.preventDefault();
  const nome = q('#nome').value.trim();
  const email = q('#email').value.trim();
  const tel = q('#telefone').value.trim();
  const msg = q('#mensagem').value.trim();
  if(!nome || !email || !tel || !msg){ toast('Preencha todos os campos'); return; }
  if(!validateEmail(email)){ toast('Email inválido'); return; }
  // Simulação de envio
  e.target.reset();
  toast('Mensagem enviada com sucesso — responderemos em breve');
}

function validateEmail(email){
  return /^\S+@\S+\.\S+$/.test(email);
}

// ======== Login (simulação local) ========
function onLoginSubmit(e){
  e.preventDefault();
  const email = q('#loginEmail').value.trim();
  const pwd = q('#loginPassword').value;
  if(!email || !pwd){ toast('Preencha email e senha'); return; }
  if(!validateEmail(email)){ toast('Email inválido'); return; }
  if(pwd.length < 6){ toast('Senha muito curta'); return; }
  // Simulação: salva usuário no localStorage
  const user = {email,token:'simulated-token-'+Date.now()};
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  toast('Login realizado (simulação)');
  setTimeout(()=> window.location.href = 'index.html', 900);
}

// ======== Inicializar ========
window.addEventListener('DOMContentLoaded', init);

// Expor algumas funções para depuração no console
window.KVEG = {getCart, addToCart, clearCart, getProductCatalog};

/* Fim do script.js */
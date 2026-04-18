// registros.js - lógica para salvar/mostrar registros de ações (localStorage)
const KEY = 'gta_records_v1';
const q = (sel,root=document)=> root.querySelector(sel);
const qa = (sel,root=document)=> Array.from(root.querySelectorAll(sel));

function loadRecords(){
  try{ return JSON.parse(localStorage.getItem(KEY)) || []; }catch(e){ return []; }
}
function saveRecords(list){ localStorage.setItem(KEY, JSON.stringify(list)); }

function formatDateBr(iso){
  if(!iso) return '';
  // iso expected YYYY-MM-DD
  const parts = iso.split('-');
  if(parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function render(){
  const tbody = q('#registrosTable tbody');
  const records = loadRecords();
  tbody.innerHTML = '';
  if(records.length === 0){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" class="muted">Nenhum registro salvo.</td>`;
    tbody.appendChild(tr);
    return;
  }
  records.sort((a,b)=> b.id - a.id); // mais recente primeiro
  records.forEach(rec=>{
    const tr = document.createElement('tr');
    const tag = rec.situacao === 'VITÓRIA' ? `<span class="tag-vitoria">Vitória</span>` : `<span class="tag-derrota">Derrota</span>`;
    tr.innerHTML = `
      <td>${formatDateBr(rec.data)}</td>
      <td>${escapeHtml(rec.nomes)}</td>
      <td>${escapeHtml(rec.acao)}</td>
      <td>${tag}</td>
      <td><button class="btn small" data-id="${rec.id}" data-action="delete">Apagar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s]);
}

function addRecord(obj){
  const list = loadRecords();
  list.push(obj);
  saveRecords(list);
  render();
}

function deleteRecord(id){
  let list = loadRecords();
  list = list.filter(r=> String(r.id) !== String(id));
  saveRecords(list);
  render();
}

function clearAll(){
  if(!confirm('Deseja realmente apagar todos os registros?')) return;
  localStorage.removeItem(KEY);
  render();
}

function exportCsv(){
  const list = loadRecords();
  if(list.length === 0){ alert('Nada para exportar'); return; }
  const header = ['Data','Nomes','Ação','Situação'];
  const rows = list.map(r=> [formatDateBr(r.data), `"${r.nomes.replace(/"/g,'""') }"`, `"${r.acao.replace(/"/g,'""')}"`, r.situacao]);
  const csv = [header.join(','), ...rows.map(r=> r.join(','))].join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dt = new Date().toISOString().slice(0,10);
  a.download = `registros_gta_${dt}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function init(){
  const form = q('#registroForm');
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const data = q('#data').value || new Date().toISOString().slice(0,10);
    const nomes = q('#nomes').value.trim();
    const acao = q('#acao').value.trim();
    const situacao = q('#situacao').value;
    if(!nomes || !acao){ alert('Preencha nomes e ação'); return; }
    const rec = { id: Date.now(), data, nomes, acao, situacao };
    addRecord(rec);
    form.reset();
    // manter a data do dia anterior? não, limpar
  });

  q('#limparForm').addEventListener('click', ()=> q('#registroForm').reset());
  q('#clearAll').addEventListener('click', clearAll);
  q('#exportCsv').addEventListener('click', exportCsv);

  // Delegation for delete buttons
  q('#registrosTable').addEventListener('click', e=>{
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const id = btn.dataset.id;
    if(btn.dataset.action === 'delete'){
      if(confirm('Apagar este registro?')) deleteRecord(id);
    }
  });

  render();
}

window.addEventListener('DOMContentLoaded', init);

/* fim registros.js */

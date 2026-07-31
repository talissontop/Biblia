// js/core/app.js - Biblia 3D Advanced Core
let bibliaData = [];
let livroAtualIdx = 0;
let capAtualIdx = 0;

async function init() {
    try {
        const res = await fetch("./data/verses/biblia_completa.json");
        if(!res.ok) throw new Error("Erro ao carregar DB");
        bibliaData = await res.json();
        renderizarBiblioteca();
    } catch (e) { console.error("Falha Crítica:", e); }
}

function renderizarBiblioteca() {
    const vt = document.getElementById('grid-vt');
    const nt = document.getElementById('grid-nt');
    vt.innerHTML = ''; nt.innerHTML = '';
    bibliaData.forEach((l, i) => {
        const b = document.createElement('button');
        b.className = 'btn-livro';
        b.innerText = l.name;
        b.onclick = () => abrirCapitulos(i);
        (i < 39) ? vt.appendChild(b) : nt.appendChild(b);
    });
}

function abrirCapitulos(i) {
    livroAtualIdx = i;
    document.getElementById('titulo-livro-selecionado').innerText = bibliaData[i].name;
    const g = document.getElementById('grid-capitulos-container');
    g.innerHTML = '';
    bibliaData[i].chapters.forEach((c, idx) => {
        const b = document.createElement('button');
        b.className = 'btn-capitulo';
        b.innerText = idx + 1;
        b.onclick = () => lerCapitulo(i, idx);
        g.appendChild(b);
    });
    mostrarTela('capitulos');
}

function lerCapitulo(l, c) {
    livroAtualIdx = l; capAtualIdx = c;
    const livro = bibliaData[l];
    document.getElementById('titulo-leitura').innerText = livro.name + " " + (c+1);
    const cont = document.getElementById('texto-biblico');
    cont.innerHTML = livro.chapters[c].map((t, i) => 
        '<div class="versiculo-box"><p class="versiculo-texto"><span class="num">' + (i+1) + '</span>' + t + '</p></div>'
    ).join('');
    
    document.getElementById('btn-prev').style.visibility = (l===0 && c===0) ? 'hidden' : 'visible';
    mostrarTela('leitura');
}

function navegar(dir) {
    let nc = capAtualIdx + dir;
    let nl = livroAtualIdx;
    if(nc < 0) { nl--; if(nl >= 0) nc = bibliaData[nl].chapters.length - 1; }
    else if(nc >= bibliaData[nl].chapters.length) { nl++; nc = 0; }
    if(nl >= 0 && nl < 66) lerCapitulo(nl, nc);
}

function mostrarTela(t) {
    ['livros','capitulos','leitura'].forEach(x => document.getElementById('tela-'+x).classList.add('view-hidden'));
    document.getElementById('tela-'+t).classList.remove('view-hidden');
}

init();

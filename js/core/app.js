// js/core/app.js - Biblia & Harpa 3D Core
let bibliaData = [];
let harpaData = [];
let livroAtualIdx = 0;
let capAtualIdx = 0;
let modoAtual = 'biblia'; 

async function init() {
    try {
        const resBiblia = await fetch("./data/verses/biblia_completa.json");
        bibliaData = await resBiblia.json();
        renderizarBiblioteca();

        const resHarpa = await fetch("./data/verses/harpa_crista.json");
        harpaData = await resHarpa.json();
    } catch (e) { 
        console.error("Falha ao carregar bases de dados:", e); 
    }
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
    modoAtual = 'biblia';
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
    modoAtual = 'biblia';
    livroAtualIdx = l; capAtualIdx = c;
    const livro = bibliaData[l];
    document.getElementById('titulo-leitura').innerText = livro.name + " " + (c+1);
    const cont = document.getElementById('texto-biblico');
    cont.innerHTML = livro.chapters[c].map((t, i) => 
        '<div class="versiculo-box"><p class="versiculo-texto"><span class="num">' + (i+1) + '</span>' + t + '</p></div>'
    ).join('');
    
    document.getElementById('btn-voltar-leitura').setAttribute("onclick", "mostrarTela('capitulos')");
    document.getElementById('botoes-navegacao-inferior').style.display = 'flex';
    document.getElementById('btn-prev').style.visibility = (l===0 && c===0) ? 'hidden' : 'visible';
    mostrarTela('leitura');
}

function carregarHarpa() {
    const gridHinos = document.getElementById('grid-hinos');
    gridHinos.innerHTML = '';
    
    if(!harpaData || harpaData.length === 0) {
        gridHinos.innerHTML = '<p style="color:var(--accent-gold); text-align:center; grid-column: 1/-1;">Carregando ou dados indisponíveis. Verifique a conexão.</p>';
        mostrarTela('harpa');
        return;
    }

    harpaData.forEach((hino, index) => {
        const b = document.createElement('button');
        b.className = 'btn-livro';
        let numero = hino.numero || hino.ro || (index + 1);
        let titulo = hino.titulo || hino.title || ("Hino " + numero);
        b.innerText = numero + " - " + titulo;
        b.onclick = () => lerHino(index);
        gridHinos.appendChild(b);
    });
    mostrarTela('harpa');
}

function lerHino(index) {
    modoAtual = 'harpa';
    hinoAtualIdx = index;
    const hino = harpaData[index];
    
    let numero = hino.numero || hino.ro || (index + 1);
    let titulo = hino.titulo || hino.title || ("Hino " + numero);
    document.getElementById('titulo-leitura').innerText = numero + " - " + titulo;
    
    const cont = document.getElementById('texto-biblico');
    let letrasHTML = '<div class="versiculo-box"><p class="versiculo-texto">';
    
    let versos = hino.letra || hino.text;
    if (versos) {
        if (Array.isArray(versos)) {
            versos.forEach(estrofe => {
                if (Array.isArray(estrofe)) {
                    letrasHTML += estrofe.join('<br>') + '<br><br>';
                } else {
                    letrasHTML += estrofe + '<br><br>';
                }
            });
        } else {
            letrasHTML += versos.replace(/\\n/g, '<br>');
        }
    } else {
        letrasHTML += "Letra não encontrada.";
    }
    
    letrasHTML += '</p></div>';
    cont.innerHTML = letrasHTML;
    
    document.getElementById('btn-voltar-leitura').setAttribute("onclick", "carregarHarpa()");
    document.getElementById('botoes-navegacao-inferior').style.display = 'none';
    mostrarTela('leitura');
}

function navegar(dir) {
    if (modoAtual !== 'biblia') return;
    let nc = capAtualIdx + dir;
    let nl = livroAtualIdx;
    if(nc < 0) { nl--; if(nl >= 0) nc = bibliaData[nl].chapters.length - 1; }
    else if(nc >= bibliaData[nl].chapters.length) { nl++; nc = 0; }
    if(nl >= 0 && nl < 66) lerCapitulo(nl, nc);
}

function mostrarTela(t) {
    ['livros','capitulos','leitura','harpa','atualizacoes'].forEach(x => {
        const el = document.getElementById('tela-' + x);
        if(el) el.classList.add('view-hidden');
    });
    const alvo = document.getElementById('tela-' + t);
    if(alvo) alvo.classList.remove('view-hidden');
    document.getElementById('leitor-panel').scrollTop = 0;
}

init();

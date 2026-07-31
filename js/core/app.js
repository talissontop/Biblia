// js/core/app.js
let bibliaData = [];
let livroAtualIndex = 0;
let capituloAtualIndex = 0;

// Função para gerenciar qual tela aparece
function mostrarTela(tela) {
    document.getElementById("tela-livros").classList.add("view-hidden");
    document.getElementById("tela-capitulos").classList.add("view-hidden");
    document.getElementById("tela-leitura").classList.add("view-hidden");
    document.getElementById(`tela-${tela}`).classList.remove("view-hidden");
    document.getElementById("leitor-panel").scrollTop = 0; // Volta a barra de rolagem pro topo
}

async function carregarBancoDeDados() {
    try {
        const response = await fetch("./data/verses/biblia_completa.json");
        if (!response.ok) throw new Error("Arquivo da Bíblia não encontrado!");
        bibliaData = await response.json();
        renderizarLivros();
    } catch (error) {
        console.error("Erro fatal:", error);
        document.getElementById("grid-vt").innerHTML = "<p style='color:red'>Erro ao carregar a Bíblia. Verifique o console.</p>";
    }
}

// Monta a Grade de Livros (39 do VT e 27 do NT)
function renderizarLivros() {
    const gridVt = document.getElementById("grid-vt");
    const gridNt = document.getElementById("grid-nt");
    gridVt.innerHTML = ""; gridNt.innerHTML = "";

    bibliaData.forEach((livro, index) => {
        const btn = document.createElement("button");
        btn.className = "btn-livro";
        btn.innerText = livro.name;
        btn.onclick = () => abrirCapitulos(index);

        if (index < 39) gridVt.appendChild(btn); // Antigo Testamento
        else gridNt.appendChild(btn); // Novo Testamento
    });
}

// Monta a Grade de Capítulos do Livro clicado
function abrirCapitulos(index) {
    livroAtualIndex = index;
    const livro = bibliaData[index];
    document.getElementById("titulo-livro-selecionado").innerText = livro.name;
    
    const grid = document.getElementById("grid-capitulos-container");
    grid.innerHTML = "";

    livro.chapters.forEach((cap, idx) => {
        const btn = document.createElement("button");
        btn.className = "btn-capitulo";
        btn.innerText = idx + 1;
        btn.onclick = () => abrirLeitura(index, idx);
        grid.appendChild(btn);
    });

    mostrarTela("capitulos");
}

// Monta o texto para leitura e ajusta os botões
function abrirLeitura(lIndex, cIndex) {
    livroAtualIndex = lIndex;
    capituloAtualIndex = cIndex;
    const livro = bibliaData[lIndex];
    const versiculos = livro.chapters[cIndex];

    document.getElementById("titulo-leitura").innerText = `${livro.name} ${cIndex + 1}`;
    const container = document.getElementById("texto-biblico");
    container.innerHTML = "";

    versiculos.forEach((texto, i) => {
        container.innerHTML += `
            <div class="versiculo-box">
                <p class="versiculo-texto"><span class="num">${i + 1}</span> ${texto}</p>
            </div>`;
    });

    // Lógica para esconder/mostrar botões Próximo e Anterior
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    btnPrev.style.visibility = (lIndex === 0 && cIndex === 0) ? "hidden" : "visible"; // Esconde no Gen 1
    btnNext.style.visibility = (lIndex === 65 && cIndex === livro.chapters.length - 1) ? "hidden" : "visible"; // Esconde no Ap 22

    mostrarTela("leitura");
}

// Botões de Próximo e Anterior contínuos
function navegarCapitulo(direcao) {
    let novoCapIndex = capituloAtualIndex + direcao;
    let novoLivroIndex = livroAtualIndex;

    if (novoCapIndex < 0) {
        // Volta pro livro anterior
        novoLivroIndex--;
        if (novoLivroIndex >= 0) {
            novoCapIndex = bibliaData[novoLivroIndex].chapters.length - 1;
        }
    } else if (novoCapIndex >= bibliaData[novoLivroIndex].chapters.length) {
        // Avança pro próximo livro
        novoLivroIndex++;
        novoCapIndex = 0;
    }

    // Carrega se os índices forem válidos (entre 0 e 65 livros)
    if (novoLivroIndex >= 0 && novoLivroIndex < bibliaData.length) {
        abrirLeitura(novoLivroIndex, novoCapIndex);
    }
}

// Inicia o sistema baixando tudo para a memória
carregarBancoDeDados();

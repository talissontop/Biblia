// js/core/app.js
async function carregarBibliaCompleta(siglaLivro, numeroCapitulo) {
    try {
        // Busca a Bíblia completa que o PowerShell baixou
        const response = await fetch("data/verses/biblia_completa.json");
        const bibliaCompleta = await response.json();

        // Procura o livro pela sigla (ex: "gn", "ap")
        const livro = bibliaCompleta.find(l => l.abbrev === siglaLivro);
        if (!livro) {
            console.error("Livro não encontrado!");
            return;
        }

        // O índice do capítulo começa em 0
        const indexCapitulo = numeroCapitulo - 1;
        const versiculos = livro.chapters[indexCapitulo];

        const titulo = document.getElementById("titulo-livro");
        const container = document.getElementById("texto-biblico");
        
        titulo.innerText = `${livro.name} ${numeroCapitulo}`;
        container.innerHTML = "";

        // Imprime os versículos na tela
        versiculos.forEach((texto, index) => {
            const numeroVersiculo = index + 1;
            container.innerHTML += `
                <div class="versiculo-box">
                    <p class="versiculo-texto">
                        <span class="num">${numeroVersiculo}</span> ${texto}
                    </p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar a Bíblia:", error);
        document.getElementById("titulo-livro").innerText = "Erro ao carregar os textos.";
    }
}

// Inicia o app lendo Gênesis 1
carregarBibliaCompleta("gn", 1);

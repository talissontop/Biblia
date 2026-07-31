// Lógica principal do Leitor Bíblico
async function carregarCapitulo() {
    try {
        // Busca os dados traduzidos do hebraico na nossa pasta data
        const response = await fetch('../../data/verses/genesis_1.json');
        const data = await response.json();
        console.log('📖 Capítulo carregado com sucesso:', data);
    } catch (error) {
        console.error('Erro ao carregar o capítulo:', error);
    }
}
carregarCapitulo();

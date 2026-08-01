// ============================================================
// profile.js - Sistema de Perfil do Usuário
// Simples, robusto, sem dependências externas
// ============================================================

document.addEventListener("DOMContentLoaded", function() {
    try {
        // Procura ou cria o container
        let container = document.getElementById('profile-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'profile-container';
            document.body.prepend(container);
        }

        // Renderiza o perfil se vazio
        if (!container.innerHTML.trim()) {
            const perfilHTML = '<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; color: #e6edf3; font-family: system-ui, sans-serif; padding: 12px 20px; background: rgba(22, 27, 34, 0.8); border-bottom: 1px solid #30363d;"><span style="font-weight: bold; color: #d4af37; font-size: 1em;">👤 Meu Perfil</span><span style="font-size: 0.85em; color: #8b949e;">Ministério Pentecostal Elohim</span></div>';
            container.innerHTML = perfilHTML;
        }

        console.log('[Profile] Sistema de perfil inicializado');
    } catch (err) {
        console.error('[Profile] Erro ao inicializar:', err.message);
    }
});

// Função auxiliar: salvar dados no localStorage
function salvarPerfilLocal(dados) {
    try {
        localStorage.setItem('mpe-perfil', JSON.stringify(dados));
        return true;
    } catch (err) {
        console.warn('[Profile] localStorage indisponível:', err.message);
        return false;
    }
}

// Função auxiliar: carregar dados do localStorage
function carregarPerfilLocal() {
    try {
        const dados = localStorage.getItem('mpe-perfil');
        return dados ? JSON.parse(dados) : null;
    } catch (err) {
        console.warn('[Profile] Erro ao carregar perfil:', err.message);
        return null;
    }
}

console.log('[Profile] Módulo carregado');
// --- PROFILE.JS CORRIGIDO E FIXO NO TOPO ---
document.addEventListener("DOMContentLoaded", () => {
    let container = document.getElementById('profile-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'profile-container';
        document.body.prepend(container);
    }
    
    // Conteúdo padrão do perfil se não houver outro script manipulando
    if (!container.innerHTML.trim()) {
        container.innerHTML = \
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; color: #e6edf3; font-family: sans-serif;">
                <span style="font-weight: bold; color: #d4af37;">👤 Meu Perfil</span>
                <span style="font-size: 0.9em; color: #8b949e;">Bem-vindo, irmão!</span>
            </div>
        \;
    }
});

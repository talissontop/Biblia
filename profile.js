document.addEventListener("DOMContentLoaded", function() {
    try {
        let container = document.getElementById('profile-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'profile-container';
            document.body.prepend(container);
        }
        if (!container.innerHTML.trim()) {
            container.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; color: #e6edf3; font-family: system-ui, sans-serif; padding: 10px 20px; background: #161b22; border-bottom: 2px solid #d4af37;"><span style="font-weight: bold; color: #d4af37;">👤 Meu Perfil</span><span style="font-size: 0.9em; color: #8b949e;">Ministério Pentecostal Elohim</span></div>';
        }
        console.log("[Profile] Container inicializado com sucesso");
    } catch (e) {
        console.error("[Profile] Erro durante inicialização:", e.message);
    }
});
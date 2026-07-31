// js/components/ui.js
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const leitorPanel = document.getElementById('leitor-panel');
    const btnLeitor = document.getElementById('btn-leitor');
    const btnExplorador = document.getElementById('btn-explorador');

    // Abre e fecha o menu lateral
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Clicou no Leitor: Mostra o texto
    btnLeitor.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        btnLeitor.parentElement.classList.add('active');
        leitorPanel.classList.remove('hidden');
        sidebar.classList.remove('open'); // fecha o menu no celular
    });

    // Clicou no 3D: Esconde o texto para ver a paisagem
    btnExplorador.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        btnExplorador.parentElement.classList.add('active');
        leitorPanel.classList.add('hidden');
        sidebar.classList.remove('open');
    });
});
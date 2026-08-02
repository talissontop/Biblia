// ============================================================
// app.js - BÍBLIA 3D COM SUPORTE TOTAL A TOUCH (CELULAR)
// Melhorado com: Validações, Erros Robustos, Logs, Performance
// ============================================================

let bibliaData = [];
// // HARPA REMOVIDA // REMOVIDO
let livroAtualIdx = 0;
let capAtualIdx = 0;
let modoAtual = 'biblia';

// Melhorias de performance: armazena referências em cache
const DOM_CACHE = {};

function obterElementoSeguro(id) {
    if (!DOM_CACHE[id]) {
        DOM_CACHE[id] = document.getElementById(id);
    }
    return DOM_CACHE[id];
}

// --- Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
    console.log('[App] DOM carregado, iniciando...');
    init();
});

async function init() {
    try {
        console.log('[App] Iniciando carregamento de dados...');
        
        const resBiblia = await fetch("./data/verses/biblia_completa.json");
        
        if (!resBiblia.ok) {
            throw new Error(`Erro ao carregar Bíblia: HTTP ${resBiblia.status}`);
        }
        
        bibliaData = await resBiblia.json();
        
        // Validação dos dados
        if (!Array.isArray(bibliaData) || bibliaData.length === 0) {
            throw new Error("Dados da Bíblia inválidos ou vazios");
        }
        
        console.log('[App] Bíblia carregada com sucesso:', bibliaData.length, 'livros');
        
        renderizarBiblioteca();
        verificarAtualizacaoSW();
        
    } catch (err) {
        console.error("[App] Falha ao carregar bases de dados:", err);
        mostrarErroUsuario("Erro ao carregar dados: " + err.message);
    }
}

// ============================================================
// Renderizar Biblioteca com Validações
// ============================================================
function renderizarBiblioteca() {
    const vt = obterElementoSeguro('grid-vt');
    const nt = obterElementoSeguro('grid-nt');
    
    if (!vt || !nt) {
        console.error('[App] Containers de livros não encontrados');
        return;
    }
    
    vt.innerHTML = '';
    nt.innerHTML = '';
    
    if (!bibliaData || bibliaData.length === 0) {
        console.error('[App] bibliaData está vazio');
        return;
    }
    
    bibliaData.forEach((livro, idx) => {
        try {
            if (!livro || !livro.name) {
                console.warn('[App] Livro inválido no índice:', idx);
                return;
            }
            
            const btn = document.createElement('button');
            btn.className = 'btn-livro';
            btn.innerText = livro.name;
            btn.setAttribute('data-idx', idx);
            btn.setAttribute('aria-label', 'Abrir: ' + livro.name);
            
            // Evento único otimizado (delegação)
            btn.addEventListener('click', () => abrirCapitulos(idx), { passive: true });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                abrirCapitulos(idx);
            }, { passive: false });
            
            (idx < 39) ? vt.appendChild(btn) : nt.appendChild(btn);
            
        } catch (err) {
            console.error('[App] Erro ao renderizar livro:', idx, err);
        }
    });
    
    console.log('[App] Biblioteca renderizada com sucesso');
}

// ============================================================
// Abrir Capítulos com Validação
// ============================================================
function abrirCapitulos(idx) {
    try {
        if (idx < 0 || idx >= bibliaData.length) {
            throw new Error(`Índice de livro inválido: ${idx}`);
        }
        
        modoAtual = 'biblia';
        livroAtualIdx = idx;
        
        const tituloEl = obterElementoSeguro('titulo-livro-selecionado');
        if (tituloEl) {
            tituloEl.innerText = bibliaData[idx].name;
        }
        
        const grid = obterElementoSeguro('grid-capitulos-container');
        if (!grid) {
            console.error('[App] Container de capítulos não encontrado');
            return;
        }
        
        grid.innerHTML = '';
        
        const livro = bibliaData[idx];
        if (!livro.chapters || livro.chapters.length === 0) {
            console.warn('[App] Livro sem capítulos:', livro.name);
            return;
        }
        
        livro.chapters.forEach((_, capIdx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-capitulo';
            btn.innerText = capIdx + 1;
            btn.setAttribute('data-cap', capIdx);
            btn.setAttribute('aria-label', `Capítulo ${capIdx + 1}`);
            
            btn.addEventListener('click', () => lerCapitulo(idx, capIdx), { passive: true });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                lerCapitulo(idx, capIdx);
            }, { passive: false });
            
            grid.appendChild(btn);
        });
        
        mostrarTela('capitulos');
        console.log('[App] Capítulos abertos:', bibliaData[idx].name);
        
    } catch (err) {
        console.error('[App] Erro ao abrir capítulos:', err);
        mostrarErroUsuario('Erro ao carregar capítulos');
    }
}

// ============================================================
// Ler Capítulo com Validações e Performance
// ============================================================
function lerCapitulo(l, c) {
    try {
        if (l < 0 || l >= bibliaData.length) {
            throw new Error(`Índice de livro inválido: ${l}`);
        }
        
        const livro = bibliaData[l];
        
        if (c < 0 || c >= livro.chapters.length) {
            throw new Error(`Índice de capítulo inválido: ${c}`);
        }
        
        modoAtual = 'biblia';
        livroAtualIdx = l;
        capAtualIdx = c;
        
        // Atualiza título
        const tituloLeitura = obterElementoSeguro('titulo-leitura');
        if (tituloLeitura) {
            tituloLeitura.innerText = livro.name + " " + (c + 1);
        }
        
        // Renderiza versículos com Fragment (melhor performance)
        const cont = obterElementoSeguro('texto-biblico');
        if (cont) {
            const fragment = document.createDocumentFragment();
            const capitulo = livro.chapters[c];
            
            if (!Array.isArray(capitulo)) {
                throw new Error('Capítulo não é um array válido');
            }
            
            capitulo.forEach((texto, i) => {
                const div = document.createElement('div');
                div.className = 'versiculo-box';
                div.setAttribute('data-versiculo', i + 1);
                
                const p = document.createElement('p');
                p.className = 'versiculo-texto';
                
                const span = document.createElement('span');
                span.className = 'num';
                span.innerText = i + 1;
                
                // Sanitização básica
                const textoLimpo = sanitizarTexto(texto);
                
                p.appendChild(span);
                p.innerHTML += textoLimpo;
                
                div.appendChild(p);
                fragment.appendChild(div);
            });
            
            cont.innerHTML = '';
            cont.appendChild(fragment);
        }
        
        // Botão voltar
        const btnVoltar = obterElementoSeguro('btn-voltar-leitura');
        if (btnVoltar) {
            btnVoltar.addEventListener('click', () => mostrarTela('capitulos'), { passive: true });
            btnVoltar.addEventListener('touchend', (e) => {
                e.preventDefault();
                mostrarTela('capitulos');
            }, { passive: false });
        }
        
        // Navegação inferior
        const navInferior = obterElementoSeguro('botoes-navegacao-inferior');
        if (navInferior) {
            navInferior.style.display = 'flex';
            navInferior.style.gap = '15px';
            navInferior.style.justifyContent = 'center';
            navInferior.style.marginTop = '20px';
        }
        
        mostrarTela('leitura');
        console.log('[App] Capítulo carregado:', livro.name, c + 1);
        
        // Configura swipe (opcional)
        configurarSwipeSimples();
        
    } catch (err) {
        console.error('[App] Erro ao ler capítulo:', err);
        mostrarErroUsuario('Erro ao carregar capítulo');
    }
}

// ============================================================
// Navegação Entre Capítulos
// ============================================================
function navegar(dir) {
    try {
        if (modoAtual !== 'biblia') return;
        
        let nc = capAtualIdx + dir;
        let nl = livroAtualIdx;
        
        const livroAtual = bibliaData[nl];
        
        if (nc < 0) {
            nl--;
            if (nl >= 0) {
                nc = bibliaData[nl].chapters.length - 1;
            }
        } else if (nc >= livroAtual.chapters.length) {
            nl++;
            if (nl < bibliaData.length) {
                nc = 0;
            }
        }
        
        if (nl >= 0 && nl < bibliaData.length) {
            lerCapitulo(nl, nc);
            
            const painel = obterElementoSeguro('leitor-panel');
            if (painel) {
                painel.scrollTop = 0;
            }
            
            console.log('[App] Navegação: capítulo', nc + 1);
        }
        
    } catch (err) {
        console.error('[App] Erro ao navegar:', err);
    }
}

// ============================================================
// Mostrar Tela com Validação
// ============================================================
function mostrarTela(telaNome) {
    try {
        const telasValidas = ['menu', 'livros', 'capitulos', 'leitura',  'atualizacoes', 'perfil'];
        
        if (!telasValidas.includes(telaNome)) {
            console.warn('[App] Tela inválida:', telaNome);
            return;
        }
        
        telasValidas.forEach((tela) => {
            const el = obterElementoSeguro('tela-' + tela);
            if (el) {
                if (tela === telaNome) {
                    el.classList.remove('view-hidden');
                } else {
                    el.classList.add('view-hidden');
                }
            }
        });
        
        const painel = obterElementoSeguro('leitor-panel');
        if (painel) {
            painel.scrollTop = 0;
        }
        
        console.log('[App] Tela exibida:', telaNome);
        
    } catch (err) {
        console.error('[App] Erro ao mostrar tela:', err);
    }
}

// ============================================================
// Funções Auxiliares
// ============================================================

function sanitizarTexto(texto) {
    if (typeof texto !== 'string') {
        return '';
    }
    return texto
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&lt;br\/?&gt;/gi, '<br>');
}

function mostrarErroUsuario(mensagem) {
    const notif = document.createElement('div');
    notif.className = 'notif-erro';
    notif.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: #d32f2f; color: white;
        padding: 16px; border-radius: 8px;
        z-index: 9999; font-family: system-ui;
    `;
    notif.innerText = '⚠️ ' + mensagem;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        try {
            notif.remove();
        } catch (e) {
            // elemento já removido
        }
    }, 4000);
}

function configurarSwipeSimples() {
    const painel = obterElementoSeguro('leitor-panel');
    if (!painel) return;
    
    let touchStartX = 0;
    
    painel.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    painel.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const delta = touchEndX - touchStartX;
        
        if (Math.abs(delta) > 50) {
            if (delta > 0) {
                navegar(-1);
            } else {
                navegar(1);
            }
        }
    }, { passive: true });
}

// ============================================================
// Sincronização com Cache Agressivo
// ============================================================
async function verificarAtualizacaoSW() {
    try {
        if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
            return;
        }
        
        const channel = new MessageChannel();
        const swPromise = navigator.serviceWorker.ready;
        
        channel.port1.onmessage = (event) => {
            if (event.data.type === 'CURRENT_VERSION') {
                const versaoAtual = sessionStorage.getItem('sw-version-verificado');
                const novaVersao = event.data.version;
                
                if (versaoAtual && versaoAtual !== novaVersao) {
                    console.log('[App] Nova versão do SW disponível:', novaVersao);
                    // Auto-reload se houver nova versão
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
                
                sessionStorage.setItem('sw-version-verificado', novaVersao);
            }
        };
        
        swPromise.then((registration) => {
            if (registration.active) {
                registration.active.postMessage(
                    { type: 'CHECK_UPDATE' },
                    [channel.port2]
                );
            }
        });
        
    } catch (err) {
        console.warn('[App] Erro ao verificar SW:', err);
    }
}

console.log('[App] Módulo carregado e pronto');


// ==========================================
// SISTEMA DE ESTUDOS TEMÁTICOS
// ==========================================
(function initStudyCards() {
    function setupStudyCard(cardId) {
        var btnCard = document.getElementById('btn-' + cardId);
        var telaCard = document.getElementById('tela-' + cardId);
        var btnVoltar = document.getElementById('voltar-' + cardId);
        
        if (btnCard && telaCard) {
            btnCard.onclick = function(e) {
                if (e) e.preventDefault();
                telaCard.style.display = 'block';
                document.body.style.overflow = 'hidden';
                console.log('[Cards] Abrindo: ' + cardId);
            };
        }
        
        if (btnVoltar && telaCard) {
            btnVoltar.onclick = function(e) {
                if (e) e.preventDefault();
                telaCard.style.display = 'none';
                document.body.style.overflow = 'auto';
                console.log('[Cards] Fechando: ' + cardId);
            };
        }
    }
    
    // Aguarda DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setupStudyCard('angelologia');
            setupStudyCard('escatologia');
            setupStudyCard('soteriologia');
            console.log('[Cards] Sistema de estudos inicializado');
        });
    } else {
        setupStudyCard('angelologia');
        setupStudyCard('escatologia');
        setupStudyCard('soteriologia');
        console.log('[Cards] Sistema de estudos inicializado');
    }
})();
// ============================================================
// profile.js - Sistema de Perfil do Usuário (nome + foto)
// Persistência via IndexedDB (funciona offline, PWA-friendly)
// ============================================================

const PROFILE_DB_NAME = "biblia3d-profile-db";
const PROFILE_STORE = "profile";
const PROFILE_KEY = "usuario";

let _profileDbPromise = null;

function abrirProfileDB() {
    if (_profileDbPromise) return _profileDbPromise;

    _profileDbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(PROFILE_DB_NAME, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(PROFILE_STORE)) {
                db.createObjectStore(PROFILE_STORE);
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });

    return _profileDbPromise;
}

async function salvarPerfil(nome, fotoBase64) {
    const db = await abrirProfileDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(PROFILE_STORE, "readwrite");
        const store = tx.objectStore(PROFILE_STORE);
        store.put({ nome: nome, foto: fotoBase64, atualizadoEm: Date.now() }, PROFILE_KEY);
        tx.oncomplete = () => resolve(true);
        tx.onerror = (event) => reject(event.target.error);
    });
}

async function carregarPerfil() {
    const db = await abrirProfileDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(PROFILE_STORE, "readonly");
        const store = tx.objectStore(PROFILE_STORE);
        const request = store.get(PROFILE_KEY);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function removerPerfil() {
    const db = await abrirProfileDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(PROFILE_STORE, "readwrite");
        const store = tx.objectStore(PROFILE_STORE);
        store.delete(PROFILE_KEY);
        tx.oncomplete = () => resolve(true);
        tx.onerror = (event) => reject(event.target.error);
    });
}

// Converte um arquivo de imagem (input file) em base64,
// já redimensionando para evitar fotos gigantes no IndexedDB
function arquivoParaBase64Redimensionado(file, tamanhoMax = 400) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith("image/")) {
            reject(new Error("Arquivo selecionado não é uma imagem válida."));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let largura = img.width;
                let altura = img.height;

                if (largura > altura && largura > tamanhoMax) {
                    altura = Math.round((altura * tamanhoMax) / largura);
                    largura = tamanhoMax;
                } else if (altura > tamanhoMax) {
                    largura = Math.round((largura * tamanhoMax) / altura);
                    altura = tamanhoMax;
                }

                const canvas = document.createElement("canvas");
                canvas.width = largura;
                canvas.height = altura;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, largura, altura);

                resolve(canvas.toDataURL("image/jpeg", 0.85));
            };
            img.onerror = () => reject(new Error("Falha ao processar a imagem."));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
        reader.readAsDataURL(file);
    });
}

// Gera saudação dinâmica baseada na hora do dia
function gerarSaudacao(hora = null) {
    if (hora === null) hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Bom dia";
    if (hora >= 12 && hora < 18) return "Boa tarde";
    return "Boa noite";
}

// Cria o header superior com saudação e nome do usuário
function criarHeaderNome() {
    if (document.getElementById("perfil-header")) return;

    const header = document.createElement("div");
    header.id = "perfil-header";
    header.className = "perfil-header";
    header.innerHTML = `
        <div class="perfil-header-conteudo">
            <div class="perfil-saudacao">
                <span id="perfil-saudacao-texto">Bem-vindo!</span>
            </div>
        </div>
    `;
    document.body.insertBefore(header, document.body.firstChild);
}

async function atualizarHeaderNome() {
    const saudacaoEl = document.getElementById("perfil-saudacao-texto");
    if (!saudacaoEl) return;

    try {
        const perfil = await carregarPerfil();
        const saudacao = gerarSaudacao();
        if (perfil && perfil.nome) {
            saudacaoEl.textContent = `${saudacao}, ${perfil.nome}!`;
        } else {
            saudacaoEl.textContent = `${saudacao}!`;
        }
    } catch (err) {
        console.error("Erro ao atualizar header:", err);
    }
}

// --- Injeta a UI do perfil na página ---
function criarUIPerfil() {
    if (document.getElementById("perfil-modal")) return;

    const overlay = document.createElement("div");
    overlay.id = "perfil-modal";
    overlay.className = "perfil-overlay perfil-oculto";
    overlay.innerHTML = `
        <div class="perfil-caixa">
            <button class="perfil-fechar" id="perfil-fechar-btn" aria-label="Fechar">&times;</button>
            <h2>Meu Perfil</h2>

            <div class="perfil-avatar-wrapper">
                <img id="perfil-avatar-preview" class="perfil-avatar" src="" alt="Foto de perfil" />
                <label for="perfil-foto-input" class="perfil-avatar-label">Alterar foto</label>
                <input type="file" id="perfil-foto-input" accept="image/*" hidden />
            </div>

            <label for="perfil-nome-input" class="perfil-label">Nome</label>
            <input type="text" id="perfil-nome-input" class="perfil-input" placeholder="Seu nome" maxlength="40" />

            <div class="perfil-botoes">
                <button id="perfil-salvar-btn" class="perfil-btn perfil-btn-primario">Salvar</button>
                <button id="perfil-remover-btn" class="perfil-btn perfil-btn-secundario">Remover foto/nome</button>
            </div>

            <p id="perfil-status" class="perfil-status"></p>
        </div>
    `;
    document.body.appendChild(overlay);

    const botaoAbrirPadrao = document.createElement("button");
    botaoAbrirPadrao.id = "perfil-abrir-btn";
    botaoAbrirPadrao.className = "perfil-botao-flutuante";
    botaoAbrirPadrao.title = "Meu Perfil";
    botaoAbrirPadrao.innerHTML = `<img id="perfil-avatar-mini" class="perfil-avatar-mini" src="" alt="" />`;
    document.body.appendChild(botaoAbrirPadrao);

    document.getElementById("perfil-abrir-btn").addEventListener("click", abrirModalPerfil);
    document.getElementById("perfil-fechar-btn").addEventListener("click", fecharModalPerfil);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) fecharModalPerfil();
    });

    document.getElementById("perfil-foto-input").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const base64 = await arquivoParaBase64Redimensionado(file);
            document.getElementById("perfil-avatar-preview").src = base64;
            document.getElementById("perfil-avatar-preview").dataset.novaFoto = base64;
        } catch (err) {
            mostrarStatus(err.message, true);
        }
    });

    document.getElementById("perfil-salvar-btn").addEventListener("click", async () => {
        const nome = document.getElementById("perfil-nome-input").value.trim();
        const preview = document.getElementById("perfil-avatar-preview");
        const foto = preview.dataset.novaFoto || preview.src || "";

        if (!nome) {
            mostrarStatus("Digite um nome antes de salvar.", true);
            return;
        }

        try {
            await salvarPerfil(nome, foto);
            await atualizarHeaderNome();
            atualizarAvatarMini(foto);
            mostrarStatus("Perfil salvo com sucesso!", false);
            setTimeout(fecharModalPerfil, 900);
        } catch (err) {
            mostrarStatus("Erro ao salvar perfil: " + err.message, true);
        }
    });

    document.getElementById("perfil-remover-btn").addEventListener("click", async () => {
        try {
            await removerPerfil();
            document.getElementById("perfil-nome-input").value = "";
            const preview = document.getElementById("perfil-avatar-preview");
            preview.src = avatarPadrao();
            delete preview.dataset.novaFoto;
            atualizarAvatarMini(avatarPadrao());
            mostrarStatus("Perfil removido.", false);
        } catch (err) {
            mostrarStatus("Erro ao remover perfil: " + err.message, true);
        }
    });
}

function avatarPadrao() {
    // Avatar SVG genérico embutido (sem depender de arquivo externo)
    return "data:image/svg+xml;utf8," + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" fill="#3a3f4b"/>
            <circle cx="50" cy="38" r="18" fill="#c8ccd4"/>
            <path d="M18 88 Q50 60 82 88 Z" fill="#c8ccd4"/>
        </svg>
    `);
}

function mostrarStatus(msg, erro) {
    const el = document.getElementById("perfil-status");
    if (!el) return;
    el.textContent = msg;
    el.className = "perfil-status" + (erro ? " perfil-status-erro" : " perfil-status-ok");
}

function atualizarAvatarMini(fotoSrc) {
    const mini = document.getElementById("perfil-avatar-mini");
    if (mini) mini.src = fotoSrc || avatarPadrao();
}

async function abrirModalPerfil() {
    const overlay = document.getElementById("perfil-modal");
    overlay.classList.remove("perfil-oculto");

    const perfil = await carregarPerfil().catch(() => null);
    const preview = document.getElementById("perfil-avatar-preview");
    const nomeInput = document.getElementById("perfil-nome-input");

    if (perfil) {
        nomeInput.value = perfil.nome || "";
        preview.src = perfil.foto || avatarPadrao();
    } else {
        nomeInput.value = "";
        preview.src = avatarPadrao();
    }
    delete preview.dataset.novaFoto;
    mostrarStatus("", false);
}

function fecharModalPerfil() {
    const overlay = document.getElementById("perfil-modal");
    if (overlay) overlay.classList.add("perfil-oculto");
}

// --- Inicialização automática ---
document.addEventListener("DOMContentLoaded", async () => {
    criarHeaderNome();
    criarUIPerfil();
    try {
        const perfil = await carregarPerfil();
        await atualizarHeaderNome();
    atualizarAvatarMini(perfil ? perfil.foto : null);
    } catch (err) {
        console.error("Falha ao carregar perfil salvo:", err);
        atualizarAvatarMini(null);
    }
});
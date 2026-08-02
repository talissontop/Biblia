// ==========================================
// MOTOR DE ESTUDOS - DEFINITIVO V3
// ==========================================
(function() {
    if (window.sistemaEstudosAtivo) return;
    window.sistemaEstudosAtivo = true;

    document.addEventListener('click', function(event) {
        var card = event.target.closest('.card-estudo');
        if (card) {
            event.preventDefault();
            var idCard = card.id; // ex: btn-angelologia
            var tema = idCard.replace('btn-', '');
            var tela = document.getElementById('tela-' + tema);
            
            console.log('[Estudos] Tentando abrir:', tema, tela);
            
            if (tela) {
                tela.style.display = 'block';
                tela.classList.add('tela-estudo-ativo');
                document.body.style.overflow = 'hidden';
                
                var caixa = tela.querySelector('.conteudo-estudo') || tela.querySelector('div > div:last-child');
                if (caixa && !caixa.getAttribute('data-carregado')) {
                    caixa.innerHTML = '<div style="text-align:center; padding:40px; color:#d4af37;">⏳ Carregando manuscrito...</div>';
                    
                    fetch('estudos/' + tema + '.html')
                        .then(function(res) {
                            if (!res.ok) throw new Error('Erro HTTP: ' + res.status);
                            return res.text();
                        })
                        .then(function(htmlText) {
                            caixa.innerHTML = htmlText;
                            caixa.setAttribute('data-carregado', 'true');
                            console.log('[Estudos] Sucesso ao carregar:', tema);
                        })
                        .catch(function(err) {
                            console.warn('[Estudos] Erro no fetch:', err);
                            caixa.innerHTML = '<div style="color:#ff6b6b; padding:20px;">Erro ao carregar o arquivo de estudo. Verifique se o arquivo /estudos/' + tema + '.html existe.</div>';
                        });
                }
            } else {
                console.error('[Estudos] ERRO: Tela não encontrada para ID: tela-' + tema);
                alert('Aviso: Tela de estudo não encontrada.');
            }
        }
        
        var btnVoltar = event.target.closest('.btn-voltar-estudo');
        if (btnVoltar) {
            event.preventDefault();
            var idVoltar = btnVoltar.id; // ex: voltar-angelologia
            var temaVoltar = idVoltar.replace('voltar-', '');
            var telaVoltar = document.getElementById('tela-' + temaVoltar);
            
            if (telaVoltar) {
                telaVoltar.style.display = 'none';
                telaVoltar.classList.remove('tela-estudo-ativo');
                document.body.style.overflow = 'auto';
            }
        }
    });
    console.log('[Estudos] Motor definitivo inicializado com sucesso.');
})();
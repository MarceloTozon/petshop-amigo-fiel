// Funções principais quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('PetShop Amigo Fiel - Sistema carregado');
    
    // Inicializar todas as funções
    initMascaras();
    initAutoCompleteCEP();
    initValidacaoFormularios();
    initBotoesCompra();
});

// Máscaras para os campos
function initMascaras() {
    // Máscara de telefone
    const telefoneInputs = document.querySelectorAll('input[type="tel"]');
    telefoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                if (value.length <= 10) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                } else {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                }
                e.target.value = value;
            }
        });
    });

    // Máscara de CPF
    const cpfInputs = document.querySelectorAll('input[name="cpf"]');
    cpfInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            }
        });
    });

    // Máscara de CEP
    const cepInputs = document.querySelectorAll('input[name="cep"]');
    cepInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 8) {
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            }
        });
    });
}

// AUTOCOMPLETAR CEP - Função principal CORRIGIDA
function initAutoCompleteCEP() {
    const cepInputs = document.querySelectorAll('input[name="cep"]');
    
    cepInputs.forEach(cepInput => {
        // Quando o usuário terminar de digitar o CEP
        cepInput.addEventListener('blur', function() {
            const cep = this.value.replace(/\D/g, '');
            
            // Verifica se o CEP tem 8 dígitos
            if (cep.length === 8) {
                buscarEnderecoPorCEP(cep);
            } else if (cep.length > 0) {
                mostrarMensagem('CEP inválido. Digite 8 números.', 'error');
            }
        });
    });
}

// Buscar endereço via API do ViaCEP - CORRIGIDO
function buscarEnderecoPorCEP(cep) {
    // Mostrar loading
    const cepInput = document.querySelector('input[name="cep"]');
    cepInput.disabled = true;
    const placeholderOriginal = cepInput.placeholder;
    cepInput.placeholder = 'Buscando CEP...';
    
    console.log('Buscando CEP:', cep);
    
    // Fazer requisição para a API ViaCEP
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede');
            }
            return response.json();
        })
        .then(data => {
            console.log('Dados retornados:', data);
            
            if (data.erro) {
                throw new Error('CEP não encontrado');
            }
            
            // Preencher os campos automaticamente
            preencherEndereco(data);
            mostrarMensagem('Endereço encontrado com sucesso!', 'success');
        })
        .catch(error => {
            console.error('Erro ao buscar CEP:', error);
            mostrarMensagem('CEP não encontrado. Verifique o número.', 'error');
        })
        .finally(() => {
            // Restaurar campo
            cepInput.disabled = false;
            cepInput.placeholder = placeholderOriginal;
        });
}

// Preencher os campos do formulário com os dados do CEP - CORRIGIDO
function preencherEndereco(dados) {
    console.log('Preenchendo endereço com:', dados);
    
    // Buscar campos de forma mais flexível
    const enderecoInput = document.querySelector('input[name="endereco"]');
    const bairroInput = document.querySelector('input[name="bairro"]');
    const cidadeInput = document.querySelector('input[name="cidade"]');
    
    // Preencher os campos encontrados
    if (enderecoInput && dados.logradouro) {
        enderecoInput.value = dados.logradouro;
        enderecoInput.classList.add('is-valid');
        console.log('Endereço preenchido:', dados.logradouro);
    }
    
    if (bairroInput && dados.bairro) {
        bairroInput.value = dados.bairro;
        bairroInput.classList.add('is-valid');
        console.log('Bairro preenchido:', dados.bairro);
    }
    
    if (cidadeInput && dados.localidade) {
        cidadeInput.value = dados.localidade;
        cidadeInput.classList.add('is-valid');
        console.log('Cidade preenchida:', dados.localidade);
    }
    
    // Remover as classes de validação após 3 segundos
    setTimeout(() => {
        const campos = document.querySelectorAll('.is-valid');
        campos.forEach(campo => campo.classList.remove('is-valid'));
    }, 3000);
    
    // Focar no campo de número para facilitar o preenchimento
    const numeroInput = document.querySelector('input[name="numero"]');
    if (numeroInput) {
        setTimeout(() => numeroInput.focus(), 500);
    }
}

// Validação de formulários
function initValidacaoFormularios() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validarFormulario(this)) {
                e.preventDefault();
                mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
            } else {
                // Simular envio bem-sucedido
                mostrarMensagem('Formulário enviado com sucesso! Entraremos em contato.', 'success');
                
                // Em um projeto real, aqui viria o AJAX para enviar os dados
                setTimeout(() => {
                    this.reset();
                    // window.location.href = 'index.html'; // Descomente para redirecionar
                }, 2000);
                
                e.preventDefault(); // Remover em produção
            }
        });
        
        // Validação em tempo real
        const camposObrigatorios = form.querySelectorAll('[required]');
        camposObrigatorios.forEach(campo => {
            campo.addEventListener('blur', function() {
                validarCampo(this);
            });
        });
    });
}

// Validar formulário completo
function validarFormulario(form) {
    let valido = true;
    const campos = form.querySelectorAll('[required]');
    
    campos.forEach(campo => {
        if (!validarCampo(campo)) {
            valido = false;
        }
    });
    
    return valido;
}

// Validar campo individual
function validarCampo(campo) {
    const valor = campo.value.trim();
    
    // Remover estados anteriores
    campo.classList.remove('is-valid', 'is-invalid');
    
    if (!valor) {
        campo.classList.add('is-invalid');
        return false;
    }
    
    // Validações específicas
    if (campo.type === 'email' && !validarEmail(valor)) {
        campo.classList.add('is-invalid');
        return false;
    }
    
    if (campo.name === 'cpf' && !validarCPF(valor)) {
        campo.classList.add('is-invalid');
        return false;
    }
    
    campo.classList.add('is-valid');
    return true;
}

// Validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validar CPF (validação básica)
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    return cpf.length === 11;
}

// Sistema de mensagens para o usuário
function mostrarMensagem(mensagem, tipo) {
    // Remover mensagens anteriores
    const mensagensAntigas = document.querySelectorAll('.alert-mensagem');
    mensagensAntigas.forEach(msg => msg.remove());
    
    // Criar nova mensagem
    const mensagemDiv = document.createElement('div');
    mensagemDiv.className = `alert alert-${tipo === 'error' ? 'danger' : 'success'} alert-mensagem position-fixed`;
    mensagemDiv.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: fadeIn 0.3s;
    `;
    mensagemDiv.innerHTML = `
        <strong>${tipo === 'error' ? '⚠️' : '✅'} </strong> ${mensagem}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(mensagemDiv);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (mensagemDiv.parentElement) {
            mensagemDiv.remove();
        }
    }, 5000);
}

// Inicializar botões de compra
function initBotoesCompra() {
    const botoesCompra = document.querySelectorAll('.btn-primary:not(form .btn-primary)');
    botoesCompra.forEach(botao => {
        if (botao.textContent.includes('Comprar')) {
            botao.addEventListener('click', function(e) {
                e.preventDefault();
                mostrarMensagem('Produto adicionado ao carrinho!', 'success');
            });
        }
    });
}

// Adicionar CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .is-valid {
        border-color: #198754 !important;
        background-color: #f8fff9 !important;
    }
    
    .is-invalid {
        border-color: #dc3545 !important;
    }
    
    .alert-mensagem {
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    input:disabled {
        background-color: #f8f9fa !important;
        opacity: 0.7;
    }
`;
document.head.appendChild(style);

// Função para testar o CEP (apenas para desenvolvimento)
function testarCEP() {
    // CEPs de exemplo para testar:
    // 01001000 - Praça da Sé, São Paulo
    // 90010004 - Centro, Porto Alegre
    // 22041011 - Copacabana, Rio de Janeiro
    
    const cepTeste = '01001000';
    const cepInput = document.querySelector('input[name="cep"]');
    if (cepInput) {
        cepInput.value = cepTeste;
        buscarEnderecoPorCEP(cepTeste.replace(/\D/g, ''));
    }
}

// Adicionar botão de teste (apenas em desenvolvimento)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', function() {
        const cepInput = document.querySelector('input[name="cep"]');
        if (cepInput) {
            const testButton = document.createElement('button');
            testButton.type = 'button';
            testButton.className = 'btn btn-sm btn-outline-secondary mt-1';
            testButton.textContent = 'Testar CEP (01001000)';
            testButton.onclick = testarCEP;
            cepInput.parentNode.appendChild(testButton);
        }
    });
}
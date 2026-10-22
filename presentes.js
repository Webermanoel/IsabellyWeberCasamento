const lista = document.getElementById("lista-presentes");
const busca = document.getElementById("busca-presente");
const contador = document.getElementById("contador-presentes");
const mensagemLista = document.getElementById("mensagem-lista");

const modal = document.getElementById("modal-presente");
const nomeModal = document.getElementById("nome-presente-modal");
const mensagemModal = document.getElementById("mensagem-modal");
const botaoConfirmar = document.getElementById("confirmar-presente");

let presentes = [];
let presenteSelecionado = null;

async function carregarPresentes() {
    lista.innerHTML = '<p class="estado-lista">Carregando presentes...</p>';
    mensagemLista.textContent = "";

    try {
        const resposta = await fetch("/api/presentes");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os presentes.");
        }

        presentes = await resposta.json();
        renderizarPresentes();
    } catch (erro) {
        console.error(erro);
        lista.innerHTML = `
            <p class="estado-lista">
                Não foi possível carregar a lista.
                Verifique sua conexão e tente novamente.
            </p>
        `;
        contador.textContent = "";
    }
}

function renderizarPresentes() {
    const termo = busca.value.trim().toLocaleLowerCase("pt-BR");

    const filtrados = presentes.filter(presente =>
        presente.nome.toLocaleLowerCase("pt-BR").includes(termo)
    );

    contador.textContent =
        `${presentes.length} presente(s) disponível(is)`;

    if (filtrados.length === 0) {
        lista.innerHTML = `
            <p class="estado-lista">
                Nenhum presente encontrado.
            </p>
        `;
        return;
    }

    lista.replaceChildren();

    filtrados.forEach(presente => {
        const cartao = document.createElement("button");
        cartao.type = "button";
        cartao.className = "cartao-presente";

        const icone = document.createElement("span");
        icone.className = "icone-cartao";
        icone.textContent = "🎁";

        const nome = document.createElement("span");
        nome.className = "nome-cartao";
        nome.textContent = presente.nome;

        cartao.append(icone, nome);

        cartao.addEventListener("click", () => {
            presenteSelecionado = presente;
            nomeModal.textContent = presente.nome;
            mensagemModal.textContent = "";
            botaoConfirmar.disabled = false;
            botaoConfirmar.textContent = "Sim, quero presentear!";
            modal.showModal();
        });

        lista.appendChild(cartao);
    });
}

async function confirmarPresente() {
    if (!presenteSelecionado) return;

    botaoConfirmar.disabled = true;
    mensagemModal.textContent = "Confirmando sua escolha...";

    try {
        const resposta = await fetch(
            `/api/presentes/${presenteSelecionado.id}/reservar`,
            { method: "POST" }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            mensagemModal.textContent =
                resultado.mensagem ||
                "Não foi possível reservar esse presente.";
            return;
        }

        presentes = presentes.filter(
            presente => presente.id !== presenteSelecionado.id
        );

        renderizarPresentes();

        mensagemModal.textContent =
            "Obrigado! Seu presente foi confirmado com sucesso.";

        botaoConfirmar.textContent = "Confirmado!";

        setTimeout(() => {
            modal.close();
            presenteSelecionado = null;
        }, 1800);
    } catch (erro) {
        console.error(erro);
        mensagemModal.textContent =
            "Erro de conexão. Tente novamente.";
    } finally {
        botaoConfirmar.disabled = false;
    }
}

busca.addEventListener("input", renderizarPresentes);
botaoConfirmar.addEventListener("click", confirmarPresente);

document.getElementById("fechar-modal").addEventListener("click", () => {
    modal.close();
});

document.getElementById("cancelar-presente").addEventListener("click", () => {
    modal.close();
});

carregarPresentes();


const CHAVE_PIX = "06235482167";

const botoesPix = document.querySelectorAll(".botao-pix");
const mensagemPix = document.getElementById("mensagem-pix");

botoesPix.forEach((botao) => {
    botao.addEventListener("click", async () => {
        const valor = Number(botao.dataset.valor);

        if (
            !CHAVE_PIX ||
            CHAVE_PIX === "COLOQUE_SUA_CHAVE_PIX_AQUI"
        ) {
            mensagemPix.textContent =
                "Configure a chave Pix antes de utilizar esta opção.";
            return;
        }

        try {
            await navigator.clipboard.writeText(CHAVE_PIX);

            mensagemPix.textContent =
                `Chave Pix copiada! No banco, informe R$ ${valor.toFixed(2).replace(".", ",")}.`;

        } catch (erro) {
            console.error("Erro ao copiar a chave Pix:", erro);

            mensagemPix.textContent =
                "Não foi possível copiar automaticamente. Tente acessar o site por HTTPS.";
        }
    });
});

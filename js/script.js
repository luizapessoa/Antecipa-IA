Papa.parse('data/base_merged.csv', {
    download: true,
    header: true,
    delimiter: ';',

    complete: function(results) {

        const dados = results.data.filter(
            linha => linha.ID_Contrato
        );

        // CONTRATOS ÚNICOS

        const contratosUnicos = [];
        const vistos = new Set();

        dados.forEach(row => {

            if (!vistos.has(row.ID_Contrato)) {

                vistos.add(row.ID_Contrato);
                contratosUnicos.push(row);

            }

        });

        // KPIs DASHBOARD

        document.getElementById('contratos').innerText =
            contratosUnicos.length;

            // --- ADICIONE APENAS ESTE TRECHO ABAIXO ---
        let somaProbabilidades = 0;
        dados.forEach(c => {
            somaProbabilidades += calcularProbabilidade(c);
        });
        const probMedia = (somaProbabilidades / dados.length).toFixed(1);
        
        // Coloca o valor no novo span do HTML
        document.getElementById('probabilidade-risco').textContent = probMedia;
        // ------------------------------------------
    

        const valorTotal =
            contratosUnicos.reduce(
                (acc, row) =>
                    acc + Number(row.Valor_Inadimplente_Inicial || 0),
                0
            );

        document.getElementById('valor').innerText =
            'R$ ' + valorTotal.toLocaleString('pt-BR');

        const taxaMedia =
            contratosUnicos.reduce(
                (acc, row) =>
                    acc + Number(row.Taxa_Recuperacao_Percentual || 0),
                0
            ) / contratosUnicos.length;

        document.getElementById('taxa').innerText =
            taxaMedia.toFixed(2) + '%';

        const saldoTotal =
            contratosUnicos.reduce(
                (acc, row) =>
                    acc + Number(row.Saldo_Devedor || 0),
                0
            );

        document.getElementById('saldo').innerText =
            'R$ ' + saldoTotal.toLocaleString('pt-BR');

        // FUNÇÃO AGRUPAR

        function agrupar(coluna) {

            return contratosUnicos.reduce((acc, row) => {

                const chave = row[coluna];

                if (!acc[chave]) {
                    acc[chave] = 0;
                }

                acc[chave]++;

                return acc;

            }, {});

        }

        // GRÁFICO STATUS

        const status = agrupar('Status_Cobranca');

        new Chart(
            document.getElementById('statusChart'),
            {
                type: 'doughnut',
                data: {
                    labels: Object.keys(status),
                    datasets: [{
                        data: Object.values(status)
                    }]
                },

                options: {
    plugins: {
        title: {
            display: true,
            text: 'Status de Cobrança'
        },
        legend: {
            position: 'top'
        }
    }
}
            }
        );

        // GRÁFICO REGIÃO

        const regiao = agrupar('Regiao_Cliente');

        new Chart(
            document.getElementById('regiaoChart'),
            {
                type: 'bar',
                data: {
                    labels: Object.keys(regiao),
                    datasets:[{
    label:'Quantidade de Contratos',
    data:Object.values(regiao)
}]
                },
                options: {
    plugins: {
        title: {
            display: true,
            text: 'Região dos Clientes'
        },
        legend: {
            position: 'top'
        }
    }
}
            }
        );

        // GRÁFICO RISCO

        const risco = agrupar('Classificacao_Risco');

        new Chart(
            document.getElementById('riscoChart'),
            {
                type: 'pie',
                data: {
                    labels: Object.keys(risco),
                    datasets: [{
                        data: Object.values(risco)
                    }]
                },
                options: {
    plugins: {
        title: {
            display: true,
            text: 'Classificação de Risco'
        },
        legend: {
            position: 'top'
        }
    }
}
            }
        );

        // TABELA CONTRATOS

        // TABELA CONTRATOS COM PAGINAÇÃO

const tbody =
document.querySelector("#tabelaContratos tbody");

const busca =
document.getElementById("buscaContrato");

const contador =
document.getElementById("contadorContratos");

const paginaTexto =
document.getElementById("paginaAtual");

const btnAnterior =
document.getElementById("btnAnterior");

const btnProxima =
document.getElementById("btnProxima");

let contratosFiltrados = [...contratosUnicos];

let paginaAtual = 1;

const registrosPorPagina = 100;

function renderizarTabela() {

    tbody.innerHTML = "";

    const inicio =
        (paginaAtual - 1) * registrosPorPagina;

    const fim =
        inicio + registrosPorPagina;

    const pagina =
        contratosFiltrados.slice(inicio, fim);

    pagina.forEach(c => {

        tbody.innerHTML += `
        <tr>
            <td>${c.ID_Contrato}</td>
            <td>${c.Nome_Assessoria}</td>
            <td>${c.Regiao_Cliente}</td>
            <td>
                R$ ${Number(
                    c.Valor_Inadimplente_Inicial
                ).toLocaleString('pt-BR')}
            </td>
            <td>${c.Dias_Em_Atraso_Inicial}</td>
            <td>${c.Status_Cobranca}</td>
            <td>${c.Classificacao_Risco}</td>
        </tr>
        `;

    });

    const totalPaginas =
        Math.ceil(
            contratosFiltrados.length /
            registrosPorPagina
        );

    paginaTexto.innerText =
        `Página ${paginaAtual} de ${totalPaginas}`;

    contador.innerText =
        `${contratosFiltrados.length.toLocaleString('pt-BR')} contratos encontrados`;

}

renderizarTabela();


// BUSCA

busca.addEventListener("input", () => {

    const termo =
        busca.value.toLowerCase();

    contratosFiltrados =
        contratosUnicos.filter(c =>

            String(c.ID_Contrato)
                .toLowerCase()
                .includes(termo)

            ||

            String(c.Nome_Assessoria)
                .toLowerCase()
                .includes(termo)

            ||

            String(c.Regiao_Cliente)
                .toLowerCase()
                .includes(termo)

            ||

            String(c.Classificacao_Risco)
                .toLowerCase()
                .includes(termo)

        );

    paginaAtual = 1;

    renderizarTabela();

});


// BOTÃO ANTERIOR

btnAnterior.addEventListener("click", () => {

    if (paginaAtual > 1) {

        paginaAtual--;

        renderizarTabela();

    }

});


// BOTÃO PRÓXIMA

btnProxima.addEventListener("click", () => {

    const totalPaginas =
        Math.ceil(
            contratosFiltrados.length /
            registrosPorPagina
        );

    if (paginaAtual < totalPaginas) {

        paginaAtual++;

        renderizarTabela();

    }

});
        // ALERTAS

        // ALERTAS COM PAGINAÇÃO

const alertas =
    contratosUnicos
    .filter(c =>
        Number(c.Dias_Em_Atraso_Inicial) > 180 ||
        c.Classificacao_Risco === 'Crítico'
    )
    .sort((a,b) =>
        Number(b.Saldo_Devedor) -
        Number(a.Saldo_Devedor)
    );

const alertasContainer =
    document.getElementById('alertasContainer');

const contadorAlertas =
    document.getElementById('contadorAlertas');

const paginaAlertaAtual =
    document.getElementById('paginaAlertaAtual');

const btnAlertaAnterior =
    document.getElementById('btnAlertaAnterior');

const btnAlertaProxima =
    document.getElementById('btnAlertaProxima');

let paginaAlerta = 1;

const alertasPorPagina = 20;

function renderizarAlertas() {

    alertasContainer.innerHTML = '';

    const inicio =
        (paginaAlerta - 1) * alertasPorPagina;

    const fim =
        inicio + alertasPorPagina;

    const pagina =
        alertas.slice(inicio, fim);

    pagina.forEach(c => {

        alertasContainer.innerHTML += `

        <div class="alerta-card">

            <div class="alerta-topo">
                🔴 ${c.Classificacao_Risco}
            </div>

            <h4>${c.ID_Contrato}</h4>

            <p>
                <strong>Assessoria:</strong>
                ${c.Nome_Assessoria}
            </p>

            <p>
                <strong>Região:</strong>
                ${c.Regiao_Cliente}
            </p>

            <p>
                <strong>Atraso:</strong>
                ${c.Dias_Em_Atraso_Inicial} dias
            </p>

            <p>
                <strong>Saldo:</strong>
                R$ ${Number(
                    c.Saldo_Devedor
                ).toLocaleString('pt-BR')}
            </p>

        </div>

        `;

    });

    const totalPaginas =
        Math.ceil(
            alertas.length /
            alertasPorPagina
        );

    paginaAlertaAtual.innerText =
        `Página ${paginaAlerta} de ${totalPaginas}`;

    contadorAlertas.innerText =
        `${alertas.length.toLocaleString('pt-BR')} alertas críticos encontrados`;

}

renderizarAlertas();

btnAlertaAnterior.addEventListener('click', () => {

    if (paginaAlerta > 1) {

        paginaAlerta--;

        renderizarAlertas();

    }

});

btnAlertaProxima.addEventListener('click', () => {

    const totalPaginas =
        Math.ceil(
            alertas.length /
            alertasPorPagina
        );

    if (paginaAlerta < totalPaginas) {

        paginaAlerta++;

        renderizarAlertas();

    }

});

        // ASSESSORIAS

// ASSESSORIAS

const assessorias = {};

contratosUnicos.forEach(c => {

    if (!c.Nome_Assessoria) return;

    const nome = c.Nome_Assessoria;

    if (!assessorias[nome]) {
        assessorias[nome] = [];
    }

    assessorias[nome].push(
        Number(c.Taxa_Recuperacao_Percentual || 0)
    );

});

const nomes = Object.keys(assessorias);

const medias = nomes.map(nome => {

    const valores = assessorias[nome];

    return (
        valores.reduce((a,b) => a+b,0)
        /
        valores.length
    );

});

// KPIs

document.getElementById('totalAssessorias')
    .innerText = nomes.length;

document.getElementById('melhorTaxa')
    .innerText =
    Math.max(...medias).toFixed(2) + '%';

document.getElementById('piorTaxa')
    .innerText =
    Math.min(...medias).toFixed(2) + '%';

document.getElementById('mediaAssessoria')
    .innerText =
    (
        medias.reduce((a,b)=>a+b,0)
        /
        medias.length
    ).toFixed(2) + '%';


// GRÁFICO ASSESSORIAS


new Chart(
    document.getElementById('rankingAssessoria'),
    {
        type: 'bar',

        data: {
            labels: nomes,

            datasets: [{
                label: 'Taxa Média de Recuperação (%)',
                data: medias
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            
            interaction: {
                intersect: true,
                mode: 'index',
            },

            plugins: {
                title: {
                    display: true,
                    text: 'Desempenho das Assessorias',
                    padding: {
                        top: 10,
                        bottom: 20
                    },
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 15
                    }
                }
            },

            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    }
);

      // GRÁFICO FAIXA DE ATRASO

const faixas = {
    '0-30 dias': 0,
    '31-60 dias': 0,
    '61-90 dias': 0,
    '91-180 dias': 0,
    '180+ dias': 0
};

contratosUnicos.forEach(c => {

    const atraso =
        Number(c.Dias_Em_Atraso_Inicial || 0);

    if (atraso <= 30) {

        faixas['0-30 dias']++;

    } else if (atraso <= 60) {

        faixas['31-60 dias']++;

    } else if (atraso <= 90) {

        faixas['61-90 dias']++;

    } else if (atraso <= 180) {

        faixas['91-180 dias']++;

    } else {

        faixas['180+ dias']++;

    }

});

    new Chart(
    document.getElementById('atrasoChart'),
    {
        type: 'bar',

        data: {
            labels: Object.keys(faixas),

            datasets: [{
                label: 'Quantidade de Contratos',
                data: Object.values(faixas)
            }]
        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            plugins: {

                title: {
                    display: true,
                    text: 'Distribuição por Faixa de Atraso'
                },

                legend: {
                    display: false
                }


            }

        }

    }
);

    }

});

function mostrarTela(id, botao) {

    document
        .querySelectorAll('.tela')
        .forEach(tela =>
            tela.classList.add('hidden'));

    document
        .getElementById(id)
        .classList.remove('hidden');

    document
        .querySelectorAll('.nav-btn')
        .forEach(btn =>
            btn.classList.remove('active'));

    botao.classList.add('active');

}

// ANÁLISE PREDITIVA

// 1. Deixe a sua função de cálculo pronta no escopo global
function calcularProbabilidade(c) {
    let score = 0;

    if (Number(c.Dias_Em_Atraso_Inicial) > 180)
        score += 40;

    if (c.Classificacao_Risco === 'Crítico')
        score += 40;

    if (Number(c.Score_Interno_Risco) < 400)
        score += 20;

    return Math.min(score, 100);
}

// 2. Chame o PapaParse (coloque o link ou a variável do seu arquivo CSV aqui)
Papa.parse(seuArquivoOuUrlCSV, {
    download: true, // Adicione se estiver buscando um arquivo por URL
    header: true,   // OBRIGATÓRIO: transforma cada linha em um objeto usando os títulos das colunas
    complete: function(results) {
        
        // Aqui dentro estão os seus 10.000 contratos
        const dados = results.data; 

        // Atualiza o contador de contratos para 10000
        document.getElementById('contratos').textContent = dados.length;

        let somaProbabilidades = 0;

        // O loop passa por cada contrato (c) da lista do CSV
        dados.forEach(c => {
            somaProbabilidades += calcularProbabilidade(c);
        });

        // Tira a média dos riscos e fixa em 1 casa decimal (ex: 45.2%)
        const probMedia = (somaProbabilidades / dados.length).toFixed(1);

        // Injeta o valor final no span criado no HTML
        document.getElementById('probabilidade-risco').textContent = probMedia;
    }
});
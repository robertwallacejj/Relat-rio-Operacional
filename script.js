document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRelatorio");
  const motoristasContainer = document.getElementById("motoristasContainer");
  const btnAddMotorista = document.getElementById("btnAddMotorista");
  const pmcsList = document.getElementById("pmcsList");
  const btnAddPMC = document.getElementById("btnAddPMC");
  const dashboard = document.getElementById("dashboard");
  const dashboardContent = dashboard.querySelector(".dashboard-content");
  const btnVoltar = document.getElementById("btnVoltar");

  let motoristaCount = 0;
  let pmcCount = 0;

  // Função para chamar backend e corrigir/formalizar texto via IA
  async function corrigirTextoIA(texto) {
    if (!texto.trim()) return "";
    try {
      const response = await fetch('http://localhost:3000/api/corrigir-texto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto })
      });

      const data = await response.json();
      if (data.error) {
        console.error("Erro ao corrigir texto:", data.error);
        return texto; // Retorna texto original se der erro
      }
      return data.textoCorrigido;
    } catch (error) {
      console.error("Erro na requisição:", error);
      return texto;
    }
  }

  // Criar bloco motorista
  function criarMotorista(id) {
    const div = document.createElement("div");
    div.classList.add("motorista-box");
    div.dataset.id = id;
    div.innerHTML = `
      <h3>Motorista ${id}</h3>
      <label>
        Nome:
        <input type="text" class="nomeMotorista" placeholder="Nome do motorista" required />
      </label>
      <label>
        Transportadora:
        <input type="text" class="transportadoraMotorista" placeholder="Transportadora" required />
      </label>
      <label>
        Total de Remessa:
        <input type="number" min="0" class="totalRemessaMotorista" placeholder="Total de remessa" required />
      </label>
      <label>
        Total de Box:
        <input type="number" min="0" class="totalBoxMotorista" placeholder="Total de box" required />
      </label>
      <button type="button" class="btn-remove-motorista">Remover</button>
    `;

    div.querySelector(".btn-remove-motorista").addEventListener("click", () => {
      div.remove();
    });

    return div;
  }

  // Criar item PMC
  function criarPMC(id) {
    const li = document.createElement("li");
    li.dataset.id = id;
    li.innerHTML = `
      <input type="text" class="inputPMC" placeholder="Digite o PMC" required />
      <button type="button" class="btn-remove-pmc" title="Remover PMC">×</button>
    `;

    li.querySelector(".btn-remove-pmc").addEventListener("click", () => {
      li.remove();
    });

    return li;
  }

  // Adicionar motorista ao container
  btnAddMotorista.addEventListener("click", () => {
    motoristaCount++;
    const motorista = criarMotorista(motoristaCount);
    motoristasContainer.appendChild(motorista);
  });

  // Adicionar PMC à lista
  btnAddPMC.addEventListener("click", () => {
    pmcCount++;
    const pmc = criarPMC(pmcCount);
    pmcsList.appendChild(pmc);
  });

  // Voltar para o formulário
  btnVoltar.addEventListener("click", () => {
    dashboard.hidden = true;
    form.style.display = "block";
    // Remove o botão de download ao voltar
    const btnDownloadExistente = document.getElementById('btnDownloadImagem');
    if (btnDownloadExistente) btnDownloadExistente.remove();
  });

  // Função para criar botão de download da imagem
  function criarBotaoDownload() {
    if (document.getElementById('btnDownloadImagem')) return; // Evita duplicar

    const btnDownload = document.createElement('button');
    btnDownload.id = 'btnDownloadImagem';
    btnDownload.textContent = '📥 Baixar imagem do relatório';
    btnDownload.style.marginTop = '10px';
    btnDownload.style.padding = '8px 12px';
    btnDownload.style.cursor = 'pointer';
    btnDownload.style.fontSize = '16px';

    dashboard.querySelector('.dashboard-header').appendChild(btnDownload);

    btnDownload.addEventListener('click', () => {
      // Usa html2canvas para capturar dashboardContent
      html2canvas(dashboardContent).then(canvas => {
        const link = document.createElement('a');
        link.download = `relatorio-operacional_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    });
  }

  // Submeter formulário e gerar dashboard
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Pegar valores dos campos gerais
    const dataOperacao = form.querySelector("#dataOperacao").value;
    const inicioOperacao = form.querySelector("#inicioOperacao").value;
    const totalProducao = form.querySelector("#totalProducao").value;
    let obsRaioX = form.querySelector("#obsRaioX").value.trim();

    // Last Mile
    const responsavelLastMile = form.querySelector("#responsavelLastMile").value.trim();
    const dataLastMile = form.querySelector("#dataLastMile").value;
    let obsLastMile = form.querySelector("#obsLastMile").value.trim();

    // Motoristas
    const motoristasInputs = motoristasContainer.querySelectorAll(".motorista-box");
    const motoristas = [];
    motoristasInputs.forEach(box => {
      const nome = box.querySelector(".nomeMotorista").value.trim();
      const transportadora = box.querySelector(".transportadoraMotorista").value.trim();
      const totalRemessa = box.querySelector(".totalRemessaMotorista").value.trim();
      const totalBox = box.querySelector(".totalBoxMotorista").value.trim();

      if (nome && transportadora && totalRemessa !== "" && totalBox !== "") {
        motoristas.push({ nome, transportadora, totalRemessa, totalBox });
      }
    });

    // PMCs
    const pmcsInputs = pmcsList.querySelectorAll(".inputPMC");
    const pmcs = [];
    pmcsInputs.forEach(input => {
      const val = input.value.trim();
      if (val) pmcs.push(val);
    });
    let obsLadoAR = form.querySelector("#obsLadoAR").value.trim();

    // Corrigir e formalizar textos via IA (espera async)
    obsRaioX = await corrigirTextoIA(obsRaioX);
    obsLastMile = await corrigirTextoIA(obsLastMile);
    obsLadoAR = await corrigirTextoIA(obsLadoAR);

    // Montar HTML motoristas
    const htmlMotoristas = motoristas.length > 0
      ? `<ul>` + motoristas.map(m =>
          `<li><strong>${m.nome}</strong> — Transportadora: ${m.transportadora}, Remessa: ${m.totalRemessa}, Box: ${m.totalBox}</li>`
        ).join("") + `</ul>`
      : "<p>Não há motoristas cadastrados.</p>";

    // Montar HTML PMC
    const htmlPMCs = pmcs.length > 0
      ? `<ul>` + pmcs.map(p => `<li>${p}</li>`).join("") + `</ul>`
      : "<p>Não há PMC cadastrados.</p>";

    // Montar dashboard
    dashboardContent.innerHTML = `
      <div>
        <h3>Dados da Operação</h3>
        <p><strong>Data:</strong> ${dataOperacao}</p>
        <p><strong>Início:</strong> ${inicioOperacao}</p>
        <p><strong>Total Produzido:</strong> ${totalProducao}</p>
        <p><strong>Observação Raio-X:</strong> ${obsRaioX || "-"}</p>
      </div>
      <div>
        <h3>Last Mile</h3>
        <p><strong>Responsável:</strong> ${responsavelLastMile}</p>
        <p><strong>Data:</strong> ${dataLastMile}</p>
        <p><strong>Observações:</strong> ${obsLastMile || "-"}</p>
        <h4>Motoristas:</h4>
        ${htmlMotoristas}
      </div>
      <div style="grid-column: span 2;">
        <h3>Lado AR</h3>
        <p><strong>PMC:</strong></p>
        ${htmlPMCs}
        <p><strong>Observação Lado AR:</strong> ${obsLadoAR || "-"}</p>
      </div>
    `;

    dashboard.hidden = false;
    form.style.display = "none";
    window.scrollTo({top: 0, behavior: 'smooth'});

    // Criar o botão para baixar imagem do dashboard
    criarBotaoDownload();
  });

  // Inicializa com um motorista e um PMC para facilitar
  btnAddMotorista.click();
  btnAddPMC.click();
});

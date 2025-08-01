document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRelatorio");
  const dashboard = document.getElementById("dashboard");
  const dashboardContent = dashboard.querySelector(".dashboard-content");
  const btnVoltar = document.getElementById("btnVoltar");
  const btnAddMotorista = document.getElementById("btnAddMotorista");
  const motoristasContainer = document.getElementById("motoristasContainer");
  const btnAddPMC = document.getElementById("btnAddPMC");
  const pmcsList = document.getElementById("pmcsList");
  const btnGerarPDF = document.getElementById("btnGerarPDF");

  let motoristaCount = 0;
  let pmcCount = 0;

  // Cria o bloco de motorista com feedback visual e acessibilidade
  function criarMotorista(id) {
    const div = document.createElement("div");
    div.className = "motorista-box";
    div.dataset.id = id;
    div.innerHTML = `
      <h3>Motorista ${id}</h3>
      <label>Nome:
        <input type="text" name="nomeMotorista[]" class="nomeMotorista" required autocomplete="off" />
      </label>
      <label>Transportadora:
        <input type="text" name="transportadoraMotorista[]" class="transportadoraMotorista" required autocomplete="off" />
      </label>
      <label>Total de Remessa:
        <input type="number" min="0" name="totalRemessaMotorista[]" class="totalRemessaMotorista" required />
      </label>
      <label>Total de Box:
        <input type="number" min="0" name="totalBoxMotorista[]" class="totalBoxMotorista" required />
      </label>
      <button type="button" class="btn-remove-motorista" aria-label="Remover motorista">Remover</button>
    `;
    const btnRemove = div.querySelector(".btn-remove-motorista");
    btnRemove.addEventListener("click", () => {
      div.style.transition = "opacity 0.3s";
      div.style.opacity = 0;
      setTimeout(() => div.remove(), 300);
    });
    return div;
  }

  // Cria item de PMC com feedback visual e acessibilidade
  function criarPMC(id) {
    const li = document.createElement("li");
    li.dataset.id = id;
    li.innerHTML = `
      <input type="text" name="pmcs[]" class="inputPMC" placeholder="Digite o PMC" required autocomplete="off" />
      <button type="button" class="btn-remove-pmc" aria-label="Remover PMC">×</button>
    `;
    const btnRemove = li.querySelector(".btn-remove-pmc");
    btnRemove.addEventListener("click", () => {
      li.style.transition = "opacity 0.3s";
      li.style.opacity = 0;
      setTimeout(() => li.remove(), 300);
    });
    return li;
  }


  // Evita duplicidade ao clicar rápido
  let addMotoristaLock = false;
  btnAddMotorista.addEventListener("click", () => {
    if (addMotoristaLock) return;
    addMotoristaLock = true;
    motoristaCount++;
    const motorista = criarMotorista(motoristaCount);
    motoristasContainer.appendChild(motorista);
    setTimeout(() => { addMotoristaLock = false; }, 200);
    // Foca no campo nome do novo motorista
    setTimeout(() => {
      motorista.querySelector(".nomeMotorista")?.focus();
    }, 10);
  });

  let addPMCLock = false;
  btnAddPMC.addEventListener("click", () => {
    if (addPMCLock) return;
    addPMCLock = true;
    pmcCount++;
    const pmc = criarPMC(pmcCount);
    pmcsList.appendChild(pmc);
    setTimeout(() => { addPMCLock = false; }, 200);
    // Foca no campo do novo PMC
    setTimeout(() => {
      pmc.querySelector(".inputPMC")?.focus();
    }, 10);
  });


  btnVoltar.addEventListener("click", () => {
    dashboard.classList.add("hidden");
    form.classList.remove("hidden");
    setTimeout(() => {
      form.scrollIntoView({ behavior: "smooth" });
    }, 100);
  });


  // Submissão do formulário: preenche dashboard e mostra
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const getVal = (sel) => form.querySelector(sel)?.value.trim() || "";

    // Coleta dados do formulário
    const liderOperacao = getVal("#liderOperacao");
    const responsavelRaioX = getVal("#responsavelRaioX");
    const dataOperacao = getVal("#dataOperacao");
    const inicioOperacao = getVal("#inicioOperacao");
    const totalProducao = Number(getVal("#totalProducao"));
    const obsRaioX = getVal("#obsRaioX");
    const responsavelLastMile = getVal("#responsavelLastMile");
    const dataLastMile = getVal("#dataLastMile");
    const obsLastMile = getVal("#obsLastMile");
    const responsavelLadoAR = getVal("#responsavelLadoAR");
    const obsLadoAR = getVal("#obsLadoAR");
    const pendenciasOperacionais = getVal("#pendenciasOperacionais");

    // Motoristas
    const motoristas = [...motoristasContainer.querySelectorAll(".motorista-box")].map(box => ({
      nome: box.querySelector(".nomeMotorista")?.value.trim(),
      transportadora: box.querySelector(".transportadoraMotorista")?.value.trim(),
      totalRemessa: Number(box.querySelector(".totalRemessaMotorista")?.value),
      totalBox: Number(box.querySelector(".totalBoxMotorista")?.value)
    })).filter(m => m.nome && m.transportadora);

    // PMCs
    const pmcs = [...pmcsList.querySelectorAll(".inputPMC")].map(input => input.value.trim()).filter(Boolean);


    // Função para formatar números (milhar, decimal, símbolo)
    function formatNumber(num, opts = {}) {
      if (typeof num !== 'number' || isNaN(num)) return '';
      return num.toLocaleString('pt-BR', {
        minimumFractionDigits: opts.decimal || 0,
        maximumFractionDigits: opts.decimal || 0
      }) + (opts.sufixo || '');
    }

    // Função para capitalizar nomes
    function capitalize(str) {
      return (str || '').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Preenche os elementos do dashboard
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText("dashLiderOperacao", capitalize(liderOperacao));
    setText("dashResponsavelRaioX", capitalize(responsavelRaioX));
    setText("dashDataOperacao", dataOperacao);
    setText("dashInicioOperacao", inicioOperacao);
    setText("dashTotalProducao", formatNumber(totalProducao));
    setText("dashObsRaioX", obsRaioX);
    setText("dashResponsavelLastMile", capitalize(responsavelLastMile));
    setText("dashDataLastMile", dataLastMile);
    setText("dashObsLastMile", obsLastMile);
    setText("dashResponsavelLadoAR", capitalize(responsavelLadoAR));
    setText("dashObsLadoAR", obsLadoAR);
    setText("dashPendenciasOperacionais", pendenciasOperacionais);

    // Resumo Motoristas e PMCs
    setText("dashResumoMotoristas", motoristas.length);
    setText("dashResumoPMCs", pmcs.length);

    // PMCs no dashboard (ordenação alfabética)
    const dashPMCsList = document.getElementById("dashPMCsList");
    dashPMCsList.innerHTML = "";
    pmcs.slice().sort((a, b) => a.localeCompare(b, 'pt-BR')).forEach(p => {
      const li = document.createElement("li");
      li.textContent = p;
      dashPMCsList.appendChild(li);
    });

    // Motoristas no dashboard (ordenação por nome)
    const dashMotoristasList = document.getElementById("dashMotoristasList");
    dashMotoristasList.innerHTML = "";
    motoristas.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).forEach(m => {
      const li = document.createElement("li");
      li.textContent = `${capitalize(m.nome)} - ${capitalize(m.transportadora)} - Remessas: ${formatNumber(m.totalRemessa)} | Boxes: ${formatNumber(m.totalBox)}`;
      dashMotoristasList.appendChild(li);
    });

    // Status Operacional
    setText("dashStatusRaioX", obsRaioX ? "OK" : "Pendente");
    setText("dashStatusLastMile", obsLastMile ? "OK" : "Pendente");
    setText("dashStatusLadoAR", obsLadoAR ? "OK" : "Pendente");

    // Insights Rápidos
    const dashInsightsRapidos = document.getElementById("dashInsightsRapidos");
    dashInsightsRapidos.innerHTML = "";
    if (totalProducao > 0) {
      dashInsightsRapidos.innerHTML += `<li>Produção registrada: <b>${formatNumber(totalProducao)}</b></li>`;
    }
    if (motoristas.length > 0) {
      dashInsightsRapidos.innerHTML += `<li>${motoristas.length} motorista(s) cadastrados</li>`;
    }
    if (pmcs.length > 0) {
      dashInsightsRapidos.innerHTML += `<li>${pmcs.length} PMC(s) registrados</li>`;
    }
    if (pendenciasOperacionais) {
      dashInsightsRapidos.innerHTML += `<li><b>Pendências:</b> ${pendenciasOperacionais}</li>`;
    }


    dashboard.classList.remove("hidden");
    form.classList.add("hidden");
    setTimeout(() => {
      dashboard.scrollIntoView({ behavior: "smooth" });
    }, 100);
  });


  // Geração de PDF (se botão existir)
  if (btnGerarPDF) {
    btnGerarPDF.addEventListener("click", () => {
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) {
        alert("Biblioteca jsPDF não carregada.");
        return;
      }
      html2canvas(dashboardContent).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4'
        });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`relatorio_operacional_${new Date().toISOString().slice(0, 10)}.pdf`);
      });
    });
  }

  // Adiciona um campo inicial para motorista e PMC
  if (motoristasContainer.childElementCount === 0) btnAddMotorista.click();
  if (pmcsList.childElementCount === 0) btnAddPMC.click();
});

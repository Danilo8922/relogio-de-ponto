// Supondo que o ID do funcionário venha pela URL (?id=123)
function getUsuarioId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function carregarRelatorio() {
  const usuario_id = getUsuarioId();
  if (!usuario_id) {
    alert("Funcionário não encontrado.");
    return;
  }

  fetch(`/relatorio/${usuario_id}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("nome-funcionario").textContent = `Relatório de: ${data.nome}`;
      const tbody = document.querySelector("#tabela-registros tbody");
      tbody.innerHTML = "";

      data.registros.forEach(reg => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${reg.data}</td>
            <td>${reg.hora_entrada}</td>
            <td>${reg.hora_saida || "--:--"}</td>
            <td>${reg.atraso || "00:00"}</td>
        `;
        tbody.appendChild(tr);
      });
    });
}

// PDF
document.getElementById("btnBaixarPDF").addEventListener("click", () => {
  const funcionarioId = getUsuarioId();
  fetch(`/relatorio/${funcionarioId}/pdf`)
    .then(response => {
      if (!response.ok) throw new Error("Erro ao gerar PDF");
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_funcionario_${funcionarioId}.pdf`;
      a.click();
    });
});

carregarRelatorio();

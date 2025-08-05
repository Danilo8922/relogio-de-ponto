document.addEventListener("DOMContentLoaded", () => {
  const tabela = document.getElementById("tabelaFuncionarios");

  async function carregarFuncionarios() {
    const res = await fetch("http://localhost:3000/api/funcionarios");
    const funcionarios = await res.json();

    tabela.innerHTML = "";

    funcionarios.forEach(f => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${f.nome}</td>
        <td>${f.login}</td>
        <td>${f.horario_entrada}</td>
        <td>${f.horario_saida}</td>
        <td>
          <button class="btn btn-primary btn-sm me-1" onclick="editar(${f.id})">Editar</button>
          <button class="btn btn-danger btn-sm me-1" onclick="deletar(${f.id})">Deletar</button>
          <button class="btn btn-secondary btn-sm" onclick="verRelatorio(${f.id})">Relatório</button>
        </td>
      `;
      tabela.appendChild(tr);
    });
  }

  window.editar = (id) => {
    window.location.href = `editar.html?id=${id}`;
  };

  window.deletar = async (id) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      await fetch(`http://localhost:3000/api/funcionarios/${id}`, {
        method: "DELETE"
      });
      carregarFuncionarios();
    }
  };

  window.verRelatorio = (id) => {
    window.location.href = `relatorio.html?id=${id}`;
  };

  carregarFuncionarios();
});

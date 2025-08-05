document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formEdicao");

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  async function carregarFuncionario() {
    const res = await fetch(`http://localhost:3000/api/funcionarios/${id}`);
    const funcionario = await res.json();

    document.getElementById("id").value = funcionario.id;
    document.getElementById("nome").value = funcionario.nome;
    document.getElementById("cpf").value = funcionario.cpf;
    document.getElementById("telefone").value = funcionario.telefone;
    document.getElementById("login").value = funcionario.login;
    document.getElementById("senha").value = funcionario.senha;
    document.getElementById("entrada").value = funcionario.horario_entrada;
    document.getElementById("saida").value = funcionario.horario_saida;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      nome: document.getElementById("nome").value,
      cpf: document.getElementById("cpf").value,
      telefone: document.getElementById("telefone").value,
      login: document.getElementById("login").value,
      senha: document.getElementById("senha").value,
      horario_entrada: document.getElementById("entrada").value,
      horario_saida: document.getElementById("saida").value
    };

    const res = await fetch(`http://localhost:3000/api/funcionarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const result = await res.json();

    if (result.sucesso) {
      alert("Funcionário atualizado com sucesso!");
      window.location.href = "painel_adm.html";
    } else {
      alert("Erro ao atualizar funcionário");
    }
  });

  carregarFuncionario();
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastro");

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

    try {
      const response = await fetch("http://localhost:3000/api/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });

      const result = await response.json();

      if (result.sucesso) {
        alert("Funcionário cadastrado com sucesso!");
        form.reset();
      } else {
        alert("Erro ao cadastrar.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao enviar dados.");
    }
  });
});




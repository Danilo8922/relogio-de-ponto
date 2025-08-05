document.addEventListener("DOMContentLoaded", () => {
  const nomeUsuario = document.getElementById("nomeUsuario");
  const dataAtual = document.getElementById("dataAtual");
  const horaAtual = document.getElementById("horaAtual");
  const aviso = document.getElementById("avisoAtraso");
  const botaoEntrada = document.getElementById("botaoPonto");
  const botaoSaida = document.getElementById("botaoSaida");

  const loginFuncionario = prompt("Digite seu login para testar:");
  let dadosUsuario = null;

  const now = new Date();
  const data = now.toISOString().split("T")[0];

  // Atualiza hora
  setInterval(() => {
    const agora = new Date();
    dataAtual.textContent = agora.toLocaleDateString();
    horaAtual.textContent = agora.toLocaleTimeString();
    verificarBloqueios(); // Checa horários a cada segundo
  }, 1000);

  async function buscarFuncionario() {
    const res = await fetch("http://localhost:3000/api/funcionario/" + loginFuncionario);
    const usuario = await res.json();
    dadosUsuario = usuario;
    nomeUsuario.textContent = usuario.nome;
    verificarHorario(usuario.horario_entrada);
  }

  function verificarHorario(horarioEntrada) {
    const agora = new Date();
    const [h, m] = horarioEntrada.split(":").map(Number);
    const horarioEntradaDate = new Date();
    horarioEntradaDate.setHours(h, m, 0);

    const diffMin = Math.floor((agora - horarioEntradaDate) / 60000);

    if (diffMin > 0) {
      aviso.textContent = `⏰ Você está atrasado em ${diffMin} minuto(s)!`;
      aviso.classList.add("text-danger");
    } else if (diffMin >= -10) {
      aviso.textContent = `⚠️ Faltam ${Math.abs(diffMin)} minuto(s) para o horário de entrada`;
      aviso.classList.add("text-warning");
    } else {
      aviso.textContent = "";
      aviso.className = "";
    }
  }

  // Verifica se já registrou entrada ou saída hoje
  async function verificarBloqueios() {
    const agora = new Date();
    const horaAtualStr = agora.toTimeString().split(" ")[0];

    const res = await fetch(`http://localhost:3000/relatorio/${dadosUsuario.id}`);
    const json = await res.json();
    const registrosHoje = json.registros.filter(r => r.data === data);

    const entradaRegistrada = registrosHoje.some(r => r.hora_entrada);
    const saidaRegistrada = registrosHoje.some(r => r.hora_saida);

    // Verifica horário de entrada e saída
    const [eh, em] = dadosUsuario.horario_entrada.split(":").map(Number);
    const [sh, sm] = dadosUsuario.horario_saida.split(":").map(Number);

    const entradaLiberada = (() => {
      const target = new Date();
      target.setHours(eh, em - 30, 0);
      return agora >= target;
    })();

    const saidaLiberada = (() => {
      const target = new Date();
      target.setHours(sh, sm, 0);
      return agora >= target;
    })();

    botaoEntrada.disabled = entradaRegistrada || !entradaLiberada;
    botaoSaida.disabled = !entradaRegistrada || saidaRegistrada || !saidaLiberada;
  }

  // Registrar entrada
  botaoEntrada.addEventListener("click", async () => {
    const now = new Date();
    const hora = now.toTimeString().split(" ")[0];

    const [h, m] = dadosUsuario.horario_entrada.split(":").map(Number);
    const entradaDate = new Date();
    entradaDate.setHours(h, m, 0);
    const atrasoMin = Math.max(0, Math.floor((now - entradaDate) / 60000));

    const body = {
      usuario_id: dadosUsuario.id,
      data: data,
      hora_entrada: hora,
      atraso: atrasoMin > 0 ? `${atrasoMin} min` : "0"
    };

    const response = await fetch("http://localhost:3000/api/registrar-ponto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    if (result.sucesso) {
      alert("Ponto registrado com sucesso!");
      botaoEntrada.disabled = true;
    } else {
      alert("Erro ao registrar ponto");
    }
  });

  // Registrar saída
  botaoSaida.addEventListener("click", async () => {
    const now = new Date();
    const hora = now.toTimeString().split(" ")[0];

    const body = {
      usuario_id: dadosUsuario.id,
      data: data,
      hora_saida: hora
    };

    const response = await fetch("http://localhost:3000/api/registrar-saida", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (result.sucesso) {
      alert("Saída registrada com sucesso!");
      botaoSaida.disabled = true;
    } else {
      alert("Erro ao registrar saída");
    }
  });

  buscarFuncionario();
});

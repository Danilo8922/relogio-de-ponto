document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
    login: document.getElementById("login").value,
    senha: document.getElementById("senha").value
    };

    const response = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
    });

    const resultado = await response.json();

    if (resultado.sucesso) {
    if (resultado.tipo === "adm") {
        window.location.href = "painel-adm.html";
    } else {
        window.location.href = "ponto.html"; // criamos depois
    }
    } else {
    alert("Login ou senha incorretos");
    }
});
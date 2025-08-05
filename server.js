const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // serve os arquivos HTML e JS

// Banco de dados
const db = new sqlite3.Database('./db/banco.sqlite', (err) => {
  if (err) return console.error(err.message);
  console.log("📦 Banco de dados conectado com sucesso!");
});

// Criar tabela se não existir
db.run(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    cpf TEXT,
    telefone TEXT,
    login TEXT UNIQUE,
    senha TEXT,
    horario_entrada TEXT,
    horario_saida TEXT,
    tipo TEXT DEFAULT 'funcionario'
  )
`);

db.get(`SELECT * FROM usuarios WHERE login = 'admin'`, (err, row) => {
  if (err) return console.error(err.message);
  if (!row) {
    db.run(`
      INSERT INTO usuarios (nome, cpf, telefone, login, senha, horario_entrada, horario_saida, tipo)
      VALUES ('Administrador', '00000000000', '000000000', 'admin', 'admin123', '08:00', '18:00', 'adm')
    `, (err) => {
      if (err) return console.error("Erro ao criar admin:", err.message);
      console.log("👤 Usuário admin criado com sucesso!");
    });
  }
});

// Rota para cadastrar funcionário
app.post('/api/cadastrar', (req, res) => {
  const { nome, cpf, telefone, login, senha, horario_entrada, horario_saida } = req.body;

  const query = `
    INSERT INTO usuarios (nome, cpf, telefone, login, senha, horario_entrada, horario_saida)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [nome, cpf, telefone, login, senha, horario_entrada, horario_saida], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ erro: 'Erro ao cadastrar funcionário' });
    }
    res.json({ sucesso: true, id: this.lastID });
  });
});

// rota do registro de ponto 

db.run(`
  CREATE TABLE IF NOT EXISTS registros_ponto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    data TEXT,
    hora_entrada TEXT,
    hora_saida TEXT,
    atraso TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)

)
`);

app.post("/api/registrar-ponto", (req, res) => {
  const { usuario_id, data, hora_entrada, atraso } = req.body;

  const query = `
    INSERT INTO registros_ponto (usuario_id, data, hora_entrada, hora_saida, atraso)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [usuario_id, data, hora_entrada, atraso], function(err) {
    if (err) return res.status(500).json({ sucesso: false });
    res.json({ sucesso: true });
  });
});



// Rota de login
app.post("/api/login", (req, res) => {
  const { login, senha } = req.body;

  db.get(`SELECT * FROM usuarios WHERE login = ? AND senha = ?`, [login, senha], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ sucesso: false });
    }

    if (row) {
      res.json({ sucesso: true, tipo: row.tipo, nome: row.nome });
    } else {
      res.json({ sucesso: false });
    }
  });
});

app.get("/api/funcionario/:login", (req, res) => {
  const login = req.params.login;
  db.get("SELECT * FROM usuarios WHERE login = ?", [login], (err, row) => {
    if (err) return res.status(500).json({ erro: true });
    res.json(row);
  });
});


app.get("/api/funcionarios", (req, res) => {
  db.all("SELECT * FROM usuarios WHERE tipo != 'adm'", (err, rows) => {
    if (err) return res.status(500).json({ erro: true });
    res.json(rows);
  });
});

app.delete("/api/funcionarios/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM usuarios WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ erro: true });
    res.json({ sucesso: true });
  });
});

app.get("/api/funcionarios/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM usuarios WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ erro: true });
    res.json(row);
  });
});

app.put("/api/funcionarios/:id", (req, res) => {
  const id = req.params.id;
  const { nome, cpf, telefone, login, senha, horario_entrada, horario_saida } = req.body;

  const query = `
    UPDATE usuarios
    SET nome = ?, cpf = ?, telefone = ?, login = ?, senha = ?, horario_entrada = ?, horario_saida = ?
    WHERE id = ?
  `;

  db.run(query, [nome, cpf, telefone, login, senha, horario_entrada, horario_saida, id], function(err) {
    if (err) return res.status(500).json({ sucesso: false });
    res.json({ sucesso: true });
  });
})

app.put("/api/registrar-saida", (req, res) => {
  const { usuario_id, data, hora_saida } = req.body;

  const query = `
    UPDATE registros_ponto
    SET hora_saida = ?
    WHERE usuario_id = ? AND data = ?
  `;

  db.run(query, [hora_saida, usuario_id, data], function(err) {
    if (err) {
      console.error("Erro ao registrar saída:", err.message);
      return res.status(500).json({ sucesso: false });
    }

    if (this.changes === 0) {
      return res.status(404).json({ sucesso: false, mensagem: "Registro de entrada não encontrado" });
    }

    res.json({ sucesso: true });
  });
});







app.get("/relatorio/:id", (req, res) => {
  const funcionarioId = req.params.id;
  const db = new sqlite3.Database("./db/banco.sqlite");;

  db.get(
    `SELECT nome FROM usuarios WHERE id = ?`,
    [funcionarioId],
    (err, funcionario) => {
      if (err || !funcionario) {
        return res.status(404).json({ erro: "Funcionário não encontrado" });
      }

      db.all(
        `SELECT * FROM  registros_ponto WHERE usuario_id = ? ORDER BY data ASC`,
        [funcionarioId],
        (err2, registros) => {
          if (err2) {
            return res.status(500).json({ erro: "Erro ao buscar registros" });
          }

          res.json({
            nome: funcionario.nome,
            registros: registros
          });
        }
      );
    }
  );
});

app.get("/relatorio/:id/pdf", (req, res) => {
  const funcionarioId = req.params.id;
  const db = new sqlite3.Database("./db/banco.sqlite");

  db.get(
    `SELECT nome FROM usuarios WHERE id = ?`,
    [funcionarioId],
    (err, funcionario) => {
      if (err || !funcionario) {
        return res.status(404).send("Funcionário não encontrado");
      }

      db.all(
        `SELECT * FROM registros_ponto WHERE usuario_id = ? ORDER BY data ASC`,
        [funcionarioId],
        (err2, registros) => {
          if (err2) {
            return res.status(500).send("Erro ao buscar registros");
          }

          const doc = new PDFDocument({ margin: 50 });

          res.setHeader('Content-disposition', `attachment; filename=relatorio_funcionario_${funcionarioId}.pdf`);
          res.setHeader('Content-type', 'application/pdf');

          doc.pipe(res);

          // Inserir logo
          const imagePath = path.join(__dirname, 'img', 'logo.png');

          try {
            doc.image(imagePath, 50, 50, { width: 80 }); // logo à esquerda
          } catch (imgErr) {
            console.error("Erro ao carregar imagem:", imgErr.message);
          }

          // Título ao lado da imagem
          doc.fontSize(20).text(`Relatório de Ponto`, 140, 65, { align: 'left' });

          doc.moveDown(2);
          doc.fontSize(14).text(`Funcionário: ${funcionario.nome}`);
          doc.moveDown();

          // Tabela
          doc.fontSize(12);
          doc.text(`Data  | Entrada | Saída   | Atraso`);
          doc.text(`------------------------------------------`);
          registros.forEach(reg => {
          doc.text(`${reg.data} | ${reg.hora_entrada || '--:--'} | ${reg.hora_saida || '--:--'} | ${reg.atraso || '00:00'}`);
          });
          doc.end();
        }
      );
    }
  );
});







app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});


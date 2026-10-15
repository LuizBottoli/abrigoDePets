import express from "express";

const app = express();
app.use(express.json());

const pets = [
  { idPet: 1, dsNome: "Bob", dsEspecie: "cachorro", nuIdade: 3, fgAdotado: false },
  { idPet: 2, dsNome: "Mia", dsEspecie: "gato", nuIdade: 1, fgAdotado: false },
  { idPet: 3, dsNome: "Flocos", dsEspecie: "coelho", nuIdade: 2, fgAdotado: true },
];
let ultimoId = 3;

function buscarTodos() {
  return pets;
}

function buscarUm(id) {
  return pets.find((pet) => pet.idPet === id);
}

function criar({ dsNome, dsEspecie, nuIdade }) {
  ultimoId++;
  const novoPet = {
    idPet: ultimoId,
    dsNome: dsNome.trim(),
    dsEspecie: dsEspecie.trim(),
    nuIdade,
    fgAdotado: false,
  };
  pets.push(novoPet);
  return novoPet;
}

// Recebe apenas campos que ja foi validado.
function editar(id, campos) {
  const pet = buscarUm(id);
  if (!pet) return undefined;

  if (campos.dsNome !== undefined) pet.dsNome = campos.dsNome.trim();
  if (campos.dsEspecie !== undefined) pet.dsEspecie = campos.dsEspecie.trim();
  if (campos.nuIdade !== undefined) pet.nuIdade = campos.nuIdade;
  if (campos.fgAdotado !== undefined) pet.fgAdotado = campos.fgAdotado;
  return pet;
}

function deletar(id) {
  const indice = pets.findIndex((pet) => pet.idPet === id);
  if (indice === -1) return false;
  pets.splice(indice, 1);
  return true;
}

//validacoes auxiliares
const textoValido = (v) => typeof v === "string" && v.trim() !== "";
const idadeValida = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0;

// rotas get
app.get("/pets", (req, res) => {
  res.status(200).json(buscarTodos());
});

app.get("/pets/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ mensagem: "identificador deve ser um numero" });
  }

  const pet = buscarUm(id);
  if (!pet) return res.sendStatus(404);

  res.status(200).json(pet);
});

//rotas post
app.post("/pets", (req, res) => {
  const { dsNome, dsEspecie, nuIdade } = req.body ?? {};

  if (!textoValido(dsNome)) {
    return res.status(400).json({ mensagem: "dsNome é obrigatório e não pode ser vazio" });
  }
  if (!textoValido(dsEspecie)) {
    return res.status(400).json({ mensagem: "dsEspecie é obrigatório e não pode ser vazio" });
  }
  if (!idadeValida(nuIdade)) {
    return res
      .status(400)
      .json({ mensagem: "nuIdade é obrigatório e deve ser um número maior ou igual a 0" });
  }

  // idPet e fgAdotado enviados no body são ignorados
  const novoPet = criar({ dsNome, dsEspecie, nuIdade });
  res.status(201).json(novoPet);
});

//rotas patch
app.patch("/pets/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ mensagem: "identificador deve ser um numero" });
  }

  if (!buscarUm(id)) return res.sendStatus(404);

  const body = req.body ?? {};
  const campos = {};

  if ("dsNome" in body) {
    if (!textoValido(body.dsNome)) {
      return res.status(400).json({ mensagem: "dsNome não pode ser vazio" });
    }
    campos.dsNome = body.dsNome;
  }
  if ("dsEspecie" in body) {
    if (!textoValido(body.dsEspecie)) {
      return res.status(400).json({ mensagem: "dsEspecie não pode ser vazio" });
    }
    campos.dsEspecie = body.dsEspecie;
  }
  if ("nuIdade" in body) {
    if (!idadeValida(body.nuIdade)) {
      return res
        .status(400)
        .json({ mensagem: "nuIdade deve ser um número maior ou igual a 0" });
    }
    campos.nuIdade = body.nuIdade;
  }
  if ("fgAdotado" in body) {
    if (typeof body.fgAdotado !== "boolean") {
      return res.status(400).json({ mensagem: "fgAdotado deve ser true ou false" });
    }
    campos.fgAdotado = body.fgAdotado;
  }

  // idPet é ignorado, se nada valido sobrou, da erro
  if (Object.keys(campos).length === 0) {
    return res.status(400).json({
      mensagem: "envie ao menos um campo válido: dsNome, dsEspecie, nuIdade ou fgAdotado",
    });
  }

  // Só chega aqui se todos os campos enviados são válidos
  res.status(200).json(editar(id, campos));
});
//rota delete
app.delete("/pets/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ mensagem: "identificador deve ser um numero" });
  }

  if (!deletar(id)) return res.sendStatus(404);

  res.sendStatus(204);
});

//api rodando na porta 3000
app.listen(3000, () => {
  console.log("API do abrigo rodando em http://localhost:3000");
});
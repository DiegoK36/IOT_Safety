const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Importamos modelos
import Usuario from "../models/usuario.js";

// Registro
router.post("/registro", async (req, res) => {
  try {
    const passwd = req.body.passwd;
    const name = req.body.name;
    const email = req.body.email;

    const encryptedPasswd = bcrypt.hashSync(passwd, 10);

    const newUser = {
      name: name,
      email: email,
      passwd: encryptedPasswd,
    };

    var user = await Usuario.create(newUser);
  } catch (error) {
    console.log("ERROR - Registro");
    console.log(error);

    const toSend = {
      status: "Error",
      error: error,
    };

    res.status(500).json(toSend);
  }
});

// Iniciar Sesión
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const passwd = req.body.passwd;

  var usuario_login = await Usuario.findOne({ email: email });

  // Si no existe el Email
  if (!usuario_login) {
    const toSend = {
      status: "Error",
      error: "Credenciales Inválidas",
    };
    return res.status(401).json(toSend);
  }

  // Si el Email y Passwd OK
  if (bcrypt.compareSync(passwd, usuario_login.passwd)) {
    usuario_login.set("passwd", undefined, { strict: false });

    const token = jwt.sign({ userData: usuario_login }, "securePasswd", {
      expiresIn: 60 * 60,
    });

    const toSend = {
      status: "Acierto",
      token: token,
      userData: usuario_login,
    };
    return res.json(toSend);

    // Si Passwd es Incorrecta
  } else {
    const toSend = {
      status: "Error",
      error: "Credenciales Inválidas",
    };
    return res.status(401).json(toSend);
  }
});

module.exports = router;

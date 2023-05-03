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

    const response = {
      status: "Éxito"
    };

    var user = await Usuario.create(newUser);

    return res.json(response);

  } catch (error) {
    console.log("ERROR - Registro");
    console.log(error);

    const response = {
      status: "Error",
      error: error,
    };

    return res.status(500).json(response);
  }
});

// Iniciar Sesión
router.post("/login", async (req, res) => {
  
  const email = req.body.email;
  const passwd = req.body.passwd;

  var usuario = await Usuario.findOne({ email: email });

  // Si no existe el Email
  if (!usuario) {
    const response = {
      status: "Error",
      error: "Credenciales Inválidas"
    };
    return res.status(401).json(response);
  }

  // Si el Email y Passwd OK
  if (bcrypt.compareSync(passwd, usuario.passwd)) {
    usuario.set("passwd", undefined, { strict: false });

    const token = jwt.sign({ userData: usuario }, "securePasswd", {
      expiresIn: 60 * 60 * 24 * 30
    });

    const response = {
      status: "Éxito",
      token: token,
      userData: usuario,
    };
    return res.json(response);

    // Si Passwd es Incorrecta
  } else {
    const response = {
      status: "Error",
      error: "Credenciales Inválidas",
    };
    return res.status(401).json(response);
  }
});

module.exports = router;

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

    const respuesta = {
      status: "Éxito"
    };

    var user = await Usuario.create(newUser);

    return res.json(respuesta);

  } catch (error) {
    console.log("ERROR - Registro");
    console.log(error);

    const respuesta = {
      status: "Error",
      error: error,
    };

    return res.status(500).json(respuesta);
  }
});

// Iniciar Sesión
router.post("/login", async (req, res) => {
  
  const email = req.body.email;
  const passwd = req.body.passwd;

  var usuario = await Usuario.findOne({ email: email });

  // Si no existe el Email
  if (!usuario) {
    const respuesta = {
      status: "Error",
      error: "Credenciales Inválidas"
    };
    return res.status(401).json(respuesta);
  }

  // Si el Email y Passwd OK
  if (bcrypt.compareSync(passwd, usuario.passwd)) {
    usuario.set("passwd", undefined, { strict: false });

    const token = jwt.sign({ userData: usuario }, "securePasswd", {
      expiresIn: 60 * 60 * 24 * 30
    });

    const respuesta = {
      status: "Éxito",
      token: token,
      userData: usuario,
    };
    return res.json(respuesta);

    // Si Passwd es Incorrecta
  } else {
    const respuesta = {
      status: "Error",
      error: "Credenciales Inválidas",
    };
    return res.status(401).json(respuesta);
  }
});

module.exports = router;

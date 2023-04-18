const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Importamos modelos
import Usuario from "../models/usuario.js";

// Iniciar Sesión
router.post("/login", async (req, res) => {

  });
  
// Registro
router.post("/register", async (req, res) => {

  });

router.get("/nuevo-usuario", async (req, res) => {

    try {
        
        const usuario = await Usuario.create({
            nombre: "Diego",
            email: "Diego@gmail.com",
            passwd: "12345678"
        });
        res.json({"status":"success"});

    } catch (error) {
        
        res.json({"status":"fail"});

    }
})

module.exports = router;
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
import Usuario from "../models/usuario.js";
import { checkAuth } from "../middlewares/Identificar.js";
import EmqxAuthRule from "../models/emqx_auth.js";

/*

$$$$$$$$\                 $$\                     $$\            $$\               
$$  _____|                $$ |                    \__|           $$ |              
$$ |      $$$$$$$\   $$$$$$$ | $$$$$$\   $$$$$$\  $$\ $$$$$$$\ $$$$$$\    $$$$$$$\ 
$$$$$\    $$  __$$\ $$  __$$ |$$  __$$\ $$  __$$\ $$ |$$  __$$\\_$$  _|  $$  _____|
$$  __|   $$ |  $$ |$$ /  $$ |$$ /  $$ |$$ /  $$ |$$ |$$ |  $$ | $$ |    \$$$$$$\  
$$ |      $$ |  $$ |$$ |  $$ |$$ |  $$ |$$ |  $$ |$$ |$$ |  $$ | $$ |$$\  \____$$\ 
$$$$$$$$\ $$ |  $$ |\$$$$$$$ |$$$$$$$  |\$$$$$$  |$$ |$$ |  $$ | \$$$$  |$$$$$$$  |
\________|\__|  \__| \_______|$$  ____/  \______/ \__|\__|  \__|  \____/ \_______/ 
                              $$ |                                                 
                              $$ |                                                 
                              \__|                                                 

[Endpoints del Backend] -> Permiten realizar distintas acciones sobre los Usuarios

Developer: DK36
*/

// Registrar un Usuario
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
      status: "Éxito",
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

// Iniciar Sesión en la Aplicación
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const passwd = req.body.passwd;

  var usuario = await Usuario.findOne({ email: email });

  // Si no existe el Email
  if (!usuario) {
    const response = {
      status: "Error",
      error: "Credenciales Inválidas",
    };
    return res.status(401).json(response);
  }

  // Si el Email y Passwd OK
  if (bcrypt.compareSync(passwd, usuario.passwd)) {
    usuario.set("passwd", undefined, { strict: false });

    const token = jwt.sign({ userData: usuario }, "securePasswd", {
      expiresIn: 60 * 60 * 2
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

// Obtener las Credenciales MQTT
router.post("/getmqttcredentials", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;

    const credenciales = await getWebUserMqttCredentials(userId);

    const response = {
      status: "Éxito",
      username: credenciales.username,
      password: credenciales.password,
    };

    res.json(response);

    setTimeout(() => {
      getWebUserMqttCredentials(userId);
    }, 60000);

    return;
  } catch (error) {
    console.log(error);

    const response = {
      status: "Error",
    };

    return res.status(500).json(response);
  }
});

// Obtenemos las Credenciales MQTT en caso de Reconexión
router.post(
  "/getmqttcredentialsforreconnection",
  checkAuth,
  async (req, res) => {
    try {
      const userId = req.userData._id;
      const credentials = await getWebUserMqttCredentialsForReconnection(
        userId
      );

      const response = {
        status: "Éxito",
        username: credentials.username,
        password: credentials.password,
      };
      res.json(response);

      setTimeout(() => {
        getWebUserMqttCredentials(userId);
      }, 15000);
    } catch (error) {
      console.log(error);
    }
  }
);

/*

$$$$$$$$\                            $$\                                         
$$  _____|                           \__|                                        
$$ |   $$\   $$\ $$$$$$$\   $$$$$$$\ $$\  $$$$$$\  $$$$$$$\   $$$$$$\   $$$$$$$\ 
$$$$$\ $$ |  $$ |$$  __$$\ $$  _____|$$ |$$  __$$\ $$  __$$\ $$  __$$\ $$  _____|
$$  __|$$ |  $$ |$$ |  $$ |$$ /      $$ |$$ /  $$ |$$ |  $$ |$$$$$$$$ |\$$$$$$\  
$$ |   $$ |  $$ |$$ |  $$ |$$ |      $$ |$$ |  $$ |$$ |  $$ |$$   ____| \____$$\ 
$$ |   \$$$$$$  |$$ |  $$ |\$$$$$$$\ $$ |\$$$$$$  |$$ |  $$ |\$$$$$$$\ $$$$$$$  |
\__|    \______/ \__|  \__| \_______|\__| \______/ \__|  \__| \_______|\_______/ 
                                                                                 
[Usuarios] -> Utilizadas para gestionar las credenciales MQTT

*/

// Tipos de Credenciales MQTT: "usuario", "dispositivo", "superuser"
async function getWebUserMqttCredentials(userId) {
  try {
    var rule = await EmqxAuthRule.find({ type: "usuario", userId: userId });

    if (rule.length == 0) {
      const newRule = {
        userId: userId,
        username: makeid(10),
        password: makeid(10),
        publish: [userId + "/#"],
        subscribe: [userId + "/#"],
        type: "usuario",
        time: Date.now(),
        updatedTime: Date.now(),
      };

      const result = await EmqxAuthRule.create(newRule);

      const toReturn = {
        username: result.username,
        password: result.password,
      };

      return toReturn;
    }

    const newUserName = makeid(10);
    const newPassword = makeid(10);

    const result = await EmqxAuthRule.updateOne(
      { type: "usuario", userId: userId },
      {
        $set: {
          username: newUserName,
          password: newPassword,
          updatedTime: Date.now(),
        },
      }
    );

    // Ejemplo de Respuesta -> { n: 1, nModified: 1, ok: 1 }
    if (result.n == 1 && result.ok == 1) {
      return {
        username: newUserName,
        password: newPassword,
      };
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

// Obtenemos las credenciales MQTT de MongoDB
async function getWebUserMqttCredentialsForReconnection(userId) {
  try {
    const rule = await EmqxAuthRule.find({ type: "usuario", userId: userId });

    if (rule.length == 1) {
      const toReturn = {
        username: rule[0].username,
        password: rule[0].password,
      };
      return toReturn;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

// Genera un ID Aleatorio
function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = router;

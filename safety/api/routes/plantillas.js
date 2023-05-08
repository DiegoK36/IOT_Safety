const express = require("express");
const router = express.Router();
const { checkAuth } = require("../middlewares/Identificar.js");
import Dispositivo from "../models/dispositivo.js";
import Plantilla from "../models/plantilla.js";

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

[Endpoints del Backend] -> Permiten realizar distintas acciones sobre las Plantillas

Developer: DK36
*/

// Obtener las Plantillas
router.get("/plantillas", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;

    const plantillas = await Plantilla.find({ userId: userId });

    const response = {
      status: "Éxito",
      data: plantillas,
    };

    return res.json(response);
  } catch (error) {
    const response = {
      status: "Error",
      error: error,
    };

    return res.status(500).json(response);
  }
});

// Crear una Plantilla
router.post("/plantillas", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;

    var newTemplate = req.body.template;

    newTemplate.userId = userId;
    newTemplate.createdTime = Date.now();

    const r = await Plantilla.create(newTemplate);

    const response = {
      status: "Éxito",
    };

    return res.json(response);
  } catch (error) {
    const response = {
      status: "Error",
      error: error,
    };

    return res.status(500).json(response);
  }
});

// Borrar una Plantilla
router.delete("/plantillas", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;
    const templateId = req.query.templateId;

    const dispositivos = await Dispositivo.find({
      userId: userId,
      templateId: templateId,
    });

    if (dispositivos.length > 0) {
      const response = {
        status: "Fallo",
        error: "Plantilla en uso",
      };

      return res.json(response);
    }

    const r = await Plantilla.deleteOne({ userId: userId, _id: templateId });

    const response = {
      status: "Éxito",
    };

    return res.json(response);
  } catch (error) {
    const response = {
      status: "Error",
      error: error,
    };
    return res.status(500).json(response);
  }
});

module.exports = router;

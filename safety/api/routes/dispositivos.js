const express = require("express");
const router = express.Router();

const { checkAuth } = require("../middlewares/Identificar.js");
const { default: Dispositivo } = require("../models/dispositivo.js");

//GET Lista de Dispositivos
router.get("/dispositivos", checkAuth, async (req, res) => {

  try {

    const userId = req.userData._id;

    const dispositivos = await Dispositivo.find({userId: userId});
  
    const toSend = {
      status: "Éxito",
      data: dispositivos
    };
  
    return res.json(toSend);
    
  } catch (error) {

    console.log("Error obteniendo dispositivo");
    const toSend = {
      status: "Error",
      error: error
    };

    return res.status(500).json(toSend);
    
  }

});

//POST Crear un Dispositivo
router.post("/dispositivos", checkAuth, async (req, res) => {

  try {
    const userId = req.userData._id;
    var newDevice = req.body.newDevice;

    newDevice.userId = userId;
    newDevice.createdTime = Date.now();

    const dispositivo = await Dispositivo.create(newDevice);

    escogerDispositivo(userId, newDevice.dId);

    const toSend = {
      status: "Éxito"
    };

    return res.json(toSend);
    
  } catch (error) {
    console.log("Error al crear el Dispositivo");
    console.log(error);

    const toSend = {
      status: "Error",
      error: error
    };
    
    return res.status(500).json(toSend);
  }
 
});

//DELETE Borrar un Dispositivo
router.delete("/dispositivos", checkAuth, async (req, res) => {

  try {

    const userId = req.userData._id;
    const dId = req.query.dId;
  
    const result = await Dispositivo.deleteOne({userId: userId, dId: dId});
  
    const toSend = {
      status: "Éxito",
      data: result
    };
  
    return res.json(toSend);
    
  } catch (error) {
    console.log("Error borrando dispositivo");
    const toSend = {
      status: "Error",
      error: error
    };

    return res.status(500).json(toSend);
  }
  


});

//UPDATE Selector de Dispositivo
router.put("/dispositivos", checkAuth, async (req, res) => {
    
    const dId = req.body.dId;
    const userId = req.userData._id;
    
    if(escogerDispositivo(userId, dId)){
      const toSend = {
        status: "Éxito",
      };
      return res.json(toSend);
    }else{
      const toSend = {
        status: "Error",
      };
      return res.status(500).json(toSend);
    }

});

async function escogerDispositivo(userId, dId){
  
  try {

    const result = await Dispositivo.updateMany({userId: userId},{selected: false});
    const result2 = await Dispositivo.updateOne({dId:dId, userId: userId}, {selected:true});
  
    return true;
    
  } catch (error) {
    
    console.log("Error en la Funcion de Escoger Dispositivo");
    console.log(error);
    return false;

  }

}

module.exports = router;

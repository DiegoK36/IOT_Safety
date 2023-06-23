const express = require("express");
const router = express.Router();
const { checkAuth } = require("../middlewares/Identificar.js");
const axios = require("axios");
import SaverRule from "../models/emqx_saver.js";
import Dispositivo from "../models/dispositivo.js";
import Plantilla from "../models/plantilla.js";
import AlarmRule from "../models/emqx_alarm.js";
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

[Endpoints del Backend] -> Permiten realizar distintas acciones sobre los Dispositivos

Developer: DK36
*/

// Credenciales API
const auth = {
  auth: {
    username: "admin",
    password: process.env.EMQX_APP_SECRET
  }
};

// GET Lista de Dispositivos
router.get("/dispositivos", checkAuth, async (req, res) => {

  try {

    const userId = req.userData._id;

    // Obtenemos los Dispositivos
    var dispositivos = await Dispositivo.find({userId: userId});

    // De Mongoose Array a JS Array
    dispositivos = JSON.parse(JSON.stringify(dispositivos));

    // Obtenemos las Reglas de Guardado
    const saverRules = await getSaverRules(userId);

    // Obtenemos las Plantillas
    const templates = await getTemplates(userId);

    // Obtenemos las Plantillas
    const alarmRules = await getAlarmRules(userId);

    // Movemos las Reglas de Guardado a Dispositivos
    dispositivos.forEach((dispositivo, index) => {
      dispositivos[index].saverRule = saverRules.filter(
        saverRule => saverRule.dId == dispositivo.dId
      )[0];
      dispositivos[index].template = templates.filter(
        template => template._id == dispositivo.templateId
      )[0];
      dispositivos[index].alarmRules = alarmRules.filter(
        alarmRules => alarmRules.dId == dispositivo.dId
      );

    });
  
    const respuesta = {
      status: "Éxito",
      data: dispositivos
    };
  
    return res.json(respuesta);
    
  } catch (error) {

    console.log("Error obteniendo dispositivo");
    const respuesta = {
      status: "Error",
      error: error
    };

    return res.status(500).json(respuesta);
    
  }

});

// POST Crear un Dispositivo
router.post("/dispositivos", checkAuth, async (req, res) => {

  try {
    const userId = req.userData._id;
    var newDevice = req.body.newDevice;

    newDevice.userId = userId;
    newDevice.createdTime = Date.now();
    newDevice.password = makeid(10);

    await createSaverRule(userId, newDevice.dId, true);

    const dispositivo = await Dispositivo.create(newDevice);

    await escogerDispositivo(userId, newDevice.dId);

    const respuesta = {
      status: "Éxito"
    };

    return res.json(respuesta);
    
  } catch (error) {
    console.log("Error al crear el Dispositivo");
    console.log(error);

    const respuesta = {
      status: "Error",
      error: error
    };
    
    return res.status(500).json(respuesta);
  }
 
});

// DELETE Borrar un Dispositivo
router.delete("/dispositivos", checkAuth, async (req, res) => {

  try {

    const userId = req.userData._id;
    const dId = req.query.dId;

    // Borrado de Reglas y Credenciales de Dispositivo
    await deleteSaverRule(dId);
    await deleteAllAlarmRules(userId, dId);
    await deleteMqttDeviceCredentials(dId);
  
    const result = await Dispositivo.deleteOne({userId: userId, dId: dId});

    // Selector de Dispositivos
    const devices = await Dispositivo.find({ userId: userId });

    if (devices.length >= 1) {
      // Si hay alguno seleccionado
      var found = false;
      devices.forEach(devices => {
        if (devices.selected == true) {
          found = true;
        }
      });

      // Si no esta seleccionado
      if (!found) {
        await Dispositivo.updateMany({ userId: userId }, { selected: false });
        await Dispositivo.updateOne(
          { userId: userId, dId: devices[0].dId },
          { selected: true }
        );
      }
    }
  
    const respuesta = {
      status: "Éxito",
      data: result
    };
  
    return res.json(respuesta);
    
  } catch (error) {
    console.log("Error borrando dispositivo");
    const respuesta = {
      status: "Error",
      error: error
    };

    return res.status(500).json(respuesta);
  }
  


});

// UPDATE Selector de Dispositivo
router.put("/dispositivos", checkAuth, async (req, res) => {
    
    const dId = req.body.dId;
    const userId = req.userData._id;
    
    if(await escogerDispositivo(userId, dId)){
      const respuesta = {
        status: "Éxito",
      };
      return res.json(respuesta);
    }else{
      const respuesta = {
        status: "Error",
      };
      return res.status(500).json(respuesta);
    }

});

// Actualizar el Estado de la Regla de Guardado
router.put("/saver-rule", checkAuth, async (req, res) => {
  try {
    const rule = req.body.rule;

    await updateSaverRuleStatus(rule.emqxRuleId, rule.status);

    const respuesta = {
      status: "Éxito"
    };

    res.json(respuesta);
  } catch (error) {
    console.log(error);
  }
});

/*

$$$$$$$$\                            $$\                                         
$$  _____|                           \__|                                        
$$ |   $$\   $$\ $$$$$$$\   $$$$$$$\ $$\  $$$$$$\  $$$$$$$\   $$$$$$\   $$$$$$$\ 
$$$$$\ $$ |  $$ |$$  __$$\ $$  _____|$$ |$$  __$$\ $$  __$$\ $$  __$$\ $$  _____|
$$  __|$$ |  $$ |$$ |  $$ |$$ /      $$ |$$ /  $$ |$$ |  $$ |$$$$$$$$ |\$$$$$$\  
$$ |   $$ |  $$ |$$ |  $$ |$$ |      $$ |$$ |  $$ |$$ |  $$ |$$   ____| \____$$\ 
$$ |   \$$$$$$  |$$ |  $$ |\$$$$$$$\ $$ |\$$$$$$  |$$ |  $$ |\$$$$$$$\ $$$$$$$  |
\__|    \______/ \__|  \__| \_______|\__| \______/ \__|  \__| \_______|\_______/ 
                                                                                 
[Reglas de Guardado] -> Utilizadas para guardar Dispositivos

*/

// Obtener Alarmas
async function getAlarmRules(userId) {
  try {
    const rules = await AlarmRule.find({ userId: userId });
    return rules;
  } catch (error) {
    return "Error";
  }
}

// Obtener Plantillas
async function getTemplates(userId) {
  try {
    const templates = await Plantilla.find({ userId: userId });
    return templates;
  } catch (error) {
    return false;
  }
}

// Escoger un Dispositivo
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

// Obtenemos las Reglas de Guardado
async function getSaverRules(userId) {
  try {
    const rules = await SaverRule.find({ userId: userId });
    return rules;
  } catch (error) {
    return false;
  }
}

// Crear una Regla de Guardado
async function createSaverRule(userId, dId, status) {
 
  try {
    const url = "http://"+process.env.EMQX_HOST+":8085/api/v4/rules";

    const topic = userId + "/" + dId + "/+/sdata";

    const rawsql =
      'SELECT topic, payload FROM "' + topic + '" WHERE payload.save = 1';

    var newRule = {
      rawsql: rawsql,
      actions: [
        {
          name: "data_to_webserver",
          params: {
            $resource: global.saverResource.id,
            payload_tmpl:
              '{"userId":"' +
              userId +
              '","payload":${payload},"topic":"${topic}"}'
          }
        }
      ],
      description: "SAVER-RULE",
      enabled: status
    };

    // Grabamos la regla en EMQX
    const res = await axios.post(url, newRule, auth);


    if (res.status === 200 && res.data.data) {
      await SaverRule.create({
        userId: userId,
        dId: dId,
        emqxRuleId: res.data.data.id,
        status: status
      });

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Error al crear la Regla de Guardado");
    console.log(error);
    return false;
  }
}

// Actualizar el estado de la Regla de Guardado
async function updateSaverRuleStatus(emqxRuleId, status) {
  try {
    const url = "http://"+process.env.EMQX_HOST+":8085/api/v4/rules/" + emqxRuleId;

    const newRule = {
      enabled: status
    };

    const res = await axios.put(url, newRule, auth);

    if (res.status === 200 && res.data.data) {
      await SaverRule.updateOne({ emqxRuleId: emqxRuleId }, { status: status });
      console.log("Regla de guardado actualizada!".green);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

// Eliminar Reglas de Guardado
async function deleteSaverRule(dId) {
  try {
    const mongoRule = await SaverRule.findOne({ dId: dId });

    const url = "http://"+process.env.EMQX_HOST+":8085/api/v4/rules/" + mongoRule.emqxRuleId;

    const emqxRule = await axios.delete(url, auth);

    const deleted = await SaverRule.deleteOne({ dId: dId });

    return true;
  } catch (error) {
    console.log("Error al eliminar la regla de guardado");
    console.log(error);
    return false;
  }
}

// Borramos todas las Notificaciones
async function deleteAllAlarmRules(userId, dId) {
  try {
    const rules = await AlarmRule.find({ userId: userId, dId: dId });

    if (rules.length > 0) {
      asyncForEach(rules, async rule => {
        const url = "http://"+process.env.EMQX_HOST+":8085/api/v4/rules/" + rule.emqxRuleId;
        const res = await axios.delete(url, auth);
      });

      await AlarmRule.deleteMany({ userId: userId, dId: dId });
    }

    return true;
  } catch (error) {
    console.log(error);
    return "error";
  }
}

// Selección de Notificaciones
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

// Borramos las Credenciales MQTT
async function deleteMqttDeviceCredentials(dId) {
  try {
    await EmqxAuthRule.deleteMany({ dId: dId, type: "dispositivo" });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// Genera un ID Aleatorio
function makeid(length) {

  try {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  } catch (error) {
    console.log(error);
  }

}

module.exports = router;

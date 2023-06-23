
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { checkAuth } = require("../middlewares/Identificar.js");
const colors = require("colors");
import AlarmRule from "../models/emqx_alarm.js";

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

[Endpoints del Backend] -> Permiten realizar distintas acciones sobre los Alertas

Developer: DK36
*/

const auth = {
    auth: {
      username: "admin",
      password: process.env.EMQX_APP_SECRET
    }
};
  

// Crear una nueva Alarma
router.post("/alarm-rule", checkAuth, async (req, res) => {
  try {
    var newRule = req.body.newRule;
    newRule.userId = req.userData._id;

    var r = await createAlarmRule(newRule);

    if (r) {
      const respuesta = {
        status: "Éxito"
      };

      return res.json(respuesta);
    
    } else {
      const respuesta = {
        status: "Error"
      };

      return res.status(500).json(respuesta);
    }
  } catch (error) {
    console.log(error);
  }
});

// Actualizar nuestra Regla de Alarma
router.put("/alarm-rule", checkAuth, async (req, res) => {
  try {
    var rule = req.body.rule;

    var r = await updateAlarmRuleStatus(rule.emqxRuleId, rule.status);

    if (r == true) {
      const response = {
        status: "Éxito"
      };

      return res.json(response);
    } else {
      const response = {
        status: "Error"
      };

      return res.json(response);
    }
  } catch (error) {
    console.log(error);
  }
});

// Eliminar una Regla de Alerta
router.delete("/alarm-rule", checkAuth, async (req, res) => {
  try {
    var emqxRuleId = req.query.emqxRuleId;

    var r = await deleteAlarmRule(emqxRuleId);

    if (r) {
      const response = {
        status: "Éxito"
      };

      return res.json(response);
    } else {
      const response = {
        status: "Error"
      };

      return res.json(response);
    }
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
                                                                                 
[Reglas de Guardado] -> Utilizadas para configurar Alertas

*/

// Función para crear una nueva Alarma
async function createAlarmRule(newAlarm) {
  try {
    const url = "http://"+process.env.EMQX_HOST+":8085/api/v4/rules";

    // TopicoEjemplo = userid/did/temp  // msgEjemplo = {value: 20}
    const topic =
      newAlarm.userId + "/" + newAlarm.dId + "/" + newAlarm.variable + "/sdata";

    const rawsql =
      'SELECT username, topic, payload FROM "' +
      topic +
      '" WHERE payload.value ' +
      newAlarm.condition +
      " " +
      newAlarm.value +
      " AND is_not_null(payload.value)";

    var newRule = {
      rawsql: rawsql,
      actions: [
        {
          name: "data_to_webserver",
          params: {
            $resource: global.alarmResource.id,
            payload_tmpl:
              '{"userId":"' +
              newAlarm.userId +
              '","payload":${payload},"topic":"${topic}"}'
          }
        }
      ],
      description: "ALARM-RULE",
      enabled: newAlarm.status
    };

    // Grabamos la regla en EMQX
    const res = await axios.post(url, newRule, auth);
    var emqxRuleId = res.data.data.id;

    // Grabamos la regla en MongoDB
    if (res.data.data && res.status === 200) {
      const mongoRule = await AlarmRule.create({
        userId: newAlarm.userId,
        dId: newAlarm.dId,
        emqxRuleId: emqxRuleId,
        status: newAlarm.status,
        variable: newAlarm.variable,
        variableFullName: newAlarm.variableFullName,
        value: newAlarm.value,
        condition: newAlarm.condition,
        triggerTime: newAlarm.triggerTime,
        createTime: Date.now()
      });

      const url = "http://"+process.env.EMQX_HOST+":8085/api/v4/rules/" + mongoRule.emqxRuleId;

      const payload_templ =
        '{"userId":"' +
        newAlarm.userId +
        '","dId":"' +
        newAlarm.dId +
        '","deviceName":"' +
        newAlarm.deviceName +
        '","payload":${payload},"topic":"${topic}","emqxRuleId":"' +
        mongoRule.emqxRuleId +
        '","value":' +
        newAlarm.value +
        ',"condition":"' +
        newAlarm.condition +
        '","variable":"' +
        newAlarm.variable +
        '","variableFullName":"' +
        newAlarm.variableFullName +
        '","triggerTime":' +
        newAlarm.triggerTime +
        "}";

      newRule.actions[0].params.payload_tmpl = payload_templ;

      const res = await axios.put(url, newRule, auth);

      console.log("Nueva Regla de Alarma creada".green);

      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

// Actualizar la activación de la Alerta
async function updateAlarmRuleStatus(emqxRuleId, status) {
  try {
    const url = "http://"+process.env.EMQX_HOST+":8085/api/v4/rules/" + emqxRuleId;

    const newRule = {
      enabled: status
    };

    const res = await axios.put(url, newRule, auth);

    if (res.data.data && res.status === 200) {
      await AlarmRule.updateOne({ emqxRuleId: emqxRuleId }, { status: status });

      console.log("Regla de activación de Alerta modificado".green);

      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

// Eliminar una Regla de Alerta
async function deleteAlarmRule(emqxRuleId) {
  try {
    const url = "http://"+process.env.EMQX_HOST+":8085/api/v4/rules/" + emqxRuleId;

    const emqxRule = await axios.delete(url, auth);

    const deleted = await AlarmRule.deleteOne({ emqxRuleId: emqxRuleId });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = router;
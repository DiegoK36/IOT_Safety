const express = require("express");
const router = express.Router();
const axios = require("axios");
const colors = require("colors");
var mqtt = require("mqtt");
import Dato from "../models/dato.js";
import Dispositivo from "../models/dispositivo.js";
import EmqxAuthRule from "../models/emqx_auth.js";
import Notificacion from "../models/notificacion.js";
const { checkAuth } = require("../middlewares/Identificar.js");
var client;

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

[Endpoints del Backend] -> Permiten realizar distintas acciones sobre Webhooks

Developer: DK36
*/

// Obtener las Credenciales del Dispositivo
router.post("/getdevicecredentials", async (req, res) => {
  try {

    const dId = req.body.dId;

    const password = req.body.password;

    const device = await Dispositivo.findOne({ dId: dId });

    if (password != device.password) {
      return res.status(401).json();
    }

    const userId = device.userId;

    var credentials = await getDeviceMqttCredentials(dId, userId);

    var template = await Plantilla.findOne({ _id: device.templateId });


    var variables = [];

    template.widgets.forEach(widget => {
      var v = (({
        variable,
        variableFullName,
        variableType,
        variableSendFreq
      }) => ({
        variable,
        variableFullName,
        variableType,
        variableSendFreq
      }))(widget);

      variables.push(v);
    });

    const response = {
      username: credentials.username,
      password: credentials.password,
      topic: userId + "/" + dId + "/",
      variables: variables
    };


    res.json(response);

    setTimeout(() => {
      getDeviceMqttCredentials(dId, userId);
      console.log("Credenciales de Dispositivo Actualizadas");
    }, 30000);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}); 

// Guardar Datos con Webhook
router.post("/saver-webhook", async (req, res) => {
      
      try {
      if (req.headers.token != "202020") {
        res.status(404).json();
        return;
      }
  
      const data = req.body;
  
      const splittedTopic = data.topic.split("/");
      const dId = splittedTopic[1];
      const variable = splittedTopic[2];
  
      var result = await Dispositivo.find({ dId: dId, userId: data.userId });
  
      if (result.length == 1) {
        Dato.create({
          userId: data.userId,
          dId: dId,
          variable: variable,
          value: data.payload.value,
          time: Date.now()
        });
        console.log("Datos creados");
      }
  
      return res.status(200).json();
    } catch (error) {
      console.log(error);
      return res.status(500).json();
    }
  });

// Guardar Alarmas con WebHook
router.post("/alarm-webhook", async (req, res) => {
  try {
    if (req.headers.token != "303030") {
      res.status(404).json();
      return;
    }

    res.status(200).json();

    const incomingAlarm = req.body;

    updateAlarmCounter(incomingAlarm.emqxRuleId);

    const lastNotif = await Notificacion.find({
      dId: incomingAlarm.dId,
      emqxRuleId: incomingAlarm.emqxRuleId
    })
      .sort({ time: -1 })
      .limit(1);

    if (lastNotif == 0) {
      console.log("Primera vez de Alerta");
      saveNotifToMongo(incomingAlarm);
      sendMqttNotif(incomingAlarm);
    } else {
      const lastNotifToNowMins = (Date.now() - lastNotif[0].time) / 1000 / 60;

      if (lastNotifToNowMins > incomingAlarm.triggerTime) {
        console.log("Reactivación de Alerta");
        saveNotifToMongo(incomingAlarm);
        sendMqttNotif(incomingAlarm);
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json();
  }
});

// Obtener Notificaciones
router.get("/notificaciones", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;

    const notifications = await getNotifications(userId);

    const response = {
      status: "Éxito",
      data: notifications
    };

    res.json(response);
  } catch (error) {
    console.log("Erro al obtener las Alertas");
    console.log(error);

    const response = {
      status: "Error",
      error: error
    };

    return res.status(500).json(response);
  }
});

// Actualizar las Notificaciones (Estado de Leído)
router.put("/notificaciones", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;

    const notificationId = req.body.notifId;

    await Notification.updateOne(
      { userId: userId, _id: notificationId },
      { readed: true }
    );

    const response = {
      status: "Éxito"
    };

    res.json(response);
  } catch (error) {
    console.log("Error al actualizar el estado de la Alerta");
    console.log(error);

    const response = {
      status: "error",
      error: error
    };

    return res.status(500).json(response);
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
                                                                                 
[Alertas] -> Utilizadas para gestionar Alertas y MQTT

*/

async function getDeviceMqttCredentials(dId, userId) {
  try {
    var rule = await EmqxAuthRule.find({
      type: "dispositivo",
      userId: userId,
      dId: dId
    });

    if (rule.length == 0) {
      const newRule = {
        userId: userId,
        dId: dId,
        username: makeid(10),
        password: makeid(10),
        publish: [userId + "/" + dId + "/+/sdata"],
        subscribe: [userId + "/" + dId + "/+/actdata"],
        type: "dispositivo",
        time: Date.now(),
        updatedTime: Date.now()
      };

      const result = await EmqxAuthRule.create(newRule);

      const toReturn = {
        username: result.username,
        password: result.password
      };

      return toReturn;
    }

    const newUserName = makeid(10);
    const newPassword = makeid(10);

    const result = await EmqxAuthRule.updateOne(
      { type: "dispositivo", dId: dId },
      {
        $set: {
          username: newUserName,
          password: newPassword,
          updatedTime: Date.now()
        }
      }
    );
    if (result.n == 1 && result.ok == 1) {
      return {
        username: newUserName,
        password: newPassword
      };
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

// Iniciamos el servicio MQTT
function startMqttClient() {
  const options = {
    port: 1883,
    host: 'localhost',
    clientId:
      "webhook_superuser" + Math.round(Math.random() * (0 - 10000) * -1),
    username: 'adminuser',
    password: 'adminpass',
    keepalive: 60,
    reconnectPeriod: 5000,
    protocolId: "MQIsdp",
    protocolVersion: 3,
    clean: true,
    encoding: "utf8"
  };

  client = mqtt.connect("mqtt://" + 'localhost', options);

  client.on("connect", function() {
    console.log("CONEXIÓN MQTT EXITOSA".green);
    console.log("\n");
  });

  client.on("reconnect", error => {
    console.log("RECONECTANDO SERVICIO MQTT");
    console.log(error);
  });

  client.on("error", error => {
    console.log("ERROR DE CONEXIÓN MQTT");
    console.log(error);
  });
}

// Notificaciones MQTT
function sendMqttNotif(notif) {
  const topic = notif.userId + "/dummy-did/dummy-var/notif";
  const msg =
    "Alerta Excedida: Cuando la " +
    notif.variableFullName +
    " es " +
    notif.condition +
    " que " +
    notif.value;
  client.publish(topic, msg);
}

// Obtener Alertas
async function getNotifications(userId) {
  try {
    const res = await Notificacion.find({ userId: userId, readed: false });
    return res;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// Guardar la Alerta en DDBB
function saveNotifToMongo(incomingAlarm) {
  try {
    var newNotif = incomingAlarm;
    newNotif.time = Date.now();
    newNotif.readed = false;
    Notification.create(newNotif);
  } catch (error) {
    console.log(error);
    return false;
  }
}

// Incrementamos el contador de las Alertas
async function updateAlarmCounter(emqxRuleId) {
  try {
    await AlarmRule.updateOne(
      { emqxRuleId: emqxRuleId },
      { $inc: { counter: 1 } }
    );
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

setTimeout(() => {
  startMqttClient();
}, 3000);

  module.exports = router;
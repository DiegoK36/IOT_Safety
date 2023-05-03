const express = require("express");
const router = express.Router();
const axios = require("axios");
const colors = require("colors");
var mqtt = require("mqtt");
import Dato from "../models/dato.js";
import Dispositvo from "../models/dispositivo.js";
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
  
      var result = await Dispositvo.find({ dId: dId, userId: data.userId });
  
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
                                                                                 
[Alertas] -> Utilizadas para gestionar Alertas

*/

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

setTimeout(() => {
  startMqttClient();
}, 3000);

  module.exports = router;
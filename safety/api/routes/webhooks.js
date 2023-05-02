const express = require("express");
const router = express.Router();
const { checkAuth } = require("../middlewares/Identificar.js");
//var mqtt = require("mqtt");
const axios = require("axios");
const colors = require("colors");
import Dato from "../models/dato.js";

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
  
      var result = await Device.find({ dId: dId, userId: data.userId });
  
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

    const lastNotif = await Notification.find({
      dId: incomingAlarm.dId,
      emqxRuleId: incomingAlarm.emqxRuleId
    })
      .sort({ time: -1 })
      .limit(1);

    if (lastNotif == 0) {
      console.log("FIRST TIME ALARM");
      saveNotifToMongo(incomingAlarm);
      sendMqttNotif(incomingAlarm);
    } else {
      const lastNotifToNowMins = (Date.now() - lastNotif[0].time) / 1000 / 60;

      if (lastNotifToNowMins > incomingAlarm.triggerTime) {
        console.log("TRIGGERED");
        saveNotifToMongo(incomingAlarm);
        sendMqttNotif(incomingAlarm);
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json();
  }
});

  module.exports = router;
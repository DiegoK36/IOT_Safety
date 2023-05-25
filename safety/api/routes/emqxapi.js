const express = require("express");
const router = express.Router();
const axios = require("axios");
const colors = require("colors");

import EmqxAuthRule from "../models/emqx_auth.js";

const auth = {
  auth: {
    username: "admin",
    password: process.env.EMQX_APP_SECRET
  }
};

global.saverResource = null;
global.alarmResource = null;

// Listamos los Recursos de EMQX
async function listResources() {
  try {

    const url =
      "http://localhost:8085/api/v4/resources/";

    const res = await axios.get(url, auth);

    const size = res.data.data.length;

    if (res.status === 200) {
      if (size == 0) {
        console.log("------- CREANDO LOS RECURSOS -------".green);
        createResources();

      } else if (size == 2) {
        res.data.data.forEach((resource) => {
          if (resource.description == "alarm-webhook") {
            global.alarmResource = resource;

            console.log("▼ ▼ ▼ RECURSO DE ALARMA ENCONTRADO ▼ ▼ ▼ ".bgMagenta);
            console.log(global.alarmResource);
            console.log("▲ ▲ ▲ RECURSO DE ALARMA ENCONTRADO ▲ ▲ ▲ ".bgMagenta);
            console.log("\n");
            console.log("\n");
          }

          if (resource.description == "saver-webhook") {
            global.saverResource = resource;

            console.log("▼ ▼ ▼ RECURSO DE GUARDADO ENCONTRADO ▼ ▼ ▼ ".bgMagenta);
            console.log(global.saverResource);
            console.log("▲ ▲ ▲ RECURSO DE GUARDADO ENCONTRADO ▲ ▲ ▲ ".bgMagenta);
            console.log("\n");
            console.log("\n");
          }
        });
      } else {
        function printWarning() {
          console.log(
            "ELIMINA TODOS LOS RECURSOS WEBHOOK DE EMQX Y REINICIA NODE - Tudominioemqx:8085/#/resources".red
          );
          setTimeout(() => {
            printWarning();
          }, 1000);
        }
        printWarning();
      }
    } else {
      console.log("Error con la API de EMQX");
    }
  } catch (error) {
    console.log("Error al listar los Recursos EMQX");
    console.log(error);
  }
}

// Crear los Recursos
async function createResources() {

    try {
        const url = "http://localhost:8085/api/v4/resources";

        const data1 = {
            "type": "web_hook",
            "config": {
                url: "http://localhost:3001/api/saver-webhook",
                headers: {
                    token: process.env.EMQX_API_TOKEN
                },
                method: "POST"
            },
            description: "saver-webhook"
        }
    
        const data2 = {
            "type": "web_hook",
            "config": {
                url: "http://localhost:3001/api/alarm-webhook",
                headers: {
                    token: process.env.EMQX_API_TOKEN
                },
                method: "POST"
            },
            description: "alarm-webhook"
        }
    
        const res1 = await axios.post(url, data1, auth);
    
        if (res1.status === 200){
            console.log("Recurso de Guardado creado!".green);
        }
    
        const res2 = await axios.post(url, data2, auth);
    
        if (res2.status === 200){
            console.log("Recurso de Alarma creado!".green);
        }
    
        setTimeout(() => {
            console.log("\n------- ¡Recursos WebHook de EMQX creados! -------".green);
            listResources();
        }, 1000);
    } catch (error) {
        console.log("Error al crear los Recursos");
        console.log(error);
    }
}

// Comprobamos si existe un Administrador (Si no, creamos uno)
global.check_mqtt_superuser = async function checkMqttSuperUser(){

  try {
    const superusers = await EmqxAuthRule.find({type:"superuser"});

    if (superusers.length > 0 ) {
  
      return;
  
    }else if ( superusers.length == 0 ) {
  
      await EmqxAuthRule.create(
        {
          publish: ["#"],
          subscribe: ["#"],
          userId: "emqx_superusuario",
          username: process.env.EMQX_SUPERUSER_USER,
          password: process.env.EMQX_SUPERUSER_PASS,
          type: "superuser",
          time: Date.now(),
          updatedTime: Date.now()
        }
      );
  
      console.log("Administrador MQTX Creado")
  
    }
  } catch (error) {
    console.log("Error al crear Administrador MQTX");
    console.log(error);
  }
}

setTimeout(() => {
    listResources();
  }, 1000);

module.exports = router;

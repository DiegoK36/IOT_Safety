const express = require("express");
const router = express.Router();
const axios = require("axios");
const colors = require("colors");

const auth = {
  auth: {
    username: "admin",
    password: "secret",
  },
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
                    token: "202020"
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
                    token: "303030"
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

setTimeout(() => {
    listResources();
  }, 1000);

module.exports = router;

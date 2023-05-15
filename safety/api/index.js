// Requerimientos
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const colors = require('colors');

// Variables de Entorno
require('dotenv').config();

// Instancias
const app = express();

// Configuración de Express
app.use(morgan("tiny"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(cors());

// Rutas de Express
app.use("/api", require("./routes/dispositivos.js"));
app.use("/api", require("./routes/usuarios.js"));
app.use("/api", require("./routes/plantillas.js"));
app.use("/api", require("./routes/webhooks.js"));
app.use("/api", require("./routes/emqxapi.js"));
app.use("/api", require("./routes/alertas.js"));
 
module.exports = app;

// Escucha de la API
app.listen(process.env.API_PORT, () => { 
    console.log("Puerto " + process.env.API_PORT + " habilitado para la API");
});

// Conexión con Mongo
const mongoUserName = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASS;
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoDatabase = process.env.MONGO_DATABASE;

var uri =
  "mongodb://" +
  mongoUserName +
  ":" +
  mongoPassword +
  "@" +
  mongoHost +
  ":" +
  mongoPort +
  "/" +
  mongoDatabase;

  console.log(uri);

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  authSource: "admin"
};

mongoose.connect(uri, options).then(
    () => {
      console.log("\n");
      console.log("------------------------------------".green);
      console.log("  ✔ Mongo Conectado Correctamente!  ".green);
      console.log("------------------------------------".green);
      console.log("\n");
      //global.check_mqtt_superuser();
  
    },
    err => {
      console.log("\n");
      console.log("--------------------------------".red);
      console.log("     Fallo de Conexión Mongo    ".red);
      console.log("--------------------------------".red);
      console.log("\n");
      console.log(err);
    }
);
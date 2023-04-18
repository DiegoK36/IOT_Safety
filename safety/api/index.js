//Requires
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const colors = require('colors');


//Instances
const app = express();

//Express Config
app.use(morgan("tiny"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(cors());

//Express Routes
app.use("/api", require("./routes/dispositivos.js"));
app.use("/api", require("./routes/usuarios.js"));
 
module.exports = app;

//Listener
app.listen(3001, () => { 
    console.log("Listening...");
});

//Endpoint Test
app.get("/testing", (req, res) => {
    console.log("Hello World");
    res.send("Helloooooooooo");
});

//Mongo Connection
const mongoUserName = "devuser";
const mongoPassword = "devpass";
const mongoHost = "localhost";
const mongoPort = "27017";
const mongoDatabase = "safety";

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
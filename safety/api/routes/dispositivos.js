const express = require("express");
const router = express.Router();

//GET de Dispositivos
router.get("/dispositivos", checkAuth, async (req, res) => {

  });
  
//NEW DEVICE
router.post("/dispositivos", checkAuth, async (req, res) => {

  });
  
  //DELETE DEVICE
  router.delete("/dispositivos", checkAuth, async (req, res) => {
 
  });
  
  //UPDATE DEVICE (SELECTOR)
  router.put("/dispositivo", checkAuth, async (req, res) => {

  });

module.exports = router;
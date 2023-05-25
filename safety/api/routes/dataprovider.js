const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middlewares/Identificar.js');
import Dato from '../models/dato.js';

/*

$$$$$$$$\ $$\   $$\ $$$$$$$\   $$$$$$\  $$$$$$\ $$\   $$\ $$$$$$$$\  $$$$$$\         $$$$$$\  $$$$$$$\   $$$$$$\  $$$$$$$$\ $$$$$$\  $$$$$$\   $$$$$$\  
$$  _____|$$$\  $$ |$$  __$$\ $$  __$$\ \_$$  _|$$$\  $$ |\__$$  __|$$  __$$\       $$  __$$\ $$  __$$\ $$  __$$\ $$  _____|\_$$  _|$$  __$$\ $$  __$$\ 
$$ |      $$$$\ $$ |$$ |  $$ |$$ /  $$ |  $$ |  $$$$\ $$ |   $$ |   $$ /  \__|      $$ /  \__|$$ |  $$ |$$ /  $$ |$$ |        $$ |  $$ /  \__|$$ /  $$ |
$$$$$\    $$ $$\$$ |$$$$$$$  |$$ |  $$ |  $$ |  $$ $$\$$ |   $$ |   \$$$$$$\        $$ |$$$$\ $$$$$$$  |$$$$$$$$ |$$$$$\      $$ |  $$ |      $$ |  $$ |
$$  __|   $$ \$$$$ |$$  ____/ $$ |  $$ |  $$ |  $$ \$$$$ |   $$ |    \____$$\       $$ |\_$$ |$$  __$$< $$  __$$ |$$  __|     $$ |  $$ |      $$ |  $$ |
$$ |      $$ |\$$$ |$$ |      $$ |  $$ |  $$ |  $$ |\$$$ |   $$ |   $$\   $$ |      $$ |  $$ |$$ |  $$ |$$ |  $$ |$$ |        $$ |  $$ |  $$\ $$ |  $$ |
$$$$$$$$\ $$ | \$$ |$$ |       $$$$$$  |$$$$$$\ $$ | \$$ |   $$ |   \$$$$$$  |      \$$$$$$  |$$ |  $$ |$$ |  $$ |$$ |      $$$$$$\ \$$$$$$  | $$$$$$  |
\________|\__|  \__|\__|       \______/ \______|\__|  \__|   \__|    \______/        \______/ \__|  \__|\__|  \__|\__|      \______| \______/  \______/ 
                                                                                                                                              
[Endpoints del Backend] -> Permiten actualizar la información de los gráficos

Developer: DK36     
                                                                                                                                                                                                                                                   
*/

// Obtenemos la Información para el Gráfico
router.get('/get-last-data', checkAuth, async (req, res) => {

  try {

    const userId = req.userData._id;
    const chartTimeAgo = req.query.chartTimeAgo;
    const dId = req.query.dId;
    const variable = req.query.variable;

    const timeAgoMs = Date.now() - (chartTimeAgo * 60 * 1000 );


    const data =  await Dato.find({userId: userId, dId:dId, variable: variable}).sort({"time":-1}).limit(1);


    const response = {
      status: "success",
      data: data
    }

    return res.json(response)

  } catch (error) {

    console.log(error)

    const response = {
      status: "error",
      error: error
    } 

    return res.json(response);

  }

});

// Obtenemos la Información de los Sensores
router.get('/get-small-charts-data', checkAuth, async (req, res) => {

  try {

    const userId = req.userData._id;
    const chartTimeAgo = req.query.chartTimeAgo;
    const dId = req.query.dId;
    const variable = req.query.variable;

    const timeAgoMs = Date.now() - (chartTimeAgo * 60 * 1000 );


    const data =  await Dato.find({userId: userId, dId:dId, variable: variable, "time": {$gt: timeAgoMs}}).sort({"time":1});


    const response = {
      status: "success",
      data: data
    }

    return res.json(response)

  } catch (error) {

    console.log(error)

    const response = {
      status: "error",
      error: error
    } 

    return res.json(response);

  }

});

module.exports = router

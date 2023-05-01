const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middlewares/Identificar.js');

// Importamos modelos
import Dispositivo from '../models/dispositivo.js';
import Template from '../models/plantilla.js';

//get templates
router.get('/plantillas', checkAuth, async (req, res) => {

    try {

        const userId = req.userData._id;

        const templates = await Template.find({userId: userId});

        console.log(userId);
        console.log(templates)

        const response = {
            status: "Éxito",
            data: templates
        }

        return res.json(response);

    } catch (error) {

        console.log(error);

        const response = {
            status: "Error",
            error: error
        }

        return res.status(500).json(response);

    }

});

//create template
router.post('/plantillas', checkAuth, async (req, res) => {

    try {

        const userId = req.userData._id;

        var newTemplate = req.body.template;

        newTemplate.userId = userId;
        newTemplate.createdTime = Date.now();

        const r = await Template.create(newTemplate);

        const response = {
            status: "Éxito",
        }

        return res.json(response)

    } catch (error) {

        console.log(error);

        const response = {
            status: "Error",
            error: error
        }

        return res.status(500).json(response);

    }

});

//delete template
router.delete('/plantillas', checkAuth, async (req, res) => {

    try {

        const userId = req.userData._id;
        const templateId = req.query.templateId;

        const dispositivos = await Dispositivo.find({userId: userId, templateId: templateId });


        if (dispositivos.length > 0){

            const response = {
                status: "Fallo",
                error: "Plantilla en uso"
            }
    
            return res.json(response);
        }

        const r = await Template.deleteOne({userId: userId, _id: templateId});

        const response = {
            status: "Éxito",
        }

        return res.json(response)

    } catch (error) {

        console.log(error);

        const response = {
            status: "Error",
            error: error
        }

        return res.status(500).json(response);

    }

});

module.exports = router;

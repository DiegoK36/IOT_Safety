import mongoose from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
    name: { type: String, required: [true] },
    email: { type: String, required: [true], unique: true},
    passwd: {  type: String, required: [true]},
  });

// Validamos
usuarioSchema.plugin(uniqueValidator, { message: 'Ya existe una cuenta con ese correo'});


// Convertimos en un modelo
const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;

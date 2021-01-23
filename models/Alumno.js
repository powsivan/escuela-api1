const mongoose = require('mongoose');                         //Importando mongoose.
const uniqueValidator = require("mongoose-unique-validator"); //Importando módulo mongoose-unique-validator, pendiente de instalar.
const crypto = require('crypto');                             //Importando módulo crypto, pendiente de instalar.
const jwt = require('jsonwebtoken');                          //Importando módulo jsonwebtoken, pendiente de instalar.
const secret = require('../config').secret;

const AlumnoSchema = new mongoose.Schema({                   //Definiendo el objeto UsuarioSchema con el constructor Schema.
    username: {                                                  //Definiendo cada campo con sus tipo sde datos y validaciones.
      type: String,
      unique: true, //este campo no se puede repetir
      lowercase: true,
      required: [true, "no puede estar vacío"],
      match: [/^[a-zA-Z0-9]+$/, "es inválido"],
      index: true,
    }, 
    matricula: {                                                  //Definiendo cada campo con sus tipo sde datos y validaciones.
        type: String,
        unique: true, //este campo no se puede repetir
        lowercase: true,
        required: [true, "no puede estar vacío"],
        match: [/^[a-zA-Z0-9]+$/, "es inválido"],
        index: true,
      },                                          
    nombre: { type: String, required: true },
    apellidoPaterno: { type: String, required: true },
    apellidoMaterno: {type: String, require: true},

    hash: String, //este campo se utilizará para la sesión
    salt: String, //este campo se utilizará para la sesión
  },
  { timestamps: true }
); 

// usando plugin de validación para que no se repitan correos ni usernames
AlumnoSchema.plugin(uniqueValidator, { message: "Ya existe" });

AlumnoSchema.methods.crearPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex"); // generando una "sal" random para cada usuario
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex"); // generando un hash utilizando la sal
};

/**
 * Recibe el password, genera y compara el has con el de la base de datos
 */
AlumnoSchema.methods.validarPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

AlumnoSchema.methods.generarJWT = function() {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60); // 60 días antes de expirar

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

/**
 * Devuelve la representación de un usuario después de autenticar
 */
AlumnoSchema.methods.toAuthJSON = function(){
  return {
    username: this.username,
    matricula: this.matricula,
    token: this.generarJWT()
  };
};

/**
* Devuelve la representación de un usuario, sólo datos públicos
*/
AlumnoSchema.methods.publicData = function(){
  return {
    id: this.id,
    username: this.username,
    matricula: this.matricula,
    nombre: this.nombre,
    apellidoPaterno: this.apellidoPaterno,
    apellidoMaterno: this.apellidoMaterno,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

mongoose.model("Alumno", AlumnoSchema);    //Define el modelo Usuario, utilizando el esquema UsuarioSchema.
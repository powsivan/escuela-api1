const mongoose = require("mongoose")
const Usuario = mongoose.model("Usuario")
const passport = require('passport');

function crearUsuario(req, res, next){
    // Instanciamos un alumno nuevo utilizando la clase alumno
    console.log(req.body);
    const body = req.body,
        password = body.password

    delete body.password
    const usuario = new Usuario(body)
    usuario.crearPassword(password)
    usuario.save().then(user => {
        return res.status(201).json(user.toAuthJSON())
    }).catch(next)    
}

function obtenerUsuarios(req, res, next) {                              //Obteniendo usuario desde MongoDB.
    if(req.params.id){
      Usuario.findById(req.params.id, (err, user) => {
        if (!user || err) {
          return res.sendStatus(401)
        }
        return res.json(user.publicData());
      }).catch(next);
    } else {
      Usuario.find().then(usuarios=>{
        usuarios = usuarios.map(u => u.publicData())
        res.send(usuarios)
      }).catch(next)
    }
  }

  function modificarUsuario(req, res, next) {
    console.log(req.usuario)
    Usuario.findById(req.usuario.id).then(user => {
      if (!user) { return res.sendStatus(401); }
      let nuevaInfo = req.body
      if (typeof nuevaInfo.username !== 'undefined')
        user.username = nuevaInfo.username
      if (typeof nuevaInfo.nombre !== 'undefined')
        user.nombre = nuevaInfo.nombre
      if (typeof nuevaInfo.apellidoPaterno !== 'undefined')
        user.apellidoPaterno = nuevaInfo.apellidoPaterno
      if (typeof nuevaInfo.apellidoMaterno !== 'undefined')
        user.apellidoMaterno = nuevaInfo.apellidoMaterno
      if(typeof nuevaInfo.especialidad !== 'undefidned')
        user.especialidad = nuevaInfo.especialidad  
      if (typeof nuevaInfo.password !== 'undefined')
        user.crearPassword(nuevaInfo.password)
      user.save().then(updatedUser => {                                   //Guardando usuario modificado en MongoDB.
        res.status(201).json(updatedUser.publicData())
      }).catch(next)
    }).catch(next)
  } 

  function eliminarUsuario(req, res) {
    // únicamente borra a su propio usuario obteniendo el id del token
    Usuario.findOneAndDelete({ _id: req.params.id }).then(r => {         //Buscando y eliminando usuario en MongoDB.
      res.status(200).send(`Usuario ${req.params.id} eliminado: ${r}`);
    })
  }
  
  function iniciarSesion(req, res, next) {
    if (!req.body.username) {
      return res.status(422).json({ errors: { username: "no puede estar vacío" } });
    }
  
    if (!req.body.password) {
      return res.status(422).json({ errors: { password: "no puede estar vacío" } });
    }
  
    passport.authenticate('local', { session: false }, function (err, user, info) {
      if (err) { return next(err); }
  
      if (user) {
        user.token = user.generarJWT();
        return res.json({ user: user.toAuthJSON() });
      } else {
        return res.status(422).json(info);
      }
    })(req, res, next);
  }
  
  module.exports = {
    crearUsuario,
    obtenerUsuarios,
    modificarUsuario,
    eliminarUsuario,
    iniciarSesion
  }

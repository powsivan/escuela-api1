const mongoose = require("mongoose")
const Alumno = mongoose.model("Alumno")
const passport = require('passport');

function crearAlumno(req, res, next){
    // Instanciamos un alumno nuevo utilizando la clase alumno
    const body = req.body,
        password = body.password

    delete body.password
    const alumno = new Alumno(body)
    alumno.crearPassword(password)
    alumno.save().then(user => {
        return res.status(201).json(user.toAuthJSON())
    }).catch(next)    
}

function obtenerAlumnos(req, res, next) {                              //Obteniendo usuario desde MongoDB.
    if(req.params.id){
      Alumno.findById(req.params.id, (err, user) => {
        if (!user || err) {
          return res.sendStatus(401)
        }
        return res.json(user.publicData());
      }).catch(next);
    } else {
      Alumno.find().then(alumnos=>{
        alumnos = alumnos.map(u => u.publicData())
        res.send(alumnos)
      }).catch(next)
    }
  }

  function modificarAlumno(req, res, next) {
    console.log(req.alumno)
    Usuario.findById(req.alumno.id).then(user => {
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
      if (typeof nuevaInfo.password !== 'undefined')
        user.crearPassword(nuevaInfo.password)
      user.save().then(updatedUser => {                                   //Guardando usuario modificado en MongoDB.
        res.status(201).json(updatedUser.publicData())
      }).catch(next)
    }).catch(next)
  } 

  function eliminarAlumno(req, res) {
    // únicamente borra a su propio usuario obteniendo el id del token
    Alumno.findOneAndDelete({ _id: req.alumno.id }).then(r => {         //Buscando y eliminando usuario en MongoDB.
      res.status(200).send(`Alumno ${req.params.id} eliminado: ${r}`);
    })
  }
  
  function iniciarSesion(req, res, next) {
    if (!req.body.matricula) {
      return res.status(422).json({ errors: { matricula: "no puede estar vacío" } });
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
    crearAlumno,
    obtenerAlumnos,
    modificarAlumno,
    eliminarAlumno,
    iniciarSesion
  }
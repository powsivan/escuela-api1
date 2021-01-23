var router = require('express').Router();

router.get('/', (req, res)=>{
  res.send('welcome to escuela api');
});

router.use('/alumnos', require('./alumnos'));
//router.use('/mascotas', require('./mascotas'));
//router.use('/solicitudes', require('./solicitudes'));


module.exports = router;
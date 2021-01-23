const router = require('express').Router();
const {
  crearAlumno,
  obtenerAlumnos,
  modificarAlumno,
  eliminarAlumno,
  iniciarSesion
} = require('../controllers/alumnos')
const auth = require('./auth');

router.get('/', auth.requerido, obtenerAlumnos)
router.get('/:id', auth.requerido, obtenerAlumnos);
router.post('/', crearAlumno)
router.post('/entrar', iniciarSesion)
router.put('/:id', auth.requerido, modificarAlumno)
router.delete('/:id', auth.requerido, eliminarAlumno)

module.exports = router;
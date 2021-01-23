const passport = require('passport');                       //Importando passport, middleware para autenticación.
const LocalStrategy = require('passport-local').Strategy;   //Importando estrategia autenticación. --> passport-local
const mongoose = require('mongoose');
const Alumno = mongoose.model('Alumno');

passport.use(new LocalStrategy({                            //Configurando elementos utilizados para habilitar sesión.
    usernameField: 'matricula',
    passwordField: 'password'
}, function (matricula, password, done) {
    Alumno.findOne({ matricula: matricula }).then(function (user) {
    if (!user || !Alumno.validarPassword(password)) {
        return done(null, false, { errors: { 'matricula o contraseña': 'equivocado(a)' } });
    }
        return done(null, user);
    }).catch(done);
}));
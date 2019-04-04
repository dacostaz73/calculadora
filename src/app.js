const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mysql = require('mysql');
const myConnection = require('express-myconnection');


const app = express();

// Importan las rutas
const conversionRoutes = require('./routes/conversiones');
// configuraciones o settings
app.set('port', process.env.PORT || 3000);

// vistas de la aplicación
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//rutas del servidor
app.use(morgan('dev'));

app.use(myConnection(mysql, {
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306',
    database: 'CalculadoraMaster'
}, 'single'));

//middleware
app.use(express.urlencoded({
    extended: false
}));
//rutas
app.use('/', conversionRoutes);

//archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));


// Puerto donde se escucha
app.listen(app.get('port'), ()=>{
    console.log("servidor en puerto "+app.get('port'));
});


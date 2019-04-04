var convert = require('@bstoots/convert-units');
var nodemailer = require('nodemailer');

const controller = {};
let resulta = '0.0';
let valorEntrada = '';
let valorConversion = '';

const sqlHistorial = 'select c.id_conversion, c.descripcion, c.abreviatura, un.descripcion, un.abreviatura, c.valor_entrada, c.valor_salida, c.fecha_consulta, c.hora_consulta, c.reportado from (select * from conversiones c inner join unidad u on c.id_unidad_entrada = u.id_unidad) as c inner join unidad un on c.id_unidad_salida = un.id_unidad';

var busqueda = {
    entrada: valorEntrada,
    unidad: '',
    uOrigen: '',
    uDestino: '',
    resultado: resulta 

};


controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        var chbox = [];
        conn.query('SELECT * FROM sistema_conversion', (err, conversions) => {
            if(err){
                console.log("ERROR: Checkbox \n"+err);
            }

            // catalogos
            conn.query('SELECT * FROM unidad', (err, unidades) => {
                if(err){
                    console.log("ERROR: Catalogos \n"+err);
                    // res.json(err);
                }

                // historial
                conn.query(sqlHistorial, (err, historia) => {
                    if(err){
                        console.log("ERROR: Historial\n "+err);
                        //res.json(err);
                    }
                    console.log("INFO: "+JSON.stringify(historia));
                    res.render('conversiones', {
                        title: 'Calculadora Master',
                        data: conversions,
                        unidad: unidades,
                        resultado: resulta,
                        entrada: valorEntrada,
                        historial: historia
                    });
                });
            });
        });
        console.log("***************** TERMINDADO ********************");

    });
}

controller.getHistorial = (req, res) => {
    res.send("Consulta conversiones");
 /*
   res.render('index', {
       title: 'My firt app papu'
   })*/
}

controller.getConversionId = (req, res) => {
    res.send("Consulta por ID");
 /*
   res.render('index', {
       title: 'My firt app papu'
   })*/
}


controller.save = (req, res) => {
    const vEntrada = parseFloat(req.body.unidadOrigen);

    var uOrigen = JSON.parse(req.body.cmbOrigen);
    var uDestino = JSON.parse(req.body.cmbDestino);

    var fecha = new Date();
    var milisegundos = fecha.setDate(fecha.getDate() + (-1));
    var fechaHoy = new Date(milisegundos).toISOString().slice(0,10);
    var hora =  new Date().toLocaleTimeString();
    console.log("fecha:::::::::::"+hora);
    const uEntrada = uOrigen.abreviatura.toLowerCase();
    const uSalida = uDestino.abreviatura.toLowerCase();
    gerCoversion(vEntrada, uEntrada, uSalida);

    // inserta en la base

    req.getConnection((err, conn) => {
        var chbox = [];
        
        var insert = {
            id_unidad_entrada:uOrigen.id_unidad,
            id_unidad_salida: uDestino.id_unidad,
            valor_entrada: parseFloat(vEntrada),
            valor_salida: parseFloat(valorConversion),
            fecha_consulta: fechaHoy,
            hora_consulta: hora,
            reportado: 0
         };
         //console.log(insert);
            // const sql = 'insert into conversiones values (null, ?)';   
            const sql = 'insert into conversiones values (null,' +uOrigen.id_unidad+','+uDestino.id_unidad+','+parseFloat(vEntrada)+','+parseFloat(valorConversion)+',"'+fechaHoy+'","'+hora+'",0)'; 
            conn.query(sql, insert, (err, respuesta) => {
                if(err){
                    console.log("error:  "+err);
                }else{
                    console.log(respuesta);
                }
                res.redirect('/');
            });
    });
}

controller.clean = (req, res) => {
    resulta = '0.0';
    valorEntrada = '';
    valorConversion = '';
    sendEmail();
    res.redirect('/');
}

controller.delete = (req, res) => {
    
}

// funciones
function gerCoversion(valor, unidadOrigen, unidadDestino){
    valorEntrada = valor;
    valorConversion = convert(valor).from(unidadOrigen).to(unidadDestino);
    resulta = valorConversion + ' ' +unidadDestino;
}

function sendEmail(){

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'bdeveloper19@gmail.com',
          pass: 'Brians1994'
        }
      });
      
      var mailOptions = {
        from: 'bdeveloper19@gmail.com',
        to: 'bsandoval@ilusion.com.mx',
        subject: 'Calculadora Master - Reporte',
        text: 'Esta es una prueba de calculadora master!',
        
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

}

module.exports = controller;
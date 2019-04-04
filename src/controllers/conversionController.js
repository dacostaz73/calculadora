var convert = require('@bstoots/convert-units');
var nodemailer = require('nodemailer');
const { Parser } = require('json2csv');

const controller = {};
let resulta = '0.0';
let valorEntrada = '';
let valorConversion = '';

const sqlHistorial = 'select c.id_conversion, sc.sistema, c.descripcion as descripcion_entrada, c.abreviatura as abreviatura_entrada, un.descripcion as descripcion_salida, un.abreviatura as abreviatura_salida, c.valor_entrada, c.valor_salida, c.fecha_consulta, c.hora_consulta, c.reportado from (select * from conversiones c inner join unidad u on c.id_unidad_entrada = u.id_unidad) as c inner join unidad un on c.id_unidad_salida = un.id_unidad inner join sistema_conversion sc on sc.id_sistema = un.id_sistema  where c.reportado = 0 order by id_conversion desc limit 50';

var busqueda = {
    entrada: '',
    unidad: '',
    uOrigen: '',
    uDestino: '',
    resultado: '' 

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
                    
                    // para el envio de correo
                    if(historia != undefined && historia != null && historia.length == 50){
                        //Obtiene contactos
                        req.getConnection((err, conn) => {
                            
                            conn.query('SELECT * FROM contactos', (err, contactos) => {
                                if(err){
                                    console.log("error:  "+err);
                                }
                                createCSV(historia, contactos);
                            });
                        });
                        
                        // Se realiza el update a 1
                        historia.forEach(function (element, index) { 
                            req.getConnection((err, conn) => {
                                const sql = 'update conversiones set reportado = 1 where id_conversion = '+element.id_conversion;   
                                conn.query(sql, (err, respuesta) => {
                                    if(err){
                                        console.log("error:  "+err);
                                    }
                                });
                            });
                        });  
                    }
                    
                    res.render('conversiones', {
                        title: 'Calculadora Master',
                        data: conversions,
                        unidad: unidades,
                        resultado: resulta,
                        entrada: valorEntrada,
                        historial: historia,
                        busqueda: busqueda
                    });
                });
            });
        });
       
    });
}

controller.getConversionId = (req, res) => {
    res.send("Consulta por ID");
 /*
   res.render('index', {
       title: 'My firt app papu'
   })*/
}


controller.save = (req, res) => {
    console.log(req.body);
    const vEntrada = parseFloat(req.body.unidadOrigen);

    var uOrigen = JSON.parse(req.body.cmbOrigen);
    var uDestino = JSON.parse(req.body.cmbDestino);

    var fecha = new Date();
    var milisegundos = fecha.setDate(fecha.getDate() + (-1));
    var fechaHoy = new Date(milisegundos).toISOString().slice(0,10);
    var hora =  new Date().toLocaleTimeString();

    const uEntrada = uOrigen.abreviatura.toLowerCase();
    const uSalida = uDestino.abreviatura.toLowerCase();

    gerCoversion(vEntrada, uEntrada, uSalida);
    busqueda.entrada = vEntrada;
    busqueda.unidad = req.body.inlineRadioOptions;
    busqueda.uOrigen= uOrigen.abreviatura;
    busqueda.uDestino= uOrigen.abreviatura;
    busqueda.resultado = resulta ;

    // inserta en la base

    req.getConnection((err, conn) => {
       
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
            conn.query(sql, (err, respuesta) => {
                if(err){
                    console.log("error:  "+err);
                }else{

                }
                res.redirect('/');
            });
    });
}

// limpia el formulario
controller.clean = (req, res) => {
    resulta = '0.0';
    valorEntrada = '';
    valorConversion = '';
    var busqueda = {
        entrada: '',
        unidad: '',
        uOrigen: '',
        uDestino: '',
        resultado: '' 
    
    };
    
    createCSV();
    res.redirect('/');
}

// eliminación de ids
controller.delete = (req, res, next) => {
    var id = req.params.id;
    if( id != undefined && id != null){
        req.getConnection((err, conn) => {
            const sql = 'delete from conversiones where id_conversion = '+id;   
            conn.query(sql, (err, respuesta) => {
                if(err){
                    console.log("error:  "+err);
                }else{
                    console.log("Info: Eliminación correcta");
                }
                res.redirect('/');
                });
        });
    } 
}

// funciones
function gerCoversion(valor, unidadOrigen, unidadDestino){
    valorEntrada = valor;
    valorConversion = convert(valor).from(unidadOrigen).to(unidadDestino);
    resulta = valorConversion + ' ' +unidadDestino;
}



function createCSV(data, contactos){
    if(data != undefined && data != null && data.length > 0){
        
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(data);        
        sendEmail("Calculadora Master - Reporte.csv",csv, contactos);
    }
}

// se encarga de enviar el mail
function sendEmail(fileName, mensaje, contactos){

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'bdeveloper19@gmail.com',
          pass: 'Gh47ka47'
        }
      });
      var listaContactos = [];

      if(contactos == undefined || contactos == null || contactos == ""){
        listaContactos.push("briansandovalsoto@gmail.com");
      }else{
        contactos.forEach(function (element, index) { 
            listaContactos.push(element.email);
        });
      }

      var mailOptions = {
        from: '"Calculadora Master" <bdeveloper19@gmail.com>',
        to: listaContactos,
        subject: 'Calculadora Master - Reporte',
        text: 'Estimado(a) colaborador, te recordamos realizar el reporte estadístico del archivo adjunto.\n\nQue estés muy bien.\nCalculadora Master',
        attachments: [
            {   // utf-8 string as an attachment
                filename: fileName,
                content: mensaje
            }
        ]
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
            console.log('Email sent: ' + info.response + "\n");
            
        }
      });
}

controller.save = (req, res) => {
    console.log(req.body);
    const vEntrada = parseFloat(req.body.unidadOrigen);

    var uOrigen = JSON.parse(req.body.cmbOrigen);
    var uDestino = JSON.parse(req.body.cmbDestino);

    var fecha = new Date();
    var milisegundos = fecha.setDate(fecha.getDate() + (-1));
    var fechaHoy = new Date(milisegundos).toISOString().slice(0,10);
    var hora =  new Date().toLocaleTimeString();

    const uEntrada = uOrigen.abreviatura.toLowerCase();
    const uSalida = uDestino.abreviatura.toLowerCase();
    const vModificar = req.body.valueModificar;

    gerCoversion(vEntrada, uEntrada, uSalida);
    busqueda.entrada = vEntrada;
    busqueda.unidad = req.body.inlineRadioOptions;
    busqueda.uOrigen= uOrigen.abreviatura;
    busqueda.uDestino= uOrigen.abreviatura;
    busqueda.resultado = resulta ;

    // inserta en la base
    if(vModificar == undefined || vModificar == null || vModificar == ''){
        //inserta
        req.getConnection((err, conn) => {
       
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
                conn.query(sql, (err, respuesta) => {
                    if(err){
                        console.log("error:  "+err);
                    }else{
    
                    }
                    res.redirect('/');
                });
        });
    }else{
        // modifica
        req.getConnection((err, conn) => {
            const sql = 'update conversiones set id_unidad_entrada = ' +uOrigen.id_unidad+', id_unidad_salida = '+uDestino.id_unidad+', valor_entrada = '+parseFloat(vEntrada)+', valor_salida = '+parseFloat(valorConversion)+', fecha_consulta="'+fechaHoy+'", hora_consulta= "'+hora+'", reportado = 0 where id_conversion = '+parseInt(vModificar); 
            conn.query(sql, (err, respuesta) => {
                if(err){
                    console.log("error:  "+err);
                }else{
                    console.log(":::::: ACTUALIZADO :::::::");
                }
                res.redirect('/');
            });
        });
    }
    
}

module.exports = controller;
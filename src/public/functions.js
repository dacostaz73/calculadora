function clean(){
    window.location="./clean";
}

function changeUnit(cmb){
    document.getElementById("cmbOrigen").selectedIndex = "0";
    document.getElementById("cmbDestino").selectedIndex = "0";


    document.getElementById("unidadDestino").value = "0.0";

    [].forEach.call(document.querySelectorAll('.cmbU'), function (el) {
        el.style.display = 'none';
    });

    [].forEach.call(document.querySelectorAll('.show'+cmb), function (el) {
        el.style.display = '';
    });

    document.getElementById("cmbOrigen").disabled = false;
    document.getElementById("cmbDestino").disabled = false;
}


function isNumberKey(evt,id)
{
	try{
        document.getElementById("unidadDestino").value = "0.0";
        var charCode = (evt.which) ? evt.which : event.keyCode;
  
        if(charCode==46){
            var txt=document.getElementById(id).value;
            if(!(txt.indexOf(".") > -1)){
	
                return true;
            }
        }
        if (charCode > 31 && (charCode < 48 || charCode > 57) )
            return false;

        return true;
	}catch(w){
		alert(w);
	}
}

function deleteById(idConversion){

    var txt;
    var r = confirm("¿Estas seguro de eliminar este registro?");
    if (r == true) {
        var data = JSON.parse(idConversion);
        window.location="./delete/"+data.id_conversion;
    }

}

function updateConversion(idConversion){
    var data = JSON.parse(idConversion);
    var id = '';

    switch(data.sistema.toLowerCase()){
        case 'peso':
            id=1;
        break;
        
        case 'área':
        case 'area':
            id=2;
        break;

        case 'distancia':
            id=3;
        break;

        case 'volumen':
            id=4;
        break;

    }

    if(id != ''){
        document.getElementById("unidadOrigen").value = data.valor_entrada;
        document.getElementById("inlineRadio"+id).checked = true;
        
        [].forEach.call(document.querySelectorAll('.cmbU'), function (el) {
            el.style.display = 'none';
        });
    
        [].forEach.call(document.querySelectorAll('.show'+id), function (el) {
            el.style.display = '';
        });

        document.getElementById("cmbOrigen").disabled = false;
        document.getElementById("cmbDestino").disabled = false;
    
        document.getElementById("cmbOrigen").selectedIndex = "0";
        document.getElementById("cmbDestino").selectedIndex = "0";

        document.getElementById("unidadDestino").value = data.valor_salida;
        document.getElementById("valueModificar").value = data.id_conversion;

        document.getElementById("txtAnterior").innerHTML = "La conversión anterior fue en : <b>"+data.sistema+"</b> de <b>"+
            data.descripcion_entrada+"</b> a <b>"+ data.descripcion_salida+"</b>"+
            " obteniendo como resultado:<br><b>"+data.valor_entrada+" "+ data.abreviatura_entrada +"</b> = <b>"+
            data.valor_salida +" "+ data.abreviatura_salida+"</b>  (Realiza una nueva conversión que va a sustituir a la anteior)." ;
        document.getElementById("cmbOrigen").focus();
    }
   
}
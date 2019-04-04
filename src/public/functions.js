function clean(){
    window.location="./clean";
}

function changeUnit(cmb){
    document.getElementById("cmbOrigen").selectedIndex = "0";
    document.getElementById("cmbDestino").selectedIndex = "0";

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
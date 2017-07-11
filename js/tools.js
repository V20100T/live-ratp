
/************************************************
 *
 * JS TOOLS
 *
 * ***********************************************/
function isJson(json_string) {
  try {
    JSON.parse(json_string);
  }
  catch (e) {
    return false;
  }
  return true;
}

function isNullOrUndefined(test) {

  if (typeof(test) == 'undefined' || test == null) {

    return true;
  }

  return false;

}

function slugApiToSlugJQ(s){
    return s.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\-");
}
function slugJQToSlugApi(s){
    return s.replace(/([.*-?^=!:${}()|\[\]\/\\])/g, "\+");
}


function getDate(){
  var now = new Date();

  var annee   = now.getFullYear();
  var mois    = ('0'+now.getMonth()+1).slice(-2);
  var jour    = ('0'+now.getDate()   ).slice(-2);
  var heure   = ('0'+now.getHours()  ).slice(-2);
  var minute  = ('0'+now.getMinutes()).slice(-2);
  var seconde = ('0'+now.getSeconds()).slice(-2);

 return  annee+'/'+mois+'/'+jour+' '+heure+':'+minute+':'+seconde;

}

function getHeure(){
   now = new Date();

   heure   = ('0'+now.getHours()  ).slice(-2);
   minute  = ('0'+now.getMinutes()).slice(-2);
   seconde = ('0'+now.getSeconds()).slice(-2);

 return  heure+':'+minute+':'+seconde;

}


function pulse(e) {
    e.fadeIn(300);
    e.fadeOut(500);
    e.fadeIn(300);
    e.fadeIn(300);
    e.fadeOut(500);
    e.fadeIn(300);
}

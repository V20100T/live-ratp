/***************************
 * 
 * Config
 * 
 *                 
 * <link href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.5/cyborg/bootstrap.min.css" rel="stylesheet">
 * *****************************/
/* ok ok 
$(function(){
  $("head").append(
    $(document.createElement("link")).attr({rel:"stylesheet", type:"text/css", href:"https://maxcdn.bootstrapcdn.com/bootswatch/3.3.5/cyborg/bootstrap.min.css"})
  );
  */
  
  function changeTheme(theme) {
    
       var url = "https://maxcdn.bootstrapcdn.com/bootswatch/3.3.5/" + theme + "/bootstrap.min.css";
       $('#bootswatch_theme').attr('href', url);
          
  }
  
  var theme_list= [
                    "cerulean",
                    "cosmo",	
                    "cyborg",	 	
                    "darkly",	 	
                    "flatly",	 	 	
                    "journal",	 	
                    "lumen",	 	
                    "paper",	 	
                    "readable",	
                    "sandstone",	
                    "simplex",	 	
                    "slate",	 	 	
                    "spacelab",	
                    "superhero",	
                    "united"
                    ]	 	
                  ;
 var listitems = '';
 
 
 $(function(){
 
    $.each(theme_list, function(key, value){
      listitems += '<option value=' + value + '>' + value.toUpperCase() + '</option>';
    });
    
    $('#css_theme_selector-select').append(listitems);
  
    $('#css_theme_selector-select').on('change', function(){
      changeTheme($(this).val());
    });

});
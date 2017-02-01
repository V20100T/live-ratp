/***************************
 * 
 * Config
 * 
 * 
 * *****************************/

var stream_ratp_api_url = 'https://api-ratp.pierre-grimaud.fr/v2/';
var stream_ratp_time = 1000 * 35;

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

function rand(items){
  return items[~~(Math.random() * items.length)];
}
    
function jq(myid) {

  // return "#" + myid.replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" );

  return "" + myid.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1");


}

var $ = jQuery;



/**********************************************
 * 
 * STREAM TIMER
 * 
 * *******************************************/


var stream_ratp_timer = null;

function startStreamRatp() {
  ratpStreamRefreshAll();
  stream_ratp_timer = setInterval(function() {
    ratpStreamRefreshAll()
  }, stream_ratp_time);

}

function stopStreamRatp() {
  clearInterval(stream_ratp_timer);
}



/************************************************
 * 
 * HTML FORM cleanup
 * 
 * ***********************************************/
function clearLines() {

  $("#list_lines").empty();
  $("#list_stations").empty();
  $("#list_destinations").empty();


}

function clearStations() {

  $("#list_stations").empty();

}

function clearDestinations() {

  $("#list_destinations").empty();

}

function getSchedulesStatus(schedules) {
  
  var class_status_schedules = [];
  var status_ordered = {
    danger: {
      slug: 'danger',
      mess: [ 
        'Service termine',
        'INFO INDISPO',
        '..................',
        'PAS DE SERVICE',
        'Train arrete',
        'Service terminé ou horaires indisponibles'
      ]
    },
    warning: {
      slug: 'warning',
      mess: [
        'Train retarde'
      ]
    },
    success: 
    {
      slug: 'success',
      mess: [
        "Train a l'approche",
        'mn',
        ':'
        ]
    }
  };
  
  $.each(schedules, function(index, schedule) {
   class_status_schedules[index] = 'info';
   $.each(status_ordered, function(index_st_ex, status_exemple) {
     $.each(status_exemple.mess, function(index_mess_ex, mess_exemple) {
      if(schedule.message.toLowerCase().includes(mess_exemple.toLowerCase()) ) {
          class_status_schedules[index] = status_exemple.slug;
      } 
     });
      
   });
        
   });
  
  return class_status_schedules;
}

function getSchedulesDestinationCount(schedules) {
  
  var schedules_destinations_count = [];
    //count destinations, pour ne pas l afficher si c'est la meme pour tous les schedules
  $.each(schedules, function(index, schedule) {
    
    
    if (schedules_destinations_count[schedule.destination]) {
      schedules_destinations_count[schedule.destination]++;
    }
    else {
      schedules_destinations_count[schedule.destination] = 1;
    }
  });
  
  return schedules_destinations_count;
}


function getHtmlSchedules(schedules) {

  var schedules_destinations_count = getSchedulesDestinationCount(schedules);
  var class_status_schedules = getSchedulesStatus(schedules);

  var html_schedules = '';
  
var html_schedule_simple = '<li class="list-group-item">';
  $.each(schedules, function(index, schedule) {

    var badge_class = ['default', 'primary', '', 'info'];
    
    if (schedules_destinations_count[schedule.destination] != schedules.length 
    && schedule.destination.length 
    && schedule.destination != ' ') {
      
      html_schedules = html_schedules + 
      '<li class="list-group-item">'+
        '<span class="label-message label label-'+class_status_schedules[index]+'" > '+ 
          schedule.message +
        ' </span>'+
        ' <i class="fa fa-exchange" aria-hidden="true"></i> '+
        ' <span class="label-dest label label-'+rand(badge_class)+'"> '+
            schedule.destination+
        ' </span> '+
      '</li>';
    }
    else {
      html_schedules = html_schedules + 
      
        ' <span class="label-message  label label-'+class_status_schedules[index]+'" >'+ 
          schedule.message +
        ' </span> ';    
      
    }


  });
  
  html_schedule_simple = '</li>';
  
  
  return html_schedules;
}


/************************************************
 * 
 * HTML ADD
 * 
 * ***********************************************/
function addStation(transport, line, st, destinations = null) {

  console.log(JSON.stringify(destinations));

  clearDestinations();

  $.map(destinations, function(dest, key) {

    $("#list_destinations").append(
      "<button type='button' id='destinations_" +
      (dest.id_destination) +
      "' class='select_dest btn btn-warning " + transport + "_dest destinations-" + dest.slug +
      "' data-dest='" + dest.slug +
      "' >" +
      dest.destination +
      "</button>");

  });

  var station_class = transport + '_line_station ' + transport + '_line' + line;

  $("#list_stations").append(

    "<button type='button' id='station_" +
    (st.id) +
    "' class='select_station btn btn-info  station_" + st.id +
    "' data-transport='" + transport +
    "' data-line='" + (line) +
    "' data-station='" + st.slug +
    "' >" +"<span class='badge "+station_class+"'>" + line + "</span>"+
    st.name +
    "</button>");

}

function addLine(transport, line) {


  $("#list_lines").append(
    "<button type='button' id='line_" + line +
    "' class=' get_line btn btn-default " + transport + "_line " + transport + "_line" + line +
    "' data-transport='" + transport +
    "' data-line='" + line +
    "' >" +
    line +
    "</button>");

}


function refreshStreamRatpDatas(rep) {


  console.log('+++++++++++++++++ refreshStreamRatpDatas : rep ' + rep);

  var html_schedules = getHtmlSchedules(rep.schedules);


  var stream_slug = 'stream_ratp_' + rep.informations.type + '_' + rep.informations.line + '_' + rep.informations.station.slug + '_' + rep.informations.destination.slug;

  $('#' + stream_slug).html('');

  var obj = slugToJson(stream_slug);
  console.log('=============== refreshStreamRatpDatas slugToJson ' + JSON.stringify(obj));

  if (document.getElementById(stream_slug) == null) {
    console.log('refreshStreamRatpDatas streaming ratp exist PAS ' + stream_slug);

    return false;
  }


  $('.stream_ratp_datas').each(function() {
    console.log('id => ' + $(this).attr('id'));

    var stream_ratp = $(this).attr('id');

    if (stream_slug == stream_ratp) {

      $(this).html('');
      $(this).html(html_schedules);

    }

  });


  $('#' + stream_slug).html('');
  $('#' + stream_slug).html(html_schedules);

}

function buildStreamRatp(rep) {

  console.log('buildStreamRatp : rep ' + rep);

  var html_schedules = getHtmlSchedules(rep.schedules);

  var stream_slug = 'stream_ratp_' + rep.informations.type + '_' + rep.informations.line + '_' + rep.informations.station.slug + '_' + rep.informations.destination.slug;
  var div_station_slug = "div_station_" + rep.informations.type + "_" + rep.informations.line + '_' + rep.informations.station.slug;

  div_station_slug = div_station_slug.replace('+', '_');

  var obj = slugToJson(stream_slug);
  console.log('=============== buildStreamRatp slugToJson ' + JSON.stringify(obj));


  console.log(' test length ' + $('#' + stream_slug).length);
  console.log(' test length ' + typeof(document.getElementById(stream_slug)));
  console.log(' test length ' + document.getElementById(stream_slug));
  if (document.getElementById(stream_slug) != null) {

    console.log('streaming ratp exist deja ' + stream_slug);

    $('#' + stream_slug).fadeOut(10, function() {
      $(this).fadeIn(10);
    });

    return false;
  }


  addStreamToLocalStorage(stream_slug);

  console.log('willl test ADD stream to existing station');
  // ADD stream to existing station
  var html_station = '<!-- station -->' +
          '<div class="panel-body" id="' + div_station_slug + '">' +
            '<div class="station ' + div_station_slug + '" id="div_' + stream_slug + '" >' +
              '<h4 id="' + jq('btn_' + stream_slug) + '">'+
                '<i class="fa fa-arrow-right  " aria-hidden="true"></i>' +
                rep.informations.destination.name +
              '</h4>' +
              '<ul id="' + stream_slug + '" class="list-group stream_ratp_datas">'+
                html_schedules +
              '</ul>' +
            '</div>' +
          '</div><!-- fin station -->'
          ;
          
  
  if ($('#' + div_station_slug).length) {

    console.log('ADDDDDDD D stream to existing station');



    $('#' + div_station_slug).prepend(html_station);


  }
  else {



    $("#stream_ratp").prepend(
      '<div class="col-md-3 stream_ratp">' +
        '<div class="panel panel-default" >' +
          '<div class="panel-heading">' +
            '<h3 class="panel-title">' +
              '<span class="close delete_streaming " data-ratp_stream_slug="'+stream_slug+'"  href="#" aria-label="Supprimer de la mémoire" title="Supprimer de la mémoire">×</span>' +
              '<button id="" class="btn ' + rep.informations.type + '_line ' + rep.informations.type + '_line' + rep.informations.line + ' " type="button" data-transport="' + rep.informations.type + '" data-line="' + rep.informations.line + '">' +
                rep.informations.line +
              '</button>' +
              rep.informations.station.name +
            '</h3>' +
          '</div>' +
          html_station +
        '</div>' +
      '</div>'  +
    '</div>'
 
    );

  }

  /*
    
  var obj = {
    transport : rep.informations.type,
    line: rep.informations.line,
    station: rep.informations.station.slug,
    destination: rep.informations.destination.slug
  };
 
    console.log('#stream_slug obj =======> ' +JSON.stringify(obj));
    
 

    $('#'+stream_slug).attr('data-transport', obj.transport);

  
    console.log('#stream_slug 1 =======> ' + JSON.stringify( $.data($('#'+stream_slug), 'stream_ratp_datas')));
    console.log('#stream_slug 2 =======> ' +  $.data($('#btn_'+stream_slug), 'stream_ratp_datas'));
     console.log('#stream_slug 1 =======> ' + JSON.stringify( $.data($('#btn_'+stream_slug), 'stream_ratp_datas')));
    console.log('#stream_slug 2 =======> ' +  $.data($('#'+stream_slug), 'stream_ratp_datas'));
    
    console.log('#stream_slug 3 =======> ' + $('#'+stream_slug).data('stream_ratp_datas'));
    */



}


/************************************************
 * 
 * API 
 * 
 * ***********************************************/




function refreshAPIStream(transport, line, station, dest) {

  console.log('refreshAPIStream  => ' + JSON.stringify(line) + JSON.stringify(dest));
  var url = stream_ratp_api_url + transport + "/" + line + "/stations/" + station + "?destination=" + dest;

  console.log('refreshAPIStream url => ' + url);

  $.getJSON(url, function(data) {
    //console.log('refreshAPIStream data <<<>>>>> ' + JSON.stringify(data));

    refreshStreamRatpDatas(data.response);
  });

}


function getAPIStream(transport, line, station, dest) {

  console.log('getAPIStream  => ' + JSON.stringify(line) + JSON.stringify(dest));

  //https://api-ratp.pierre-grimaud.fr/v2/metros/8/stations/daumesnil?destination=balard
  var url = stream_ratp_api_url + transport + "/" + line + "/stations/" + station + "?destination=" + dest;

  console.log('url => ' + url);

  $.getJSON(url, function(data) {

    buildStreamRatp(data.response);

  });
}

function getAPILignes(transport = "metros") {

  $.getJSON(stream_ratp_api_url + transport + "/",
    function(data) {

      var list_items = data.response[transport];

      clearLines();

      $.map(list_items, function(line, key) {

        addLine(transport, line.line);

      });

    });
}

function getAPIStations(transport, line) {

  console.log('getAPIStations');

  $.getJSON(stream_ratp_api_url + transport + "/" + line,
    function(data) {

      var list_items = data.response.stations;
      var destinations = data.response.destinations;

      console.log('full uri  list_items <<<>>>>> ' + JSON.stringify(
        list_items));

      clearStations();

      $.map(list_items, function(station, key) {

        addStation(transport, line, station, destinations);

      });
    });
}


/************************************************
 * 
 * JQUERY UI
 * 
 * ***********************************************/



$(document).ready(function() {

  loadStreamRaptStorage();

  startStreamRatp();
  $("#add_metros").toggle();
  $("#stream_ratp_control").toggle();


});


//Select transport
$(document).on('click', '.get_transport', function() {

  var transport = $(this).data('transport');

  console.log('get_transport =>  ' + transport + ' getData => ' + JSON.stringify($(this).data()));



  $('.get_transport').addClass('disabled ');
  $('.get_transport').removeClass('active ');
  $(this).removeClass('disabled');
  $(this).addClass('active');
  getAPILignes(transport);

  $('#add_stream_ratp').data('transport', transport);
  $('#add_stream_ratp').data('line', null);
  $('#add_stream_ratp').data('station', null);
  $('#add_stream_ratp').data('dest', null);


});
$(document).on('click', '.get_line', function() {
  var transport = $(this).data('transport');
  var line = $(this).data('line');

  console.log('line =>  ' + line);
  console.log('get_line ==>  =>  ' + line + ' getData => ' + JSON.stringify($(this).data()));



  $('.get_line').addClass('disabled ');
  $('.get_line').removeClass('active ');

  $(this).removeClass('disabled ');
  $(this).addClass('active');


  getAPIStations(transport, line);

  //$('#add_stream_ratp').data('transport', transport);
  $('#add_stream_ratp').data('line', line);
  $('#add_stream_ratp').data('station', null);
  $('#add_stream_ratp').data('dest', null);


});
$(document).on('click', '.select_dest', function() {
  var transport = $(this).data('transport');
  var line = $(this).data('line');
  var dest = $(this).data('dest');

  console.log('select_dest =>  ' + dest + ' getData => ' + JSON.stringify($(this).data()));

  $('.select_dest').addClass('disabled ');
  $('.select_dest').removeClass('active selected_dest');

  $(this).removeClass('disabled ');
  $(this).addClass('active selected_dest');


  // $('#add_stream_ratp').data('line', line);
  //$('#add_stream_ratp').data('station', null);
  $('#add_stream_ratp').data('dest', dest);



});
$(document).on('click', '.select_station', function() {
  var transport = $(this).data('transport');
  var line = $(this).data('line');
  var station = $(this).data('station');

  console.log('select_station =>  ' + station + ' getData => ' + JSON.stringify($(this).data()));



  $('.select_station').addClass('disabled ');
  $('.select_station').removeClass('active selected_station');

  $(this).removeClass('disabled ');
  $(this).addClass('active selected_station');


  //$('#add_stream_ratp').data('line', line);
  $('#add_stream_ratp').data('station', station);
  //$('#add_stream_ratp').data('dest', null);



});

$(document).on('click', '#add_stream_ratp', function() {

  var transport = $(this).data('transport');
  var line = $(this).data('line');
  var dest = $(this).data('dest');
  var station = $(this).data('station');


  console.log(' add_stream_ratp getData => ' + JSON.stringify($(this).data()));




  console.log(' parametre  ' + line + transport + station + dest);

  if (isNullOrUndefined(transport) ||
    isNullOrUndefined(line) ||
    isNullOrUndefined(station) ||
    isNullOrUndefined(dest)
  ) {

    $(this).addClass('disabled ');
    $(this).removeClass('active ');
    console.log('il manque un parametre !!   + line + transport +  station + dest) ' + line + transport + station + dest);

    return false;
  }

  var stream_ratp = transport + "_" + line + "_" + station + "_" + dest;

  var obj = [{
    transport: transport,
    line: line,
    station: station,
    dest: dest
  }]
  console.log('OK =>  ' + transport + line + station + dest);
  console.log('stream ratp  =>  ' + stream_ratp);
  console.log('stream ratp  obj =>  ' + JSON.stringify(obj));



  $(this).removeClass('disabled ');
  $(this).addClass('active');

  //getAPIStream(obj);
  getAPIStream(transport, line, station, dest);

  //buildStreamRatp(rep);

});

$(document).on('click', '.stream_ratp_form_toggle', function() {

  $("#add_metros").toggle();
});
$(document).on('click', '.stream_ratp_control_toggle', function() {

  $("#stream_ratp_control").toggle();
});

$(document).on('click', '.delete_streaming', function() {

  $(this).closest('.stream_ratp').hide();
  deleteStreamToLocalStorage($(this).data('ratp_stream_slug'));


});

$(document).on('click', '#local_storage_flush', function() {

  flushLS();

});
$(document).on('click', '#stream_ratp_refresh', function() {

  ratpStreamRefreshAll();

});
$(document).on('click', '#stream_ratp_start', function() {

  ratpStreamRefreshAll();
  startStreamRatp();


});
$(document).on('click', '#stream_ratp_stop', function() {


  stopStreamRatp();


});

function ratpStreamRefreshAll() {

  $('.stream_ratp_datas').each(function() {
    console.log('id => ' + $(this).attr('id'));

    var stream_ratp = slugToJson($(this).attr('id'));

    var transport_slug_to_url = {
      metro: 'metros',
      bus: 'bus',
      rer: 'rers',
      tramway: 'tramways',
      noctilien: 'noctiliens'

    };


    if (transport_slug_to_url[stream_ratp.transport]) {
      stream_ratp.transport = transport_slug_to_url[stream_ratp.transport];
    }




    refreshAPIStream(
      stream_ratp.transport,
      stream_ratp.line,
      stream_ratp.station,
      stream_ratp.destination
    );





  });
}

function slugToJson(slug) {
  var stream_ratp = slug.split('_');
  // stream_ratp_bus_322_vaillant-couturier_pablo+picasso
  console.log('sslugToJson lug => ' + slug);
  console.log('slugToJson stream_ratp => ' + stream_ratp[4] + ' => ' + stream_ratp[5]);

  var stream_ratp_obj = {
    action: stream_ratp[0],
    name: stream_ratp[1],
    transport: stream_ratp[2],
    line: stream_ratp[3],
    station: stream_ratp[4],
    destination: stream_ratp[5]
  };

  return stream_ratp_obj;
}


/******************************************************
 * 
 * Local Storage
 * 
 * ***************************************/
function flushLS() {

  console.log('flushLS local storage ');
  localStorage.setItem("stream_ratp_list", null);

}

function getLS() {

  var stream_ratp_list = localStorage.getItem("stream_ratp_list")

  console.log('getLS local storage  => ' + stream_ratp_list + ' === ' + JSON.stringify(stream_ratp_list));

  if (typeof(stream_ratp_list) == 'undefined' || stream_ratp_list == null || stream_ratp_list == 'null') {
    console.log('getLS local storage vide');

    return false;
  }

  if (isJson(stream_ratp_list)) {
    stream_ratp_list = JSON.parse(stream_ratp_list);
    console.log('getLS is json ok  ! ');
  }

  if (!stream_ratp_list.length) {

    console.log('getLS rien dans la memoire ! ');

    return false;
  }

  return stream_ratp_list;

}


function loadStreamRaptStorage() {


  var stream_ratp_list = getLS();




  if (!stream_ratp_list || typeof(stream_ratp_list) != 'object') {

    console.log('loadStreamRaptStorage rien dans la memoire ! ');

    return false;
  }
  console.log('loadStreamRaptStorage ==>  stream_ratp_list => ' + JSON.stringify(stream_ratp_list))


  $.each(stream_ratp_list, function(index, value) {

    if (typeof(value) == 'undefined' || value == null || value == 'null' || value.length == 0 || value.length == 'undefined') {

      console.log('## loadStreamRaptStorage => value not good' + index + ' value:' + JSON.stringify(value));

      return true;

    }

    if (JSON.stringify(value) == '{}' || value.length == 'undefined') {
      console.log('##### loadStreamRaptStorage => value not good' + index + ' value:' + JSON.stringify(value));
      return true;
    }

    console.log('## loadStreamRaptStorage => value string ' + index + ' value:' + JSON.stringify(value) + value.length);

    console.log('## loadStreamRaptStorage => ' + index + ' value:' + value);

    var stream_ratp = value.split('_');
    // stream_ratp_bus_322_vaillant-couturier_pablo+picasso
    console.log('value => ' + value);
    console.log('stream_ratp => ' + stream_ratp[0]);

    var stream_ratp_obj = {
      action: stream_ratp[0],
      name: stream_ratp[1],
      transport: stream_ratp[2],
      line: stream_ratp[3],
      station: stream_ratp[4],
      destination: stream_ratp[5]
    };

    var transport_types = {
      metro: 'metros',
      bus: 'bus',
      rer: 'rers',
      tramway: 'tramways',
      noctilien: 'noctiliens'

    };

    if (transport_types[stream_ratp_obj.transport]) {
      stream_ratp_obj.transport = transport_types[stream_ratp_obj.transport];
    }


    console.log('stream_ratp_obj => ' + stream_ratp_obj);


    getAPIStream(stream_ratp_obj.transport, stream_ratp_obj.line, stream_ratp_obj.station, stream_ratp_obj.destination);
    //console.log('loadStreamRaptStorage will buildStreamRatp : rep '+ rep );

    //buildStreamRatp(rep);


  });

}

function addStreamToLocalStorage(stream_ratp_slug) {

  if (typeof(Storage) == "undefined") {
    // Sorry! No Web Storage support..
    console.log('Sorry! No Web Storage support..');

    return false;
  }

  var stream_ratp_list = [];

  var stream_ratp_localStorage = getLS();

  if (!stream_ratp_localStorage) {
    console.log('local storage vide init IT');
    stream_ratp_localStorage = [{}];

  }

  if (typeof(stream_ratp_localStorage[stream_ratp_slug]) != 'undefined' || stream_ratp_localStorage[stream_ratp_slug]) {
    console.log('deja enregistre ');
    return false;
  }

  if (JSON.stringify(stream_ratp_localStorage).indexOf(stream_ratp_slug) > -1) {

    console.log('stream_ratp_slug deja enregistre ' + stream_ratp_slug + ' => ' + stream_ratp_localStorage);

    return false;
  }


  stream_ratp_localStorage.push(stream_ratp_slug);


  localStorage.setItem("stream_ratp_list", JSON.stringify(stream_ratp_localStorage));


  console.log('#################### local saved stream_ratp_list => ' + JSON.stringify(stream_ratp_localStorage))

};

function deleteStreamToLocalStorage(stream_ratp_slug) {

  var stream_ratp_list = getLS();

  console.log('deleteStreamToLocalStorage :: AVANT stream_ratp_list => ' + JSON.stringify(stream_ratp_list));

  console.log('deleteStreamToLocalStorage :: will delte  => ' + JSON.stringify(stream_ratp_list[1]));


  var stream_ratp_slug_persist = stream_ratp_slug;
  var key_to_delete = null;
  console.log('stream_ratp_slug_persist :: will delte  => ' + stream_ratp_slug_persist);


  $.each(stream_ratp_list, function(key, val) {


    console.log('deleteStreamToLocalStorage :: each => ' + stream_ratp_slug_persist + ' slug || ' + val + '__ ' + key + '__ => ' + stream_ratp_list[key]);
    console.log('deleteStreamToLocalStorage :: each => ' + typeof(val) + '__ ' + key + '__ => ' + typeof(stream_ratp_list[key]));
    console.log('deleteStreamToLocalStorage :: each => ' + typeof(val) + '__ ' + key + '__ => ' + typeof(stream_ratp_list[key]));



    if (typeof(val) == 'object') {
      return true;
    }


    if (val == stream_ratp_slug) {

      key_to_delete = key;

      console.log('############### deleteStreamToLocalStorage :: ok del => ' + val + '__ ' + key + '__ => ' + stream_ratp_list[key]);

      deleteLSbyKey(key);

      delete stream_ratp_list[key];

      return false;
    }

    console.log('#-- deleteStreamToLocalStorage not found');

  });

  console.log('key_to_delete => after each' + key_to_delete);

  delete stream_ratp_list[key_to_delete];


  console.log('## deleteStreamToLocalStorage :: stream_ratp_list => ' + JSON.stringify(stream_ratp_list));

  localStorage.setItem("stream_ratp_list", JSON.stringify(stream_ratp_list));



}

function deleteLSbyKey(key) {

  var ls = getLS();

  delete ls[key];

  console.log('########)))))   deleteStreamToLocalStorage :: stream_ratp_list => ' + ls[key] + JSON.stringify(ls));

  localStorage.setItem("stream_ratp_list", JSON.stringify(ls));


}

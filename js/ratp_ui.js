/* Boost get json avec loader image
(function($) {
    $.extend({
        getJSON: function(url, loadingSelector, data, callback) {
            if ($.isFunction(data)) {
                callback = data;
                data = null;
            }
 
            var loadingElement = $(loadingSelector);
            return $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                beforeSend: function() {
                    loadingElement.addClass('fa-pulse');
                },
                complete: function() {
                    loadingElement.removeClass('fa-pulse');
                },
                success: callback,
                data: data
            })
        }
    })
})(jQuery);
*/

//http://packery.metafizzy.co/
    var $grid = $('.grid').packery({
      // options
      itemSelector: '.grid-item',
      gutter: 5,
      itemSelector: '.panel-heading',
      percentPosition: true,
      columnWidth: 100
      
    });
    
    
    
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
      if(schedule.message.toLowerCase().indexOf(mess_exemple.toLowerCase()) ) {
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
  
  
  return html_schedules;
}


/************************************************
 * 
 * HTML ADD
 * 
 * ***********************************************/
function addStation(transport, line, st, destinations) {

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

  var html_schedules = getHtmlSchedules(rep.schedules);
  var stream_slug = 'stream_ratp_' + rep.informations.type + '_' + rep.informations.line + '_' + rep.informations.station.slug + '_' + rep.informations.destination.slug;

  $('#' + stream_slug).html('');

  if (document.getElementById(stream_slug) == null) {
    //console.log('refreshStreamRatpDatas streaming ratp exist PAS ' + stream_slug);

    return false;
  }

  $('.stream_ratp_datas').each(function() {

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

  var html_schedules = getHtmlSchedules(rep.schedules);
  var stream_slug = 'stream_ratp_' + rep.informations.type + '_' + rep.informations.line + '_' + rep.informations.station.slug + '_' + rep.informations.destination.slug;
  var div_station_slug = "div_station_" + rep.informations.type + '_' + rep.informations.station.slug;

  div_station_slug = div_station_slug.replace('+', '_');
  var obj = slugToJson(stream_slug);

  if (document.getElementById(stream_slug) != null) {

    $('#' + stream_slug).fadeOut(10, function() {
      $(this).fadeIn(10);
    });

    return false;
  }

  addStreamToLocalStorage(stream_slug);

  var html_station = '<!-- station -->' +
          '<div class="panel-body" id="' + rep.informations.line + div_station_slug + '">' +
            '<div class="station ' + div_station_slug + '" id="'+ div_station_slug + '" >' +
              '<h4 id="' + jq('btn_' + stream_slug) + '">'+
              '<button id="" class="btn ' + rep.informations.type + '_line ' + rep.informations.type + '_line' + rep.informations.line + ' " type="button" data-transport="' + rep.informations.type + '" data-line="' + rep.informations.line + '">' +
                rep.informations.line +
              '</button>' +
                '<i class="fa fa-arrow-right  " aria-hidden="true"></i>' +
                rep.informations.destination.name +
              '<span class="close delete_streaming " data-ratp_stream_slug="'+stream_slug+'"  href="#" aria-label="Supprimer de la mémoire" title="Supprimer de la mémoire">×</span>' +

              '</h4>' +
              '<ul id="' + stream_slug + '" class="list-group stream_ratp_datas">'+
                html_schedules +
              '</ul>' +
            '</div>' +
          '</div><!-- fin station -->'
          ;
         
       var css_slug = 'btn-title_line' + rep.informations.line+'_'+  rep.informations.station.slug.replace('+', '-')  ;
       var class_css_ratp_line = rep.informations.type + '_line ' + rep.informations.type + '_line' + rep.informations.line ;
       
  // Station div existe deja, on ajoute uniquement le stream
  if ($('#' + div_station_slug).length) {

    $('#' + div_station_slug).prepend(html_station);
  
    if (!$('.' + css_slug).length) {
      $('.title_' + div_station_slug ).prepend(
        '<button  class="btn ' + class_css_ratp_line + ' '+css_slug+' " type="button">' +
          rep.informations.line +
        '</button>' 
      );
    }
    

  } else {
    
    var $items = '<div class="col-xs-6 col-md-3 stream_ratp grid-item" id="'+rep.informations.station.slug+'">' +
        '<div class="panel panel-default " >' +
          '<div class="panel-heading">' +
            '<h3 class="panel-title title_'+div_station_slug+'">' +
              //'<span class="close delete_streaming " data-ratp_stream_slug="'+stream_slug+'"  href="#" aria-label="Supprimer de la mémoire" title="Supprimer de la mémoire">×</span>' +
              '<button class="btn ' + class_css_ratp_line + ' '+css_slug+'" type="button" data-transport="' + rep.informations.type + '" data-line="' + rep.informations.line + '">' +
                rep.informations.line +
              '</button>' +
              rep.informations.station.name +
            '</h3>' +
          '</div>' +
          html_station +
        '</div>' +
      '</div>'  +
    '</div>';
    
 
//var $grid = $('.grid').packery();
    
 
   $('.grid').prepend( $items )
    // add and lay out newly prepended items
    .packery( 'prepended', $items );
    $('.grid').packery('layout');

  }
}


/************************************************
 * 
 * API 
 * 
 * ***********************************************/




function refreshAPIStream(transport, line, station, dest) {

  var url = stream_ratp_api_url + transport + "/" + line + "/stations/" + station + "?destination=" + dest;

  $.getJSON(url, '.metro_line', function(data) {
    
    refreshStreamRatpDatas(data.response);
  });

}


function getAPIStream(transport, line, station, dest) {

  //https://api-ratp.pierre-grimaud.fr/v2/metros/8/stations/daumesnil?destination=balard
  var url = stream_ratp_api_url + transport + "/" + line + "/stations/" + station + "?destination=" + dest;

  $.getJSON(url,  '.metro_line',function(data) {
    buildStreamRatp(data.response);
  });
}

function getAPILignes(transport) {

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
  $.getJSON(stream_ratp_api_url + transport + "/" + line,
    function(data) {
      var list_items = data.response.stations;
      var destinations = data.response.destinations;

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

  var $grid = $('.grid').packery({
      // options
      //itemSelector: '.grid-item',
      //gutter: 5,
      itemSelector: '.panel-heading',
      percentPosition: true,
      columnWidth: 350
      
    });

$(document).on('click', '.doDraggable', function() {

  var bindMethod = 'bindDraggabillyEvents';
  var enableMethod = 'enable' ;

  if($(this).hasClass('draggableOn')) {

    enableMethod = 'disable' ;
     bindMethod = 'unbindDraggabillyEvents';
  }
  
  var $grid = $('.grid').packery();
  var $items = $grid.find('.grid-item');
  
  // init draggabilly
  $items.draggabilly();
  // disable draggabilly
  $items.draggabilly('disable');
  
   $items.draggabilly( enableMethod );
    // bind/unbind with Packery
    $items.each( function( i, itemElem ) {
      // get draggabilly instance
      var draggie = $( itemElem ).data('draggabilly');
      $grid.packery( bindMethod, draggie );
    });
  
  /*
  //$grid.find('.grid-item').draggabilly( enableMethod );
  
  $grid.find('.grid-item').each( function( i, gridItem ) {
    gridItem.draggabilly();
    gridItem.draggabilly(enableMethod);
    
    
    //var draggie = new Draggabilly( gridItem );
   // draggie.draggabilly( enableMethod );
    // bind drag events to Packery
    //$grid.packery( method, draggie );
    
     //var draggie = $( gridItem ).data('draggabilly');
      $('.grid').packery( method, draggie );
      */
  //});
  
  
  $(this).toggleClass('draggableOn');




});
$(document).on('click', '.reOrganizeBlocs', function() {

  //var $grid = $('.grid').packery();
     $('.grid').packery();
     


});


$(document).ready(function() {
  

      $('.grid').packery({
          itemSelector: '.grid-item', 
  columnWidth: '.grid-sizer',
  percentPosition: true
      });

  
  initStreamLoader('Ratp', 'stream_ratp_loading_spinner_span');

  loadStreamRaptStorage();

  startStreamRatp();
  $("#add_metros").toggle();
  $("#stream_ratp_control").toggle();

  
   
/*
// make all grid-items draggable
// make all items draggable
//var $items = $grid.find('.grid-item').draggable();
// bind drag events to Packery
//$grid.packery( 'bindUIDraggableEvents', $items );
function orderItems() {
  var itemElems = $grid.packery('getItemElements');
  $( itemElems ).each( function( i, itemElem ) {
    $( itemElem ).text( i + 1 );
  });
}

$grid.on( 'layoutComplete', orderItems );
$grid.on( 'dragItemPositioned', orderItems );
*/
 
});

//Ajax loader UI
//https://api.jquery.com/category/ajax/global-ajax-event-handlers/

function initStreamLoader(name, id) {
  $('body').append('<span id="' + id + '">'+
       '<i class="fa fa-refresh fa-spin fa-fw "></i>'+
        name +
    '</span>')
}
$(document).ajaxStart(function() {
  
  var spinner = $( "#stream_ratp_loading_spinner_span" );
  spinner.css({color:'#9dff00'});
   if(spinner.is(':animated')) {
         spinner.stop().animate({opacity:'100'});
      } else {
        spinner.show();
      }
});
$(document).ajaxStop(function() {
     var spinner = $( "#stream_ratp_loading_spinner_span" );

  spinner.css({color:'#00c4ff'}).fadeOut(stream_ratp_time - 1000*2);
  

  
});
$( document ).ajaxError(function() {
    var spinner = $( "#stream_ratp_loading_spinner_span" );

  spinner.css({color:'#ed1b2a'});
});

//Select transport
$(document).on('click', '.get_transport', function() {

  var transport = $(this).data('transport');

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

  $('.select_dest').addClass('disabled ');
  $('.select_dest').removeClass('active selected_dest');

  $(this).removeClass('disabled ');
  $(this).addClass('active selected_dest');

  $('#add_stream_ratp').data('dest', dest);

});
$(document).on('click', '.select_station', function() {
  var transport = $(this).data('transport');
  var line = $(this).data('line');
  var station = $(this).data('station');

  $('.select_station').addClass('disabled ');
  $('.select_station').removeClass('active selected_station');

  $(this).removeClass('disabled ');
  $(this).addClass('active selected_station');

  $('#add_stream_ratp').data('station', station);

});

$(document).on('click', '#add_stream_ratp', function() {

  var transport = $(this).data('transport');
  var line = $(this).data('line');
  var dest = $(this).data('dest');
  var station = $(this).data('station');

  if (isNullOrUndefined(transport) ||
    isNullOrUndefined(line) ||
    isNullOrUndefined(station) ||
    isNullOrUndefined(dest)
  ) {

    $(this).addClass('disabled ');
    $(this).removeClass('active ');
    //console.log('il manque un parametre !!   + line + transport +  station + dest) ' + line + transport + station + dest);

    return false;
  }

  $(this).removeClass('disabled ');
  $(this).addClass('active');

  getAPIStream(transport, line, station, dest);


});

$(document).on('click', '.stream_ratp_form_toggle', function() {

  $("#add_metros").toggle();
});

$(document).on('click', '.stream_ratp_control_toggle', function() {

  $("#stream_ratp_control").toggle();
});

$(document).on('click', '.delete_streaming', function() {

  $(this).closest('.station').hide();
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
  //console.log('slugToJson stream_ratp => ' + stream_ratp[4] + ' => ' + stream_ratp[5]);

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

  localStorage.setItem("stream_ratp_list", null);

}

function getLS() {

  var stream_ratp_list = localStorage.getItem("stream_ratp_list")

  if (typeof(stream_ratp_list) == 'undefined' || stream_ratp_list == null || stream_ratp_list == 'null') {

    return false;
  }

  if (isJson(stream_ratp_list)) {
    stream_ratp_list = JSON.parse(stream_ratp_list);
  }

  if (!stream_ratp_list.length) {

    return false;
  }

  return stream_ratp_list;

}


function loadStreamRaptStorage() {

  var stream_ratp_list = getLS();
  if (!stream_ratp_list || typeof(stream_ratp_list) != 'object') {

    return false;
  }
  $.each(stream_ratp_list, function(index, value) {

    if (typeof(value) == 'undefined' || value == null || value == 'null' || value.length == 0 || value.length == 'undefined') {

      return true;

    }

    if (JSON.stringify(value) == '{}' || value.length == 'undefined') {

      return true;
    }

    var stream_ratp = value.split('_');
    // stream_ratp_bus_322_vaillant-couturier_pablo+picasso
    //console.log('value => ' + value);
    //console.log('stream_ratp => ' + stream_ratp[0]);

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

    getAPIStream(stream_ratp_obj.transport, stream_ratp_obj.line, stream_ratp_obj.station, stream_ratp_obj.destination);

  });

}

function addStreamToLocalStorage(stream_ratp_slug) {

  if (typeof(Storage) == "undefined") {
    // Sorry! No Web Storage support..
    //console.log('Sorry! No Web Storage support..');

    return false;
  }

  var stream_ratp_localStorage = getLS();

  if (!stream_ratp_localStorage) {
    //console.log('local storage vide init IT');
    stream_ratp_localStorage = [{}];

  }

  if (typeof(stream_ratp_localStorage[stream_ratp_slug]) != 'undefined' 
  || stream_ratp_localStorage[stream_ratp_slug]
  || JSON.stringify(stream_ratp_localStorage).indexOf(stream_ratp_slug) > -1
  ) {
    //console.log('deja enregistre ');
    return false;
  }

  stream_ratp_localStorage.push(stream_ratp_slug);

  localStorage.setItem("stream_ratp_list", JSON.stringify(stream_ratp_localStorage));

};

function deleteStreamToLocalStorage(stream_ratp_slug) {

  var stream_ratp_list = getLS();
  var stream_ratp_slug_persist = stream_ratp_slug;
  var key_to_delete = null;

  $.each(stream_ratp_list, function(key, val) {

    if (typeof(val) == 'object') {
      return true;
    }


    if (val == stream_ratp_slug) {

      key_to_delete = key;
      deleteLSbyKey(key);

      delete stream_ratp_list[key];

      return false;
    }


  });

  delete stream_ratp_list[key_to_delete];

  localStorage.setItem("stream_ratp_list", JSON.stringify(stream_ratp_list));


}

function deleteLSbyKey(key) {

  var ls = getLS();

  delete ls[key];

  localStorage.setItem("stream_ratp_list", JSON.stringify(ls));


}


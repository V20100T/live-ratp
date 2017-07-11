$(document).ready(function() {

  $("#stream_ratp_control").toggle();
  $('#lines_input').val("").focus();
  buildSchedules(false);
  //refreshTraffic();
  startStreamRatp();
  $('#traffic').toggle();



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

  ratpStreamRefresh();

});
$(document).on('click', '#stream_ratp_start', function() {

  ratpStreamRefresh();
  startStreamRatp();


});
$(document).on('click', '#stream_ratp_stop', function() {


  stopStreamRatp();


});


$(document).on('click', '.test', function() {

  Awesomplete.$.bind(
    document.getElementById("lines_input"),
     { "open": testopen }
   );
    //lineAwesomplete.open();
    stationsAwesomplete.open();
      function testopen(){
        alert('testopen');
      }
});


function getHtmlSchedules(sc, data){

  //console.log('>> getHtmlSchedules ' + sc.slug + ' : '+ getHeure());
  scheduleId =  slugApiToSlugJQ(sc.slug + '_' + sc.urls.key);
  html = '<!-- schedules ' + sc.slug + ' -->'+
          '<div id="'+ scheduleId +'" class="schedule"><span class="heure">'+ getHeure() + '</span> ';


  _.each(data, function(stream, key){

    //console.log('>>> stream : ', stream, key);
    if(key == 0) {
      html = html + stream.destination + ' :';
    }
    html = html + '<span class="label label-default">'+
     stream.message  +
     '</span> '
  });
  html = html + '</div><!-- fin schedules --> '

  //console.log('>>> HTML schedule : '+ sc.slug , html);

  return html;
}

function getHtmlStation(sc){
  //console.log('>> getHtmlStation ', sc.slug);

    return   '<!-- station -->' +
            '<div class="station" id="' + slugApiToSlugJQ(sc.slug)+  '">' +
            '<span class="close delete_streaming " data-ratp_stream_slug="'+slugApiToSlugJQ(sc.slug)+'"  href="#" aria-label="Supprimer de la mémoire" title="Supprimer de la mémoire">×</span>' +
               '#' +sc.station.name +
               '<br> '+
               sc.line.name +' <span class="label label-default traffic_station_'+sc.type+'_'+sc.line.slug+'">-</span>' +
               ' '+
              /*'<br><a href="'+sc.urls.a+'" target="_blank" >'+sc.urls.a+'</a><br>'+
              '<a href="'+sc.urls.r+'" target="_blank" >'+sc.urls.r+'</a><br>'+
              */'<div class="schedules">'+
                '<div class="dest_a"></div>'+
                '<div class="dest_r"></div>'+
              '</div> '+
            '<hr></div>'+
            '<!-- fin station -->'
            ;
}


function refreshTrafficUi(html, slug, line){
  $('#traffic').prepend(html);
   $('.traffic_station_'+slug).html(line.title).attr('title', line.message);

}

function refreshScheduleUi(html_schedules, scheduleId, sc){
  $("#"+scheduleId).fadeOut().remove();
  $('#'+sc.slug).children('.schedules').append(html_schedules);

}

function showHtmlStation(html){
  $('#ratp_schedules').prepend(html);
}

function selectLineWithPickerUi(evt, line){
  document.getElementById("stations_input").value = 'Toi choisir station !';
  $('#lines_input').val('');
  $('#stations_input').focus();
  $('#stations_input').attr('data-line', evt.text.value);
  $('#stations_input').attr('data-line-label', evt.text.label);
    //document.getElementById("lines_input").value = evt.text.label;

    $('#label_stations_input').children('.label-stations').text('Stations ligne '+line.slug);
    $('#stations_input').val('').focus();

}

function selectStationstWithPickerUi(){

  $('#stations_input').val('');
  $('#lines_input').val('').focus();
}

function getHtmlTraffic(slug, line){
  return  '<li id="'+slug+'" class="traffic_line" title="'+line.message+'">'+
          slug + ' ' + line.title +
          '</li>';
}

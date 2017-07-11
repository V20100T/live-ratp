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

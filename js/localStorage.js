/******************************************************
 *
 * Local Storage
 *
 * ***************************************/

var localStorageRatpUI = 'ratp_ui';

function flushLS() {
  console.log('>> flushLS');
  localStorage.setItem(localStorageRatpUI, null);

}

function getLS() {

  if (typeof(Storage) == "undefined" || localStorage == null) {
    // Sorry! No Web Storage support..
    console.log('Sorry! No Web Storage support..');

    return false;
  }


  stream_ratp_list = localStorage.getItem(localStorageRatpUI)

  console.log('>> getLS', stream_ratp_list);


  if (typeof(stream_ratp_list) == 'undefined' || stream_ratp_list == null ||
    stream_ratp_list == 'null') {

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

function addStreamToLocalStorage(schedule) {

  console.log('>> addStreamToLocalStorage ' + schedule.slug);
  stream_ratp_slug = slugApiToSlugJQ(schedule.slug);

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

  if (typeof(stream_ratp_localStorage[stream_ratp_slug]) != 'undefined' ||
    stream_ratp_localStorage[stream_ratp_slug] || JSON.stringify(
      stream_ratp_localStorage).indexOf(stream_ratp_slug) > -1
  ) {
    console.log('>>> deja enregistre ');
    return false;
  }

  stream_ratp_localStorage.push(schedule);

  localStorage.setItem(localStorageRatpUI, JSON.stringify(
    stream_ratp_localStorage));

};


function deleteStreamToLocalStorage(stream_ratp_slug) {

  console.log('>> deleteStreamToLocalStorage ' + stream_ratp_slug);
  var stream_ratp_list = getLS();

  $.each(stream_ratp_list, function(key, val) {
    //console.log(val, key);
    if (val == null) {
      deleteLSbyKey(key);
      return true;
    }
    if (typeof(val) == 'object' && val.slug && val.slug == stream_ratp_slug) {
      deleteLSbyKey(key);
      return false;
    }
    return true;
  });

  //delete stream_ratp_list[key_to_delete];

  //localStorage.setItem(localStorageRatpUI, JSON.stringify(stream_ratp_list));


}

function deleteLSbyKey(key) {
  console.log('>> deleteLSbyKey ' + key);
  var ls = getLS();
  delete ls[key];
  console.log('>>>  new', JSON.stringify(ls));
  localStorage.setItem(localStorageRatpUI, JSON.stringify(ls));
  console.log('>>>  new LS', JSON.stringify(getLS()));

}

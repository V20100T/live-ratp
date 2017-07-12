/***************************
 *
 * Config
 *
 *
 * *****************************/

var stream_ratp_api_url = 'https://api-ratp.pierre-grimaud.fr/v3/';
var stream_ratp_time = 1000 * 35;



var input = document.getElementById("lines_input");
var ajax = new XMLHttpRequest();
urlLines = "https://api-ratp.pierre-grimaud.fr/v3/lines";
ajax.open("GET", urlLines, true);
ajax.onload = function() {
  console.log('>> ajax onload ' + urlLines);
  var list = getRatpApiListItems(JSON.parse(ajax.responseText));
  var lineAwesomplete = new Awesomplete(
    document.getElementById("lines_input"), {
      list: list,
      minChars: 0,
      maxItems: 50,
      autoFirst: true,
      //filter: Awesomplete.FILTER_STARTSWITH

    });

  Awesomplete.$.bind(
    document.getElementById("lines_input"), {
      "awesomplete-selectcomplete": selectLineWithPicker
    }
  );



  lineAwesomplete.open();

}; //end ajax onload
ajax.send();

function startStreamRatp() {

  refreshTraffic();

  ratpStreamRefresh();
  stream_ratp_timer = setInterval(function() {
    ratpStreamRefresh();
    refreshTraffic();
  }, stream_ratp_time);

}

function stopStreamRatp() {
  clearInterval(stream_ratp_timer);
}


function ratpStreamRefresh() {
  $('.station').each(function(i, st) {
    //console.log(i, st, $(st).attr('id'));
    //console.log('>>>' + slugJQToSlugApi($(st).attr('id')));
    station = _.object(['type', 'line', 'station'], ($(st).attr('id')).split(
      '_'));

    //console.log(station,station.station, slugJQToSlugApi(station.station));


    sc = setSchedule(
      station.type + '_' + station.line + '_' + station.station,
      station.type, {
        slug: station.line,
        name: '??'
      }, {
        slug: slugJQToSlugApi(station.station),
        name: '??'
      }, {
        a: stream_ratp_api_url + 'schedules/' + station.type + '/' +
          station.line + '/' + station.station + '/A',
        r: stream_ratp_api_url + 'schedules/' + station.type + '/' +
          station.line + '/' + station.station + '/R',
      }
    );

    refreshSchedule(sc);

  });
}

function refreshTraffic() {
  console.log('>> refreshTraffic ');
  url = stream_ratp_api_url + 'traffic'
  $.getJSON(url, function(data) {
    //console.log('>>> refreshTraffic datas : '+ url , data);
    if (!data.result) {
      console.log('no result in rep');
      return false;
    }
    _.each(data.result, function(trafficType, type) {
      _.each(trafficType, function(line, key) {
        //console.log('>>> refreshTraffic '+type+line.line);
        slug = type + '_' + line.line;
        refreshTrafficUi(getHtmlTraffic(slug, line), slug, line);


      });
    });



  });

}

function refreshSchedule(sc) {
  console.log('>> refreshSchedule ' + sc.slug);
  _.each(sc.urls, function(url, key) {
    //console.log('>>> url', url, key);

    $.getJSON(url, function(data) {
      console.log('>>> refreshSchedule datas : ' + sc.slug + ' :: ' +
        key + ' : ', url);
      if (!data.result.schedules) {
        //console.log('no schedules in rep');
        return false;
      }
      sc.urls.key = key;
      scheduleId = slugApiToSlugJQ(sc.slug + '_' + key);
      html_schedules = getHtmlSchedules(sc, data.result.schedules);
      //console.log('>>>> ADDD scheduleId : ' + scheduleId);

      refreshScheduleUi(html_schedules, scheduleId, sc);
      /*
      $("#"+scheduleId).fadeOut().remove();
      $('#'+sc.slug).children('.schedules').append(html_schedules);
      //pulse($('#'+sc.slug).children('.schedules'))
      */
    });

  });

}


function buildSchedule(sc) {
  console.log('>> buildSchedule', sc);
  if (sc == null || !sc.slug) {
    return false;
  }

  if (document.getElementById(slugApiToSlugJQ(sc.slug))) {
    console.log('>>> buildSchedule deja contruit : ', sc.slug);
  } else {

    //html_station = getHtmlStation(sc);
    showHtmlStation(sc);
    //$('#ratp_schedules').prepend(html_station);
    refreshSchedule(sc);
  }
}

function buildSchedules(sc) {
  //console.log('>> buildSchedules', sc);

  if (sc) {
    buildSchedule(sc);
    return true;
  }
  //sinon on charge tout les shecdules du localStorage
  schedules = getLS();

  _.each(schedules, function(sc, key) {
    //console.log('>> buildSchedules all from LS ', sc);
    buildSchedule(sc);
  });

}

function addSchedule(sc) {

  buildSchedules(sc);
  addStreamToLocalStorage(sc);

}


function getRatpStationsApiListItems(rep) {

  var list = [];
  console.log('> start station ; : getRatpStationsApiListItems : ', rep);
  if (rep == 'undefined' || !rep.result) {
    return list;
  }

  _.each(rep.result.stations, function(station, key) {
    //console.log(key, station);


    list.push({
      label: normalizeStr(station['name']),
      value: station['slug'],

    });


  });

  return list;


}

function getRatpApiListItems(rep) {
  list = [];
  console.log('>> getRatpApiListItems : ', rep);
  if (rep == 'undefined' || !rep.result) {
    return list;
  }

  _.each(rep.result, function(itemList, type) {
    //console.log('each : ', type, itemList);
    itemList.map(function(item) {
      typeTransportTranslate = {
        'metros': 'M',
        'tramways': 'T',
        'bus': 'B',
        'noctiliens': 'N',
        'rers': 'R'
      };
      list.push({
          label: typeTransportTranslate[type] + item['code'] +
            // ' : ' +
            //normalizeStr(item['name']) +
            ' >> ' + item['directions'],
          value: type + '_' + item['code'],
          type: type,
          datatype: type
        }

      );

    });
  });

  console.log('<< getRatpApiListItems : ', list);
  return list;
};


function selectLineWithPicker(evt) {
  console.log('>> selectLineWithPicker ' + evt.text.value);
  //console.log(evt.text.label);

  line = _.object(['type', 'slug'], evt.text.value.split('_'));
  line.label = evt.text.label;
  //console.log(line);

  selectLineWithPickerUi(evt, line);


  //STATIONS :
  var ajaxStations = new XMLHttpRequest();
  // GET /stations/{type}/{code}
  url = "https://api-ratp.pierre-grimaud.fr/v3/stations/" + line.type + '/' +
    line.slug;
  //console.log(url);
  ajaxStations.open("GET", url, true);
  ajaxStations.onload = function() {
    console.log('>> ajaxStations onload ' + url);
    var listStations = getRatpStationsApiListItems(JSON.parse(ajaxStations.responseText));
    stationsAwesomplete = new Awesomplete(
      document.querySelector("#stations_input"), {
        list: listStations,
        minChars: 0,
        maxItems: 50,
        autoFirst: true,
        //filter: Awesomplete.FILTER_STARTSWITH
      });
  };
  ajaxStations.send();
  Awesomplete.$.bind(
    document.getElementById("stations_input"), {
      "awesomplete-selectcomplete": selectStationstWithPicker
    }
  );


}

function setSchedule(slug, type, line, station, urls) {

  schedule = {
    slug: slug,
    type: type,
    line: line,
    station: station,
    urls: urls
  };

  return schedule;
}

function selectStationstWithPicker(evt) {
  console.log('>> selectStationstWithPicker ' + evt.text.value);
  line = _.object(['type', 'slug'], $('#stations_input').attr('data-line').split(
    '_'));
  linesLabel = $('#stations_input').attr('data-line-label');
  schedule = setSchedule(
    slugApiToSlugJQ(line.type + '_' + line.slug + '_' + evt.text.value),
    line.type, {
      slug: line.slug,
      name: linesLabel
    }, {
      slug: evt.text.value,
      name: evt.text.label
    }, {
      a: "https://api-ratp.pierre-grimaud.fr/v3/schedules/" + line.type + '/' +
        line.slug + '/' + evt.text.value + '/A',
      r: "https://api-ratp.pierre-grimaud.fr/v3/schedules/" + line.type + '/' +
        line.slug + '/' + evt.text.value + '/R'

    }
  );
  console.log('>>> selectStationstWithPicker ', schedule);
  addSchedule(schedule);
  selectStationstWithPickerUi();
  stationsAwesomplete.destroy();
}

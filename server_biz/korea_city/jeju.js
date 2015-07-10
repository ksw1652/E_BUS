/**
 * Created by airnold on 15. 4. 27..
 */

// get html
// route -> http://mbus.jeju.go.kr/mobile/busLocation.jsp
// param -> routeId
// station -> http://mbus.jeju.go.kr/mobile/busArrStation.jsp
// param -> stationId

var request = require('request');
var jsdom = require('jsdom');


var commonBiz = require('../korea_common/common_biz.js');


var jejuObject = {};

var routeurl = "http://bus.jeju.go.kr/data/line/realTimeBusPosition";

var stationurl = "http://bus.jeju.go.kr/web/search/stationDetailInfo";



/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.routeId = {};



requestData.station = {};
requestData.station.stationId = '';


jejuObject.urlRouteRequest = function (dbObject, callback) {

    requestData.route.routeId = dbObject[0].routeid;

    request.post({
        url: routeurl,

        form: {
            routeId: requestData.route.routeId
        }
    }, function (error, response, json) {
        var jeju_bus_location_seq = [];
        var up_seq = [];
        if (!error && response.statusCode == 200) {

            var parsed = JSON.parse(json);


            var arr = [];
            for (var x in parsed) {
                arr.push(parsed[x]);
            }

            var jsondata = arr;

            for (var i in jsondata) {

                up_seq.push(findRouteSeq(jsondata[i].currStationId, dbObject));

            }

            jeju_bus_location_seq.push(up_seq);
            callback(jeju_bus_location_seq);


        }
    });

};


jejuObject.urlStationRequest = function (dbObject, callback) {

    requestData.station.stationId = dbObject[0].stopid;

    request.post({
        url: stationurl,
        form: {
            stationId: requestData.station.stationId
        },
        encoding : null
    }, function (error, response, html) {
        var jeju_list = [];
        if (!error && response.statusCode == 200) {

            var ic = new iconv.Iconv('euc-kr', 'utf-8');
            var buf = ic.convert(html);
            var utf8String = buf.toString('utf-8');
            var $ = cheerio.load(utf8String);

            var $tr = $('.layer_station_detail_info_arrive_bus_info_list tr');

            $tr.each(function(i){
                var temp = {};

                temp.routenm = $(this).find('td:nth-child(1)').text();
                temp.arrive_time = '약' +  $(this).find('td:nth-child(2)').text() + ' 후 도착';
                temp.cur_pos = $(this).find('td:nth-child(3)').text();
                temp.routeid = commonBiz.findRouteid(dbObject, temp.routenm);


                jeju_list.push(temp);

            });

            callback(jeju_list);
        }else{
            throw error;
        }
    });
};


function findRouteSeq(stopid, dbObject) {
    var seq = undefined;

    for (var i in dbObject) {
        /**
         * urlarr에 있는 stopid와 db에 stopnm을 비교하여 seq저장
         */

        if (dbObject[i].stopid === stopid) {
            seq = dbObject[i].seq;
            break;
        }
    }
    return seq;
}


module.exports = jejuObject;



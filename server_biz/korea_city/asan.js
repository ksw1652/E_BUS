/**
 * Created by airnold on 15. 4. 24..
 */

// post method // get json data
//   http://bus.asan.go.kr/mobile/traffic/searchBusRealLocationDetail -> route
//   route param -> busRouteId
//   http://bus.asan.go.kr/mobile/traffic/searchBusStopRoute  -> station
//   station param -> busStopId

var request = require('request');


var asanObject = {};

var routeurl = "http://bus.asan.go.kr/mobile/traffic/searchBusRealLocationDetail";
var stationurl = "http://bus.asan.go.kr/mobile/traffic/searchBusStopRoute";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.busRouteId = "";

requestData.station = {};
requestData.station.busStopId = "";

/**
 *
 * database data format
 */

asanObject.urlRouteRequest = function (dbObject, callback) {

    // dbObject에 있는 stop_name과 비교해야 함.

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */
    requestData.route.busRouteId = dbObject[0].routeid;

    request.post({
        url: 'http://bus.asan.go.kr/mobile/traffic/searchBusRealLocationDetail',
        form: {
            busRouteId: requestData.route.busRouteId
        }
    }, function (error, httpResponse, json) {

        var asan_bus_location_seq = [];
        var asan_bus_location_temp = [];
        var up_seq = [];
        var down_seq = [];
        var trnseq = dbObject[0].trnseq;

        if (error) {
            throw error;
        } else {
            var parsed = JSON.parse(json);
            // json -> array 변환
            var arr = [];
            for (var x in parsed) {
                arr.push(parsed[x]);
            }
            if (arr.length === 0) {
                //잘못된 버스번호
                callback(asan_bus_location_seq);
            }
            var jsondata = arr[0];

            for (var i in jsondata) {
                /**
                 * +1 된 값
                 */
                asan_bus_location_temp.push(findRouteSeq(jsondata[i].stop_id, dbObject));
            }

            if(trnseq === null || trnseq === dbObject.length){
                up_seq = asan_bus_location_temp;
                asan_bus_location_seq.push(up_seq);
                callback(asan_bus_location_seq);


            }else{
                for(var i in asan_bus_location_temp){
                    if(asan_bus_location_temp[i] < trnseq){
                        up_seq.push(asan_bus_location_temp[i]);
                    }else{
                        down_seq.push(asan_bus_location_temp[i]);
                    }
                }

                asan_bus_location_seq.push(up_seq);
                asan_bus_location_seq.push(down_seq);
                callback(asan_bus_location_seq);
            }
        }
    });
};
asanObject.urlStationRequest = function (dbObject, callback) {

    requestData.station.busStopId = dbObject[0].stopid;

    request.post({
        url: 'http://bus.asan.go.kr/mobile/traffic/searchBusStopRoute',
        form: {
            busStopId: requestData.station.busStopId
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {

            var psd = JSON.parse(json);
            var asan_list = psd.busStopRouteList;
            var asan_arrive_list = [];


            for (var i in asan_list) {
                var temp = {};
                temp.arrive_time = asan_list[i].provide_type + " 도착";
                temp.routenm = asan_list[i].route_name;
                temp.cur_pos = asan_list[i].rstop;
                temp.routeid = asan_list[i].route_id;

                asan_arrive_list.push(temp);
            }

            callback(asan_arrive_list);

        } else {
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

module.exports = asanObject;



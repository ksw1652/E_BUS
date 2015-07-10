/**
 * Created by airnold on 15. 4. 24..
 */

// post method // json
//   http://mbis.sejong.go.kr/web/traffic/searchBusRealLocationDetail
//   http://mbis.sejong.go.kr/mobile/traffic/searchBusRouteDetail
//   route param -> busRouteId
// 두개의 요청을 비교하여 seq 생성
//   http://mbis.sejong.go.kr/mobile/traffic/searchBusStopRoute
//   station param -> busStopId

var request = require('request');

var nimble = require('nimble');


var sejongObject = {};

var routeurl_first = "http://mbis.sejong.go.kr/web/traffic/searchBusRealLocationDetail";

var routeurl_second = "http://mbis.sejong.go.kr/mobile/traffic/searchBusRouteDetail";

var stationurl = "http://mbis.sejong.go.kr/mobile/traffic/searchBusStopRoute";

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

var databaseData = {};
databaseData.sid = "";
databaseData.cityCd = "";
databaseData.rid = "";
databaseData.stopNm = "";
databaseData.routeNm = "";


sejongObject.urlRouteRequest = function (dbObject, callback) {

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.busRouteId = dbObject[0].routeid;

    var routename = [];
    var routerealbusloc = [];
    var sejong_bus_location_seq = [];
    var trnseq = dbObject[0].trnseq;
    var up_seq = [];
    var down_seq = [];


    nimble.series([
        function(locCallback){
            request.post({
                url: routeurl_first,
                form: {
                    busRouteId: requestData.route.busRouteId
                }
            }, function (error, response, json) {
                if (!error && response.statusCode == 200) {


                    var parsed = JSON.parse(json);

                    if(parsed.busRealLocList.length === 0){
                        //잘못된 버스번호
                        //실시간 정보 없을때도

                        sejong_bus_location_seq.push(up_seq);
                        sejong_bus_location_seq.push(down_seq);
                        callback(sejong_bus_location_seq);
                        locCallback();
                    }else{
                        for (var x in parsed) {
                            routerealbusloc.push(parsed[x]);
                        }
                        locCallback();
                    }
                } else {
                    throw error;
                }
            });
        },
        function(routeCallback){

            request.post({
                url: routeurl_second,
                form: {
                    busRouteId: requestData.route.busRouteId
                }
            }, function (error, response, json) {
                if (!error && response.statusCode == 200) {
                    var parsed = JSON.parse(json);
                    for (var x in parsed) {
                        routename.push(parsed[x]);
                    }
                    var routedata = routename[0];
                    var busloc = routerealbusloc[0];


                    for (var i in routedata) {

                        for (var j in busloc) {
                            if (routedata[i].stop_id === busloc[j].stop_id) {

                                sejong_bus_location_seq.push(i*1+1);
                                if((i*1+1)< trnseq){
                                    up_seq.push(i*1+1);
                                }else{
                                    down_seq.push(i*1+1);
                                }
                            }
                        }
                    }
                    routeCallback();

                } else {
                    throw error;
                }
            });
        },
        function(resCallback){
            sejong_bus_location_seq.push(up_seq);
            sejong_bus_location_seq.push(down_seq);

            callback(sejong_bus_location_seq);
            resCallback();
        }
    ]);
};


sejongObject.urlStationRequest = function (dbObject, callback) {

    requestData.station.busStopId = dbObject[0].stopid;

    request.post({
        url: stationurl,
        form: {
            busStopId: requestData.station.busStopId
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {
            var parsed_json = JSON.parse(json);
            var sejong_list = parsed_json.busStopRouteList;
            var sejong_arrive_list = [];

            for(var i in sejong_list){
                var temp = {};

                temp.routenm = sejong_list[i].route_name;
                temp.routeid = sejong_list[i].route_id;
                temp.arrive_time = sejong_list[i].provide_type + " 도착";
                temp.cur_pos = sejong_list[i].rstop;

                sejong_arrive_list.push(temp);
            }
            callback(sejong_arrive_list);

        }else{
            throw error;
        }
    });

};


module.exports = sejongObject;



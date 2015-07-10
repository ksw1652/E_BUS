

/**
 * Created by airnold on 15. 4. 24..
 */

// post method // json
//   http://m.dcbis.go.kr/rest/getRunBusDetail.json
//   route param -> routeid
//   http://www.dcbis.go.kr/rest/getRouteRunBusDetail.json
//   station param -> sid

var request = require('request');

var chungjuObject = {};

var routeurl = "http://m.dcbis.go.kr/rest/getRunBusDetail.json";

var stationurl = "http://www.dcbis.go.kr/rest/getRouteRunBusDetail.json";


/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.routeid = "" ;

requestData.station = {};
requestData.station.sid = "";


chungjuObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.routeid = dbObject[0].routeid;

    request.post({
        url: routeurl,
        form: {
            routeid: requestData.route.routeid
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {
            var chungju_bus_location_seq = [];
            var up_seq = [];

            var parsed = JSON.parse(json);
            var arr = [];
            for(var x in parsed){
                arr.push(parsed[x]);
            }
            var jsondata = arr[0];

            if(jsondata.length === 0){
                // 잘못된 버스 번호
                callback(chungju_bus_location_seq);
            }else{
                for(var i in jsondata){
                    if(jsondata[i].busType !== ' '){
                        up_seq.push(i*1+1);
                    }
                }
                chungju_bus_location_seq.push(up_seq);
                callback(chungju_bus_location_seq);
            }

        }else{
            throw error;
        }
    });
};

chungjuObject.urlStationRequest = function(dbObject, callback){

    requestData.station.sid = dbObject[0].stopid;

    request.post({
        url: stationurl,
        form: {
            sid: requestData.station.sid
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {
            var parsed_json = JSON.parse(json);
            var chungju_list = parsed_json.model;
            var chungju_arrive_list = [];

            for(var i in chungju_list){
                var temp = {};
                temp.routenm = chungju_list[i].BUSROUTENO;
                temp.routeid = chungju_list[i].BUSID;
                temp.arrive_time = "약 " + chungju_list[i].PREDICTTRAVELTIME;
                temp.cur_pos = chungju_list[i].LOCATIONNO;
                chungju_arrive_list.push(temp);
            }

            if(chungju_arrive_list.length === 0){
                var temp = {};
                temp.arrive_time = "도착예정 버스가 없습니다";
                temp.routenm = "";
                temp.cur_pos = "";
                temp.routeid = "";
                chungju_arrive_list.push(temp);

                callback(chungju_arrive_list);
            }else{
                callback(chungju_arrive_list);
            }
        }else{
            throw error;
        }
    });

};







module.exports = chungjuObject;



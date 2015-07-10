/**
 * Created by airnold on 15. 4. 24..
 */

// post method // json
//   http://bis.hwasun.go.kr/busmap/busLocationList
//   route param -> LINE_ID

//   http://m.bis.hwasun.go.kr/mobile/busArriveInfoList
//   station param -> BUSSTOP_ID

var request = require('request');

var hwasoonObject = {};

var routeurl = "http://bis.hwasun.go.kr/busmap/busLocationList";

var stationurl = "http://m.bis.hwasun.go.kr/mobile/busArriveInfoList";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.LINE_ID = "" ;

requestData.station = {};
requestData.station.BUSSTOP_ID = "";






hwasoonObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */
    requestData.route.LINE_ID = dbObject[0].routeid;


    request.post({
        url: routeurl,
        form: {
            LINE_ID  : requestData.route.LINE_ID
        }
    }, function (error, response, json) {
        var hwasoon_bus_location_seq = [];
        var up_seq = [];
        if (!error && response.statusCode == 200) {

            var parsed = JSON.parse(json);
            var arr = [];

            for(var x in parsed){
                arr.push(parsed[x]);
            }
            var jsondata = arr[0];

            if(jsondata.length === 0){
                //잘못된 버스번호
                hwasoon_bus_location_seq.push(up_seq);
                callback(hwasoon_bus_location_seq);
            }else{
                for(var i in jsondata){
                    if(jsondata[i].CARNO !== null ){
                        up_seq.push(i*1+1);
                    }
                }
                hwasoon_bus_location_seq.push(up_seq);
                callback(hwasoon_bus_location_seq);
            }
        }else{
            throw error;
        }
    });

};
hwasoonObject.urlStationRequest = function(dbObject, callback){

    requestData.station.BUSSTOP_ID = dbObject[0].stopid;

    request.post({
        url: stationurl,
        form: {
            BUSSTOP_ID: requestData.station.BUSSTOP_ID
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {

            var psd = JSON.parse(json);
            var hwasoon_list = psd.list;
            var hwasoon_arrive_list = [];

            for(var i in hwasoon_list) {
                var temp = {};
                temp.arrive_time = "약 " + hwasoon_list[i].REMAIN_MIN + "분 후 도착";
                temp.cur_pos = hwasoon_list[i].REMAIN_STOP;
                temp.routenm = hwasoon_list[i].LINE_NAME;
                temp.routeid = hwasoon_list[i].LINE_ID ;

                hwasoon_arrive_list.push(temp);
            }
            if(hwasoon_arrive_list.length === 0){

                var temp = {};
                temp.arrive_time = "도착예정 버스가 없습니다";
                temp.routenm = "";
                temp.cur_pos = "";
                temp.routeid = "";

                hwasoon_arrive_list.push(temp);

                callback(hwasoon_arrive_list);
            }else{
                callback(hwasoon_arrive_list);
            }

        }else{
            throw error;
        }
    });

};








module.exports = hwasoonObject;



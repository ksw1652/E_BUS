/**
 * Created by airnold on 15. 4. 24..
 */

// get method // json
//   http://bus.gjcity.net/busmap/busLocationList
//   route param -> LINE_ID
// html data
//   http://m.bus.gjcity.net/mobile/busArriveInfoList
//   station param -> BUSSTOP_ID


/**
 * 안댐안댐 안댐
 * @type {Request|exports}
 */

var request = require('request');
var errorHaldling = require('../../utility/errorHandling.js');

var gwangjuObject = {};

var routeurl = "http://bus.gjcity.net/busmap/busLocationList";

var stationurl = "http://m.bus.gjcity.net/mobile/busArriveInfoList";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.LINE_ID = "" ;

requestData.station = {};
requestData.station.BUSSTOP_ID = "";


gwangjuObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */
    /*requestData.route.LINE_ID = dbObject[0].routeid;

    var url = routeurl + "?LINE_ID=" +  requestData.route.LINE_ID;

    request(url, function (error, response, json) {
        if (!error && response.statusCode == 200) {
            var gwangju_bus_location_seq = [];
            var parsed = JSON.parse(json);
            console.log(parsed);
            var arr = [];
            for(var x in parsed){
                arr.push(parsed[x]);
            }
            var jsondata = arr[0];

            if(jsondata.length === 0){
                //잘못된 버스번호
                callback(gwangju_bus_location_seq);
            }else{
                for(var i in jsondata){
                    if(jsondata[i].CARNO !== null){
                        gwangju_bus_location_seq.push(i*1+1);
                    }
                }
                callback(gwangju_bus_location_seq);
            }
        }else{
            throw error;
        }
    });*/
    var gwangju_bus_location_seq = [];
    var up_seq = [];
    gwangju_bus_location_seq.push(up_seq);
    callback(gwangju_bus_location_seq);

};
gwangjuObject.urlStationRequest = function(dbObject, callback){

    /*requestData.station.BUSSTOP_ID = dbObject[0].stopid;

    request.post({
        url: stationurl,
        form: {
            BUSSTOP_ID: requestData.station.BUSSTOP_ID
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {

            var psd = JSON.parse(json);
            var gwangju_list = psd.list;
            var gwangju_arrive_list = [];


            for(var i in gwangju_list) {
                var temp = {};
                temp.arrive_time = "약 " + gwangju_list[i].REMAIN_MIN + "분 후 도착";
                temp.routenm = gwangju_list[i].LINE_NAME;
                temp.routeid = gwangju_list[i].LINE_ID;
                temp.cur_pos = gwangju_list[i].REMAIN_STOP;

                gwangju_arrive_list.push(temp);
            }

            if(gwangju_arrive_list.length === 0){
                var temp = {};
                temp.arrive_time = "도착예정 버스가 없습니다";
                temp.routenm = "";
                temp.cur_pos = "";
                temp.routeid = "";

                gwangju_arrive_list.push(temp);

                callback(gwangju_arrive_list);
            }else{
                callback(gwangju_arrive_list);
            }
        }else{
            throw error;
        }
    });*/

    var gwangju_list = [];
    callback(gwangju_list);

};







module.exports = gwangjuObject;



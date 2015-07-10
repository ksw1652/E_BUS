/**
 * Created by airnold on 15. 4. 24..
 */

// post method // json
//   http://bis.jinju.go.kr/MainBusRouteListAjax.do
//   route param -> brt_id

//   http://bis.jinju.go.kr/MainBusArrivalListAjax.do
//   station param -> stop_id

var request = require('request');

var commonBiz = require('../korea_common/common_biz.js');

var jinjuObject = {};

var routeurl = "http://bis.jinju.go.kr/MainBusRouteListAjax.do";

var stationurl = "http://bis.jinju.go.kr/MainBusArrivalListAjax.do";


/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.brt_id = "" ;

requestData.station = {};
requestData.station.stop_id = "";


jinjuObject.urlRouteRequest = function(dbObject , callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.brt_id = dbObject[0].routeid;

    request.post({
        url: routeurl,
        form: {
            brt_id: requestData.route.brt_id
        }
    }, function (error, response, json) {
        var jinju_bus_location_seq = [];
        var up_seq = [];
        if (!error && response.statusCode == 200) {

            var parsed = JSON.parse(json);
            var arr = [];
            for(var x in parsed){
                arr.push(parsed[x]);
            }
            var jsondata = arr[2];

            if(jsondata === undefined){
                jinju_bus_location_seq.push(up_seq);
                callback(jinju_bus_location_seq);
            }else{
                for(var i in jsondata){
                    up_seq.push(findRouteSeq(dbObject,jsondata[i].Stop_ID));
                }
                jinju_bus_location_seq.push(up_seq);
                callback(jinju_bus_location_seq);
            }
        }else{
            throw error;
        }
    });
};


jinjuObject.urlStationRequest = function(dbObject, callback){

    requestData.station.stop_id = dbObject[0].arsid;

    request.post({
        url: stationurl,
        form: {
            stop_id: requestData.station.stop_id
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {
            var psd = JSON.parse(json);

            //jinju_bus_list --> 해당 정류소에 정차하는 모든 노선
            //jinju_bus_curr --> 현재 도착 예정 노선
            /*var jinju_bus_list = psd.AllBusArrivalInfoResult.AllBusArrivalInfo.MsgBody.BUSINFO.BusListInfo.list;*/

            var jinju_bus_curr = psd.AllBusArrivalInfoResult.AllBusArrivalInfo.MsgBody.BUSINFO.CurrentAllBusArrivalInfo.list;

            var jinju_arrive_list = [];

            for(var i in jinju_bus_curr) {
                var temp = {};
                temp.arrive_time = "약 " + commonBiz.changeTomin(jinju_bus_curr[i].remainTime) + " 후 도착";    //분 계산해줘야함
                temp.routenm = jinju_bus_curr[i].lineNo;
                temp.routeid = jinju_bus_curr[i].routeId;
                temp.cur_pos = jinju_bus_curr[i].remainStopCnt;

                jinju_arrive_list.push(temp);
            }
            if(jinju_arrive_list.length === 0){
                var temp = {};
                temp.arrive_time = "";
                temp.routenm = "";
                temp.cur_pos = "";
                temp.routeid = "";
                jinju_arrive_list.push(temp);

                callback(jinju_arrive_list);
            }else {
                callback(jinju_arrive_list);
            }
        }else{
            throw error;
        }
    });
};

function findRouteSeq(dbObject, Stop_ID){

    var seq;
    for(var i in dbObject){

        if(dbObject[i].arsid === Stop_ID){
            seq = dbObject[i].seq;
            break;
        }
    }
    return seq;
}

module.exports = jinjuObject;



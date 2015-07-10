/**
 * route & arrive 모두 여기서 포멧팅
 * 1. url 설정(url config)
 * 2. 요청 변수 설정
 * 3. module.exports 로 외부에서 사용가능하도록 만들어줄 예정
 */


/**
 * Created by airnold on 15. 4. 24..
 */

// seoul url
//


var request = require('request');
var xml2jsparser = require('xml2json');

var commonBiz = require('../korea_common/common_biz.js');

var seoulObject = {};

var routeurl = "http://ws.bus.go.kr/api/rest/buspos/getBusPosByRtid?" +
    "serviceKey=3Dk6D80iliB7j4NcdFAiIGHm2O3X7HXg8j27%2BTt7%2FOhxiAecZ%2FffBwSQZCjGcqzTlONzGeUh%2F17714ETt5z39Q%3D%3D";

var stationurl = "http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid?" +
    "serviceKey=3Dk6D80iliB7j4NcdFAiIGHm2O3X7HXg8j27%2BTt7%2FOhxiAecZ%2FffBwSQZCjGcqzTlONzGeUh%2F17714ETt5z39Q%3D%3D";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.busRouteId = "";


requestData.station = {};
requestData.station.arsId = "";


seoulObject.urlRouteRequest = function (dbObject, callback) {

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */



    requestData.route.busRouteId = dbObject[0].routeid;


    var url = routeurl + "&busRouteId=" + requestData.route.busRouteId;


    request(url, function (error, response, body) {
        var seoul_bus_location_seq = [];
        var up_seq = [];
        var down_seq = [];
        if (error) {
            throw error;
        }
        else {
            var xmldata = body;
            var options = {
                object: true,
                sanitize: false,
                arrayNotation: true
            };
            var result = xml2jsparser.toJson(xmldata, options);

            var tempre = result.ServiceResult[0].msgBody[0];
            var locArr = tempre.itemList;

            for(var i in locArr){
                var seq = locArr[i].sectOrd[0];
                seq = seq*1+1;
                up_seq.push(seq);
            }

            seoul_bus_location_seq.push(up_seq);

            callback(seoul_bus_location_seq);

        }
    });
};
seoulObject.urlStationRequest = function (dbObject, callback) {
    var seoul_list = [];

    if(dbObject[0].arsid === '0' || dbObject[0].arsid === 0){
        callback(seoul_list);
    }

    requestData.station.arsId = dbObject[0].arsid;

    var url = stationurl + "&arsId=" + requestData.station.arsId;

    request(url, function (error, response, body) {

        if (error) {
            throw error;
        }
        else {

            var xmldata = body;
            var options = {
                object: true,
                sanitize: false,
                arrayNotation: true
            };

            var result = xml2jsparser.toJson(xmldata, options);

            var tempre = result.ServiceResult[0].msgBody[0];
            var stArr = tempre.itemList;
            for(var i in stArr){
                var temp = {};
                temp.routenm = stArr[i].rtNm[0];
                temp.routeid = stArr[i].busRouteId[0];
                temp.arrive_time = "약 " + commonBiz.changeTomin(stArr[i].traTime1[0]) + "후 도착";
                seoul_list.push(temp);
            }
            callback(seoul_list);
        }
    });

};

module.exports = seoulObject;



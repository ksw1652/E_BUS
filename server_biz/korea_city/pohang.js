/**
 * Created by airnold on 15. 4. 27..
 */

// get html
// route -> http://mbus.pohang.go.kr/mobile/busLocation.jsp
// param -> routeId
// station -> http://mbus.pohang.go.kr/mobile/busArrStation.jsp
// param -> stationId

var request = require('request');
var cheerio = require('cheerio');



var commonBiz = require('../korea_common/common_biz.js');


var pohangObject = {};

var routeurl = "http://bis2.ipohang.org/bis2/busWayPop.do";

var stationurl = "http://bis2.ipohang.org/bis2/bstopDetailSearchAjax.do";



/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.routeId = '';




requestData.station = {};
requestData.station.bStopid = '';


pohangObject.urlRouteRequest = function (dbObject, callback) {

    requestData.route.routeId  = dbObject[0].routeid;
    var url = routeurl+'?routeId=' + requestData.route.routeId

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var up_seq = [];
            var down_seq = [];
            var pohang_bus_location_seq = [];

            var $temp = $('#busWayHeight div');
            $temp.each(function(){

                if($(this).find('img').attr('src') === '../images/busLineInfo/icon_busCar.png'){

                    up_seq.push(findRouteSeq($(this).prev().text(), dbObject));

                }
            });


            var $temp = $('#busWayLow div');
            $temp.each(function(){
                if($(this).find('img').attr('src') === '../images/busLineInfo/icon_busCar.png'){

                    down_seq.push(findRouteSeq($(this).prev().text(), dbObject));

                }
            });
            pohang_bus_location_seq.push(up_seq);
            pohang_bus_location_seq.push(down_seq);
            callback(pohang_bus_location_seq);

        }
    });

};
pohangObject.urlStationRequest = function (dbObject, callback) {


    requestData.station.bStopid = dbObject[0].stopid;

    request.post({
        url: stationurl,

        form: {
            bStopid: requestData.station.bStopid
        }
    }, function (error, response, json) {
        if (!error && response.statusCode == 200) {

            var psd = JSON.parse(json);
            var pohang_temp = psd.arrivalInfo;
            var pohang_list = [];

            for (var i in pohang_temp) {
                if (pohang_temp[i].CURR_BSTOP !== null) {
                    console.log("노선 번호 : " + pohang_temp[i].ROUTE_NAME);
                    console.log("예상도착 시간 : " + pohang_temp[i].REST_TIME + "분");
                    console.log("노선 번호 : " + pohang_temp[i].REST_BSTOP + "전\n");

                    var temp = {};
                    temp.routenm = pohang_temp[i].ROUTE_NAME;
                    temp.arrive_time = '약 ' + pohang_temp[i].REST_TIME + '분 후 도착';
                    temp.cur_pos = pohang_temp[i].REST_BSTOP + '전';
                    temp.routeid = pohang_temp[i].ROUTE_ID;

                    pohang_list.push(temp);

                }
            }

            callback(pohang_list);


        }else{
            throw error;
        }
    });

};


function findRouteSeq(stopnm, dbObject) {
    var seq = undefined;

    for (var i in dbObject) {
        /**
         * urlarr에 있는 stopid와 db에 stopnm을 비교하여 seq저장
         */

        if (dbObject[i].stopnm === stopnm) {
            seq = dbObject[i].seq;
            break;
        }
    }
    return seq;
}


module.exports = pohangObject;



/**
 * Created by airnold on 15. 4. 27..
 */

// get html
// route -> http://mbus.changwon.go.kr/mobile/busLocation.jsp
// param -> routeId
// station -> http://mbus.changwon.go.kr/mobile/busArrStation.jsp
// param -> stationId

var request = require('request');
var jsdom = require('jsdom');

var commonBiz = require('../korea_common/common_biz.js');


var changwonObject = {};

var routeurl = "http://mbus.changwon.go.kr/mobile/busLocation.jsp";

var stationurl = "http://mbus.changwon.go.kr/mobile/busArrStation.jsp";



/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.routeId = "";


requestData.station = {};
requestData.station.stationId = "";

changwonObject.urlRouteRequest = function (dbObject, callback) {

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.routeId = dbObject[0].routeid;

    var url = routeurl + "?routeId=" + requestData.route.routeId;

    request(url, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            var changwon_bus_location_seq = [];
            jsdom.env({
                html: body,
                scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
                done: function (err, window) {
                    var $ = window.jQuery;
                    var document = window.document;
                    var $sub_a = $('.sub-content table tbody tr td a ');
                    var trnseq = dbObject[0].trnseq;
                    var up_seq = [];
                    var down_seq = [];

                    if ($sub_a.length === 0) {
                        //잘못된 버스 번호 요청
                        callback(changwon_bus_location_seq);
                    }
                    else {
                        $sub_a.each(function (i) {
                            /*
                             0에서 시작이기에 해당 시퀀스가 버스가 있는 위치
                             */
                            if ($(this).find('img').attr('src') === '../images/mobile/ico_bus_7.gif') {
                                var tseq = i*1+1;

                                if(tseq < trnseq){
                                    up_seq.push(tseq);
                                }else{
                                    down_seq.push(tseq);
                                }
                            }
                        });

                        changwon_bus_location_seq.push(up_seq);
                        changwon_bus_location_seq.push(down_seq);

                        callback(changwon_bus_location_seq);
                    }
                }
            });
        } else {
            throw error;
        }
    });


};
changwonObject.urlStationRequest = function (dbObject, callback) {

    requestData.station.stationId = dbObject[0].stopid;
    var url = stationurl + "?stationId=" + requestData.station.stationId;


    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            jsdom.env({
                html: body,
                scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
                done: function (err, window) {
                    //Use jQuery just as in a regular HTML page
                    var $ = window.jQuery;
                    var document = window.document;
                    var $sub_a = $("table[class=box4]");

                    var changwon_arrive_list = [];
                    $sub_a.each(function () {
                        var temp = {};
                        temp.routenm = $(this).find("span[class=bustype4]").text();
                        var str = $(this).find("span[class=bustype7]").text();

                        var res = str.split("도착");
                        temp.arrive_time = res[0] + " 도착";
                        temp.cur_pos = res[1];
                        temp.routeid = commonBiz.findRouteid(dbObject, temp.routenm);


                        changwon_arrive_list.push(temp);
                    });

                    callback(changwon_arrive_list);
                }
            });
        } else {
            throw error;
        }
    });

};


module.exports = changwonObject;



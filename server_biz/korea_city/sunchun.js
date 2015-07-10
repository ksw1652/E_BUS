/**
 * Created by airnold on 15. 4. 24..
 */

// get method // html
//   http://bis.sc.go.kr:8282/internet/pgm/map/route/routeMap.jsp 
    //   route param -> upperBusRouteID, busRouteID
// html data
//   http://mbis.sc.go.kr:8286/smart/search/arrivalList.jsp
    //   station param -> stationID, nodeID, bitFlag, toNodeName=인코딩, mobile_no, menuSeq

var request = require('request');
var cheerio = require('cheerio');

var commonBiz = require('../korea_common/common_biz.js');

var sunchunObject = {};

var routeurl = "http://bis.sc.go.kr:8282/internet/pgm/map/route/routeMap.jsp";
var routemurl = "http://mbis.sc.go.kr:8286/smart/search/routeResult.jsp";

var stationurl = "http://mbis.sc.go.kr:8286/smart/search/arrivalList.jsp";


/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.upperBusRouteID = "" ;
requestData.route.busRouteID = "";


requestData.station = {};
requestData.station.stationID = "";
requestData.station.nodeID = "";
requestData.station.bitFlag = "";
requestData.station.toNodeName = "";
requestData.station.mobile_no = "";
requestData.station.menuSeq = "";



sunchunObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */


    requestData.route.upperBusRouteID = dbObject[0].routeid;
    requestData.route.busRouteID = dbObject[0].routedesc;

    var url = routemurl + "?search=yes&upperBusRouteID=" + requestData.route.upperBusRouteID +
        "&busRouteID=" + requestData.route.busRouteID;

    /*request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var sunchun_bus_location_seq = [];
            var $ = cheerio.load(html);
            var $icon = $('.rmt_icon');

            if($icon.length === 0){
                //잘못된 버스 번호 요청
                callback(sunchun_bus_location_seq);
            }else{
                $icon.each(function(i){
                    if($(this).find('img').attr('src') === '/internet/images/route/icon_bus_sc02.gif' || $(this).find('img').attr('src') === '/internet/images/route/icon_bus_sc01.gif'){
                        sunchun_bus_location_seq.push(i*1+1);
                    }
                });
                callback(sunchun_bus_location_seq);
            }
        }else{
            throw error;
        }
    })*/
    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var sunchun_bus_location_seq = [];
            var up_seq = [];
            var $tr = $('.resultDiv tr');

            $tr.each(function(i){

                if($(this).find('td[width=20]').find('img').attr('src') === '/smart/images/icon_bus.gif'){
                    up_seq.push(i * 1 + 1);
                }

            });
            sunchun_bus_location_seq.push(up_seq);
            callback(sunchun_bus_location_seq);
        }else{
            throw error;
        }
    });


};
sunchunObject.urlStationRequest = function(dbObject, callback){

    requestData.station.stationID = dbObject[0].stopid;
    requestData.station.nodeID = dbObject[0].stopdesc;
    requestData.station.bitFlag = "1";
    requestData.station.toNodeName = "";
    requestData.station.mobile_no = "";
    requestData.station.menuSeq = "2";

    var url = stationurl + "?stationID=" + requestData.station.stationID +
        "&nodeID=" + requestData.station.nodeID +
        "&bitFlag=" + requestData.station.bitFalg +
        "&toNodeName=" + requestData.station.toNodeName +
        "&mobile_no=" + requestData.station.mobile_no +
        "&menuSeq=" + requestData.station.menuSeq;


    request.get({
            uri: url
        },
        function (error, response, html) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                var $table = $('table[class=resultTable]');
                var $tr = $table.find('tr');

                var sunchun_arrive_list = [];

                $tr.each(function(){
                    var temp = {};

                    temp.routenm = $(this).find('td:nth-child(1)').text();
                    var second_td = $(this).find('td:nth-child(2)');
                    temp.arrive_time = "약 " + second_td.find('span:nth-child(1)').text() + "분 후 도착" ;
                    temp.cur_pos = second_td.children().last().text();
                    temp.routeid = commonBiz.findRouteid(dbObject, commonBiz.splitSomething(temp.routenm, '번'));


                    sunchun_arrive_list.push(temp);

                });
                callback(sunchun_arrive_list);

            }else{
                throw error;
            }
        });

};





module.exports = sunchunObject;



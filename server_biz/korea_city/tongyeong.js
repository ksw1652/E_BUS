/**
 * Created by airnold on 15. 4. 24..
 */

// post method // html
//   http://bms.tongyeong.go.kr/serviceRoute.do
//   route param -> prmOperation=getServiceRoute, prmRouteName=인코딩, prmRouteID
// html data
//   http://bms.tongyeong.go.kr/stationInfo.do
//   station param -> prmOperation=getStationInfo, prmStationName=인코딩, prmStationID

var request = require('request');
var cheerio = require('cheerio');

var iconv = require('iconv');


var commonBiz = require('../korea_common/common_biz.js');



var tongyeongObject = {};

var routeurl = "http://bms.tongyeong.go.kr/serviceRoute.do";


var stationurl = "http://bms.tongyeong.go.kr/stationInfo.do";

/**
 *
 * request data format
 */


var requestData = {};
requestData.route = {};
requestData.route.prmOperation = "getServiceRoute" ;
requestData.route.prmRouteName = "";
requestData.route.prmRouteID = "";

requestData.station = {};
requestData.station.prmOperation = "getStationInfo";
requestData.station.prmStationName = "";
requestData.station.prmStationID = "";

tongyeongObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */


    ;

    requestData.route.prmRouteID = dbObject[0].routeid;
    request.post({
        url: routeurl,
        form: {
            prmOperation: requestData.route.prmOperation,
            prmRouteName: requestData.route.prmRouteName,
            prmRouteID  : requestData.route.prmRouteID
        }
    }, function (error, response, html) {
        var tongyeong_bus_location_seq = [];
        var tongyeong_bus_location_temp = [];
        var up_seq = [];
        if (!error && response.statusCode == 200) {
            var ic = new iconv.Iconv('EUC-KR', 'UTF-8//TRANSLIT//IGNORE');
            var buf = ic.convert(html);
            var utf8String = buf.toString('UTF-8');

            var $ = cheerio.load(utf8String);
            var $img = $('.routeLineH > img');
            var $tdname = $('.name');

            $img.each(function (i) {

                if ($(this).attr('src') === 'images/businfo/popup02/popup_02_bus02.gif' || $(this).attr('src') === 'images/businfo/popup02/popup_02_bus02_low.gif'  || $(this).attr('src') === 'images/businfo/popup02/popup_02_bus.gif'  || $(this).attr('src') === 'images/businfo/popup02/popup_02_bus_low.gif') {

                    tongyeong_bus_location_temp.push(i*1+1);

                    //seq -1해주셈
                }
            });

            for(var i in tongyeong_bus_location_temp){

                $tdname.each(function(j){
                    if(tongyeong_bus_location_temp[i] === j+1){
                        up_seq.push(biz.splitSomething($(this).text(), ' '));
                        // space 로 split 해서 저장
                        return false;
                    }
                })
            }
            tongyeong_bus_location_seq.push(up_seq);

            callback(tongyeong_bus_location_seq);

        } else {
            throw error;
        }
    });
};

tongyeongObject.urlStationRequest = function(dbObject, callback){


    requestData.station.prmStationID = dbObject[0].stopid;
    request.post({
        url: stationurl,
        encoding: null,
        form: {
            prmOperation: requestData.station.prmOperation,
            prmStationName: requestData.station.prmStationName,
            prmStationID: requestData.station.prmStationID
        }
    }, function (error, response, html) {
        if (!error && response.statusCode == 200) {

            var ic = new iconv.Iconv('EUC-KR', 'UTF-8//TRANSLIT//IGNORE');
            var buf = ic.convert(html);
            var utf8String = buf.toString('UTF-8');

            var $ = cheerio.load(utf8String);

            var $body_wrap = $('.businfo_popup01_body_wrap');
            var $table_wrap = $body_wrap.find("div[class='businfo_popup01_table_wrap02']");
            var $tbody = $table_wrap.find("tbody");
            var $tr = $tbody.find('tr');

            var tongyeong_arrive_list = [];

            $tr.each(function(){
                var temp = {};

                temp.routenm = $(this).find('td').eq(0).text().replace(/\s/gi, '');
                temp.arrive_time = $(this).find('td').eq(2).text().replace(/\s/gi, '');
                temp.cur_pos = $(this).find('td').eq(4).text().replace(/\s/gi, '');
                temp.routeid = commonBiz.findRouteid(dbObject, temp.routenm);

                tongyeong_arrive_list.push(temp);
            });
            callback(tongyeong_arrive_list);
        }else{
            throw error;
        }
    });
};

module.exports = tongyeongObject;



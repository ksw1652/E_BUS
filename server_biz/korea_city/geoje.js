/**
 * Created by airnold on 15. 4. 27..
 */

// get html
// route -> http://mbus.geoje.go.kr/mobile/busLocation.jsp
// param -> routeId
// station -> http://mbus.geoje.go.kr/mobile/busArrStation.jsp
// param -> stationId

var request = require('request');

var cheerio = require('cheerio');


var commonBiz = require('../korea_common/common_biz.js');


var geojeObject = {};

var routeurl = "http://bis.geoje.go.kr/map/realTimeBusInfo.do?action=serviceRoute";

var stationurl = "http://bis.geoje.go.kr/map/realTimeBusInfo.do?action=stationArriveInfo";





/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.searchLineId = '';
requestData.route.searchBusStopId = '';
requestData.route.searchRoute = '';



requestData.station = {};
requestData.station.searchBusStopName = '';
requestData.station.searchType = 'search';
requestData.station.searchBusStopId = '';
requestData.station.txtStationName = '';






geojeObject.urlRouteRequest = function (dbObject, callback) {

    requestData.route.searchLineId = dbObject[0].routeid;
    requestData.route.searchBusStopId = '';
    requestData.route.searchRoute = dbObject[0].routenm;
    request.post({
        url: routeurl,
        form: {
            searchLineId: requestData.route.searchLineId,
            searchBusStopId: requestData.route.searchBusStopId,
            searchRoute: requestData.route.searchRoute
        }
    }, function (error, response, html) {
        var geoje_bus_location_seq = [];
        var geoje_img_seq = [];
        var geoje_td_seq = [];
        var up_seq=[];
        if (!error && response.statusCode == 200) {

            var $ = cheerio.load(html);

            var $tda = $('#dataArea td a');
            var $tdtitle = $('#dataArea .tltle03');

            $tda.each(function(i){
                if($(this).find('img').attr('src') === '../../images/businfo/icon/pop_line_icon05.gif' || $(this).find('img').attr('src') === '../../images/businfo/icon/pop_line_icon04.gif' ){
                    geoje_img_seq.push(i);
                }
            });

            $tdtitle.each(function(j){
                if($(this).text() !== ''){
                    var temp = $(this).text();
                    var temparr = temp.split(' ');
                    geoje_td_seq.push(temparr[0].replace(/(^\s*)|(\s*$)/, ''));
                }
            });

            for(var i in geoje_img_seq){
                up_seq.push(geoje_td_seq[geoje_img_seq[i]]);
            }

            geoje_bus_location_seq.push(up_seq);

            callback(geoje_bus_location_seq);

        } else {
            throw error;
        }
    });

};

geojeObject.urlStationRequest = function (dbObject, callback) {

    requestData.station.searchBusStopName = dbObject[0].stopnm;
    requestData.station.searchType = 'search';
    requestData.station.searchBusStopId = dbObject[0].stopid;
    requestData.station.txtStationName = '';

    request.post({
        url: stationurl,
        form: {
            searchBusStopName: requestData.station.searchBusStopName,
            searchType: requestData.station.searchType,
            searchBusStopId: requestData.station.searchBusStopId,
            txtStationName: requestData.station.txtStationName
        }
    }, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var $ul = $("ul[style='margin:0px;padding-left:5px;height:30px;']");
            var $li = $ul.find('li');

            var geoje_list = [];

            $li.each(function () {
                var temp = {};


                var div_text = $(this).find('div').text();
                var text_arr = div_text.split('번');


                temp.routenm = text_arr[0];


                div_text = text_arr[1];
                text_arr = div_text.split('(');


                temp.cur_pos = text_arr[0].trim();


                div_text = text_arr[1];
                text_arr = div_text.split(')');

                temp.arrive_time = text_arr[1];

                temp.routeid = commonBiz.findRouteid(dbObject, temp.routenm);

                geoje_list.push(temp);
            });
            callback(geoje_list);
        }
    });
};


module.exports = geojeObject;



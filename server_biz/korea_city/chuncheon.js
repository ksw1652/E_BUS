/**
 * Created by airnold on 15. 4. 24..
 */

// post method // html
//   http://its.cheonan.go.kr/include/bis/RouteStation.jsp
//   route param -> route_no, route_class
//   http://its.cheonan.go.kr/include/bis/PredictInfo.jsp
//   station param -> stop_no

var request = require('request');
var cheerio = require('cheerio');

var commonBiz = require('../korea_common/common_biz.js');


var chuncheonObject = {};

var routeurl = "http://www.chbis.kr/serviceRoute.do";

var stationurl = "http://www.chbis.kr/stationInfo.do";



/**
 *
 * request data format
 */
var requestData = {};
requestData.route = {};
requestData.route.prmOperation = "getServiceRoute" ;
requestData.route.prmRouteName = "" ;
requestData.route.prmRouteID = "" ;




requestData.station = {};
requestData.station.prmOperation = "getStationInfo";
requestData.station.prmStationName = "";
requestData.station.prmStationID = "";


chuncheonObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.prmRouteName = dbObject[0].routenm;
    requestData.route.prmRouteID = dbObject[0].routeid;

    var formdata = 'prmOperation='+requestData.route.prmOperation +'&prmRouteName='+requestData.route.prmRouteName+'&prmRouteID='+requestData.route.prmRouteID;

    request.post({
        url :routeurl,
        form: formdata
    }, function (error, response, html) {
        if (!error && response.statusCode == 200) {

            var chuncheon_bus_location_temp = [];
            var chuncheon_bus_location_seq = [];
            var up_seq = [];
            var down_seq = [];
            var $ = cheerio.load(html);
            var $td = $('td[class=routeLineH]');
            var $tdname = $('td[class=name]');
            var trnseq = dbObject[0].trnseq;

            $td.each(function(i){
                if($(this).find('img').attr('src') === '../images/bus/icon_bus2.gif' || $(this).find('img').attr('src') === '../images/bus/icon_bus1.gif' ){
                    chuncheon_bus_location_temp.push(i);
                }
            });

            for(var i in chuncheon_bus_location_temp){
                console.log(chuncheon_bus_location_temp[i]);

                $tdname.each(function(j){
                    if(chuncheon_bus_location_temp[i] === j+1){
                        if(commonBiz.splitSomething($(this).text(), ' ')*1 < trnseq){
                            up_seq.push(commonBiz.splitSomething($(this).text(), ' ') * 1);
                        }else{
                            down_seq.push(commonBiz.splitSomething($(this).text(), ' ') * 1);
                        }
                        // space 로 split 해서 저장
                        return false;
                    }
                })
            }

            chuncheon_bus_location_seq.push(up_seq);
            chuncheon_bus_location_seq.push(down_seq);

            console.log(chuncheon_bus_location_seq);



        }else{

            throw error;
        }
    })




};
chuncheonObject.urlStationRequest = function(dbObject, callback){

    requestData.station.prmStationName = dbObject[0].stopnm;
    requestData.station.prmStationID = dbObject[0].stopid;

    request.post({
        uri: stationurl,
        encoding: null,
        form: {
            prmOperation: requestData.station.prmOperation,
            prmStationName: requestData.station.prmStationName,
            prmStationID: requestData.station.prmStationID
        }
    }, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var ic = new iconv.Iconv('euc-kr', 'utf-8');
            var buf = ic.convert(html);
            var utf8String = buf.toString('utf-8');

            var $ = cheerio.load(utf8String);
            var $tr = $('tr');

            var chuncheon_list = [];

            $tr.each(function () {

                if ($(this).find('td').attr('class') == 'text_12_08 padding_6_0_6_0' && $(this).find('td').attr('width') == '90') {
                    var route_json = {};

                    route_json.routenm = $(this).find('td[width=90]').text();
                    route_json.arrive_time = '약 ' + $(this).find('td:nth-child(3)').text() + ' 후 도착';
                    route_json.bus_loca = $(this).find('td[width=107]').text();
                    route_json.routeid = commonBiz.findRouteid(dbObject, route_json.routenm);

                    chuncheon_list.push(route_json);
                }
            });

            callback(chuncheon_list)
        }
    });
};


module.exports = chuncheonObject;



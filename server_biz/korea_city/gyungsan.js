/**
 * Created by airnold on 15. 4. 27..
 */


var request = require('request');
var cheerio = require('cheerio');
var nimble = require('nimble');



var commonBiz = require('../korea_common/common_biz.js');


var gyungsanObject = {};

var routeurl = "http://bis.gbgs.go.kr/bp/realInfo/src/getBusLocationList2.jsp";

var stationurl = "";



/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.menu = '';
requestData.route.bsLineId = '';
requestData.route.busStopId = '';
requestData.route.bsLineNo = '';
requestData.route.busStopNm = '';
requestData.route.busDirectCD = '';



requestData.station = {};


gyungsanObject.urlRouteRequest = function (dbObject, callback) {

    var up_seq = [];
    var down_seq= [];
    var gyungsan_bus_location_seq = [];
    nimble.series([
        function(urlCallback){

            nimble.parallel([
                function(upCallback){

                    requestData.route.menu = '1';
                    requestData.route.bsLineId = dbObject[0].routeid;
                    requestData.route.busStopId = '';
                    requestData.route.bsLineNo = dbObject[0].routenm;
                    requestData.route.busStopNm = '';
                    requestData.route.busDirectCD = '1';

                    var url = routeurl + '?menu=' + requestData.route.menu + '&bsLineId=' + requestData.route.bsLineId +
                            '&busStopId=' + requestData.route.busStopId + '&bsLineNo=' + requestData.route.bsLineNo +
                            '&busStopNm=' + requestData.route.busStopNm + '&busDirectCD='+ requestData.route.busDirectCD;
                    request(url, function (error, response, html) {
                        if (!error && response.statusCode == 200) {

                            var $ = cheerio.load(html);
                            var $td = $('td[height="20"]');

                            $td.each(function (i) {


                                if ($(this).find('img').attr('src') === '/bs/busgis/image/bs_bus_left_.gif') {
                                    up_seq.push(i);

                                }
                            });
                            upCallback();
                        }
                    });
                },
                function(downCallback){

                    requestData.route.menu = '1';
                    requestData.route.bsLineId = dbObject[0].routeid;
                    requestData.route.busStopId = '';
                    requestData.route.bsLineNo = dbObject[0].routenm;
                    requestData.route.busStopNm = '';
                    requestData.route.busDirectCD = '0';

                    var url = routeurl + '?menu=' + requestData.route.menu + '&bsLineId=' + requestData.route.bsLineId +
                        '&busStopId=' + requestData.route.busStopId + '&bsLineNo=' + requestData.route.bsLineNo +
                        '&busStopNm=' + requestData.route.busStopNm + '&busDirectCD='+ requestData.route.busDirectCD;


                    request(url, function (error, response, html) {
                        if (!error && response.statusCode == 200) {

                            var $ = cheerio.load(html);


                            var $td = $('td[height="20"]');


                            if ($td.length == 2) {
                                console.log('없는 정보');
                                downCallback();
                            }
                            else {
                                $td.each(function (i) {

                                    if ($(this).find('img').attr('src') === '/bs/busgis/image/bs_bus_right_.gif') {
                                        down_seq.push(i);

                                    }
                                });
                                downCallback();
                            }

                        }
                    });
                }
            ], urlCallback)

        },
        function(resCallback){
            gyungsan_bus_location_seq.push(up_seq);
            gyungsan_bus_location_seq.push(down_seq);
            callback(gyungsan_bus_location_seq);
            resCallback();

        }
    ])

};
gyungsanObject.urlStationRequest = function (dbObject, callback) {

    var gyungsan_list = [];

    callback(gyungsan_list);

};


module.exports = gyungsanObject;



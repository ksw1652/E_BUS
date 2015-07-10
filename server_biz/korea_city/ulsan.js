/**
 * Created by airnold on 15. 4. 24..
 */

//   get method // html
//   http://m.its.ulsan.kr/m/001/001/content2.do
//   route param -> brtNo, brtDirection, brtClass, brtId

//   http://m.its.ulsan.kr/m/001/001/arrInfo.do
//   station param -> brtNo, brtDirection, brtClass, bnodeOldid, stopServiceid, stopName, brtId

var request = require('request');
var cheerio = require('cheerio');
var nimble = require('nimble');




var ulsanObject = {};

var routeurl = "http://m.its.ulsan.kr/m/001/001/content2.do";
var stationurl = "http://m.its.ulsan.kr/m/001/001/arrInfo.do";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.brtNo = "";
requestData.route.brtDirection = "";
requestData.route.brtClass = "";
requestData.route.brtId = "";

requestData.station = {};
requestData.station.brtNo = "";
requestData.station.brtDirection = "";
requestData.station.brtClass = "";
requestData.station.bnodeOldid = "";
requestData.station.stopServiceid = "";
requestData.station.stopName = "";
requestData.station.brtId = "";

ulsanObject.urlRouteRequest = function (dbObject, callback) {

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    /**
     * 1. routedesc ^로 짜르기
     * 2. 0번 인덱스 값으로 요청 날리기
     * 3. 1번 인덱스가 비었다면 그대로 callback
     * 4. 1번 인덱스가 있다면 down_seq를 요청하기
     */

    var descArr = dbObject[0].routedesc.split('^');
    var ulsan_bus_location_seq = [];
    var up_seq = [];
    var down_seq = [];

    nimble.series([
        function(upCallback){
            requestData.route.brtNo = dbObject[0].routenm;
            var stringArray = splitColon(descArr[0]);

            //routedesc x:x:x:x 2 번과 4번짜르기 class = 2번째 direction = 4번째
            requestData.route.brtDirection = stringArray[0];
            requestData.route.brtClass = stringArray[1];

            requestData.route.brtId = dbObject[0].routeid;

            var url = routeurl + "?brtNo=" + requestData.route.brtNo +
                "&brtDirection=" + requestData.route.brtDirection +
                "&brtClass=" + requestData.route.brtClass +
                "&brtId=" + requestData.route.brtId;

            request(url, function (error, response, html) {
                if (!error && response.statusCode == 200) {

                    var $ = cheerio.load(html);

                    var $li = $('.nx li');

                    if ($li.length === 0) {
                        // 잘못된 버스번호
                        ulsan_bus_location_seq.push(up_seq);
                        callback(ulsan_bus_location_seq);
                        upCallback();
                    } else {
                        $li.each(function (i) {

                            if ($(this).find('img').attr('src') === '/m/img/ico_bus.png') {

                                up_seq.push(i * 1 + 1);
                            }
                        });
                        ulsan_bus_location_seq.push(up_seq);
                        upCallback();
                    }

                } else {
                    throw error;
                }
            });
        },
        function(downCallback){
            if(descArr[1] === '' ){
                downCallback();
            }else{
                requestData.route.brtNo = dbObject[0].routenm;
                var stringArray = splitColon(descArr[1]);

                //routedesc x:x:x:x 2 번과 4번짜르기 class = 2번째 direction = 4번째
                requestData.route.brtDirection = stringArray[0];
                requestData.route.brtClass = stringArray[1];

                requestData.route.brtId = dbObject[0].routeid;

                var url = routeurl + "?brtNo=" + requestData.route.brtNo +
                    "&brtDirection=" + requestData.route.brtDirection +
                    "&brtClass=" + requestData.route.brtClass +
                    "&brtId=" + requestData.route.brtId;

                request(url, function (error, response, html) {
                    if (!error && response.statusCode == 200) {

                        var $ = cheerio.load(html);

                        var $li = $('.nx li');

                        if ($li.length === 0) {
                            // 잘못된 버스번호
                            ulsan_bus_location_seq.push(down_seq);
                            callback(ulsan_bus_location_seq);
                            downCallback();
                        } else {
                            $li.each(function (i) {

                                if ($(this).find('img').attr('src') === '/m/img/ico_bus.png') {

                                    down_seq.push(i * 1 + 1);
                                }
                            });
                            ulsan_bus_location_seq.push(down_seq);
                            downCallback();
                        }

                    } else {
                        throw error;
                    }
                });
            }

        },
        function(resCallback){
            callback(ulsan_bus_location_seq);
            resCallback();
        }
    ]);



};

ulsanObject.urlStationRequest = function (dbObject, callback) {

    var ulsan_list = [];
    var j=0;

    for (var i in dbObject) {

        requestData.station.brtNo = dbObject[i].routenm;
        var stringArray = splitColon(dbObject[i].routedesc);
        requestData.station.brtDirection = stringArray[3];
        requestData.station.brtClass = stringArray[1];
        requestData.station.bnodeOldid = dbObject[i].stopdesc;
        requestData.station.stopServiceid = dbObject[i].arsid;
        requestData.station.stopName = "";
        requestData.station.brtId = dbObject[i].routeid;

        var url = stationurl + "?brtNo=" + requestData.station.brtNo +
            "&brtDirection=" + requestData.station.brtDirection +
            "&brtClass=" + requestData.station.brtClass +
            "&bnodeOldid=" + requestData.station.bnodeOldid +
            "&stopServiceid=" + requestData.station.stopServiceid +
            "&stopName=" +
            "&brtId=" + requestData.station.brtId;


        requestUlsan(dbObject[i], url, function (tempData) {
            console.log(tempData);
            ulsan_list.push(tempData);
            j++;
            if(j == dbObject.length){
                callback(ulsan_list);
            }
        });
    }
};

function splitColon(beforeString) {
    var afterString = beforeString.split(":");
    return afterString;
}

function requestUlsan(dbObj, url, endCallback){
    request(url, function (error, response, html) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                var arr_temp = [];
                var temp = {};
                var $dl = $('dd');
                $dl.each(function () {
                    if ($(this).find("span[class='strong']").text() !== '') {
                        arr_temp.push($(this).find("span[class='strong']").text());
                    }
                });

                temp.routeid = dbObj.routeid;
                temp.routenm = dbObj.routenm;
                if(arr_temp[0] !== undefined){
                    temp.arrive_time = "약 " + arr_temp[0] + "후 도착";
                }else{
                    temp.arrive_time = arr_temp[0];
                }
                endCallback(temp);

            } else {
                throw error;
            }
        }
    );
}

module.exports = ulsanObject;



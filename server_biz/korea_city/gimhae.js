

/**
 * Created by airnold on 15. 4. 24..
 */

// post method // json
//   http://m.dcbis.go.kr/rest/getRunBusDetail.json
//   route param -> routeid
//   http://www.dcbis.go.kr/rest/getRouteRunBusDetail.json
//   station param -> sid

var request = require('request');

var phantom = require('phantom');

var commonBiz = require('../korea_common/common_biz.js');

var gimhaeObject = {};

var routeurl = "http://bus.gimhae.go.kr/ver4/map/inc/inc_result_bus_location.php?hdGubn=L&rdMode_L=ID_L&rdMode_B=";

var stationurl = "http://bus.gimhae.go.kr/ver4/map/ajax_get_data.php?mode=BUS_ARRIVAL&lobs=&menu=&smenu=";


/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.txtKeyword = "" ;

requestData.station = {};
requestData.station.txtKeyword = "";


gimhaeObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     *
     */

    requestData.route.txtKeyword = dbObject[0].routeid;

    var url = routeurl +'&'+ requestData.route.txtKeyword;
    var gimhae_bus_location_seq = [];
    var up_seq = [];

    phantom.create(function (ph) {

        return ph.createPage(function (page) {
            return page.open(url, function (status) {
                page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function () {
                    //jQuery Loaded
                    //We can use things like $("body").html() in here.

                    return page.evaluate(function () {

                        var $temp = $('.al');

                        var temparr = [];
                        $temp.each(function (i) {
                            if ($(this).find('img').attr('src') === '../../images/map/ic_trs01.gif') {
                                temparr.push(i);
                            }

                        });
                        return temparr;
                    }, function (result) {
                        up_seq = result;
                        gimhae_bus_location_seq.push(up_seq);
                        callback(gimhae_bus_location_seq);
                        ph.exit();
                    });
                });
            });
        })
    });
};


gimhaeObject.urlStationRequest = function(dbObject, callback){

    requestData.station.txtKeyword = dbObject[0].stopid;
    var url = stationurl + '&' + requestData.station.txtKeyword;


    phantom.create(function (ph) {

        return ph.createPage(function (page) {
            return page.open(url, function (status) {
                console.log(status);
                //jQuery Loaded
                //We can use things like $("body").html() in here.

                return page.evaluate(function () {

                    var gimhae_arrive_list = [];
                    var n = 'previousElementSibling';

                    var elementLength = document.defaultView.document.documentElement.childElementCount;

                    var lastElement = document.defaultView.document.documentElement.lastElementChild;

                    var firstAttrTemp = lastElement.attributes;
                    var firsttemp = {};
                    firsttemp.routenm = firstAttrTemp['0'].value;
                    firsttemp.arrive_time = firstAttrTemp['3'].value;
                    firsttemp.routeid = commonBiz.findRouteid(dbObject, firsttemp.routenm);
                    gimhae_arrive_list.push(firsttemp);

                    for(var i = elementLength-1 ; i>2 ; i--){
                        var preElement = lastElement[n];
                        var attrTemp = preElement.attributes;

                        var temp = {};
                        temp.routenm = attrTemp['0'].value;
                        temp.arrive_time = attrTemp['3'].value;
                        temp.routeid = commonBiz.findRouteid(dbObject, temp.routenm);
                        gimhae_arrive_list.push(temp);
                        lastElement = preElement;
                    }

                    return gimhae_arrive_list;

                }, function (result) {
                    callback(result);
                    ph.exit();
                });

            });
        })
    });
};







module.exports = gimhaeObject;



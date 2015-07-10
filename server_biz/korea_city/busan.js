/**
 * Created by airnold on 15. 4. 27..
 */

// get html
// route -> http://mits.busan.go.kr/bus_real.jsp
// param -> line_id
// station -> http://bus.busan.go.kr/busanBIMS/Ajax/map_Arrival.asp
// param -> optARSNO

var request = require('request');
var xml2jsparser = require('xml2json');

var busanObject = {};

var routeurl = "http://61.43.246.153/openapi-data/service/busanBIMS/busInfoRoute?serviceKey=3Dk6D80iliB7j4NcdFAiIGHm2O3X7HXg8j27%2BTt7%2FOhxiAecZ%2FffBwSQZCjGcqzTlONzGeUh%2F17714ETt5z39Q%3D%3D";
var stationurl = "http://61.43.246.153/openapi-data/service/busanBIMS/stopArr?serviceKey=3Dk6D80iliB7j4NcdFAiIGHm2O3X7HXg8j27%2BTt7%2FOhxiAecZ%2FffBwSQZCjGcqzTlONzGeUh%2F17714ETt5z39Q%3D%3D";

var requestData = {};
requestData.route = {};
requestData.route.lineid = "";


requestData.station = {};
requestData.station.bstopid = "";


busanObject.urlRouteRequest = function (dbObject, callback) {
    requestData.route.lineid = dbObject[0].routeid;
    var url = routeurl+"&lineid=" + requestData.route.lineid;
    var trnseq = dbObject[0].trnseq;

    request.get(url,
        function(error, response, body){

            if(!error && response.statusCode==200){
                var busan_bus_location_seq = [];
                var up_seq = [];
                var down_seq = [];
                var xmldata = body;
                var options = {
                    object: true,
                    sanitize: false,
                    arrayNotation: true
                };

                var bus_location_data = xml2jsparser.toJson(xmldata, options);

                if(bus_location_data.response[0].body[0].items[0].length === undefined){

                    busan_bus_location_seq.push(up_seq);
                    busan_bus_location_seq.push(down_seq);
                    callback(busan_bus_location_seq);

                }else{
                    var arr = bus_location_data.response[0].body[0].items[0].item;

                    for(var i in arr){

                        if(arr[i].carNo !== undefined){
                            if(i < trnseq){
                                up_seq.push(i*1+1);
                            }else{
                                down_seq.push(i*1+1);
                            }
                        }
                    }

                    busan_bus_location_seq.push(up_seq);
                    busan_bus_location_seq.push(down_seq);
                    callback(busan_bus_location_seq);
                }
            }else{
                throw error;
            }

        }
    )
};
busanObject.urlStationRequest = function (dbObject, callback) {


    requestData.station.bstopid = dbObject[0].stopid;

    var url = stationurl+'&bstopid=' +  requestData.station.bstopid;

    request.get(url,
        function(error, response, body){
            if(!error && response.statusCode == 200){
                var busan_list = [];
                var xmldata = body;
                var options = {
                    object: true,
                    sanitize: false,
                    arrayNotation: true
                };
                var bus_arr_data = xml2jsparser.toJson(xmldata, options);
                if(bus_arr_data.response[0].body[0].items[0].length === undefined){

                    callback(busan_list);


                }else{
                    var arr = bus_arr_data.response[0].body[0].items[0].item;

                    for(var i in arr){

                        var temp = {};
                        temp.routeid = arr[i].lineid[0];
                        temp.routenm = arr[i].lineNo[0];
                        temp.arrive_time = '약 ' + arr[i].min[0] + '분 후 도착';
                        temp.cur_pos = arr[i].station[0] + '정거장 전';
                        busan_list.push(temp);

                    }

                    callback(busan_list);
                }



            }else{
                throw error;
            }
        }
    )
};


module.exports = busanObject;



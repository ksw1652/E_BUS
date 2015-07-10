/**
 * Created by airnold on 15. 4. 22..
 */

var express = require('express');
var stationRouter = express.Router();
var nimble = require('nimble');

var koreaDb = require('../../server_biz/korea_common/korea_db.js');
var koreaCommonBiz = require('../../server_biz/korea_common/common_biz.js');

var nodeCache = require('node-cache');
var myCache = new nodeCache(

    {
        stdTTL : 100,
        checkperiod: 150
    }

);


stationRouter.all('/stationSearch', function(req,res, next){

    var getdata = req.body.data;
    var stationNm = getdata.stationNm;
    var cityCodeObj = getdata.cityObject;


    var cacheName  = koreaCommonBiz.makeCacheName(cityCodeObj, stationNm);

    myCache.get(cacheName, function(err,value){
        if(!err){
            if(value === undefined){
                koreaDb.stationSearch(cityCodeObj, stationNm , function(stationData){
                    console.log('Station_Search Response');
                    res.send(stationData);

                    myCache.set(cacheName, stationData, function(err, success){
                        if(!err && success){
                            console.log('cache success ');
                        }else{
                            throw err;
                        }
                    });
                });
            }else{
                res.send(value);

            }
        }else{
            throw err;
        }
    });

});


stationRouter.all('/stationDetail', function(req,res, next){

    var getdata = req.body.data;
    var cityEnNm = getdata.cityEnNm;
    var sid = getdata.sid;
    var cityCode = getdata.cityCode;

    var cityDir = "../../server_biz/korea_city/" + cityEnNm + ".js";
    var cityObject = require(cityDir);

    var dbObject = undefined;
    var urlStationObject = undefined;
    var aroundXY = undefined;
    var stationObject = {};

    nimble.series([
        function(DBCallback){
            koreaDb.dbStationDetail(cityCode, sid , function(stationDetailData){
                console.log('Station_Detail DB Nimble');
                dbObject = stationDetailData;
                DBCallback();
            });
        },
        function(parallCallback){
            nimble.parallel([
                function(urlCallback){
                    cityObject.urlStationRequest(dbObject, function(urlStationData){
                        console.log('Station_Detail URL Nimble');
                        urlStationObject = urlStationData;

                        urlCallback();
                    });
                },
                function(aroundCallback){
                    koreaDb.dbAroundXY(cityCode, dbObject, function(aroundxyData){
                        console.log('Station_Detail AroundXY DB Nimble');
                        aroundXY = aroundxyData;
                        aroundCallback();
                    });
                }
            ], parallCallback);
        },

        function(resCallback){
            stationObject.urlStationObject = urlStationObject;
            stationObject.dbObject = dbObject;
            stationObject.aroundXY = aroundXY;
            console.log('Station_Detail Response Nimble');
            res.send(stationObject);
            resCallback();
        }
    ]);
});


module.exports = stationRouter;


/**
 * Created by airnold on 15. 4. 29..
 */

/**
 *
 * 1. database 연동을 위한 변수 생성
 * 2. 변수에 2가지 쿼리 미리 세팅 (routesearch, stationsearch)
 * 3. 한국 버전 쿼리는 모두 이 파일에서 처리해준다
 *
 */

var koreaDbObject = {};
var dbQuery = require('../../server_config/mysql/mysql_config.js');
var pool = require('../../server_config/mysql/DBConnect.js');

koreaDbObject.routeSearch = function(cityObject, routeNm, callback){

    var routeQuery = dbQuery.g_busquery.ROUTESEARCH;

    var citycds = queryCityCode(cityObject);

    pool.getConnection(function(err, db){
       if(err){
           throw err;
       }else{
            db.query(routeQuery, [citycds, routeNm], function(err, rows){
                if(err){
                    throw err;

                }else{
                    db.release();
                    console.log('Route_Search DB Result');
                    callback(rows);
                }
            })
       }
    });
};

koreaDbObject.stationSearch = function(cityObject, stationNm, callback){

    var stationQuery = dbQuery.g_busquery.STATIONSEARCH;
    var citycds = queryCityCode(cityObject);

    pool.getConnection(function(err, db){
        if(err){
            throw err;
        }else{
            db.query(stationQuery, [citycds, stationNm], function(err, rows){
                if(err){
                    throw err;

                }else{
                    db.release();
                    console.log('Station_Search DB Result');
                    callback(rows);
                }
            })
        }
    });


};


function queryCityCode (cityObject){


    var citycds = '';

    for(var i in cityObject){


        if(i < cityObject.length -1 ){
            citycds += cityObject[i].cityCode + " , ";
        }
        else{
            citycds += "S.citycd = " + cityObject[i].cityCode;
        }

    }

    return citycds;
}


/**
 *
 * @param cityCd
 * @param rid
 * @param callback
 *
 * route Detail db access
 */

koreaDbObject.dbRouteDetail = function(cityCd, rid, callback){


    var routeDetailQuery = dbQuery.g_busquery.ROUTEDETAIL;
    //citycd, rid
    pool.getConnection(function(err, db){
        if(err){
            throw err;
        }else{
            db.query(routeDetailQuery, [cityCd, rid], function(err, rows){

                if(err){
                    throw err;

                }else{
                    db.release();
                    console.log('Route_Detail DB Result');
                    callback(rows);
                }

            })
        }
    });

};

/**
 *
 * @param cityCd
 * @param sid
 * @param callback
 *
 * station Detail db access
 *
 */

koreaDbObject.dbStationDetail = function(cityCd, sid, callback){

    var stationDetailQuery = dbQuery.g_busquery.STATIONDETAIL;
    //cityCd, sid
    pool.getConnection(function(err, db){
        if(err){
            throw err;
        }else{
            db.query(stationDetailQuery, [cityCd, sid], function(err, rows){

                if(err){
                    throw err;

                }else{
                    db.release();
                    console.log('Station_Detail DB Result');
                    callback(rows);
                }
            })
        }
    });
};

koreaDbObject.dbAroundXY = function(cityCd, dbObject, callback){
    var getAroundQuery = dbQuery.g_busquery.AROUNDXY;
    pool.getConnection(function(err,db){
        if(err){
            throw err;
        }else{
            db.query(getAroundQuery,[cityCd,dbObject[0].LATIX,dbObject[0].LONGY], function(err,rows){

                if(err){
                    throw err;

                }else{
                    db.release();
                    console.log('Station_Search AroundXY DB REsult');
                    callback(rows);
                }

            })
        }
    })
};


/**
 *
 * place Search db Access
 *
 */

koreaDbObject.placeSearch = function( sx, sy, ex, ey ,callback){
    var placeSearchQuery = dbQuery.g_busquery.PLACESEARCH;

    pool.getConnection(function(err, db){
       if(err){
           throw err;
       }else{
           db.query(placeSearchQuery,[sx, sy, ex, ey], function(err, rows){
               if(err){
                   throw err;

               }else{
                   db.release();
                   callback(rows);
               }
           })
       }
    });

};

module.exports = koreaDbObject;

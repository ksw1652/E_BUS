/**
 * Created by airnold on 15. 5. 12..
 */

exports.throw = function(status, errorMessage){
    var err = new Error(errorMessage);
    err.status = status;
    console.log('error here');
    throw err;
};

/**
 *
 * 에러코드 정해서 추가하기
 *
 */


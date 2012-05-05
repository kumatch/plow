
exports.each = _each;
exports.map  = _map;
exports.nextTick = _nextTick;

var count = 10;

function _each(list, worker, end) {
    var length = list.length;
    var completed = 0;
    var failed = false;

    (function doWork(index) {
        exports.nextTick(function () {
            for (var i = index; (i < length && i < (index + count)); i++) {
                if (!failed) {
                    if (worker.length > 2) {
                        worker(list[i], i, workerCallback);
                    } else {
                        worker(list[i], workerCallback);
                    }
                }
            }

            if (!failed && i < length) {
                doWork(i);
            }
        });
    })(0);

    function workerCallback(err) {
        if (err) {
            failed = true;
            end(err);
        } else {
            completed += 1;
            if (completed === length) {
                end();
            }
        }
    }
}


function _map(list, worker, end) {
    var length = list.length;
    var results = [];
    var failed = false;

    (function doWork(index) {
        exports.nextTick(function () {
            for (var i = index; (i < length && i < (index + count)); i++) {
                if (!failed) {
                    if (worker.length > 2) {
                        worker(list[i], i, workerCallback);
                    } else {
                        worker(list[i], workerCallback);
                    }
                }
            }

            if (!failed && i < length) {
                doWork(i);
            }
        });
    })(0);

    function workerCallback(err, result) {
        results.push(result);

        if (err) {
            failed = true;
            end(err, results);
        } else {
            if (results.length === length) {
                end(null, results);
            }
        }
    }
}



function _nextTick(func) {
    if (typeof process === 'undefined' || !(process.nextTick)) {
        setTimeout(func, 0);
    } else {
        process.nextTick(func);
    }
}

exports.each = _each;
exports.map  = _map;
exports.nextTick = _nextTick;

var count = 10;

function _each(list, worker, end) {
    var length = list.length;
    var completed = 0;

    _doWork(list, worker, 0, function (err) {
        if (err) {
            end(err);
            return false;
        } else {
            completed += 1;
            if (completed === length) {
                end();
            }

            return true;
        }
    });
}


function _map(list, worker, end) {
    var length = list.length;
    var results = [];
    var failed = false;

    _doWork(list, worker, 0, function(err, result) {
        if (err) {
            end(err, results);
            return false;
        } else {
            results.push(result);

            if (results.length === length) {
                end(null, results);
            }
            return true;
        }
    });
}


function _doWork(list, worker, currentIndex, callback) {
    var length = list.length;
    var failed = false;

    exports.nextTick(function () {
        for (var i = currentIndex; (i < length && i < (currentIndex + count)); i++) {
            if (!failed) {
                try {
                    if (worker.length > 2) {
                        worker(list[i], i, function (err, result) {
                            if (!callback(err, result)) {
                                failed = true;
                            }
                        });
                    } else {
                        worker(list[i], function (err, result) {
                            if (!callback(err, result)) {
                                failed = true;
                            }
                        });
                    }
                } catch (e) {
                    failed = true;
                    callback(e);
                }
            }
        }

        if (!failed && i < length) {
            _doWork(list, worker, i, callback);
        }
    });
}


function _nextTick(func) {
    if (typeof process === 'undefined' || !(process.nextTick)) {
        setTimeout(func, 0);
    } else {
        process.nextTick(func);
    }
}

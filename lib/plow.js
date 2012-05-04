
exports.each = each;
exports.nextTick = nextTick;

var count = 10;

function each(list, worker, end) {
    var length = list.length;
    var completed = 0;
    var failed = false;

    (function doWork(index) {
        exports.nextTick(function () {
            for (var i = index; (i < length && i < (index + count)); i++) {
                if (!failed) {
                    if (worker.length > 2) {
                        worker(list[i], i, function (err) {
                            if (err) {
                                failed = true;
                                end(err);
                            } else {
                                completed += 1;
                                if (completed === length) {
                                    end();
                                }
                            }
                        });
                    } else {
                        worker(list[i], function (err) {
                            if (err) {
                                failed = true;
                                end(err);
                            } else {
                                completed += 1;
                                if (completed === length) {
                                    end();
                                }
                            }
                        });
                    }
                }
            }

            if (!failed && i < length) {
                doWork(i);
            }
        });
    })(0);
}



function nextTick(func) {
    if (typeof process === 'undefined' || !(process.nextTick)) {
        setTimeout(func, 0);
    } else {
        process.nextTick(func);
    }
}
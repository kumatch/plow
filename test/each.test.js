var sinon = require('sinon');
var plow = require('../');

describe('plow each', function() {

    describe('[1, foo, 3, bar] というリストを与える', function() {
        var list = [1, 'foo', 3, 'bar'];

        describe('workerすべてが正常に処理されると', function() {
            var spy = sinon.spy();

            before(function (done) {
                plow.each(list, function (value, index, next) {
                    spy(value, index);
                    next();
                }, function (err) {
                    if (err) throw err;
                    done();
                });
            });

            it('worker関数は計4回実行される', function () {
                spy.callCount.should.equal(4);
            });

            it('workerへ要素値とindex値が渡される', function () {
                spy.args.length.should.equal(4);

                for (var i = 0; i < 4; i++) {
                    spy.args[i][0].should.equal(list[i]);
                    spy.args[i][1].should.equal(i);
                }
            });
        });


        describe('workerは値が数値以外ならばエラーを出すならば', function() {
            var spy = sinon.spy();
            var error;

            before(function (done) {
                plow.each(list, function (value, index, next) {
                    spy(value, index);
                    if (typeof value === 'number') {
                        next();
                    } else {
                        next(Error(value));
                    }
                }, function (err) {
                    error = err;
                    done();
                });
            });

            it('worker 関数は2回実行される', function () {
                spy.callCount.should.equal(2);
            });

            it('worker へ途中までの要素値とindex値が渡される', function () {
                spy.args.length.should.equal(2);

                for (var i = 0; i < 2; i++) {
                    spy.args[i][0].should.equal(list[i]);
                    spy.args[i][1].should.equal(i);
                }
            });

            it('最初に発生するエラーオブジェクトのみが得られる', function () {
                error.message.should.equal(list[1]);
            });
        });


        describe('worker引数を値とnextのみにすると', function() {
            var spy = sinon.spy();

            before(function (done) {
                plow.each(list, function (value, next) {
                    spy(value);
                    next();
                }, function (err) {
                    if (err) throw err;
                    done();
                });
            });

            it('worker 関数は4回実行される', function () {
                spy.callCount.should.equal(4);
            });

            it('worker へは要素値のみが渡される', function () {
                spy.args.length.should.equal(4);

                for (var i = 0; i < 4; i++) {
                    spy.args[i].length.should.equal(1);
                    spy.args[i][0].should.equal(list[i]);
                }
            });
        });
    });


    describe('1 から 105までの要素をもつリストを与える', function() {
        var spy = sinon.spy();
        var list = [];

        for (var i = 0; i < 105; i++) {
            list.push(i + 1);
        }

        describe('workerすべてが正常に処理されると', function() {
            var spy = sinon.spy();

            before(function (done) {
                sinon.spy(plow, 'nextTick');

                plow.each(list, function (value, index, next) {
                    spy(value, index);
                    next();
                }, function (err) {
                    if (err) throw err;
                    done();
                });
            });

            after(function () {
                plow.nextTick.restore();
            });

            it('worker関数は計105回実行される', function () {
                spy.callCount.should.equal(105);
            });

            it('worker関数は105要素がすべて順番通りに実行されている', function () {
                spy.args.length.should.equal(105);

                for (var i = 0; i < 105; i++) {
                    spy.args[i][0].should.equal(i + 1);
                    spy.args[i][1].should.equal(i);
                }
            });

            it('分割処理としてnextTickが11回実行されている', function () {
                plow.nextTick.callCount.should.equal(11);
            });
        });


        describe('workerは値が81以上ならばエラーを出すならば', function() {
            var spy = sinon.spy();
            var error;

            before(function (done) {
                sinon.spy(plow, 'nextTick');

                plow.each(list, function (value, index, next) {
                    spy(value, index);
                    if (value < 81) {
                        next();
                    } else {
                        next(Error(value));
                    }
                }, function (err) {
                    error = err;
                    done();
                });
            });

            after(function () {
                plow.nextTick.restore();
            });

            it('worker 関数は81回実行される', function () {
                spy.callCount.should.equal(81);
            });

            it('worker へ途中までの要素値とindex値が渡される', function () {
                spy.args.length.should.equal(81);

                for (var i = 0; i < 81; i++) {
                    spy.args[i][0].should.equal(list[i]);
                    spy.args[i][1].should.equal(i);
                }
            });

            it('最初に発生するエラーオブジェクトのみが得られる', function () {
                error.message.should.equal('81');
            });

            it('分割処理としてnextTickが9回実行されている', function () {
                plow.nextTick.callCount.should.equal(9);
            });
        });
    });
});
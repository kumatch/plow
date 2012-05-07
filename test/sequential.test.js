var sinon = require('sinon');
var plow = require('../');

describe('plow sequential', function() {

    describe('20ms, 10ms, 5ms 後に +1 し、加算後の値を次へ渡す関数のリストを与えると', function() {
        var spy = sinon.spy();
        var result;

        var task = function (value, ms, next) {
            setTimeout(function () {
                value += 1;

                if (value > 5) {
                    next(Error(value));
                } else {
                    next(null, value);
                }
            }, ms);
        };

        var list = [
            function (next) {
                var value = 0;
                var ms = 20;

                spy(ms);
                task(value, ms, next);
            },
            function (value, next) {
                var ms = 10;

                spy(value, ms);
                task(value, ms, next);
            },
            function (value, next) {
                var ms = 5;

                spy(value, ms);
                task(value, ms, next);
            }
        ];

        before(function (done) {
            spy.reset();
            sinon.spy(plow, 'nextTick');

            plow.sequential(list, function (err, value) {
                if (err) throw err;
                result = value;
                done();
            });
        });

        after(function () {
            plow.nextTick.restore();
        });

        it('リスト内関数がすべて実行されている', function () {
            spy.callCount.should.equal(3);
        });

        it('最初にリスト内１番目の関数が実行されている', function () {
            spy.args[0][0].should.equal(20);
        });

        it('２番目にリスト内２番目の関数が実行されている', function () {
            spy.args[1][0].should.equal(1);
            spy.args[1][1].should.equal(10);
        });

        it('３番目にリスト内３番目の関数が実行されている', function () {
            spy.args[2][0].should.equal(2);
            spy.args[2][1].should.equal(5);
        });

        it('最後の結果は 3', function () {
            result.should.equal(3);
        });

        it('分割処理としてnextTickが3回実行されている', function () {
            plow.nextTick.callCount.should.equal(3);
        });
    });

    describe('３つのうち２番目でエラーを出す関数リストを与えると', function() {
        var spy = sinon.spy();
        var result, error;

        var list = [
            function (next) {
                spy(1);
                next();
            },
            function (next) {
                spy(2);
                next(Error('error'));
            },
            function (next) {
                spy(3);
                next();
            }
        ];

        before(function (done) {
            sinon.spy(plow, 'nextTick');

            plow.sequential(list, function (err, value) {
                error = err;
                result = value;
                done();
            });
        });

        after(function () {
            plow.nextTick.restore();
        });

        it('リスト内関数は2つ実行される', function () {
            spy.callCount.should.equal(2);
        });

        it('最初にリスト内１番目の関数が実行されている', function () {
            spy.args[0][0].should.equal(1);
        });

        it('２番目にリスト内２番目の関数が実行されている', function () {
            spy.args[1][0].should.equal(2);
        });

        it('3番目の関数には何も与えられていない', function () {
            (spy.args[3] === undefined).should.ok;
        });

        it('発生したエラーが得られる', function () {
            error.message.should.equal('error');
        });

        it('最後の結果はエラーのため得られない', function () {
            (result === undefined).should.ok;
        });

        it('分割処理としてnextTickが2回実行されている', function () {
            plow.nextTick.callCount.should.equal(2);
        });
    });


    describe('３つのうち２番目で例外が発生する関数リストを与えると', function() {
        var spy = sinon.spy();
        var result, error;

        var list = [
            function (next) {
                spy(1);
                next();
            },
            function (next) {
                spy(2);
                throw Error('throw error');
            },
            function (next) {
                spy(3);
                next();
            }
        ];

        before(function (done) {
            sinon.spy(plow, 'nextTick');

            plow.sequential(list, function (err, value) {
                error = err;
                result = value;
                done();
            });
        });

        after(function () {
            plow.nextTick.restore();
        });

        it('リスト内関数は2つ実行される', function () {
            spy.callCount.should.equal(2);
        });

        it('最初にリスト内１番目の関数が実行されている', function () {
            spy.args[0][0].should.equal(1);
        });

        it('２番目にリスト内２番目の関数が実行されている', function () {
            spy.args[1][0].should.equal(2);
        });

        it('3番目の関数には何も与えられていない', function () {
            (spy.args[3] === undefined).should.ok;
        });

        it('発生したエラーが得られる', function () {
            error.message.should.equal('throw error');
        });

        it('最後の結果はエラーのため得られない', function () {
            (result === undefined).should.ok;
        });

        it('分割処理としてnextTickが2回実行されている', function () {
            plow.nextTick.callCount.should.equal(2);
        });
    });

    describe('空リストを与えると', function() {
        var list = [];
        var result;

        before(function (done) {
            sinon.spy(plow, 'nextTick');

            plow.sequential(list, function (err, value) {
                if (err) throw err;
                result = value;
                done();
            });
        });

        after(function () {
            plow.nextTick.restore();
        });

        it('結果は undefined', function () {
            (result === undefined).should.ok;
        });

        it('nextTickが0回実行されている', function () {
            plow.nextTick.callCount.should.equal(0);
        });
    });
});
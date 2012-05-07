var sinon = require('sinon');
var plow = require('../');

describe('plow parallel', function() {

    describe('20ms, 10ms, 5ms 後に待ち時間の値を結果関数へ渡す関数のリストを与えると', function() {
        var spy = sinon.spy();
        var results;

        var list = [
            function (next) {
                var ms = 20;

                spy('foo');

                setTimeout(function () {
                    spy(ms);
                    next(null, ms);
                }, ms);
            },
            function (next) {
                var ms = 10;

                spy('bar');

                setTimeout(function () {
                    spy(ms);
                    next(null, ms);
                }, ms);
            },
            function (next) {
                var ms = 5;

                spy('baz');

                setTimeout(function () {
                    spy(ms);
                    next(null, ms);
                }, ms);
            }
        ];

        before(function (done) {
            spy.reset();
            sinon.spy(plow, 'nextTick');

            plow.parallel(list, function (err, values) {
                if (err) throw err;
                results = values;
                done();
            });
        });

        after(function () {
            plow.nextTick.restore();
        });

        it('リスト内関数がすべて実行されている', function () {
            spy.callCount.should.equal(6);
        });

        it('最初にリスト内関数の開始部分が実行されている', function () {
            spy.args[0][0].should.equal('foo');
            spy.args[1][0].should.equal('bar');
            spy.args[2][0].should.equal('baz');
        });

        it('１番目に5msの関数が実行されている', function () {
            spy.args[3][0].should.equal(5);
        });

        it('２番目に10msの関数が実行されている', function () {
            spy.args[4][0].should.equal(10);
        });

        it('３番目に20msの関数が実行されている', function () {
            spy.args[5][0].should.equal(20);
        });


        it('結果は [20, 10, 5]', function () {
            results.length.should.equal(3);

            results[0].should.equal(20);
            results[1].should.equal(10);
            results[2].should.equal(5);
        });

        it('分割処理としてnextTickが3回実行されている', function () {
            plow.nextTick.callCount.should.equal(3);
        });
    });



    describe('20ms, 10ms, 5ms 後に待ち時間の値を結果関数へ渡す関数集合オブジェクトを与えると', function() {
        var spy = sinon.spy();
        var results;

        var list = {
            foo: function (next) {
                var ms = 20;

                spy('foo');

                setTimeout(function () {
                    spy(ms);
                    next(null, ms);
                }, ms);
            },
            bar: function (next) {
                var ms = 10;

                spy('bar');

                setTimeout(function () {
                    spy(ms);
                    next(null, ms);
                }, ms);
            },
            baz: function (next) {
                var ms = 5;

                spy('baz');

                setTimeout(function () {
                    spy(ms);
                    next(null, ms);
                }, ms);
            }
        };

        before(function (done) {
            spy.reset();
            sinon.spy(plow, 'nextTick');

            plow.parallel(list, function (err, values) {
                if (err) throw err;
                results = values;
                done();
            });
        });

        after(function () {
            plow.nextTick.restore();
        });

        it('オブジェクト内関数がすべて実行されている', function () {
            spy.callCount.should.equal(6);
        });

        it('最初にリスト内関数の開始部分が実行されている', function () {
            spy.args[0][0].should.equal('foo');
            spy.args[1][0].should.equal('bar');
            spy.args[2][0].should.equal('baz');
        });

        it('１番目に5msの関数が実行されている', function () {
            spy.args[3][0].should.equal(5);
        });

        it('２番目に10msの関数が実行されている', function () {
            spy.args[4][0].should.equal(10);
        });

        it('３番目に20msの関数が実行されている', function () {
            spy.args[5][0].should.equal(20);
        });

        it('結果は [foo: 20, bar: 10, baz: 5]', function () {
            Object.keys(results).length.should.equal(3);

            results.foo.should.equal(20);
            results.bar.should.equal(10);
            results.baz.should.equal(5);
        });

        it('分割処理としてnextTickが3回実行されている', function () {
            plow.nextTick.callCount.should.equal(3);
        });
    });



    describe('３つのうち２番目でエラーを出す関数リストを与えると', function() {
        var spy = sinon.spy();
        var results, error;

        var list = [
            function (next) {
                spy(1);
                next(null, 1);
            },
            function (next) {
                spy(2);
                next(Error('error'));
            },
            function (next) {
                spy(3);
                next(null, 3);
            }
        ];

        before(function (done) {
            sinon.spy(plow, 'nextTick');

            plow.parallel(list, function (err, values) {
                error = err;
                results = values;
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
            (results === undefined).should.ok;
        });

        it('分割処理としてnextTickが2回実行されている', function () {
            plow.nextTick.callCount.should.equal(2);
        });
    });


    describe('３つのうち２番目で例外が発生する関数リストを与えると', function() {
        var spy = sinon.spy();
        var results, error;

        var list = [
            function (next) {
                spy(1);
                next(null, 1);
            },
            function (next) {
                spy(2);
                throw Error('throw error');
            },
            function (next) {
                spy(3);
                next(null, 3);
            }
        ];

        before(function (done) {
            sinon.spy(plow, 'nextTick');

            plow.parallel(list, function (err, values) {
                error = err;
                results = values;
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
            (results === undefined).should.ok;
        });

        it('分割処理としてnextTickが2回実行されている', function () {
            plow.nextTick.callCount.should.equal(2);
        });
    });

    describe('空リストを与えると', function() {
        var list = [];
        var results;


        before(function (done) {
            sinon.spy(plow, 'nextTick');

            plow.parallel(list, function (err, values) {
                if (err) throw err;
                results = values;
                done();
            });
        });

        after(function () {
            plow.nextTick.restore();
        });

        it('結果は空リスト', function () {
            results.length.should.equal(0);
        });

        it('nextTickは0回実行されている', function () {
            plow.nextTick.callCount.should.equal(0);
        });
    });

    describe('空オブジェクトを与えると', function() {
        var list = {};
        var results;

        before(function (done) {
            sinon.spy(plow, 'nextTick');

            plow.parallel(list, function (err, values) {
                if (err) throw err;
                results = values;
                done();
            });
        });

        after(function () {
            plow.nextTick.restore();
        });

        it('結果は空オブジェクト', function () {
            Object.keys(results).length.should.equal(0);
        });

        it('nextTickは0回実行されている', function () {
            plow.nextTick.callCount.should.equal(0);
        });
    });
});
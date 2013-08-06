/* jshint maxlen: 140, maxstatements: 20 */
/* global beforeEach, describe, it */
(function () {
    'use strict';
    
    // Dependencies
    var assert = require('proclaim');
    var sinon = require('sinon');

    // Test subject
    var chic = require('../../lib/chic');
    var Class = chic.Class;

    // Test suite
    describe('chic (unit):', function () {

        beforeEach(function (done) {
            // Nasty hack to prevent stack space errors in IE
            // https://github.com/visionmedia/mocha/issues/502
            // (also function wrapper fixes error in Firefox 3.6)
            setTimeout(function () {
                done();
            }, 0);
        });

        it('should be an object', function () {
            assert.isObject(chic);
        });

        it('should have a Class function', function () {
            assert.isFunction(Class);
        });

        it('should have a Class.extend function', function () {
            assert.isFunction(Class.extend);
        });

        describe('MyClass:', function () {
            var init, foo, MyClass, instance;

            beforeEach(function () {
                init = sinon.spy();
                foo = sinon.spy();
                MyClass = Class.extend({
                    init: init,
                    foo: foo,
                    bar: 123
                });
                instance = new MyClass('foo', 'bar', 'baz');
            });

            it('should be a function', function () {
                assert.isFunction(MyClass);
            });

            it('should have an extend function', function () {
                assert.isFunction(MyClass.extend);
            });

            it('extend function should be a reference to Class.extend', function () {
                assert.strictEqual(MyClass.extend, Class.extend);
            });

            it('prototype should mirror properties of the original argument', function () {
                assert.isDefined(MyClass.prototype.foo);
                assert.isDefined(MyClass.prototype.bar);
            });

            it('construction should call the init method of the prototype', function () {
                assert.isTrue(init.calledOnce);
            });

            it('construction should call the init method of the prototype with the expected arguments', function () {
                assert.isTrue(init.withArgs('foo', 'bar', 'baz').calledOnce);
            });

            it('construction should call the init method of the prototype with the instance as a context', function () {
                assert.strictEqual(init.firstCall.thisValue, instance);
            });

            it('instance of MyClass should be an instance of Class', function () {
                assert.isInstanceOf(instance, Class);
            });

            it('calling a method should call the original function', function () {
                instance.foo();
                assert.isTrue(foo.calledOnce);
            });

            it('calling a method should call the original function with the expected arguments', function () {
                instance.foo('bar', 'baz', 'qux');
                assert.isTrue(foo.withArgs('bar', 'baz', 'qux').calledOnce);
            });

            it('calling a method should call the original function with the instance as a context', function () {
                instance.foo();
                assert.strictEqual(foo.firstCall.thisValue, instance);
            });

            it('calling a method should not leave a \'sup\' property lying around', function () {
                instance.foo();
                assert.isFalse(instance.hasOwnProperty('sup'));
            });

            it('calling a method when the \'sup\' property is set should not alter it', function () {
                instance.sup = true;
                instance.foo();
                assert.isTrue(instance.sup);
            });

        });

        describe('MyOtherClass extending MyClass:', function () {
            var init, foo, bar, MyClass, MyOtherClass, instance;

            beforeEach(function () {
                init = sinon.spy(function () {
                    this.test = 123;
                });
                foo = sinon.spy();
                bar = sinon.spy();
                MyClass = Class.extend({
                    init: init,
                    foo: foo,
                    bar: bar
                });
                MyOtherClass = MyClass.extend({
                    init: function () {},
                    foo: function () {},
                    bar: function () {
                        this.sup();
                    }
                });
                instance = new MyOtherClass();
            });

            it('properties set in the MyClass constructor should not leak into the MyOtherClass prototype', function () {
                assert.isUndefined(MyOtherClass.prototype.test);
            });

            it('instance of MyOtherClass should be an instance of Class', function () {
                assert.isInstanceOf(instance, Class);
            });

            it('instance of MyOtherClass should be an instance of MyClass', function () {
                assert.isInstanceOf(instance, MyClass);
            });

            it('calling an overridden method should not call the original class method', function () {
                instance.foo();
                assert.isTrue(foo.notCalled);
            });

            it('calling this.sup should call the original class method', function () {
                instance.bar();
                assert.isTrue(bar.calledOnce);
            });

            it('calling this.sup should call the original class method with the new instance as a context', function () {
                instance.bar();
                assert.strictEqual(bar.firstCall.thisValue, instance);
            });

        });

    });

} ());
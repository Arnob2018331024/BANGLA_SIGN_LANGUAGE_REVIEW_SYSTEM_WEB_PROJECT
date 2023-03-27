// -------- polyfills.js --------
// Polyfills: Mostly for IE
Polyfills=[];//
// Overloading is very dodgy in case code needs to distinguish arrays and typed arrays
//
Array.isUntypedArray=Array.isArray;Array.isGeneralArray=function(array){if(Array.isUntypedArray(array)){return true;}else{return array!=null&&Object.prototype.toString.call(array.buffer)==="[object ArrayBuffer]";}};// Generated if transpiled by Babel
if(typeof this["_arrayWithHoles"]!=="undefined"){Polyfills.push('Array.isArray generalised');Array.isArray=Array.isGeneralArray;}//
// Math.fround
//
if(!Math.fround){Polyfills.push('Math.fround');Math.fround=function(array){return function(x){array[0]=x;// console.log ("Math.fround(" + x + ") = " + array[0]);
return array[0];};}(new Float32Array(1));}if(!Math.imul){Polyfills.push('Math.imul');Math.imul=function(a,b){var aHi=a>>>16&0xffff;var aLo=a&0xffff;var bHi=b>>>16&0xffff;var bLo=b&0xffff;// the shift by 0 fixes the sign on the high part
// the final |0 converts the unsigned value into a signed value
return aLo*bLo+(aHi*bLo+aLo*bHi<<16>>>0)|0;};}if(!Math.clz32){Polyfills.push('Math.clz32');Math.clz32=function(x){// Let n be ToUint32(x).
// Let p be the number of leading zero bits in
// the 32-bit binary representation of n.
// Return p.
if(x==null||x===0){return 32;}return 31-Math.floor(Math.log(x>>>0)*Math.LOG2E);};}//
// Date.now
//
if(!Date.now){Polyfills.push('Date.now');Date.now=function now(){return new Date().getTime();};}//
// requestAnimationFrame functions
//
// requestAnimationFrame with no fallback
(function(){var vendors=['ms','moz','webkit','o'];for(var x=0;x<vendors.length&&!window.requestAnimationFrame;++x){window.requestAnimationFrame=window[vendors[x]+'RequestAnimationFrame'];window.cancelAnimationFrame=window[vendors[x]+'CancelAnimationFrame']||window[vendors[x]+'CancelRequestAnimationFrame'];}var lastTime=0;if(!window.requestAnimationFrame){// requestAnimationFrame using fallback to setTimeout
Polyfills.push('requestAnimationFrame using setTimeout');// Omits the mysterious element parameter
window.requestAnimationFrame=function(callback){var currTime=Date.now();var timeToCall=Math.max(0,16-(currTime-lastTime));var id=window.setTimeout(function(){callback(currTime+timeToCall);},timeToCall);lastTime=currTime+timeToCall;return id;};}if(!window.cancelAnimationFrame){window.cancelAnimationFrame=function(id){clearTimeout(id);};}// delayAnimationFrame using requestAnimationFrame
Polyfills.push('delayAnimationFrame using requestAnimationFrame');window.delayAnimationFrame=function(callback,delay){if(delay==null)delay=0;var id=window.setTimeout(function(){window.requestAnimationFrame(callback);},delay);return id;};})();//
// String.endsWith
//
if(!String.prototype.endsWith){Polyfills.push('String.endsWith');String.prototype.endsWith=function(searchString,position){var subjectString=this.toString();if(typeof position!=='number'||!isFinite(position)||Math.floor(position)!==position||position>subjectString.length){position=subjectString.length;}position-=searchString.length;var lastIndex=subjectString.lastIndexOf(searchString,position);return lastIndex!==-1&&lastIndex===position;};}//
// String.startsWith
//
if(!String.prototype.startsWith){Polyfills.push('String.startsWith');String.prototype.startsWith=function(searchString,position){position=position||0;return this.substr(position,searchString.length)===searchString;};}//
// Promise
//
(function(root){// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc=setTimeout;function noop(){}// Polyfill for Function.prototype.bind
function bind(fn,thisArg){return function(){fn.apply(thisArg,arguments);};}function Promise(fn){if(typeof this!=='object')throw new TypeError('Promises must be constructed via new');if(typeof fn!=='function')throw new TypeError('not a function');this._state=0;this._handled=false;this._value=undefined;this._deferreds=[];doResolve(fn,this);}function handle(self,deferred){while(self._state===3){self=self._value;}if(self._state===0){self._deferreds.push(deferred);return;}self._handled=true;Promise._immediateFn(function(){var cb=self._state===1?deferred.onFulfilled:deferred.onRejected;if(cb===null){(self._state===1?resolve:reject)(deferred.promise,self._value);return;}var ret;try{ret=cb(self._value);}catch(e){reject(deferred.promise,e);return;}resolve(deferred.promise,ret);});}function resolve(self,newValue){try{// Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
if(newValue===self)throw new TypeError('A promise cannot be resolved with itself.');if(newValue&&(typeof newValue==='object'||typeof newValue==='function')){var then=newValue.then;if(newValue instanceof Promise){self._state=3;self._value=newValue;finale(self);return;}else if(typeof then==='function'){doResolve(bind(then,newValue),self);return;}}self._state=1;self._value=newValue;finale(self);}catch(e){reject(self,e);}}function reject(self,newValue){self._state=2;self._value=newValue;finale(self);}function finale(self){if(self._state===2&&self._deferreds.length===0){Promise._immediateFn(function(){if(!self._handled){Promise._unhandledRejectionFn(self._value);}});}for(var i=0,len=self._deferreds.length;i<len;i++){handle(self,self._deferreds[i]);}self._deferreds=null;}function Handler(onFulfilled,onRejected,promise){this.onFulfilled=typeof onFulfilled==='function'?onFulfilled:null;this.onRejected=typeof onRejected==='function'?onRejected:null;this.promise=promise;}/**
* Take a potentially misbehaving resolver function and make sure
* onFulfilled and onRejected are only called once.
*
* Makes no guarantees about asynchrony.
*/function doResolve(fn,self){var done=false;try{fn(function(value){if(done)return;done=true;resolve(self,value);},function(reason){if(done)return;done=true;reject(self,reason);});}catch(ex){if(done)return;done=true;reject(self,ex);}}Promise.prototype['catch']=function(onRejected){return this.then(null,onRejected);};Promise.prototype.then=function(onFulfilled,onRejected){var prom=new this.constructor(noop);handle(this,new Handler(onFulfilled,onRejected,prom));return prom;};Promise.all=function(arr){var args=Array.prototype.slice.call(arr);return new Promise(function(resolve,reject){if(args.length===0)return resolve([]);var remaining=args.length;function res(i,val){try{if(val&&(typeof val==='object'||typeof val==='function')){var then=val.then;if(typeof then==='function'){then.call(val,function(val){res(i,val);},reject);return;}}args[i]=val;if(--remaining===0){resolve(args);}}catch(ex){reject(ex);}}for(var i=0;i<args.length;i++){res(i,args[i]);}});};Promise.resolve=function(value){if(value&&typeof value==='object'&&value.constructor===Promise){return value;}return new Promise(function(resolve){resolve(value);});};Promise.reject=function(value){return new Promise(function(resolve,reject){reject(value);});};Promise.race=function(values){return new Promise(function(resolve,reject){for(var i=0,len=values.length;i<len;i++){values[i].then(resolve,reject);}});};// Use polyfill for setImmediate for performance gains
Promise._immediateFn=typeof setImmediate==='function'&&function(fn){setImmediate(fn);}||function(fn){setTimeoutFunc(fn,0);};Promise._unhandledRejectionFn=function _unhandledRejectionFn(err){if(typeof console!=='undefined'&&console){console.warn('Possible Unhandled Promise Rejection:',err);// eslint-disable-line no-console
}};/**
* Set the immediate function to execute callbacks
* @param fn {function} Function to execute
* @deprecated
*/Promise._setImmediateFn=function _setImmediateFn(fn){Promise._immediateFn=fn;};/**
* Change the function to execute on unhandled rejection
* @param {function} fn Function to execute on unhandled rejection
* @deprecated
*/Promise._setUnhandledRejectionFn=function _setUnhandledRejectionFn(fn){Promise._unhandledRejectionFn=fn;};// Better to have avoided computation if Promise already exists!
if(typeof module!=='undefined'&&module.exports){module.exports=Promise;}else if(!root.Promise){Polyfills.push('Promise');root.Promise=Promise;}})(this);//
// Symbol from ES6
//
/**
* Symbol-ES6 v0.1.2
* ES6 Symbol polyfill in pure ES5.
*
* @license Copyright (c) 2017-2018 Rousan Ali, MIT License
*
* Codebase: https://github.com/rousan/symbol-es6
* Date: 28th Jan, 2018
*/ // Internet Explorer succeeds without Symbol if isArray is modified to recognise type arrays. JRWG
// (function (global, factory) {
// 	"use strict";
// 	if (typeof module === "object" && typeof module.exports === "object") {
// 		// For the environment like NodeJS, CommonJS etc where module or
// 		// module.exports objects are available
// 		module.exports = factory(global);
// 	} else if (!global.Symbol){
// 		// console.log("Symbol polyfill: No Symbol found so create");
// 		// For browser context, where global object is window
// 		// Suppress for test
// 		Polyfills.push('Symbol');
// 		factory(global);
// 	}
// 	/* window is for browser environment and global is for NodeJS environment */
// // })(typeof window !== "undefined" ? window : global,
// })(this,
//   function (global) {
// 	"use strict";
// 	var defineProperty = Object.defineProperty;
// 	var defineProperties = Object.defineProperties;
// 	var symbolHiddenCounter = 0;
// 	var globalSymbolRegistry = [];
// 	var slice = Array.prototype.slice;
// 	var ES6 = typeof global.ES6 === "object" ? global.ES6 : (global.ES6 = {});
// 	var isArray = Array.isArray;
// 	var objectToString = Object.prototype.toString;
// 	var push = Array.prototype.push;
// 	var emptyFunction = function () {};
// 	var simpleFunction = function (arg) {
// 		return arg;
// 	};
// 	var isCallable = function (fn) {
// 		return typeof fn === 'function';
// 	};
// 	var isConstructor = function (fn) {
// 		return isCallable(fn);
// 	};
// 	var Iterator = function () {};
// 	var ArrayIterator = function ArrayIterator(array, flag) {
// 		this._array = array;
// 		this._flag = flag;
// 		this._nextIndex = 0;
// 	};
// 	var StringIterator = function StringIterator(string, flag) {
// 		this._string = string;
// 		this._flag = flag;
// 		this._nextIndex = 0;
// 	};
// 	var isES6Running = function() {
// 		return false; /* Now 'false' for testing purpose */
// 	};
// 	var isObject = function (value) {
// 		return value !== null && (typeof value === "object" || typeof value === "function");
// 	};
// 	var es6FunctionPrototypeHasInstanceSymbol = function (instance) {
// 		if (typeof this !== "function")
// 			return false;
// 		return instance instanceof this;
// 	};
// 	var es6InstanceOfOperator = function (object, constructor) {
// 		if (!isObject(constructor))
// 			throw new TypeError("Right-hand side of 'instanceof' is not an object");
// 		var hasInstanceSymbolProp = constructor[Symbol.hasInstance];
// 		if (typeof hasInstanceSymbolProp === "undefined") {
// 			return object instanceof constructor;
// 		} else if(typeof hasInstanceSymbolProp !== "function") {
// 			throw new TypeError(typeof hasInstanceSymbolProp + " is not a function");
// 		} else {
// 			return hasInstanceSymbolProp.call(constructor, object);
// 		}
// 	};
// 	// Generates name for a symbol instance and this name will be used as
// 	// property key for property symbols internally.
// 	var generateSymbolName = function (id) {
// 		return "@@_____" + id + "_____";
// 	};
// 	// Generates id for next Symbol instance
// 	var getNextSymbolId = function () {
// 		return symbolHiddenCounter++;
// 	};
// 	var setupSymbolInternals = function (symbol, desc) {
// 		defineProperties(symbol, {
// 			_description: {
// 				value: desc
// 			},
// 			_isSymbol: {
// 				value: true
// 			},
// 			_id: {
// 				value: getNextSymbolId()
// 			}
// 		});
// 		return symbol;
// 	};
// 	var checkSymbolInternals = function (symbol) {
// 		return symbol._isSymbol === true && typeof symbol._id === "number" && typeof symbol._description === "string";
// 	};
// 	var isSymbol = function (symbol) {
// 		return symbol instanceof Symbol && checkSymbolInternals(symbol);
// 	};
// 	var symbolFor = function (key) {
// 		key = String(key);
// 		var registryLength = globalSymbolRegistry.length,
// 			record,
// 			i = 0;
// 		for(; i<registryLength; ++i) {
// 			record = globalSymbolRegistry[i];
// 			if (record.key === key)
// 				return record.symbol;
// 		}
// 		record = {
// 			key: key,
// 			symbol: Symbol(key)
// 		};
// 		globalSymbolRegistry.push(record);
// 		return record.symbol;
// 	};
// 	var symbolKeyFor = function (symbol) {
// 		if (!ES6.isSymbol(symbol))
// 			throw new TypeError(String(symbol) + " is not a symbol");
// 		var registryLength = globalSymbolRegistry.length,
// 			record,
// 			i = 0;
// 		for(; i<registryLength; ++i) {
// 			record = globalSymbolRegistry[i];
// 			if (record.symbol === symbol)
// 				return record.key;
// 		}
// 	};
// 	/* It affects array1 and appends array2 at the end of array1 */
// 	var appendArray = function (array1, array2) {
// 		// Returns immediately if these are not array or not array-like objects
// 		if (!(typeof array1.length === "number" && array1.length >= 0 && typeof array2.length === "number" && array2.length >= 0))
// 			return;
// 		var length1 = Math.floor(array1.length),
// 			length2 = Math.floor(array2.length),
// 			i = 0;
// 		array1.length = length1 + length2;
// 		for (; i<length2; ++i)
// 			if (array2.hasOwnProperty(i))
// 				array1[length1 + i] = array2[i];
// 	};
// 	var es6ObjectPrototypeToString = function toString() {
// 		if (this === undefined || this === null)
// 			return objectToString.call(this);
// 		// Add support for @@toStringTag symbol
// 		if (typeof this[Symbol.toStringTag] === "string")
// 			return "[object " + this[Symbol.toStringTag] + "]";
// 		else
// 			return objectToString.call(this);
// 	};
// 	var es6ArrayPrototypeConcat = function concat() {
// 		if (this === undefined || this === null)
// 			throw new TypeError("Array.prototype.concat called on null or undefined");
// 		// Boxing 'this' value to wrapper object
// 		var self = Object(this),
// 			targets = slice.call(arguments),
// 			outputs = []; // Later it may affected by Symbol
// 		targets.unshift(self);
// 		targets.forEach(function (target) {
// 			// If target is primitive then just push
// 			if (!isObject(target))
// 				outputs.push(target);
// 			// Here Symbol.isConcatSpreadable support is added
// 			else if (typeof target[Symbol.isConcatSpreadable] !== "undefined") {
// 				if (target[Symbol.isConcatSpreadable]) {
// 					appendArray(outputs, target);
// 				} else {
// 					outputs.push(target);
// 				}
// 			} else if (isArray(target)) {
// 				appendArray(outputs, target);
// 			} else {
// 				outputs.push(target);
// 			}
// 		});
// 		return outputs;
// 	};
// 	var es6ForOfLoop = function (iterable, callback, thisArg) {
// 		callback = typeof callback !== "function" ? emptyFunction : callback;
// 		if (typeof iterable[Symbol.iterator] !== "function")
// 			throw new TypeError("Iterable[Symbol.iterator] is not a function");
// 		var iterator = iterable[Symbol.iterator](),
// 			iterationResult;
// 		if (typeof iterator.next !== "function")
// 			throw new TypeError(".iterator.next is not a function");
// 		while (true) {
// 			iterationResult = iterator.next();
// 			if (!isObject(iterationResult))
// 				throw new TypeError("Iterator result " + iterationResult + " is not an object");
// 			if (iterationResult.done)
// 				break;
// 			callback.call(thisArg, iterationResult.value);
// 		}
// 	};
// 	// Provides simple inheritance functionality
// 	var simpleInheritance = function (child, parent) {
// 		if (typeof child !== "function" || typeof parent !== "function")
// 			throw new TypeError("Child and Parent must be function type");
// 		child.prototype = Object.create(parent.prototype);
// 		child.prototype.constructor = child;
// 	};
// 	// Behaves as Symbol function in ES6, take description and returns an unique object,
// 	// but in ES6 this function returns 'symbol' primitive typed value.
// 	// Its type is 'object' not 'symbol'.
// 	// There is no wrapping in this case i.e. Object(sym) = sym.
// 	var Symbol = function Symbol(desc) {
// 		desc = typeof desc === "undefined" ? "" : String(desc);
// 		if(this instanceof Symbol)
// 			throw new TypeError("Symbol is not a constructor");
// 		return setupSymbolInternals(Object.create(Symbol.prototype), desc);
// 	};
// 	defineProperties(Symbol, {
// 		"for": {
// 			value: symbolFor,
// 			writable: true,
// 			configurable: true
// 		},
// 		"keyFor": {
// 			value: symbolKeyFor,
// 			writable: true,
// 			configurable: true
// 		},
// 		"hasInstance": {
// 			value: Symbol("Symbol.hasInstance")
// 		},
// 		"isConcatSpreadable": {
// 			value: Symbol("Symbol.isConcatSpreadable")
// 		},
// 		"iterator": {
// 			value: Symbol("Symbol.iterator")
// 		},
// 		"toStringTag": {
// 			value: Symbol("Symbol.toStringTag")
// 		}
// 	});
// 	// In ES6, this function returns like 'Symbol(<desc>)', but in this case
// 	// this function returns the symbol's internal name to work properly.
// 	Symbol.prototype.toString = function () {
// 		return generateSymbolName(this._id);
// 	};
// 	// Returns itself but in ES6 It returns 'symbol' typed value.
// 	Symbol.prototype.valueOf = function () {
// 		return this;
// 	};
// 	// Make Iterator like iterable
// 	defineProperty(Iterator.prototype, Symbol.iterator.toString(), {
// 		value: function () {return this;},
// 		writable: true,
// 		configurable: true
// 	});
// 	simpleInheritance(ArrayIterator, Iterator);
// 	simpleInheritance(StringIterator, Iterator);
// 	defineProperty(ArrayIterator.prototype, Symbol.toStringTag.toString(), {
// 		value: "Array Iterator",
// 		configurable: true
// 	});
// 	defineProperty(StringIterator.prototype, Symbol.toStringTag.toString(), {
// 		value: "String Iterator",
// 		configurable: true
// 	});
// 	// This iterator works on any Array or TypedArray or array-like objects
// 	ArrayIterator.prototype.next = function next() {
// 		if (!(this instanceof ArrayIterator))
// 			throw new TypeError("Method Array Iterator.prototype.next called on incompatible receiver " + String(this));
// 		var self = this,
// 			nextValue;
// 		if (self._nextIndex === -1) {
// 			return {
// 				done: true,
// 				value: undefined
// 			};
// 		}
// 		if (!(typeof self._array.length === "number" && self._array.length >= 0)) {
// 			self._nextIndex = -1;
// 			return {
// 				done: true,
// 				value: undefined
// 			};
// 		}
// 		// _flag = 1 for [index, value]
// 		// _flag = 2 for [value]
// 		// _flag = 3 for [index]
// 		if (self._nextIndex < Math.floor(self._array.length)) {
// 			if (self._flag === 1)
// 				nextValue = [self._nextIndex, self._array[self._nextIndex]];
// 			else if (self._flag === 2)
// 				nextValue = self._array[self._nextIndex];
// 			else if (self._flag === 3)
// 				nextValue = self._nextIndex;
// 			self._nextIndex++;
// 			return {
// 				done: false,
// 				value: nextValue
// 			};
// 		} else {
// 			self._nextIndex = -1;
// 			return {
// 				done: true,
// 				value: undefined
// 			};
// 		}
// 	};
// 	StringIterator.prototype.next = function next() {
// 		if (!(this instanceof StringIterator))
// 			throw new TypeError("Method String Iterator.prototype.next called on incompatible receiver " + String(this));
// 		var self = this,
// 			stringObject = new String(this._string),
// 			nextValue;
// 		if (self._nextIndex === -1) {
// 			return {
// 				done: true,
// 				value: undefined
// 			};
// 		}
// 		if (self._nextIndex < stringObject.length) {
// 			nextValue = stringObject[self._nextIndex];
// 			self._nextIndex++;
// 			return {
// 				done: false,
// 				value: nextValue
// 			};
// 		} else {
// 			self._nextIndex = -1;
// 			return {
// 				done: true,
// 				value: undefined
// 			};
// 		}
// 	};
// 	var es6ArrayPrototypeIteratorSymbol = function values() {
// 		if (this === undefined || this === null)
// 			throw new TypeError("Cannot convert undefined or null to object");
// 		var self = Object(this);
// 		return new ArrayIterator(self, 2);
// 	};
// 	var es6StringPrototypeIteratorSymbol = function values() {
// 		if (this === undefined || this === null)
// 			throw new TypeError("String.prototype[Symbol.iterator] called on null or undefined");
// 		return new StringIterator(String(this), 0);
// 	};
// 	var es6ArrayPrototypeEntries = function entries() {
// 		if (this === undefined || this === null)
// 			throw new TypeError("Cannot convert undefined or null to object");
// 		var self = Object(this);
// 		return new ArrayIterator(self, 1);
// 	};
// 	var es6ArrayPrototypeKeys = function keys() {
// 		if (this === undefined || this === null)
// 			throw new TypeError("Cannot convert undefined or null to object");
// 		var self = Object(this);
// 		return new ArrayIterator(self, 3);
// 	};
// 	var SpreadOperatorImpl = function (target, thisArg) {
// 		this._target = target;
// 		this._values = [];
// 		this._thisArg = thisArg;
// 	};
// 	// All the arguments must be iterable
// 	SpreadOperatorImpl.prototype.spread = function () {
// 		var self = this;
// 		slice.call(arguments).forEach(function (iterable) {
// 			ES6.forOf(iterable, function (value) {
// 				self._values.push(value);
// 			});
// 		});
// 		return self;
// 	};
// 	SpreadOperatorImpl.prototype.add = function () {
// 		var self = this;
// 		slice.call(arguments).forEach(function (value) {
// 			self._values.push(value);
// 		});
// 		return self;
// 	};
// 	SpreadOperatorImpl.prototype.call = function (thisArg) {
// 		if (typeof this._target !== "function")
// 			throw new TypeError("Target is not a function");
// 		thisArg = arguments.length <= 0 ? this._thisArg : thisArg;
// 		return this._target.apply(thisArg, this._values);
// 	};
// 	SpreadOperatorImpl.prototype.new = function () {
// 		if (typeof this._target !== "function")
// 			throw new TypeError("Target is not a constructor");
// 		var temp,
// 			returnValue;
// 		temp = Object.create(this._target.prototype);
// 		returnValue = this._target.apply(temp, this._values);
// 		return isObject(returnValue) ? returnValue : temp;
// 	};
// 	// Affects the target array
// 	SpreadOperatorImpl.prototype.array = function () {
// 		if (!isArray(this._target))
// 			throw new TypeError("Target is not a array");
// 		push.apply(this._target, this._values);
// 		return this._target;
// 	};
// 	// Target must be Array or function
// 	var es6SpreadOperator = function spreadOperator(target, thisArg) {
// 		if (!(typeof target === "function" || isArray(target)))
// 			throw new TypeError("Spread operator only supports on array and function objects at this moment");
// 		return new SpreadOperatorImpl(target, thisArg);
// 	};
// 	var es6ArrayFrom = function from(arrayLike, mapFn, thisArg) {
// 		var constructor,
// 			i = 0,
// 			length,
// 			outputs;
// 		// Use the generic constructor
// 		constructor = !isConstructor(this) ? Array : this;
// 		if (arrayLike === undefined || arrayLike === null)
// 			throw new TypeError("Cannot convert undefined or null to object");
// 		arrayLike = Object(arrayLike);
// 		if (mapFn === undefined)
// 			mapFn = simpleFunction;
// 		else if (!isCallable(mapFn))
// 			throw new TypeError(mapFn + " is not a function");
// 		if (typeof arrayLike[Symbol.iterator] === "undefined") {
// 			if (!(typeof arrayLike.length === "number" && arrayLike.length >= 0)) {
// 				outputs = new constructor(0);
// 				outputs.length = 0;
// 				return outputs;
// 			}
// 			length = Math.floor(arrayLike.length);
// 			outputs = new constructor(length);
// 			outputs.length = length;
// 			for(; i < length; ++i)
// 				outputs[i] = mapFn.call(thisArg, arrayLike[i]);
// 		} else {
// 			outputs = new constructor();
// 			outputs.length = 0;
// 			ES6.forOf(arrayLike, function (value) {
// 				outputs.length++;
// 				outputs[outputs.length - 1] = mapFn.call(thisArg, value);
// 			});
// 		}
// 		return outputs;
// 	};
// 	// Export ES6 APIs and add all the patches to support Symbol in ES5
// 	// If the running environment already supports ES6 then no patches will be applied,
// 	if (isES6Running())
// 		return ES6;
// 	else {
// 		// Some ES6 APIs can't be implemented in pure ES5, so this 'ES6' object provides
// 		// some equivalent functionality of these features.
// 		defineProperties(ES6, {
// 			// Checks if a JS value is a symbol
// 			// It can be used as equivalent api in ES6: typeof symbol === 'symbol'
// 			isSymbol: {
// 				value: isSymbol,
// 				writable: true,
// 				configurable: true
// 			},
// 			// Native ES5 'instanceof' operator does not support @@hasInstance symbol,
// 			// this method provides same functionality of ES6 'instanceof' operator.
// 			instanceOf: {
// 				value: es6InstanceOfOperator,
// 				writable: true,
// 				configurable: true
// 			},
// 			// This method behaves exactly same as ES6 for...of loop.
// 			forOf: {
// 				value: es6ForOfLoop,
// 				writable: true,
// 				configurable: true
// 			},
// 			// This method gives same functionality of the spread operator of ES6
// 			// It works on only functions and arrays.
// 			// Limitation: You can't create array like this [...iterable, , , , 33] by this method,
// 			// to achieve this you have to do like this [...iterable, undefined, undefined, undefined, 33]
// 			spreadOperator: {
// 				value: es6SpreadOperator,
// 				writable: true,
// 				configurable: true
// 			}
// 		});
// 		defineProperty(global, "Symbol", {
// 			value: Symbol,
// 			writable: true,
// 			configurable: true
// 		});
// 		defineProperty(Function.prototype, Symbol.hasInstance.toString(), {
// 			value: es6FunctionPrototypeHasInstanceSymbol
// 		});
// 		defineProperty(Array.prototype, "concat", {
// 			value: es6ArrayPrototypeConcat,
// 			writable: true,
// 			configurable: true
// 		});
// 		defineProperty(Object.prototype, "toString", {
// 			value: es6ObjectPrototypeToString,
// 			writable: true,
// 			configurable: true
// 		});
// 		defineProperty(Array.prototype, Symbol.iterator.toString(), {
// 			value: es6ArrayPrototypeIteratorSymbol,
// 			writable: true,
// 			configurable: true
// 		});
// 		defineProperty(Array, "from", {
// 			value: es6ArrayFrom,
// 			writable: true,
// 			configurable: true
// 		});
// 		defineProperty(Array.prototype, "entries", {
// 			value: es6ArrayPrototypeEntries,
// 			writable: true,
// 			configurable: true
// 		});
// 		defineProperty(Array.prototype, "keys", {
// 			value: es6ArrayPrototypeKeys,
// 			writable: true,
// 			configurable: true
// 		});
// 		defineProperty(String.prototype, Symbol.iterator.toString(), {
// 			value: es6StringPrototypeIteratorSymbol,
// 			writable: true,
// 			configurable: true
// 		});
// 	}
// 	return ES6;
// });
// -------- CWAEnv.js --------
// Generated by CoffeeScript 2.6.1
(function(){// CoffeeScript WebGL ARP Environment set up.
var CWAEnv,navigator;navigator=this.navigator;CWAEnv=function(){//-----------
class CWAEnv{//-----------
constructor(){throw"CWAEnv is not instantiatable.";}static add(cls,cname){var ref;this._mod[cname]=cls;if(cname==="Logger"){this._lggr=cls.get("CWAEnv");// , "trace", "stderr"
}return(ref=this._lggr)!=null?typeof ref.trace==="function"?ref.trace(`CWAEnv add for ${cname}`):void 0:void 0;}static get(cname){var ref,ref1,res;if((ref=this._lggr)!=null){if(typeof ref.trace==="function"){ref.trace(`CWAEnv get for ${cname}`);}}res=this._mod[cname];if(res!=null){return res;}else{return(ref1=this._lggr)!=null?ref1.warn(`No CWAEnv entry for ${cname}`):void 0;}}static fixRef(aname,bname){return this._mod[aname][`set${bname}`](this._mod[bname]);}static _setEnvTags(){var avlc,ref,uaHas,ualc;//---------
[avlc,ualc,this.platTag]=navigator!=null?[navigator.appVersion.toLowerCase(),navigator.userAgent.toLowerCase(),navigator.platform]:["node","node","node"];uaHas=function(str){return ualc.indexOf(`${str}/`)!==-1;};// OPR can be with Chrome
// Chrome can be with Safari
// iOS version of Opera has no browser except Mobile
this.browTag=uaHas("opr")?"Opera":uaHas("edge")||uaHas("edgios")?"Edge":uaHas("firefox")||uaHas("fxios")?"Firefox":uaHas("chrome")||uaHas("crios")?"Chrome":uaHas("safari")?"Safari":uaHas("trident")?"IE":uaHas("mobile")?"Opera":`Unknown browser \"${ualc}\"`;// Seems javaEnabled is unreliable on IE and Edge
// Testing mime types works generally but not on IE
// IE and Edge always report javaEnabled so fail safe
if(this.browTag==="IE"){// Was: @hasJava = do navigator?.javaEnabled
return this.hasJava=navigator!=null?navigator.javaEnabled():void 0;}else{return this.hasJava=(navigator!=null?(ref=navigator.mimeTypes)!=null?ref['application/x-java-applet']:void 0:void 0)!=null;}}};// Static
CWAEnv._mod={};CWAEnv._lggr=null;CWAEnv.platTag=null;CWAEnv.browTag=null;CWAEnv.hasJava=false;CWAEnv._setEnvTags();return CWAEnv;}.call(this);// CWASA will report settings from environment
// Export
this.getCWAEnv=function(){return CWAEnv;};// Make methods available in the normal way as well
CWAEnv.add(CWAEnv,"CWAEnv");// (End CWAEnv.coffee)
}).call(this);// -------- Logger.js --------
// Generated by CoffeeScript 2.6.1
(function(){var Logger,console,cwaenv;cwaenv=this.getCWAEnv();console=this.console;Logger=function(){var base;class Logger{// Class Statics
static _nullLogger(){}static _baseLogger(lev){return console[lev].bind(console);}static _tagLogger(lev,nom,tag,force){var lfn,lgr,tagstr;lgr=force==="stderr"?this.OrigWarnLogger:this._defaultLogger[lev].logger;while(nom.length<6){nom+=" ";}if(tag!==""){while(tag.length<5){tag+=" ";}nom+=" "+tag;}tagstr=nom+": ";return lfn=(msg,...args)=>{return lgr(`${new Date().toISOString().substr(11,12)} ${tagstr}${msg}`,...args);};}// List names of installed Loggers as string
static list(){var i,ix,len,lgr,msg,ref;msg="";ref=this._loggers;for(ix=i=0,len=ref.length;i<len;ix=++i){lgr=ref[ix];if(ix>0){msg+=", ";}msg+=lgr.modName;}return msg;}// Object Methods
_setLoggers(newMaxLog,force){var lgr,lgrObj,newMaxLogLev,ref,ref1,ref2,results;newMaxLogLev=Logger._defaultLogger[newMaxLog].lev;if(force==="noforce"){newMaxLogLev=Math.min(newMaxLogLev,Logger._buildMaxLogLev);}this.maxLog=newMaxLog;this.maxLogLev=newMaxLogLev;this.force=force;ref=Logger._defaultLogger;results=[];for(lgr in ref){lgrObj=ref[lgr];if(lgrObj.lev>this.maxLogLev){if((ref1=Logger._modLogger)!=null){if(typeof ref1.trace==="function"){ref1.trace(`Ignoring ${lgr} (lev ${lgrObj.lev}) for ${this.modName}`);}}results.push(this[lgr]=null);}else{if((ref2=Logger._modLogger)!=null){if(typeof ref2.trace==="function"){ref2.trace(`Setting ${lgr} (lev ${Logger._defaultLogger[lgr].lev}) for ${this.modName}`);}}if(force==="stderr"){// Tag all to stderr with class
results.push(this[lgr]=Logger._tagLogger(lgr,this.modName,lgr,force));}else{// Tag debug and trace with class
results.push(this[lgr]=Logger._tagLogger(lgr,this.modName,lgrObj.lev>500?lgr:"",force));}}}return results;}// Constructor for Logger
constructor(modName="anon",newMaxLog,force){var ref;this.modName=modName;this._setLoggers(newMaxLog,force);// Note: Logger._modLogger will not be defined when this is first called by this module
if((ref=Logger._modLogger)!=null){if(typeof ref.trace==="function"){ref.trace(`${this.modName} created: ${this.maxLog} (${this.maxLogLev}) ${this.force}`);}}Logger._loggers.push(this);}// Find or create named Logger
// Uses Logger._defaultMaxLog if maxLog not set
static get(lgr="anon",maxLog="default",force="default"){var i,len,lg,ref,ref1,ref2,ref3,stat,theLogger;theLogger=null;ref=Logger._loggers;for(i=0,len=ref.length;i<len;i++){lg=ref[i];if(lg.modName===lgr){if(theLogger==null){theLogger=lg;}}}stat=theLogger!=null?"Updated":"Created";if(theLogger!=null){if(maxLog==="default"){maxLog=theLogger.maxLog;}if(force==="default"){force=theLogger.force;}if((ref1=Logger._modLogger)!=null){if(typeof ref1.trace==="function"){ref1.trace(`get: Updating ${theLogger.modName} Logger. MaxLog ${theLogger.maxLog} -> ${maxLog}`);}}theLogger._setLoggers(maxLog,force);}else{if(maxLog==="default"){maxLog=Logger._defaultMaxLog;}if(force==="default"){force="noforce";}if((ref2=Logger._modLogger)!=null){if(typeof ref2.trace==="function"){ref2.trace(`get: Create ${lgr} logger`);}}theLogger=new Logger(lgr,maxLog,force);}if((ref3=Logger._modLogger)!=null){if(typeof ref3.debug==="function"){ref3.debug(`${theLogger.modName} ${stat}: ${theLogger.maxLog} (${theLogger.maxLogLev}) ${theLogger.force}`);}}return theLogger;}static _listHooks(){var base,base1,hk,i,j,len,len1,ref,rep,results,ty,typs;typs=Object.keys(this._hooks);if(typeof(base=this._hookLog).trace==="function"){base.trace(`Listing hooks. Types ${typs}`);}results=[];for(i=0,len=typs.length;i<len;i++){ty=typs[i];rep=`Hooks for ${ty} (${this._hooks[ty].length}):`;ref=this._hooks[ty];for(j=0,len1=ref.length;j<len1;j++){hk=ref[j];rep+=` ${hk.typ}/${hk.av}`;}results.push(typeof(base1=this._hookLog).trace==="function"?base1.trace(rep):void 0);}return results;}static addHook(typ,fun,av="*"){var base,base1,hook;if((base=Logger._hooks)[typ]==null){base[typ]=[];}hook={typ:typ,fun:fun,av:av};if(typeof(base1=Logger._hookLog).trace==="function"){base1.trace(`Adding ${hook.typ} hook [${hook.av}]`);}Logger._hooks[typ].push(hook);return Logger._listHooks();}static callHook(typ,msg,av="*"){var base,base1,base2,doCall,evt,hk,i,len,ref,results;if((base=Logger._hooks)[typ]==null){base[typ]=[];}evt={typ:typ,msg:msg,av:av};if(typeof(base1=Logger._hookLog).trace==="function"){base1.trace(`Calling ${typ} hook for ${av} [${JSON.stringify(msg)}] (${Logger._hooks[typ].length} hooks)`);}ref=Logger._hooks[typ];results=[];for(i=0,len=ref.length;i<len;i++){hk=ref[i];doCall=av==="*"||hk.av==="*"||av===hk.av;if(typeof(base2=Logger._hookLog).trace==="function"){base2.trace(`Try ${hk.typ} hook for ${hk.av}: ${doCall?'':'No '}Match`);}if(doCall){results.push(hk.fun(evt));}else{results.push(void 0);}}return results;}};Logger.OrigErrorLogger=Logger._baseLogger("error");Logger.OrigWarnLogger=Logger._baseLogger("warn");Logger.OrigLogLogger=Logger._baseLogger("log");Logger.OrigInfoLogger=Logger._baseLogger("info");Logger._defaultLogger={error:{lev:200,logger:Logger.OrigErrorLogger},warn:{lev:300,logger:Logger.OrigWarnLogger},log:{lev:400,logger:Logger.OrigLogLogger},info:{lev:500,logger:Logger.OrigInfoLogger},debug:{lev:600,logger:Logger.OrigInfoLogger},trace:{lev:700,logger:Logger.OrigInfoLogger}};// Absolute maximum and default set according to (last character of) version
Logger._buildVersion="loc2022";// Treat an unmapped parameter as a production release
[Logger._buildMaxLog,Logger._defaultMaxLog]=function(){switch(Logger._buildVersion.slice(-1)){case"t":case"u":case"v":return["trace","debug"];case"w":case"x":case"y":return["trace","info"];case"z":return["info","info"];default:return["log","log"];}}.call(this);Logger._buildMaxLogLev=Logger._defaultLogger[Logger._buildMaxLog].lev;Logger._loggers=[];// console.log "Logger testing with multiple arguments. First. %s. %s.", "Second", "Third"
// Override console logs to trap any remaining uses
console.error=function(msg,...args){return Logger.OrigErrorLogger(new Date().toISOString().substr(11,12)+" Error: "+msg,...args);};console.warn=function(msg,...args){return Logger.OrigWarnLogger(new Date().toISOString().substr(11,12)+" Warn: "+msg,...args);};console.log=function(msg,...args){return Logger.OrigLogLogger(new Date().toISOString().substr(11,12)+" Log: "+msg,...args);};console.info=function(msg,...args){return Logger.OrigInfoLogger(new Date().toISOString().substr(11,12)+" Info: "+msg,...args);};// Logger for the Logger module
Logger._modLogger=Logger.get("Logger");// , "debug" # , "stderr"
// Hooks for status reporting
Logger._hookLog=Logger.get("Hooks");Logger._hooks={};if(typeof(base=Logger._modLogger).info==="function"){base.info(`Build Version ${Logger._buildVersion}. Build MaxLog ${Logger._buildMaxLog}. Build MaxLogLev ${Logger._buildMaxLogLev}. Default MaxLog ${Logger._defaultMaxLog}`);}return Logger;}.call(this);// Object Methods
// Export
cwaenv.add(Logger,"Logger");// (End Logger.coffee)
}).call(this);// -------- zip.js --------
/*
Copyright (c) 2013 Gildas Lormeau. All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in
the documentation and/or other materials provided with the distribution.
3. The names of the authors may not be used to endorse or promote products
derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/(function(obj){"use strict";var ERR_BAD_FORMAT="ZIP file format not recognized.";var ERR_CRC="CRC failed.";var ERR_ENCRYPTED="File contains encrypted entry.";var ERR_ZIP64="File is using Zip64 (4gb+ file size).";var ERR_READ="Error while reading zip file.";var ERR_WRITE="Error while writing zip file.";var ERR_WRITE_DATA="Error while writing file data.";var ERR_READ_DATA="Error while reading file data.";var ERR_DUPLICATED_NAME="File already exists.";var CHUNK_SIZE=512*1024;var TEXT_PLAIN="text/plain";var appendABViewSupported;try{appendABViewSupported=new Blob([new DataView(new ArrayBuffer(0))]).size===0;}catch(e){}function Crc32(){this.crc=-1;}Crc32.prototype.append=function append(data){var crc=this.crc|0,table=this.table;for(var offset=0,len=data.length|0;offset<len;offset++)crc=crc>>>8^table[(crc^data[offset])&0xFF];this.crc=crc;};Crc32.prototype.get=function get(){return~this.crc;};Crc32.prototype.table=function(){var i,j,t,table=[];// Uint32Array is actually slower than []
for(i=0;i<256;i++){t=i;for(j=0;j<8;j++)if(t&1)t=t>>>1^0xEDB88320;else t=t>>>1;table[i]=t;}return table;}();// "no-op" codec
function NOOP(){}NOOP.prototype.append=function append(bytes,onprogress){return bytes;};NOOP.prototype.flush=function flush(){};function blobSlice(blob,index,length){if(index<0||length<0||index+length>blob.size)throw new RangeError('offset:'+index+', length:'+length+', size:'+blob.size);if(blob.slice)return blob.slice(index,index+length);else if(blob.webkitSlice)return blob.webkitSlice(index,index+length);else if(blob.mozSlice)return blob.mozSlice(index,index+length);else if(blob.msSlice)return blob.msSlice(index,index+length);}function getDataHelper(byteLength,bytes){var dataBuffer,dataArray;dataBuffer=new ArrayBuffer(byteLength);dataArray=new Uint8Array(dataBuffer);if(bytes)dataArray.set(bytes,0);return{buffer:dataBuffer,array:dataArray,view:new DataView(dataBuffer)};}// Readers
function Reader(){}function TextReader(text){var that=this,blobReader;function init(callback,onerror){var blob=new Blob([text],{type:TEXT_PLAIN});blobReader=new BlobReader(blob);blobReader.init(function(){that.size=blobReader.size;callback();},onerror);}function readUint8Array(index,length,callback,onerror){blobReader.readUint8Array(index,length,callback,onerror);}that.size=0;that.init=init;that.readUint8Array=readUint8Array;}TextReader.prototype=new Reader();TextReader.prototype.constructor=TextReader;function Data64URIReader(dataURI){var that=this,dataStart;function init(callback){var dataEnd=dataURI.length;while(dataURI.charAt(dataEnd-1)=="=")dataEnd--;dataStart=dataURI.indexOf(",")+1;that.size=Math.floor((dataEnd-dataStart)*0.75);callback();}function readUint8Array(index,length,callback){var i,data=getDataHelper(length);var start=Math.floor(index/3)*4;var end=Math.ceil((index+length)/3)*4;var bytes=obj.atob(dataURI.substring(start+dataStart,end+dataStart));var delta=index-Math.floor(start/4)*3;for(i=delta;i<delta+length;i++)data.array[i-delta]=bytes.charCodeAt(i);callback(data.array);}that.size=0;that.init=init;that.readUint8Array=readUint8Array;}Data64URIReader.prototype=new Reader();Data64URIReader.prototype.constructor=Data64URIReader;function BlobReader(blob){var that=this;function init(callback){that.size=blob.size;callback();}function readUint8Array(index,length,callback,onerror){var reader=new FileReader();reader.onload=function(e){callback(new Uint8Array(e.target.result));};reader.onerror=onerror;try{reader.readAsArrayBuffer(blobSlice(blob,index,length));}catch(e){onerror(e);}}that.size=0;that.init=init;that.readUint8Array=readUint8Array;}BlobReader.prototype=new Reader();BlobReader.prototype.constructor=BlobReader;// Writers
function Writer(){}Writer.prototype.getData=function(callback){callback(this.data);};function TextWriter(encoding){var that=this,blob;function init(callback){blob=new Blob([],{type:TEXT_PLAIN});callback();}function writeUint8Array(array,callback){blob=new Blob([blob,appendABViewSupported?array:array.buffer],{type:TEXT_PLAIN});callback();}function getData(callback,onerror){var reader=new FileReader();reader.onload=function(e){callback(e.target.result);};reader.onerror=onerror;reader.readAsText(blob,encoding);}that.init=init;that.writeUint8Array=writeUint8Array;that.getData=getData;}TextWriter.prototype=new Writer();TextWriter.prototype.constructor=TextWriter;function Data64URIWriter(contentType){var that=this,data="",pending="";function init(callback){data+="data:"+(contentType||"")+";base64,";callback();}function writeUint8Array(array,callback){var i,delta=pending.length,dataString=pending;pending="";for(i=0;i<Math.floor((delta+array.length)/3)*3-delta;i++)dataString+=String.fromCharCode(array[i]);for(;i<array.length;i++)pending+=String.fromCharCode(array[i]);if(dataString.length>2)data+=obj.btoa(dataString);else pending=dataString;callback();}function getData(callback){callback(data+obj.btoa(pending));}that.init=init;that.writeUint8Array=writeUint8Array;that.getData=getData;}Data64URIWriter.prototype=new Writer();Data64URIWriter.prototype.constructor=Data64URIWriter;function BlobWriter(contentType){var blob,that=this;function init(callback){blob=new Blob([],{type:contentType});callback();}function writeUint8Array(array,callback){blob=new Blob([blob,appendABViewSupported?array:array.buffer],{type:contentType});callback();}function getData(callback){callback(blob);}that.init=init;that.writeUint8Array=writeUint8Array;that.getData=getData;}BlobWriter.prototype=new Writer();BlobWriter.prototype.constructor=BlobWriter;/**
* inflate/deflate core functions
* @param worker {Worker} web worker for the task.
* @param initialMessage {Object} initial message to be sent to the worker. should contain
*   sn(serial number for distinguishing multiple tasks sent to the worker), and codecClass.
*   This function may add more properties before sending.
*/function launchWorkerProcess(worker,initialMessage,reader,writer,offset,size,onprogress,onend,onreaderror,onwriteerror){var chunkIndex=0,index,outputSize,sn=initialMessage.sn,crc;function onflush(){worker.removeEventListener('message',onmessage,false);onend(outputSize,crc);}function onmessage(event){var message=event.data,data=message.data,err=message.error;if(err){err.toString=function(){return'Error: '+this.message;};onreaderror(err);return;}if(message.sn!==sn)return;if(typeof message.codecTime==='number')worker.codecTime+=message.codecTime;// should be before onflush()
if(typeof message.crcTime==='number')worker.crcTime+=message.crcTime;switch(message.type){case'append':if(data){outputSize+=data.length;writer.writeUint8Array(data,function(){step();},onwriteerror);}else step();break;case'flush':crc=message.crc;if(data){outputSize+=data.length;writer.writeUint8Array(data,function(){onflush();},onwriteerror);}else onflush();break;case'progress':if(onprogress)onprogress(index+message.loaded,size);break;case'importScripts'://no need to handle here
case'newTask':case'echo':break;default:console.warn('zip.js:launchWorkerProcess: unknown message: ',message);}}function step(){index=chunkIndex*CHUNK_SIZE;// use `<=` instead of `<`, because `size` may be 0.
if(index<=size){reader.readUint8Array(offset+index,Math.min(CHUNK_SIZE,size-index),function(array){if(onprogress)onprogress(index,size);var msg=index===0?initialMessage:{sn:sn};msg.type='append';msg.data=array;// posting a message with transferables will fail on IE10
try{worker.postMessage(msg,[array.buffer]);}catch(ex){worker.postMessage(msg);// retry without transferables
}chunkIndex++;},onreaderror);}else{worker.postMessage({sn:sn,type:'flush'});}}outputSize=0;worker.addEventListener('message',onmessage,false);step();}function launchProcess(process,reader,writer,offset,size,crcType,onprogress,onend,onreaderror,onwriteerror){var chunkIndex=0,index,outputSize=0,crcInput=crcType==='input',crcOutput=crcType==='output',crc=new Crc32();function step(){var outputData;index=chunkIndex*CHUNK_SIZE;if(index<size)reader.readUint8Array(offset+index,Math.min(CHUNK_SIZE,size-index),function(inputData){var outputData;try{outputData=process.append(inputData,function(loaded){if(onprogress)onprogress(index+loaded,size);});}catch(e){onreaderror(e);return;}if(outputData){outputSize+=outputData.length;writer.writeUint8Array(outputData,function(){chunkIndex++;setTimeout(step,1);},onwriteerror);if(crcOutput)crc.append(outputData);}else{chunkIndex++;setTimeout(step,1);}if(crcInput)crc.append(inputData);if(onprogress)onprogress(index,size);},onreaderror);else{try{outputData=process.flush();}catch(e){onreaderror(e);return;}if(outputData){if(crcOutput)crc.append(outputData);outputSize+=outputData.length;writer.writeUint8Array(outputData,function(){onend(outputSize,crc.get());},onwriteerror);}else onend(outputSize,crc.get());}}step();}function inflate(worker,sn,reader,writer,offset,size,computeCrc32,onend,onprogress,onreaderror,onwriteerror){var crcType=computeCrc32?'output':'none';if(obj.zip.useWebWorkers){var initialMessage={sn:sn,codecClass:'Inflater',crcType:crcType};launchWorkerProcess(worker,initialMessage,reader,writer,offset,size,onprogress,onend,onreaderror,onwriteerror);}else launchProcess(new obj.zip.Inflater(),reader,writer,offset,size,crcType,onprogress,onend,onreaderror,onwriteerror);}function deflate(worker,sn,reader,writer,level,onend,onprogress,onreaderror,onwriteerror){var crcType='input';if(obj.zip.useWebWorkers){var initialMessage={sn:sn,options:{level:level},codecClass:'Deflater',crcType:crcType};launchWorkerProcess(worker,initialMessage,reader,writer,0,reader.size,onprogress,onend,onreaderror,onwriteerror);}else launchProcess(new obj.zip.Deflater(),reader,writer,0,reader.size,crcType,onprogress,onend,onreaderror,onwriteerror);}function copy(worker,sn,reader,writer,offset,size,computeCrc32,onend,onprogress,onreaderror,onwriteerror){var crcType='input';if(obj.zip.useWebWorkers&&computeCrc32){var initialMessage={sn:sn,codecClass:'NOOP',crcType:crcType};launchWorkerProcess(worker,initialMessage,reader,writer,offset,size,onprogress,onend,onreaderror,onwriteerror);}else launchProcess(new NOOP(),reader,writer,offset,size,crcType,onprogress,onend,onreaderror,onwriteerror);}// ZipReader
function decodeASCII(str){var i,out="",charCode,extendedASCII=['\u00C7','\u00FC','\u00E9','\u00E2','\u00E4','\u00E0','\u00E5','\u00E7','\u00EA','\u00EB','\u00E8','\u00EF','\u00EE','\u00EC','\u00C4','\u00C5','\u00C9','\u00E6','\u00C6','\u00F4','\u00F6','\u00F2','\u00FB','\u00F9','\u00FF','\u00D6','\u00DC','\u00F8','\u00A3','\u00D8','\u00D7','\u0192','\u00E1','\u00ED','\u00F3','\u00FA','\u00F1','\u00D1','\u00AA','\u00BA','\u00BF','\u00AE','\u00AC','\u00BD','\u00BC','\u00A1','\u00AB','\u00BB','_','_','_','\u00A6','\u00A6','\u00C1','\u00C2','\u00C0','\u00A9','\u00A6','\u00A6','+','+','\u00A2','\u00A5','+','+','-','-','+','-','+','\u00E3','\u00C3','+','+','-','-','\u00A6','-','+','\u00A4','\u00F0','\u00D0','\u00CA','\u00CB','\u00C8','i','\u00CD','\u00CE','\u00CF','+','+','_','_','\u00A6','\u00CC','_','\u00D3','\u00DF','\u00D4','\u00D2','\u00F5','\u00D5','\u00B5','\u00FE','\u00DE','\u00DA','\u00DB','\u00D9','\u00FD','\u00DD','\u00AF','\u00B4','\u00AD','\u00B1','_','\u00BE','\u00B6','\u00A7','\u00F7','\u00B8','\u00B0','\u00A8','\u00B7','\u00B9','\u00B3','\u00B2','_',' '];for(i=0;i<str.length;i++){charCode=str.charCodeAt(i)&0xFF;if(charCode>127)out+=extendedASCII[charCode-128];else out+=String.fromCharCode(charCode);}return out;}function decodeUTF8(string){return decodeURIComponent(escape(string));}function getString(bytes){var i,str="";for(i=0;i<bytes.length;i++)str+=String.fromCharCode(bytes[i]);return str;}function getDate(timeRaw){var date=(timeRaw&0xffff0000)>>16,time=timeRaw&0x0000ffff;try{return new Date(1980+((date&0xFE00)>>9),((date&0x01E0)>>5)-1,date&0x001F,(time&0xF800)>>11,(time&0x07E0)>>5,(time&0x001F)*2,0);}catch(e){}}function readCommonHeader(entry,data,index,centralDirectory,onerror){entry.version=data.view.getUint16(index,true);entry.bitFlag=data.view.getUint16(index+2,true);entry.compressionMethod=data.view.getUint16(index+4,true);entry.lastModDateRaw=data.view.getUint32(index+6,true);entry.lastModDate=getDate(entry.lastModDateRaw);if((entry.bitFlag&0x01)===0x01){onerror(ERR_ENCRYPTED);return;}if(centralDirectory||(entry.bitFlag&0x0008)!=0x0008){entry.crc32=data.view.getUint32(index+10,true);entry.compressedSize=data.view.getUint32(index+14,true);entry.uncompressedSize=data.view.getUint32(index+18,true);}if(entry.compressedSize===0xFFFFFFFF||entry.uncompressedSize===0xFFFFFFFF){onerror(ERR_ZIP64);return;}entry.filenameLength=data.view.getUint16(index+22,true);entry.extraFieldLength=data.view.getUint16(index+24,true);}function createZipReader(reader,callback,onerror){var inflateSN=0;function Entry(){}Entry.prototype.getData=function(writer,onend,onprogress,checkCrc32){var that=this;function testCrc32(crc32){var dataCrc32=getDataHelper(4);dataCrc32.view.setUint32(0,crc32);return that.crc32==dataCrc32.view.getUint32(0);}function getWriterData(uncompressedSize,crc32){if(checkCrc32&&!testCrc32(crc32))onerror(ERR_CRC);else writer.getData(function(data){onend(data);});}function onreaderror(err){onerror(err||ERR_READ_DATA);}function onwriteerror(err){onerror(err||ERR_WRITE_DATA);}reader.readUint8Array(that.offset,30,function(bytes){var data=getDataHelper(bytes.length,bytes),dataOffset;if(data.view.getUint32(0)!=0x504b0304){onerror(ERR_BAD_FORMAT);return;}readCommonHeader(that,data,4,false,onerror);dataOffset=that.offset+30+that.filenameLength+that.extraFieldLength;writer.init(function(){if(that.compressionMethod===0)copy(that._worker,inflateSN++,reader,writer,dataOffset,that.compressedSize,checkCrc32,getWriterData,onprogress,onreaderror,onwriteerror);else inflate(that._worker,inflateSN++,reader,writer,dataOffset,that.compressedSize,checkCrc32,getWriterData,onprogress,onreaderror,onwriteerror);},onwriteerror);},onreaderror);};function seekEOCDR(eocdrCallback){// "End of central directory record" is the last part of a zip archive, and is at least 22 bytes long.
// Zip file comment is the last part of EOCDR and has max length of 64KB,
// so we only have to search the last 64K + 22 bytes of a archive for EOCDR signature (0x06054b50).
var EOCDR_MIN=22;if(reader.size<EOCDR_MIN){onerror(ERR_BAD_FORMAT);return;}var ZIP_COMMENT_MAX=256*256,EOCDR_MAX=EOCDR_MIN+ZIP_COMMENT_MAX;// In most cases, the EOCDR is EOCDR_MIN bytes long
doSeek(EOCDR_MIN,function(){// If not found, try within EOCDR_MAX bytes
doSeek(Math.min(EOCDR_MAX,reader.size),function(){onerror(ERR_BAD_FORMAT);});});// seek last length bytes of file for EOCDR
function doSeek(length,eocdrNotFoundCallback){reader.readUint8Array(reader.size-length,length,function(bytes){for(var i=bytes.length-EOCDR_MIN;i>=0;i--){if(bytes[i]===0x50&&bytes[i+1]===0x4b&&bytes[i+2]===0x05&&bytes[i+3]===0x06){eocdrCallback(new DataView(bytes.buffer,i,EOCDR_MIN));return;}}eocdrNotFoundCallback();},function(){onerror(ERR_READ);});}}var zipReader={getEntries:function(callback){var worker=this._worker;// look for End of central directory record
seekEOCDR(function(dataView){var datalength,fileslength;datalength=dataView.getUint32(16,true);fileslength=dataView.getUint16(8,true);if(datalength<0||datalength>=reader.size){onerror(ERR_BAD_FORMAT);return;}reader.readUint8Array(datalength,reader.size-datalength,function(bytes){var i,index=0,entries=[],entry,filename,comment,data=getDataHelper(bytes.length,bytes);for(i=0;i<fileslength;i++){entry=new Entry();entry._worker=worker;if(data.view.getUint32(index)!=0x504b0102){onerror(ERR_BAD_FORMAT);return;}readCommonHeader(entry,data,index+6,true,onerror);entry.commentLength=data.view.getUint16(index+32,true);entry.directory=(data.view.getUint8(index+38)&0x10)==0x10;entry.offset=data.view.getUint32(index+42,true);filename=getString(data.array.subarray(index+46,index+46+entry.filenameLength));entry.filename=(entry.bitFlag&0x0800)===0x0800?decodeUTF8(filename):decodeASCII(filename);if(!entry.directory&&entry.filename.charAt(entry.filename.length-1)=="/")entry.directory=true;comment=getString(data.array.subarray(index+46+entry.filenameLength+entry.extraFieldLength,index+46+entry.filenameLength+entry.extraFieldLength+entry.commentLength));entry.comment=(entry.bitFlag&0x0800)===0x0800?decodeUTF8(comment):decodeASCII(comment);entries.push(entry);index+=46+entry.filenameLength+entry.extraFieldLength+entry.commentLength;}callback(entries);},function(){onerror(ERR_READ);});});},close:function(callback){if(this._worker){this._worker.terminate();this._worker=null;}if(callback)callback();},_worker:null};if(!obj.zip.useWebWorkers)callback(zipReader);else{createWorker('inflater',function(worker){zipReader._worker=worker;callback(zipReader);},function(err){onerror(err);});}}// ZipWriter
function encodeUTF8(string){return unescape(encodeURIComponent(string));}function getBytes(str){var i,array=[];for(i=0;i<str.length;i++)array.push(str.charCodeAt(i));return array;}function createZipWriter(writer,callback,onerror,dontDeflate){var files={},filenames=[],datalength=0;var deflateSN=0;function onwriteerror(err){onerror(err||ERR_WRITE);}function onreaderror(err){onerror(err||ERR_READ_DATA);}var zipWriter={add:function(name,reader,onend,onprogress,options){var header,filename,date;var worker=this._worker;function writeHeader(callback){var data;date=options.lastModDate||new Date();header=getDataHelper(26);files[name]={headerArray:header.array,directory:options.directory,filename:filename,offset:datalength,comment:getBytes(encodeUTF8(options.comment||""))};header.view.setUint32(0,0x14000808);if(options.version)header.view.setUint8(0,options.version);if(!dontDeflate&&options.level!==0&&!options.directory)header.view.setUint16(4,0x0800);header.view.setUint16(6,(date.getHours()<<6|date.getMinutes())<<5|date.getSeconds()/2,true);header.view.setUint16(8,(date.getFullYear()-1980<<4|date.getMonth()+1)<<5|date.getDate(),true);header.view.setUint16(22,filename.length,true);data=getDataHelper(30+filename.length);data.view.setUint32(0,0x504b0304);data.array.set(header.array,4);data.array.set(filename,30);datalength+=data.array.length;writer.writeUint8Array(data.array,callback,onwriteerror);}function writeFooter(compressedLength,crc32){var footer=getDataHelper(16);datalength+=compressedLength||0;footer.view.setUint32(0,0x504b0708);if(typeof crc32!="undefined"){header.view.setUint32(10,crc32,true);footer.view.setUint32(4,crc32,true);}if(reader){footer.view.setUint32(8,compressedLength,true);header.view.setUint32(14,compressedLength,true);footer.view.setUint32(12,reader.size,true);header.view.setUint32(18,reader.size,true);}writer.writeUint8Array(footer.array,function(){datalength+=16;onend();},onwriteerror);}function writeFile(){options=options||{};name=name.trim();if(options.directory&&name.charAt(name.length-1)!="/")name+="/";if(files.hasOwnProperty(name)){onerror(ERR_DUPLICATED_NAME);return;}filename=getBytes(encodeUTF8(name));filenames.push(name);writeHeader(function(){if(reader){if(dontDeflate||options.level===0)copy(worker,deflateSN++,reader,writer,0,reader.size,true,writeFooter,onprogress,onreaderror,onwriteerror);else deflate(worker,deflateSN++,reader,writer,options.level,writeFooter,onprogress,onreaderror,onwriteerror);}else writeFooter();},onwriteerror);}if(reader)reader.init(writeFile,onreaderror);else writeFile();},close:function(callback){if(this._worker){this._worker.terminate();this._worker=null;}var data,length=0,index=0,indexFilename,file;for(indexFilename=0;indexFilename<filenames.length;indexFilename++){file=files[filenames[indexFilename]];length+=46+file.filename.length+file.comment.length;}data=getDataHelper(length+22);for(indexFilename=0;indexFilename<filenames.length;indexFilename++){file=files[filenames[indexFilename]];data.view.setUint32(index,0x504b0102);data.view.setUint16(index+4,0x1400);data.array.set(file.headerArray,index+6);data.view.setUint16(index+32,file.comment.length,true);if(file.directory)data.view.setUint8(index+38,0x10);data.view.setUint32(index+42,file.offset,true);data.array.set(file.filename,index+46);data.array.set(file.comment,index+46+file.filename.length);index+=46+file.filename.length+file.comment.length;}data.view.setUint32(index,0x504b0506);data.view.setUint16(index+8,filenames.length,true);data.view.setUint16(index+10,filenames.length,true);data.view.setUint32(index+12,length,true);data.view.setUint32(index+16,datalength,true);writer.writeUint8Array(data.array,function(){writer.getData(callback);},onwriteerror);},_worker:null};if(!obj.zip.useWebWorkers)callback(zipWriter);else{createWorker('deflater',function(worker){zipWriter._worker=worker;callback(zipWriter);},function(err){onerror(err);});}}function resolveURLs(urls){var a=document.createElement('a');return urls.map(function(url){a.href=url;return a.href;});}var DEFAULT_WORKER_SCRIPTS={deflater:['z-worker.js','deflate.js'],inflater:['z-worker.js','inflate.js']};function createWorker(type,callback,onerror){if(obj.zip.workerScripts!==null&&obj.zip.workerScriptsPath!==null){onerror(new Error('Either zip.workerScripts or zip.workerScriptsPath may be set, not both.'));return;}var scripts;if(obj.zip.workerScripts){scripts=obj.zip.workerScripts[type];if(!Array.isArray(scripts)){onerror(new Error('zip.workerScripts.'+type+' is not an array!'));return;}scripts=resolveURLs(scripts);}else{scripts=DEFAULT_WORKER_SCRIPTS[type].slice(0);scripts[0]=(obj.zip.workerScriptsPath||'')+scripts[0];}var worker=new Worker(scripts[0]);// record total consumed time by inflater/deflater/crc32 in this worker
worker.codecTime=worker.crcTime=0;worker.postMessage({type:'importScripts',scripts:scripts.slice(1)});worker.addEventListener('message',onmessage);function onmessage(ev){var msg=ev.data;if(msg.error){worker.terminate();// should before onerror(), because onerror() may throw.
onerror(msg.error);return;}if(msg.type==='importScripts'){worker.removeEventListener('message',onmessage);worker.removeEventListener('error',errorHandler);callback(worker);}}// catch entry script loading error and other unhandled errors
worker.addEventListener('error',errorHandler);function errorHandler(err){worker.terminate();onerror(err);}}function onerror_default(error){console.error(error);}obj.zip={Reader:Reader,Writer:Writer,BlobReader:BlobReader,Data64URIReader:Data64URIReader,TextReader:TextReader,BlobWriter:BlobWriter,Data64URIWriter:Data64URIWriter,TextWriter:TextWriter,createReader:function(reader,callback,onerror){onerror=onerror||onerror_default;reader.init(function(){createZipReader(reader,callback,onerror);},onerror);},createWriter:function(writer,callback,onerror,dontDeflate){onerror=onerror||onerror_default;dontDeflate=!!dontDeflate;writer.init(function(){createZipWriter(writer,callback,onerror,dontDeflate);},onerror);},useWebWorkers:true,/**
* Directory containing the default worker scripts (z-worker.js, deflate.js, and inflate.js), relative to current base url.
* E.g.: zip.workerScripts = './';
*/workerScriptsPath:null,/**
* Advanced option to control which scripts are loaded in the Web worker. If this option is specified, then workerScriptsPath must not be set.
* workerScripts.deflater/workerScripts.inflater should be arrays of urls to scripts for deflater/inflater, respectively.
* Scripts in the array are executed in order, and the first one should be z-worker.js, which is used to start the worker.
* All urls are relative to current base url.
* E.g.:
* zip.workerScripts = {
*   deflater: ['z-worker.js', 'deflate.js'],
*   inflater: ['z-worker.js', 'inflate.js']
* };
*/workerScripts:null};})(this);// -------- zip-ext.js --------
/*
Copyright (c) 2013 Gildas Lormeau. All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in
the documentation and/or other materials provided with the distribution.
3. The names of the authors may not be used to endorse or promote products
derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/(function(){"use strict";var ERR_NOT_FOUND="ZIP file not found.";var ERR_HTTP_RANGE="HTTP Range not supported.";var Reader=zip.Reader;var Writer=zip.Writer;var ZipDirectoryEntry;var appendABViewSupported;try{appendABViewSupported=new Blob([new DataView(new ArrayBuffer(0))]).size===0;}catch(e){}function HttpReader(url){var that=this;function getData(callback,onerror){var request;if(!that.data){request=new XMLHttpRequest();request.addEventListener("load",function(){// console.log("Zip GET load event called. Status "+request.status);
if(!that.size)that.size=Number(request.getResponseHeader("Content-Length"))||Number(request.response.byteLength);that.data=new Uint8Array(request.response);callback();},false);request.addEventListener("error",onerror,false);request.open("GET",url);request.responseType="arraybuffer";request.send();}else callback();}function init(callback,onerror){var request=new XMLHttpRequest();request.addEventListener("load",function(){// console.log("Zip HEAD load event called. Status "+request.status);
// Other codes will end up with a format error probably
if(request.status==404){onerror(ERR_NOT_FOUND);}else{that.size=Number(request.getResponseHeader("Content-Length"));// If response header doesn't return size then prefetch the content.
if(!that.size){// console.log("Zip HEAD load event called: No size");
getData(callback,onerror);}else{callback();}}},false);request.addEventListener("error",onerror,false);request.open("HEAD",url);request.send();}function readUint8Array(index,length,callback,onerror){getData(function(){callback(new Uint8Array(that.data.subarray(index,index+length)));},onerror);}that.size=0;that.init=init;that.readUint8Array=readUint8Array;}HttpReader.prototype=new Reader();HttpReader.prototype.constructor=HttpReader;function HttpRangeReader(url){var that=this;function init(callback,onerror){var request=new XMLHttpRequest();request.addEventListener("load",function(){that.size=Number(request.getResponseHeader("Content-Length"));if(request.getResponseHeader("Accept-Ranges")=="bytes")callback();else onerror(ERR_HTTP_RANGE);},false);request.addEventListener("error",onerror,false);request.open("HEAD",url);request.send();}function readArrayBuffer(index,length,callback,onerror){var request=new XMLHttpRequest();request.open("GET",url);request.responseType="arraybuffer";request.setRequestHeader("Range","bytes="+index+"-"+(index+length-1));request.addEventListener("load",function(){callback(request.response);},false);request.addEventListener("error",onerror,false);request.send();}function readUint8Array(index,length,callback,onerror){readArrayBuffer(index,length,function(arraybuffer){callback(new Uint8Array(arraybuffer));},onerror);}that.size=0;that.init=init;that.readUint8Array=readUint8Array;}HttpRangeReader.prototype=new Reader();HttpRangeReader.prototype.constructor=HttpRangeReader;function ArrayBufferReader(arrayBuffer){var that=this;function init(callback,onerror){that.size=arrayBuffer.byteLength;callback();}function readUint8Array(index,length,callback,onerror){callback(new Uint8Array(arrayBuffer.slice(index,index+length)));}that.size=0;that.init=init;that.readUint8Array=readUint8Array;}ArrayBufferReader.prototype=new Reader();ArrayBufferReader.prototype.constructor=ArrayBufferReader;function ArrayBufferWriter(){var array,that=this;function init(callback,onerror){array=new Uint8Array();callback();}function writeUint8Array(arr,callback,onerror){var tmpArray=new Uint8Array(array.length+arr.length);tmpArray.set(array);tmpArray.set(arr,array.length);array=tmpArray;callback();}function getData(callback){callback(array.buffer);}that.init=init;that.writeUint8Array=writeUint8Array;that.getData=getData;}ArrayBufferWriter.prototype=new Writer();ArrayBufferWriter.prototype.constructor=ArrayBufferWriter;function FileWriter(fileEntry,contentType){var writer,that=this;function init(callback,onerror){fileEntry.createWriter(function(fileWriter){writer=fileWriter;callback();},onerror);}function writeUint8Array(array,callback,onerror){var blob=new Blob([appendABViewSupported?array:array.buffer],{type:contentType});writer.onwrite=function(){writer.onwrite=null;callback();};writer.onerror=onerror;writer.write(blob);}function getData(callback){fileEntry.file(callback);}that.init=init;that.writeUint8Array=writeUint8Array;that.getData=getData;}FileWriter.prototype=new Writer();FileWriter.prototype.constructor=FileWriter;zip.FileWriter=FileWriter;zip.HttpReader=HttpReader;zip.HttpRangeReader=HttpRangeReader;zip.ArrayBufferReader=ArrayBufferReader;zip.ArrayBufferWriter=ArrayBufferWriter;if(zip.fs){ZipDirectoryEntry=zip.fs.ZipDirectoryEntry;ZipDirectoryEntry.prototype.addHttpContent=function(name,URL,useRangeHeader){function addChild(parent,name,params,directory){if(parent.directory)return directory?new ZipDirectoryEntry(parent.fs,name,params,parent):new zip.fs.ZipFileEntry(parent.fs,name,params,parent);else throw"Parent entry is not a directory.";}return addChild(this,name,{data:URL,Reader:useRangeHeader?HttpRangeReader:HttpReader});};ZipDirectoryEntry.prototype.importHttpContent=function(URL,useRangeHeader,onend,onerror){this.importZip(useRangeHeader?new HttpRangeReader(URL):new HttpReader(URL),onend,onerror);};zip.fs.FS.prototype.importHttpContent=function(URL,useRangeHeader,onend,onerror){this.entries=[];this.root=new ZipDirectoryEntry(this);this.root.importHttpContent(URL,useRangeHeader,onend,onerror);};}})();// -------- zip-dv-ext.js --------
/*
Copyright (c) 2013 Gildas Lormeau. All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in
the documentation and/or other materials provided with the distribution.
3. The names of the authors may not be used to endorse or promote products
derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/(function(){"use strict";// Repeated to avoid changing zip.js to expose it
function getDataHelper(byteLength,bytes){var dataBuffer,dataArray;dataBuffer=new ArrayBuffer(byteLength);dataArray=new Uint8Array(dataBuffer);if(bytes)dataArray.set(bytes,0);return{buffer:dataBuffer,array:dataArray,view:new DataView(dataBuffer)};}// Extension to the set of Writers -- DataViewWriter. Presumably by RE.
function DataViewWriter(byteLength){var data,offset,that=this;function init(callback,onerror){data=getDataHelper(byteLength);offset=0;callback();}function writeUint8Array(array,callback,onerror){//window.console.log("Adding byte range ["+offset+".."+(offset+array.byteLength)+")");
data.array.set(array,offset);offset+=array.byteLength;callback();}function getData(callback){callback(data.view);}that.init=init;that.writeUint8Array=writeUint8Array;that.getData=getData;}DataViewWriter.prototype=new zip.Writer();DataViewWriter.prototype.constructor=DataViewWriter;zip.DataViewWriter=DataViewWriter;})();// -------- inflate.js --------
/*
Copyright (c) 2013 Gildas Lormeau. All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright 
notice, this list of conditions and the following disclaimer in 
the documentation and/or other materials provided with the distribution.
3. The names of the authors may not be used to endorse or promote products
derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/ /*
* This program is based on JZlib 1.0.2 ymnk, JCraft,Inc.
* JZlib is based on zlib-1.1.3, so all credit should go authors
* Jean-loup Gailly(jloup@gzip.org) and Mark Adler(madler@alumni.caltech.edu)
* and contributors of zlib.
*/(function(global){"use strict";// Global
var MAX_BITS=15;var Z_OK=0;var Z_STREAM_END=1;var Z_NEED_DICT=2;var Z_STREAM_ERROR=-2;var Z_DATA_ERROR=-3;var Z_MEM_ERROR=-4;var Z_BUF_ERROR=-5;var inflate_mask=[0x00000000,0x00000001,0x00000003,0x00000007,0x0000000f,0x0000001f,0x0000003f,0x0000007f,0x000000ff,0x000001ff,0x000003ff,0x000007ff,0x00000fff,0x00001fff,0x00003fff,0x00007fff,0x0000ffff];var MANY=1440;// JZlib version : "1.0.2"
var Z_NO_FLUSH=0;var Z_FINISH=4;// InfTree
var fixed_bl=9;var fixed_bd=5;var fixed_tl=[96,7,256,0,8,80,0,8,16,84,8,115,82,7,31,0,8,112,0,8,48,0,9,192,80,7,10,0,8,96,0,8,32,0,9,160,0,8,0,0,8,128,0,8,64,0,9,224,80,7,6,0,8,88,0,8,24,0,9,144,83,7,59,0,8,120,0,8,56,0,9,208,81,7,17,0,8,104,0,8,40,0,9,176,0,8,8,0,8,136,0,8,72,0,9,240,80,7,4,0,8,84,0,8,20,85,8,227,83,7,43,0,8,116,0,8,52,0,9,200,81,7,13,0,8,100,0,8,36,0,9,168,0,8,4,0,8,132,0,8,68,0,9,232,80,7,8,0,8,92,0,8,28,0,9,152,84,7,83,0,8,124,0,8,60,0,9,216,82,7,23,0,8,108,0,8,44,0,9,184,0,8,12,0,8,140,0,8,76,0,9,248,80,7,3,0,8,82,0,8,18,85,8,163,83,7,35,0,8,114,0,8,50,0,9,196,81,7,11,0,8,98,0,8,34,0,9,164,0,8,2,0,8,130,0,8,66,0,9,228,80,7,7,0,8,90,0,8,26,0,9,148,84,7,67,0,8,122,0,8,58,0,9,212,82,7,19,0,8,106,0,8,42,0,9,180,0,8,10,0,8,138,0,8,74,0,9,244,80,7,5,0,8,86,0,8,22,192,8,0,83,7,51,0,8,118,0,8,54,0,9,204,81,7,15,0,8,102,0,8,38,0,9,172,0,8,6,0,8,134,0,8,70,0,9,236,80,7,9,0,8,94,0,8,30,0,9,156,84,7,99,0,8,126,0,8,62,0,9,220,82,7,27,0,8,110,0,8,46,0,9,188,0,8,14,0,8,142,0,8,78,0,9,252,96,7,256,0,8,81,0,8,17,85,8,131,82,7,31,0,8,113,0,8,49,0,9,194,80,7,10,0,8,97,0,8,33,0,9,162,0,8,1,0,8,129,0,8,65,0,9,226,80,7,6,0,8,89,0,8,25,0,9,146,83,7,59,0,8,121,0,8,57,0,9,210,81,7,17,0,8,105,0,8,41,0,9,178,0,8,9,0,8,137,0,8,73,0,9,242,80,7,4,0,8,85,0,8,21,80,8,258,83,7,43,0,8,117,0,8,53,0,9,202,81,7,13,0,8,101,0,8,37,0,9,170,0,8,5,0,8,133,0,8,69,0,9,234,80,7,8,0,8,93,0,8,29,0,9,154,84,7,83,0,8,125,0,8,61,0,9,218,82,7,23,0,8,109,0,8,45,0,9,186,0,8,13,0,8,141,0,8,77,0,9,250,80,7,3,0,8,83,0,8,19,85,8,195,83,7,35,0,8,115,0,8,51,0,9,198,81,7,11,0,8,99,0,8,35,0,9,166,0,8,3,0,8,131,0,8,67,0,9,230,80,7,7,0,8,91,0,8,27,0,9,150,84,7,67,0,8,123,0,8,59,0,9,214,82,7,19,0,8,107,0,8,43,0,9,182,0,8,11,0,8,139,0,8,75,0,9,246,80,7,5,0,8,87,0,8,23,192,8,0,83,7,51,0,8,119,0,8,55,0,9,206,81,7,15,0,8,103,0,8,39,0,9,174,0,8,7,0,8,135,0,8,71,0,9,238,80,7,9,0,8,95,0,8,31,0,9,158,84,7,99,0,8,127,0,8,63,0,9,222,82,7,27,0,8,111,0,8,47,0,9,190,0,8,15,0,8,143,0,8,79,0,9,254,96,7,256,0,8,80,0,8,16,84,8,115,82,7,31,0,8,112,0,8,48,0,9,193,80,7,10,0,8,96,0,8,32,0,9,161,0,8,0,0,8,128,0,8,64,0,9,225,80,7,6,0,8,88,0,8,24,0,9,145,83,7,59,0,8,120,0,8,56,0,9,209,81,7,17,0,8,104,0,8,40,0,9,177,0,8,8,0,8,136,0,8,72,0,9,241,80,7,4,0,8,84,0,8,20,85,8,227,83,7,43,0,8,116,0,8,52,0,9,201,81,7,13,0,8,100,0,8,36,0,9,169,0,8,4,0,8,132,0,8,68,0,9,233,80,7,8,0,8,92,0,8,28,0,9,153,84,7,83,0,8,124,0,8,60,0,9,217,82,7,23,0,8,108,0,8,44,0,9,185,0,8,12,0,8,140,0,8,76,0,9,249,80,7,3,0,8,82,0,8,18,85,8,163,83,7,35,0,8,114,0,8,50,0,9,197,81,7,11,0,8,98,0,8,34,0,9,165,0,8,2,0,8,130,0,8,66,0,9,229,80,7,7,0,8,90,0,8,26,0,9,149,84,7,67,0,8,122,0,8,58,0,9,213,82,7,19,0,8,106,0,8,42,0,9,181,0,8,10,0,8,138,0,8,74,0,9,245,80,7,5,0,8,86,0,8,22,192,8,0,83,7,51,0,8,118,0,8,54,0,9,205,81,7,15,0,8,102,0,8,38,0,9,173,0,8,6,0,8,134,0,8,70,0,9,237,80,7,9,0,8,94,0,8,30,0,9,157,84,7,99,0,8,126,0,8,62,0,9,221,82,7,27,0,8,110,0,8,46,0,9,189,0,8,14,0,8,142,0,8,78,0,9,253,96,7,256,0,8,81,0,8,17,85,8,131,82,7,31,0,8,113,0,8,49,0,9,195,80,7,10,0,8,97,0,8,33,0,9,163,0,8,1,0,8,129,0,8,65,0,9,227,80,7,6,0,8,89,0,8,25,0,9,147,83,7,59,0,8,121,0,8,57,0,9,211,81,7,17,0,8,105,0,8,41,0,9,179,0,8,9,0,8,137,0,8,73,0,9,243,80,7,4,0,8,85,0,8,21,80,8,258,83,7,43,0,8,117,0,8,53,0,9,203,81,7,13,0,8,101,0,8,37,0,9,171,0,8,5,0,8,133,0,8,69,0,9,235,80,7,8,0,8,93,0,8,29,0,9,155,84,7,83,0,8,125,0,8,61,0,9,219,82,7,23,0,8,109,0,8,45,0,9,187,0,8,13,0,8,141,0,8,77,0,9,251,80,7,3,0,8,83,0,8,19,85,8,195,83,7,35,0,8,115,0,8,51,0,9,199,81,7,11,0,8,99,0,8,35,0,9,167,0,8,3,0,8,131,0,8,67,0,9,231,80,7,7,0,8,91,0,8,27,0,9,151,84,7,67,0,8,123,0,8,59,0,9,215,82,7,19,0,8,107,0,8,43,0,9,183,0,8,11,0,8,139,0,8,75,0,9,247,80,7,5,0,8,87,0,8,23,192,8,0,83,7,51,0,8,119,0,8,55,0,9,207,81,7,15,0,8,103,0,8,39,0,9,175,0,8,7,0,8,135,0,8,71,0,9,239,80,7,9,0,8,95,0,8,31,0,9,159,84,7,99,0,8,127,0,8,63,0,9,223,82,7,27,0,8,111,0,8,47,0,9,191,0,8,15,0,8,143,0,8,79,0,9,255];var fixed_td=[80,5,1,87,5,257,83,5,17,91,5,4097,81,5,5,89,5,1025,85,5,65,93,5,16385,80,5,3,88,5,513,84,5,33,92,5,8193,82,5,9,90,5,2049,86,5,129,192,5,24577,80,5,2,87,5,385,83,5,25,91,5,6145,81,5,7,89,5,1537,85,5,97,93,5,24577,80,5,4,88,5,769,84,5,49,92,5,12289,82,5,13,90,5,3073,86,5,193,192,5,24577];// Tables for deflate from PKZIP's appnote.txt.
var cplens=[// Copy lengths for literal codes 257..285
3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0];// see note #13 above about 258
var cplext=[// Extra bits for literal codes 257..285
0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,112,112// 112==invalid
];var cpdist=[// Copy offsets for distance codes 0..29
1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];var cpdext=[// Extra bits for distance codes
0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];// If BMAX needs to be larger than 16, then h and x[] should be uLong.
var BMAX=15;// maximum bit length of any code
function InfTree(){var that=this;var hn;// hufts used in space
var v;// work area for huft_build
var c;// bit length count table
var r;// table entry for structure assignment
var u;// table stack
var x;// bit offsets, then code stack
function huft_build(b,// code lengths in bits (all assumed <=
// BMAX)
bindex,n,// number of codes (assumed <= 288)
s,// number of simple-valued codes (0..s-1)
d,// list of base values for non-simple codes
e,// list of extra bits for non-simple codes
t,// result: starting table
m,// maximum lookup bits, returns actual
hp,// space for trees
hn,// hufts used in space
v// working area: values in order of bit length
){// Given a list of code lengths and a maximum table size, make a set of
// tables to decode that set of codes. Return Z_OK on success,
// Z_BUF_ERROR
// if the given code set is incomplete (the tables are still built in
// this
// case), Z_DATA_ERROR if the input is invalid (an over-subscribed set
// of
// lengths), or Z_MEM_ERROR if not enough memory.
var a;// counter for codes of length k
var f;// i repeats in table every f entries
var g;// maximum code length
var h;// table level
var i;// counter, current code
var j;// counter
var k;// number of bits in current code
var l;// bits per table (returned in m)
var mask;// (1 << w) - 1, to avoid cc -O bug on HP
var p;// pointer into c[], b[], or v[]
var q;// points to current table
var w;// bits before this table == (l * h)
var xp;// pointer into x
var y;// number of dummy codes added
var z;// number of entries in current table
// Generate counts for each bit length
p=0;i=n;do{c[b[bindex+p]]++;p++;i--;// assume all entries <= BMAX
}while(i!==0);if(c[0]==n){// null input--all zero length codes
t[0]=-1;m[0]=0;return Z_OK;}// Find minimum and maximum length, bound *m by those
l=m[0];for(j=1;j<=BMAX;j++)if(c[j]!==0)break;k=j;// minimum code length
if(l<j){l=j;}for(i=BMAX;i!==0;i--){if(c[i]!==0)break;}g=i;// maximum code length
if(l>i){l=i;}m[0]=l;// Adjust last length count to fill out codes, if needed
for(y=1<<j;j<i;j++,y<<=1){if((y-=c[j])<0){return Z_DATA_ERROR;}}if((y-=c[i])<0){return Z_DATA_ERROR;}c[i]+=y;// Generate starting offsets into the value table for each length
x[1]=j=0;p=1;xp=2;while(--i!==0){// note that i == g from above
x[xp]=j+=c[p];xp++;p++;}// Make a table of values in order of bit lengths
i=0;p=0;do{if((j=b[bindex+p])!==0){v[x[j]++]=i;}p++;}while(++i<n);n=x[g];// set n to length of v
// Generate the Huffman codes and for each, make the table entries
x[0]=i=0;// first Huffman code is zero
p=0;// grab values in bit order
h=-1;// no tables yet--level -1
w=-l;// bits decoded == (l * h)
u[0]=0;// just to keep compilers happy
q=0;// ditto
z=0;// ditto
// go through the bit lengths (k already is bits in shortest code)
for(;k<=g;k++){a=c[k];while(a--!==0){// here i is the Huffman code of length k bits for value *p
// make tables up to required level
while(k>w+l){h++;w+=l;// previous table always l bits
// compute minimum size table less than or equal to l bits
z=g-w;z=z>l?l:z;// table size upper limit
if((f=1<<(j=k-w))>a+1){// try a k-w bit table
// too few codes for
// k-w bit table
f-=a+1;// deduct codes from patterns left
xp=k;if(j<z){while(++j<z){// try smaller tables up to z bits
if((f<<=1)<=c[++xp])break;// enough codes to use up j bits
f-=c[xp];// else deduct codes from patterns
}}}z=1<<j;// table entries for j-bit table
// allocate new table
if(hn[0]+z>MANY){// (note: doesn't matter for fixed)
return Z_DATA_ERROR;// overflow of MANY
}u[h]=q=/* hp+ */hn[0];// DEBUG
hn[0]+=z;// connect to last table, if there is one
if(h!==0){x[h]=i;// save pattern for backing up
r[0]=/* (byte) */j;// bits in this table
r[1]=/* (byte) */l;// bits to dump before this table
j=i>>>w-l;r[2]=/* (int) */q-u[h-1]-j;// offset to this table
hp.set(r,(u[h-1]+j)*3);// to
// last
// table
}else{t[0]=q;// first table is returned result
}}// set up table entry in r
r[1]=/* (byte) */k-w;if(p>=n){r[0]=128+64;// out of values--invalid code
}else if(v[p]<s){r[0]=/* (byte) */v[p]<256?0:32+64;// 256 is
// end-of-block
r[2]=v[p++];// simple code is just the value
}else{r[0]=/* (byte) */e[v[p]-s]+16+64;// non-simple--look
// up in lists
r[2]=d[v[p++]-s];}// fill code-like entries with r
f=1<<k-w;for(j=i>>>w;j<z;j+=f){hp.set(r,(q+j)*3);}// backwards increment the k-bit code i
for(j=1<<k-1;(i&j)!==0;j>>>=1){i^=j;}i^=j;// backup over finished tables
mask=(1<<w)-1;// needed on HP, cc -O bug
while((i&mask)!=x[h]){h--;// don't need to update q
w-=l;mask=(1<<w)-1;}}}// Return Z_BUF_ERROR if we were given an incomplete table
return y!==0&&g!=1?Z_BUF_ERROR:Z_OK;}function initWorkArea(vsize){var i;if(!hn){hn=[];// []; //new Array(1);
v=[];// new Array(vsize);
c=new Int32Array(BMAX+1);// new Array(BMAX + 1);
r=[];// new Array(3);
u=new Int32Array(BMAX);// new Array(BMAX);
x=new Int32Array(BMAX+1);// new Array(BMAX + 1);
}if(v.length<vsize){v=[];// new Array(vsize);
}for(i=0;i<vsize;i++){v[i]=0;}for(i=0;i<BMAX+1;i++){c[i]=0;}for(i=0;i<3;i++){r[i]=0;}// for(int i=0; i<BMAX; i++){u[i]=0;}
u.set(c.subarray(0,BMAX),0);// for(int i=0; i<BMAX+1; i++){x[i]=0;}
x.set(c.subarray(0,BMAX+1),0);}that.inflate_trees_bits=function(c,// 19 code lengths
bb,// bits tree desired/actual depth
tb,// bits tree result
hp,// space for trees
z// for messages
){var result;initWorkArea(19);hn[0]=0;result=huft_build(c,0,19,19,null,null,tb,bb,hp,hn,v);if(result==Z_DATA_ERROR){z.msg="oversubscribed dynamic bit lengths tree";}else if(result==Z_BUF_ERROR||bb[0]===0){z.msg="incomplete dynamic bit lengths tree";result=Z_DATA_ERROR;}return result;};that.inflate_trees_dynamic=function(nl,// number of literal/length codes
nd,// number of distance codes
c,// that many (total) code lengths
bl,// literal desired/actual bit depth
bd,// distance desired/actual bit depth
tl,// literal/length tree result
td,// distance tree result
hp,// space for trees
z// for messages
){var result;// build literal/length tree
initWorkArea(288);hn[0]=0;result=huft_build(c,0,nl,257,cplens,cplext,tl,bl,hp,hn,v);if(result!=Z_OK||bl[0]===0){if(result==Z_DATA_ERROR){z.msg="oversubscribed literal/length tree";}else if(result!=Z_MEM_ERROR){z.msg="incomplete literal/length tree";result=Z_DATA_ERROR;}return result;}// build distance tree
initWorkArea(288);result=huft_build(c,nl,nd,0,cpdist,cpdext,td,bd,hp,hn,v);if(result!=Z_OK||bd[0]===0&&nl>257){if(result==Z_DATA_ERROR){z.msg="oversubscribed distance tree";}else if(result==Z_BUF_ERROR){z.msg="incomplete distance tree";result=Z_DATA_ERROR;}else if(result!=Z_MEM_ERROR){z.msg="empty distance tree with lengths";result=Z_DATA_ERROR;}return result;}return Z_OK;};}InfTree.inflate_trees_fixed=function(bl,// literal desired/actual bit depth
bd,// distance desired/actual bit depth
tl,// literal/length tree result
td// distance tree result
){bl[0]=fixed_bl;bd[0]=fixed_bd;tl[0]=fixed_tl;td[0]=fixed_td;return Z_OK;};// InfCodes
// waiting for "i:"=input,
// "o:"=output,
// "x:"=nothing
var START=0;// x: set up for LEN
var LEN=1;// i: get length/literal/eob next
var LENEXT=2;// i: getting length extra (have base)
var DIST=3;// i: get distance next
var DISTEXT=4;// i: getting distance extra
var COPY=5;// o: copying bytes in window, waiting
// for space
var LIT=6;// o: got literal, waiting for output
// space
var WASH=7;// o: got eob, possibly still output
// waiting
var END=8;// x: got eob and all data flushed
var BADCODE=9;// x: got error
function InfCodes(){var that=this;var mode;// current inflate_codes mode
// mode dependent information
var len=0;var tree;// pointer into tree
var tree_index=0;var need=0;// bits needed
var lit=0;// if EXT or COPY, where and how much
var get=0;// bits to get for extra
var dist=0;// distance back to copy from
var lbits=0;// ltree bits decoded per branch
var dbits=0;// dtree bits decoder per branch
var ltree;// literal/length/eob tree
var ltree_index=0;// literal/length/eob tree
var dtree;// distance tree
var dtree_index=0;// distance tree
// Called with number of bytes left to write in window at least 258
// (the maximum string length) and number of input bytes available
// at least ten. The ten bytes are six bytes for the longest length/
// distance pair plus four bytes for overloading the bit buffer.
function inflate_fast(bl,bd,tl,tl_index,td,td_index,s,z){var t;// temporary pointer
var tp;// temporary pointer
var tp_index;// temporary pointer
var e;// extra bits or operation
var b;// bit buffer
var k;// bits in bit buffer
var p;// input data pointer
var n;// bytes available there
var q;// output window write pointer
var m;// bytes to end of window or read pointer
var ml;// mask for literal/length tree
var md;// mask for distance tree
var c;// bytes to copy
var d;// distance back to copy from
var r;// copy source pointer
var tp_index_t_3;// (tp_index+t)*3
// load input, output, bit values
p=z.next_in_index;n=z.avail_in;b=s.bitb;k=s.bitk;q=s.write;m=q<s.read?s.read-q-1:s.end-q;// initialize masks
ml=inflate_mask[bl];md=inflate_mask[bd];// do until not enough input or output space for fast loop
do{// assume called with m >= 258 && n >= 10
// get literal/length code
while(k<20){// max bits for literal/length code
n--;b|=(z.read_byte(p++)&0xff)<<k;k+=8;}t=b&ml;tp=tl;tp_index=tl_index;tp_index_t_3=(tp_index+t)*3;if((e=tp[tp_index_t_3])===0){b>>=tp[tp_index_t_3+1];k-=tp[tp_index_t_3+1];s.window[q++]=/* (byte) */tp[tp_index_t_3+2];m--;continue;}do{b>>=tp[tp_index_t_3+1];k-=tp[tp_index_t_3+1];if((e&16)!==0){e&=15;c=tp[tp_index_t_3+2]+(/* (int) */b&inflate_mask[e]);b>>=e;k-=e;// decode distance base of block to copy
while(k<15){// max bits for distance code
n--;b|=(z.read_byte(p++)&0xff)<<k;k+=8;}t=b&md;tp=td;tp_index=td_index;tp_index_t_3=(tp_index+t)*3;e=tp[tp_index_t_3];do{b>>=tp[tp_index_t_3+1];k-=tp[tp_index_t_3+1];if((e&16)!==0){// get extra bits to add to distance base
e&=15;while(k<e){// get extra bits (up to 13)
n--;b|=(z.read_byte(p++)&0xff)<<k;k+=8;}d=tp[tp_index_t_3+2]+(b&inflate_mask[e]);b>>=e;k-=e;// do the copy
m-=c;if(q>=d){// offset before dest
// just copy
r=q-d;if(q-r>0&&2>q-r){s.window[q++]=s.window[r++];// minimum
// count is
// three,
s.window[q++]=s.window[r++];// so unroll
// loop a
// little
c-=2;}else{s.window.set(s.window.subarray(r,r+2),q);q+=2;r+=2;c-=2;}}else{// else offset after destination
r=q-d;do{r+=s.end;// force pointer in window
}while(r<0);// covers invalid distances
e=s.end-r;if(c>e){// if source crosses,
c-=e;// wrapped copy
if(q-r>0&&e>q-r){do{s.window[q++]=s.window[r++];}while(--e!==0);}else{s.window.set(s.window.subarray(r,r+e),q);q+=e;r+=e;e=0;}r=0;// copy rest from start of window
}}// copy all or what's left
if(q-r>0&&c>q-r){do{s.window[q++]=s.window[r++];}while(--c!==0);}else{s.window.set(s.window.subarray(r,r+c),q);q+=c;r+=c;c=0;}break;}else if((e&64)===0){t+=tp[tp_index_t_3+2];t+=b&inflate_mask[e];tp_index_t_3=(tp_index+t)*3;e=tp[tp_index_t_3];}else{z.msg="invalid distance code";c=z.avail_in-n;c=k>>3<c?k>>3:c;n+=c;p-=c;k-=c<<3;s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return Z_DATA_ERROR;}}while(true);break;}if((e&64)===0){t+=tp[tp_index_t_3+2];t+=b&inflate_mask[e];tp_index_t_3=(tp_index+t)*3;if((e=tp[tp_index_t_3])===0){b>>=tp[tp_index_t_3+1];k-=tp[tp_index_t_3+1];s.window[q++]=/* (byte) */tp[tp_index_t_3+2];m--;break;}}else if((e&32)!==0){c=z.avail_in-n;c=k>>3<c?k>>3:c;n+=c;p-=c;k-=c<<3;s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return Z_STREAM_END;}else{z.msg="invalid literal/length code";c=z.avail_in-n;c=k>>3<c?k>>3:c;n+=c;p-=c;k-=c<<3;s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return Z_DATA_ERROR;}}while(true);}while(m>=258&&n>=10);// not enough input or output--restore pointers and return
c=z.avail_in-n;c=k>>3<c?k>>3:c;n+=c;p-=c;k-=c<<3;s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return Z_OK;}that.init=function(bl,bd,tl,tl_index,td,td_index){mode=START;lbits=/* (byte) */bl;dbits=/* (byte) */bd;ltree=tl;ltree_index=tl_index;dtree=td;dtree_index=td_index;tree=null;};that.proc=function(s,z,r){var j;// temporary storage
var tindex;// temporary pointer
var e;// extra bits or operation
var b=0;// bit buffer
var k=0;// bits in bit buffer
var p=0;// input data pointer
var n;// bytes available there
var q;// output window write pointer
var m;// bytes to end of window or read pointer
var f;// pointer to copy strings from
// copy input/output information to locals (UPDATE macro restores)
p=z.next_in_index;n=z.avail_in;b=s.bitb;k=s.bitk;q=s.write;m=q<s.read?s.read-q-1:s.end-q;// process input and output based on current state
while(true){switch(mode){// waiting for "i:"=input, "o:"=output, "x:"=nothing
case START:// x: set up for LEN
if(m>=258&&n>=10){s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;r=inflate_fast(lbits,dbits,ltree,ltree_index,dtree,dtree_index,s,z);p=z.next_in_index;n=z.avail_in;b=s.bitb;k=s.bitk;q=s.write;m=q<s.read?s.read-q-1:s.end-q;if(r!=Z_OK){mode=r==Z_STREAM_END?WASH:BADCODE;break;}}need=lbits;tree=ltree;tree_index=ltree_index;mode=LEN;/* falls through */case LEN:// i: get length/literal/eob next
j=need;while(k<j){if(n!==0)r=Z_OK;else{s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return s.inflate_flush(z,r);}n--;b|=(z.read_byte(p++)&0xff)<<k;k+=8;}tindex=(tree_index+(b&inflate_mask[j]))*3;b>>>=tree[tindex+1];k-=tree[tindex+1];e=tree[tindex];if(e===0){// literal
lit=tree[tindex+2];mode=LIT;break;}if((e&16)!==0){// length
get=e&15;len=tree[tindex+2];mode=LENEXT;break;}if((e&64)===0){// next table
need=e;tree_index=tindex/3+tree[tindex+2];break;}if((e&32)!==0){// end of block
mode=WASH;break;}mode=BADCODE;// invalid code
z.msg="invalid literal/length code";r=Z_DATA_ERROR;s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return s.inflate_flush(z,r);case LENEXT:// i: getting length extra (have base)
j=get;while(k<j){if(n!==0)r=Z_OK;else{s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return s.inflate_flush(z,r);}n--;b|=(z.read_byte(p++)&0xff)<<k;k+=8;}len+=b&inflate_mask[j];b>>=j;k-=j;need=dbits;tree=dtree;tree_index=dtree_index;mode=DIST;/* falls through */case DIST:// i: get distance next
j=need;while(k<j){if(n!==0)r=Z_OK;else{s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return s.inflate_flush(z,r);}n--;b|=(z.read_byte(p++)&0xff)<<k;k+=8;}tindex=(tree_index+(b&inflate_mask[j]))*3;b>>=tree[tindex+1];k-=tree[tindex+1];e=tree[tindex];if((e&16)!==0){// distance
get=e&15;dist=tree[tindex+2];mode=DISTEXT;break;}if((e&64)===0){// next table
need=e;tree_index=tindex/3+tree[tindex+2];break;}mode=BADCODE;// invalid code
z.msg="invalid distance code";r=Z_DATA_ERROR;s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return s.inflate_flush(z,r);case DISTEXT:// i: getting distance extra
j=get;while(k<j){if(n!==0)r=Z_OK;else{s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return s.inflate_flush(z,r);}n--;b|=(z.read_byte(p++)&0xff)<<k;k+=8;}dist+=b&inflate_mask[j];b>>=j;k-=j;mode=COPY;/* falls through */case COPY:// o: copying bytes in window, waiting for space
f=q-dist;while(f<0){// modulo window size-"while" instead
f+=s.end;// of "if" handles invalid distances
}while(len!==0){if(m===0){if(q==s.end&&s.read!==0){q=0;m=q<s.read?s.read-q-1:s.end-q;}if(m===0){s.write=q;r=s.inflate_flush(z,r);q=s.write;m=q<s.read?s.read-q-1:s.end-q;if(q==s.end&&s.read!==0){q=0;m=q<s.read?s.read-q-1:s.end-q;}if(m===0){s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return s.inflate_flush(z,r);}}}s.window[q++]=s.window[f++];m--;if(f==s.end)f=0;len--;}mode=START;break;case LIT:// o: got literal, waiting for output space
if(m===0){if(q==s.end&&s.read!==0){q=0;m=q<s.read?s.read-q-1:s.end-q;}if(m===0){s.write=q;r=s.inflate_flush(z,r);q=s.write;m=q<s.read?s.read-q-1:s.end-q;if(q==s.end&&s.read!==0){q=0;m=q<s.read?s.read-q-1:s.end-q;}if(m===0){s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return s.inflate_flush(z,r);}}}r=Z_OK;s.window[q++]=/* (byte) */lit;m--;mode=START;break;case WASH:// o: got eob, possibly more output
if(k>7){// return unused byte, if any
k-=8;n++;p--;// can always return one
}s.write=q;r=s.inflate_flush(z,r);q=s.write;m=q<s.read?s.read-q-1:s.end-q;if(s.read!=s.write){s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return s.inflate_flush(z,r);}mode=END;/* falls through */case END:r=Z_STREAM_END;s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return s.inflate_flush(z,r);case BADCODE:// x: got error
r=Z_DATA_ERROR;s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return s.inflate_flush(z,r);default:r=Z_STREAM_ERROR;s.bitb=b;s.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;s.write=q;return s.inflate_flush(z,r);}}};that.free=function(){// ZFREE(z, c);
};}// InfBlocks
// Table for deflate from PKZIP's appnote.txt.
var border=[// Order of the bit length code lengths
16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];var TYPE=0;// get type bits (3, including end bit)
var LENS=1;// get lengths for stored
var STORED=2;// processing stored block
var TABLE=3;// get table lengths
var BTREE=4;// get bit lengths tree for a dynamic
// block
var DTREE=5;// get length, distance trees for a
// dynamic block
var CODES=6;// processing fixed or dynamic block
var DRY=7;// output remaining window bytes
var DONELOCKS=8;// finished last block, done
var BADBLOCKS=9;// ot a data error--stuck here
function InfBlocks(z,w){var that=this;var mode=TYPE;// current inflate_block mode
var left=0;// if STORED, bytes left to copy
var table=0;// table lengths (14 bits)
var index=0;// index into blens (or border)
var blens;// bit lengths of codes
var bb=[0];// bit length tree depth
var tb=[0];// bit length decoding tree
var codes=new InfCodes();// if CODES, current state
var last=0;// true if this block is the last block
var hufts=new Int32Array(MANY*3);// single malloc for tree space
var check=0;// check on output
var inftree=new InfTree();that.bitk=0;// bits in bit buffer
that.bitb=0;// bit buffer
that.window=new Uint8Array(w);// sliding window
that.end=w;// one byte after sliding window
that.read=0;// window read pointer
that.write=0;// window write pointer
that.reset=function(z,c){if(c)c[0]=check;// if (mode == BTREE || mode == DTREE) {
// }
if(mode==CODES){codes.free(z);}mode=TYPE;that.bitk=0;that.bitb=0;that.read=that.write=0;};that.reset(z,null);// copy as much as possible from the sliding window to the output area
that.inflate_flush=function(z,r){var n;var p;var q;// local copies of source and destination pointers
p=z.next_out_index;q=that.read;// compute number of bytes to copy as far as end of window
n=/* (int) */(q<=that.write?that.write:that.end)-q;if(n>z.avail_out)n=z.avail_out;if(n!==0&&r==Z_BUF_ERROR)r=Z_OK;// update counters
z.avail_out-=n;z.total_out+=n;// copy as far as end of window
z.next_out.set(that.window.subarray(q,q+n),p);p+=n;q+=n;// see if more to copy at beginning of window
if(q==that.end){// wrap pointers
q=0;if(that.write==that.end)that.write=0;// compute bytes to copy
n=that.write-q;if(n>z.avail_out)n=z.avail_out;if(n!==0&&r==Z_BUF_ERROR)r=Z_OK;// update counters
z.avail_out-=n;z.total_out+=n;// copy
z.next_out.set(that.window.subarray(q,q+n),p);p+=n;q+=n;}// update pointers
z.next_out_index=p;that.read=q;// done
return r;};that.proc=function(z,r){var t;// temporary storage
var b;// bit buffer
var k;// bits in bit buffer
var p;// input data pointer
var n;// bytes available there
var q;// output window write pointer
var m;// bytes to end of window or read pointer
var i;// copy input/output information to locals (UPDATE macro restores)
// {
p=z.next_in_index;n=z.avail_in;b=that.bitb;k=that.bitk;// }
// {
q=that.write;m=/* (int) */q<that.read?that.read-q-1:that.end-q;// }
// process input based on current state
// DEBUG dtree
while(true){switch(mode){case TYPE:while(k<3){if(n!==0){r=Z_OK;}else{that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}n--;b|=(z.read_byte(p++)&0xff)<<k;k+=8;}t=/* (int) */b&7;last=t&1;switch(t>>>1){case 0:// stored
// {
b>>>=3;k-=3;// }
t=k&7;// go to byte boundary
// {
b>>>=t;k-=t;// }
mode=LENS;// get length of stored block
break;case 1:// fixed
// {
var bl=[];// new Array(1);
var bd=[];// new Array(1);
var tl=[[]];// new Array(1);
var td=[[]];// new Array(1);
InfTree.inflate_trees_fixed(bl,bd,tl,td);codes.init(bl[0],bd[0],tl[0],0,td[0],0);// }
// {
b>>>=3;k-=3;// }
mode=CODES;break;case 2:// dynamic
// {
b>>>=3;k-=3;// }
mode=TABLE;break;case 3:// illegal
// {
b>>>=3;k-=3;// }
mode=BADBLOCKS;z.msg="invalid block type";r=Z_DATA_ERROR;that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}break;case LENS:while(k<32){if(n!==0){r=Z_OK;}else{that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}n--;b|=(z.read_byte(p++)&0xff)<<k;k+=8;}if((~b>>>16&0xffff)!=(b&0xffff)){mode=BADBLOCKS;z.msg="invalid stored block lengths";r=Z_DATA_ERROR;that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}left=b&0xffff;b=k=0;// dump bits
mode=left!==0?STORED:last!==0?DRY:TYPE;break;case STORED:if(n===0){that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}if(m===0){if(q==that.end&&that.read!==0){q=0;m=/* (int) */q<that.read?that.read-q-1:that.end-q;}if(m===0){that.write=q;r=that.inflate_flush(z,r);q=that.write;m=/* (int) */q<that.read?that.read-q-1:that.end-q;if(q==that.end&&that.read!==0){q=0;m=/* (int) */q<that.read?that.read-q-1:that.end-q;}if(m===0){that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}}}r=Z_OK;t=left;if(t>n)t=n;if(t>m)t=m;that.window.set(z.read_buf(p,t),q);p+=t;n-=t;q+=t;m-=t;if((left-=t)!==0)break;mode=last!==0?DRY:TYPE;break;case TABLE:while(k<14){if(n!==0){r=Z_OK;}else{that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}n--;b|=(z.read_byte(p++)&0xff)<<k;k+=8;}table=t=b&0x3fff;if((t&0x1f)>29||(t>>5&0x1f)>29){mode=BADBLOCKS;z.msg="too many length or distance symbols";r=Z_DATA_ERROR;that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}t=258+(t&0x1f)+(t>>5&0x1f);if(!blens||blens.length<t){blens=[];// new Array(t);
}else{for(i=0;i<t;i++){blens[i]=0;}}// {
b>>>=14;k-=14;// }
index=0;mode=BTREE;/* falls through */case BTREE:while(index<4+(table>>>10)){while(k<3){if(n!==0){r=Z_OK;}else{that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}n--;b|=(z.read_byte(p++)&0xff)<<k;k+=8;}blens[border[index++]]=b&7;// {
b>>>=3;k-=3;// }
}while(index<19){blens[border[index++]]=0;}bb[0]=7;t=inftree.inflate_trees_bits(blens,bb,tb,hufts,z);if(t!=Z_OK){r=t;if(r==Z_DATA_ERROR){blens=null;mode=BADBLOCKS;}that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}index=0;mode=DTREE;/* falls through */case DTREE:while(true){t=table;if(index>=258+(t&0x1f)+(t>>5&0x1f)){break;}var j,c;t=bb[0];while(k<t){if(n!==0){r=Z_OK;}else{that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}n--;b|=(z.read_byte(p++)&0xff)<<k;k+=8;}// if (tb[0] == -1) {
// System.err.println("null...");
// }
t=hufts[(tb[0]+(b&inflate_mask[t]))*3+1];c=hufts[(tb[0]+(b&inflate_mask[t]))*3+2];if(c<16){b>>>=t;k-=t;blens[index++]=c;}else{// c == 16..18
i=c==18?7:c-14;j=c==18?11:3;while(k<t+i){if(n!==0){r=Z_OK;}else{that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}n--;b|=(z.read_byte(p++)&0xff)<<k;k+=8;}b>>>=t;k-=t;j+=b&inflate_mask[i];b>>>=i;k-=i;i=index;t=table;if(i+j>258+(t&0x1f)+(t>>5&0x1f)||c==16&&i<1){blens=null;mode=BADBLOCKS;z.msg="invalid bit length repeat";r=Z_DATA_ERROR;that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}c=c==16?blens[i-1]:0;do{blens[i++]=c;}while(--j!==0);index=i;}}tb[0]=-1;// {
var bl_=[];// new Array(1);
var bd_=[];// new Array(1);
var tl_=[];// new Array(1);
var td_=[];// new Array(1);
bl_[0]=9;// must be <= 9 for lookahead assumptions
bd_[0]=6;// must be <= 9 for lookahead assumptions
t=table;t=inftree.inflate_trees_dynamic(257+(t&0x1f),1+(t>>5&0x1f),blens,bl_,bd_,tl_,td_,hufts,z);if(t!=Z_OK){if(t==Z_DATA_ERROR){blens=null;mode=BADBLOCKS;}r=t;that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}codes.init(bl_[0],bd_[0],hufts,tl_[0],hufts,td_[0]);// }
mode=CODES;/* falls through */case CODES:that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;if((r=codes.proc(that,z,r))!=Z_STREAM_END){return that.inflate_flush(z,r);}r=Z_OK;codes.free(z);p=z.next_in_index;n=z.avail_in;b=that.bitb;k=that.bitk;q=that.write;m=/* (int) */q<that.read?that.read-q-1:that.end-q;if(last===0){mode=TYPE;break;}mode=DRY;/* falls through */case DRY:that.write=q;r=that.inflate_flush(z,r);q=that.write;m=/* (int) */q<that.read?that.read-q-1:that.end-q;if(that.read!=that.write){that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}mode=DONELOCKS;/* falls through */case DONELOCKS:r=Z_STREAM_END;that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);case BADBLOCKS:r=Z_DATA_ERROR;that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);default:r=Z_STREAM_ERROR;that.bitb=b;that.bitk=k;z.avail_in=n;z.total_in+=p-z.next_in_index;z.next_in_index=p;that.write=q;return that.inflate_flush(z,r);}}};that.free=function(z){that.reset(z,null);that.window=null;hufts=null;// ZFREE(z, s);
};that.set_dictionary=function(d,start,n){that.window.set(d.subarray(start,start+n),0);that.read=that.write=n;};// Returns true if inflate is currently at the end of a block generated
// by Z_SYNC_FLUSH or Z_FULL_FLUSH.
that.sync_point=function(){return mode==LENS?1:0;};}// Inflate
// preset dictionary flag in zlib header
var PRESET_DICT=0x20;var Z_DEFLATED=8;var METHOD=0;// waiting for method byte
var FLAG=1;// waiting for flag byte
var DICT4=2;// four dictionary check bytes to go
var DICT3=3;// three dictionary check bytes to go
var DICT2=4;// two dictionary check bytes to go
var DICT1=5;// one dictionary check byte to go
var DICT0=6;// waiting for inflateSetDictionary
var BLOCKS=7;// decompressing blocks
var DONE=12;// finished check, done
var BAD=13;// got an error--stay here
var mark=[0,0,0xff,0xff];function Inflate(){var that=this;that.mode=0;// current inflate mode
// mode dependent information
that.method=0;// if FLAGS, method byte
// if CHECK, check values to compare
that.was=[0];// new Array(1); // computed check value
that.need=0;// stream check value
// if BAD, inflateSync's marker bytes count
that.marker=0;// mode independent information
that.wbits=0;// log2(window size) (8..15, defaults to 15)
// this.blocks; // current inflate_blocks state
function inflateReset(z){if(!z||!z.istate)return Z_STREAM_ERROR;z.total_in=z.total_out=0;z.msg=null;z.istate.mode=BLOCKS;z.istate.blocks.reset(z,null);return Z_OK;}that.inflateEnd=function(z){if(that.blocks)that.blocks.free(z);that.blocks=null;// ZFREE(z, z->state);
return Z_OK;};that.inflateInit=function(z,w){z.msg=null;that.blocks=null;// set window size
if(w<8||w>15){that.inflateEnd(z);return Z_STREAM_ERROR;}that.wbits=w;z.istate.blocks=new InfBlocks(z,1<<w);// reset state
inflateReset(z);return Z_OK;};that.inflate=function(z,f){var r;var b;if(!z||!z.istate||!z.next_in)return Z_STREAM_ERROR;f=f==Z_FINISH?Z_BUF_ERROR:Z_OK;r=Z_BUF_ERROR;while(true){// System.out.println("mode: "+z.istate.mode);
switch(z.istate.mode){case METHOD:if(z.avail_in===0)return r;r=f;z.avail_in--;z.total_in++;if(((z.istate.method=z.read_byte(z.next_in_index++))&0xf)!=Z_DEFLATED){z.istate.mode=BAD;z.msg="unknown compression method";z.istate.marker=5;// can't try inflateSync
break;}if((z.istate.method>>4)+8>z.istate.wbits){z.istate.mode=BAD;z.msg="invalid window size";z.istate.marker=5;// can't try inflateSync
break;}z.istate.mode=FLAG;/* falls through */case FLAG:if(z.avail_in===0)return r;r=f;z.avail_in--;z.total_in++;b=z.read_byte(z.next_in_index++)&0xff;if(((z.istate.method<<8)+b)%31!==0){z.istate.mode=BAD;z.msg="incorrect header check";z.istate.marker=5;// can't try inflateSync
break;}if((b&PRESET_DICT)===0){z.istate.mode=BLOCKS;break;}z.istate.mode=DICT4;/* falls through */case DICT4:if(z.avail_in===0)return r;r=f;z.avail_in--;z.total_in++;z.istate.need=(z.read_byte(z.next_in_index++)&0xff)<<24&0xff000000;z.istate.mode=DICT3;/* falls through */case DICT3:if(z.avail_in===0)return r;r=f;z.avail_in--;z.total_in++;z.istate.need+=(z.read_byte(z.next_in_index++)&0xff)<<16&0xff0000;z.istate.mode=DICT2;/* falls through */case DICT2:if(z.avail_in===0)return r;r=f;z.avail_in--;z.total_in++;z.istate.need+=(z.read_byte(z.next_in_index++)&0xff)<<8&0xff00;z.istate.mode=DICT1;/* falls through */case DICT1:if(z.avail_in===0)return r;r=f;z.avail_in--;z.total_in++;z.istate.need+=z.read_byte(z.next_in_index++)&0xff;z.istate.mode=DICT0;return Z_NEED_DICT;case DICT0:z.istate.mode=BAD;z.msg="need dictionary";z.istate.marker=0;// can try inflateSync
return Z_STREAM_ERROR;case BLOCKS:r=z.istate.blocks.proc(z,r);if(r==Z_DATA_ERROR){z.istate.mode=BAD;z.istate.marker=0;// can try inflateSync
break;}if(r==Z_OK){r=f;}if(r!=Z_STREAM_END){return r;}r=f;z.istate.blocks.reset(z,z.istate.was);z.istate.mode=DONE;/* falls through */case DONE:return Z_STREAM_END;case BAD:return Z_DATA_ERROR;default:return Z_STREAM_ERROR;}}};that.inflateSetDictionary=function(z,dictionary,dictLength){var index=0;var length=dictLength;if(!z||!z.istate||z.istate.mode!=DICT0)return Z_STREAM_ERROR;if(length>=1<<z.istate.wbits){length=(1<<z.istate.wbits)-1;index=dictLength-length;}z.istate.blocks.set_dictionary(dictionary,index,length);z.istate.mode=BLOCKS;return Z_OK;};that.inflateSync=function(z){var n;// number of bytes to look at
var p;// pointer to bytes
var m;// number of marker bytes found in a row
var r,w;// temporaries to save total_in and total_out
// set up
if(!z||!z.istate)return Z_STREAM_ERROR;if(z.istate.mode!=BAD){z.istate.mode=BAD;z.istate.marker=0;}if((n=z.avail_in)===0)return Z_BUF_ERROR;p=z.next_in_index;m=z.istate.marker;// search
while(n!==0&&m<4){if(z.read_byte(p)==mark[m]){m++;}else if(z.read_byte(p)!==0){m=0;}else{m=4-m;}p++;n--;}// restore
z.total_in+=p-z.next_in_index;z.next_in_index=p;z.avail_in=n;z.istate.marker=m;// return no joy or set up to restart on a new block
if(m!=4){return Z_DATA_ERROR;}r=z.total_in;w=z.total_out;inflateReset(z);z.total_in=r;z.total_out=w;z.istate.mode=BLOCKS;return Z_OK;};// Returns true if inflate is currently at the end of a block generated
// by Z_SYNC_FLUSH or Z_FULL_FLUSH. This function is used by one PPP
// implementation to provide an additional safety check. PPP uses
// Z_SYNC_FLUSH
// but removes the length bytes of the resulting empty stored block. When
// decompressing, PPP checks that at the end of input packet, inflate is
// waiting for these length bytes.
that.inflateSyncPoint=function(z){if(!z||!z.istate||!z.istate.blocks)return Z_STREAM_ERROR;return z.istate.blocks.sync_point();};}// ZStream
function ZStream(){}ZStream.prototype={inflateInit:function(bits){var that=this;that.istate=new Inflate();if(!bits)bits=MAX_BITS;return that.istate.inflateInit(that,bits);},inflate:function(f){var that=this;if(!that.istate)return Z_STREAM_ERROR;return that.istate.inflate(that,f);},inflateEnd:function(){var that=this;if(!that.istate)return Z_STREAM_ERROR;var ret=that.istate.inflateEnd(that);that.istate=null;return ret;},inflateSync:function(){var that=this;if(!that.istate)return Z_STREAM_ERROR;return that.istate.inflateSync(that);},inflateSetDictionary:function(dictionary,dictLength){var that=this;if(!that.istate)return Z_STREAM_ERROR;return that.istate.inflateSetDictionary(that,dictionary,dictLength);},read_byte:function(start){var that=this;return that.next_in.subarray(start,start+1)[0];},read_buf:function(start,size){var that=this;return that.next_in.subarray(start,start+size);}};// Inflater
function Inflater(){var that=this;var z=new ZStream();var bufsize=512;var flush=Z_NO_FLUSH;var buf=new Uint8Array(bufsize);var nomoreinput=false;z.inflateInit();z.next_out=buf;that.append=function(data,onprogress){var err,buffers=[],lastIndex=0,bufferIndex=0,bufferSize=0,array;if(data.length===0)return;z.next_in_index=0;z.next_in=data;z.avail_in=data.length;do{z.next_out_index=0;z.avail_out=bufsize;if(z.avail_in===0&&!nomoreinput){// if buffer is empty and more input is available, refill it
z.next_in_index=0;nomoreinput=true;}err=z.inflate(flush);if(nomoreinput&&err===Z_BUF_ERROR){if(z.avail_in!==0)throw new Error("inflating: bad input");}else if(err!==Z_OK&&err!==Z_STREAM_END)throw new Error("inflating: "+z.msg);if((nomoreinput||err===Z_STREAM_END)&&z.avail_in===data.length)throw new Error("inflating: bad input");if(z.next_out_index)if(z.next_out_index===bufsize)buffers.push(new Uint8Array(buf));else buffers.push(new Uint8Array(buf.subarray(0,z.next_out_index)));bufferSize+=z.next_out_index;if(onprogress&&z.next_in_index>0&&z.next_in_index!=lastIndex){onprogress(z.next_in_index);lastIndex=z.next_in_index;}}while(z.avail_in>0||z.avail_out===0);array=new Uint8Array(bufferSize);buffers.forEach(function(chunk){array.set(chunk,bufferIndex);bufferIndex+=chunk.length;});return array;};that.flush=function(){z.inflateEnd();};}// 'zip' may not be defined in z-worker and some tests
var env=global.zip||global;env.Inflater=env._jzlib_Inflater=Inflater;})(this);// -------- FourCC.js --------
// Generated by CoffeeScript 2.6.1
(function(){var FourCC,Logger,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("Maths");FourCC=function(){var _i2s,_s2i;//-----------
class FourCC{//-----------
constructor(){throw"FourCC cannot be instantiated.";}//----------
// No "Instance" members.
// All members are "Static".
//   4cc String (ASCII characters) -> 4cc integer (little-endian).
//   If necessary, the string is padded with NUL characters; any
//   characters beyond the 4th are ignored.
static fourCCInt(str4){var cc0,cc1,cc2,cc3,has4,s;//---------
has4=4<=str4.length;s=has4?str4:str4+String.fromCharCode(0,0,0,0);cc0=s.charCodeAt(0)&0xFF;cc1=s.charCodeAt(1)&0xFF;cc2=s.charCodeAt(2)&0xFF;cc3=s.charCodeAt(3)&0xFF;return((cc3<<8|cc2)<<8|cc1)<<8|cc0;}//   4cc integer -> 4cc String (ASCII characters, little-endian).
//   The presence of trailing NUL characters reduces the string
//   length by the number of such characters.  So the string
//   length is in the range 0 to 4 inclusive.
static fourCCStr(id4cc){var cc0,cc1,cc2,cc3,chs,chvec,i;//---------
chs=id4cc;cc0=chs&0xFF;chs>>=8;cc1=chs&0xFF;chs>>=8;cc2=chs&0xFF;chs>>=8;cc3=chs&0xFF;if(cc3!==0){return String.fromCharCode(cc0,cc1,cc2,cc3);}else{// Uncommon case, so there''s a low premium on speed,
// efficiency, or even on elegance.
// Retain all characters before the first NUL.
chvec=[cc0,cc1,cc2,cc3];i=0;while(chvec[i]){++i;}return String.fromCharCode(...chvec.slice(0,i));}}//   Returns an array of 4cc integers corresponding to the given
//   array of 4cc strings.
static fourCCStrsToInts(fccss){return fccss.map(_s2i);}//----------------
//   Returns an array of 4cc strings corresponding to the given
//   array of 4cc integers.
static fourCCIntsToStrs(fccis){return fccis.map(_i2s);}//---------------
//   4cc integer to string conversion, the result being padded with
//   spaces if necessary, ensuring that the result length is 4.
static fourCCStrPadded(id4cc){var s;//---------------
s=this.fourCCStr(id4cc);while(s.length!==4){s+=" ";}return s;}};//   _s2i, _i2s are private helper functions.
_s2i=function(fccs,ix,vec){return FourCC.fourCCInt(fccs);};_i2s=function(fcci,ix,vec){return FourCC.fourCCStr(fcci);};return FourCC;}.call(this);// Export
cwaenv.add(FourCC,"FourCC");// (End FourCC.coffee)
}).call(this);// -------- pretty-data-fix.js --------
/**
* pretty-data - nodejs plugin to pretty-print or minify data in XML, JSON and CSS formats.
*  
* Version - 0.40.0
* Copyright (c) 2012 Vadim Kiryukhin
* vkiryukhin @ gmail.com
* http://www.eslinstructor.net/pretty-data/
* 
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*	pd.xml(data ) - pretty print XML;
*	pd.json(data) - pretty print JSON;
*	pd.css(data ) - pretty print CSS;
*	pd.sql(data)  - pretty print SQL;
*
*	pd.xmlmin(data [, preserveComments] ) - minify XML; 
*	pd.jsonmin(data)                      - minify JSON; 
*	pd.cssmin(data [, preserveComments] ) - minify CSS; 
*	pd.sqlmin(data)                       - minify SQL; 
*
* PARAMETERS:
*
*	@data  			- String; XML, JSON, CSS or SQL text to beautify;
* 	@preserveComments	- Bool (optional, used in minxml and mincss only); 
*				  Set this flag to true to prevent removing comments from @text; 
*	@Return 		- String;
*	
* USAGE:
*	
*	var pd  = require('pretty-data').pd;
*
*	var xml_pp   = pd.xml(xml_text);
*	var xml_min  = pd.xmlmin(xml_text [,true]);
*	var json_pp  = pd.json(json_text);
*	var json_min = pd.jsonmin(json_text);
*	var css_pp   = pd.css(css_text);
*	var css_min  = pd.cssmin(css_text [, true]);
*	var sql_pp   = pd.sql(sql_text);
*	var sql_min  = pd.sqlmin(sql_text);
*
* TEST:
*	comp-name:pretty-data$ node ./test/test_xml
*	comp-name:pretty-data$ node ./test/test_json
*	comp-name:pretty-data$ node ./test/test_css
*	comp-name:pretty-data$ node ./test/test_sql
*/function pp(){this.shift=['\n'];// array of shifts
this.step='  ';// 2 spaces
var maxdeep=100,// nesting level
ix=0;// initialize array with shifts //
for(ix=0;ix<maxdeep;ix++){this.shift.push(this.shift[ix]+this.step);}};// ----------------------- XML section ----------------------------------------------------
pp.prototype.xml=function(text,preserveComments){var strg=preserveComments?text:text.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g,"");var ar=strg.replace(/>\s{0,}</g,"><").replace(/</g,"~::~<").replace(/xmlns\:/g,"~::~xmlns:").replace(/xmlns\=/g,"~::~xmlns=").split('~::~'),len=ar.length,inComment=false,deep=0,str='',ix=0;for(ix=0;ix<len;ix++){// start comment or <![CDATA[...]]> or <!DOCTYPE //
if(ar[ix].search(/<!/)>-1){str+=this.shift[deep]+ar[ix];inComment=true;// end comment  or <![CDATA[...]]> //
if(ar[ix].search(/-->/)>-1||ar[ix].search(/\]>/)>-1||ar[ix].search(/!DOCTYPE/)>-1){inComment=false;}}else// end comment  or <![CDATA[...]]> //    find --> or ]>
if(ar[ix].search(/-->/)>-1||ar[ix].search(/\]>/)>-1){str+=ar[ix];inComment=false;}else// <elm></elm> //    find prev <tag and this <\tag    but now not prev \>
if(ar[ix-1]!=null&&ar[ix-1].search(/\/>/)==-1&&/^<\w/.exec(ar[ix-1])&&/^<\/\w/.exec(ar[ix])&&/^<[\w:\-\.\,]+/.exec(ar[ix-1])==/^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/','')){// Omits indentation
// str += ar[ix];
// No longer omits indentation: For compatibility with Java PP routine
str=!inComment?str+=this.shift[--deep]+ar[ix]:str+=ar[ix];// if(!inComment) deep--;
}else// <elm> //
//    find <tag but not </ or />
if(ar[ix].search(/<\w/)>-1&&ar[ix].search(/<\//)==-1&&ar[ix].search(/\/>/)==-1){str=!inComment?str+=this.shift[deep++]+ar[ix]:str+=ar[ix];}else// <elm>...</elm> //    find <tag and </    not sure how both can be on one line
if(ar[ix].search(/<\w/)>-1&&ar[ix].search(/<\//)>-1){str=!inComment?str+=this.shift[deep]+ar[ix]:str+=ar[ix];}else// </elm> //    find </
if(ar[ix].search(/<\//)>-1){str=!inComment?str+=this.shift[--deep]+ar[ix]:str+=ar[ix];}else// <elm/> //    find />
if(ar[ix].search(/\/>/)>-1){str=!inComment?str+=this.shift[deep]+ar[ix]:str+=ar[ix];}else// <? xml ... ?> //
if(ar[ix].search(/<\?/)>-1){str+=this.shift[deep]+ar[ix];}else// xmlns //
if(ar[ix].search(/xmlns\:/)>-1||ar[ix].search(/xmlns\=/)>-1){str+=this.shift[deep]+ar[ix];}else{str+=ar[ix];}}return str[0]=='\n'?str.slice(1):str;};// ----------------------- JSON section ----------------------------------------------------
pp.prototype.json=function(text){if(typeof text==="string"){return JSON.stringify(JSON.parse(text),null,this.step);}if(typeof text==="object"){return JSON.stringify(text,null,this.step);}return null;};// ----------------------- CSS section ----------------------------------------------------
pp.prototype.css=function(text){var ar=text.replace(/\s{1,}/g,' ').replace(/\{/g,"{~::~").replace(/\}/g,"~::~}~::~").replace(/\;/g,";~::~").replace(/\/\*/g,"~::~/*").replace(/\*\//g,"*/~::~").replace(/~::~\s{0,}~::~/g,"~::~").split('~::~'),len=ar.length,deep=0,str='',ix=0;for(ix=0;ix<len;ix++){if(/\{/.exec(ar[ix])){str+=this.shift[deep++]+ar[ix];}else if(/\}/.exec(ar[ix])){str+=this.shift[--deep]+ar[ix];}else if(/\*\\/.exec(ar[ix])){str+=this.shift[deep]+ar[ix];}else{str+=this.shift[deep]+ar[ix];}}return str.replace(/^\n{1,}/,'');};// ----------------------- SQL section ----------------------------------------------------
function isSubquery(str,parenthesisLevel){return parenthesisLevel-(str.replace(/\(/g,'').length-str.replace(/\)/g,'').length);}function split_sql(str,tab){return str.replace(/\s{1,}/g," ").replace(/ AND /ig,"~::~"+tab+tab+"AND ").replace(/ BETWEEN /ig,"~::~"+tab+"BETWEEN ").replace(/ CASE /ig,"~::~"+tab+"CASE ").replace(/ ELSE /ig,"~::~"+tab+"ELSE ").replace(/ END /ig,"~::~"+tab+"END ").replace(/ FROM /ig,"~::~FROM ").replace(/ GROUP\s{1,}BY/ig,"~::~GROUP BY ").replace(/ HAVING /ig,"~::~HAVING ")//.replace(/ IN /ig,"~::~"+tab+"IN ")
.replace(/ IN /ig," IN ").replace(/ JOIN /ig,"~::~JOIN ").replace(/ CROSS~::~{1,}JOIN /ig,"~::~CROSS JOIN ").replace(/ INNER~::~{1,}JOIN /ig,"~::~INNER JOIN ").replace(/ LEFT~::~{1,}JOIN /ig,"~::~LEFT JOIN ").replace(/ RIGHT~::~{1,}JOIN /ig,"~::~RIGHT JOIN ").replace(/ ON /ig,"~::~"+tab+"ON ").replace(/ OR /ig,"~::~"+tab+tab+"OR ").replace(/ ORDER\s{1,}BY/ig,"~::~ORDER BY ").replace(/ OVER /ig,"~::~"+tab+"OVER ").replace(/\(\s{0,}SELECT /ig,"~::~(SELECT ").replace(/\)\s{0,}SELECT /ig,")~::~SELECT ").replace(/ THEN /ig," THEN~::~"+tab+"").replace(/ UNION /ig,"~::~UNION~::~").replace(/ USING /ig,"~::~USING ").replace(/ WHEN /ig,"~::~"+tab+"WHEN ").replace(/ WHERE /ig,"~::~WHERE ").replace(/ WITH /ig,"~::~WITH ")//.replace(/\,\s{0,}\(/ig,",~::~( ")
//.replace(/\,/ig,",~::~"+tab+tab+"")
.replace(/ ALL /ig," ALL ").replace(/ AS /ig," AS ").replace(/ ASC /ig," ASC ").replace(/ DESC /ig," DESC ").replace(/ DISTINCT /ig," DISTINCT ").replace(/ EXISTS /ig," EXISTS ").replace(/ NOT /ig," NOT ").replace(/ NULL /ig," NULL ").replace(/ LIKE /ig," LIKE ").replace(/\s{0,}SELECT /ig,"SELECT ").replace(/~::~{1,}/g,"~::~").split('~::~');}pp.prototype.sql=function(text){var ar_by_quote=text.replace(/\s{1,}/g," ").replace(/\'/ig,"~::~\'").split('~::~'),len=ar_by_quote.length,ar=[],deep=0,tab=this.step,//+this.step,
inComment=true,inQuote=false,parenthesisLevel=0,str='',ix=0;for(ix=0;ix<len;ix++){if(ix%2){ar=ar.concat(ar_by_quote[ix]);}else{ar=ar.concat(split_sql(ar_by_quote[ix],tab));}}len=ar.length;for(ix=0;ix<len;ix++){parenthesisLevel=isSubquery(ar[ix],parenthesisLevel);if(/\s{0,}\s{0,}SELECT\s{0,}/.exec(ar[ix])){ar[ix]=ar[ix].replace(/\,/g,",\n"+tab+tab+"");}if(/\s{0,}\(\s{0,}SELECT\s{0,}/.exec(ar[ix])){deep++;str+=this.shift[deep]+ar[ix];}else if(/\'/.exec(ar[ix])){if(parenthesisLevel<1&&deep){deep--;}str+=ar[ix];}else{str+=this.shift[deep]+ar[ix];if(parenthesisLevel<1&&deep){deep--;}}}str=str.replace(/^\n{1,}/,'').replace(/\n{1,}/g,"\n");return str;};// ----------------------- min section ----------------------------------------------------
pp.prototype.xmlmin=function(text,preserveComments){var str=preserveComments?text:text.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g,"");return str.replace(/>\s{0,}</g,"><");};pp.prototype.jsonmin=function(text){return text.replace(/\s{0,}\{\s{0,}/g,"{").replace(/\s{0,}\[$/g,"[").replace(/\[\s{0,}/g,"[").replace(/:\s{0,}\[/g,':[').replace(/\s{0,}\}\s{0,}/g,"}").replace(/\s{0,}\]\s{0,}/g,"]").replace(/\"\s{0,}\,/g,'",').replace(/\,\s{0,}\"/g,',"').replace(/\"\s{0,}:/g,'":').replace(/:\s{0,}\"/g,':"').replace(/:\s{0,}\[/g,':[').replace(/\,\s{0,}\[/g,',[').replace(/\,\s{2,}/g,', ').replace(/\]\s{0,},\s{0,}\[/g,'],[');};pp.prototype.cssmin=function(text,preserveComments){var str=preserveComments?text:text.replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\//g,"");return str.replace(/\s{1,}/g,' ').replace(/\{\s{1,}/g,"{").replace(/\}\s{1,}/g,"}").replace(/\;\s{1,}/g,";").replace(/\/\*\s{1,}/g,"/*").replace(/\*\/\s{1,}/g,"*/");};pp.prototype.sqlmin=function(text){return text.replace(/\s{1,}/g," ").replace(/\s{1,}\(/,"(").replace(/\s{1,}\)/,")");};// --------------------------------------------------------------------------------------------
// this.Pretty = new pp;	
this.getCWAEnv().add(new pp(),"Pretty");// -------- Access.XHR.js --------
// Generated by CoffeeScript 2.6.1
(function(){//   Access.XHR.coffee
//   Data transfers using XHR
var Access,DOMParse,Env,Logger,Pretty,XMLSerialize,cwaenv,document,lggr;cwaenv=this.getCWAEnv();document=this.document;XMLSerialize=new XMLSerializer();DOMParse=new DOMParser();Env=cwaenv.get("CWAEnv");Pretty=cwaenv.get("Pretty");Logger=cwaenv.get("Logger");lggr=Logger.get("Data");Access=class Access{// Static
// Convert XML text to DOM
static toDOM(theXML,errCB=null){var doc,errMsg,i,len,pErr,pErrs;doc=DOMParse.parseFromString(theXML,"text/xml");pErrs=doc.getElementsByTagName("parsererror");if(pErrs.length>0){errMsg="";for(i=0,len=pErrs.length;i<len;i++){pErr=pErrs[i];errMsg+=Access._justText(pErr);}if(typeof lggr.trace==="function"){lggr.trace(`Access.XHR: ${errMsg}`);}if(errCB){errCB("error",errMsg);}return null;}else{return doc;}}// Strip XML tags (from error report)
static _justText(el){var i,len,nd,ref,res;res="";ref=el.childNodes;for(i=0,len=ref.length;i<len;i++){nd=ref[i];if(nd.nodeType===Node.ELEMENT_NODE){res+=Access._justText(nd);}else if(nd.nodeType===Node.TEXT_NODE){res+=nd.nodeValue;}}return res;}// Tests whether the given URL is a "file:" URL
static _isFileURL(url){return url.substring(0,5)==="file:";}// Get a file as raw text data or return null. Errors reported via callback.
static fetchURI(theURI,theCB,form=null){var myXHR,rqstData,rqstType;rqstType=form==="HEAD"?"HEAD":form===null||form==="GET"?"GET":"POST";rqstData=form==="HEAD"||form==="POST"||form==="GET"?null:form;if(typeof lggr.debug==="function"){lggr.debug(`Access.XHR: fetchURI fetching: ${theURI} Type=${rqstType}`);}if(Env.browTag==="IE"&&Access._isFileURL(theURI)){// Special for file: URL on IE
myXHR=new ActiveXObject("Microsoft.XMLHTTP");myXHR.open(rqstType,theURI,true);myXHR.onreadystatechange=()=>{var msg;if(myXHR.readyState===XMLHttpRequest.DONE){if(myXHR.status===0||myXHR.status===200){//file: vs. http:
if(typeof lggr.debug==="function"){lggr.debug(`Access.XHR: fetchURI using ActiveX fetched:  ${theURI} Status=${myXHR.status}`);}return theCB(myXHR.responseText,0,null,myXHR.responseText);}else{msg=`fetchURI using ActiveX: Failed for ${theURI} Status=${myXHR.status}`;if(typeof lggr.debug==="function"){lggr.debug(`Access.XHR: ${msg}`);}return theCB(null,1,msg,myXHR.responseText);}}};}else{// Not file: URL or not on IE
myXHR=new XMLHttpRequest();myXHR.open(rqstType,theURI,true);myXHR.overrideMimeType("text/plain; charset=x-user-defined");myXHR.onerror=()=>{return typeof lggr.debug==="function"?lggr.debug(`Access.XHR: fetchURI error signalled:  ${theURI} Status=${myXHR.status} StatusText=${myXHR.statusText} ResponseText=${myXHR.responseText}`):void 0;};myXHR.onloadend=()=>{var msg,xhrok;if(typeof lggr.debug==="function"){lggr.debug(`Access.XHR: fetchURI loading ended:  ${theURI} StatusText=${myXHR.statusText}`);}xhrok=myXHR.status===0||myXHR.status===200;// file: vs. http:
if(xhrok){if(typeof lggr.debug==="function"){lggr.debug(`Access.XHR: fetchURI fetched:  ${theURI} Status=${myXHR.status}`);}return theCB(myXHR.responseText,0,null,myXHR.responseText);}else{msg=`fetchURI: Failed for ${theURI} Status=${myXHR.status}`;if(typeof lggr.debug==="function"){lggr.debug(`Access.XHR: ${msg}`);}return theCB(null,1,msg,myXHR.responseText);}};}return myXHR.send(rqstData);}};// Export
cwaenv.add(Access,"Access");cwaenv.add(XMLSerialize,"XMLSerialize");cwaenv.add(Node,"Node");// (End Access.XHR.coffee)
}).call(this);// -------- Data.js --------
// Generated by CoffeeScript 2.6.1
(function(){//	Data.coffee
// Common data access and manipulation routines building on Access class
var Access,Data,Logger,Pretty,XMLSerialize,cwaenv,lggr;cwaenv=this.getCWAEnv();Access=cwaenv.get("Access");Pretty=cwaenv.get("Pretty");XMLSerialize=cwaenv.get("XMLSerialize");Logger=cwaenv.get("Logger");lggr=Logger.get("Data");Data=function(){class Data{// Construct return value
static result(val,errCount,errText,partVal){return{value:val,errCount:errCount,errText:errText,partVal:partVal};}// Parse to JSON safely
static parseJSON(jstr){if(typeof lggr.trace==="function"){lggr.trace(`JSON.parse for \"${jstr}\"`);}if(jstr!=null&&jstr.length>0){return JSON.parse(jstr);}else{lggr.warn(`JSON.parse failed for \"${jstr}\"`);return null;}}// Chain callbacks
static tee(cbA,cbB){return()=>{cbA();return cbB();};}// ---------- Pretty Print routines -------------- #
// Pretty Print JSON object or text
static ppJSON(theJSON){return Pretty.json(theJSON);}// Minimal JSON object or text
static mnJSON(theJSON){if(typeof theJSON==="object"){theJSON=JSON.stringify(theJSON);}return Pretty.jsonmin(theJSON);}// Pretty Print XML text
static ppXML(theXML,pres=true){return Pretty.xml(theXML,pres);}// Minimal XML from XML text
static mnXML(theXML,pres=false){return Pretty.xmlmin(theXML,pres);}// Pretty Print XML from DOM
static ppDOM(theDOM,pres=true){return Pretty.xml(XMLSerialize.serializeToString(theDOM),pres);}// Minimal XML from DOM
static mnDOM(theDOM,pres=false){return Pretty.xmlmin(XMLSerialize.serializeToString(theDOM),pres);}// ---------- URI normalisation routines --------- #
// Splits a URI into components
static splitURI(uri){var matches,pattern;// lggr.trace? "Splitting #{uri}"
pattern=RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");matches=uri.match(pattern);return{scheme:matches[2],authority:matches[4],path:matches[5],query:matches[7],fragment:matches[9]};}// Rebuild absolute URI string from components.
// Assumes absolute URI. Ignores fragment element so may need enhancing.
// Omit scheme and authority if not given
static stringURI(uriobj){var res;res=uriobj.path;if(uriobj!=null?uriobj.authority:void 0){res="//"+uriobj.authority+res;}if(uriobj!=null?uriobj.scheme:void 0){res=uriobj.scheme+":"+res;}if(uriobj.query!=null){res+="?"+uriobj.query;}return res;}// Rebuild URI path string from components.
// Assumes absolute URI. Ignores fragment element so may need enhancing.
static stringURIPath(uriobj){var res;res=uriobj.path;if(uriobj.query!=null){res+="?"+uriobj.query;}return res;}static absoluteSplitURI(uri,base){var basedir,baseobj,ref,uriobj;uriobj=Data.splitURI(uri);baseobj=Data.splitURI(base);basedir=baseobj.path.substr(0,baseobj.path.lastIndexOf("/")+1);return{scheme:uriobj.scheme||baseobj.scheme,authority:uriobj.authority||baseobj.authority,path:((ref=uriobj.path)!=null?ref.charAt(0):void 0)==="/"?uriobj.path:basedir+uriobj.path,query:uriobj.query||baseobj.query,fragment:uriobj.fragment||baseobj.fragment};}static absoluteURI(uri,base){if(typeof lggr.trace==="function"){lggr.trace(`uri = ${uri} = ${JSON.stringify(Data.splitURI(uri))}`);}if(typeof lggr.trace==="function"){lggr.trace(`base = ${base} = ${JSON.stringify(Data.splitURI(base))}`);}if(typeof lggr.trace==="function"){lggr.trace(`res = ${Data.stringURI(Data.absoluteSplitURI(uri,base))} ${JSON.stringify(Data.absoluteSplitURI(uri,base))}`);}return Data.stringURI(Data.absoluteSplitURI(uri,base));}static asDir(uri){if(uri.endsWith("/")){return uri;}else{return uri+"/";}}// Tests whether the given URL is a "data:" URL
static isDataURL(url){if(url){return url.substring(0,5)==="data:";}else{return false;}}// Get a URI as text
static fetchText(theURI,theCB,form){var textCB;textCB=(val,errC,errT,part)=>{if(errC===0){val=val.replace(/\r\n/g,"\n").replace(/\r/g,"\n");}return theCB(val,errC,errT,part);};return Data.fetchURI(theURI,textCB,form);}// Get a URI as JSON
static fetchJSON(theURI,theCB,form){var JSONCB;JSONCB=(val,errC,errT,part)=>{var err,newJSON;if(errC>0||val.length===0){return theCB(val,errC,errT,part);}else if(val.length===0){return theCB(null,1,"No JSON data found",val);}else{try{newJSON=Data.parseJSON(val);return theCB(newJSON,0,null,newJSON);}catch(error){err=error;return theCB(null,1,err,val);}}};return Data.fetchURI(theURI,JSONCB,form);}// Return a Promise for a fetched URI
//   Currently Builds on Data.fetchURI
//   Later add JSON extensions
//   Currently eager but later could be lazy
//   Currently uncached
static promiseURI(theURI,form){return new Promise((resolve,reject)=>{var theCB;theCB=(val,errC,errT,part)=>{if(errC>0){if(typeof lggr.trace==="function"){lggr.trace(`promiseURI ${theURI} rejecting ${errT}`);}return reject(new Error(JSON.stringify([errC,errT,part])));}else{if(typeof lggr.trace==="function"){lggr.trace(`promiseURI ${theURI} resolving`);}return resolve(val);}};return Data.fetchURI(theURI,theCB,form);});}// Return a Promise for a fetched URI as Text
//   Later combine in cache to keep Text Promise
static promiseURIText(theURI,form){return Data.promiseURI(theURI,form).then(function(res){return res.replace(/\r\n/g,"\n").replace(/\r/g,"\n");});}// Identify function for use in then for Promises
static id(arg){return arg;}};//---------
// Might need a constructor for some configuration uses
// "Static" members.
// ---------- Utility routines ------------------- #
// Linked to Access for now
Data.toDOM=Access.toDOM;// ---------- Data fetching routines ------------- #
// Get raw data from URI
Data.fetchURI=Access.fetchURI;return Data;}.call(this);// Export
cwaenv.add(Data,"Data");// cwaenv.add Sync, "Sync"
// (End Data.coffee)
}).call(this);// -------- AsyncQueue.js --------
// Generated by CoffeeScript 2.6.1
(function(){var AsyncQueue,Logger,console,cwaenv,qlgr;cwaenv=this.getCWAEnv();console=this.console;// Queue of Promises for Puts and Callbacks for Gets
// Promises are used so the gets may not be handled in sequence
cwaenv=this.getCWAEnv();Logger=cwaenv.get("Logger");qlgr=Logger.get("Queue");//, "trace"
AsyncQueue=class AsyncQueue{// Constructor for PromQueue
constructor(qName="[anon]"){this.qName=qName;// Initially ready for a put or a get
this.putLoc=this.getLoc={};this.putLen=this.getLen=0;if(typeof qlgr.debug==="function"){qlgr.debug(`${this.qName}: Queue created`);}}// If there is a get waiting then satisfy it
// Otherwise, add value, or promise of value, to queue
put(val){var getFn,putLen,putPr;putPr=Promise.resolve(val);getFn=this.putLoc.getFn;if(getFn!=null){// There is a get we can match with and there should be a next in the chain
putLen=this.putLen;if(typeof qlgr.trace==="function"){qlgr.trace(`${this.qName}: Put ${putLen} matched`);}putPr.then(qlgr.debug!=null?val=>{qlgr.debug(`${this.qName}: Put ${putLen} resolved`);return getFn(val);}:getFn);}else{if(typeof qlgr.trace==="function"){qlgr.trace(`${this.qName}: Put ${this.putLen} added`);}this.putLoc.putPr=putPr;this.putLoc.next={};}// Always step on to next location for a put
this.putLoc=this.putLoc.next;return this.putLen++;}// If there is a put waiting then get the value
// Otrherwise, add callback function to queue
get(getFn){var getLen,putPr;putPr=this.getLoc.putPr;if(putPr!=null){// There is put we can match with and there should be a next in the chain
getLen=this.getLen;if(typeof qlgr.trace==="function"){qlgr.trace(`${this.qName}: Get ${getLen} matched`);}putPr.then(qlgr.debug!=null?val=>{qlgr.debug(`${this.qName}: Get ${getLen} resolved`);return getFn(val);}:getFn);}else{if(typeof qlgr.trace==="function"){qlgr.trace(`${this.qName}: Get ${this.getLen} added`);}this.getLoc.getFn=getFn;this.getLoc.next={};}// Always step on to next location for a get
this.getLoc=this.getLoc.next;return this.getLen++;}};cwaenv.add(AsyncQueue,"AsyncQueue");// (End AsyncQueue.coffee)
}).call(this);// -------- Config.js --------
// Generated by CoffeeScript 2.6.1
(function(){var Config,Data,Logger,cwaenv,document,lggr,location,setTimeout,zip;cwaenv=this.getCWAEnv();document=this.document;location=this.location;zip=this.zip;setTimeout=this.setTimeout;Data=cwaenv.get("Data");Logger=cwaenv.get("Logger");lggr=Logger.get("Config");Config=function(){class Config{// Apply defaults to missing configuration fields
// Needs special treatment for avSettings perhaps JRWG
static updateObj(theObj,defVals){var key,results,val;results=[];for(key in defVals){val=defVals[key];if(typeof lggr.trace==="function"){lggr.trace(`Key ${key} is ${val}. Object.hasOwnProperty is ${theObj.hasOwnProperty(key)}`);}if(!theObj.hasOwnProperty(key)){results.push(theObj[key]=val);}else{results.push(void 0);}}return results;}// Apply defaults to missing configuration fields
static updateConfig(defVals){var cAv,cIx,conLen,dAv,dIx,defAvSettings,defLen,hadAvSettings,i,j,len,len1,ref,ref1,results;//lggr.info? "Before @updateConfig:\n#{Data.ppJSON @theConfig}"
//lggr.info? "defVals:\n#{Data.ppJSON defVals}"
hadAvSettings=Config.theConfig.hasOwnProperty("avSettings");defAvSettings=defVals.hasOwnProperty("avSettings");// Ensure default avSettings are an array
if(defAvSettings&&!Array.isArray(defVals.avSettings)){defVals.avSettings=[defVals.avSettings];}// Will set avSettings if in defaults but not current config
Config.updateObj(Config.theConfig,defVals);// Merge avSettings if required
if(hadAvSettings&&defAvSettings){conLen=Config.theConfig.avSettings.length;defLen=defVals.avSettings.length;ref=Config.theConfig.avSettings;// Merge existing settings
for(cIx=i=0,len=ref.length;i<len;cIx=++i){cAv=ref[cIx];Config.updateObj(Config.theConfig.avSettings[cIx],defVals.avSettings[cIx%defLen]);}ref1=defVals.avSettings;// Add extra settings
results=[];for(dIx=j=0,len1=ref1.length;j<len1;dIx=++j){dAv=ref1[dIx];if(dIx>=conLen){results.push(Config.theConfig.avSettings[dIx]=dAv);}else{results.push(void 0);}}return results;}}//lggr.info? "After @updateConfig:\n#{Data.ppJSON @theConfig}"
// Load theConfig from initial values and JSON configuration files at clientBase (if provided) and jasBase
static load(CB,path,initCfg){var clientURI,cwaConfigLoad,cwaConfigLoadDone;if(typeof lggr.debug==="function"){lggr.debug(`loadConfig called with ${path}`);}cwaConfigLoadDone=()=>{var base,defaultAv,defaults,i,key,len,ref,ref1,ref2,ref3;if(typeof lggr.debug==="function"){lggr.debug("cwaConfigLoadDone called");}// Default avatar panel settings: background set to null defaults to transparent
defaultAv={width:384,height:320,avList:"avs",initAv:"anna",background:null,initCamera:[0,0.23,3.24,5,18,30,-1,-1],initSpeed:0,rateSpeed:5,allowFrameSteps:true,initSiGMLURL:"iTakeMug.sigml",allowSiGMLText:true};// Final config settings: The jasBase and cwaBase will be set already
defaults={jasVersionTag:"loc2022",sigmlBase:"sigml",avJARBase:"avatars",avJSONBase:"avjson",useAvatarJARs:true,animgenFPS:30,avs:["anna","marc","francoise"],avSettings:[defaultAv],ambMode:"full",ambIdle:true,ambSign:false};this.updateConfig(defaults);if((base=this.theConfig).avBase==null){base.avBase=this.theConfig.useAvatarJARs?this.theConfig.avJARBase:this.theConfig.avJSONBase;}ref=["sigmlBase","avJARBase","avJSONBase","avBase"];// Ensure valid directory bases
for(i=0,len=ref.length;i<len;i++){key=ref[i];if(typeof lggr.trace==="function"){lggr.trace(`Old ${key}: ${this.theConfig[key]}`);}this.theConfig[key]=Data.absoluteURI(Data.asDir(this.theConfig[key]),this.theConfig.jasBase);if(typeof lggr.trace==="function"){lggr.trace(`New ${key}: ${this.theConfig[key]}`);}}// Handle avatar panel setting: JRWG redundant now
if(!Array.isArray(this.theConfig.avSettings)){this.theConfig.avSettings=[this.theConfig.avSettings];}// Inherit general ambMode and ambient choices
this.updateObj(defaultAv,{ambMode:this.theConfig.ambMode,ambIdle:this.theConfig.ambIdle,ambSign:this.theConfig.ambSign});this.updateConfig({avSettings:defaultAv});// After adding defaults
this._fixReferences();// No longer using Workers
zip.useWebWorkers=false;// Initial Animgen processor: Default is "Client"
if((ref1=this.theConfig)!=null?(ref2=ref1.animgenServer)!=null?ref2.startsWith("stoca:"):void 0:void 0){this.theConfig.animgenProc="Applet";}else if(((ref3=this.theConfig)!=null?ref3.animgenServer:void 0)!=null){this.theConfig.animgenProc="Server";}if(typeof lggr.debug==="function"){lggr.debug(`Final Config: ${Data.ppJSON(this.theConfig)}`);}return CB();};cwaConfigLoad=()=>{var cwaURI;if(typeof lggr.debug==="function"){lggr.debug("cwaConfigLoad called");}// Provide defaults for jasBase and cwaBase if needed
if(this.theConfig.jasBase==null){if(typeof lggr.info==="function"){lggr.info("Installation base \"http://localhost/jas/loc2022/\" used for jasBase");}}this.theConfig.jasBase=Data.asDir(this.theConfig.jasBase||"http://localhost/jas/loc2022/");this.theConfig.cwaBase=Data.absoluteURI(Data.asDir(this.theConfig.cwaBase||"cwa"),this.theConfig.jasBase);// Load cwacfg by default
this.updateConfig({useCwaConfig:true});if(this.theConfig.useCwaConfig){cwaURI=Data.absoluteURI(Config._INSTALL_CFG,this.theConfig.cwaBase);return this._loadJSON(cwaConfigLoadDone,cwaURI);}else{return cwaConfigLoadDone();}};// Apply any initial configuration
if(initCfg!=null){this.updateConfig(initCfg);}// If there is an initial configuration, suppress clientcfg unless explicitly enabled
this.updateConfig({useClientConfig:initCfg==null});if(typeof lggr.trace==="function"){lggr.trace(`Initial Config:\n${Data.ppJSON(this.theConfig)}`);}if(this.theConfig.useClientConfig){clientURI=Data.absoluteURI(path,this.theConfig.clientBase);this._loadJSON(cwaConfigLoad,clientURI);}else{cwaConfigLoad();}// Return config though will not be completed yet
return this.theConfig;}// Load a JSON config file and merge with main config
static _loadJSON(CB,uri){var JSONCB;JSONCB=(json,eCount,eMsg)=>{if(eCount>0){lggr.warn(`${eMsg} for \"${uri}\"`);}else{if(typeof lggr.trace==="function"){lggr.trace(`loadJSON for ${uri} returns:\n${Data.ppJSON(json)}`);}this.updateConfig(json);}if(typeof lggr.trace==="function"){lggr.trace(`After ${uri}:\n${Data.ppJSON(this.theConfig)}`);}return CB();};if(typeof lggr.debug==="function"){lggr.debug(`loadJSON called for ${uri}`);}return Data.fetchJSON(uri,JSONCB);}static _fixReferences(){var allavs,i,len,newall,ref,stg,theAvList;if(typeof lggr.trace==="function"){lggr.trace(`Config for fixReferences:\n${Data.ppJSON(this.theConfig)}`);}// Build list of all avatars mentioned
allavs=this.theConfig.allavs||[];ref=this.theConfig.avSettings;// Allow the use of named avatar lists in avatar panel settings.
for(i=0,len=ref.length;i<len;i++){stg=ref[i];if(!(typeof stg.avList==="string")){continue;}// stg.avList is the key of the entry containing the actual
// List of avatars (i.e. of avatar names).
theAvList=stg.avList;stg.avList=this.theConfig[theAvList];// Catch missing avtar list
if(!stg.avList){lggr.warn(`Found no avatar list named \"${theAvList}\"`);stg.avList=[];}if(stg.avList.indexOf(stg.initAv)<0){// Ensure initial avatar is present
stg.avList.push(stg.initAv);}newall=allavs.concat(stg.avList.filter(function(itm){return allavs.indexOf(itm)<0;}));allavs=newall;}this.theConfig.allavs=allavs;return typeof lggr.info==="function"?lggr.info(`List of all avatars for SToCA: ${allavs}`):void 0;}static getAvBase(av){var b;b=Data.asDir(this.theConfig.avBase);if(this.theConfig.useAvatarJARs){return this.theConfig.avBase;}else{return`${this.theConfig.avBase}${av}/`;}}};//   Config is a singleton class.  Static variable theConfig holds
//   the config parameters for the current CWA client HTML page.
//   Typically, this will be created by merging the installation
//   config settings into the client specific settings.
//   "Static"
//   Path for the CWA installation's config settings.
Config._INSTALL_CFG="cwacfg.json";//   Accumulated config information
//   Initialize with reliable values from the start
Config.theConfig={clientBase:Data.absoluteURI("",location.toString()),animgenProc:"Client"};return Config;}.call(this);// Export
cwaenv.add(Config,"Config");// (end)
}).call(this);// -------- SToCAObj.js --------
// Generated by CoffeeScript 2.6.1
(function(){var Config,Env,Logger,SToCAObj,alert,cwaenv,document,lggr,navigator,setTimeout,status,theSToCA;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;navigator=this.navigator;status=this.status;alert=this.alert;Env=cwaenv.get("CWAEnv");Config=cwaenv.get("Config");Logger=cwaenv.get("Logger");lggr=Logger.get("AvatarGUI");//-------------
SToCAObj=class SToCAObj{//-------------
//   NB This class is a singleton.  Its one instance, theSToCA, is
//   created as soon as this class is loaded (see the end of this
//   source file) and thus _before_ the SToC applet for which it acts
//   as a wrapper has been created and initialised.  The necessary
//   binding of wrapper to applet is established, possibly
//   asynchronously, through the wrapper's initialise() method.
constructor(){var ref;this.stat=this.stat.bind(this);//----------
this.RETURN_CHAR=13;this.sLimit=0;this.fLimit=0;this.sign=-1;this.gloss="";this.signMsg="";this.curAvatar="anna";this.curFPS=(ref=Config.theConfig.animgenFPS)!=null?ref:25;// Should use configuration parameter to match applet's "animgen.fps" <param> value
this.stocCB={};this.stocStatus="loading";// or "live" or "dead"
this.stocApplet=null;}stat(msg){return Logger.callHook("status",msg);}// ASSUME: this.appletLoadIsStable();
findSToCA(){var ref;return(ref=document.getElementsByClassName("stocApplet"))!=null?ref[0]:void 0;}//--------
appletLoadIsStable(){var appini,applet;//-----------------
// In the days when the required applet was a subapplet of the JNLP Applet Launcher,
// this was a tricky test. Now it's more straightforward.
// Applet support is declining so various earlier tests no longer apply.
applet=this.findSToCA();appini=applet!=null?applet.init:void 0;if(typeof lggr.debug==="function"){lggr.debug(`SToCAObj: appletLoadIsStable: applet=${typeof applet} applet.init=${typeof(applet!=null?applet.init:void 0)}`);}return typeof applet!=="undefined"&&typeof applet.init!=="undefined";}setSToCA(stoca,source){if(typeof lggr.debug==="function"){lggr.debug(`SToCAObj: setSToCA() source: ${source}`);}this.stocApplet=stoca;return this.stocStatus="live";}//----  HTML start/finish handlers  ----
initialise(){//---------
// Environment tags should have been set in CWAEnv
this.synchronousInit();if(Env.hasJava){// Test for Java should be sufficient
this.initSToCApplet();}return void 0;}synchronousInit(){//--------------
return this.resetSToCAData();}// @stat "SToCA: HTML synchronous initialisation done"
initSToCApplet(){//-------------
if(this.appletLoadIsStable()){return this.setSToCA(this.findSToCA(),"initSToCApplet()");}else{return this.asynchGetSToCA();}}asynchGetSToCA(){var done,fail,stoca,tryFindSToCA;//-------------
stoca=void 0;tryFindSToCA=()=>{if(this.appletLoadIsStable()){stoca=this.findSToCA();return this.setSToCA(stoca,"asynchGetSToCA()");}};done=()=>{return Boolean(stoca);};fail=()=>{return this.stocStatus="dead";};// Repeat every 200ms for 30s
return this.asynchRepeat(tryFindSToCA,done,fail,"asynchGetSToCA(): ",200,30000);}terminate(){var stoca;//--------
// do (do @getSToCA)?.terminate
stoca=this.getSToCA();if(stoca!=null){stoca.terminate();}return this.stat("SToCA: SiGML-to-CAS Applet terminated");}//----  SiGML Player (Sub)Applet Access  ----
getSToCA(){var abt;//-------
if(this.stocStatus==="loading"){if(typeof lggr.debug==="function"){lggr.debug("SToCAObj: Late attempt to find SToCA ...");}if(this.appletLoadIsStable()){this.setSToCA(this.findSToCA(),"getSToCA()");}else{// In practice, we will probably never reach this point:
// if things go awry with Chrome/Mac OS X, it is likely to
// be because the appletLoadIsStable() call hangs up.
lggr.warn("SToCAObj: getSToCA(): catastrophe -- cannot get SToCA!.");}}// Test again and check
if(this.stocStatus==="live"){try{// Liveness test
abt=this.stocApplet.about();if(typeof lggr.trace==="function"){lggr.trace(`SToCAObj: Called SToCA.about returns \"${abt}\"`);}}catch(error){if(typeof lggr.trace==="function"){lggr.trace("SToCAObj: Failed SToCA.about");}this.stocStatus="dead";this.stocApplet=null;}}return this.stocApplet;}statusIs(targ){//--------
// Check for liveness
this.getSToCA();return this.stocStatus===targ;}//----  Utility methods  ----
//   Asynchronously makes repeated calls, one every ms, to the body
//   function until the ok function succeeds, i.e. returns a true result.
//   On completion, if tag is defined then concludes by logging the tag
//   and repetition count.
asynchRepeat(body,ok,fail,tag,delay,maxdelay){var closedARFun,n;//-----------
n=0;closedARFun=function(){body();if(ok()){if(tag){return typeof lggr.trace==="function"?lggr.trace(`SToCAObj: ${tag} completed delay=${n}`):void 0;}}else{n+=delay;if(n<maxdelay){return setTimeout(closedARFun,delay);}else{if(typeof lggr.trace==="function"){lggr.trace(`SToCAObj: ${tag} abandoned delay=${n}`);}return fail();}}};return closedARFun();}resetSignData(){//------------
this.sLimit=this.fLimit=0;this.sign=-1;this.gloss="";return this.signMsg="";}resetSToCAData(){//-------------
this.resetSignData();this.curAvatar="anna";return this.curFPS=Config.theConfig.animgenFPS;}htmlEls(elid){return document.getElementsByClassName(elid);}//-----
//----  SiGML-Player-Applet event/callout handlers  ----
framesGenEH(ekind,nf,ns){var ekinds,msg,prevFLimit;//----------
// The events handled here:
//   LOAD_FRAMES_START
//   LOADED_NEXT_SIGN
//   LOAD_FRAMES_DONE_OK
//   LOAD_FRAMES_DONE_BAD
msg="No frames generated from URL.";ekinds=String(ekind);prevFLimit=-1;//---- LOAD_FRAMES_START ----
if(ekinds==="LOAD_FRAMES_START"){this.resetSignData();msg="Loading of frames has started.";//---- LOADED_NEXT_SIGN ----
}else if(ekinds==="LOADED_NEXT_SIGN"){prevFLimit=this.fLimit;this.fLimit=nf;this.sLimit=ns;if(prevFLimit===0&&this.fLimit!==0){// For this animation these are the
// first frames that we know of.
this.setButtonsForPlaying();msg=`${ns} sign(s) now ready to play.`;}//---- LOAD_FRAMES_DONE_OK ----
}else if(ekinds==="LOAD_FRAMES_DONE_OK"){prevFLimit=this.fLimit;this.fLimit=nf;this.sLimit=ns;if(this.fLimit===0){// Load failed to generate any frames.
this.setButtonsForIdling();// And use default message.
}else if(prevFLimit===0){// Now there are frames, and they''re the first we know of.
msg="Ready to play.";}else{// We are already playing frames from streamed load.
msg=`All frames loaded: ${this.sLimit} signs, ${this.fLimit} frames.`;}//---- LOAD_FRAMES_DONE_BAD ----
}else if(ekinds==="LOAD_FRAMES_DONE_BAD"){}else{// There are no frames -- use default message.
//---- (chaos) ----
msg=`unknown frames-gen event: ${ekind}.`;alert(msg);}// If animation is in progress, or is about to be so, then this
// message will be swamped, but there should be no harm in trying.
return this.stat(msg);}//----  HTML button/input handlers  ----
setAvatar(av){return this.curAvatar=String(av);}//--------
setFPS(fps){return this.curFPS=String(fps);}//-----
doSiGMLTextToCAS(rqstid,stxt,av,casfmt,cascb){var SToCA,checkLive;//---------------
if(SToCA=this.getSToCA()){if(typeof lggr.debug==="function"){lggr.debug(`SToCAObj: typeof SToCA=\"${typeof SToCA}\"`);}if(typeof lggr.debug==="function"){lggr.debug(`SToCAObj: typeof SToCA.doSiGMLTextToCAS=\"${typeof SToCA.doSiGMLTextToCAS}\"`);}if(typeof lggr.debug==="function"){lggr.debug(`SToCAObj: SToCA.doSiGMLTextToCAS?=\"${SToCA.doSiGMLTextToCAS!=null}\"`);}if(typeof lggr.debug==="function"){lggr.debug(`SToCAObj: 'doSiGMLTextToCAS' of SToCA=\"${'doSiGMLTextToCAS'in SToCA}\"`);}if(typeof lggr.debug==="function"){lggr.debug(`SToCAObj: SToCA keys=\"${Object.keys(SToCA)}\"`);}// Asynchronous request: result is returned via returnCAS() below.
this.stocCB[rqstid]=cascb;if(typeof lggr.info==="function"){lggr.info("SToCAObj: Calling SToCA.doSiGMLTextToCAS");}try{// May still not be able to call method
SToCA.doSiGMLTextToCAS(rqstid,stxt,av,casfmt);if(typeof lggr.info==="function"){lggr.info("SToCAObj: Called  SToCA.doSiGMLTextToCAS");}checkLive=()=>{//log "Checking alive for #{rqstid}"
if(this.stocCB[rqstid]){// Potentially alive
if(this.statusIs("dead")){if(typeof lggr.warn==="function"){lggr.warn(`SToCAObj: Applet died for ${rqstid}`);}// Force end of sequence
return cascb("{}");}else{return setTimeout(checkLive,500);}}else{return typeof lggr.debug==="function"?lggr.debug(`SToCAObj: Sequence ended normally for ${rqstid}`):void 0;}};setTimeout(checkLive,500);return true;}catch(error){if(typeof lggr.info==="function"){lggr.info("SToCAObj: Failed  SToCA.doSiGMLTextToCAS");}// Cancel request
SToCA.setDoneSiGMLToCASRequest(rqstid);return false;}}else{if(typeof lggr.debug==="function"){lggr.debug("SToCAObj: Cannot  SToCA.doSiGMLTextToCAS");}return false;}}returnCAS(rqstid,cas){var cascb,err;if(typeof lggr.debug==="function"){lggr.debug(`SToCAObj:  SToCA returnCAS ${rqstid}`);}cascb=this.stocCB[rqstid];if(!cascb){if(typeof lggr.debug==="function"){lggr.debug(`SToCAObj: SToCA.returnCAS(), id=${rqstid}: call-back is missing.`);}}else{try{// Make sure that an exception on the browser/JS side does
// not get back to the applet/Java side.
cascb(cas);}catch(error){err=error;lggr.warn("SToCAObj: "+(err.stack||err.stacktrace||err));}}// 2012-03
// Now this method may be invoked several times per request -- because
// the CAS data is returned as a stream of chunks.  So now we rely on
// an explicit request from the client -- setDoneSiGMLToCASRequest(),
// below -- to delete the stored callback.
//delete @stocCB[rqstid]
return void 0;}setDoneSiGMLToCASRequest(rqstid){//-----------------------
if(this.stocCB[rqstid]){return delete this.stocCB[rqstid];}else{return typeof lggr.debug==="function"?lggr.debug(`SToCAObj: SToCA.setDoneSiGMLToCASRequest(), id ${rqstid} is invalid.`):void 0;}}setLogFlag(lstr){var logstr,ref;//---------
logstr=lstr||"true";return(ref=this.getSToCA())!=null?ref.switchLogEnabled(logstr):void 0;}};// Export
// In deference to tradition we create the singleton SToCAObj at this
// early stage, but it should be OK, and would be more consistent, to
// let CWASA create it later.  If we create it here, there's no need
// to add the SToCAObj class to the cwaenv.
theSToCA=new SToCAObj();cwaenv.add(theSToCA,"theSToCA");// Callbacks from Java
this.stocaFramesGenEvent=function(ekind,nf,ns){return theSToCA.framesGenEH(ekind,nf,ns);};this.stocaReturnCAS=function(rqstid,cas){return theSToCA.returnCAS(rqstid,cas);};this.spaSetSToCApplet=function(spa){return typeof lggr.debug==="function"?lggr.debug(`SToCAObj: spaSetSToCApplet called with spa=${spa}`):void 0;};// (End SToCAObj.coffee)
}).call(this);// -------- Shader.js --------
// Generated by CoffeeScript 2.6.1
(function(){var Logger,Shader,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("Animate");//-----------
Shader=class Shader{//-----------
// GL context, vertex and fragment shader URLs.
constructor(gl,vsPath,fsPath,vsSource,fsSource,vsSubs,fsSubs){var a,i,j,k,ref,ref1,shprog,sz,u,vsfsStr;this.gl=gl;this.vsPath=vsPath;this.fsPath=fsPath;this.vsSource=vsSource;this.fsSource=fsSource;this.vsSubs=vsSubs;this.fsSubs=fsSubs;//----------
this._prog=null;// WebGL program.
this._vs=null;// WebGL vertex shader.
this._fs=null;// WebGL fragment shader.
this._nUniforms=-1;// Number of uniforms.
this._uniforms={};// Uniform locations.
this._nAttributes=-1;// Number of attributes.
this._attributes={};// Attribute locations.
if(typeof lggr.trace==="function"){lggr.trace(`Shader: Max Vert Uniforms:     ${this.gl.getParameter(this.gl.MAX_VERTEX_UNIFORM_VECTORS)}`);}if(typeof lggr.trace==="function"){lggr.trace(`Shader: Max Frag Uniforms:     ${this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS)}`);}if(typeof lggr.trace==="function"){lggr.trace(`Shader: Vert source: ${this.vsSource}`);}if(typeof lggr.trace==="function"){lggr.trace(`Shader: Frag source: ${this.fsSource}`);}//   Load vertex and fragment shaders, performing substitutions if any.
this._vs=this._loadShader(this.vsPath,this.vsSource,this.vsSubs);this._fs=this._loadShader(this.fsPath,this.fsSource,this.fsSubs);//   Create and link the program
shprog=this.gl.createProgram();if(this._vs&&this._fs){this.gl.attachShader(shprog,this._vs);if(this._fs){this.gl.attachShader(shprog,this._fs);}// Keep Chrome happy
this.gl.bindAttribLocation(shprog,0,"BindPos");this.gl.linkProgram(shprog);}vsfsStr=`VrtxS=${this.vsPath} FragS=${this.fsPath}`;if(this.gl.getProgramParameter(shprog,this.gl.LINK_STATUS)){if(typeof lggr.info==="function"){lggr.info(`Shader: Program using: ${vsfsStr} created`);}this._prog=shprog;}else{lggr.warn(`Shader: Program using: ${vsfsStr} failed to link: ${this.gl.getProgramInfoLog(shprog)}`);this.gl.deleteProgram(shprog);this._vs=this._fs=null;}if(this._prog){//   Grab uniforms.
this._nUniforms=this.gl.getProgramParameter(this._prog,this.gl.ACTIVE_UNIFORMS);if(typeof lggr.trace==="function"){lggr.trace(`Shader: ${this._nUniforms} Uniform Variables used  ####`);}sz=0;for(i=j=0,ref=this._nUniforms;0<=ref?j<ref:j>ref;i=0<=ref?++j:--j){u=this.gl.getActiveUniform(this._prog,i);this._uniforms[u.name]=this.gl.getUniformLocation(this._prog,u.name);if(typeof lggr.trace==="function"){lggr.trace(`Shader: ${u.name} size ${this.gl.getActiveUniform(this._prog,i).size}`);}sz+=this.gl.getActiveUniform(this._prog,i).size;}if(typeof lggr.trace==="function"){lggr.trace(`Shader: ${sz} Shader Uniforms used  ####`);}//   Grab attributes.
this._nAttributes=this.gl.getProgramParameter(this._prog,this.gl.ACTIVE_ATTRIBUTES);if(typeof lggr.trace==="function"){lggr.trace(`Shader: ${this._nAttributes} Active Attributes`);}for(i=k=0,ref1=this._nAttributes;0<=ref1?k<ref1:k>ref1;i=0<=ref1?++k:--k){a=this.gl.getActiveAttrib(this._prog,i);this._attributes[a.name]=this.gl.getAttribLocation(this._prog,a.name);if(typeof lggr.trace==="function"){lggr.trace(`Shader: ${a.name}: ${this._attributes[a.name]}`);}}}this.DO_CHECK_LOC_NAME=false;}/*  Accessors  */ // Was: isValid: -> @_prog isnt null
isValid(){if(this._prog===void 0){return false;}else{return this._prog!==null;}}//--------
getHandle(){return this._prog;}//--------
getUniformLocation(uName){var ul;//-----------------
ul=this._uniforms[uName];if(ul===void 0&&this.DO_CHECK_LOC_NAME){lggr.warn(`Shader: ERROR: missing GL uniform '${uName}'`);}return ul;}getAttributeLocation(aName){var al;//-------------------
al=this._attributes[aName];if(al===void 0&&this.DO_CHECK_LOC_NAME){`ERROR: missing GL attribute '${aName}'`;}return al;}/*  Private helper methods.  */_loadShader(spath,source,subs){var shader,ssource,strEndsWith;//----------
strEndsWith=function(s,sfx){var dif;dif=s.length-sfx.length;return 0<=dif&&String(sfx)===s.substring(dif);};//   Create GL shader of the appropriate kind
shader=strEndsWith(spath,".vert")?this.gl.createShader(this.gl.VERTEX_SHADER):strEndsWith(spath,".frag")?this.gl.createShader(this.gl.FRAGMENT_SHADER):(lggr.warn(`Shader: Unrecognised shader URL suffix: ${spath}.`),null);if(shader!=null){// Load, perform substitutions, compile and check for errors.
// Source provided as parameter
// source = @_loadShaderSource spath
ssource=subs?this._applySubs(source,subs):source;if(typeof lggr.trace==="function"){lggr.trace(`Shader: Source:\n${ssource}`);}this.gl.shaderSource(shader,ssource);this.gl.compileShader(shader);if(!this.gl.getShaderParameter(shader,this.gl.COMPILE_STATUS)){lggr.warn(`Shader: failed: ${spath}: ${this.gl.getShaderInfoLog(shader)}`);if(typeof lggr.debug==="function"){lggr.debug("================================================");}if(typeof lggr.debug==="function"){lggr.debug(ssource);}if(typeof lggr.debug==="function"){lggr.debug("================================================");}shader=null;}else{if(typeof lggr.debug==="function"){lggr.debug(`Shader: loaded: ${spath}`);}}}return shader;}_applySubs(txt,subs){var j,len,repl,stxt,tag,tagpat;//---------
stxt=txt;for(j=0,len=subs.length;j<len;j++){[tag,repl]=subs[j];tagpat=`___${tag}___`;// RE flags: global, multiline.
stxt=stxt.replace(new RegExp(tagpat,"gm"),repl);if(typeof lggr.trace==="function"){lggr.trace(`Shader: text substitution: \"${tagpat}\" --> \"${repl}\"`);}}return stxt;}};// Export
cwaenv.add(Shader,"Shader");// (End Shader.coffee)
}).call(this);// -------- AvImage.DOM.js --------
// Generated by CoffeeScript 2.6.1
(function(){var AvImage,Logger,cwaenv,lggr;cwaenv=this.getCWAEnv();Logger=cwaenv.get("Logger");lggr=Logger.get("Animate");//   Thin wrapper for DOM Image
AvImage=class AvImage{constructor(){this.image=new Image();this.DOMImage=true;}setSrc(theSrc){this.src=theSrc;return this.image.src=theSrc;}setOnLoad(theOnLoad){return this.image.onload=theOnLoad;}};// Export
cwaenv.add(AvImage,"AvImage");// (End AvImage.DOM.coffee)
}).call(this);// -------- Texture.js --------
// Generated by CoffeeScript 2.6.1
(function(){var AvImage,Data,Logger,Texture,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("Animate");Data=cwaenv.get("Data");AvImage=cwaenv.get("AvImage");//------------
Texture=class Texture{//------------
//   The Texture constructor's second argument is no longer the texture
//   URL itself but a generator function for this URL.  This generator
//   function takes a single argument: a handler function for the URL,
//   which the generator will invoke when the URL is generated.
//   This mechanism allows us to use either an asynchronously generated
//   literal data URL or a conventional image file URL as the texture
//   image source.
//   @_textureImage previously added to @_texture as @_texture.image
//   @_textureImage now an AvImage which simply wraps Image [For now. JRWG]
constructor(_gl,_tURLGen,_mustFlip){this._gl=_gl;this._tURLGen=_tURLGen;this._mustFlip=_mustFlip;//----------
this._texture=this._gl.createTexture();this._textureState="loading";this._textureImage=new AvImage();this._textureImage.setOnLoad(()=>{return this._buildTexture();});this._tURLGen(this._getTextureURLHandler());}isValid(){return this._textureState==="bound";}//------
getHandle(){return this._texture;}//--------
// Returns a handler for the texture URL when it's generated: the
// handler simply attaches the generated URL (assuming it's non-null)
// as the GL texture image source.
// Again, looks like an unnecessary level of function call in constructor. JRWG
_getTextureURLHandler(){//--------------------
return turl=>{if(typeof lggr.debug==="function"){lggr.debug(`Texture: Handler for URL ${turl!=null?turl.substr(0,50):void 0}...`);}if(turl){return this._textureImage.setSrc(turl);}else{return typeof lggr.debug==="function"?lggr.debug("Texture: URL is null."):void 0;}};}_buildTexture(){var doBind,imgSrc,srcDesc;//------------
imgSrc=this._textureImage.src;if(typeof lggr.trace==="function"){lggr.trace(`Texture: _buildTexture: Image source ${imgSrc!=null?imgSrc.substr(0,50):void 0}...`);}srcDesc=Data.isDataURL(imgSrc)?"data URL":imgSrc;if(typeof lggr.info==="function"){lggr.info(`Texture: loaded from source ${srcDesc}`);}doBind=this._textureState==="binding";this._textureState="loaded";if(doBind){return this.bind();}}bind(){var ex,imgSrc,srcDesc;//---
imgSrc=this._textureImage.src;if(typeof lggr.trace==="function"){lggr.trace(`Texture: bind: Image source ${imgSrc!=null?imgSrc.substr(0,50):void 0}...`);}srcDesc=Data.isDataURL(imgSrc)?"data URL":imgSrc;switch(this._textureState){case"loading":if(typeof lggr.debug==="function"){lggr.debug(`Texture: set for binding while loading source ${srcDesc}`);}return this._textureState="binding";case"loaded":this._gl.bindTexture(this._gl.TEXTURE_2D,this._texture);if(typeof lggr.trace==="function"){lggr.trace(`Texture FLIP_Y: ${this._mustFlip}`);}this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL,this._mustFlip);try{this._gl.texImage2D(this._gl.TEXTURE_2D,0,this._gl.RGBA,this._gl.RGBA,this._gl.UNSIGNED_BYTE,this._textureImage.image);}catch(error){ex=error;// FIXME: what do we really need here?
lggr.warn(`Caught error building texture: ${ex}`);}this._gl.texParameteri(this._gl.TEXTURE_2D,this._gl.TEXTURE_MAG_FILTER,this._gl.LINEAR);this._gl.texParameteri(this._gl.TEXTURE_2D,this._gl.TEXTURE_MIN_FILTER,this._gl.LINEAR_MIPMAP_LINEAR);this._gl.generateMipmap(this._gl.TEXTURE_2D);this._gl.bindTexture(this._gl.TEXTURE_2D,null);if(typeof lggr.info==="function"){lggr.info(`Texture: bound for source ${srcDesc}`);}return this._textureState="bound";default:return lggr.warn(`Texture: unexpected state ${this._textureState} for binding source ${srcDesc}`);}}release(){var imgSrc,srcDesc;//------
imgSrc=this._textureImage.src;if(typeof lggr.trace==="function"){lggr.trace(`Texture: release: Image source ${imgSrc!=null?imgSrc.substr(0,50):void 0}...`);}srcDesc=Data.isDataURL(imgSrc)?"data URL":imgSrc;switch(this._textureState){case"binding":return this._textureState="loading";case"bound":return this._textureState="loaded";default:return lggr.warn(`Texture: unexpected state ${this._textureState} for releasing source ${srcDesc}`);}}};// Export
cwaenv.add(Texture,"Texture");// (End Texture.coffee)
}).call(this);// -------- VBO.js --------
// Generated by CoffeeScript 2.6.1
(function(){var Logger,VBO,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("WebGL");//--------
VBO=class VBO{//--------
// GL      :   WebGL context.
// elSize  :   Number of values per vertex (element)Vertex -- e.g.
//             3 for position (x, y, z).
// (data)  :   Source data array for this buffer -- typically a
//             Float32Array for vertex data,
//             or a Uint16Array for index data.
// mode    :   GL primitives mode associated with this VBO for draw
//             operations, e.g. GL.TRIANGLE_STRIP, or null if there is
//             no associated mode.
// attrLoc :   Shader attribute location associated with this VBO,
//             or null if this is not an attribute VBO.
// itemType:   GL type for each value in this VBO
// glTarget:   GL target to which this buffer should be bound  -- most
//             commonly GL.ARRAY_BUFFER.
// usage   :   GL usage pattern hint for this buffer -- most commonly
//             GL.STATIC_DRAW.
constructor(GL,elSize1,data,mode1,attrLoc,itemType,glTarget,usage1){//----------
this.GL=GL;this.elSize=elSize1;this.mode=mode1;this.attrLoc=attrLoc;this.itemType=itemType;this.glTarget=glTarget;this.usage=usage1;//   Private members
this._buffer=this.GL.createBuffer();this._nVertices=data.length/this.elSize;if(typeof lggr.trace==="function"){lggr.trace(`VBO: elSize=${this.elSize} length=${data.length} verts=${this._nVertices}`);}//   Create and initialise the buffer.
this.GL.bindBuffer(this.glTarget,this._buffer);this.GL.bufferData(this.glTarget,data,this.usage);this.GL.bindBuffer(this.glTarget,null);}static _make(gl,elSize,buf,mode,aLoc,iType,isEl,isDyn){var target,usage;//-----
target=isEl?gl.ELEMENT_ARRAY_BUFFER:gl.ARRAY_BUFFER;usage=isDyn?gl.DYNAMIC_DRAW:gl.STATIC_DRAW;return new VBO(gl,elSize,buf,mode,aLoc,iType,target,usage);}static makeStd(gl,elSize,buf,aLoc){//-------
return this._make(gl,elSize,buf,null,aLoc,gl.FLOAT,false,false);}static makeDyn(gl,elSize,buf,aLoc){//-------
return this._make(gl,elSize,buf,null,aLoc,gl.FLOAT,false,true);}static makeEls(gl,elSize,buf,mode,isByte){var iType;//-------
iType=isByte?gl.UNSIGNED_BYTE:gl.UNSIGNED_SHORT;return this._make(gl,elSize,buf,mode,null,iType,true,false);}_valueSize(){var gl,type;//---------
// NB  We only deal with the types we know about, i.e. those defined
// via the @make*() methods above.  For any other type we return -1.
gl=this.GL;type=this.itemType;if(type===gl.FLOAT){return 4;}else if(type===gl.UNSIGNED_BYTE){return 1;}else if(type===gl.UNSIGNED_SHORT){return 2;}else{return-1;}}//	Returns the WebGL handle for the buffer.
getHandle(){return this._buffer;}//--------
//	Returns the number of values per vertex (element) -- e.g. 3 for
// the (x,y,z) of a position.
getElementSize(){return this.elSize;}//-------------
//	Returns the number of vertices.
getNumVertices(){return this._nVertices;}//-------------
uploadPartialData(baseEl,data){var byteOffset;//----------------
byteOffset=baseEl*this.elSize*this._valueSize();this.GL.bindBuffer(this.glTarget,this._buffer);this.GL.bufferSubData(this.glTarget,byteOffset,data);return this.GL.bindBuffer(this.glTarget,null);}uploadNewData(data){return this.uploadPartialData(0,data);}//------------
enableAttrib(){//-----------
this.GL.enableVertexAttribArray(this.attrLoc);this.GL.bindBuffer(this.glTarget,this._buffer);this.GL.vertexAttribPointer(this.attrLoc,this.elSize,this.itemType,false,0,0);return this.GL.bindBuffer(this.glTarget,null);}disableAttrib(){//------------
return this.GL.disableVertexAttribArray(this.attrLoc);}drawElements(){//-----------
this.GL.bindBuffer(this.glTarget,this._buffer);this.GL.drawElements(this.mode,this._nVertices,this.itemType,0);return this.GL.bindBuffer(this.glTarget,null);}};// Export
cwaenv.add(VBO,"VBO");// (End VBO.coffee)
}).call(this);// -------- E3Vec.js --------
// Generated by CoffeeScript 2.6.1
(function(){var E3Vec,Logger,RQ,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("Maths");//   E3Vec and RotQuat are mutually dependent, so E3Vec must
//   depend on RotQuat to fix this forward reference, via
//   E3Vec.setRotQuat() below.
RQ=void 0;// Forward reference, to be fixed by RotQuat.
E3Vec=function(){//----------
class E3Vec{//----------
constructor(x,y,z){this.xyz=new Float32Array([x,y,z]);}//----------
// Fix forward reference.
static setRotQuat(rq){return RQ=rq;}//----------
//========  String representations.  ========
//   Returns a string for (float) x with n fractional digits.
static fStr(x,n){return x.toFixed(n);}//----
//   Returns a string for (float) x with 3 fractional digits.
static fStr3(x){return this.fStr(x,3);}//-----
//   Returns a string for the given XYZ vector, with the given
//   number of fractional digits for each component.
static vStr(xyz,n){var t,xs,ys,zs;//----
[xs,ys,zs]=function(){var i,len1,results;results=[];for(i=0,len1=xyz.length;i<len1;i++){t=xyz[i];results.push(this.fStr(t,n));}return results;}.call(this);return`<${xs} ${ys} ${zs}>`;}//========  XYZ vector operations.  ========
//   Returns a new 3-vector of floats (Float32Array), initially all zero.
static make3Vec(){return new Float32Array(3);}//------
//   Returns a new 4-vector of floats (Float32Array), initially all zero.
static make4Vec(){return new Float32Array(4);}//------
//   Returns a new XYZ vector created from the given x,y,z values.
static makeV3(x,y,z){return new Float32Array([x,y,z]);}//------
//   Returns a new copy of the given XYZ vector.
static copyOfV3(xyz){return new Float32Array(xyz);}//--------
//   Copies the given values to the given XYZ vector, and returns
//   the vector itself.
static setV3_xyz(xyz,x,y,z){xyz[0]=x;xyz[1]=y;xyz[2]=z;return xyz;}//---------
//   Copies the second (RHS) XYZ vector to the first (LHS), and
//   returns the latter.
static setV3(xyz,xyzb){var xb,yb,zb;//-----
[xb,yb,zb]=xyzb;xyz[0]=xb;xyz[1]=yb;xyz[2]=zb;return xyz;}//   Adds the second (LHS) XYZ vector to the first (RHS), and returns
//   the first.
static setAddV3(xyz,xyzb){var xb,yb,zb;//--------
[xb,yb,zb]=xyzb;xyz[0]+=xb;xyz[1]+=yb;xyz[2]+=zb;return xyz;}//   Returns the sum of the given pair XYZ vectors as a new XYZ vector.
static addV3(xyza,xyzb){return this.setAddV3(this.copyOfV3(xyza),xyzb);}//-----
//   Subtracts the second (LHS) XYZ vector from the first (RHS), and
//   returns the first.
static setSubtractV3(xyz,xyzb){var xb,yb,zb;//-------------
[xb,yb,zb]=xyzb;xyz[0]-=xb;xyz[1]-=yb;xyz[2]-=zb;return xyz;}//   Returns the difference between the given pair of XYZ vectors
//   (i.e. second subtracted from first) as a new XYZ vector.
static subtractV3(xyza,xyzb){return this.setSubtractV3(this.copyOfV3(xyza),xyzb);}//----------
//   Returns the inner product of given pair of XYZ vectors.
static dotProductV3(xyza,xyzb){var xa,xb,ya,yb,za,zb;//------------
[xa,ya,za]=xyza;[xb,yb,zb]=xyzb;return xa*xb+ya*yb+za*zb;}//   Returns the square of the given XYZ vector's length (in E3 space).
static squaredLengthV3(xyz){return this.dotProductV3(xyz,xyz);}//--------------
//   Returns the given XYZ vector's length (in E3 space).
static lengthV3(xyz){return Math.sqrt(this.squaredLengthV3(xyz));}//--------
static projectionV3(xyza,xyzb){//------------
return this.dotProductV3(xyza,xyzb)/this.lengthV3(xyzb);}//   Multiplies the given XYZ vector by the given scalar, and returns
//   the vector itself.
static setScaleV3(xyz,s){xyz[0]*=s;xyz[1]*=s;xyz[2]*=s;return xyz;}//----------
//   Divides the given XYZ vector by the given scalar, and returns
//   the vector itself.
static setInverseScaleV3(xyz,s){xyz[0]/=s;xyz[1]/=s;xyz[2]/=s;return xyz;}//-----------------
//   Negates the given XYZ vector, and returns the vector itself.
static setNegateV3(xyz){var x,y,z;[x,y,z]=xyz;return this.setV3_xyz(xyz,-x,-y,-z);}//-----------
//   Normalizes this XYZ vector, that is, scales it to unit length --
//   unless it is approximately zero, in which case it is left unchanged
//   -- and returns the vector itself.
static setNormalizeV3(xyz){var len;//--------------
len=this.lengthV3(xyz);if(1e-5<=len){return this.setInverseScaleV3(xyz,len);}else{return xyz;}}//   Returns a normalized copy of the given XYZ vector -- unless it
//   it is approximately zero, in which case an exact copy is returned.
static normalizeV3(xyza){return this.setNormalizeV3(this.copyOfV3(xyza));}//-----------
//   Computes the cross product of the first XYZ vector with the second,
//   updates the first with this product, and returns the first vector
//   itself.
static setCrossProductV3(xyz,xyzb){var xa,xb,ya,yb,za,zb;//----------
[xa,ya,za]=xyz;[xb,yb,zb]=xyzb;return this.setV3_xyz(xyz,ya*zb-za*yb,za*xb-xa*zb,xa*yb-ya*xb);}//   Returns a new XYZ vector containing the vector product of the
//   given pair of XYZ vectors.
static crossProductV3(xyza,xyzb){//--------------
return this.setCrossProductV3(this.copyOfV3(xyza),xyzb);}//   Sets the first of the given XYZ vectors to be the cross product of
//   that vector with the second, scaled to unit length -- unless the
//   vectors are approximately parallel, in which case the scaling is
//   omitted.
static setUnitCrossProductV3(xyz,xyzb){//---------------------
return this.setNormalizeV3(this.setCrossProductV3(xyz,xyzb));}//   Returns a new unit XYZ vector containing the vector product of the
//   given pair of XYZ vectors, scaled to unit length.
static unitCrossProductV3(xyza,xyzb){//------------------
return this.setUnitCrossProductV3(this.copyOfV3(xyza),xyzb);}static setRotateV3(xyz,qv){return RQ.rotateV3(xyz,xyz,qv);}//-----------
//========  3D vector creation/generation.  ========
//   Returns a new 3D vector with the given component values.
static from_xyz(x,y,z){return new E3Vec(x,y,z);}//--------
//   Returns a new 3D vector, copied from the given XYZ vector.
static fromV3(xyz){var x,y,z;[x,y,z]=xyz;return new E3Vec(x,y,z);}//------
//   Returns a new 3D vector, copied from the given one.
static fromE3V(e3v){return this.fromV3(e3v.xyz);}//-------
static fromVec(xyz){return this.fromV3(xyz);}//-------
static create(){return new E3Vec(0,0,0);}//----
//========  XYZ vector accessors.  ========
x(){return this.xyz[0];}y(){return this.xyz[1];}z(){return this.xyz[2];}//   Returns a new XYZ vector (Float32Array) containing a copy of this
//   3D vector.
copyXYZ(){return E3Vec.copyOfV3(this.xyz);}//------
//   Copies this 3D vector to the given XYZ vector.
toXYZ(xyz){return E3Vec.setV3(xyz,this.xyz);}//----
//   Copies this 3D vector to the given XYZ vector.
toV3(xyz){return E3Vec.setV3(xyz,this.xyz);}//---
//   Returns a string representation for this 3D vector.
toStr(){return this.asString();}//----
//   Returns a string representation for this 3D vector.
asString(){var x,y,z;[x,y,z]=this.xyz;return`<${x} ${y} ${z}>`;}//-------
//   Returns a string representation for this 3D vector, with fraction
//   lengths limited to n.
asString_n(n){return E3Vec.vStr(this.xyz,n);}//---------
//   Returns a string representation for this 3D vector, with fraction
//   lengths limited to 4.
asString4(){return this.asString_n(4);}//--------
//   Copies the given component values to this 3D vector, and returns
//   this vector itself.
set_xyz(x,y,z){E3Vec.setV3_xyz(this.xyz,x,y,z);return this;}//------
//   Copies the given XYZ vector to this 3D vector, and returns this
//   vector itself.
setVec(xyz){E3Vec.setV3(this.xyz,xyz);return this;}//-----
//   Copies the given 3D vector to this one, and returns this vector itself.
setFromE3V(e3v){E3Vec.setV3(this.xyz,e3v.xyz);return this;}//---------
//========  Algebraic operations, not changing this 3D vector [UNUSED ? ].  ========
//   Returns a new 3D vector obtained by adding the given XYZ vector to
//   this 3D vector.
//   Was addVec()
addXYZ(xyz){return E3Vec.fromV3(E3Vec.setAddV3(E3Vec.copyOfV3(this.xyz),xyz));}//-----
//   Returns a new 3D vector obtained by adding the given one to this one.
add(e3v){return this.addXYZ(e3v.xyz);}//--
dotProduct(e3v){return E3Vec.dotProductV3(this.xyz,e3v.xyz);}//---------
//========  Algebraic operations modifying this 3D vector.  ========
//   Negates this 3D vector, and returns the vector itself.
setNegate(){E3Vec.setNegateV3(this.xyz);return this;}//--------
//   Adds the given 3D vector to this one, and returns this one. -- UNUSED
setAdd(e3v){E3Vec.setAddV3(this.xyz,e3v.xyz);return this;}//-----
//   Sets this 3D vector to be the vector product of itself with the
//   given 3D vector, and returns (thus modified) this vector itself.
setCrossProduct(e3v){E3Vec.setCrossProductV3(this.xyz,e3v.xyz);return this;}//-----------
//   Sets this 3D vector to be the vector product of itself with the
//   given 3D vector, scaled to unit length, and returns (thus modified)
//   this vector itself.
setUnitCrossProduct(e3v){//---------------
E3Vec.setUnitCrossProductV3(this.xyz,e3v.xyz);return this;}//   Applies the given rotation quaternion to this 3D vector, and
//   returns this vector itself.
setRotate(rq){E3Vec.setRotateV3(this.xyz,rq.xyzw);return this;}//--------
//   Returns the length of the projection of this 3D vector on the
//   given one.
projectionOn(e3v){return E3Vec.projectionV3(this.xyz,e3v.xyz);}//-----------
//   Returns the length (in E3 space) of this 3D vector.
xyzLength(){return E3Vec.lengthV3(this.xyz);}//--------
//   Returns the square of the length (in E3 space) of this 3D vector.
squaredLength(){return E3Vec.squaredLengthV3(this.xyz);}};//------
//========  Standard/useful fixed XYZ vector.  Unused ========
E3Vec.ZERO=new E3Vec(0,0,0);return E3Vec;}.call(this);//------------
// Export
cwaenv.add(E3Vec,"E3Vec");// (End E3Vec.coffee)
}).call(this);// -------- RotQuat.js --------
// Generated by CoffeeScript 2.6.1
(function(){var Logger,RotQuat,V3,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("Maths");V3=cwaenv.get("E3Vec");RotQuat=function(){var RQ;//------------
class RotQuat{//------------
//   Constructs a new rotation quaternion, initially representing
//   the identity rotation.
constructor(){this.xyzw=new Float32Array(4);this.xyzw[3]=1;}//========  String representations.  ========
//   Returns a string for (float) x with n fractional digits.
static fStr(x,n){return x.toFixed(n);}//----
//   Returns a string for (float) x with 3 fractional digits.
static fStr3(x){return this.fStr(x,3);}//-----
//   Returns a string for the given quaternion vector, with the given
//   number of fractional digits for each component.
static qStr(qv,n){var t,w,x,y,z;//----
[x,y,z,w]=function(){var j,len,results;results=[];for(j=0,len=qv.length;j<len;j++){t=qv[j];results.push(this.fStr(t,n));}return results;}.call(this);return`<${x} ${y} ${z}; ${w}>`;}//========  Quaternion vector operations.  ========
//   Returns a new quaternion vector created from the given x,y,z,w values.
static makeQV(x,y,z,w){return new Float32Array([x,y,z,w]);}//------
//   Returns a new copy of the given quaternion vector.
static copyOfQV(qv){return new Float32Array(qv);}//--------
//   Copies the given values to the given quaternion vector, and returns
//   the vector itself.
static setQV_xyzw(qv,x,y,z,w){qv[0]=x;qv[1]=y;qv[2]=z;qv[3]=w;return qv;}//----------
//   Copies the second (RHS) quaternion vector to the first (LHS), and
//   returns the latter.
static setQV(qv,qq){var w,x,y,z;//-------
[x,y,z,w]=qq;qv[0]=x;qv[1]=y;qv[2]=z;qv[3]=w;return qv;}//   Sets the given quaternion vector to represent a rotation on the
//   given unit vector axis by the given angle, and returns the
//   quaternion vector itelf.
static setAxisAngleQV(qv,xyz,angle){var halfA,sinHA,ux,uy,uz;//--------------
// The quaternion representing the rotation is
//   q = cos(A/2) + sin(A/2)*(x*i + y*j + z*k)
// ASSERT: xyz.length() == 1;
[ux,uy,uz]=xyz;halfA=0.5*angle;sinHA=Math.sin(halfA);return this.setQV_xyzw(qv,sinHA*ux,sinHA*uy,sinHA*uz,Math.cos(halfA));}//   Scales the given quaternion vector by the given number, and returns
//   the vector itself.
static setScaleQV(qv,s){qv[0]*=s;qv[1]*=s;qv[2]*=s;qv[3]*=s;return qv;}//----------
//   Returns a new quaternion vector containing the given one scaled
//   by the given number.
static scaleQV(q,s){var qv;qv=this.copyOfQV(q);return this.setScaleQV(qv,s);}//-------
//   Negates the given quaternion vector, and returns the vector itself.
static setNegateQV(qv){//-----------
qv[0]=-qv[0];qv[1]=-qv[1];qv[2]=-qv[2];qv[3]=-qv[3];return qv;}//   Returns a new quaternion vector containing the negation of the
//   given one.
static negateQV(q){var qv;qv=this.copyOfQV(q);return this.setNegateQV(qv);}//--------
//   Adds the second (RHS) quaternion vector to the first (LHS), and
//   returns the first vector.
static setAddQV(qv,qq){//--------
qv[0]+=qq[0];qv[1]+=qq[1];qv[2]+=qq[2];qv[3]+=qq[3];return qv;}//   Returns a new quaternion vector containing the sum of the given
//   pair.
static addQV(qa,qb){var qv;qv=this.copyOfQV(qa);return this.setAddQV(qv,qb);}//-----
//   Subtracts the second (RHS) quaternion vector from the first (LHS),
//   and returns the first vector.
static setSubtractQV(qv,qq){//-------------
qv[0]-=qq[0];qv[1]-=qq[1];qv[2]-=qq[2];qv[3]-=qq[3];return qv;}//   Returns a new quaternion vector containing the difference between
//   the first and the second of the given pair.
static subtractQV(qa,qb){var qv;qv=this.copyOfQV(qa);return this.setSubtractQV(qv,qb);}//----------
//   Sets this quaternion vector to be its own conjugate, and returns
//   the vector itself.
static setConjugateQV(qv){V3.setNegateV3(qv);return qv;}//--------------
//   Returns a new quaternion vector containing the conjugate of this one.
static conjugateQV(qa){var qv;qv=this.copyOfQV(qa);return this.setConjugateQV(qv);}//-----------
//   Returns the inner product of the given pair of quaternion vectors.
static innerProductQV(qa,qb){//--------------
return qa[0]*qb[0]+qa[1]*qb[1]+qa[2]*qb[2]+qa[3]*qb[3];}//   Computes the quaternion product of the second and third of the
//   given quaternions, and assigns the result to the first.
//   This is the (non-commutative) product defined by:
//      <a;U> * <b;V>  =  <ab - U.V; aV + bU + U x V>
//   where a, b are scalars, U, V are 3-vectors, . denotes
//   inner product, and x denotes cross-product.
static setProductQV(qv,qa,qb){var aw,ax,ay,az,bw_,bx_,by_,bz_;//------------
// The underscores are irritating but they avoid having the CS
// compiler see the "by" keyword instead of a variable name.
ax=qa[0];ay=qa[1];az=qa[2];aw=qa[3];bx_=qb[0];by_=qb[1];bz_=qb[2];bw_=qb[3];return this.setQV_xyzw(qv,aw*bx_+ax*bw_+ay*bz_-az*by_,aw*by_+ay*bw_+az*bx_-ax*bz_,aw*bz_+az*bw_+ax*by_-ay*bx_,aw*bw_-ax*bx_-ay*by_-az*bz_);}//   Returns the length of the given quaternion vector.
static lengthQV(qv){return Math.sqrt(this.innerProductQV(qv,qv));}//--------
//   Normalises the given quaternion vector, unless its length is close
//   to zero in which case it is left unchanged.
static setNormalizeQV(qv){var lensq;//--------------
// Do nothing if qv is too close to zero.
lensq=this.innerProductQV(qv,qv);if(1e-12<lensq){return setScaleQV(qv,1/Math.sqrt(lensq));}else{return qv;}}//   Computes the SLerp (spherical linear interpolation) with the given
//   fraction T of the second and third of the given rotation
//   quaternion vectors, and assigns the result to the first of the
//   given vectors.
static slerpQV(qv,qa,qb,T){var ONE,T_COMP,cosOmega,doLinear,omega,qb_,sA,sB,sinOmega,sinSqOmega;//-------
ONE=1;T_COMP=ONE-T;// Omega is the angle of the interval (on the unit hypersphere)
// over which we are to interpolate.
cosOmega=this.innerProductQV(qa,qb);// Adjust if necessary to ensure |omega| < PI / 2.
// (There is no loss of generality in this, since, for any
// quaternion q: q and -q represent the same 3D rotation.)
qb_=qb;if(cosOmega<0){cosOmega=-cosOmega,qb_=this.negateQV(qb);}// Compute the interpolation weights.
// When qa, qb are very close, we need to avoid numerical instability
// when sinOmega is at or close to zero: in that case just do linear
// interpolation (with subsequent re-normalization -- see below).
doLinear=ONE-cosOmega<1e-5;if(doLinear){sA=T_COMP;sB=T;}else{sinSqOmega=1-cosOmega*cosOmega;sinOmega=sinSqOmega/Math.sqrt(sinSqOmega);omega=Math.atan2(sinOmega,cosOmega);sA=Math.sin(omega*T_COMP)/sinOmega;sB=Math.sin(omega*T)/sinOmega;}// Assign the weighted sum for the interpolation to qq.
this.setQV_xyzw(qv,qa[0]*sA+qb_[0]*sB,qa[1]*sA+qb_[1]*sB,qa[2]*sA+qb_[2]*sB,qa[3]*sA+qb_[3]*sB);if(doLinear){// Re-normalize the result if we did linear scaling above.
return RotQuat.setNormaliseQV(qv);}}static rotateV3(v3r,v3,qv){var _u,_uX_uXv,_uXv,_v,udotv,w;//--------
//  q v q* = < 0; (u.v)u + (w^2)v + 2w(u x v) + u x (u x v) >
//  where qv = q = <w;u> and x denotes cross product.
//  v3r is result vector, v3 is operand (v).
_v=V3.copyOfV3(v3);_u=qv;w=qv[3];udotv=V3.dotProductV3(_u,_v);_uXv=V3.setCrossProductV3(V3.copyOfV3(_u),_v);_uX_uXv=V3.setCrossProductV3(V3.copyOfV3(_u),_uXv);V3.setV3(v3r,_u);V3.setScaleV3(v3r,udotv);V3.setScaleV3(_v,w*w);V3.setAddV3(v3r,_v);V3.setScaleV3(_uXv,2*w);V3.setAddV3(v3r,_uXv);return V3.setAddV3(v3r,_uX_uXv);}static rotateV3_(vr,v,q){var ab,c,cx,cy,cz,d,i,j,results,ux,uy,uz,vx,vy,vz,w,w2,ww;//---------
[vx,vy,vz]=v;[ux,uy,uz,w]=q;ww=w*w;w2=w+w;//a=  [ux*ux*vx, uy*uy*vy, uz*uz*vz]           # (u.v)u
//b=  [ww*vx, ww*vy, ww*vz]                    # (w^2)v
ab=ab=[(ux*ux+ww)*vx,(uy*uy+ww)*vy,(uz*uz+ww)*vz];[cx,cy,cz]=c=[uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx// u x v
];c[0]*=w2;c[1]*=w2;c[2]*=w2;d=[uy*cz-uz*cy,uz*cx-ux*cz,ux*cy-uy*cx// u x (u x v)
];results=[];for(i=j=0;j<3;i=++j){results.push(vr[i]=ab[i]+c[i]+d[i]);}return results;}//========  Quaternion vector to matrix conversions.  ========
//   Populates the given 4x4 (column major) TR matrix so that it
//   represents the same rotation as the given quaternion vector,
//   with a zero transform -- so the final (T) column is set to
//   [0,0,0,1], but the bottom-left 3-vector is left untouched.
static setTRMat4x4FromQV(m,qv){return this._setTRMatFromQV(m,qv,true,false,true);}//-----------------
//   Populates the given 4x4 (column major) TR matrix so that it
//   represents the same rotation as the given quaternion vector --
//   leaving its final (T) column and bottom row untouched.
static setRotMat4x4FromQV(m,qv){return this._setTRMatFromQV(m,qv,true,false,false);}//------------------
//   Populates the given 3x3 (column major) rotation matrix so that it
//   represents the same rotation as the given quaternion vector.
static setRotMat3x3FromQV(m,qv){return this._setTRMatFromQV(m,qv,true,true);}//------------------
//   Populates the first three rows of the given 4x4 (row major) TR
//   matrix so that it represents the same rotation as the given
//   quaternion vector, with a zero transform -- so the final (T)
//   column 3-vector is set to [0,0,0], and the entire bottom row is
//   left untouched.
//   Populates the upper right 3x3 submatrix the given 4x4 (row major)
//   TR matrix so that it represents the same rotation as the given
//   quaternion vector, leaving the final row and final column entirely
//   untouched.
static setRotMatRows3x4FromQV(m,qv){//----------------------
return this._setTRMatFromQV(m,qv,false,false,false);}static setRotMat4x4TransposeFromQV(m,qv){//---------------------------
this._setTRMatFromQV(m,qv,false,false,true);m[12]=m[13]=m[14]=0;return m;}//   Internal helper method.
static _setTRMatFromQV(m,qv,m_is_col_maj,m_is_3x3,do_t_4x4){var WX_2,WY_2,WZ_2,XX_2,XY_2,XZ_2,X_2,YY_2,YZ_2,Y_2,ZZ_2,Z_2,m00,m01,m02,m10,m11,m12,m20,m21,m22,ww,xx,yy,zz;//---------------
// Build products, with 2, and with other fields.
[xx,yy,zz,ww]=qv;X_2=xx+xx;Y_2=yy+yy;Z_2=zz+zz;WX_2=ww*X_2;WY_2=ww*Y_2;WZ_2=ww*Z_2;XX_2=xx*X_2;XY_2=xx*Y_2;XZ_2=xx*Z_2;YY_2=yy*Y_2;YZ_2=yy*Z_2;ZZ_2=zz*Z_2;// Define fields of 3 x 3 matrix (pre-multiply)
// ---- First row ----
m00=1-YY_2-ZZ_2;m01=XY_2-WZ_2;m02=XZ_2+WY_2;// ---- Second row ----
m10=XY_2+WZ_2;m11=1-XX_2-ZZ_2;m12=YZ_2-WX_2;// ---- Third row ----
m20=XZ_2-WY_2;m21=YZ_2+WX_2;m22=1-XX_2-YY_2;if(m_is_col_maj){if(m_is_3x3){// Column-major 3x3 matrix (each line is one column).
m[0]=m00;m[1]=m10;m[2]=m20;m[3]=m01;m[4]=m11;m[5]=m21;m[6]=m02;m[7]=m12;m[8]=m22;}else{// Column-major 4x4 matrix (each line is [start of] one column).
m[0]=m00;m[1]=m10;m[2]=m20;m[4]=m01;m[5]=m11;m[6]=m21;m[8]=m02;m[9]=m12;m[10]=m22;if(do_t_4x4){//== Note the guard. ==
m[12]=m[13]=m[14]=0,m[15]=1;}}}else{// Row-major 4x4 matrix (each line is one row).
// ... and leave m3[012] untouched.
m[0]=m00;m[1]=m01;m[2]=m02;// m[ 3]
m[4]=m10;m[5]=m11;m[6]=m12;// m[ 7]
m[8]=m20;m[9]=m21;m[10]=m22;// m[11]
if(do_t_4x4){//== Note the guard. ==
m[3]=m[7]=m[11]=0,m[15]=1;}}// ... and leave m3[012] untouched.
return m;}//========  Rotation quaternion creation/generation.  ========
//   Returns a new rotation quaternion with the given component values.
static from_xyzw(x,y,z,w){var q;q=new RQ();this.setQV_xyzw(q.xyzw,x,y,z,w);return q;}//---------
//   Returns a new rotation quaternion, copied from the given
//   quaternion vector.
static fromQV(qv){var q;q=new RQ();this.setQV(q.xyzw,qv);return q;}//------
//   Returns a new rotation quaternion, copied from the given one.
static fromRQ(q){return this.fromQV(q.xyzw);}//------
//   Returns a new rotation quaternion representing the rotation
//   on the given unit vector axis by the given angle (in radians).
static fromRot(axis,angle){var q;//-------
q=new RQ();q.setFromAxisAngle(axis,angle);return q;}//   Creates and returns a new identity rotation quaternion.
static create(){return this.from_xyzw(0,0,0,1);}//------
//   Returns a new rotation quaternion representing the rotation
//   defined by the given "Euler angle" values -- that is, roll, pitch,
//   yaw -- in degrees.
static fromRPY(roll,pitch,yaw){var q;//-------
q=new RQ();q.setFromAxisRotations(roll,pitch,yaw);return q;}//   Updates the first of the given rotation quaternions with the
//   result of a SLerp (spherical linear interpolation) operation, with
//   the given fraction T, between the second and third of the given
//   rotation quaternions.
static slerp(q,qa,qb,T){return this.slerpQV(q.xyzw,qa.xyzw,qb.xyzw,T);}//--------------------
//========  Rotation quaternion accessors.  ========
//   Returns a new Float32Array [x,y,z,w] containing a copy of this
//   rotation quaternion.
copyXYZW(){return RQ.copyOfQV(this.xyzw);}//-------
//   Copies the components of this rotation quaternion into the given
//   [x,y,z,w] array.
toQV(xyzw){return RQ.setQV(xyzw,this.xyzw);}//---
//   Returns a string representation for this rotation quaternion.
asString(){var w,x,y,z;[x,y,z,w]=this.xyzw;return`<${x} ${y} ${z}; ${w}>`;}//-------
//   Returns a string representation for this rotation quaternion, with
//   fraction lengths limited to n.
asString_n(n){return RQ.qStr(this.xyzw,n);}//-------
//   Returns a string representation for this rotation quaternion, with
//   fraction lengths limited to 4.
asString4(){return this.asString_n(4);}//--------
//   Copies the given component values to this rotation quaternion, and
//   returns this rotation quaternion.
set_xyzw(x,y,z,w){RQ.setQV_xyzw(this.xyzw,x,y,z,w);return this;}//-------
//   Copies the given quaternion vector to this rotation quaternion, and
//   returns this rotation quaternion.
setVec(qv){RQ.setQV(this.xyzw,qv);return this;}//-----
//   Copies the given rotation quaternion vector to this one, and
//   returns this one.
setFromRQ(q){RQ.setQV(this.xyzw,q.xyzw);return this;}//--------
//   Sets this to be a rotation on the given unit vector axis by the
//   given angle, and returns this rotation quaternion.
setFromAxisAngle(xyz,angle){//---------------
RQ.setAxisAngleQV(this.xyzw,xyz,angle);return this;}//========  Rotating a 3D vector.  ========
//   Applies this rotation to the given 3D vector, and returns the
//   (thus modified) vector.
rotate(e3v){RQ.rotateV3(e3v.xyz,e3v.xyz,this.xyzw);return e3v;}//-----
rotate_(e3v){RQ.rotateV3_(e3v.xyz,e3v.xyz,this.xyzw);return e3v;}//-----
//========  Algebraic operations, not changing this rotation.  ========
/*  [UNUSED]
*   Returns the sum of this quaternion and the given one.
add: (q) -> RQ.addQV @xyzw, q.xyzw
#--
*   Returns the result of subtracting the given quaternion from this one.
subtract: (q) -> RQ.subtractQV @xyzw, q.xyzw
#-------
*   Returns the inner product of this rotation quaternion with the
*   given one.
innerProduct: (q) -> innerProductQV @xyzw, q.xyzw
#-----------
*/postMultiply(q){var qp;//-----------
//   Returns the quaternion product of this quaternion with the given one.
qp=new RQ();RQ.setProductQV(qp.xyzw,this.xyzw,q.xyzw);return qp;}//   Returns the quaternion product of the given quaternion with this one.
preMultiply(q){var qp;//-----------
qp=new RQ();RQ.setProductQV(qp.xyzw,q.xyzw,this.xyzw);return qp;}//========  Algebraic operations modifying this rotation.  ========
//   Negates this rotation, and returns the rotation itself.
setNegate(){RQ.setNegateQV(this.xyzw);return this;}//--------
//   Inverts this rotation, and returns the rotation itself.
setInvert(){RQ.setConjugateQV(this.xyzw);return this;}//--------
//   Post-multiplies this rotation by the given one, and returns this one.
setPostMultiply(q){RQ.setProductQV(this.xyzw,this.xyzw,q.xyzw);return this;}//--------------
//   Pre-multiplies this rotation by the given one, and returns this one.
setPreMultiply(q){RQ.setProductQV(this.xyzw,q.xyzw,this.xyzw);return this;}//-------------
//   Scales this rotation by the specified fraction, and returns this
//   rotation.
setScaleRot(T){var RQID;//----------
// Make two common cases fast.
RQID=RQ.IDENTITY;if(T===0){this.setFromRQ(RQID);}else if(T!==1){RQ.slerp(this,RQID,this,T);}else{}return this;}//========  Special operations for x-axis rotations.  ========
//   Decomposes this rotation into a product of the form q'*q_x,
//   where q_x is a rotation on the x-axis, that is, a roll (and q'
//   is a rotation on some axis in the yz-plane), and then sets
//   this rotation quaternion to be q_x.
setExtractRotX(){var c,d,s;//-------------
s=this.xyzw[0];c=this.xyzw[3];d=Math.sqrt(s*s+c*c);return this.set_xyzw(s/d,0,0,c/d);}//   Assuming this is a rotation on the x-axis, that is, this is
//   of the form <w;xyz> = <cos A/2; (sin A/2) 0 0>, this method
//   updates this rotation by scaling its angle by the given factor.
setScaleXRotationAngle(scale){var scA;//---------------------
// ASSERT:  0.0 <= scale <= 1.0  AND  this.y == this.z == 0
scA=scale*Math.atan2(this.xyzw[0],this.xyzw[3]);this.xyzw[0]=Math.sin(scA);return this.xyzw[3]=Math.cos(scA);}//   Negates the X-component of this rotation.  On the assumption
//   that is a rotation on the x-axis, this amounts to setting this
//   rotation to its own inverse.
setInvertX(){return this.xyzw[0]=-this.xyzw[0];}//---------
//========  Rotation matrix conversions.  ========
//   Sets this rotation quaternion to represent the rotation defined by
//   the given orthonormal 3x3 (column major) matrix.
setFromRotMat3x3(m){var DIV_4W,EPS,SQRT_T,T,dorotx,doroty,dorotz,tx,ty,tz;//---------------
// The given matrix is :
//    m[0]  m[3]  m[6]        m00  m01  m02
//    m[1]  m[4]  m[7]   ==   m10  m11  m12
//    m[2]  m[5]  m[8]        m20  m21  m22
EPS=1e-4;[tx,ty,tz]=[m[0],m[4],m[8]];T=tx+ty+tz+1;if(1<=T+EPS){// Normal case: 1 <= T
SQRT_T=Math.sqrt(T);DIV_4W=0.5/SQRT_T;this.set_xyzw((m[5]-m[7])*DIV_4W,(m[6]-m[2])*DIV_4W,(m[1]-m[3])*DIV_4W,0.5*SQRT_T);// m21 - m12 // m02 - m20 // m10 - m01
}else{// To avoid instability, we need to adjust both the matrix
// m and the quaternion (this) by introducing a prior
// rotation by PI about one of the three axes (X, Y or Z).
// First, decide which axis by finding the one with the
// largest t-value:
dorotx=doroty=dorotz=false;if(tz<=ty){if(ty<=tx){dorotx=true;}else{doroty=true;}}else{if(tz<=tx){dorotx=true;}else{dorotz=true;}}if(dorotx){this._setFromMatWithXRot(m);}else if(doroty){this._setFromMatWithYRot(m);}else if(dorotz){this._setFromMatWithZRot(m);}}return this;}//   Support for @setFromRotMat3x3 -- for the case where there is a
//   prior rotation by PI on the X-axis.
_setFromMatWithXRot(m){var DIV_4Wx,SQRT_Tx,Tx,tx,ty,tz;//------------------
[tx,ty,tz]=[m[0],m[4],m[8]];// Pre-rotate by PI around X: M_x is m  but with columns 1 and 2
// negated.
Tx=tx-ty-tz+1;// 1 <= Tx
SQRT_Tx=Math.sqrt(Tx);DIV_4Wx=0.5/SQRT_Tx;// If Q_x = <w';x'y'z'> is the rotation quaternion obtained from
// M_x then the final result is
//     <w;xyz> = Q_x * <0;100> = <-x';w'z'-y'>
return this.set_xyzw(0.5*SQRT_Tx,(m[1]+m[3])*DIV_4Wx,(m[6]+m[2])*DIV_4Wx,(m[5]-m[7])*DIV_4Wx);//              (x) // m10 + m01    (y) // m02 + m20    (z) // m21 - m12    (w)
}//   Support for @setFromRotMat3x3 -- for the case where there is a
//   prior rotation by PI on the Y-axis.
_setFromMatWithYRot(m){var DIV_4Wy,SQRT_Ty,Ty,tx,ty,tz;//------------------
[tx,ty,tz]=[m[0],m[4],m[8]];// Pre-rotate by PI around Y: M_y is m  but with columns 0 and 2
// negated.
Ty=-tx+ty-tz+1;// 1 <= Ty
SQRT_Ty=Math.sqrt(Ty);DIV_4Wy=0.5/SQRT_Ty;// If Q_y = <w';x'y'z'> is the rotation quaternion obtained from
// M_y then the final result is
//     <w;xyz> = Q_y * <0;010> = <-y';-z'w'x'>
return this.set_xyzw((m[1]+m[3])*DIV_4Wy,0.5*SQRT_Ty,(m[5]+m[7])*DIV_4Wy,(m[6]-m[2])*DIV_4Wy);// m10 + m01    (x) //              (y) // m21 + m12    (z) // m02 - m20    (w)
}//   Support for @setFromRotMat3x3 -- for the case where there is a
//   prior rotation by PI on the Z-axis.
_setFromMatWithZRot(m){var DIV_4Wz,SQRT_Tz,Tz,tx,ty,tz;//------------------
[tx,ty,tz]=[m[0],m[4],m[8]];// Pre-rotate by PI around Z: M_z is m  but with columns 0 and 1
// negated.
Tz=-tx-ty+tz+1;// 1 <= Tz
SQRT_Tz=Math.sqrt(Tz);DIV_4Wz=0.5/SQRT_Tz;// If Q_z = <w';x'y'z'> is the rotation quaternion obtained from
// M_z then the final result is
//     <w;xyz> = Q_z * <0;001> = <-z';y'-x'w'>
// Multiply result by Q_z (defined by <w;xyz>=<0;001>).
return this.set_xyzw((m[6]+m[2])*DIV_4Wz,(m[5]+m[7])*DIV_4Wz,0.5*SQRT_Tz,(m[1]-m[3])*DIV_4Wz);// m02 + m20    (x) // m21 + m12    (y) //              (z) // m10 - m01    (w)
}//   Populates the given 4x4 (column major) TR matrix so that it
//   represents the same rotation as this, with a zero transform --
//   so the final (T) column is set to [0,0,0,1], but the bottom-left
//   3-vector is left untouched.
toTRMat4x4(m){return RQ.setTRMat4x4FromQV(m,this.xyzw,true,false,true);}//---------
//   Populates the given 4x4 (column major) TR matrix so that it
//   represents the same rotation as this -- leaving its final (T)
//   column and bottom row untouched.
toRotMat4x4(m){return RQ.setRotMat4x4FromQV(m,this.xyzw,true,false,false);}//----------
//   Populates the given 3x3 (column major) rotation matrix so that it
//   represents the same rotation as this.
toRotMat3x3(m){return RQ.setRotMat3x3FromQV(m,this.xyzw,true,true);}//----------
//   Populates the upper right 3x3 submatrix the given 4x4 (row major)
//   TR matrix so that it represents the same rotation as this,
//   leaving the final row and final column entirely untouched.
toRotMatRows3x4(m){//--------------
return RQ.setRotMatRows3x4FromQV(m,this.xyzw,false,false,false);}//   Internal support method for rotation matrix generation.
//_toRotMat: (m, m_is_col_maj, m_is_3x3, do_t_4x4) ->
//--------
//  RQ._setTRMatFromQV m, @xyzw, m_is_col_maj, m_is_3x3, do_t_4x4
//========  "Euler angle" (RPY = Roll-Pitch-Yaw) conversions.  ========
//   Sets this rotation to be that defined by the given triple of
//   "Euler angle" angle values -- that is, roll, pitch, yaw -- in
//   degrees.
setFromAxisRotations(roll,pitch,yaw){var D2R_BY2,RPY_by2,cp,cr,cy,cycp,cysp,rpy,rpyb2,sp,sr,sy,sycp,sysp;//-------------------
//  The Euler-angle-to-axis bindings,and the order in which
//  the Euler angle rotations are applied are:
//          X-roll ; Y-pitch ; Z-yaw .
//  [See note below on the orientation of the notional craft.]
//  Hence to get the required quaternion components, we
//  compute the quaternion product:
//         Q-yaw  x  Q-pitch  x  Q-roll .
//  NB
//  These axis bindings assume a notional craft lying in
//  the XY-plane, with its body lying along the X-axis
//  (facing +X), with +Y on its right/starboard side, and
//  with +Z _below_ it.
//  For a craft with this orientation, an increase in ROLL
//  (from 0) dips the right/starboard wing, an increase in
//  PITCH raises the nose, and an increase in YAW turns the
//  nose to the right/starboard.
D2R_BY2=RQ.DEGS_TO_RADS/2;// Angles of rotation by 2 (i.e quaternion angles) in radians, and
// the cosines and sines of these half-angles.
RPY_by2=function(){var j,len,ref,results;ref=[roll,pitch,yaw];results=[];for(j=0,len=ref.length;j<len;j++){rpy=ref[j];results.push(rpy*D2R_BY2);}return results;}();[cr,cp,cy]=function(){var j,len,results;results=[];for(j=0,len=RPY_by2.length;j<len;j++){rpyb2=RPY_by2[j];results.push(Math.cos(rpyb2));}return results;}();[sr,sp,sy]=function(){var j,len,results;results=[];for(j=0,len=RPY_by2.length;j<len;j++){rpyb2=RPY_by2[j];results.push(Math.sin(rpyb2));}return results;}();// Compute components of Q-yaw (Z) x Q-pitch (Y)
[cycp,sysp,sycp,cysp]=[cy*cp,sy*sp,sy*cp,cy*sp];// Finally, compute the product of the three axis-rotation quaternions:
//     (cy;  0  0 sy)  *  (cp;  0 sp  0)  *  (cr; sr  0  0)
return this.set_xyzw(cycp*sr-sysp*cr,cysp*cr+sycp*sr,sycp*cr-cysp*sr,cycp*cr+sysp*sr);}//   Computes a set of "Euler angle" values in degrees -- that is,
//   a sequence of rotations, R, P, Y about the axes -- equivalent to
//   this rotation, returning these results in the given array.
toAxisRotations(rpyVec){var CP_CR,CP_SQ,CP_SR,CY,CY_CP,R2D,SP_NEG,SY_CP,SY_NEG,WW,W_SQ,XX,X_SQ,YY,Y_SQ,ZZ,Z_SQ,i,j,qv,rpy;//--------------
// Compute squares of this quaternion''s components.
qv=this.xyzw;XX=qv[0];YY=qv[1];ZZ=qv[2];WW=qv[3];[X_SQ,Y_SQ,Z_SQ,W_SQ]=[XX*XX,YY*YY,ZZ*ZZ,WW*WW];//  Extract axis-rotations from the rotation matrix components
//  corresponding to this quaternion.  The three Euler angles
//  are theta-roll (X), theta-pitch (Y), and theta-yaw (Z).
//  If cR = cos(theta-roll), sR = sin(theta-roll), etc., then the
//  relevant rotation-matrix elements are:
//      M_00 = cY*cP
//      M_10 = sP*cP
//      M_20 = -sP      M_21 = cP*sR    M_22 = cP*cR
//  but if cp = 0, i.e. if |p| = PI/2, then without loss of
//  generality we can take theta-roll = 0, and for accurate
//  computation of yaw we need to use instead:
//                      M_01 = -sY
//                      M_11 =  cY
//  which is valid in this case only.
//  [See the previous method for details of the
//   XYZ <--> ROLL-PITCH-YAW mapping.
//   But NB:
//   Here cY,sY etc. refer to the whole angles, whereas
//   in the previous method cy, sy etc. refer to the half angles
//   used in rotation quaternions,
//   i.e. cy there !== cY here, etc.]
CY_CP=W_SQ+X_SQ-Y_SQ-Z_SQ;SY_CP=2*(XX*YY+WW*ZZ);SP_NEG=2*(XX*ZZ-WW*YY);CP_SQ=CY_CP*CY_CP+SY_CP*SY_CP;R2D=RQ.RADS_TO_DEGS;// Partial result -- to be adjusted below.
rpy=[0,R2D*Math.asin(-SP_NEG),0];for(i=j=0;j<3;i=++j){rpyVec[i]=rpy[i];}// Test for the special case, cos theta-pitch === 0 (approx.).
if(-1e-10<=CP_SQ&&CP_SQ<=1e-10){// Special case: CP = 0, i.e. |P| = PI / 2 (and r = 0);
SY_NEG=2*(XX*YY-WW*ZZ);CY=W_SQ-X_SQ+Y_SQ-Z_SQ;return rpyVec[2]=R2D*Math.atan2(-SY_NEG,CY);}else{// Normal case: use column 0 and row 2 of M to get R and Y.
CP_CR=W_SQ-X_SQ-Y_SQ+Z_SQ;CP_SR=2*(YY*ZZ+WW*XX);rpyVec[0]=R2D*Math.atan2(CP_SR,CP_CR);return rpyVec[2]=R2D*Math.atan2(SY_CP,CY_CP);}}};//----------
RQ=RotQuat;//-----
//========  Standard/useful fixed rotation quaternion values.  ========
//   Conversion factor: degrees to radians.
RotQuat.DEGS_TO_RADS=Math.PI/180;//------------
//   Conversion factor: radians to degrees.
RotQuat.RADS_TO_DEGS=180/Math.PI;//------------
//   The zero quaternion.
RotQuat.ZERO=RotQuat.from_xyzw(0,0,0,0);//----
//   The identity rotation quaternion -- i.e. the quaternion with
//   <w;xyz> = <1;000>.
RotQuat.IDENTITY=new RQ();//--------
//   The quaternion defining the quarter rotation on the z-axis that
//   takes the y-axis to the x-axis.
RotQuat.ROT_NEG_PI_BY_2_ON_Z=RotQuat.from_xyzw(0,0,-Math.SQRT1_2,Math.SQRT1_2);return RotQuat;}.call(this);// Export
cwaenv.add(RotQuat,"RotQuat");cwaenv.fixRef("E3Vec","RotQuat");// (End RotQuat.coffee)
}).call(this);// -------- Mat4.js --------
// Generated by CoffeeScript 2.6.1
(function(){var Logger,Mat4,RQ,V3,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("Maths");V3=cwaenv.get("E3Vec");RQ=cwaenv.get("RotQuat");Mat4=function(){//---------
class Mat4{//---------
constructor(){throw"Mat4: cannot be instantiated.";}//   Returns a new 4x4 matrix of floats (Float32Array), initially all zero.
static makeMat4(){return new Float32Array(16);}//------
//   Returns a new 4x4 identity matrix of floats (Float32Array).
static makeIdMat4(){var m;//----------
m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m;}static setTrans(m,xyz){//--------
m[0]=m[5]=m[10]=m[15]=1;m[1]=m[2]=m[3]=m[4]=m[6]=m[7]=m[8]=m[9]=m[11]=0;[m[12],m[13],m[14]]=xyz;return m;}static setTRComposeT(m,mtr,tx,ty,tz){var r00,r01,r02,r10,r11,r12,r20,r21,r22;//-------------
// Copy (and cache) 3x3 rotation matrix.
m[0]=r00=mtr[0];m[1]=r10=mtr[1];m[2]=r20=mtr[2];m[4]=r01=mtr[4];m[5]=r11=mtr[5];m[6]=r21=mtr[6];m[8]=r02=mtr[8];m[9]=r12=mtr[9];m[10]=r22=mtr[10];// Apply given rotation to given translation, and accumulate
// into new translation vector
m[12]=mtr[12]+r00*tx+r01*ty+r02*tz;m[13]=mtr[13]+r10*tx+r11*ty+r12*tz;m[14]=mtr[14]+r20*tx+r21*ty+r22*tz;// Bottom row is standard.
m[3]=m[7]=m[11]=0;m[15]=1;return m;}static setProduct(m,ma,mb){var a00,a01,a02,a03,a10,a11,a12,a13,a20,a21,a22,a23,a30,a31,a32,a33,b00,b01,b02,b03,b10,b11,b12,b13,b20,b21,b22,b23,b30,b31,b32,b33;//----------
// (Column major, so each line is one column ...)
a00=ma[0];a10=ma[1];a20=ma[2];a30=ma[3];a01=ma[4];a11=ma[5];a21=ma[6];a31=ma[7];a02=ma[8];a12=ma[9];a22=ma[10];a32=ma[11];a03=ma[12];a13=ma[13];a23=ma[14];a33=ma[15];b00=mb[0];b10=mb[1];b20=mb[2];b30=mb[3];b01=mb[4];b11=mb[5];b21=mb[6];b31=mb[7];b02=mb[8];b12=mb[9];b22=mb[10];b32=mb[11];b03=mb[12];b13=mb[13];b23=mb[14];b33=mb[15];m[0]=a00*b00+a01*b10+a02*b20+a03*b30;m[1]=a10*b00+a11*b10+a12*b20+a13*b30;m[2]=a20*b00+a21*b10+a22*b20+a23*b30;m[3]=a30*b00+a31*b10+a32*b20+a33*b30;m[4]=a00*b01+a01*b11+a02*b21+a03*b31;m[5]=a10*b01+a11*b11+a12*b21+a13*b31;m[6]=a20*b01+a21*b11+a22*b21+a23*b31;m[7]=a30*b01+a31*b11+a32*b21+a33*b31;m[8]=a00*b02+a01*b12+a02*b22+a03*b32;m[9]=a10*b02+a11*b12+a12*b22+a13*b32;m[10]=a20*b02+a21*b12+a22*b22+a23*b32;m[11]=a30*b02+a31*b12+a32*b22+a33*b32;m[12]=a00*b03+a01*b13+a02*b23+a03*b33;m[13]=a10*b03+a11*b13+a12*b23+a13*b33;m[14]=a20*b03+a21*b13+a22*b23+a23*b33;m[15]=a30*b03+a31*b13+a32*b23+a33*b33;return m;}static setFrustum(m,xlo,xhi,ylo,yhi,near,far){var xlen,ylen,zlen;//----------
xlen=xhi-xlo;ylen=yhi-ylo;zlen=far-near;m[0]=2*near/xlen;m[1]=m[2]=m[3]=0;m[5]=2*near/ylen;m[4]=m[6]=m[7]=0;m[8]=(xhi+xlo)/xlen;m[9]=(yhi+ylo)/ylen;m[10]=-(far+near)/zlen;m[11]=-1;m[14]=-2*far*near/zlen;m[12]=m[13]=m[15]=0;return m;}static setPerspective(m,fovy,aspect,near,far){var xhi,yhi;//--------------
yhi=near*Math.tan(0.5*fovy*RQ.DEGS_TO_RADS);xhi=aspect*yhi;return this.setFrustum(m,-xhi,xhi,-yhi,yhi,near,far);}static setLookAt(m,eye,cor,upu){var ce,laxu,layu,lazu;//---------
ce=V3.subtractV3(eye,cor);lazu=V3.normalizeV3(ce);laxu=V3.unitCrossProductV3(upu,lazu);layu=V3.crossProductV3(lazu,laxu);[m[0],m[4],m[8]]=laxu;m[12]=-V3.dotProductV3(laxu,eye);[m[1],m[5],m[9]]=layu;m[13]=-V3.dotProductV3(layu,eye);[m[2],m[6],m[10]]=lazu;m[14]=-V3.dotProductV3(lazu,eye);m[3]=m[7]=m[11]=0;m[15]=1;return m;}};//----------
//========  Mat4 Operations.  ========
Mat4._nchk=0;return Mat4;}.call(this);// Export
cwaenv.add(Mat4,"Mat4");// (End Mat4.coffee)
}).call(this);// -------- TRXform.js --------
// Generated by CoffeeScript 2.6.1
(function(){var Logger,RQ,TRXform,V3,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("Maths");V3=cwaenv.get("E3Vec");RQ=cwaenv.get("RotQuat");TRXform=function(){var TRX;//------------
class TRXform{//------------
//   Argument _t is an E3Vec, _r is a RotQuat.
//   This constructor does not copy the given objects but retains them
//   as its own members.
constructor(_t,_r){this._t=_t;this._r=_r;}//================  "Static" creation methods.  ================
//   Returns a completely new TR transform, copied from the given one.
static fromTRX(trx){return this.fromTR(trx._t,trx._r);}//-------
//   Returns a completely new TR transform, built from copies of the
//   given components, a 3D vector and a rotation quaternion.
static fromTR(t,r){return this.fromTRV(t.xyz,r.xyzw);}//------
//   Returns a completely new TR transform, built from copies of the
//   given vector components.
static fromTRV(tv,rv){var r,t;//-------
[t,r]=[V3.fromV3(tv),RQ.fromQV(rv)];return new TRX(t,r);}//   Returns a newly created identity TR transform
static create(){return new TRX(V3.create(),new RQ());}//------
//================  TR matrix generation.  ================
//   Populates the top-left 3 x 3 region of the given column major
//   matrix so that it represents the same rotation as the given
//   rotation quaternion.  The bottom row and the right column are left
//   untouched.
static setMat4x4Rot(m,r){return r.toRotMat4x4(m);}//------------
static setMat4x4Trans(m,t){var x,y,z;//--------------
[x,y,z]=t.xyz;m[12]=x;m[13]=y;m[14]=z;m[15]=1;return m;}static setRowsMat3x4Rot(m,r){return r.toRotMatRows3x4(m);}//----------------
static setRowsMat3x4Trans(m,t){var x,y,z;//--------------
// Non-existent m[15] = 1 is left implicit.
[x,y,z]=t.xyz;m[3]=x;m[7]=y;m[11]=z;return m;}//================  "Instance" methods -- getters.  ================
//   Returns this TR transform's translation -- as an 3D vector, to be
//   treated as read-only.
trans(){return this._t;}//----
//   Returns this TR transform's rotation -- as a rotation quaternion,
//   to be treated as read-only.
rot(){return this._r;}//--
//   Returns a string representation of this TR transform
toStr(){return`trans=${this._t.asString4()}  rot=${this._r.asString4()}`;}//----
//   Returns a string representation of this TR transform
asStr(){return this.toStr();}//----
//================  "Instance" methods -- setters.  ================
//   Replaces both this TR transform's components with the given ones.
setTR(t,r){this._t=t;this._r=r;return this;}//----
//   Replaces this TR transform's translation with the given one.
setT(t){this._t=t;return this;}//---
//   Replaces this TR transform's rotation with the given one.
setR(r){this._r=r;return this;}//---
copyTRX(trx){return this.copyTR(trx._t,trx._r);}//------
//   Sets this TR transform to match the given translation and rotation,
//   by copying them to its own components.
copyTR(t,r){this._t.setFromE3V(t);this._r.setFromRQ(r);return this;}//-----
//   Updates this TR transform's translation by copying the given one
//   to it.
copyT(t){this._t.setFromE3V(t);return this;}//----
//   Updates this TR transform's rotation by copying the given one
//   to it.
copyR(rv){this._r.setFromRQ(r);return this;}//----
//   Sets this TR transform to match the given translation and rotation
//   vectors, by copying them into its own components.
copyTRV(tv,rv){V3.setV3(this._t.xyz,tv);RQ.setQV(this._r.xyzw,rv);return this;}//------
//   Updates this TR transform's translation by copying the given vector
//   into it.
copyTV(tv){V3.setV3(this._t.xyz,tv);return this;}//-----
//   Updates this TR transform's rotation by copying the given vector
//   into it.
copyRV(rv){RQ.setQV(this._r.xyzw,rv);return this;}//-----
//================  Composition, inversion, transformation.  ================
//   Sets this TR transform to its post-composition with the given one.
setPostStar(trx){//----------
// (ta,ra) * (tb,rb) = (ta + ra(tb), ra*rb)
// ... with (ta,ra) = this and (tb,rb) = trx
this._t.setAdd(this._r.rotate(V3.fromE3V(trx._t)));this._r.setPostMultiply(trx._r);return this;}//   Sets this TR transform to its pre-composition with the given one.
setPreStar(trx){//---------
// (ta,ra) * (tb,rb) = (ta + ra(tb), ra*rb)
// ... with (ta,ra) = trx and (tb,rb) = this
this._t.setRotate(trx._r).setAdd(trx._t);this._r.setPreMultiply(trx._r);return this;}//   Sets this TR transform to its post-composition with one consisting
//   of a zero translation with the given rotation.
setPostStarRot(rq){this._r.setPostMultiply(rq);return this;}//-------------
//   Sets this TR transform to its pre-composition with one consisting
//   of a zero translation with the given rotation.
setPreStarRot(rq){this._t.setRotate(rq);this._r.setPreMultiply(rq);return this;}//------------
//   Sets this TR transform to its own inverse.
setInvert(){//--------
// (t,r) := (-Rot(r*,t),r*) = (Rot(r*,-t),r*)
this._r.setInvert();this._t.setNegate().setRotate(this._r);return this;}//   Returns a new TR transform representing the inverse of this one.
inverse(){return TRX.fromTRX(this).setInvert();}//------
//   Applies this TR transform to the given 3D vector.
transform(e3v){return this._r.rotate(e3v).setAdd(this._t);}//--------
//================  Conversion to matrix form.  ================
//   Sets the given (column major) 4x4 TR matrix to represent this
//   TR transform.
convertToMat4x4(m){//--------------
m[3]=m[7]=m[11]=0;TRX.setMat4x4Trans(m,this._t);return TRX.setMat4x4Rot(m,this._r);}convertToRowsMat3x4(m){//------------------
TRX.setRowsMat3x4Trans(m,this._t);return TRX.setRowsMat3x4Rot(m,this._r);}//   Returns a new (column major) 4x4 TR matrix representing this TR
//   transform.
makeMat4x4(){var m;m=new Float32Array(16);return this.convertToMat4x4(m);}};//----------
TRX=TRXform;return TRXform;}.call(this);//---------
// Export
cwaenv.add(TRXform,"TRXform");// (End TRXform.coffee)
}).call(this);// -------- setup-emcc.js --------
var Module={};// Closure to hide resolve function
(function(){var promres;Module['EMCCInitialised']=new Promise(function(resolve,reject){promres=resolve;// console.log("EMCCInitialised promise created");
});Module['onRuntimeInitialized']=function(){// console.log("Emscripten Runtime initialised");
promres();// console.log("EMCCInitialised promise resolve called");
};}).call();// Module['EMCCInitialised'].then( () => { console.log("EMCCInitialised then resolved - From Setup code"); } );
// -------- animgen.js --------
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module=typeof Module!='undefined'?Module:{};// See https://caniuse.com/mdn-javascript_builtins_object_assign
// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// {{PRE_JSES}}
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides=Object.assign({},Module);var arguments_=[];var thisProgram='./this.program';var quit_=(status,toThrow)=>{throw toThrow;};// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).
// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB=typeof window=='object';var ENVIRONMENT_IS_WORKER=typeof importScripts=='function';// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE=typeof process=='object'&&typeof process.versions=='object'&&typeof process.versions.node=='string';var ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory='';function locateFile(path){if(Module['locateFile']){return Module['locateFile'](path,scriptDirectory);}return scriptDirectory+path;}// Hooks that are implemented differently in different runtime environments.
var read_,readAsync,readBinary,setWindowTitle;// Normally we don't log exceptions but instead let them bubble out the top
// level where the embedding environment (e.g. the browser) can handle
// them.
// However under v8 and node we sometimes exit the process direcly in which case
// its up to use us to log the exception before exiting.
// If we fix https://github.com/emscripten-core/emscripten/issues/15080
// this may no longer be needed under node.
function logExceptionOnExit(e){if(e instanceof ExitStatus)return;let toLog=e;err('exiting due to exception: '+toLog);}var fs;var nodePath;var requireNodeFS;if(ENVIRONMENT_IS_NODE){if(ENVIRONMENT_IS_WORKER){scriptDirectory=require('path').dirname(scriptDirectory)+'/';}else{scriptDirectory=__dirname+'/';}// include: node_shell_read.js
requireNodeFS=()=>{// Use nodePath as the indicator for these not being initialized,
// since in some environments a global fs may have already been
// created.
if(!nodePath){fs=require('fs');nodePath=require('path');}};read_=function shell_read(filename,binary){var ret=tryParseAsDataURI(filename);if(ret){return binary?ret:ret.toString();}requireNodeFS();filename=nodePath['normalize'](filename);return fs.readFileSync(filename,binary?undefined:'utf8');};readBinary=filename=>{var ret=read_(filename,true);if(!ret.buffer){ret=new Uint8Array(ret);}return ret;};readAsync=(filename,onload,onerror)=>{var ret=tryParseAsDataURI(filename);if(ret){onload(ret);}requireNodeFS();filename=nodePath['normalize'](filename);fs.readFile(filename,function(err,data){if(err)onerror(err);else onload(data.buffer);});};// end include: node_shell_read.js
if(process['argv'].length>1){thisProgram=process['argv'][1].replace(/\\/g,'/');}arguments_=process['argv'].slice(2);if(typeof module!='undefined'){module['exports']=Module;}process['on']('uncaughtException',function(ex){// suppress ExitStatus exceptions from showing an error
if(!(ex instanceof ExitStatus)){throw ex;}});// Without this older versions of node (< v15) will log unhandled rejections
// but return 0, which is not normally the desired behaviour.  This is
// not be needed with node v15 and about because it is now the default
// behaviour:
// See https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode
process['on']('unhandledRejection',function(reason){throw reason;});quit_=(status,toThrow)=>{if(keepRuntimeAlive()){process['exitCode']=status;throw toThrow;}logExceptionOnExit(toThrow);process['exit'](status);};Module['inspect']=function(){return'[Emscripten Module object]';};}else// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){// Check worker, not web, since window could be polyfilled
scriptDirectory=self.location.href;}else if(typeof document!='undefined'&&document.currentScript){// web
scriptDirectory=document.currentScript.src;}// blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
// otherwise, slice off the final part of the url to find the script directory.
// if scriptDirectory does not contain a slash, lastIndexOf will return -1,
// and scriptDirectory will correctly be replaced with an empty string.
// If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
// they are removed because they could contain a slash.
if(scriptDirectory.indexOf('blob:')!==0){scriptDirectory=scriptDirectory.substr(0,scriptDirectory.replace(/[?#].*/,"").lastIndexOf('/')+1);}else{scriptDirectory='';}// Differentiate the Web Worker from the Node Worker case, as reading must
// be done differently.
{// include: web_or_worker_shell_read.js
read_=url=>{try{var xhr=new XMLHttpRequest();xhr.open('GET',url,false);xhr.send(null);return xhr.responseText;}catch(err){var data=tryParseAsDataURI(url);if(data){return intArrayToString(data);}throw err;}};if(ENVIRONMENT_IS_WORKER){readBinary=url=>{try{var xhr=new XMLHttpRequest();xhr.open('GET',url,false);xhr.responseType='arraybuffer';xhr.send(null);return new Uint8Array(/** @type{!ArrayBuffer} */xhr.response);}catch(err){var data=tryParseAsDataURI(url);if(data){return data;}throw err;}};}readAsync=(url,onload,onerror)=>{var xhr=new XMLHttpRequest();xhr.open('GET',url,true);xhr.responseType='arraybuffer';xhr.onload=()=>{if(xhr.status==200||xhr.status==0&&xhr.response){// file URLs can return 0
onload(xhr.response);return;}var data=tryParseAsDataURI(url);if(data){onload(data.buffer);return;}onerror();};xhr.onerror=onerror;xhr.send(null);};// end include: web_or_worker_shell_read.js
}setWindowTitle=title=>document.title=title;}else{}var out=Module['print']||console.log.bind(console);var err=Module['printErr']||console.warn.bind(console);// Merge back in the overrides
Object.assign(Module,moduleOverrides);// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides=null;// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.
if(Module['arguments'])arguments_=Module['arguments'];if(Module['thisProgram'])thisProgram=Module['thisProgram'];if(Module['quit'])quit_=Module['quit'];// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
var STACK_ALIGN=16;var POINTER_SIZE=4;function getNativeTypeSize(type){switch(type){case'i1':case'i8':case'u8':return 1;case'i16':case'u16':return 2;case'i32':case'u32':return 4;case'i64':case'u64':return 8;case'float':return 4;case'double':return 8;default:{if(type[type.length-1]==='*'){return POINTER_SIZE;}else if(type[0]==='i'){const bits=Number(type.substr(1));assert(bits%8===0,'getNativeTypeSize invalid bits '+bits+', type '+type);return bits/8;}else{return 0;}}}}function warnOnce(text){if(!warnOnce.shown)warnOnce.shown={};if(!warnOnce.shown[text]){warnOnce.shown[text]=1;err(text);}}// include: runtime_functions.js
// This gives correct answers for everything less than 2^{14} = 16384
// I hope nobody is contemplating functions with 16384 arguments...
function uleb128Encode(n){if(n<128){return[n];}return[n%128|128,n>>7];}// Wraps a JS function as a wasm function with a given signature.
function convertJsFunctionToWasm(func,sig){return func;}var freeTableIndexes=[];// Weak map of functions in the table to their indexes, created on first use.
var functionsInTableMap;function getEmptyTableSlot(){// Reuse a free index if there is one, otherwise grow.
if(freeTableIndexes.length){return freeTableIndexes.pop();}// Grow the table
try{wasmTable.grow(1);}catch(err){if(!(err instanceof RangeError)){throw err;}throw'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';}return wasmTable.length-1;}function updateTableMap(offset,count){for(var i=offset;i<offset+count;i++){var item=getWasmTableEntry(i);// Ignore null values.
if(item){functionsInTableMap.set(item,i);}}}/**
* Add a function to the table.
* 'sig' parameter is required if the function being added is a JS function.
* @param {string=} sig
*/function addFunction(func,sig){// Check if the function is already in the table, to ensure each function
// gets a unique index. First, create the map if this is the first use.
if(!functionsInTableMap){functionsInTableMap=new WeakMap();updateTableMap(0,wasmTable.length);}if(functionsInTableMap.has(func)){return functionsInTableMap.get(func);}// It's not in the table, add it now.
var ret=getEmptyTableSlot();// Set the new value.
try{// Attempting to call this with JS function will cause of table.set() to fail
setWasmTableEntry(ret,func);}catch(err){if(!(err instanceof TypeError)){throw err;}var wrapped=convertJsFunctionToWasm(func,sig);setWasmTableEntry(ret,wrapped);}functionsInTableMap.set(func,ret);return ret;}function removeFunction(index){functionsInTableMap.delete(getWasmTableEntry(index));freeTableIndexes.push(index);}// end include: runtime_functions.js
// include: runtime_debug.js
// end include: runtime_debug.js
var tempRet0=0;var setTempRet0=value=>{tempRet0=value;};var getTempRet0=()=>tempRet0;// === Preamble library stuff ===
// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html
var wasmBinary;if(Module['wasmBinary'])wasmBinary=Module['wasmBinary'];var noExitRuntime=Module['noExitRuntime']||true;// include: wasm2js.js
// wasm2js.js - enough of a polyfill for the WebAssembly object so that we can load
// wasm2js code that way.
// Emit "var WebAssembly" if definitely using wasm2js. Otherwise, in MAYBE_WASM2JS
// mode, we can't use a "var" since it would prevent normal wasm from working.
/** @suppress{duplicate, const} */var WebAssembly={// Note that we do not use closure quoting (this['buffer'], etc.) on these
// functions, as they are just meant for internal use. In other words, this is
// not a fully general polyfill.
/** @constructor */Memory:function(opts){this.buffer=new ArrayBuffer(opts['initial']*65536);},Module:function(binary){// TODO: use the binary and info somehow - right now the wasm2js output is embedded in
// the main JS
},/** @constructor */Instance:function(module,info){// TODO: use the module and info somehow - right now the wasm2js output is embedded in
// the main JS
// This will be replaced by the actual wasm2js code.
this.exports=// EMSCRIPTEN_START_ASM
function instantiate(asmLibraryArg){function Table(ret){// grow method not included; table is not growable
ret.set=function(i,func){this[i]=func;};ret.get=function(i){return this[i];};return ret;}var bufferView;var base64ReverseLookup=new Uint8Array(123/*'z'+1*/);for(var i=25;i>=0;--i){base64ReverseLookup[48+i]=52+i;// '0-9'
base64ReverseLookup[65+i]=i;// 'A-Z'
base64ReverseLookup[97+i]=26+i;// 'a-z'
}base64ReverseLookup[43]=62;// '+'
base64ReverseLookup[47]=63;// '/'
/** @noinline Inlining this function would mean expanding the base64 string 4x times in the source code, which Closure seems to be happy to do. */function base64DecodeToExistingUint8Array(uint8Array,offset,b64){var b1,b2,i=0,j=offset,bLength=b64.length,end=offset+(bLength*3>>2)-(b64[bLength-2]=='=')-(b64[bLength-1]=='=');for(;i<bLength;i+=4){b1=base64ReverseLookup[b64.charCodeAt(i+1)];b2=base64ReverseLookup[b64.charCodeAt(i+2)];uint8Array[j++]=base64ReverseLookup[b64.charCodeAt(i)]<<2|b1>>4;if(j<end)uint8Array[j++]=b1<<4|b2>>2;if(j<end)uint8Array[j++]=b2<<6|base64ReverseLookup[b64.charCodeAt(i+3)];}}function initActiveSegments(imports){base64DecodeToExistingUint8Array(bufferView,1024,"N1NTRnJhbWUAd2F2eQByZWZlcmVuY2UgdG8gYmluYXJ5IGVudGl0eQBhc3luY2hyb25vdXMgZW50aXR5AGluY29tcGxldGUgbWFya3VwIGluIHBhcmFtZXRlciBlbnRpdHkAZW50aXR5IGRlY2xhcmVkIGluIHBhcmFtZXRlciBlbnRpdHkAY2Fubm90IHN1c3BlbmQgaW4gZXh0ZXJuYWwgcGFyYW1ldGVyIGVudGl0eQBYTUwgb3IgdGV4dCBkZWNsYXJhdGlvbiBub3QgYXQgc3RhcnQgb2YgZW50aXR5AHVuZGVmaW5lZCBlbnRpdHkAaW5maW5pdHkAd3Jpc3RlY2NlbnRyaWNpdHkAZXRobmljaXR5AG9uZWZpbmdlcmdlb21ldHJ5AGF2YXRhcmdlb21ldHJ5AGdlc3R1cmVnZW9tZXRyeQBmYWNlZ2VvbWV0cnkAb3V0IG9mIG1lbW9yeQBuZWFyYmVsbHkAdG93YXJkc19waW5reQBQaW5reQBSaWNoYXJkIEtlbm5hd2F5AG1heHNwbGF5AGZpc3RzcGxheQBmbGF0c3BsYXkAbWluc3BsYXkAZmluZ2VycGxheQBzbGlnaHRfZGVsYXkALWFwcHJveABtdXN0IG5vdCB1bmRlY2xhcmUgcHJlZml4AHVuYm91bmQgcHJlZml4AE1pZGRsZUNyb3NzZWRPdmVySW5kZXhfaW5kZXgAVGh1bWJiZXR3ZWVuMjNGaXN0X2luZGV4AFRodW1iVG9CZW50TWlkZGxlX2luZGV4AFBpbmNoQmVudFRodW1iVG9NaWRkbGVfaW5kZXgASW5kZXhDcm9zc092ZXJUaHVtYl9pbmRleABQaW5jaE5vMl9pbmRleABJbmRleABsYXgALSsgICAwWDB4AC0wWCswWCAwWC0weCsweCAweAB0YXJnZXR0ZWRzbG93AGhhbmltX3JfZWxib3cAaGFuaW1fbF9lbGJvdwBzdGlyY3cAc3RpcmNjdwBUdXJyZXRKb2ludFJvdGF0aW9uOjpzZXRDb21wb3NlSW52AEZpbmdlckJhc2VKb2ludFJvdGF0aW9uOjpzZXRDb21wb3NlSW52AFRodW1iQmFzZUpvaW50Um90YXRpb246OnNldENvbXBvc2VJbnYASGFuaW1BbmltYXRpb25SZWNvcmQ6OnByaW50QVJQSGVhZGVyIGJpbmFyeSBvdXRwdXQAbGVmdF9vdXQAZmlzdHR3aXN0AGhhbmltX3Jfd3Jpc3QAaGFuaW1fbF93cmlzdABwbGF5bGlzdABmaXN0AHJlc3QAY2hlc3QAZ2VzdAB0YXJnZXR0ZWRmYXN0AHN0ZDo6YmFkX2Nhc3QAdW5leHBlY3RlZCBwYXJzZXIgc3RhdGUgLSBwbGVhc2Ugc2VuZCBhIGJ1ZyByZXBvcnQAZnJvbXN0YXJ0AGJvZHlwYXJ0AG92ZXJzaG9vdABoYW5pbV9IdW1hbm9pZFJvb3QAckZvb3QAbEZvb3QAaGFuZFJvdABzdGFydGFtb3VudABlbmRhbW91bnQAZnJvbnQAZW5kcG9pbnQAZW5kam9pbnQAbWlkam9pbnQAaGFuaW1fcl9leWViYWxsX2pvaW50AGhhbmltX2xfZXllYmFsbF9qb2ludABNZXJnZVhNTENlbGwgY29udGVudABoYW1nZXN0dXJhbF9zZWdtZW50AGJvZHlfbW92ZW1lbnQAc2hvdWxkZXJfbW92ZW1lbnQAaGVhZF9tb3ZlbWVudABleHRyYV9tb3ZlbWVudABGaW5nZXJwbGF5TW92ZW1lbnQAV3Jpc3RNb3ZlbWVudABTcGxpdE1vdmVtZW50AFJlcGVhdE1vdmVtZW50AENpcmN1bGFyTW92ZW1lbnQAUGFyTW92ZW1lbnQAU2VxTW92ZW1lbnQATm9Nb3ZlbWVudABOb25tYW51YWxNb3ZlbWVudABVbmRlZk1vdmVtZW50AEZhY2VNb3ZlbWVudABUYXJnZXR0ZWRNb3ZlbWVudABEaXJlY3RlZE1vdmVtZW50AGp1bmsgYWZ0ZXIgZG9jdW1lbnQgZWxlbWVudABub3N0cmlscGxhY2VtZW50AGRibGJlbnQAaGFsZmJlbnQAdGh1bWJiZW50AHRpbWVDb25zdGFudABvc2NDb25zdGFudABub25kb21pbmFudABtdC1tdABHZXN0dXJlOjp0cmFuc2ZlciByZXN1bHQAaGFsdAB3cmlzdFVsbmFyTGltaXQAd3Jpc3RQYWxtYXJMaW1pdAB3cmlzdERvcnNhbExpbWl0AHdyaXN0UmFkaWFsTGltaXQAZGlnaXQAdGlnaHQAZmFyLXJpZ2h0AHN0cmFpZ2h0AHJlYWNoTmVhclNvZnQAcmVwZXRpdGlvbl9iYXNlc2hpZnQAZmFyLWxlZnQAbWFrZWRpY3QAZW5jb2Rpbmcgc3BlY2lmaWVkIGluIFhNTCBkZWNsYXJhdGlvbiBpcyBpbmNvcnJlY3QAc29mdGNvbnRhY3QAaGFyZGNvbnRhY3QAdGh1bWJjb250YWN0AHNlY29uZF9jb250YWN0AFR1cnJldEpvaW50Um90YXRpb246OnNldEZyb21RdWF0AEZpbmdlckJhc2VKb2ludFJvdGF0aW9uOjpzZXRGcm9tUXVhdABUaHVtYkJhc2VKb2ludFJvdGF0aW9uOjpzZXRGcm9tUXVhdAByZXF1ZXN0ZWQgZmVhdHVyZSByZXF1aXJlcyBYTUxfRFREIHN1cHBvcnQgaW4gRXhwYXQAZmxhdAByaWdodF9hdABsZWZ0X2F0AFMtZXllYnJvd3MAZXllX2Jyb3dzAHNlY29uZF9jbG9ja3BsdXMAYm9keWNvbnN0cmFpbnRzAG9uZWZpbmdlcmxpbWl0cwBzZWNvbmRfZXhlbXB0ZWRkaWdpdHMAc2Vjb25kX2RpZ2l0cwBIYW5pbUF2YXRhcjo6bG9jYXRlU2l0ZUlEOiBzeW50aGVzaXMgb2YgZXh0cmVtaXR5IG9mZnNldHMAYWNyb3NzAGdsb3NzAE1vdmVtZW50LmNwcDogTWVyZ2VUZ3RzIGluIHByb2dyZXNzAE1hbm5lckZsYWdzOjpwcmludFNpR01MQXR0cmlicyBpbiBwcm9ncmVzcwBIYW5pbUFuaW1hdG9yLmNwcCBBZGRKb2ludFJvdGF0aW9uIGluIHByb2dyZXNzAGVsYm93X21heF9zdHJhaWdodG5lc3MAdXBwZXJhcm10aGlja25lc3MAZm9yZWFybXRoaWNrbmVzcwBrbnVja2xldGhpY2tuZXNzAGNsYXNzAGNvbnRyb2xsZXJzAHNlY29uZF9zcGVjaWFsZmluZ2VycwBzdWNjZXNzaXZlZmluZ2VycwBjZWVmaW5nZXJzAGV4dGVuZGVkZmluZ2VycwBGaXN0QXJvdW5kVGh1bWJfZmluZ2VycwBzaG91bGRlcnMAUy1saXBzAGZwcwBudW1zdGVwcwBzZWNvbmRfdGh1bWJwb3MAcmVwZXRpdGlvbnMAZWxib3dkaXJlY3Rpb25zAGN1cnZlX2R1cmF0aW9ucwBjaXJjbGVfZHVyYXRpb25zAFMtbm9zdHJpbHMAc2Vjb25kX2F4aXMAZWNjZW50cmljaXR5X3NpemVzAGVsYm93bW92ZW1lbnRfc2l6ZXMAc3RyYWlnaHRfc2l6ZXMAYmFzZXNoaWZ0aW5jcmRlY3Jfc2l6ZXMAemlnemFnX3NpemVzAHdyaXN0d2FnZ2xlX3NpemVzAFMtZXllcwBoYW5kc2hhcGVjbGFzc2VzAHNwZWNpYWxjYXNlcwBoYW5kc2hhcGVzAG1hbm5lcnRpbWVzAG1vcnBodGltZXMAcGhvbmVtZXMAcHJlZml4IG11c3Qgbm90IGJlIGJvdW5kIHRvIG9uZSBvZiB0aGUgcmVzZXJ2ZWQgbmFtZXNwYWNlIG5hbWVzAGN1cnZlX2FuZ2xlcwBudW1jeWNsZXMAY3VydmVfZWxsaXB0aWNpdGllcwB0cmFqZWN0b3JpZXMAU2l0ZUlEOjpwcmludFNpR01MQXR0cmlicyAyIHJlbGF0aXZlIGJvZHkgc2lkZXMAU2l0ZUlEOjpwcmludFNpR01MQXR0cmlicyAxIHJlbGF0aXZlIGJvZHkgc2lkZXMAb3JkaW5hcnliZW5kcwBzcGVjaWFsYmVuZHMAYm90aF9oYW5kcwBleWVfbGlkcwBOb25tYW51YWxNb3ZlbWVudDo6cHJpbnRTaUdNTEF0dHJpYnMAdW5kZWZhYnMAajFzACVzJXMlcwBoYW5pbV8lc18lcyVzACVzKCVkKS0lYyVzAFNFR18lcwA8JXMASC0lcyVkLSVzACVkICVzACVzID0+ICVzAC1ub2VycgAtYXBwZW5kZXJyAHZlY3RvcgByaWdodEJvZHlWZWN0b3IAbGVmdEJvZHlWZWN0b3IAdW5zcGVjaWZpZWQgaW9zdHJlYW1fY2F0ZWdvcnkgZXJyb3IAc3ludGF4IGVycm9yAGFwcHJveF9wYWxtb3IAYWJzX3BhbG1vcgByZWxfcGFsbW9yAHNlY29uZF9wYWxtb3IAYXV4ZGlyAHJvb3RkaXIAYXZhdGFyZGlyAHdvcmtkaXIAYXBwcm94X2V4dGZpZGlyAGFic19leHRmaWRpcgByZWxfZXh0ZmlkaXIAc2Vjb25kX2V4dGZpZGlyAHNlY29uZF9jb250YWN0cGFpcgBob2xkb3ZlcgBwYXJ0aWFsIGNoYXJhY3RlcgBtYW5uZXIAYm9keV90aWVyAGZhY2lhbGV4cHJfdGllcgBzaG91bGRlcl90aWVyAG1vdXRoaW5nX3RpZXIAZXllZ2F6ZV90aWVyAGhlYWRfdGllcgBleHRyYV90aWVyAG5laXRoZXIAbGFzdHNfbG9uZ2VyAGhhbmltX3Jfc2hvdWxkZXIAaGFuaW1fbF9zaG91bGRlcgByZWZlcmVuY2UgdG8gaW52YWxpZCBjaGFyYWN0ZXIgbnVtYmVyAHJTaGxkcgBsU2hsZHIAYmFzZXNoaWZ0X2luY3JkZWNyAHJlcGV0aXRpb25faW5jcmRlY3IAemlnemFnX2luY3JkZWNyAC1hdmF0YXIAYm9keV9wYXIAZmFjaWFsX2V4cHJfcGFyAHNob3VsZGVyX3BhcgBub25tYW51YWxfcGFyAG1vdXRoaW5nX3BhcgBleWVfcGFyAGhlYWRfcGFyAGV4dHJhX3BhcgB1bG5hcgBwYWxtYXIAY2lyY3VsYXIAaGFuaW1fcl9zdGVybm9jbGF2aWN1bGFyAGhhbmltX2xfc3Rlcm5vY2xhdmljdWxhcgByQ29sbGFyAGxDb2xsYXIAZmFyAGxpbmVhcgBpb3NfYmFzZTo6Y2xlYXIAUy1lYXIAcmVhY2hGYXIAbGVmdF91cABzdWRkZW5zdG9wAHNob3VsZGVydG9wAFMtaGVhZHRvcABoZWxwAGhhbmltX3NrdWxsX3RpcABfZGlzdGFsX3RpcABTLWxvd2VybGlwAFMtdXBwZXJsaXAAaGFuaW1fcl9oaXAAaGFuaW1fbF9oaXAAcmVwAHN3YXAAcmlnaHRzbGFwAGxlZnRzbGFwAG1heFNjQW5nbGVVcABzcGVlZFVwAHRvZnJvdG8AZXJyb3JzLXRvAGVsYm93IHJhaXNlZCB0byBhdm9pZCB0b3JzbwBlbmRqb2ludHplcm8AbWlkam9pbnR6ZXJvAGJhc2V6ZXJvAGxlZnRfemVybwB0aXByYXRpbwBiYXNlc2hpZnRfcmF0aW8AcGFsbW9yX3JhdGlvAGV4dGZpZGlyX3JhdGlvAGxvY2F0aW9uX3JhdGlvAHppZ3phZ19yYXRpbwBtb3ZlbWVudF90b19zaXplX3JhdGlvAGhhbmRzaGFwZV9yYXRpbwB1cHBlcmFybVR3aXN0UmF0aW8AZm9yZWFybVR3aXN0UmF0aW8AbGVmdF9kb3duAG1heFNjQW5nbGVEb3duAG92ZXJydW4AY2Fubm90IGNoYW5nZSBzZXR0aW5nIG9uY2UgcGFyc2luZyBoYXMgYmVndW4AcnRuAHRpbWVyYXRpb19sYXhyZXR1cm4AaGFuaW1fc3VwcmFtZW50b24Ac2tlbGV0b24AdXBwZXJBcm1Qcm9wb3J0aW9uAHNjQW5nbGVQcm9wb3J0aW9uAHN0ZDo6ZXhjZXB0aW9uAHRlcm1pbmF0ZV9oYW5kbGVyIHVuZXhwZWN0ZWRseSB0aHJldyBhbiBleGNlcHRpb24Ad3Jpc3Rtb3Rpb24AY3Jvc3Ntb3Rpb24AY2lyY3VsYXJtb3Rpb24Abm9tb3Rpb24AZGlyZWN0ZWRtb3Rpb24AcnB0X21vdGlvbgBzcGxpdF9tb3Rpb24AdGd0X21vdGlvbgBhYnNfbW90aW9uAHBhcl9tb3Rpb24Ac2VxX21vdGlvbgBub25tYW5fbW90aW9uAHNlY29uZF9yZXBldGl0aW9uAFJlcGVhdE1vdmVtZW50OjpzZXRPd25Nb3Rpb25BdHRyaWJ1dGVzOiBzZWNvbmRSZXBldGl0aW9uAHBvc2l0aW9uAHVuY2xvc2VkIENEQVRBIHNlY3Rpb24AdGh1bWJiYXNlZGlyZWN0aW9uAGVsbGlwc2VfZGlyZWN0aW9uAHNlY29uZF9kaXJlY3Rpb24AcG9zdHN5bmNocm9uaXphdGlvbgBwcmVzeW5jaHJvbml6YXRpb24Ad3Jpc3Ryb3RhdGlvbgBubyBoYW5kIG9yaWVudGF0aW9uAG1vcnBoIHNlZ21lbnQgZHVyYXRpb24AaGFuZGNvbnN0ZWxsYXRpb24Abm9zdHJpbGRpbGF0aW9uAHVuZGVmbG9jYXRpb24Ac2Vjb25kX2FwcHJveF9sb2NhdGlvbgBzcGxpdF9sb2NhdGlvbgBicnVzaGluZ19sb2NhdGlvbgBhcHByb3hfc2Vjb25kX2xvY2F0aW9uAG5vIHRhcmdldCBsb2NhdGlvbgBubyBoYW5kc2l0ZSBsb2NhdGlvbgB2ZXJzaW9uAFMtdW5kZXJjaGluAFMtY2hpbgByU2hpbgBsU2hpbgBsZWZ0X2luAGdsb3NzX3NpZ24AaGFuZGxlX21vY2FwX3NpZ24AaGFuZGxlX2JvbmVzYW5pbWF0aW9uX3NpZ24AaGFtZ2VzdHVyYWxfc2lnbgBwaW5jaDEyb3BlbgBjZWUxMm9wZW4AYWJkb21lbgB1bmNsb3NlZCB0b2tlbgBBbmltZ2VuAHRodW1iYmV0d2VlbgBuYW4AZmFuAG1lZGl1bQBsb2NhdGlvbl9ib2R5YXJtAGxvd2VyYXJtAHVwcGVyYXJtAHJGb3JlQXJtAGxGb3JlQXJtAG5vbmRvbQBtYW55cmFuZG9tAGxyX3N5bW0Ab2lfc3ltbQB1ZF9zeW1tAHBhbG0AaGFuaW0AaW9zdHJlYW0AZXNpZ21sAC5zaWdtbAB2ZXJ5c21hbGwAcGluY2hhbGwAY2VlYWxsAHRodW1iYmFsbABuYWlsAGVsYm93IHJhaXNlZCB0byBuYXR1cmFsIGxldmVsAGhhbmltX25hdmVsAGZpdHBpY3R1cmV0b21hbnVhbABzaWduX25vbm1hbnVhbABzaWduX21hbnVhbABkb3JzYWwAbmV1dHJhbABmcm9tc3RhcnRfc2V2ZXJhbABjb250aW51ZV9zZXZlcmFsAHJhZGlhbAAsajFsAGpya0B1ZWEuYWMudWsAdGlrdG9rAFMtY2hlZWsAaW50ZXJsb2NrAFMtbmVjawBzbGFjawB3cmlzdGJhY2sAaGFuZGJhY2sAbWF4U2NBbmdsZUJhY2sAbGVhawBtb2NhcF91cmkAZGVmaW5pdGlvbl91cmkAYm9uZXNkYXRhX3VyaQBjaXJjbGVfcmFkaWkAbm9zdHJpbGRlcHRoAGJvdGgAUy1sb3dlcnRlZXRoAEhhbmltQXZhdGFyOjpjcmVhdGVTaUdNTEhlYWRTaXRlczogdG9uZ3VlLCB0ZWV0aCwgdXBwZXJ0ZWV0aCwgbG93ZXJ0ZWV0aABTLXVwcGVydGVldGgAUy10ZWV0aABub3NldGlwd2lkdGhfYmFzZXdpZHRoAHBhcm1vcnBoAHNlcW1vcnBoAGF2YXRhcl9tb3JwaABwYXJfbW9ycGgAc2VxX21vcnBoAHRoaWdoAHJUaGlnaABsVGhpZ2gAdG91Y2gAYmVsb3dzdG9tYWNoAHR3aXN0aW5nAGluY3JlYXNpbmcAZGVjcmVhc2luZwBiYXNpY19zdHJpbmcAc2Vjb25kX2NlZW9wZW5pbmcAZ2VzdHVyZXRpbWluZwB3cmlzdF93YWdnbGluZwBicnVzaGluZwBzd2luZ2luZwB1bmtub3duIGVuY29kaW5nAGluY3JlbWVudGFsdGh1bWJiZW5kaW5nAG5vZGRpbmcAYm91bmNpbmcAaG9yaXpfc3BhY2luZwBpbm91dF9zcGFjaW5nAHZlcnRfc3BhY2luZwBSaW5nAFQtYXJtaGFuZwBub25tYW51YWxjb25maWcAc3BsaXRfaGFuZGNvbmZpZwBiaWcAemlnemFnAG1pc21hdGNoZWQgdGFnAGluZgAlbGYgJWxmICVsZiAlbGYgJWxmACVzOnVuZGVmACBsZW5ndGggJS42ZgAgYW5nbGUgJS42ZgAgJWQ6JS4zZgAgYW1vdW50ICUuM2YAIHRzICUuM2YgZXAgJS4zZiBvciAlLjNmAChQQVIgJS4zZiAlLjNmICUuM2YgJS4zZgAoU0VRICUuM2YgJS4zZiAlLjNmICUuM2YARE06OnNldEFEViBlbGJvdyBtb3ZlbWVudCBhYnMgb3V0ICUuM2YgZndkICUuM2Ygc2l6ZSAlLjNmACAgICBUQzo6Rk8geDAgJS4zZiByWiAlLjNmIHJFY3ogJS4zZiBteCAlLjNmIHJ6ICUuM2YgckV4c2EgJS4zZiByRXpzYSAlLjNmACAgICBUQzo6Rk8geDAgJS4zZiBsWiAlLjNmIGxFY3ogJS4zZiBteCAlLjNmIGx6ICUuM2YgbEV4c2EgJS4zZiBsRXpzYSAlLjNmACAgICBySEQgJS4zZgAgICAgbEhEICUuM2YAeDolLjJmLHk6JS4yZix6OiUuMmYAeDolLjJmLHk6JS4yZgAlczolLjJmACAgbWluc3BsYXkgJS4qZiBtYXhzcGxheSAlLipmIGZpc3RzcGxheSAlLipmIGZpc3R0d2lzdCAlLipmACAlLipmICUuKmYgJS4qZiAlLipmACVzIFRVUlJFVCAoICUuKmYgJS4qZiAlLipmICkgJS4qZgAlcyBISU5HRSAoICUuKmYgJS4qZiAlLipmICkgJS4qZgAgICggJS4qZiAlLipmICUuKmYgKSAlLipmAHNoYXBlX2xlYWQgJWYsIG9yaWVudGF0aW9uX2xlYWQgJWYAd3Jpc3RzaXplAHRvcnNvc2l0ZXNpemUAc2lnbnNwYWNlc2l0ZXNpemUAYmFzZXNoaWZ0X3NpemUAYmFzZXNoaWZ0X2luY3JkZWNyX3NpemUAcmVwZXRpdGlvbl9pbmNyZGVjcl9zaXplAHppZ3phZ19pbmNyZGVjcl9zaXplAHppZ3phZ19zaXplAGN1cnZlX3NpemUAZWxsaXBzZV9zaXplAHNlY29uZF9zaXplAEFSUCBzaXRlIG5vcm1hbCB2ZWN0b3IgYW5kIHNpemUAYWxsb2NhdG9yPFQ+OjphbGxvY2F0ZShzaXplX3QgbikgJ24nIGV4Y2VlZHMgbWF4aW11bSBzdXBwb3J0ZWQgc2l6ZQBleWVfZ2F6ZQByaWdodEV5ZQBsZWZ0RXllAHNoYWxsb3cgY3VydmUAZGVlcCBjdXJ2ZQBtZWRpdW0gY3VydmUAdHJ1ZQB0aW1lcmF0aW9fY29udGludWUAc3BhY2VyYXRpb19jb250aW51ZQBTLXRvbmd1ZQByZWZlcmVuY2UgdG8gZXh0ZXJuYWwgZW50aXR5IGluIGF0dHJpYnV0ZQBkdXBsaWNhdGUgYXR0cmlidXRlAHVuZGVmaW5lZHNpdGUASGFuaW1BdmF0YXI6OmxvY2F0ZVNpdGVJRCBjYXNlIDMgaW5jb21wbGV0ZQByZXZlcnNlAFR1cnJldEpvaW50Um90YXRpb246OnNldFByZUludkNvbXBvc2UARmluZ2VyQmFzZUpvaW50Um90YXRpb246OnNldFByZUludkNvbXBvc2UAVGh1bWJCYXNlSm9pbnRSb3RhdGlvbjo6c2V0UHJlSW52Q29tcG9zZQBUdXJyZXRKb2ludFJvdGF0aW9uOjpzZXRDb21wb3NlAEZpbmdlckJhc2VKb2ludFJvdGF0aW9uOjpzZXRDb21wb3NlAFRodW1iQmFzZUpvaW50Um90YXRpb246OnNldENvbXBvc2UAUy1ub3NlAGNsb3NlAHRlbnNlAHNlbnNlAGZhbHNlAGVsYm93X21heF9yYWlzZQBlbGJvd1JhaXNlAG91dG9mcGhhc2UAaGFuaW1fc2t1bGxiYXNlAGNoYW5nZXBvc3R1cmUAd2FpdGdlc3R1cmUAbW91dGhfZ2VzdHVyZQBtb3V0aF9waWN0dXJlAGZlYXR1cmUAZW5kc19iZWZvcmUAZmlsZXR5cGUAbW91dGhtZXRhdHlwZQBzZWNvbmRfaGFuZHNoYXBlAG5vIGhhbmRzaGFwZQBIYW5kc2hhcGU6Ok5ld0hhbmRzaGFwZUZyb21IYW5kQ29uZmlnOiBDaGVjayB3ZSBoYXZlIGEgY29tcGxldGUgaGFuZHNoYXBlAGFwcHJveF9zaGFwZQBkb2N1bWVudCBpcyBub3Qgc3RhbmRhbG9uZQBmcmFtZS10aW1lAGRlZl9sb2NuYW1lAHVzZV9sb2NuYW1lAHJlc2VydmVkIHByZWZpeCAoeG1sKSBtdXN0IG5vdCBiZSB1bmRlY2xhcmVkIG9yIGJvdW5kIHRvIGFub3RoZXIgbmFtZXNwYWNlIG5hbWUAc2lnbWxOYW1lAHppZ3phZ19zdHlsZQBoYW5pbV9yX2Fua2xlAGhhbmltX2xfYW5rbGUAY29tbWFuZC1maWxlAGxlYWRvdXRhbmdsZQBsZWFkaW5hbmdsZQBhcm1fcGxhbmVfYW5nbGUAYm9keUFuZ2xlAGhhbmRBbmdsZQB0d2lkZGxlAE1pZGRsZUNyb3NzZWRPdmVySW5kZXhfbWlkZGxlAFRodW1iVG9CZW50TWlkZGxlX21pZGRsZQBjcnVtYmxlAHRpbWVzY2FsZQBib2R5bGFuZ3VhZ2UAZ2xvc3NfbGFuZ3VhZ2UAc2lnbl9sYW5ndWFnZQBoYW5pbV9yX2tuZWUAaGFuaW1fbF9rbmVlAHNlY29uZF9leHRyZW1pdHlzaWRlAHBpbmt5c2lkZQBzZWNvbmRfYm9keXNpZGUAZWxib3dpbnNpZGUAYWxvbmdzaWRlAHJpZ2h0X2Jlc2lkZQBsZWZ0X2Jlc2lkZQB0aHVtYnNpZGUAc2Vjb25kX3NpZGUAaWxsZWdhbCBwYXJhbWV0ZXIgZW50aXR5IHJlZmVyZW5jZQBlcnJvciBpbiBwcm9jZXNzaW5nIGV4dGVybmFsIGVudGl0eSByZWZlcmVuY2UAcmVjdXJzaXZlIGVudGl0eSByZWZlcmVuY2UAdG9yc29EaXN0YW5jZQBhcm1EaXN0YW5jZQBoYW5kRGlzdGFuY2UAaGVhZERpc3RhbmNlAG9uZV9oYW5kZWRfY29tcGxpYW5jZQByZWFsc3BhY2UAc2lnbmluZ3NwYWNlAC1pbnRlcmZhY2UAUy1lYXJsb2JlAG1heFNjQW5nbGVGd2QAYXNkAGxlZnRfZm9yd2FyZAByZWFjaE5lYXJIYXJkAHJvdW5kAG5vIGVsZW1lbnQgZm91bmQAc2Vjb25kX2NvbnRhY3RraW5kAGJlaGluZABhcHBlbmQAc2Vjb25kX21haW5iZW5kAGxvY2F0aW9uX2hhbmQAZm9yIG5vbmRvbSBoYW5kAGZvciBkb20gaGFuZABySGFuZABsSGFuZAAlbGQAbWlub3JpZABtYWpvcmlkAFMtbG93ZXJleWVsaWQAUy11cHBlcmV5ZWxpZABNaWQAaWxsZWdhbCBjaGFyYWN0ZXIocykgaW4gcHVibGljIGlkAHRhcmdldHRlZABwYXJzaW5nIGFib3J0ZWQAZnVzZWQAb3Bwb3NlZAB0aHVtYmVuY2xvc2VkAHJlc2VydmVkIHByZWZpeCAoeG1sbnMpIG11c3Qgbm90IGJlIGRlY2xhcmVkIG9yIHVuZGVjbGFyZWQAdGVybWluYXRlX2hhbmRsZXIgdW5leHBlY3RlZGx5IHJldHVybmVkAG5vIGVsYm93IHJhaXNlIHBlcmZvcm1lZAB0ZXh0IGRlY2xhcmF0aW9uIG5vdCB3ZWxsLWZvcm1lZABYTUwgZGVjbGFyYXRpb24gbm90IHdlbGwtZm9ybWVkAGRibGhvb2tlZABwYXJzaW5nIGZpbmlzaGVkAHNwZWVkAGFybWV4dGVuZGVkAHBhcnNlciBub3Qgc3VzcGVuZGVkAHBhcnNlciBzdXNwZW5kZWQAcmlnaHRoYW5kZWQAZmluZ2VyMjNzcHJlYWQAb3JpZW50YXRpb25fbGVhZABzaGFwZV9sZWFkAFMtZm9yZWhlYWQAc3RhcnRfc2xpZ2h0bHlfYWhlYWQAJXNfJWQAbG9jYXRpb25fJWQAc2l0ZV8lZABzaXRlXyVzLSVkLSVkLSVkLSVkACAgICAtPnJvb3QgaSxqPSVkLCVkAGVvdXQgJS4zZiBlZndkICUuM2YgZXN6ICVkAFVua25vd24gZXJyb3IgJWQAJWQgJWQgJWQAc3RkOjpiYWRfYWxsb2MAaGFuZExvYwBmb3VyY2MAVC0lcyVjACVjJWMlYyVjJWMlYyVjJWMlYyVjfCVjJWMAQS0lYyVjJWMASC0lYyVjAHA6JWMgeDolYyB5OiVjIHo6JWMASC0lYyVkLSVzLSVjAHdiAFRodW1iYmV0d2VlbjIzRmlzdF90aHVtYgB0b3dhcmRzX3RodW1iAFRodW1iVG9CZW50TWlkZGxlX3RodW1iAFBpbmNoQmVudFRodW1iVG9NaWRkbGVfdGh1bWIASW5kZXhDcm9zc092ZXJUaHVtYl90aHVtYgBGaXN0QXJvdW5kVGh1bWJfdGh1bWIAUGluY2hObzJfdGh1bWIAVGh1bWIAajFiAHJ3YQBtb3V0aF9tZXRhAGF2YXRhclN0YXRpY0RhdGEAc2FtcGEAUy1jb3JuZWEAc3BsaXRfAEdFU1RfAAogICAgWyVzXQBbaHMgJWMgbmQgJWMgaEQgJWMgaE4gJWMgb3AgJWMgcnMgJWMgcmggJWNdACVZLSVtLSVkICVYACVZLSViLSVkICVhICVYAEhOT1UAUkVVAExFVQBST09UAFJGT1QATEZPVABTVUNDRVNTSVZFX0ZJTkdFUlMAWklHWkFHX1JFUFMAQ0FTAFJTUgBMU1IASFRSUgBCVFJSAC1SUgBIVExSAEJUTFIAUkNMUgBMQ0xSAEgtTFIAUy1oZWFkdG9wLUZSAFJFUgBMRVIAUy1oZWFkdG9wLUJSAFMtbG93ZXJvcmJpdC1SAFMtb3V0ZXJvcmJpdC1SAFMtdXBwZXJvcmJpdC1SAFMtbGlwcy1SAFMtZXllcy1SAFMtZWFyLVIAUy1lYXJ0b3AtUgBTLWhlYWR0b3AtUgBTLWxvd2VybGlwLVIAUy11cHBlcmxpcC1SAFMtZ29uaW9uLVIAUy1jaGluLVIAUy1jaGVlay1SAFMtbm9zZS1SAFMtZWFybG9iZS1SAFMtZm9yZWhlYWQtUgBBUlAASC1MUABILSVjJWQtVElQAFJTRVAATFNFUABTSUdOX0dBUABQSFJBU0VfR0FQACBBLVJVTwAgQS1MVU8AQS1SU08AQS1MU08ATEVMV0ZJQk9GSUJPAExTVUVGSUJPRklCTwBOQU4AUkxSTABMTFJMAFZSTUwAU2lHTUw6OmNoZWNrU2lHTUwASGFuZEpvaW50Um90YXRpb25zOjppbnRlcnBvbGF0ZUhhbmRyb3RzOiBuZXdyb3RzPT1OVUxMAEhhbmRKb2ludFJvdGF0aW9uczo6aW50ZXJwb2xhdGVIYW5kcm90czogb2xkcm90cz09TlVMTABIYW5kSm9pbnRSb3RhdGlvbnM6OmludGVycG9sYXRlSGFuZHJvdHM6IG5ld3JvdHMtPnJvdGF0aW9ucz09TlVMTABIYW5kSm9pbnRSb3RhdGlvbnM6OmludGVycG9sYXRlSGFuZHJvdHM6IG9sZHJvdHMtPnJvdGF0aW9ucz09TlVMTAAtTEwAUy1oZWFkdG9wLUZMAFMtaGVhZHRvcC1CTABTLWxvd2Vyb3JiaXQtTABTLW91dGVyb3JiaXQtTABTLXVwcGVyb3JiaXQtTABTLWxpcHMtTABTLWV5ZXMtTABTLWVhci1MAFMtZWFydG9wLUwAUy1oZWFkdG9wLUwAUy1sb3dlcmxpcC1MAFMtdXBwZXJsaXAtTABTLWdvbmlvbi1MAFMtY2hpbi1MAFMtY2hlZWstTABTLW5vc2UtTABTLWVhcmxvYmUtTABTLWZvcmVoZWFkLUwAIEEtUlVJACBBLUxVSQBBLVJTSQBBLUxTSQBSV1JJAExXUkkAU1BJAFJFTFdGT0JJRk9CSQBSU1VFRk9CSUZPQkkAVEgAUlRIRwBMVEhHAFpJR1pBRwBBLVJTRgBIUFNGAEEtTFNGAFJGAFBGAElORgBNRgBIVExGAEJUTEYAUkNMRgBMQ0xGAElGAHNpdGVfVU5ERUYAUy1oZWFkdG9wLUYAUkVZRQBMRVlFAE1FRElVTUNVUlZFAFNNQUxMQ1VSVkUAQklHQ1VSVkUAUkVUVVJOX01PVkUAU1REX01PVkUAQ0lSQ0xFAFJFUEVBVF9TQ0FMRQAtRQBIRUFEACBULVJSQwAgVC1SQwAgVC1MTEMAIFQtTEMATkVDACBULUNDAFMtY2hpbmhvbGxvdy1DAFMtZXllcy1DAFMtaGVhZHRvcC1DAFMtbG93ZXJsaXAtQwBTLXVwcGVybGlwLUMAUy11bmRlcmNoaW4tQwBTLWNoaW4tQwBTLW5lY2t0b3BiYWNrLUMAUy1za3VsbGJhY2stQwBTLW5vc2UtQwBTLWZvcmVoZWFkLUMAQS1SU0IAQS1MU0IAUy1oZWFkdG9wLUIAUkxSQQBMTFJBAFJVUEEATFVQQQA/ADwlcz4APC8lcz4APCVzLz4AVG9rZW5pc2VTQU1QQSggJXMgKSA9ADwAQ2Fubm90IHVzZSBhdmF0YXIgc2l0ZXMgdG8gY29tcHV0ZSBzaG91bGRlciBjb25zdHJhaW50czoAJWQgdmFsdWVzOgBUOgAgUToAMjAwNy0wMy0xOABiZW5kNQBmaW5nZXIyMzQ1AGJlbmQ0ACxqMwBiZW5kMwBTUEkzAEIzADEuMSwgTE9BMwBmaW5nZXIyMwBmaW5nZXIyACxqMgBhbXBsaXR1ZGUyAGJlbmQyAEoyAFNQSTIATFRIMgBNYXkgMjkgMjAyMgBwaW5jaDEyAGNlZTEyAGoxAGFtcGxpdHVkZTEAYmVuZDEASjEATFRIMQBMSUYxAE5FQzEAaXNvLTg4NTktMQAxLjAAPC8AU3VwcHJlc3MgYWxsIGVycm9yIG91dHB1dC4ATmFtZSBvZiB3b3JraW5nIGRpcmVjdG9yeSBmb3IgdGVzdCBmaWxlcyBhbmQgb3V0cHV0LgBWUk1MIGZpbGUgdG8gYXBwZW5kIHRvIHRoZSBWUk1MIG91dHB1dC4AVXNlIGxpbmVhciB0cmFqZWN0b3JpZXMgZm9yIGFsbCBtb3ZlbWVudC4AUmVhZCBvcHRpb25zIGZyb20gZmlsZS4gIFRoZSBkZWZhdWx0Cgljb21tYW5kIGZpbGUgYW5pbWdlbi5pbmkgd2lsbCBhbHdheXMgYmUgcmVhZAoJKGlmIGl0IGV4aXN0cykgYmVmb3JlIGFsbCBvdGhlciBvcHRpb25zLgBOYW1lIG9mIGEgc2lnbiB0byBwZXJmb3JtLiAgVGhpcyBpcyBhbiBhbHRlcm5hdGl2ZSB0byBwcm92aWRpbmcgYQoJcGxheWxpc3QgZmlsZS4gIE11bHRpcGxlIHNpZ25zIGNhbiBiZSBnaXZlbiBieSBhIHF1b3RlZCBzdHJpbmcKCW9yIG11bHRpcGxlIC1zaWduIG9wdGlvbnMuAE5hbWUgb2YgZGlyZWN0b3J5IHRvIGJlIHNlYXJjaGVkIGZvciBhdmF0YXIgZGVmaW5pdGlvbnMuAEZpbGUgb2YgZ2VzdHVyZSBkZWZpbml0aW9ucy4AUHJpbnQgdG8gRVJST1JPVVRQVVQgYSBsaXN0IG9mIGFsbCBzaWducyB0byBiZSBwZXJmb3JtZWQgYW5kIHRoZSB0aW1lIGVhY2ggc2lnbiBiZWdpbnMuAE5hbWUgb2YgZGlyZWN0b3J5IHRvIGJlIHNlYXJjaGVkIGZvciB1bmRlZmluZWQgZ2VzdHVyZXMuAEVSUk9SOiBDYW5ub3Qgb3BlbiBvdXRwdXQgZmlsZSAlcy4AU3BlY2lmeSBldGhuaWNpdHkgb2Ygc3RpY2sgZmlndXJlIHNraW4gY29sb3VyLgBOYW1lIG9mIGF2YXRhci4ARmlsZSB0byB3cml0ZSBBU0QgZGVzY3JpcHRpb24gdG8uAE5hbWUgb2YgZGlyZWN0b3J5IHRvIGZpbmQgYWxsIG90aGVyIGRpcmVjdG9yaWVzIGFuZCBmaWxlcyByZWxhdGl2ZSB0by4ARmlsZSB0byB3cml0ZSBFeHRlbmRlZCBTaUdNTCB0by4AR2VuZXJhdGUgbWVtb3J5IGxlYWsgZGVidWcgaW5mb3JtYXRpb24uAFNlY29uZHMgcGVyIGZyYW1lIG9yIGZyYW1lcyBwZXIgc2Vjb25kIG9mIGFuaW1hdGlvbi4AUmV0YWluIGFuIGludGVybmFsIGRpY3Rpb25hcnkgb2YgYWxsIGdlc3R1cmVzIHNlZW4uAE5hbWUgb2YgYSBmaWxlIGNvbnRhaW5pbmcgYSBzZXF1ZW5jZSBvZiBnZXN0dXJlcyB0byBwZXJmb3JtLgBGaWxlIHRvIHdyaXRlIGVycm9yIG1lc3NhZ2VzIHRvLiAgSWYgbm90IHNwZWNpZmllZCwgdGhleSB3aWxsIGdvIHRvIHRoZSBzdGFuZGFyZCBlcnJvciBzdHJlYW0uAE5hbWUgb2YgY29uZmlnIGZpbGUuIERlZmF1bHQgZXh0ZW5zaW9uIGlzIC5jb25maWcuAE5hbWUgb2YgYW4gSC1hbmltIGh1bWFub2lkIHRvIHVzZSBpbnN0ZWFkIG9mIGEgYmFsbC1hbmQtc3RpY2sgZmlndXJlLgBGaWxlIHR5cGUuAEludGVyZmFjZSB0eXBlLgBOdW1iZXIgb2YgcmlnaHQtYW5nbGVzIHRvIG9mZnNldCB0aGUgcmlnaHQgc2xhcCBib25lLgBOdW1iZXIgb2YgcmlnaHQtYW5nbGVzIHRvIG9mZnNldCB0aGUgbGVmdCBzbGFwIGJvbmUuAEZvcmNlIGFsbCBiYXNpYyBtb3ZlbWVudHMgdG8gdGFrZSB0aGUgc2FtZSB0aW1lLgBPdXRwdXQgZmlsZS4AQXBwZW5kIGVycm9yIG91dHB1dCB0byBlcnJvciBmaWxlLgBQcmludCB0aGlzIG1lc3NhZ2UuAFdhcm5pbmc6IG51bGwgaW5pdGlhbCBwb3N0dXJlIGZvciBtb3ZlbWVudCB0eXBlICVkLgBOYW1lIG9mIGRpcmVjdG9yeSBmb3IgYW5pZ21lbidzIG90aGVyIHNldHVwIGZpbGVzIChyZXF1aXJlZCBmb3IgY29tbWFuZC1saW5lIG9wZXJhdGlvbikuACVkIChtb3V0aHBpY3R1cmUgJXgpACVkIChhdmF0YXJtb3JwaC0lcykAJXMgJXMgKCVzKQBub3Qgd2VsbC1mb3JtZWQgKGludmFsaWQgdG9rZW4pAChudWxsKQAoc3RyaW5nKQAodW5kZWZfYmVuZGluZykAKHVuZGVmKQAodGMgJS4yZixvYyAlLjJmLHN1ICUuMmYsb3MgJS4yZikAKHVuZGVmX3NoYXBlKQAobm9uZSkAKG5vIG5hbWUpACVkIChVTkRFRi0lZCkAKGVycm9yICVkKQBQQVIpAFNFUSkAU2luZ2xlTW92ZW1lbnRGcm9tWE1MKCBFTEVNRU5UX2Nyb3NzbW90aW9uICkAKCB4YSAlLipmLCB6YSAlLipmLCBteCAlLipmLCBjeiAlLipmICkAKCBjeCAlLipmLCByICUuKmYsIGEgJS4qZiwgZyAlLipmICkAdG0oICVzICAlLjNmOiUuM2Y6JS4zZiAlYyAlLjNmKCVkKSUuM2YgICUuM2YoJWQpJS4zZiAlYyApACAoAHNlY29uZF9hcHByb3g9IgAgbW92ZW1lbnQ9IgAgc2Vjb25kX2Nsb2NrcGx1cz0iACBjbG9ja3BsdXM9IgBhcHByb3hfcGFsbW9yPSIAYXBwcm94X2V4dGZpZGlyPSIAIHJhdGlvPSIAIGFic19tb3Rpb249IgAgc2Vjb25kX2FsdGVybmF0aW5nPSIAIGFsdGVybmF0aW5nPSIAIGJvdW5jaW5nPSIAYXBwcm94X3NoYXBlPSIAIGRlZl9sb2NuYW1lPSIAc2Vjb25kX2V4dHJlbWl0eXNpZGU9IgBzZWNvbmRfYm9keXNpZGU9IgAgZnVzZWQ9IgB0aHVtYmVuY2xvc2VkPSIAUHVyZSB2aXJ0dWFsIGZ1bmN0aW9uIGNhbGxlZCEAICBDb3JyZWN0aW5nIGNwdCAlZCBSIGJ5IAAgIENvcnJlY3RpbmcgY3B0ICVkIEwgYnkgAAogIGJ5IAByRiBuZXcgAGxGIG5ldyAAICAgIFRDOjpGTyBJbnNpZGUgcmlnaHQgY2lyY2xlIHhDICUuM2YgekMgJS4zZiByICUuM2YgckNyICUuM2YgdiAAICAgIFRDOjpGTyBJbnNpZGUgbGVmdCBjaXJjbGUgeEMgJS4zZiB6QyAlLjNmIHIgJS4zZiBsQ3IgJS4zZiB2IAAKVEM6OkZPIFJJR0hUIHYgAApUQzo6Rk8gTEVGVCB2IAAKICAgIHYgAAogIHNpZ21sQ29uc3QgACByb3QgAG5vdCAAbGVmdEhpcFRpbHRSb3QgAHBlbHZpc1JvdCAAZmluYWwgcmlnaHRIaXBSb3QgAGZpbmFsIGxlZnRIaXBSb3QgAHJpZ2h0QW5rbGVSb3QgAGxlZnRBbmtsZVJvdCAAT0hHOjp0SE5UR0YgaGFuZFJvdCAASEE6OmNBUiBzY0FuZ2xlICUuM2Ygc2NSb3QgACAgICByaWdodFJlbE1vdmVSZXN1bHQgACAgICBsZWZ0UmVsTW92ZVJlc3VsdCAARE06OnNldEFEViBwLT5yKHQpLmVsYm93TW92ZW1lbnQgcmlnaHQgAERNOjpzZXRBRFYgZWxib3dNb3ZlbWVudCByaWdodCAACiAgICByZnQgACBsZnQgACAgICBOb25kb20gdGFyZ2V0IAAgICAgRG9tIHRhcmdldCAAICAgIENvbXBvbmVudCAlZCBzZXRzIHJpZ2h0QWJzVGFyZ2V0IAAgICAgcmlnaHRBYnNUYXJnZXQgACAgICBDb21wb25lbnQgJWQgc2V0cyBsZWZ0QWJzVGFyZ2V0IAAgICAgbGVmdEFic1RhcmdldCAAICAgIHJpZ2h0RmluYWxUYXJnZXQgACAgICBsZWZ0RmluYWxUYXJnZXQgAG5kdCB1bmRlZmluZWQ6IHNldHRpbmcgbmR0IHRvIG9sZCBuZHQgACAgICBuZHQgAGR0IHVuZGVmaW5lZDogc2V0dGluZyBkdCB0byBvbGQgZHQgAGNhbGNMZWFkRnJhY3Rpb25zIGZ3ZCAlYyAlLjNmID0gWyAlLjNmICUuM2YgJS4zZiAlLjNmIF0gcGN0IAAgIHRodW1iY29udGFjdCAAY3QgZGVmaW5lZCwgbmR0IHVuZGVmaW5lZDogc2V0dGluZyBuZHQgdG8gY3QgAGN0IGRlZmluZWQsIGR0IHVuZGVmaW5lZDogc2V0dGluZyBkdCB0byBjdCAAbmR0IHVuZGVmaW5lZDogc2V0dGluZyBuZHQgdG8gb2xkIGN0IABkdCB1bmRlZmluZWQ6IHNldHRpbmcgZHQgdG8gb2xkIGN0IAAgIHF1YXQgACAgICBhZGp1c3RTaFF1YXQgACBpcyBhdCAAICAgICByaWdodCAlcyBhdCAASm9pbnQ6OmFkZEdsb2JhbFJvdGF0aW9uICVzIHJlc3VsdAogICAgdCAASm9pbnQ6OnNldEdsb2JhbEdsb2JhbERpcmVjdGlvbiByZXN1bHQKICAgIHQgAEpvaW50OjphZGRHbG9iYWxSb3RhdGlvbiAlcwogICAgdCAAVE06OnNldEFEViByaCBjaGFuZ2V0aW1pbmcgd2l0aCBhdiBkZWZhdWx0cyAAICBleGVtcHRlZGRpZ2l0cyAAICByaWdodEZQRGlnaXRzIAAgIGxlZnRGUERpZ2l0cyAAICBzcGVjaWFsZmluZ2VycyAACkgtTFAgbmV3IHBvcyAACkgtTFAgaW5kZXggJWQgcG9zIABMSUYxIGluZGV4ICVkIHBvcyAAY2FsY0xlYWRGcmFjdGlvbnMgAFRwYXJhbXMgAHRQYXJhbXMgAHNoW1JdLmF4aXMgAHNoW0xdLmF4aXMgACVzR2VuZXJhbEN5bGluZGVyIHsKJXMgIGhlaWdodCAlLipmCiVzICByYWRpdXMgJS4qZgolcyAgYXBwZWFyYW5jZSBVU0UgQVZBVEFSQVBQRUFSQU5DRQolcyAgYXhpcyAAbGVmdEhpcFRpbHRBeGlzIABBdm9pZGluZyBoYW5kIGNvbGxpc2lvbiBieSBpbmNyZWFzaW5nIGRpc3RhbmNlCmZyb20gcmlnaHQgaGFuZCBieSAlLjNmLgogICAgSGFuZHNpdGUgaXMgAEF2b2lkaW5nIGhhbmQgY29sbGlzaW9uIGJ5IGluY3JlYXNpbmcgZGlzdGFuY2UKZnJvbSBsZWZ0IGhhbmQgYnkgJS4zZi4KICAgIEhhbmRzaXRlIGlzIAAgICAgSGFuZCBzaXRlIGlzIABiZW5kVHlwZXMgAHRvcnNvc2l0ZVt5ICVkXVt4ICVkXSA9IGpvaW50ICVzIABIQTo6SEEgaW5kZXhpbmcgc2l0ZSAlcyAASGFuaW1BdmF0YXI6OmNyZWF0ZVNpR01MVG9yc29TaXRlczoKICAgIHNpdGUgJXMgACAgbm9ubWFudWFsICVkICVzIAAgIGZhciBsZWZ0ICAlcyAAICAgICAgbGVmdCAgJXMgACAgICByaWdodEFic0NvcnIgACAgICBsZWZ0QWJzQ29yciAAICAgIHJpZ2h0UmVsQ29yciAAICAgIGxlZnRSZWxDb3JyIAAoZXJyb3IgACAgICBkaXNwRXJyb3IgAE5vIGh1bGwgc2l0ZSBmb3VuZCBmb3IgAE5vIGh1bGwgYWRqdXN0bWVudCByZXF1aXJlZCBmb3IgAAogICAgbG9jIGFmdGVyIABPbmVBcm1BbmltYXRvcjo6Y0pSIHNob3VsZGVyIABKb2ludDo6c2V0R2xvYmFsR2xvYmFsRGlyZWN0aW9uICVzCiAgICBxIABzdGFydCByaWdodCBkaXNwIABlbmQgcmlnaHQgZGlzcCAAICAgIGFic0Rpc3AgAGhpcFJhaXNlICVmLCBuZXdIaXAgAG5ld3JpZ2h0SGlwIABjaGVja3JpZ2h0SGlwIABuZXdsZWZ0SGlwIABjaGVja2xlZnRIaXAgACB6ZXJvIGdsb2JhbCBwb3NpdGlvbiBzZXQgdG8gAE5lYXJlc3QgaGFuZCBzaXRlIHRvIABHZXN0dXJlIG1ha2VzIGEgY29udGFjdCwgdGhlcmVmb3JlIG1hbm5lciBjaGFuZ2VkIHRvIAAgIFNldHRpbmcgY3B0ICVkIFIgdG8gAAogICAgdG8gACBhbHJlYWR5IGhhcyBnbG9iYWwgcG9zaXRpb24gACBpbiBkaXJlY3Rpb24gAAogICAgc291cmNlRGlyZWN0aW9uIAAKICAgIHdpdGggc3VibG9jYXRpb24gACAgICBOZXcgbG9jYXRpb24gAEFzc3VtaW5nIGxvY2F0aW9uIABIYW5kcyBhcmUgc2VwYXJhdGVseSBnaXZlbiB0aGUgc2FtZSBsb2NhdGlvbiAAU2luZ2xlIGxvY2F0aW9uIABTaW5nbGUgYXJtL2hhbmQgbG9jYXRpb24gAEhhbmQgbG9jYXRpb24gAHJGIGluIABsRiBpbiAAICAgIE5vbmRvbSBoYW5kIG1vdmVzIGZyb20gACAgICBEb20gaGFuZCBtb3ZlcyBmcm9tIABJbiBwYXJhbGxlbCBjb21iaW5hdGlvbiwgY2hhbmdpbmcgbWFubmVyIGZyb20gAFRNOjpzZXRBRFYgJXggY29ycmVjdGluZyBmclQgZnJvbSAAVE06OnNldEFEViAleCBjb3JyZWN0aW5nIGZsVCBmcm9tIAAgICAgbm9uZG9tIABoYW5kbGVfbm9ubWFudWFsY29uZmlnOgogICAgZG9tIAAKICBmcnRsIAAKICBjcnRsIABUTTo6c2V0QURWICV4IHJ0bCAAUE1zZXRBRFYgMzoKICByaWdodCByZWwgAAogIGxlZnQgcmVsIAAgICAgICAgICAgIGwgAFRNOjpzZXRBRFYgcmggY2hhbmdldGltaW5nIABUTTo6c2V0QURWIHBvc3R1cmVDaGFuZ2UucmlnaHRDaGFuZ2VUaW1pbmcgAFRNOjpzZXRBRFYgcG9zdHVyZUNoYW5nZS5sZWZ0Q2hhbmdlVGltaW5nIABsZWZ0IGFua2xlIGcgAFRNOjpzZXRBRFYgJXggYWJzRGlzdGFuY2UgJS4zZiAAR2V0RGVmYXVsdEF2YXRhckluZm8gY2hhbmdldGltaW5nIHNsICVmIABsZWZ0QW5rbGVNb3ZlIABIYW5kcyB0b3VjaCwgc28gZGVmYXVsdCBoYW5kc2l0ZSAASGFuZCBpbiBwcm94aW1pdHkgdG8gYm9keSBzdXJmYWNlLCBzbyBkZWZhdWx0IGhhbmRzaXRlIABIYW5kcyBoYXZlIGEgZGVmaW5lZCBub24tY29udGFjdCBwcm94aW1pdHkgdG8gZWFjaCBvdGhlciwKc28gZGVmYXVsdCBoYW5kc2l0ZSAAICAgIE5vbmRvbSBoYW5kc2l0ZSAAICAgIERvbSBoYW5kc2l0ZSAAV2FybmluZzogdGFyZ2V0IHNpdGUgAFRhcmdldCBzaXRlIABIYW5pbUF2YXRhcjo6Y3JlYXRlU2l0ZTogRXhpc3Rpbmcgc2l0ZSAASGFuaW1BdmF0YXI6OmNyZWF0ZVNpdGU6IENyZWF0aW5nIHNpdGUgAE9IRzo6Q29uTG9jUzogdW5hYmxlIHRvIGxvY2F0ZSBwYXJlbnQgam9pbnQgb2Ygc2l0ZSAATm8gbm9ybWFsIHZlY3RvciBmb3IgcmlnaHQgaGFuZCBzaXRlIABVc2luZyBub3JtYWwgdmVjdG9yIGZvciByaWdodCBoYW5kIHNpdGUgAE5vIG5vcm1hbCB2ZWN0b3IgZm9yIGxlZnQgaGFuZCBzaXRlIABVc2luZyBub3JtYWwgdmVjdG9yIGZvciBsZWZ0IGhhbmQgc2l0ZSAAQ3JlYXRpbmcgQVNEIGhlYWQgc2l0ZSAAbG9jYXRlU2l0ZUlEIDQ6IGVzICVkIHNpdGUgAGxvY2F0ZVNpdGVJRCAzOiBzaXRlIABsb2NhdGVTaXRlSUQgMjogc2l0ZSAAbG9jYXRlU2l0ZUlEIDE6IHNpdGUgAGxvY2F0ZVNpdGVJRCglYykgMDogc2l0ZSAAdGFyZ2V0c2l0ZVNpdGUgAEhhbmltQXZhdGFyOjpmYWtlRmFyTGVmdFJpZ2h0ICVzIGNlbnRyZXNpdGUgJXgKICAgIGNlbnRyZSAAQ09SUkVDVElORyBTSVRFICVzOiBsb2MgYmVmb3JlIAAgIHNoYXBldHlwZSAAICB0aHVtYnBvc1R5cGUgAG5ld0Fua2xlIAByaWdodF9oYW5kU2l0ZUNoYW5nZSAACmxlZnRfaGFuZFNpdGVDaGFuZ2UgAFBNc2V0QURWIDc6IGFkZCBoYW5kU2l0ZUNoYW5nZSAAU2lHTUwgZXJyb3I6IGV4cGVjdGVkIGxvY2F0aW9uIG9uICVzIGhhbmQgbG9jYXRpb24sIGZvdW5kIABTaUdNTCBlcnJvcjogZXhwZWN0ZWQgaGFuZCBsb2NhdGlvbiwgZm91bmQgACAgc2Vjb25kX2NvbnRhY3RraW5kIAAgIGNvbnRhY3RraW5kIABDYW5ub3QgbG9jYXRlIHRhcmdldCBzaXRlIGZvciByaWdodCBoYW5kIABDYW5ub3QgbG9jYXRlIHRhcmdldCBzaXRlIGZvciBsZWZ0IGhhbmQgAGhjTm9uZG9tSGFuZCAAaGNEb21IYW5kIAByRiBvbGQgAGxGIG9sZCAARm9yY2VPdXRzaWRlIG1vdmVkIABPSEc6OnRITlRHRiAlYyB1bnJvdGF0ZWQgAE9IRzo6dEhOVEdGIHJvdGF0ZWQgAHRpZXIgJWQgAHBhciAlZCAACiAgICBkIAAgIFJlc3VsdCBmaW5hbC5yaWdodC50YXJnZXRMb2MgACAgUmVzdWx0IGZpbmFsLmxlZnQudGFyZ2V0TG9jIAB0YXJnZXRzaXRlTG9jIAAgICAgYm9keXZlYyAAICAgIGVsYm93VmVjIAAgICAgcmVhY2hWZWMgAEhBOjpjQVIgY2hlY2sgdWEgAFslc10gAFRNOjpzZXRBRFYgJXggc3RhcnQgJXgKICBpclQgAFRNOjpzZXRBRFYgJXggYWZ0ZXIgSW5pdFBvc3R1cmUxICV4CiAgaXJUIAAgIGdpdmluZyBmclQgAAogIGZyVCAACiAgaWxUIAAgICAgICAgICBmbFQgAAogIGZsVCAAJXMgUVVBVCAAT0hDUDo6c2hIUyBjSFMgAE9IQ1A6OmNXTCBjSFMgAAogICAgbG9jYWwgaW52USAAY1AgAENhbGxpbmcgYXZhdGFyLT5GT1RPIABSZXN1bHQgb2YgYXZhdGFyLT5GT1RPIAAgaFNMIAB0b3Jzb3NpdGVbeSAlZF1beCAlZF0gPSBqb2ludCBOVUxMIAAsIHJIIAAsCiAgICAgICAgIGxIIAByaWdodEUgAGxlZnRFIABTSVRFIAByaWdodEMgAGxlZnRDIAAsIHJBIABGb3VyQmFyKCBsQSAAJXMgPT4gAGZpbmFsUmlnaHRUb0xlZnQgPSAAVE06OnNldEFEViAleCByVEwgZmluYWwgPSAAVE06OnNldEFEViAleCBsVEwgZmluYWwgPSAAUE06OnBIUyBpbml0IHBvc3R1cmUgPSAAZmluYWwgcG9zdHVyZSA9IABUTTo6c2V0QURWICV4IHJUTCBiZWZvcmUgPSAAVE06OnNldEFEViAleCBsVEwgYmVmb3JlID0gACAgICBoYW5kRGlzcGxhY2VtZW50ICVkID0gAFRQWyVkXSA9IAB0YXJnZXRHZXN0dXJlLT5haENvbnN0OiAARmlsbGluZyBpbiB1bnNwZWNpZmllZCBwYXJ0cyBvZiBjb25zdGVsbGF0aW9uIGZyb20gZWFybGllciB2YWx1ZXMuCiAgTmV3IGFoQ29uc3Q6IAAgIE9sZCBhaENvbnN0OiAAICBNZXJnZWQgYWhDb25zdDogAEdlc3R1cmUgbWFrZXMgbm8gY29udGFjdCwgdGhlcmVmb3JlIG1hbm5lciBub3QgY2hhbmdlZC4KICAgIHNnQ29uc3Q6IABSZXR1cm4gbW92ZW1lbnQ6IABSZXBlYXRlZCBtb3ZlbWVudDogAGxvY2F0ZVNpdGVJRCAyYTogJWQgZGlnaXRzOiAAJXM6IABhZnRlcjogACAgbWFubmVyOiAARVJST1I6IFF1YXRlcm5pb246OmNoZWNrVmFsaWRRdWF0IGNvbnRhaW5zIG5hbiBvciBpbmY6IABFUlJPUjogVmVjdG9yOjpjaGVja1ZhbGlkVmVjdG9yIGNvbnRhaW5zIG5hbiBvciBpbmY6IABzZXEgJWQgc3RhcnQgJS4zZiBlbmQgJS4zZjogAAogICAgTmV3IHNpdGU6IABJbnRlcm5hbCBlcnJvcjogYXR0ZW1wdGluZyB0byBkdXBsaWNhdGUgbm9uZXhpc3RlbnQgc2l0ZS4KICAgIE9sZCBzaXRlOiAAVHdvSENvbmNyZXRlUG9zdHVyZTogAFRNOjpwcm9wSFMgYmVmb3JlOiAAICAgIHJpZ2h0IGhhbmQ6IAAgICAgbGVmdCBoYW5kOiAAV2FybmluZzogZmluYWwgcG9zdHVyZSBvZiBtb3ZlbWVudCB0eXBlICVkIG5vdCBmdWxseQogIGRlZmluZWQ6IABIYW5pbUF2YXRhcjo6Y3JlYXRlUXVpbmN1bnhDZW50cmVTaXRlIGZhaWxlZDogAEFIQzo6QUhDIFdBUk5JTkc6IGhjVGFyZ2V0IGRpc2NhcmRlZDogAFdSSVNUOiAAU0hPVUxERVI6IAAKCgpESUU6IAAgIHNlY29uZF9jb250YWN0MSAAICBjb250YWN0MSAAICB0aHVtYmJldHdlZW4xIAAgIHNlY29uZF9jb250YWN0MCAAICBjb250YWN0MCAAICB0aHVtYmJldHdlZW4wIAAsIAAgIHJpZ2h0QWJzVGFyZ2V0ICglZCkgACAgbGVmdEFic1RhcmdldCAoJWQpIABmYXJyaWdodCgpIABmYXJsZWZ0KCkgAGNlbnRyZSgpIABJTlRFUk5BTCBFUlJPUjogUXVhdEpvaW50Um90YXRpb246OnNldFNwbGF5QXhpcyggAElOVEVSTkFMIEVSUk9SOiBIaW5nZUpvaW50Um90YXRpb246OnNldFNwbGF5QXhpcyggAElOVEVSTkFMIEVSUk9SOiBUdXJyZXRKb2ludFJvdGF0aW9uOjpzZXRMb25naXRBeGlzKCAASU5URVJOQUwgRVJST1I6IFF1YXRKb2ludFJvdGF0aW9uOjpzZXRMb25naXRBeGlzKCAASU5URVJOQUwgRVJST1I6IEhpbmdlSm9pbnRSb3RhdGlvbjo6c2V0TG9uZ2l0QXhpcyggAElOVEVSTkFMIEVSUk9SOiBRdWF0Sm9pbnRSb3RhdGlvbjo6c2V0QmVuZEF4aXMoIABUaHVtYkJlbmRpbmc6Ok1CRkIoIABIYW5kIHNlcGFyYXRpb24gcmlnaHQgdG8gbGVmdCBpcyAoIAAgICggACAgICBkdCAgACAgICBjdCAgACAlZCAgACAgbGFzdFRpbWVJbmRleDogIAAgIHNpZ21sQ29uc3Q6ICAAICBhaENvbnN0OiAgACAgc3RhcnQ6ICAAICB3cmlzdFJvdDogIAAgIGhhbmRSb3Q6ICAAICBsYXN0Q29tcG9uZW50OiAgACAgbW92ZW1lbnQ6ICAAICByaWdodE1vdmVtZW50OiAgACAgbGVmdE1vdmVtZW50OiAgACAgcG9zdHVyZS5lbGJvd0Rpc3BsYWNlbWVudDogIAAgIGZpbmFsLnJpZ2h0OiAgACAgaW5pdGlhbC5yaWdodDogIAAgIHJpZ2h0OiAgACAgcmVwZXRpdGlvbl9iYXNlc2hpZnQ6ICAAICBiYXNlc2hpZnQ6ICAAICByaWdodEluaXRCYXNlU2hpZnQ6ICAAICBsZWZ0SW5pdEJhc2VTaGlmdDogIAAgIGZpbmFsLmxlZnQ6ICAAICBpbml0aWFsLmxlZnQ6ICAAICBsZWZ0OiAgACAgemlnemFnX29mZnNldDogIAAgIGNvbW1vblRhcmdldDogIAAgIG5vbmRvbVRhcmdldDogIAAgIHNwbGl0Tm9uZG9tVGFyZ2V0OiAgACAgZG9tVGFyZ2V0OiAgACAgc3BsaXREb21UYXJnZXQ6ICAAICBoY1RhcmdldDogIAAgIGluaXRSYWRpdXM6ICAAICBzZWNvbmRfYXhpczogIAAgIGF4aXM6ICAAICBtaW5vckF4aXM6ICAAICBtYWpvckF4aXM6ICAAICBjb25jcmV0ZUF4aXM6ICAAICByaWdodEZsYWdzOiAgACAgbGVmdEZsYWdzOiAgACAgcG9zdHVyZS5wYWxtb3I6ICAAICBwb3N0dXJlLmV4dGZpZGlyOiAgACAgb2Zmc2V0RGlyOiAgACAgY29uc3RlbGxhdGlvbkRpcjogIAAgIGJhc2VzaGlmdF9pbmNyZGVjcjogIAAgIHJlcGV0aXRpb25faW5jcmRlY3I6ICAAICB6aWd6YWdfaW5jcmRlY3I6ICAAICBpbmNyZGVjcjogIAAgIHN0YXJ0RGlzcDogIAAgIGVuZERpc3A6ICAAICB6aWd6YWdfaW5mbzogIAAgIG1vdGlvbjogIAAgIHNlY29uZF9yZXBldGl0aW9uOiAgACAgcmVwZXRpdGlvbjogIAAgIGxvY2FsUG9zaXRpb246ICAAICBnbG9iYWxQb3NpdGlvbjogIAAgIGVsbGlwc2VfZGlyZWN0aW9uOiAgACAgc2Vjb25kX2RpcmVjdGlvbjogIAAgIGRpcmVjdGlvbjogIAAgIG5vcm1hbDogIAAgIGluaXRTeW5jaDogIAAgIGZpbmFsU3luY2g6ICAAICBtaXJyb3Jpbmc6ICAAICBjZWVvcGVuaW5nOiAgACAgcmlnaHRDaGFuZ2VUaW1pbmc6ICAAICBsZWZ0Q2hhbmdlVGltaW5nOiAgACAgYmFzZXNoaWZ0X3NpemU6ICAAICBiYXNlc2hpZnRfaW5jcmRlY3Jfc2l6ZTogIAAgIHJlcGV0aXRpb25faW5jcmRlY3Jfc2l6ZTogIAAgIHppZ3phZ19pbmNyZGVjcl9zaXplOiAgACAgaW5jcmRlY3Jfc2l6ZTogIAAgIHppZ3phZ19zaXplOiAgACAgY3VydmVfc2l6ZTogIAAgIGVsbGlwc2Vfc2l6ZTogIAAgIHNlY29uZF9zaXplOiAgACAgc2l6ZTogIAAgIGN1cnZlOiAgACAgcG9zdHVyZS50YXJnZXRzaXRlOiAgACAgcG9zdHVyZS5oYW5kc2l0ZTogIAAgIG5vbmRvbUhhbmRzaXRlOiAgACAgZG9tSGFuZHNpdGU6ICAAICB0cmF2ZXJzZTogIAAgIHJldHVyblRyYXZlcnNlOiAgACAgcmlnaHRSZXR1cm5UcmF2ZXJzZTogIAAgIGxlZnRSZXR1cm5UcmF2ZXJzZTogIAAgIGZ3ZFJldHVyblRyYXZlcnNlOiAgACAgcmlnaHRGd2RSZXR1cm5UcmF2ZXJzZTogIAAgIGxlZnRGd2RSZXR1cm5UcmF2ZXJzZTogIAAgIGZ3ZFRyYXZlcnNlOiAgACAgcmlnaHRGd2RUcmF2ZXJzZTogIAAgIGxlZnRGd2RUcmF2ZXJzZTogIAAgIHRhcmdldEdlc3R1cmU6ICAAICBmaW5nZXJwbGF5VHlwZTogIAAgIHJpZ2h0RmluZ2VycGxheVR5cGU6ICAAICBsZWZ0RmluZ2VycGxheVR5cGU6ICAAICB0aHVtYnBvc1R5cGU6ICAAICBtYWluYmVuZFR5cGU6ICAAICBwb3N0dXJlLmhhbmRzaGFwZTogIAAgIHNlY29uZF9zaWdtbEhhbmRzaGFwZTogIAAgIHNpZ21sSGFuZHNoYXBlOiAgACAgcGF0aFNoYXBlOiAgACAgZGVmX2xvY25hbWU6ICAAICB6aWd6YWdfc3R5bGU6ICAAICBoYW5kU2l0ZUNoYW5nZTogIAAgIHBvc3R1cmVDaGFuZ2U6ICAAICB0aHVtYnBvc0NvZGU6ICAAICBtYWluYmVuZENvZGU6ICAAICBlbmQ6ICAAICBoY05vbmRvbUhhbmQ6ICAAICBoY0RvbUhhbmQ6ICAAICBzcGxpdE5vbmRvbVN1YkhhbmQ6ICAAICBzcGxpdERvbVN1YkhhbmQ6ICAAICBzaW5nbGVMb2NTdWJIYW5kOiAgACAgdGFyZ2V0TG9jOiAgACAgaGFuZFNpdGVMb2M6ICAAICBzaW5nbGVMb2M6ICAAICBkaXJNb3ZlU3BlYzogIAAgIGNpcmNNb3ZlU3BlYzogIAAgIGJlbmRzWyVzXTogIAAgICAgbmV3IHNfcXVhdCAgIAAgICAgb2xkIHNfcXVhdCAgIABXYXJuaW5nOiBmaW5nZXJzIG9yIHRodW1iIHNwZWNpZmllZCB3aXRoIG5vbi1maW5nZXIgbG9jYXRpb246CiAgICAAdCAlLjNmIHQxICUuM2YgZCAlLjNmIGQxICUuM2YgYTEgJS4zZiBhICUuM2YgYiAlLjNmOgogICAgAEluIGdlc3R1cmUgIiVzIiwgJXMgaGFuZDoKICAgIAAgKQogICAgAEVSUk9SOiBTa2VsVG9wb2xvZ3k6OmxvY2F0ZVNpdGVJRCBjYXNlIDI6IG5vIG5vcm1hbCB2ZWN0b3IgZm9yIHNpdGUgJXMKICAACiVzfQoAICByb3RhdGlvbnM6ICAlMDh4CgAgIGhqcjogICUwOHgKACAgdGFyZ2V0R2VzdHVyZTogICUwOHgKAFNwbGl0TW92ZW1lbnQgJXgKAEVycm9yIGluIGNvbmZpZyBmaWxlOiB3cmlzdF93YWdnbGluZyAleCwgY29tcG9uZW50cyAleAoAR2VzdHVyZTo6UG9zdFByb2Nlc3MgJXgKAEhBOjpjcmVhdGVTaXRlOiBhcm1oYW5nIHNpdGUgaXMgJXgKAFR3b0hDb25jcmV0ZVBvc3R1cmVDaGFuZ2UgJXgKAGhhbmRsZV9nbG9zc19zaWduICVzID0gJXgKAGhhbmRsZV9zaWduX25vbm1hbnVhbDogYWRkaW5nIHRpZXIgJWQgPSAleAoARmluZ2VyUGxheU1vdmVtZW50OjpDb3B5TW92ZW1lbnQoICV4ICkgPSAleAoAV3Jpc3RNb3ZlbWVudDo6Q29weU1vdmVtZW50KCAleCApID0gJXgKAFJlcGVhdE1vdmVtZW50OjpDb3B5TW92ZW1lbnQoICV4ICkgPSAleAoAQ2lyY3VsYXJNb3ZlbWVudDo6Q29weU1vdmVtZW50KCAleCApID0gJXgKAE5vTW92ZW1lbnQ6OkNvcHlNb3ZlbWVudCggJXggKSA9ICV4CgBUYXJnZXR0ZWRNb3ZlbWVudDo6Q29weU1vdmVtZW50KCAleCApID0gJXgKAERpcmVjdGVkTW92ZW1lbnQ6OkNvcHlNb3ZlbWVudCggJXggKSA9ICV4CgBDb3B5R2VzdHVyZSggJXggKSA9ICV4CgBUYXJnZXR0ZWRNb3ZlbWVudCAzOiAleAoAU2VxTTo6c2V0QURWIHN0YXJ0CgBTcE06OnNldEFEViBzdGFydAoAV006OnNldEFEViBzdGFydAoAUk06OnNldEFEViBzdGFydAoARk06OnNldEFEViBzdGFydAoARE06OnNldEFEViBzdGFydAoAQ006OnNldEFEViBzdGFydAoAQ29tcHV0ZWQgcmlnaHRSZWxDb3JyID0gcmlnaHRBYnNUYXJnZXQgLSByaWdodFJlbE1vdmVSZXN1bHQKAENvbXB1dGVkIGxlZnRSZWxDb3JyID0gbGVmdEFic1RhcmdldCAtIGxlZnRSZWxNb3ZlUmVzdWx0CgBBVE06OmdNQSB0aW1lICUuM2YgJXMgYW1vdW50ICUuM2Ygb25zZXQKAEhBOjpjQVIgZnJvbSBPbmVBcm1BbmltYXRvcjo6cmVzZXQKAGNvbnN0ZWxsYXRpb25Qcm94IHVuc2V0IGJlY2F1c2Ugb2YgaGFuZC9hcm0gdGFyZ2V0CgBjb25zdGVsbGF0aW9uUHJveCBOT1QgdW5zZXQgYmVjYXVzZSBvZiBoYW5kL2FybSB0YXJnZXQKACAgJWQgcGFyYWxsZWwgY29tcG9uZW50cwoAICAlZCBzZXF1ZW50aWFsIGNvbXBvbmVudHMKAGhhbmRsZV9zaWduX25vbm1hbnVhbCBiZWdpbjogJWQgY29tcG9uZW50cwoAYXJnc0Zyb21GaWxlICVzLCAlZCBkaXJzCgBJbnRlcm5hbCBlcnJvciBpbiBIYW5kc2hhcGU6OkhhbmRzaGFwZSggJyVjJywgR2VzdHVyZSAleCApOiBubyBnZXN0dXJlLT5qb2ludFJvdGF0aW9ucwoASEE6OmNBUiBmcm9tIE9uZUFybUFuaW1hdG9yOjpjb21wdXRlSm9pbnRSb3RhdGlvbnMKAFRNOjpzZXRBRFY6IHJoIGhzLT5mcyAlZiwgc2V0dGluZyBwQy5mLnIuZnMKAFRNOjpzZXRBRFY6IGxoIGhzLT5mcyAlZiwgc2V0dGluZyBwQy5mLnIuZnMKAEhhbmltQXZhdGFyOjpjcmVhdGVTaUdNTFRvcnNvU2l0ZXMKAGhhbmRzICVzCgBIYW5pbUF2YXRhcjo6Y3JlYXRlQXJtU2VnbWVudCBmYWlsZWQgZm9yICVzCgBHZXN0dXJlOjp0cmFuc2ZlciAleCBmcm9tICVzIHRvICVzCgBUcnlpbmcgZmlsZSAlcwoAR2V0b3B0czo6YXJnc0Zyb21GaWxlICVzCgBIQTo6Y0FSICVjICVzCgAgIGNvbnN0ZWxsYXRpb25Qcm94OiAgJXMKAFBhcnNlIGVycm9yIGF0IGxpbmUgJWxkOgolcwoAUmVhZCBlcnJvcgoAQVRNOjpnTUEgdGltZSAlLjNmICVzIGFtb3VudCAlLjNmIGFmdGVyCgBDb3VsZG4ndCBhbGxvY2F0ZSBtZW1vcnkgZm9yIHBhcnNlcgoATm9Nb3ZlbWVudDo6c2V0QXZhdGFyRGVwZW5kZW50VmFsdWVzOiBjYWxsaW5nIFVzZUV4cGxpY2l0RHVyYXRpb24KAEFUTTo6Z01BIHRpbWUgJS4zZiAlcyBhbW91bnQgJS4zZiBzdXN0YWluCgBUb3Jzb0RlY29sbGlkZXI6OkZvcmNlT3V0c2lkZSBiZWxvdyBmb290ICUuNmYgPiAlLjZmCgBUb3Jzb0RlY29sbGlkZXI6OkZvcmNlT3V0c2lkZSBhYm92ZSB0b3AgJS42ZiA+ICUuNmYKACU2LjNmICU3LjRmCgAlNi4zZiAgJTcuNGYKAEFic3RyYWN0VGltZWRNb3JwaDo6YWZ0ZXIgc2NhbGluZyBieSAlLjNmCgBUcmFqZWN0b3J5OjpUcmFqZWN0b3J5IG9yICUuM2YsIGN0ICUuM2YsIHN0ZXBzVXNlZCAlZCwgdHQgJS4zZiwgZnYgJS4zZgoAU2hvdWxkZXIgJWMgY29uZSBjb25zdHJhaW50IHZpb2xhdGVkOiBFQiAlLjNmID4gYmEgJS4zZgogIGJlZm9yZSAlLjNmIGFmdGVyICUuM2YgYWRqdXN0ICUuM2YKAFJlcE06OnNldEFEViBsYXhSZXR1cm4gJWMgcmVwZHVyICUuM2YgdFJhdCAlLjNmCgBIYW5pbUF2YXRhcjo6Y3JlYXRlU2lHTUxUb3Jzb1NpdGVzOgogICAgYXJtX2wgJS4zZiBhcm1yICUuM2YgYXJtICUuM2YgdnMgJS4zZgoAT25lSENvbmNyZXRlUG9zdHVyZTo6c2V0SW50ZXJwOiBmcmFjcyAlLjNmICUuM2YgJS4zZiAlLjNmIGluaXQgJS4zZiBmaW5hbCAlLjNmIGN1ciAlLjNmCgAgICAgVEM6OkZPIGVycm9yIG5ld3ggJS4zZiBuZXd6ICUuM2YgZXJyICUuM2YKACAgICBUQzo6Rk8gT3V0c2lkZSByaWdodCBlbGxpcHNlIGVyciAlLjNmCgAgICAgVEM6OkZPIE91dHNpZGUgbGVmdCBlbGxpcHNlIGVyciAlLjNmCgAgICAgVEM6OkZPIGVycm9yICUuM2YKACAgICBUQzo6Rk8gT3V0c2lkZSByaWdodCBjaXJjbGU6IHhDICUuM2YgekMgJS4zZiByICUuM2YgckNyICUuM2YKACAgICBUQzo6Rk8gT3V0c2lkZSBsZWZ0IGNpcmNsZTogeEMgJS4zZiB6QyAlLjNmIHIgJS4zZiBsQ3IgJS4zZgoAY3VyTW92ICVzLCBwbGF5aXRmd2QgJWMgc0YgJWMgbFIgJWMgZiAlYyBkZiAlLjNmIGR1ciAlLjNmIHRJUyAlLjNmIHByb3AgJS4zZgoATm8gc29sdXRpb24gZm9yIGFmdGVyQW5nbGUgJS4zZiAoRUIgJS4zZiBiYSAlLjNmKSwgc2V0IHRvICUuM2YKACAgICBUQzo6Rk8gcmlnaHQgekUgJS4zZiB4RSAlLjNmIHpfaSAlLjNmIHJDZyAlLjNmCgAgICAgVEM6OkZPIGxlZnQgekUgJS4zZiB4RSAlLjNmIHpfaSAlLjNmIGxDZyAlLjNmCgAgICAgVEM6OkZPIEluc2lkZSByaWdodCBlbGxpcHNlIGVyciAlLjNmIHJDZyAlLjNmIHpfaSAlLjNmLCBnICUuM2YKACAgICBUQzo6Rk8gSW5zaWRlIGxlZnQgZWxsaXBzZSBlcnIgJS4zZiByQ2cgJS4zZiB6X2kgJS4zZiwgZyAlLjNmCgBSZXBNOjpzZXRBRFYgcmlnaHRJbml0QmFzZVNoaWZ0ICUuM2YgJS4zZiAlLjNmCgBSZXBNOjpzZXRBRFYgbGVmdEluaXRCYXNlU2hpZnQgICUuM2YgJS4zZiAlLjNmCgBDYWxjRWxib3dSb3RhdGlvbjogYW91dCAlLjNmIGFmd2QgJS4zZiBhc2l6ZSAlLjNmCgBIYW5pbUFuaW1hdGlvblJlY29yZDo6QXBwbHlQc2V1ZG9Nb3JwaCBNT1JQSF9sc2hfcmFpc2UgJS4zZgoAIGFuZ2xlICUuM2YgYXJtYW5nbGUgJS4zZgoAIGFuZ2xlICUuM2YKAENhbGNFbGJvd1JvdGF0aW9uOiAlcyBzaXplICUuM2YgZVIgJS4zZiBzY2FsaW5nICUuM2YgY291dCAlLjNmIGNmd2QgJS4zZgoASEE6OmNBUiBuZWFyIHJlYWNoIGV4YyAlLjNmIHNvZnQgJS4zZiBoYXJkICUuM2Ygc2NSL2hhcmQgJS4zZgoAaGFuZGxlX3NpZ25fbWFudWFsIG1lcmdlZCBtYWluLmVkICUuM2YKAGhhbmRsZV9zaWduX21hbnVhbCBtYWluLmVkICUuM2Ygc20uZWQgJS4zZgoAU2luZ2xlTW92ZW1lbnRGcm9tWE1MIHNlcV9tb3Rpb24gbWEuZWQgJS4zZiByZXN1bHQtPmVkICUuM2YgcmVzdWx0LT5kICUuM2YKAFNpbXBsaWZ5TW92ZW1lbnQgaW5pdCB0eXBlICVkIGVkICUuM2YgZCAlLjNmCgBTaW1wbGlmeU1vdmVtZW50IGVuZCB0eXBlICVkIGVkICUuM2YgZCAlLjNmCgBTaW5nbGVNb3ZlbWVudEZyb21YTUwgdHlwZSAlZCBlZCAlLjNmIGQgJS4zZgoASEE6OmNBUiBlbGJvd091dEFuZ2xlICVjICUuM2YKAHppZ3NpemUoICVkLCAlLjNmICkgPSAlYyAlYyAlLjNmCgAgICAgeCAlLjNmIHJFeHNhICUuM2YgeiAlLjNmIHJFY3ogJS4zZiByRXpzYSAlLjNmCgAgICAgeCAlLjNmIGxFeHNhICUuM2YgeiAlLjNmIGxFY3ogJS4zZiBsRXpzYSAlLjNmCgBBVE06OmdNQSB0aW1lICUuM2YgJXMgYW1vdW50ICUuM2YgcmVsZWFzZSBlYSAlLjNmCgBIQTo6Y0FSOiBhZGp1c3RTQUUgJS4zZiBhZGp1c3RTQSAlLjNmIGFkanVzdFNBVCAlLjNmIGFkanVzdFcgJS4zZgoAQWJzdHJhY3RUaW1lZE1vcnBoOjpyZXNjYWxlOiBiUyAlLjNmCgBIQTo6Y0FSIHNwaGVyZSBtZXRob2QsIGFTQUUgJS4zZgoAZWxib3dDb3JyZWN0aW9uIGNsaXBwZWQgZnJvbSAlLjNmIHRvICUuM2YsIGJBICUuM2YsIGFBICUuM2YKAGVsYm93Q29ycmVjdGlvbiAlLjNmIG5vdCBjbGlwcGVkLCBiQSAlLjNmLCBhQSAlLjNmCgBIQTo6Y0FSICVjIGFTQVQgJS4zZiBhU0FFICUuM2YgYVNBVzAgJS4zZiBhU0FXMSAlLjNmIGFXICUuM2YgYVNBICUuM2YKACBhbmdsZSAlLjNmIHNob3VsZCBiZSA8PSAlLjNmCgB0b3Jzb0Rpc3RhbmNlID0gJS4zZgoASGFuaW1BdmF0YXI6OmNyZWF0ZVNpR01MVG9yc29TaXRlczogU0lHTklOR19TUEFDRV9TSVpFID0gJS4zZgoAQWJzdHJhY3RUaW1lZE1vcnBoOjpyZXNjYWxlKCAlLjNmICUuM2YgJS4zZiApICUuM2YKACVzICV4IFRIVU1CQkFTRSAoICUuKmYgJS4qZiAlLipmICkgJS4qZiAlLipmCgAgICggJS4qZiAlLipmICUuKmYgKSAlLipmICUuKmYKACAgc3BsYXkgICggJS4qZiAlLipmICUuKmYgKSAlLipmCgAlcyBGSU5HRVJCQVNFIGJlbmQgICAoICUuKmYgJS4qZiAlLipmICkgJS4qZgoAICBlbGxpcHRpY2l0eTogICUuKmYKACAgZmluYWxSZXN0OiAgJS4qZgoAICBudW1jeWNsZXM6ICAlLipmCgAgIHppZ3phZ0N5Y2xlczogICUuKmYKACAgcmF0aW86ICAlLipmCgAgIGR1cmF0aW9uOiAgJS4qZgoAICBleHBsaWNpdER1cmF0aW9uOiAgJS4qZgoAICBmaW5nZXJzdWNjZXNzaW9uOiAgJS4qZgoAICBzaXplOiAgJS4qZgoAICBmaW5nZXJQaGFzZTogICUuKmYKACAgbmV4dFRpbWU6ICAlLipmCgAgIGxhc3RUaW1lOiAgJS4qZgoAICBhbmdsZTogICUuKmYKACAgZWxib3dPdXRBbmdsZTogICUuKmYKACAgc3RhcnRBbmdsZTogICUuKmYKACAgdG90YWxBbmdsZTogICUuKmYKACAgZWxib3dGd2RBbmdsZTogICUuKmYKACAgc2NhbGU6ICAlLipmCgAgIHRpbWVTY2FsZTogICUuKmYKACAgaW5pdEFtcGxpdHVkZTogICUuKmYKACAgZmluYWxBbXBsaXR1ZGU6ICAlLipmCgAgIGNvbnN0ZWxsYXRpb25EaXN0YW5jZTogICUuKmYKACAgYW1wbGl0dWRlMjogICUuKmYKACAgZmluZ2VyQW1wbGl0dWRlMjogICUuKmYKACAgYW1wbGl0dWRlMTogICUuKmYKACAgZmluZ2VyQW1wbGl0dWRlMTogICUuKmYKAEJNOjpHQ1AgJWQgJXMgdCAlZgoAT0hHOjpTZXRGcm9tSEMgYXR0LnNoYXBlX2xlYWQgJXMgJWYKAFRNOjpzZXRBRFYgZHVyYXRpb24gc3RyZXRjaGVkIGZyb20gJWYgdG8gJWYKAEJhc2ljTW92ZW1lbnQ6OnNldEJhc2VNb3Rpb25BdHRyaWJ1dGVzOiBleHBsaWNpdER1cmF0aW9uICVmIGR1cmF0aW9uICVmCgBGRlJBQyBzcHJlYWQgJWYgaGpyICVmOiAlZiAlZiAlZiAlZiAlZgoARkZSQUMgICAgICAgICAgICAgb2xkIGhqciAlZjogJWYgJWYgJWYgJWYgJWYKAGxlZnRIaXBUaWx0QW5nbGUgJWYKAEJhc2ljTW92ZW1lbnQ6OlVzZUV4cGxpY2l0RHVyYXRpb24gcmVzdWx0IGVkICVmIGQgJWYKAEJhc2ljTW92ZW1lbnQ6OlVzZUV4cGxpY2l0RHVyYXRpb24gdHlwZSAlZCBlZCAlZiBkICVmCgBTZXFNb3ZlbWVudDo6c2V0QURWIGNhbGxpbmcgVXNlRXhwbGljaXREdXJhdGlvbiBlZCAlZiwgZCAlZgoASGFuZHNoYXBlOjpOZXdIYW5kc2hhcGVGcm9tSGFuZENvbmZpZzogc2YgPSAlZCwgZnMgPSAlZgoATW90aW9uQXR0cmlidXRlczo6c2V0RnJvbVhNTEF0dHJpYnMgZHVyYXRpb24gPSAiJXMiICVmCgBIQTo6Y0FSIGZyb20gR2VzdHVyZTo6aW5zdGFsbFBvc3R1cmUKAEFUTTo6Z01BIHRpbWUgJS4zZiAlcyBhbW91bnQgJS4zZiBiZWZvcmUKAFRvcnNvQ3VydmU6OkZvcmNlT3V0c2lkZTogSW5zaWRlIHJpZ2h0IGVsbGlwc2UgYnV0IG5vIGludGVyc2VjdGlvbiBmb3VuZAoAVG9yc29DdXJ2ZTo6Rm9yY2VPdXRzaWRlOiBJbnNpZGUgbGVmdCBlbGxpcHNlIGJ1dCBubyBpbnRlcnNlY3Rpb24gZm91bmQKAEFUTTo6Z01BIHRpbWUgJS4zZiAlcyBhbW91bnQgJS4zZiBob2xkIHRvIGVuZAoAV006OnNldEFEViBlbmQKAEZNOjpzZXRBRFYgZW5kCgBDTTo6c2V0QURWIHJpZ2h0IGhhbmQKAENNOjpzZXRBRFYgbGVmdCBoYW5kCgBTaW1wbGlmeU1vdmVtZW50IGJvdGggc2lkZXMgZGVsZXRlZAoAICB0aHVtYmVuY2xvc2VkCgBhbmltZ2VuX3ByZUZsaWdodENoZWNrIGZhaWxlZAoAIHJpZ2h0ICVjIGxlZnQgJWMgaGFuZHMgJWQKAEdlc3R1cmU6OnRyYW5zZmVyOiBzb3VyY2UgcGF0aCAlZCwgdGFyZ2V0IHBhdGggJWQKAEludGVybmFsIGVycm9yOiBpbiBnZXN0dXJlICIlcyIgdW5leHBlY3RlZCBpbml0aWFsIG1vdmVtZW50IHR5cGUgJWQKAEJNOjpwcm9wQ0YgdHlwZSAlZAoASGFuaW1BdmF0YXI6OmNvbXB1dGVBcm1Sb3RhdGlvbnMgJWMgJWQKAFBNc2V0QURWIDUgd19yQVQgJWQgd19yQVQgJWQKAEFIQzo6QUhDICV4IGNQICVkID0gc2MuY1AgJWQKAGhhbmRzID0gJWQsIEJPVEhfSEFORFMgPSAlZAoAc2VxRWxlbWVudHM6ICVkCgBTZXFNOjpzZXRBRFYgJS4zZiBzZWMKAFNwTTo6c2V0QURWICUuM2Ygc2VjCgBSTTo6c2V0QURWICUuM2Ygc2VjCgBETTo6c2V0QURWICUuM2Ygc2VjCgBDTTo6c2V0QURWICUuM2Ygc2VjCgBUTTo6c2V0QURWICV4IGVuZCBkdXJhdGlvbiA9ICUuM2Ygc2VjCgBNb3ZlbWVudC5jcHA6IENoYXJUb01vcnBoQW5jaG9yaW5nIGJhZCBjaGFyICVjCgBNb3ZlbWVudC5jcHA6IENoYXJUb01vcnBoVGltZVR5cGUgYmFkIGNoYXIgJWMKAHNldHNfYWJzRG9tICVjIHNldHNfYWJzTm9uZG9tICVjIHNldHNfaGFuZERpc3AgJWMKAHJpZ2h0UHJpbyAlYywgbGVmdFByaW8gJWMKACAgb2sgJWMKACAgZG9tRGVmYXVsdEhhbmRzaXRlICVjIG5vbmRvbURlZmF1bHRIYW5kc2l0ZSAlYwoAICAgIFBDICVjIFJDICVjIFNDICVjCgBzYW1lVGFyZ2V0ID0gJWMKAHJpZ2h0RGVmYXVsdEhhbmRzaXRlID0gJWMKAGxlZnREZWZhdWx0SGFuZHNpdGUgPSAlYwoAICBzZWNvbmRfY2xvY2twbHVzOiAgJWMKACAgY2xvY2twbHVzOiAgJWMKACAgaGF2ZUJlbmRDb2RlczogICVjCgAgIGFic19tb3Rpb246ICAlYwoAICBmaXRwaWN0dXJldG9tYW51YWw6ICAlYwoAICBzZWNvbmRfYWx0ZXJuYXRpbmc6ICAlYwoAICBhbHRlcm5hdGluZzogICVjCgAgIGJvdW5jaW5nOiAgJWMKACAgb3V0b2ZwaGFzZTogICVjCgAgIG93bkdlc3R1cmU6ICAlYwoAICBmdXNlZDogICVjCgBFeHRlbmRUcmFpbGluZ01vcnBoczogVHJhaWxpbmdNb3JwaHM9PU5VTEwKAEVycm9yOiBTZXFUaW1lZE1vcnBoOjpDYWxjVGltaW5nIGVsZW1lbnQgJWQgaXMgTlVMTAoAICBtb3JwaGluZyBOVUxMCgB0YXJnZXRzaXRlU2l0ZSBOVUxMCgBTaW1wbGlmeU1vdmVtZW50OiBzcGxpdC9ybSA9IE5VTEwKAFNpbXBsaWZ5TW92ZW1lbnQ6IHNwbGl0L2xtID0gTlVMTAoAICBub25kb20gaGFuZDogTlVMTAoAICBkb20gaGFuZDogTlVMTAoAICBzaWdtbENvbnN0OiAgTlVMTAoAICBhaENvbnN0OiAgTlVMTAoAICBtb3ZlbWVudDogIE5VTEwKACAgcmlnaHRNb3ZlbWVudDogIE5VTEwKACAgbGVmdE1vdmVtZW50OiAgTlVMTAoAVGh1bWJCYXNlSm9pbnRSb3RhdGlvbjo6c2V0Q29tcG9zZUludiBVTklNUExFTUVOVEVECgBUaHVtYkJhc2VKb2ludFJvdGF0aW9uOjpzZXRGcm9tUXVhdCBVTklNUExFTUVOVEVECgBUaHVtYkJhc2VKb2ludFJvdGF0aW9uOjpzZXRQcmVJbnZDb21wb3NlIFVOSU1QTEVNRU5URUQKAFRodW1iQmFzZUpvaW50Um90YXRpb246OnNldENvbXBvc2UgVU5JTVBMRU1FTlRFRAoAQXJtSGFuZENvbnN0ZWxsYXRpb24oICV4ICkgVU5JTVBMRU1FTlRFRAoAQ29weVNpR01MQ29uc3RlbGxhdGlvbiggJXggKSBVTklNUExFTUVOVEVECgBDb3B5SGFuZHNoYXBlKCAleCApIFVOSU1QTEVNRU5URUQKADwvRnJhbWVzPgoAPC9DQVM+CgA8P3htbCB2ZXJzaW9uPSIxLjAiIGVuY29kaW5nPSJVVEYtOCIgc3RhbmRhbG9uZT0ieWVzIj8+CgA8bm9tb3Rpb24vPgoAPENBUyBWZXJzaW9uPSJDQVMyLjAiIEF2YXRhcj0iJXMiPgoAPEZyYW1lcyBDb3VudD0iJWQiPgoARmluZ2VyUGxheU1vdmVtZW50ICV4OgoAV3Jpc3RNb3ZlbWVudCAleDoKAFJlcGVhdE1vdmVtZW50ICV4OgoAQ2lyY3VsYXJNb3ZlbWVudCAleDoKAFBhck1vdmVtZW50ICV4OgoAU2VxTW92ZW1lbnQgJXg6CgBOb01vdmVtZW50ICV4OgoARGlyZWN0ZWRNb3ZlbWVudCAleDoKAGFoQ29uc3QgZGVyaXZlZCBmcm9tIHNpZ21sQ29uc3Q6CgBTaUdNTEM6OkFIQzogcmVzdWx0OgoARXh0ZW5kVHJhaWxpbmdNb3JwaHM6IFRyYWlsaW5nTW9ycGhzIGhhcyAlZCBjb21wb25lbnRzOgoAQ29tcHV0aW5nIGhhbmQgZGlzcGxhY2VtZW50IGZyb20gc2l0ZSBub3JtYWxzOgoAaGFuZGxlX3NpZ25fbm9ubWFudWFsIHJlc3VsdCBpczoKAENvbGxlY3RUcmFpbGluZ01vcnBoczogcmVzdWx0IGlzOgoAQ29sbGVjdFRyYWlsaW5nTW9ycGhzOiBiZXR0ZXJSZXN1bHQgaXM6CgAuClNpdGUgaXM6CgBBdmF0YXJDb25zdHJhaW50czo6aW5pdGlhbGlzZSBuZXcgdmFsdWVzOgoAQXZhdGFyQ29uc3RyYWludHM6OmluaXRpYWxpc2Ugb2xkIHZhbHVlczoKAENhbm5vdCBmaW5kIGdlc3R1cmUgJyVzJyBpbiBhbnkgb2YgdGhlIGdlc3R1cmUgZGlyZWN0b3JpZXM6CgBHZXN0dXJlICV4ICVzOgoAdHJhbnNmZXIgdGFyZ2V0IGNoYWluOiBhZGRpbmcgcm90YXRpb24gZm9yICVzOgoAdHJhbnNmZXIgc291cmNlIGNoYWluOiBhZGRpbmcgcm90YXRpb24gZm9yICVzOgoAaGFuZGxlX2hhbWdlc3R1cmFsX3NpZ246CgBBcm1IYW5kQ29uc3RlbGxhdGlvbjo6dXBkYXRlRnJvbToKAE1ha2VUcmFpbGluZ01vcnBoczogZm91bmQgJWR0aCB0cmFpbGluZyBtb3JwaDoKAENvbGxlY3RUcmFpbGluZ01vcnBoczogZm91bmQgdHJhaWxpbmcgbW9ycGg6CgAgIG1vcnBoaW5nOgoAQW5jaG9yRmluYWxNb3JwaHM6IGFuY2hvcmVkIGF0b21pYyBtb3JwaCBieSAlLjNmOgoAUHJpbnRpbmcgYXJtaGFuZyBzaXRlLCB3cml0ZWpvaW50IHNpemUgJS4zZjoKACAgbm9uZG9tIGhhbmQ6CgAgIGRvbSBoYW5kOgoAV2FybmluZzogZmluYWwgcG9zdHVyZSBvZiBzcGxpdCBtb3ZlbWVudCBub3QgZnVsbHkKICBkZWZpbmVkOgoAV2FybmluZzogZmluYWwgcG9zdHVyZSBvZiBjaXJjdWxhciBtb3ZlbWVudCBub3QgZnVsbHkKICBkZWZpbmVkOgoAV2FybmluZzogZmluYWwgcG9zdHVyZSBvZiBzZXF1ZW50aWFsIG1vdmVtZW50IG5vdCBmdWxseQogIGRlZmluZWQ6CgBXYXJuaW5nOiBmaW5hbCBwb3N0dXJlIG9mIHRhcmdldHRlZCBtb3ZlbWVudCBub3QgZnVsbHkKICBkZWZpbmVkOgoAV2FybmluZzogZmluYWwgcG9zdHVyZSBvZiByZXBlYXRlZCBtb3ZlbWVudCBub3QgZnVsbHkKICBkZWZpbmVkOgoARXh0ZW5kVHJhaWxpbmdNb3JwaDogbWF0Y2hlZCBtb3JwaCAlZDoKAFRvcnNvIGN1cnZlICVkOgoAdGFyZ2V0R2VzdHVyZS0+YWhDb25zdC0+Y29uc3RlbGxhdGlvblByb3ggPSAlZCwKICAgIHRoZXJlZm9yZSBkaXNwbGFjZSB0aGUgdGFyZ2V0cyB0byB5aWVsZCByZXF1aXJlZCBwcm94aW1pdHkuCgBTaUdNTEM6OkFIQzogY29tbW9uIHRhcmdldCBvbmx5LgoAU2lHTUxDOjpBSEM6IGRvbSBhbmQgbm9uZG9tIHRhcmdldHMgb25seS4KACBpcyBvbiAlcyBzaWRlIG9mIGJvZHkuCgBTcGVjaWFsIGhhbmRzaGFwZSByZWNvZ25pc2VkOiBtaWRkbGUgZmluZ2VyIGNyb3NzZWQgb3ZlciBpbmRleC4KAEFIQzo6QUhDIGhjIGluIG5vbmRvbS1vbmx5IGNvbnRleHQuCgBBSEM6OkFIQyBoYyBpbiBkb20tb25seSBjb250ZXh0LgoARmlsZSAiJXMiIGRvZXMgbm90IGV4aXN0LgoAIGRvIG5vdCBleGlzdC4KAFBNc2V0QURWIHN0YXJ0LgoASW50ZXJuYWwgZXJyb3I6IGluIE9uZUhHZXN0dXJlOjpJbml0Q29uY3JldGVQb3N0dXJlICVzICVzOiBjYW5ub3QgZmluZCB3cmlzdCBqb2ludC4KAEhhbmltQXZhdGFyOjpub3JtYWxpc2VTa2VsZXRvbiAodGh1bWIgKGlpaSkpIFdBUk5JTkc6IHRodW1iIG9mICVzIGhhbmQgaGFzIHVuZGVmaW5lZCBoaW5nZSBheGlzIGF0IG1pZGRsZSBqb2ludC4KAEpvaW50ICVzICVkIGhhcyBubyBwYXJlbnQuCgBSb290IGhhcyBubyBjaGlsZCBzZWdtZW50LgoASGVhZCBoYXMgbm8gY2hpbGQgc2VnbWVudC4KAEVsaW1pbmF0aW5nIG51bGwgcmlnaHQgaGFuZCBtb3ZlbWVudCBpbiBzcGxpdCBtb3ZlbWVudC4KAEVsaW1pbmF0aW5nIG51bGwgbGVmdCBoYW5kIG1vdmVtZW50IGluIHNwbGl0IG1vdmVtZW50LgoAVW5leHBlY3RlZCB2YWx1ZSBvZiBOT05ET01fSEFORF9PTkxZIGZvciBtb3ZlbWVudC4KAFVuZXhwZWN0ZWQgdmFsdWUgb2YgRE9NX0hBTkRfT05MWSBmb3IgbW92ZW1lbnQuCgBQTXNldEFEViBwYXNzIDM6IGNhbGN1bGF0ZSB0b3RhbCByZWxhdGl2ZSBtb3ZlbWVudC4KACVkIG1vdmVtZW50cyBlbGltaW5hdGVkIGZyb20gYSBjb21wb3VuZCBtb3ZlbWVudC4KAFNpR01MIGVycm9yOiBnZXN0dXJlICIlcyIgaGFzIHRoZSAibm9uZG9taW5hbnQiIGF0dHJpYnV0ZSwgIGJ1dCBjb250YWlucyBhIHNwbGl0IGVsZW1lbnQuCgBTaUdNTCBlcnJvcjogZ2VzdHVyZSAiJXMiIGhhcyB0aGUgImhvbGRvdmVyIiBhdHRyaWJ1dGUsICBidXQgY29udGFpbnMgYSBzcGxpdCBlbGVtZW50LgoATm8gYW5pbWF0aW9uIGZvdW5kIGZvciA8JXM+IGVsZW1lbnQuCgBObyAicGljdHVyZSIgYXR0cmlidXRlIGluIDwlcz4gZWxlbWVudC4KAE5vIFNBTVBBIHBob25lbWVzIGZvdW5kIGluICJwaWN0dXJlIiBhdHRyaWJ1dGUgIiVzIiBpbiA8JXM+IGVsZW1lbnQuCgBObyBTQU1QQSBwaG9uZW1lcyBmb3VuZCBpbiA8c2FtcGE+IGVsZW1lbnQuCgBFeHRlbmRUcmFpbGluZ01vcnBoczogJWQgbW9ycGhzIGxlZnQuCgBQTXNldEFEViBwYXNzIDE6IGludm9rZSBzZXRBRFYgZm9yIGNvbXBvbmVudHMuCgBQTXNldEFEViBwYXNzIDY6IGFwcGx5IGFicy1yZWwgY29ycmVjdGlvbiB0byByZWxhdGl2ZSBtb3ZlbWVudHMuCgBTaUdNTEM6OkFIQzogbm8gdGFyZ2V0cy4KAFNpR01MQzo6QUhDOiBkb20sIG5vbmRvbSwgYW5kIGNvbW1vbiB0YXJnZXRzLgoAIGhhcyBubyBuZWlnaGJvdXJzLgoAV2FybmluZzogdGh1bWJwb3M9IiVzIiBhbmQgYmVuZDE9IiVzIiBib3RoIHNwZWNpZmllZC4gSWdub3JpbmcgdGh1bWJwb3MuCgBUaGUgZmVhdHVyZSBwb2ludHMgZm9yIGFib3ZlLCBiZWxvdywgYW5kIHRoZSBvdXRlciBjb3JuZXJzIG9mIHRoZSBleWVzIGFyZSBtaXNzaW5nLiBFc3RpbWF0aW5nIGxvY2F0aW9ucy4KAEdlbmVyYXRlZCBDQVMgZm9yICVkIHNpZ25zLgoASEE6OkhBOiBhZGRpbmcgYXJtaGFuZCB0byBhdmF0YXIgaW5kZXhlcy4KAGJvZHljb25zdHJhaW50cyBub3QgZm91bmQgaW4gY29uZmlnIGZpbGUsIHVzaW5nIGRlZmF1bHQgdmFsdWVzLgoAS2VlcGluZyByaWdodCB3cmlzdCBmaXhlZCB3aGlsZSBoYW5kIHNoYXBlIG9yIG9yaWVudGF0aW9uIGNoYW5nZXMuCgBLZWVwaW5nIGxlZnQgd3Jpc3QgZml4ZWQgd2hpbGUgaGFuZCBzaGFwZSBvciBvcmllbnRhdGlvbiBjaGFuZ2VzLgoAIGluIHR3by1oYW5kZWQgZ2VzdHVyZSBpbnRlcnByZXRlZCBhcyBzcGVjaWZ5aW5nIGhhbmRzaXRlcyBmb3IgYm90aCBoYW5kcy4KACBpbiB0d28taGFuZGVkIGdlc3R1cmUgaW50ZXJwcmV0ZWQgYXMgYXBwbHlpbmcgdG8gYm90aCBoYW5kcy4KAFdhcm5pbmc6IGNvbXBvbmVudHMgJWQgYW5kICVkIG9mIGEgcGFyYWxsZWwgbW92ZW1lbnQgYm90aCBhdHRlbXB0IHRvIHNldCB0aGUgcmVsYXRpdmUgZGlzcGxhY2VtZW50IG9mIHRoZSBoYW5kcy4KAENhbm5vdCBmaW5kIGpvaW50ICVzLgoAJXMgaW52b2tlZCBhdCAlcy4KAEluIHNwbGl0IG1vdmVtZW50LCBjaGFuZ2luZyBwYXRoIHNoYXBlIGZyb20gJXMgdG8gJXMuCgBJbiBwYXJhbGxlbCBjb21iaW5hdGlvbiwgY2hhbmdpbmcgcGF0aCBzaGFwZSBmcm9tICVzIHRvICVzLgoAUHJvY2Vzc2luZyBhcmd1bWVudCAiJXMiIGZvciBvcHRpb24gJXMuCgBQcm9jZXNzaW5nIG9wdGlvbiAlcy4KACAgICBObyBleHRlbmRlZCBmaW5nZXIgZGlyZWN0aW9uICVzLgoAICAgIE5vIHBhbG0gb3JpZW50YXRpb24gJXMuCgBQcm94aW1pdHkgIiVzIiBhc3N1bWVkIHRvIHJlZmVyIHRvIGxvY2F0aW9uICVzLgoAUmVhZGluZyBjb21tYW5kcyBmcm9tICVzLgoATm8gdGltaW5nIHN0cmluZyBmb3IgbW9ycGggJXMuCgAgICAgTm8gdGFyZ2V0IHNpdGUgJXMuCgBDYW5ub3QgZmluZCBzaXRlICVzLgoAICAgIE5vIGhhbmQgc2l0ZSAlcy4KACAgICBObyBoYW5kc2hhcGUgJXMuCgBFUlJPUjogQ2Fubm90IG9wZW4gb3V0cHV0IGZpbGUgJXMuCgBVbnJlY29nbmlzZWQgbm9ubWFudWFsIHR5cGUgPCVzPiBmb3VuZCBpbiBub25tYW51YWxzIGZpbGUgJXMuCgBDYW5ub3QgcmVhZCBub25tYW51YWwgZGVzY3JpcHRpb24gZmlsZSAlcy4KAFhNTFdyYXBwZXI6OlBhcnNlRmlsZSBjYW5ub3Qgb3BlbiBmaWxlICVzLgoAV0FSTklORzogQ2Fubm90IG9wZW4gY29tbWFuZCBmaWxlICVzLgoAT3BlbmVkIGNvbW1hbmQgZmlsZSAlcy4KAFhNTFdyYXBwZXI6OlBhcnNlRmlsZSBvcGVuZWQgZmlsZSAlcy4KAFRva2VuU3RyZWFtOjpvcGVuOiBvcGVuZWQgZmlsZSAlcy4KAFNpbmdsZU1vdmVtZW50RnJvbVhNTDogZm91bmQgbW92ZW1lbnQgZm9yIGJvZHkgcGFydCAlZCAlcy4KAE1pc3Npbmcgcm90YXRpb24gaW4gPGpvaW50PiAlcy4KAE1pc3NpbmcgbG9jYXRpb24gaW4gPGpvaW50PiAlcy4KAFVuZXhwZWN0ZWQgY29tcG9uZW50IDwlcz4gaW4gPGpvaW50PiAlcy4KAE1pc3NpbmcgbG9jYXRpb24gaW4gPGZlYXR1cmU+ICVzLgoAWmlnemFnIG1vdGlvbiBjYXVzZXMgbGluZWFyIG1hbm5lci4KAFNpR01MIGVycm9yOiBnZXN0dXJlICIlcyIgaGFzIGJvdGggdGhlICJub25kb21pbmFudCIgYXR0cmlidXRlIGFuZCBhIHN5bW1ldHJ5IG1hcmtlci4KAFNwZWNpYWwgaGFuZHNoYXBlIHJlY29nbmlzZWQ6IHBpbmNoIHdpdGhvdXQgaW5kZXggZmluZ2VyLgoAQWRqdXN0aW5nIGJlbmRpbmcgb2YgJXMgZmluZ2VyLgoAU3BlY2lhbCBoYW5kc2hhcGUgcmVjb2duaXNlZDogdGh1bWIgdG8gYmVudCBtaWRkbGUgZmluZ2VyLgoAU3BlY2lhbCBoYW5kc2hhcGUgcmVjb2duaXNlZDogcGluY2ggd2l0aCB0aHVtYiB0byBzdHJhaWdodCBtaWRkbGUgZmluZ2VyLgoARm9yIG5vbmRvbSBoYW5kLCBwYWxtIG9mIGZpc3QgcmVwbGFjZWQgYnkgYmFjayBvZiBtaWRqb2ludCBvZiBtaWRkbGUgZmluZ2VyLgoARm9yIGRvbSBoYW5kLCBwYWxtIG9mIGZpc3QgcmVwbGFjZWQgYnkgYmFjayBvZiBtaWRqb2ludCBvZiBtaWRkbGUgZmluZ2VyLgoASW50ZXJuYWwgZXJyb3IgaW4gR2VzdHVyZTo6R2VzdHVyZTogbm8gYXZhdGFyLgoAUmVxdWlyZWQgZmFjZSBwb2ludCAlcyBkb2VzIG5vdCBleGlzdDogY2Fubm90IG1ha2UgYXZhdGFyLgoAIyMgTm8gPGpvaW50PiBmb3VuZCBpbiBBdmF0YXIgU3RhdGljIERhdGEgZmlsZSAlcy4KIyMgQ2Fubm90IGdlbmVyYXRlIEFSUCBhdmF0YXIuCgAjIyBObyA8YXZhdGFyPiBmb3VuZCBpbiBBdmF0YXIgU3RhdGljIERhdGEgZmlsZSAlcy4KIyMgQ2Fubm90IGdlbmVyYXRlIEFSUCBhdmF0YXIuCgAjIyBObyA8c2tlbGV0b24+IGZvdW5kIGluIEF2YXRhciBTdGF0aWMgRGF0YSBmaWxlICVzLgojIyBDYW5ub3QgZ2VuZXJhdGUgQVJQIGF2YXRhci4KACMjIE5vIDxhdmF0YXJTdGF0aWNEYXRhPiBmb3VuZCBpbiBBdmF0YXIgU3RhdGljIERhdGEgZmlsZSAlcy4KIyMgQ2Fubm90IGdlbmVyYXRlIEFSUCBhdmF0YXIuCgAjIyBJbnZhbGlkIEF2YXRhciBTdGF0aWMgRGF0YSBmaWxlICVzLgojIyBDYW5ub3QgZ2VuZXJhdGUgQVJQIGF2YXRhci4KACMjIEludmFsaWQgQXZhdGFyIFN0YXRpYyBEYXRhIHN0cmluZy4KIyMgQ2Fubm90IGdlbmVyYXRlIEFSUCBhdmF0YXIuCgBEdXBsaWNhdGUgam9pbnQgbmFtZSAlcyBmb3Igam9pbnRzICVkIGFuZCAlZC4gICAgICBDYW5ub3QgYnVpbGQgQVJQIGF2YXRhci4KAFBNc2V0QURWIDU6IHJlY29uY2lsZSBhYnMgd2l0aCBkaXNwLgoAUE1zZXRBRFYgcGFzcyA0OiBkZXRlcm1pbmUgaW5jb25zaXN0ZW5jeSBiZXR3ZWVuIGFicywgcmVsLCBhbmQgZGlzcC4KAEZpbGUgbmFtZSBleHBlY3RlZCBhZnRlciAtJXMgb3B0aW9uLgoAVW5leHBlY3RlZCBlbGVtZW50IDwlcz4gaW4gbW9ycGggZGVmaW5pdGlvbi4KAE5vcm1hbCB2ZWN0b3JzIG9mIGhhbmRzaXRlcyB0b28gY2xvc2UgdG8gcGFyYWxsZWwgKCUuMWYgZGVncmVlcyksIHVzaW5nIGxlZnQtcmlnaHQgZGlyZWN0aW9uLgoASGFuZGNvbnN0ZWxsYXRpb24gd2l0aCBkZWZpbmVkIHByb3hpbWl0eSAlZC4gIENvbXB1dGluZyBkaXJlY3Rpb24gb2Ygc2VwYXJhdGlvbi4KAE9ubHkgJWQgdmVydGV4ZXMgaW4gcG9seWdvbi4KAFVuZGVmaW5lZCBwcm94aW1pdHkgb2YgdGhlIGhhbmRzIHRvIGVhY2ggb3RoZXIgYXNzdW1lZCB0byBiZSBtZWRpdW0uCgBUTTo6c2V0QURWICV4IGhhbmRQcm94ICVkLCBjZGlzdCAlLjNmLCBwaHlzaWNhbCBwcm94aW1pdHkgPSAlLjNmIG0uCgBJbnRlcm5hbCBlcnJvciBpbiBIYW5kc2hhcGU6Ok5ld0hhbmRzaGFwZUZyb21IYW5kQ29uZmlnOiByZXN1bHQgaXMgbnVsbC4KAFNpR01MIGVycm9yOiBFbGVtZW50IDwlcz4gaXMgdW5yZWNvZ25pc2VkIG9yIHVuZXhwZWN0ZWQgYXQgdG9wIGxldmVsLgoAUmVjb25jaWxlIGRpc3Agd2l0aCBhYnMgb3IgcmVsLgoATm8gZGlycyB0byBzZWFyY2guCgBkdCwgbmR0LCBjdCBhbGwgdW5kZWZpbmVkOiBmaWxsaW5nIGluIGZyb20gb2xkIGFoLgoARHluYW1pY0FycmF5OiBjYW5ub3QgY3JlYXRlICVkIGVsZW1lbnRzLiAgRXhpdGluZy4KAER5bmFtaWNBcnJheVA6IGNhbm5vdCBjcmVhdGUgJWQgZWxlbWVudHMuICBFeGl0aW5nLgoARHluYW1pY0FycmF5MTogY2Fubm90IGNyZWF0ZSAlZCBlbGVtZW50cy4gIEV4aXRpbmcuCgBEeW5hbWljQXJyYXkwOiBjYW5ub3QgY3JlYXRlICVkIGVsZW1lbnRzLiAgRXhpdGluZy4KAER5bmFtaWNBcnJheTogY2Fubm90IGV4dGVuZCBmcm9tICVkIHRvICVkIGl0ZW1zLiAgRXhpdGluZy4KAER5bmFtaWNBcnJheVA6IGNhbm5vdCBleHRlbmQgZnJvbSAlZCB0byAlZCBpdGVtcy4gIEV4aXRpbmcuCgBEeW5hbWljQXJyYXkxOiBjYW5ub3QgZXh0ZW5kIGZyb20gJWQgdG8gJWQgaXRlbXMuICBFeGl0aW5nLgoARHluYW1pY0FycmF5MDogY2Fubm90IGV4dGVuZCBmcm9tICVkIHRvICVkIGl0ZW1zLiAgRXhpdGluZy4KAE9VVCBPRiBNRU1PUlk6IGNvcHlTdHJpbmcgY2Fubm90IGdldCAlbGQgYnl0ZXMuICBFeGl0aW5nLgoASU5URVJOQUwgRVJST1I6IGNhbm5vdCBtYWtlIHdhaXQgZ2VzdHVyZS4gIEV4aXRpbmcuCgBIYXNoQW55OiBjYW5ub3QgYWxsb2NhdGUgJWQgY2VsbHMgb2Ygc2l6ZSAlZC4gIEV4aXRpbmcuCgBGYXRhbCBlcnJvcjogdW5hYmxlIHRvIHJlYWQgY29uZmlnIFhNTCBzdHJpbmcuCgBVbmtub3duIG9wdGlvbiAtJXM6IGlnbm9yaW5nLgoASGFuZGNvbnN0ZWxsYXRpb24gaW4gb25lLWhhbmRlZCBnZXN0dXJlIGludGVycHJldGVkIGFzIHNwZWNpZnlpbmcgbm9uZG9tIGhhbmQgcG9zaXRpb25pbmcuCgBIYW5kY29uc3RlbGxhdGlvbiBpbiBvbmUtaGFuZGVkIGdlc3R1cmUgaW50ZXJwcmV0ZWQgYXMgc3BlY2lmeWluZyBkb20gaGFuZCBwb3NpdGlvbmluZy4KAEFkanVzdGluZyBpbmRleCBmaW5nZXIgYmVuZGluZy4KAEFkanVzdGluZyBtaWRkbGUgZmluZ2VyIGJlbmRpbmcuCgBBZGp1c3RpbmcgdGh1bWIgYmVuZGluZy4KAEdlc3R1cmUgIiVzIiBkdXJhdGlvbiAlLjZmLgoASGFuZCBzZXBhcmF0aW9uIGRpdmlkZWQgcmlnaHQgJS4zZiwgbGVmdCAlLjNmLgoASW52YWxpZCBkdXJhdGlvbiB2YWx1ZSAlLjNmLgoASW52YWxpZCB0aW1lc2NhbGUgdmFsdWUgJS4zZi4KAEludmFsaWQgc3BlZWQgdmFsdWUgJS4zZi4KACBhdCBkaXN0YW5jZSAlLjNmLgoAYmFzZSBuYW1lIHJldHVybmVkIHRydWUuCgBTaUdNTCBlcnJvcjogdGhlIDwlcz4gY29tcG9uZW50IG9mIGEgPCVzPiBtdXN0IGhhdmUgYSBib2R5cGFydCBhdHRyaWJ1dGUuCgBTaUdNTCBlcnJvcjogPCVzPiBkb2VzIG5vdCBjb250YWluIGEgIm1vdmVtZW50IiBvciAiZGlyZWN0aW9uIiBhdHRyaWJ1dGUuCgAgZm9yICVzIGhhbmQgaXMgaW4gc2lnbmluZyBzcGFjZSwgdXNpbmcgcGFsbSBhcyBkZWZhdWx0IGhhbmRzaXRlLgoAUE1zZXRBRFYgcGFzcyAyOiBkZWFsIHdpdGggY2hhbmdlcyBvZiBoYW5kc2l0ZS4KAEZpbGUgIiVzIiBkaWQgbm90IGNvbnRhaW4gYW55IGdlc3R1cmUuCgBFUlJPUjogY2Fubm90IGlkZW50aWZ5IGF2YXRhciB0eXBlLgoAU3BlY2lhbCBoYW5kc2hhcGUgcmVjb2duaXNlZDogdGh1bWIgYmV0d2VlbiBmaW5nZXJzIDIgYW5kIDMgd2l0aCBmaXN0IGhhbmRzaGFwZS4KAENhbm5vdCBvcGVuIGVycm9yIGZpbGUgJXMsIG1lc3NhZ2VzIHdpbGwgZ28gdG8gY29uc29sZS4KAENhbm5vdCBmaW5kIGhhbmRzaGFwZSBkZXNjcmlwdGlvbnMgaW4gY29uZmlnIGZpbGUuCgBEaXJlY3RvcnkgJXMgJXNmb3VuZC4KAFdhcm5pbmc6IGVsZW1lbnQgIiVzIiAlZCBub3QgZm91bmQuCgA8JXM+IGluIDwlcz4gc2hvdWxkIGhhdmUgJXMgYXR0cmlidXRlLCBub3QgZm91bmQuCgBXYXJuaW5nOiBlbGVtZW50ICIlcyIgbm90IGZvdW5kLgoAT3B0aW9uIC0lcyByZXF1aXJlcyBhbiBhcmd1bWVudCwgYnV0IG5vIGFyZ3VtZW50IGZvdW5kLgoAU2lHTUwgZXJyb3I6IGEgPCVzPiBtdXN0IGhhdmUgYSBzaW5nbGUgY29tcG9uZW50LCAlZCBjb21wb25lbnRzIGZvdW5kLgoAU2lHTUwgZXJyb3I6IGEgPCVzPiBtdXN0IGhhdmUgdHdvIGNvbXBvbmVudHMsICVkIGNvbXBvbmVudHMgZm91bmQuCgAjIENhbm5vdCBidWlsZCBhdmF0YXI6IG5vIGV5ZSBzaXRlcyBmb3VuZC4KAFNpR01MIGVycm9yOiBhbiBlbXB0eSA8JXM+IHdhcyBmb3VuZC4KAFNpR01MIGVycm9yOiB0aGUgZmlyc3QgY29tcG9uZW50IG9mIGEgPCVzPiBtdXN0IGJlIGEgJXMsICVzIGZvdW5kLgoAUG9zaXRpdmUgcmVhbCBudW1iZXIgZXhwZWN0ZWQgZm9yICVzLCBubyB0b2tlbiBmb3VuZC4KAEVsZW1lbnQgPCVzPiBzaG91bGQgaGF2ZSBhdCBsZWFzdCAlZCBjb21wb25lbnRzLCBub25lIGZvdW5kLgoARWxlbWVudCA8JXM+IG9mIGEgPG5vbm1hbnVhbGNvbmZpZz4gbmVlZHMgYSAiJXMiIGF0dHJpYnV0ZSwgbm9uZSBmb3VuZC4KAFNpR01MIGVycm9yOiBhIDwlcz4gbXVzdCBoYXZlIGV4YWN0bHkgMiBjb21wb25lbnRzLCBidXQgJWQgZm91bmQuCgBFbGVtZW50IDwlcz4gc2hvdWxkIGhhdmUgYXQgbGVhc3QgJWQgY29tcG9uZW50cywgJWQgZm91bmQuCgBJbnZhbGlkIG1vcnBoICIlcyIgZm91bmQuCgBTaUdNTCB3YXJuaW5nOiBhIGhhbmQgbG9jYXRpb24gd2l0aGluIGEgYm9keWFybSBsb2NhdGlvbiBtdXN0IG5vdCBoYXZlIGEgImNvbnRhY3QiIGF0dHJpYnV0ZSwgIiVzIiBmb3VuZC4KAFNpR01MIGVycm9yOiB0aGUgPCVzPiBjb21wb25lbnQgb2YgYSA8JXM+IG11c3QgaGF2ZSBhIGJvZHlwYXJ0IGF0dHJpYnV0ZQp3aXRoIHZhbHVlICIlcyIsICIlcyIgZm91bmQuCgBXYXJuaW5nOiBjb21wb25lbnRzICVkIGFuZCAlZCBvZiBhIHBhcmFsbGVsIG1vdmVtZW50IGJvdGggYXR0ZW1wdCB0byBzZXQgdGhlIGFic29sdXRlIGxvY2F0aW9uIG9mIHRoZSByaWdodCBoYW5kLgoAV2FybmluZzogY29tcG9uZW50cyAlZCBhbmQgJWQgb2YgYSBwYXJhbGxlbCBtb3ZlbWVudCBib3RoIGF0dGVtcHQgdG8gc2V0IHRoZSBhYnNvbHV0ZSBsb2NhdGlvbiBvZiB0aGUgbGVmdCBoYW5kLgoAIGluIHR3by1oYW5kZWQgZ2VzdHVyZQogICAgaW50ZXJwcmV0ZWQgYXMgc3BlY2lmeWluZyB0YXJnZXQgb2YgZG9tIGhhbmQuCgBIYW5pbUF2YXRhcjo6bm9ybWFsaXNlU2tlbGV0b24gV0FSTklORzogdGh1bWIgb2YgJXMgaGFuZCBhbHJlYWR5IHBhcmFsbGVsIHRvIGF4aXMgb2YgaGFuZC4KAEhhbmltQXZhdGFyOjpub3JtYWxpc2VTa2VsZXRvbiAodGh1bWIgKGlpKSkgV0FSTklORzogdGh1bWIgb2YgJXMgaGFuZCBhcHBhcmVudGx5IHBlcnBlbmRpY3VsYXIgdG8gcGxhbmUgb2YgaGFuZC4KACMgV0FSTklORzogZmFjZSBwb2ludCAlZCBpcyBpbnZhbGlkLgoAIGlzIHVuaW1wbGVtZW50ZWQuCgBXYXJuaW5nOiAlZCB2YWx1ZXMgZm91bmQgZm9yIHZlY3RvciAiJXMiLCAzIGV4cGVjdGVkLgoARmF0YWwgZXJyb3I6IGNvbmZpZyBYTUwgc3RyaW5nIGlzIHdyb25nIHZlcnNpb24sIHZlcnNpb24gIiVzIiBleHBlY3RlZC4KAEZhdGFsIGVycm9yOiBjb25maWcgWE1MIHN0cmluZyBpcyB2ZXJzaW9uICIlcyIsIHZlcnNpb24gIiVzIiBleHBlY3RlZC4KACAgICBOb25tYW51YWxzIHdpbGwgbm90IGJlIGdlbmVyYXRlZC4KAENvbXBvdW5kTW92ZW1lbnQgJWQgd2l0aCBvbmUgY29tcG9uZW50IGVsaW1pbmF0ZWQuCgBOdWxsIG1vdmVtZW50IGVsaW1pbmF0ZWQuCgBDb21wb3VuZE1vdmVtZW50ICVkIHdpdGggbm8gY29tcG9uZW50cyBlbGltaW5hdGVkLgoAIGZvciAlcyBoYW5kc2hhcGUgJXMgdXNlZC4KAEhhbmRzaXRlIG5vdCBzcGVjaWZpZWQgYW5kIG11c3QgYmUgZ3Vlc3NlZC4KAEludGVybmFsIGVycm9yOiBpbiBjb25maWcgZmlsZSwgY29udHJvbGxlciB0eXBlICVzIHdhcyBub3QgcmVjb2duaXNlZC4KAER1cGxpY2F0ZSBkZWZpbml0aW9uIGZvdW5kIGZvciBub25tYW51YWwgZWxlbWVudAogICAgPCVzICVzPSIlcyI+LiAgTGF0ZXIgZGVmaW5pdGlvbiBpZ25vcmVkLgoAV2FybmluZzogJWQgY29tcG9uZW50cyBvZiBhIHBhcmFsbGVsIGNvbXBvc2l0aW9uICVzIGF0dGVtcHQgdG8gc2V0IHRoZSByaWdodCBoYW5kIG9yaWVudGF0aW9uLiBBbGwgYnV0IHRoZSBsYXN0IGFyZSBpZ25vcmVkLgoAQSA8JXM+IGVsZW1lbnQgaW4gdGhlIG5vbm1hbnVhbCBkZWZpbml0aW9uIGZpbGUgJXMgaGFzIG5vICVzIGF0dHJpYnV0ZTogaWdub3JlZC4KAFNpR01MIGVycm9yOiB1bmV4cGVjdGVkIGNvbXBvbmVudCA8JXM+IGZvdW5kIHdoZW4gbW92ZW1lbnQgZXhwZWN0ZWQ6IGlnbm9yZWQuCgBTaUdNTCBlcnJvcjogdW5leHBlY3RlZCBjb21wb25lbnQgPCVzPiBmb3VuZCBpbiA8JXM+OiBpZ25vcmVkLgoASW52YWxpZCBsb2NhdGlvbiAlcz0iJXMiOiBpZ25vcmVkLgoASW52YWxpZCBhdHRyaWJ1dGUgdmFsdWUgJXM9IiVzIjogaWdub3JlZC4KAFNpdGUgJXMgaGFzIG5vIHBhcmVudCBqb2ludCAtLSBpZ25vcmVkLgoATm9ubWFudWFsICVzIG5vdCBkZWZpbmVkIGZvciB0aGlzIGF2YXRhciAtLSBpZ25vcmVkLgoAR2V0b3B0czo6YXJnc0Zyb21GaWxlOiBubyBmaWxlICVzLCBpZ25vcmVkLgoAU2lHTUwgZXJyb3I6IHBhbG1vciBub3QgZGVmaW5lZC4KAFNpR01MIGVycm9yOiBleHRmaWRpciBub3QgZGVmaW5lZC4KAC4gSGFuZCBjb25zdGVsbGF0aW9uIGFzc3VtZWQuCgBFcnJvciBpbiBub25tYW51YWxzLnhtbDogdGltaW5nIHN0cmluZyAiJXMiIHNwZWNpZmllcyBubyBhbmNob3IgYXQgYmVnaW5uaW5nIG9yIGVuZC4gIEFuY2hvciBhdCBiZWdpbm5pbmcgYXNzdW1lZC4KAGJhc2UgbmFtZSBmYWlsZWQuCgBJTlRFUk5BTCBFUlJPUjogSGFuaW1BdmF0YXI6OmNyZWF0ZUFybVNlZ21lbnQoICVzICkgZmFpbGVkLgoAUE1zZXRBRFYgZmluaXNoZWQuCgAlcyAobGl0ZSkgZmluaXNoZWQuCgBUaGUgcHJlc2VuY2Ugb2YgYSA8JXM+IGltcGxpZXMgdGhhdCB0aGUgZ2VzdHVyZSBpcyB0d28taGFuZGVkLgoAVGhlIHRhcmdldCBsb2NhdGlvbiAiJXMiIGltcGxpZXMgdGhhdCB0aGUgZ2VzdHVyZSBpcyB0d28taGFuZGVkLgoAIm1vdmVtZW50IiBpcyBkZXByZWNhdGVkIGFzIGFuIGF0dHJpYnV0ZSBpbiBlbGVsZW50IDwlcz4uIFVzZSAibmFtZSIgaW5zdGVhZC4KAEZpbGUgIiVzIiBleGlzdHMgYnV0IGNvdWxkIG5vdCBiZSByZWFkLgoAVGFyZ2V0IGxvY2F0aW9ucyBvbiBvcHBvc2l0ZSBoYW5kL2FybSByZWludGVycHJldGVkIGFzIGhhbmRjb25zdGVsbGF0aW9uIHdpdGggcHJveGltaXR5ICVkLgoAQSA8c3BsaXRfbG9jYXRpb24+IHdpdGggdHdvIGhhbmQvYXJtIGxvY2F0aW9ucyBpcyB0cmVhdGVkIGFzIGEgaGFuZGNvbnN0ZWxsYXRpb24gd2l0aCBwcm94aW1pdHkgJWQuCgBUcnlpbmcgZGlyZWN0b3J5ICVkLgoATWlzc2luZyBuYW1lIGluIDxqb2ludD4sIHBhcmVudCBpbmRleCAlZC4KAE1pc3NpbmcgbmFtZSBpbiA8ZmVhdHVyZT4sIHBhcmVudCBpbmRleCAlZC4KACBpbiBjb21wb25lbnQgJWQuCgBEZS1uZXN0aW5nIG1vdmVtZW50IHR5cGUgJXM6IGluc2VydGluZyAlZCBzdWItbW92ZW1lbnRzIG9mIGNvbXBvbmVudCAlZC4KAEVSUk9SOiB1bmtub3duIGpvaW50IHJvdGF0aW9uIHR5cGUgJWQuCgBDYW5ub3QgdXNlIG5vcm1hbCB2ZWN0b3IgZm9yIGxlZnQgaGFuZHNpdGU6IGxlZnREZWZhdWx0SGFuZHNpdGUgPSAlYywgcmlnaHRQcmlvcml0eSA9ICVjLgoAQ2Fubm90IHVzZSBub3JtYWwgdmVjdG9yIGZvciByaWdodCBoYW5kc2l0ZTogcmlnaHREZWZhdWx0SGFuZHNpdGUgPSAlYywgbGVmdFByaW9yaXR5ID0gJWMuCgBTcGVjaWFsIGhhbmRzaGFwZSByZWNvZ25pc2VkOiBpbmRleCBmaW5nZXIgY3Jvc3NlZCBvdmVyIHRodW1iLgoAU3BlY2lhbCBoYW5kc2hhcGUgcmVjb2duaXNlZDogZmlzdCBhcm91bmQgdGh1bWIuCgBGaWxlICIlcyIgY29udGFpbmVkIGJhZGx5LWZvcm1lZCBTaUdNTC4KAENvbGxlY3RUcmFpbGluZ01vcnBoczogcmVzdWx0IGlzIE5VTEwuCgBVbmltcGxlbWVudGVkIG5vbm1hbnVhbCBlbGVtZW50IDwlcz4uCgBObyAibmFtZSIgYXR0cmlidXRlIGZvdW5kIGluIDwlcz4uCgBTaUdNTCBlcnJvcjogSW4gZ2VzdHVyZSAiJXMiLCB1bnJlY29nbmlzZWQgb3IgdW5leHBlY3RlZCBlbGVtZW50IDwlcz4gaW4gPCVzPi4KAFNpR01MIGVycm9yOiBJbiBnZXN0dXJlICIlcyIsIG1vcmUgdGhhbiBvbmUgb2NjdXJyZW5jZSBvZiA8JXM+IGluIDwlcz4uCgBTaUdNTCBlcnJvcjogdW5leHBlY3RlZCBlbGVtZW50IDwlcz4gKCVkKSBpbiA8JXM+LgoAQ29tcG9uZW50ICVkIG9mIDwlcz4gc2hvdWxkIGJlIDwlcz4sIGZvdW5kIDwlcz4uCgBDb21wb25lbnQgJWQgb2YgPCVzPiBzaG91bGQgYmUgPCVzPiBvciAgPCVzPiwgZm91bmQgPCVzPi4KAFVuaW1wbGVtZW50ZWQgU2lHTUw6IDwlcz4uCgBTaUdNTCBlcnJvcjogaW4gZ2VzdHVyZSAlcywgPHNpZ25fbWFudWFsPiBleHBlY3RlZCBidXQgPCVzPiBmb3VuZCBpbiA8c2lnbl9tYW51YWw+LgoATm8gbW92ZW1lbnQgZm91bmQgaW4gPG5vbm1hbnVhbGNvbmZpZz4uCgBXcm9uZyBudW1iZXIgb2YgY29tcG9uZW50cyBpbiBsb2NhdGlvbiBvZiAlcyAlcyAoZXhwZWN0ZWQgNCwgZm91bmQgJWQpLgoAV3JvbmcgbnVtYmVyIG9mIGNvbXBvbmVudHMgaW4gbG9jYXRpb24gb2YgJXMgJXMgKGV4cGVjdGVkIDMsIGZvdW5kICVkKS4KACBoYXMgbm90IGVub3VnaCBuZWlnaGJvdXJzIChQICVjLEggJWMsUiAlYyxVICVjKS4KACApLgoAT3ZlcnJpZGluZyBub25kb20gaGFuZHNpdGUgcHJveGltaXR5ICIlcyIgYnkgIiVzIi4KAE92ZXJyaWRpbmcgZG9tIGhhbmRzaXRlIHByb3hpbWl0eSAiJXMiIGJ5ICIlcyIuCgBTZXR0aW5nIHVuc3BlY2lmaWVkIG5vbmRvbSBoYW5kc2l0ZSBwcm94aW1pdHkgdG8gIiVzIi4KAFNldHRpbmcgdW5zcGVjaWZpZWQgZG9tIGhhbmRzaXRlIHByb3hpbWl0eSB0byAiJXMiLgoAIyBFcnJvciBpbiBjb25maWcgZmlsZTogdW5yZWNvZ25pc2VkIHdyaXN0IG1vdGlvbiAiJXMiLgoAU2lHTUwgZXJyb3I6IHVuZXhwZWN0ZWQgZmluZ2VycyBzcGVjaWZpY2F0aW9uICIlcyIuCgBXQVJOSU5HOiBiYWQgYW5jaG9yIHNwZWNpZmljYXRpb24gaW4gbW9ycGggdGltaW5nIHN0cmluZyAiJXMiLgoAQXR0cmlidXRlICIlcyIgaGFzIGludmFsaWQgdmFsdWUgIiVzIi4KAFNpR01MIGVycm9yOiBhdHRyaWJ1dGUgaGFzIHVucmVjb2duaXNlZCB2YWx1ZSAiJXMiLgoAUHJvY2Vzc2luZyBnZXN0dXJlICIlcyIuCgBQb3NpdGl2ZSByZWFsIG51bWJlciBleHBlY3RlZCBmb3IgJXMsIGZvdW5kICIlcyIuCgBTaUdNTCBlcnJvcjogUmVhbCBudW1iZXIgZXhwZWN0ZWQsIGZvdW5kICIlcyIuCgBBdHRyaWJ1dGUgJXMgb2YgPCVzPiBpbiA8JXM+IHNob3VsZCBoYXZlIHZhbHVlICIlcyIsIGZvdW5kICIlcyIuCgBXYXJuaW5nOiBjb25maWcgWE1MIHN0cmluZyBoYXMgbm8gbWlub3IgdmVyc2lvbiBpZCwgZXhwZWN0ZWQgIiVzIi4KAFdhcm5pbmc6IGNvbmZpZyBYTUwgc3RyaW5nIGhhcyBtaW5vciB2ZXJzaW9uICIlcyIsIGV4cGVjdGVkICIlcyIuCgBTaUdNTCBlcnJvcjogTW9yZSB0aGFuIG9uZSA8c2lnbl9ub25tYW51YWw+IGZvdW5kIGluIDwlcz4gIiVzIi4KAFNpR01MIGVycm9yOiBNb3JlIHRoYW4gb25lIDxzaWduX21hbnVhbD4gZm91bmQgaW4gPCVzPiAiJXMiLgoAV2FybmluZzogY29uZmxpY3RpbmcgYXR0cmlidXRlcyBzaXplID0+ICIlcyIsIGV4dHJlbWl0eXNpZGUgPT4gIiVzIi4KAFdhcm5pbmc6IGNvbmZsaWN0aW5nIGF0dHJpYnV0ZXMgc2l6ZSA9PiAiJXMiLCBib2R5c2lkZSA9PiAiJXMiLgoAU2lHTUwgZXJyb3I6IHVuZXhwZWN0ZWQgdmFsdWUgZm9yIGZpbmdlciBiZW5kaW5nOiAiJXMiLgoAU2lHTUwgZXJyb3I6IHVuZXhwZWN0ZWQgdmFsdWUgZm9yIHRodW1iIGJlbmRpbmc6ICIlcyIuCgAgJXMgJWQgKFBBUkVOVCAlcykKAEdlc3R1cmVQYXJzZXIuY3BwIGhhbmRsZV9ub25tYW51YWxfaXRlbTogUHJvY2Vzc2VkIDwlcyBtb3YvZGlyPSIlcyI+ID0gKCVkLCVkKQoAaGFuZGxlX25vbm1hbnVhbF90aWVyOiBjb21wb25lbnQgJWQgaGFzIHR5cGUgJWQgKCIlcyIpCgBoYW5kbGVfc2lnbl9ub25tYW51YWw6IGNvbXBvbmVudCAlZCBoYXMgdHlwZSAlZCAoIiVzIikKAGhhbmRsZV9ub25tYW51YWxfaXRlbTogJXggJWQgJWQgKCIlcyIpCgBDb3B5T25lSEdlc3R1cmUoICV4LCAleCApCgBDb3B5Tm9ubWFudWFsTW92ZW1lbnRBcnJheSggJXggKQoAQ29weU5vbm1hbnVhbE1vdmVtZW50KCAleCApCgBDYWxjU3RhcnRFbmRSZXBEaXNwKCBjeWMgJWQsIGZ3ZCAlYywgYnNyICUuM2YsIHJlcHIgJS4zZiApCgAgICggJS4zZiAlLjNmICUuM2YgKQoASEFSOjpjYWxjSGlwTW92ZW1lbnQoIHRoZXRhICUuM2YgbGVmdCAlLjNmIGZ3ZCAlLjNmICkKAE5vIHNvbHV0aW9uIGZvciBhZnRlckFuZ2xlICUuM2YgPSBzcGhUcmlGYWNlQW5nbGUoICUuM2YsICUuM2YsICUuM2YgKQoASGFuaW1BbmltYXRpb25SZWNvcmQ6OnJlc2V0KCAlLjNmICkKACAgbG9uZ2l0ICggJS4qZiAlLipmICUuKmYgKQoAKCB4MCAlLipmLCBsWiAlLipmLCByWiAlLipmICkKACwKICAgICAgICAgdGggJWYsIGwgJWYsIGYgJWYgKQoAbEhSICVmLCBySFIgJWYsIGVycm9yICVmLCBwVCAlZiA9IGF0YW4yKCAlZiwgJWYgKQoASU5URVJOQUwgRVJST1I6IFF1YXRKb2ludFJvdGF0aW9uOjpzZXRTcGxheUFuZ2xlKCAlZiApCgBJTlRFUk5BTCBFUlJPUjogSGluZ2VKb2ludFJvdGF0aW9uOjpzZXRTcGxheUFuZ2xlKCAlZiApCgBJTlRFUk5BTCBFUlJPUjogUXVhdEpvaW50Um90YXRpb246OmFkZFNwbGF5QW5nbGUoICVmICkKAElOVEVSTkFMIEVSUk9SOiBIaW5nZUpvaW50Um90YXRpb246OmFkZFNwbGF5QW5nbGUoICVmICkKAElOVEVSTkFMIEVSUk9SOiBUdXJyZXRKb2ludFJvdGF0aW9uOjpzZXRMb25naXRBbmdsZSggJWYgKQoASU5URVJOQUwgRVJST1I6IFF1YXRKb2ludFJvdGF0aW9uOjpzZXRMb25naXRBbmdsZSggJWYgKQoASU5URVJOQUwgRVJST1I6IEZpbmdlckJhc2VKb2ludFJvdGF0aW9uOjpzZXRMb25naXRBbmdsZSggJWYgKQoASU5URVJOQUwgRVJST1I6IEhpbmdlSm9pbnRSb3RhdGlvbjo6c2V0TG9uZ2l0QW5nbGUoICVmICkKAElOVEVSTkFMIEVSUk9SOiBRdWF0Sm9pbnRSb3RhdGlvbjo6c2V0QmVuZEFuZ2xlKCAlZiApCgBJTlRFUk5BTCBFUlJPUjogUXVhdEpvaW50Um90YXRpb246OmFkZEJlbmRBbmdsZSggJWYgKQoASU5URVJOQUwgRVJST1I6IENvcHlKb2ludFJvdGF0aW9uKCB0YXJnZXQgdHlwZSAlZCwgc291cmNlIHR5cGUgJWQgKQoAQWRkVG9BUlBTaXRlSW5kZXgoICVzLCBhcm1oYW5nICVkLCAlZCwgJWQgKQoASGFzaCAlbHg6IGNlbGxzOiAlZCwgaW5zZXJ0czogJWQsIGNvbGxpc2lvbnM6ICVkICUuMmYlJQoAc2Ygc3RyaW5nIGlzICIlcyIKAHNmIGVudW0gdmFsdWUgaXMgIiVkIgoATm8gUk9PVCBqb2ludCAlZCEhCgBHZXN0dXJlOjpTQ0Qgc3RhcnQ6IGFoQ29uc3QgCgBBSEM6OkFIQyAleDogaGFuZHMgJWQgbWlycm9yaW5nIAoAIGZvciAlcyBoYW5kIGhhcyBubyBub3JtYWwgdmVjdG9yLCB0aGVyZWZvcmUgZGVmYXVsdCBzaXRlIGZvciBiYXNlIGhhbmRzaGFwZSBzZWxlY3RlZDogCgBmcmFtZWNvdW50ICVkCgoAN1NTTW9ycGgAN1NTUFJTZXQAMTJHZW5lcmFsRXJyb3IAMTVUb3Jzb0RlY29sbGlkZXIAMTBEZWNvbGxpZGVyAAAAAQACAAAACtcjOzE5U0hNU2NhbGFyQ29udHJvbGxlcgAxN0dlbmVyYWxDb250cm9sbGVySWZmRQAxN0dlbmVyYWxDb250cm9sbGVySTZWZWN0b3JTMF9FADE3VmVjdG9yQ29udHJvbGxlcjIAMjBRdWF0ZXJuaW9uQ29udHJvbGxlcgAxN0dlbmVyYWxDb250cm9sbGVySTEwUXVhdGVybmlvblMwX0UAMTNKb2ludFJvdGF0aW9uADE4SGluZ2VKb2ludFJvdGF0aW9uADE5VHVycmV0Sm9pbnRSb3RhdGlvbgAyM0ZpbmdlckJhc2VKb2ludFJvdGF0aW9uADIyVGh1bWJCYXNlSm9pbnRSb3RhdGlvbgAxN1F1YXRKb2ludFJvdGF0aW9uADEyQW5pbWdlbkVycm9yAGkAAAAAAgAAAAEAAABTQ0FCBAAAAAIAAAAAAAAAAQAAAAMAAABMUlVFTC1JT0ZCAAAPAAAADQAAAAwAAAAtUERSVQAAAAIAAAADAAAABA==");base64DecodeToExistingUint8Array(bufferView,48998,"gD8AAIC/");base64DecodeToExistingUint8Array(bufferView,49038,"gD8AAIC/CgAAAAkAAAAI");base64DecodeToExistingUint8Array(bufferView,49064,"CtcjPAAAAAAUAAAAFQAAABYAAAAXAAAAAwAAAAUAAAAFAAAABAAAAAUAAAAFAAAAdWZtcwIAAAABAAAABAAAAAMAAAAxNkNvbXBvdW5kTW92ZW1lbnQAAAAAAAABAAAAAgAAAAAAAAAJAAAACQAAAAcAAAAHAAAABwAAAAcAAAAHAAAABwAAAAcAAAAHAAAABwAAAAcAAAAxM0Jhc2ljTW92ZW1lbnQAMThBYnN0cmFjdFRpbWVkTW9ycGgAMTZBdG9taWNUaW1lZE1vcnBoADEzUGFyVGltZWRNb3JwaAAxM1NlcVRpbWVkTW9ycGgAMTdOb25tYW51YWxNb3ZlbWVudAAxNkRpcmVjdGVkTW92ZW1lbnQAMTZDaXJjdWxhck1vdmVtZW50ADEwTm9Nb3ZlbWVudAAxM1dyaXN0TW92ZW1lbnQAMThGaW5nZXJQbGF5TW92ZW1lbnQAMTRSZXBlYXRNb3ZlbWVudAAxMVBhck1vdmVtZW50ADExU2VxTW92ZW1lbnQAMTNTcGxpdE1vdmVtZW50ADE3VGFyZ2V0dGVkTW92ZW1lbnQ=");base64DecodeToExistingUint8Array(bufferView,49504,"AwACAAMAAgACAAIAAQABAAEAAQABAAAAAQAAAAEAAAACAAAAAwAAADEwWE1MV3JhcHBlcgAxMkV4cGF0V3JhcHBlcgBpaWkAaWlpaQBpaWlkZABpaWQAaWlkZGRkZGRkAGk=");base64DecodeToExistingUint8Array(bufferView,49616,"eG1sPWh0dHA6Ly93d3cudzMub3JnL1hNTC8xOTk4L25hbWVzcGFjZQBDREFUQQBJRABJRFJFRgBJRFJFRlMARU5USVRZAEVOVElUSUVTAE5NVE9LRU4ATk1UT0tFTlMATk9UQVRJT04oAHwAKAAAAGh0dHA6Ly93d3cudzMub3JnL1hNTC8xOTk4L25hbWVzcGFjZQ==");base64DecodeToExistingUint8Array(bufferView,49776,"aHR0cDovL3d3dy53My5vcmcvMjAwMC94bWxucy8ARE9DVFlQRQBTWVNURU0AUFVCTElDAEVOVElUWQBBVFRMSVNUAEVMRU1FTlQATk9UQVRJT04ATkRBVEEAQ0RBVEEASUQASURSRUYASURSRUZTAEVOVElUSUVTAE5NVE9LRU4ATk1UT0tFTlMASU1QTElFRABSRVFVSVJFRABGSVhFRABFTVBUWQBBTlkAUENEQVRB");base64DecodeToExistingUint8Array(bufferView,50000,"//////////////////////////////////////////8AAAAAAAAABP7//4f+//8HAAAAAAAAAAD//3////9///////////N//v3//////3///////////w/g/////zH8////AAAAAAAAAP//////////////AQD4Aw==");base64DecodeToExistingUint8Array(bufferView,50144,"QNf///v/////f39U/f8PAP7f///////////+3/////8DAP///////58Z////zz8DAAAAAAAA/v///38C/v///38=");base64DecodeToExistingUint8Array(bufferView,50218,"////BwcAAAAAAP7//wf+BwAAAAD+//////////98/38vAGAAAADg////////IwAAAP8DAAAA4J/5///9xQMAAACwAwADAOCH+f///W0DAAAAXgAAHADgr/v///3tIwAAAAABAAAA4J/5///9zSMAAACwAwAAAODHPdYYx78DAAAAAAAAAADg3/3///3vAwAAAAADAAAA4N/9///97wMAAABAAwAAAODf/f///f8DAAAAAAM=");base64DecodeToExistingUint8Array(bufferView,50416,"/v////9/DQA/AAAAAAAAAJYl8P6ubA0gHw==");base64DecodeToExistingUint8Array(bufferView,50456,"//7///8D");base64DecodeToExistingUint8Array(bufferView,50500,"/////z8A/////38A7doHAAAAAFABUDGCq2IsAAAAAEAAyYD1BwAAAAAIAQL/////////////////////////D///////////////A///Pz//////Pz//qv///z/////////fX9wfzw//H9wfAAAAAEBM");base64DecodeToExistingUint8Array(bufferView,50624,"Bw==");base64DecodeToExistingUint8Array(bufferView,50640,"gAAAAP4DAAD+////////////HwD+/////////////wfg/////x8=");base64DecodeToExistingUint8Array(bufferView,50704,"//////////////////////////8/");base64DecodeToExistingUint8Array(bufferView,50736,"//////////////////////////8P");base64DecodeToExistingUint8Array(bufferView,50773,"YP8H/v//h/7//wcAAAAAAACAAP//f////3//////AAAAAAAAAP//////////////AQD4AwADAAAAAAD//////////z8AAAADAAAAwNf///v/////f39U/f8PAP7f///////////+3/////97AP///////58Z////zz8DAAAAAAAA/v///38C/v///38A/v/7//+7FgD///8HBwAAAAAA/v//B///BwD/A////////////3z/f+///z3/A+7////////z/z8e/8//AADun/n///3F0585gLDP/wMA5If5///9bdOHOQBewP8fAO6v+////e3zvzsAAMH/AADun/n///3N8485wLDD/wAA7Mc91hjHv8PHPYAAgP8AAO7f/f///e/D3z1gAMP/AADs3/3///3vw989YEDD/wAA7N/9///9/8PPPYAAw/8=");base64DecodeToExistingUint8Array(bufferView,51120,"/v////9//wf/f/8DAAAAAJYl8P6ubP87Xz//AwAAAAAAAAAD/wOgwv/+////A/7/3w+//v8//gI=");base64DecodeToExistingUint8Array(bufferView,51210,"/x8CAAAAoAAAAP7/PgD+////////////H2b+/////////////3cCAwQFBgcIAAAJCgsMDQ4PEBE=");base64DecodeToExistingUint8Array(bufferView,51278,"EhMAFA==");base64DecodeToExistingUint8Array(bufferView,51296,"FRY=");base64DecodeToExistingUint8Array(bufferView,51326,"AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBFw==");base64DecodeToExistingUint8Array(bufferView,51420,"AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBARg=");base64DecodeToExistingUint8Array(bufferView,51504,"GQMaGxwdHgAAHyAhIiMkJRAR");base64DecodeToExistingUint8Array(bufferView,51534,"EhMmFA==");base64DecodeToExistingUint8Array(bufferView,51552,"JxY=");base64DecodeToExistingUint8Array(bufferView,51582,"AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBFw==");base64DecodeToExistingUint8Array(bufferView,51676,"AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBARg=");base64DecodeToExistingUint8Array(bufferView,51760,"Q0RBVEFbSVNPLTg4NTktMQBVUy1BU0NJSQBVVEYtOABVVEYtMTYAVVRGLTE2QkUAVVRGLTE2TEUAdmVyc2lvbgBlbmNvZGluZwBzdGFuZGFsb25lAHllcwBubwDbD0k/2w9Jv+TLFkDkyxbAAAAAAAAAAIDbD0lA2w9JwAAAAAA4Y+0+2g9JP16Yez/aD8k/aTesMWghIjO0DxQzaCGiMwMAAAAEAAAABAAAAAYAAACD+aIARE5uAPwpFQDRVycA3TT1AGLbwAA8mZUAQZBDAGNR/gC73qsAt2HFADpuJADSTUIASQbgAAnqLgAcktEA6x3+ACmxHADoPqcA9TWCAES7LgCc6YQAtCZwAEF+XwDWkTkAU4M5AJz0OQCLX4QAKPm9APgfOwDe/5cAD5gFABEv7wAKWosAbR9tAM9+NgAJyycARk+3AJ5mPwAt6l8Auid1AOXrxwA9e/EA9zkHAJJSigD7a+oAH7FfAAhdjQAwA1YAe/xGAPCrawAgvM8ANvSaAOOpHQBeYZEACBvmAIWZZQCgFF8AjUBoAIDY/wAnc00ABgYxAMpWFQDJqHMAe+JgAGuMwAAZxEcAzWfDAAno3ABZgyoAi3bEAKYclgBEr90AGVfRAKU+BQAFB/8AM34/AMIy6ACYT94Au30yACY9wwAea+8An/heADUfOgB/8soA8YcdAHyQIQBqJHwA1W76ADAtdwAVO0MAtRTGAMMZnQCtxMIALE1BAAwAXQCGfUYA43EtAJvGmgAzYgAAtNJ8ALSnlwA3VdUA1z72AKMQGABNdvwAZJ0qAHDXqwBjfPgAerBXABcV5wDASVYAO9bZAKeEOAAkI8sA1op3AFpUIwAAH7kA8QobABnO3wCfMf8AZh5qAJlXYQCs+0cAfn/YACJltwAy6IkA5r9gAO/EzQBsNgkAXT/UABbe1wBYO94A3puSANIiKAAohugA4lhNAMbKMgAI4xYA4H3LABfAUADzHacAGOBbAC4TNACDEmIAg0gBAPWOWwCtsH8AHunyAEhKQwAQZ9MAqt3YAK5fQgBqYc4ACiikANOZtAAGpvIAXHd/AKPCgwBhPIgAinN4AK+MWgBv170ALaZjAPS/ywCNge8AJsFnAFXKRQDK2TYAKKjSAMJhjQASyXcABCYUABJGmwDEWcQAyMVEAE2ykQAAF/MA1EOtAClJ5QD91RAAAL78AB6UzABwzu4AEz71AOzxgACz58MAx/goAJMFlADBcT4ALgmzAAtF8wCIEpwAqyB7AC61nwBHksIAezIvAAxVbQByp5AAa+cfADHLlgB5FkoAQXniAPTfiQDolJcA4uaEAJkxlwCI7WsAX182ALv9DgBImrQAZ6RsAHFyQgCNXTIAnxW4ALzlCQCNMSUA93Q5ADAFHAANDAEASwhoACzuWABHqpAAdOcCAL3WJAD3faYAbkhyAJ8W7wCOlKYAtJH2ANFTUQDPCvIAIJgzAPVLfgCyY2gA3T5fAEBdAwCFiX8AVVIpADdkwABt2BAAMkgyAFtMdQBOcdQARVRuAAsJwQAq9WkAFGbVACcHnQBdBFAAtDvbAOp2xQCH+RcASWt9AB0nugCWaSkAxsysAK0UVACQ4moAiNmJACxyUAAEpL4AdweUAPMwcAAA/CcA6nGoAGbCSQBk4D0Al92DAKM/lwBDlP0ADYaMADFB3gCSOZ0A3XCMABe35wAI3zsAFTcrAFyAoABagJMAEBGSAA/o2ABsgK8A2/9LADiQDwBZGHYAYqUVAGHLuwDHibkAEEC9ANLyBABJdScA67b2ANsiuwAKFKoAiSYvAGSDdgAJOzMADpQaAFE6qgAdo8IAr+2uAFwmEgBtwk0ALXqcAMBWlwADP4MACfD2ACtAjABtMZkAObQHAAwgFQDYw1sA9ZLEAMatSwBOyqUApzfNAOapNgCrkpQA3UJoABlj3gB2jO8AaItSAPzbNwCuoasA3xUxAACuoQAM+9oAZE1mAO0FtwApZTAAV1a/AEf/OgBq+bkAdb7zACiT3wCrgDAAZoz2AATLFQD6IgYA2eQdAD2zpABXG48ANs0JAE5C6QATvqQAMyO1APCqGgBPZagA0sGlAAs/DwBbeM0AI/l2AHuLBACJF3IAxqZTAG9u4gDv6wAAm0pYAMTatwCqZroAds/PANECHQCx8S0AjJnBAMOtdwCGSNoA912gAMaA9ACs8C8A3eyaAD9cvADQ3m0AkMcfACrbtgCjJToAAK+aAK1TkwC2VwQAKS20AEuAfgDaB6cAdqoOAHtZoQAWEioA3LctAPrl/QCJ2/4Aib79AOR2bAAGqfwAPoBwAIVuFQD9h/8AKD4HAGFnMwAqGIYATb3qALPnrwCPbW4AlWc5ADG/WwCE10gAMN8WAMctQwAlYTUAyXDOADDLuAC/bP0ApACiAAVs5ABa3aAAIW9HAGIS0gC5XIQAcGFJAGtW4ACZUgEAUFU3AB7VtwAz8cQAE25fAF0w5ACFLqkAHbLDAKEyNgAIt6QA6rHUABb3IQCPaeQAJ/93AAwDgACNQC0AT82gACClmQCzotMAL10KALT5QgAR2ssAfb7QAJvbwQCrF70AyqKBAAhqXAAuVRcAJwBVAH8U8ADhB4YAFAtkAJZBjQCHvt4A2v0qAGsltgB7iTQABfP+ALm/ngBoak8ASiqoAE/EWgAt+LwA11qYAPTHlQANTY0AIDqmAKRXXwAUP7EAgDiVAMwgAQBx3YYAyd62AL9g9QBNZREAAQdrAIywrACywNAAUVVIAB77DgCVcsMAowY7AMBANQAG3HsA4EXMAE4p+gDWysgA6PNBAHxk3gCbZNgA2b4xAKSXwwB3WNQAaePFAPDaEwC6OjwARhhGAFV1XwDSvfUAbpLGAKwuXQAORO0AHD5CAGHEhwAp/ekA59bzACJ8ygBvkTUACODFAP/XjQBuauIAsP3GAJMIwQB8XXQAa62yAM1unQA+cnsAxhFqAPfPqQApc98Atcm6ALcAUQDisg0AdLokAOV9YAB02IoADRUsAIEYDAB+ZpQAASkWAJ96dgD9/b4AVkXvANl+NgDs2RMAi7q5AMSX/AAxqCcA8W7DAJTFNgDYqFYAtKi1AM/MDgASiS0Ab1c0ACxWiQCZzuMA1iC5AGteqgA+KpwAEV/MAP0LSgDh9PsAjjttAOKGLADp1IQA/LSpAO/u0QAuNckALzlhADghRAAb2cgAgfwKAPtKagAvHNgAU7SEAE6ZjABUIswAKlXcAMDG1gALGZYAGnC4AGmVZAAmWmAAP1LuAH8RDwD0tREA/Mv1ADS8LQA0vO4A6F3MAN1eYABnjpsAkjPvAMkXuABhWJsA4Ve8AFGDxgDYPhAA3XFIAC0c3QCvGKEAISxGAFnz1wDZepgAnlTAAE+G+gBWBvwA5XmuAIkiNgA4rSIAZ5PcAFXoqgCCJjgAyuebAFENpACZM7EAqdcOAGkFSABlsvAAf4inAIhMlwD50TYAIZKzAHuCSgCYzyEAQJ/cANxHVQDhdDoAZ+tCAP6d3wBe1F8Ae2ekALqsegBV9qIAK4gjAEG6VQBZbggAISqGADlHgwCJ4+YA5Z7UAEn7QAD/VukAHA/KAMVZigCU+isA08HFAA/FzwDbWq4AR8WGAIVDYgAhhjsALHmUABBhhwAqTHsAgCwaAEO/EgCIJpAAeDyJAKjE5ADl23sAxDrCACb06gD3Z4oADZK/AGWjKwA9k7EAvXwLAKRR3AAn3WMAaeHdAJqUGQCoKZUAaM4oAAnttABEnyAATpjKAHCCYwB+fCMAD7kyAKf1jgAUVucAIfEIALWdKgBvfk0ApRlRALX5qwCC39YAlt1hABY2AgDEOp8Ag6KhAHLtbQA5jXoAgripAGsyXABGJ1sAADTtANIAdwD89FUAAVlNAOBxgA==");base64DecodeToExistingUint8Array(bufferView,54707,"QPsh+T8AAAAALUR0PgAAAICYRvg8AAAAYFHMeDsAAACAgxvwOQAAAEAgJXo4AAAAgCKC4zYAAAAAHfNpNfAAAQ==");base64DecodeToExistingUint8Array(bufferView,54784,"GQAKABkZGQAAAAAFAAAAAAAACQAAAAALAAAAAAAAAAAZABEKGRkZAwoHAAEACQsYAAAJBgsAAAsABhkAAAAZGRk=");base64DecodeToExistingUint8Array(bufferView,54865,"DgAAAAAAAAAAGQAKDRkZGQANAAACAAkOAAAACQAOAAAO");base64DecodeToExistingUint8Array(bufferView,54923,"DA==");base64DecodeToExistingUint8Array(bufferView,54935,"EwAAAAATAAAAAAkMAAAAAAAMAAAM");base64DecodeToExistingUint8Array(bufferView,54981,"EA==");base64DecodeToExistingUint8Array(bufferView,54993,"DwAAAAQPAAAAAAkQAAAAAAAQAAAQ");base64DecodeToExistingUint8Array(bufferView,55039,"Eg==");base64DecodeToExistingUint8Array(bufferView,55051,"EQAAAAARAAAAAAkSAAAAAAASAAASAAAaAAAAGhoa");base64DecodeToExistingUint8Array(bufferView,55106,"GgAAABoaGgAAAAAAAAk=");base64DecodeToExistingUint8Array(bufferView,55155,"FA==");base64DecodeToExistingUint8Array(bufferView,55167,"FwAAAAAXAAAAAAkUAAAAAAAUAAAU");base64DecodeToExistingUint8Array(bufferView,55213,"Fg==");base64DecodeToExistingUint8Array(bufferView,55225,"FQAAAAAVAAAAAAkWAAAAAAAWAAAWAAAwMTIzNDU2Nzg5QUJDREVG");base64DecodeToExistingUint8Array(bufferView,55300,"gwM=");base64DecodeToExistingUint8Array(bufferView,55340,"//////////8=");base64DecodeToExistingUint8Array(bufferView,55408,"0XSeAFedvSqAcFIP//8+JwoAAABkAAAA6AMAABAnAACghgEAQEIPAICWmAAA4fUFGAAAADUAAABxAAAAa////877//+Sv///AAAAAAAAAAD/////////////////////////////////////////////////////////////////AAECAwQFBgcICf////////8KCwwNDg8QERITFBUWFxgZGhscHR4fICEiI////////woLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIj/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wABAgQHAwYFAAAAAAAAAAIAAMADAADABAAAwAUAAMAGAADABwAAwAgAAMAJAADACgAAwAsAAMAMAADADQAAwA4AAMAPAADAEAAAwBEAAMASAADAEwAAwBQAAMAVAADAFgAAwBcAAMAYAADAGQAAwBoAAMAbAADAHAAAwB0AAMAeAADAHwAAwAAAALMBAADDAgAAwwMAAMMEAADDBQAAwwYAAMMHAADDCAAAwwkAAMMKAADDCwAAwwwAAMMNAADTDgAAww8AAMMAAAy7AQAMwwIADMMDAAzDBAAM2wAAAAAc2wAAjwMAAJADAACRAwAAkgMAAJMDAACUAwAAlQMAAAAAAADw2gAAjgMAAJYDAACXAwAATlN0M19fMjhpb3NfYmFzZTdmYWlsdXJlRQAAAOzkAADU2gAAqOMAAE5TdDNfXzIxOV9faW9zdHJlYW1fY2F0ZWdvcnlFAAAA7OQAAPzaAADw4wAATm8gZXJyb3IgaW5mb3JtYXRpb24ASWxsZWdhbCBieXRlIHNlcXVlbmNlAERvbWFpbiBlcnJvcgBSZXN1bHQgbm90IHJlcHJlc2VudGFibGUATm90IGEgdHR5AFBlcm1pc3Npb24gZGVuaWVkAE9wZXJhdGlvbiBub3QgcGVybWl0dGVkAE5vIHN1Y2ggZmlsZSBvciBkaXJlY3RvcnkATm8gc3VjaCBwcm9jZXNzAEZpbGUgZXhpc3RzAFZhbHVlIHRvbyBsYXJnZSBmb3IgZGF0YSB0eXBlAE5vIHNwYWNlIGxlZnQgb24gZGV2aWNlAE91dCBvZiBtZW1vcnkAUmVzb3VyY2UgYnVzeQBJbnRlcnJ1cHRlZCBzeXN0ZW0gY2FsbABSZXNvdXJjZSB0ZW1wb3JhcmlseSB1bmF2YWlsYWJsZQBJbnZhbGlkIHNlZWsAQ3Jvc3MtZGV2aWNlIGxpbmsAUmVhZC1vbmx5IGZpbGUgc3lzdGVtAERpcmVjdG9yeSBub3QgZW1wdHkAQ29ubmVjdGlvbiByZXNldCBieSBwZWVyAE9wZXJhdGlvbiB0aW1lZCBvdXQAQ29ubmVjdGlvbiByZWZ1c2VkAEhvc3QgaXMgZG93bgBIb3N0IGlzIHVucmVhY2hhYmxlAEFkZHJlc3MgaW4gdXNlAEJyb2tlbiBwaXBlAEkvTyBlcnJvcgBObyBzdWNoIGRldmljZSBvciBhZGRyZXNzAEJsb2NrIGRldmljZSByZXF1aXJlZABObyBzdWNoIGRldmljZQBOb3QgYSBkaXJlY3RvcnkASXMgYSBkaXJlY3RvcnkAVGV4dCBmaWxlIGJ1c3kARXhlYyBmb3JtYXQgZXJyb3IASW52YWxpZCBhcmd1bWVudABBcmd1bWVudCBsaXN0IHRvbyBsb25nAFN5bWJvbGljIGxpbmsgbG9vcABGaWxlbmFtZSB0b28gbG9uZwBUb28gbWFueSBvcGVuIGZpbGVzIGluIHN5c3RlbQBObyBmaWxlIGRlc2NyaXB0b3JzIGF2YWlsYWJsZQBCYWQgZmlsZSBkZXNjcmlwdG9yAE5vIGNoaWxkIHByb2Nlc3MAQmFkIGFkZHJlc3MARmlsZSB0b28gbGFyZ2UAVG9vIG1hbnkgbGlua3MATm8gbG9ja3MgYXZhaWxhYmxlAFJlc291cmNlIGRlYWRsb2NrIHdvdWxkIG9jY3VyAFN0YXRlIG5vdCByZWNvdmVyYWJsZQBQcmV2aW91cyBvd25lciBkaWVkAE9wZXJhdGlvbiBjYW5jZWxlZABGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWQATm8gbWVzc2FnZSBvZiBkZXNpcmVkIHR5cGUASWRlbnRpZmllciByZW1vdmVkAERldmljZSBub3QgYSBzdHJlYW0ATm8gZGF0YSBhdmFpbGFibGUARGV2aWNlIHRpbWVvdXQAT3V0IG9mIHN0cmVhbXMgcmVzb3VyY2VzAExpbmsgaGFzIGJlZW4gc2V2ZXJlZABQcm90b2NvbCBlcnJvcgBCYWQgbWVzc2FnZQBGaWxlIGRlc2NyaXB0b3IgaW4gYmFkIHN0YXRlAE5vdCBhIHNvY2tldABEZXN0aW5hdGlvbiBhZGRyZXNzIHJlcXVpcmVkAE1lc3NhZ2UgdG9vIGxhcmdlAFByb3RvY29sIHdyb25nIHR5cGUgZm9yIHNvY2tldABQcm90b2NvbCBub3QgYXZhaWxhYmxlAFByb3RvY29sIG5vdCBzdXBwb3J0ZWQAU29ja2V0IHR5cGUgbm90IHN1cHBvcnRlZABOb3Qgc3VwcG9ydGVkAFByb3RvY29sIGZhbWlseSBub3Qgc3VwcG9ydGVkAEFkZHJlc3MgZmFtaWx5IG5vdCBzdXBwb3J0ZWQgYnkgcHJvdG9jb2wAQWRkcmVzcyBub3QgYXZhaWxhYmxlAE5ldHdvcmsgaXMgZG93bgBOZXR3b3JrIHVucmVhY2hhYmxlAENvbm5lY3Rpb24gcmVzZXQgYnkgbmV0d29yawBDb25uZWN0aW9uIGFib3J0ZWQATm8gYnVmZmVyIHNwYWNlIGF2YWlsYWJsZQBTb2NrZXQgaXMgY29ubmVjdGVkAFNvY2tldCBub3QgY29ubmVjdGVkAENhbm5vdCBzZW5kIGFmdGVyIHNvY2tldCBzaHV0ZG93bgBPcGVyYXRpb24gYWxyZWFkeSBpbiBwcm9ncmVzcwBPcGVyYXRpb24gaW4gcHJvZ3Jlc3MAU3RhbGUgZmlsZSBoYW5kbGUAUmVtb3RlIEkvTyBlcnJvcgBRdW90YSBleGNlZWRlZABObyBtZWRpdW0gZm91bmQAV3JvbmcgbWVkaXVtIHR5cGUATXVsdGlob3AgYXR0ZW1wdGVk");base64DecodeToExistingUint8Array(bufferView,57938,"pQJbAPABtQWMBSUBgwYdA5QE/wDHAzEDCwa8AY8BfwPKBCsA2gavAEIDTgPcAQ4EFQChBg0BlAILAjgGZAK8Av8CXQPnBAsHzwLLBe8F2wXhAh4GRQKFAIICbANvBPEA8wMYBdkA2gNMBlQCewGdA70EAABRABUCuwCzA20A/wGFBC8F+QQ4AGUBRgGfALcGqAFzAlMB");base64DecodeToExistingUint8Array(bufferView,58136,"IQQAAAAAAAAAAC8C");base64DecodeToExistingUint8Array(bufferView,58168,"NQRHBFYE");base64DecodeToExistingUint8Array(bufferView,58190,"oAQ=");base64DecodeToExistingUint8Array(bufferView,58210,"RgVgBW4FYQYAAM8BAAAAAAAAAADJBukG+QYAAAAAqOMAAKMDAACkAwAAlwMAAE5TdDNfXzIxMnN5c3RlbV9lcnJvckUAAOzkAACQ4wAAhOYAAE5TdDNfXzIxNGVycm9yX2NhdGVnb3J5RQAAAADE5AAAtOMAAE5TdDNfXzIxMl9fZG9fbWVzc2FnZUUAAOzkAADY4wAA0OMAAE4xMF9fY3h4YWJpdjExNl9fc2hpbV90eXBlX2luZm9FAAAAAOzkAAD84wAAtOYAAE4xMF9fY3h4YWJpdjExN19fY2xhc3NfdHlwZV9pbmZvRQAAAOzkAAAs5AAAIOQAAE4xMF9fY3h4YWJpdjExN19fcGJhc2VfdHlwZV9pbmZvRQAAAOzkAABc5AAAIOQAAE4xMF9fY3h4YWJpdjExOV9fcG9pbnRlcl90eXBlX2luZm9FAOzkAACM5AAAgOQAAAAAAABQ5AAApwMAAKgDAACpAwAAqgMAAKsDAACsAwAArQMAAK4DAAAAAAAANOUAAKcDAACvAwAAqQMAAKoDAACrAwAAsAMAALEDAACyAwAATjEwX19jeHhhYml2MTIwX19zaV9jbGFzc190eXBlX2luZm9FAAAAAOzkAAAM5QAAUOQAAAAAAACQ5QAApwMAALMDAACpAwAAqgMAAKsDAAC0AwAAtQMAALYDAABOMTBfX2N4eGFiaXYxMjFfX3ZtaV9jbGFzc190eXBlX2luZm9FAAAA7OQAAGjlAABQ5AAAAAAAAOzlAACeAwAAtwMAALgDAAAAAAAA1OUAAJ4DAAC5AwAAugMAAFN0OWV4Y2VwdGlvbgAAAADE5AAAxOUAAFN0OWJhZF9hbGxvYwAAAADs5AAA3OUAANTlAAAAAAAAMOYAABEAAAC7AwAAvAMAAAAAAACE5gAAvQMAAL4DAACXAwAAU3QxMWxvZ2ljX2Vycm9yAOzkAAAg5gAA1OUAAAAAAABk5gAAEQAAAL8DAAC8AwAAU3QxMmxlbmd0aF9lcnJvcgAAAADs5AAAUOYAADDmAABTdDEzcnVudGltZV9lcnJvcgAAAOzkAABw5gAA1OUAAAAAAADI5gAAiwMAAMADAADBAwAAU3Q5dHlwZV9pbmZvAAAAAMTkAACk5gAAU3Q4YmFkX2Nhc3QA7OQAALzmAADU5Q==");base64DecodeToExistingUint8Array(bufferView,59108,"8OYAABMAAAAUAAAAxOQAAAAEAAAAAAAACOcAABUAAAAWAAAAxOQAAJS9AAAAAAAAIOcAABcAAAAYAAAAxOQAAJ29AAABAAAAxOQAAKa9AAAFAAAAAAAAAFjnAAA5AAAAOgAAADsAAAA8AAAAxOQAAMe9AABI5QAAtb0AAAAAAAABAAAAUOc=");base64DecodeToExistingUint8Array(bufferView,59252,"JOgAAFsAAABcAAAAUQAAAF0AAABSAAAAXgAAAF8AAABgAAAAYQAAAGIAAABjAAAAZAAAAGUAAABmAAAAAAAAADjoAABnAAAAaAAAAEkAAABpAAAASwAAAGoAAABrAAAATAAAAGwAAABtAAAAbgAAAAAAAABM6AAAbwAAAHAAAABNAAAAcQAAAE8AAAByAAAAcwAAAFAAAAB0AAAAdQAAAHYAAAB3AAAAxOQAAPa9AADs5AAA4L0AABzoAADE5AAADr4AAOzkAAAuvgAAMOgAAMTkAABZvgAA7OQAAEK+AABE6AAAAAAAABzoAAB4AAAAeQAAAHoAAAB7AAAAegAAAHoAAAB6AAAAegAAAHoAAAB6AAAAegAAAAAAAAAw6AAAfAAAAH0AAAB6AAAAfgAAAHoAAAB6AAAAegAAAHoAAAB6AAAAegAAAHoAAAAAAAAAROgAAH8AAACAAAAAegAAAIEAAAB6AAAAegAAAHoAAAB6AAAAegAAAHoAAAB6AAAAAAAAAEjpAACZAAAAmgAAAHoAAAB6AAAAegAAAHoAAAB6AAAAegAAAHoAAAB6AAAAegAAAHoAAAB6AAAAegAAAHoAAAB6AAAAegAAAHoAAAB6AAAAxOQAAH6+AAAAAAAArOkAAJkAAACbAAAAnAAAAJ0AAACeAAAAnwAAAKAAAAChAAAAogAAAKMAAACkAAAApQAAAKYAAACnAAAAqAAAAKkAAACqAAAAqwAAAKwAAACtAAAArgAAAOzkAACOvgAASOkAAAAAAAAU6gAAmQAAAK8AAACwAAAAsQAAALIAAACzAAAAtAAAALUAAAC2AAAAtwAAALgAAAC5AAAAugAAALsAAAC8AAAAvQAAAL4AAAC/AAAAwAAAAMEAAADCAAAA7OQAAKO+AABI6QAAAAAAAHzqAACZAAAAwwAAAMQAAADFAAAAxgAAAMcAAADIAAAAyQAAAMoAAADLAAAAzAAAAM0AAADOAAAAzwAAANAAAADRAAAA0gAAANMAAADUAAAA1QAAANYAAADs5AAAub4AAEjpAAAAAAAA5OoAAJkAAADXAAAA2AAAANkAAADaAAAA2wAAANwAAADdAAAA3gAAAN8AAADgAAAA4QAAAOIAAADjAAAA5AAAAOUAAADmAAAA5wAAAOgAAADpAAAA6gAAAOzkAADTvgAASOkAAAAAAABM6wAAmQAAAOsAAADsAAAA7QAAAO4AAADvAAAA8AAAAPEAAADyAAAA8wAAAPQAAAD1AAAA9gAAAPcAAAD4AAAA+QAAAPoAAAD7AAAA/AAAAP0AAAD+AAAA7OQAAOy+AABI6Q==");base64DecodeToExistingUint8Array(bufferView,60258,"wD/NzIw/zczMPwAAAADD9cg/16PwP65HoT8AAAAAexTOPx+F6z97FK4/AAAAAMP1yD/2KNw/hevRPwAAAADD9cg/w/XIP8P1yD8AAAAAAAAAAI/C9b0AAAAAKVyPPXsULj4=");base64DecodeToExistingUint8Array(bufferView,60372,"PQpXPgAAAABcj0K+pHC9vg==");base64DecodeToExistingUint8Array(bufferView,60416,"zcxMPc3MzD0K16M9AAAAAM3MTD3NzMw9CtejPQAAAADNzEw9zczMPQrXoz0AAAAAzcxMPc3MzD0K16M9AAAAAAAAgD/E5AAAAL8AAAAAAABjLgAANi8AAOAwAADjLAAA7ysAACMyAADoMQAAtTEAAArXozy4MQAA3y8AANovAAAwMAAAMDA=");base64DecodeToExistingUint8Array(bufferView,60564,"HwAsACQA//8AAAAALAAeACQA//8AAAAAAwBDAEAA//8AAAAABAADAEEA//8AAAAAAwBAAEEA//8AAAAABABBAAUA//8AAAAAQQBCAAUA//8AAAAABQBCAEQA//8AAAAADAAPADcA//8AAAAADwAOADcA//8AAAAADgA1ADcA//8AAAAADQA1AA4A//8AAAAACwA1AA0A//8DAAAARQBGAEcASAD//0kASgBLAEwA//8DAAAAUQBSAFMAVAD//00ATgBPAFAA//8CAAAARQAKACMAJgBGAP//AgAAAE0ATgAlACIACQD//wIAAAAoACQAHgAiACUA//8CAAAAKQAmACMAHwAkAP//AgAAAAgAAQAHAAAAPgABAP//AgAAAAIAHgAsAB8AGwAdADcANAAzADUAHAAaAB4A//8AAAAAMQAzADQAMgD//wIAAAA7ADUAMwAxADgANQD//wIAAAA8ADcAOgAyADQANwD//wIAAAA2ADUAOAAxADIAOgA3AP//AgAAACEANwAdABsAHwAjAAoA//8CAAAAIAAJACIAHgAaABwANQD//wIAAAAvAC4ABwABAEgARwBGACYAKwAnAC4A//8CAAAALQAuACcAKgAlAE4ATwBQAAAABwAuAP//AgAAAAoARQBJAEoASwBMAEgA//8CAAAACQBQAFQAUwBSAFEATQD//wIAAAA+AAAAQwADAAQABQBEAAEA//8CAAAACgBIACEA//8CAAAACQAgAFAA//8CAAAADAA3AFUARABCABIA//8CAAAAVQA3ACEASAABAEQA//8CAAAACwAQAEAAQwBWADUA//8CAAAAVgBDAAAAUAAgADUA//8CAAAAEQASAEIAQQBAABAA//8CAAAABgAkACgAJQAqACcAKwAmACkAJAD//wMAAQAMABUAFAATAAsA//8PAA4ADQD//wMAAQASABEAEAD//wwAGAAXABYACwD/////AAAAAFDnAABOAQAATwEAAHoAAAAAAIA/AAAAAAAAAAByHQAAehMAAIIaAAC0GgAAdBM=");base64DecodeToExistingUint8Array(bufferView,61360,"mRAAAOgKAAAeCwAA5AoAABoL");base64DecodeToExistingUint8Array(bufferView,61392,"ch0AACocAADHIgAAeRkAAMwTAADdGgAA7AwAAOgDAABSuH4/AAAAAFTwAACaAQAAmwEAAHoAAACcAQAAnQEAAJ4BAACfAQAAoAEAAKEBAACiAQAAowEAAKQBAAClAQAApgEAAKcBAACoAQAAqQEAAKoBAACrAQAArAEAAHoAAACtAQAA7OQAAOy/AAA09QAAACsAAJAGAAAuJQAAZBwAAHYFAAAAAAAAhPUAAAwCAAANAgAADgIAAA8CAAAQAgAAEQIAABICAAATAgAAFAIAABUCAAAWAgAAFwIAABgCAAAZAgAAAAAAADT1AAAaAgAAGwIAAHoAAACcAQAAnQEAAJ4BAACfAQAAoAEAAKEBAACiAQAAowEAAKQBAAClAQAApgEAAKcBAACoAQAAqQEAAKoBAACrAQAArAEAAHoAAACtAQ==");base64DecodeToExistingUint8Array(bufferView,61728,"bhIAAMMZAAC1GQAA6AoAAB4LAABcGwAAAAAAACj2AAAcAgAAHQIAAB4CAAAfAgAAIAIAAAAAAAAw9gAAGgIAACECAAAiAgAAIwIAACQCAAAlAgAAJgIAAKABAAChAQAAogEAAKMBAACkAQAApQEAACcCAACnAQAAKAIAAKkBAACqAQAAKQIAAKwBAAAqAgAAKwIAAAAAAAA89gAALAIAAC0CAAAuAgAALwIAADACAAAxAgAAnwEAAKABAAChAQAAogEAAKMBAAAyAgAApQEAADMCAACnAQAANAIAAKkBAACqAQAANQIAAKwBAAA2AgAANwIAAAAAAABI9gAAGgIAADgCAAA5AgAAnAEAADoCAAA7AgAAnwEAAKABAAChAQAAogEAADwCAACkAQAApQEAAKYBAACnAQAAqAEAAKkBAACqAQAAPQIAAKwBAAA+AgAAPwIAAAAAAABU9gAAGgIAAEACAABBAgAAnAEAAEICAABDAgAAnwEAAKABAAChAQAAogEAAKMBAABEAgAApQEAAEUCAACnAQAARgIAAKkBAACqAQAARwIAAKwBAABIAgAASQIAAAAAAABg9gAAGgIAAEoCAABLAgAAnAEAAEwCAABNAgAAnwEAAKABAAChAQAAogEAAKMBAABOAgAApQEAAE8CAACnAQAAUAIAAKkBAACqAQAAUQIAAKwBAABSAgAAUwIAAAAAAABs9gAAVAIAAFUCAABWAgAAVwIAAFgCAABZAgAAWgIAAFsCAABcAgAAXQIAAKMBAACkAQAApQEAAKYBAACnAQAAXgIAAF8CAACqAQAAYAIAAKwBAABhAgAAYgIAAAAAAACc9gAAYwIAAGQCAABlAgAAZgIAAGcCAABoAgAAaQIAAKABAABqAgAAawIAAKMBAACkAQAApQEAAKYBAACnAQAAbAIAAKkBAACqAQAAbQIAAKwBAABuAgAAbwIAAAAAAAB49gAAmgEAAHACAABxAgAAcgIAAHMCAAB0AgAAdQIAAHYCAAB3AgAAeAIAAKMBAAB5AgAApQEAAHoCAACnAQAAewIAAHwCAACqAQAAfQIAAKwBAAB+AgAAfwI=");base64DecodeToExistingUint8Array(bufferView,62560,"7goAAAUhAAAeIQAAEyEAAIETAAAAAAAAhPYAAIACAACBAgAAggIAAIMCAACEAgAAhQIAAIYCAACHAgAAiAIAAIkCAACKAgAAiwIAAKUBAACMAgAApwEAAI0CAACOAgAAqgEAAI8CAACQAgAAkQIAAJICAAAAAAAAkPYAAJMCAACUAgAAlQIAAJYCAACdAQAAlwIAAJgCAACZAgAAmgIAAJsCAACcAgAAnQIAAKUBAACeAgAApwEAAJ8CAACgAgAAqgEAAKECAACsAQAAogIAAKMCAADE5AAAQMAAAAAAAAB89QAADAIAAKQCAAB6AAAAegAAAHoAAAARAgAAegAAAKUCAACmAgAApwIAAHoAAAB6AAAAGAIAABkCAADE5AAAUMAAAOzkAABlwAAAfPUAAAAAAADQ9QAAqAIAAKkCAACqAgAAqwIAAKwCAAARAgAArQIAAK4CAACmAgAArwIAALACAACxAgAAGAIAABkCAADs5AAAeMAAAHz1AAAAAAAAHPYAALICAACzAgAAtAIAALUCAAC2AgAAEQIAALcCAAC4AgAApgIAALkCAAC6AgAAuwIAABgCAAAZAgAA7OQAAIjAAAB89QAAxOQAAJjAAADs5AAArMAAADT1AADs5AAAv8AAADT1AADs5AAA0sAAADT1AADs5AAA38AAADT1AADs5AAA78AAADT1AADs5AAABMEAADT1AADs5AAAFcEAAFTwAADs5AAAI8EAAFTwAADs5AAAMcEAADT1AADs5AAAQcEAADT1AAAAAAAAMzMzPzMzM78=");base64DecodeToExistingUint8Array(bufferView,63168,"HTIAAOIxAACqMQAAoDEAAI8xAAAAAAAABPcAAN4CAADfAgAAegAAAHoAAAAAAAAADPcAAOACAADhAgAA4gIAAOMCAADE5AAAiMEAAOzkAACVwQAABPcAAOKEAAAQrAAAF68AAFwZAABAMgAAggUAAMAaAAD1MQAAhDEAAIQxAAAK1yM9");base64DecodeToExistingUint8Array(bufferView,63316,"VgUAAEcRAAAUJwAAOTkAAE0ZAAD9EQAASB0AAIohAAAECgAA/yUAAOIEAABQJgAAKQQAAKUSAAAOBAAAYCEAALMEAACqHAAALAsAAGMXAAAiJgAA6yMAAAIIAABjBAAA/QsAALgVAADzBQAA2QUAAD0EAAC2KAAAlSgAAMEnAAAYKQAAAykAAO0nAADgKAAAhwQAACkkAAAZKAAAbQ8=");base64DecodeToExistingUint8Array(bufferView,63488,"ysIAANDCAADTwgAA2cIAAKTCAADgwgAA6cIAAPHCAABAAwAAQQMAAEIDAABDAwAARAMAAEUDAABGAwAARwMAAEgDAABJAwAASgMAAEsDAABMAwAATQMAAE4DAABPAwAAAQ==");base64DecodeToExistingUint8Array(bufferView,63601,"FQoAAAk=");base64DecodeToExistingUint8Array(bufferView,63624,"FRAMExweAw0fICEiIxsaERkZGRkZGRkZGRkWEgIOCw8cGBgYGBgYFhYWFhYWFhYWFhYWFhYWFhYWFhYUHAQcFhwYGBgYGBgWFhYWFhYWFhYWFhYWFhYWFhYWFhwkHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcFhwcHBwcHBwcHBwWHBocHBYcHBwcHBYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWHBYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYcFhYWFhYWFhY=");base64DecodeToExistingUint8Array(bufferView,63884,"QAMAAEEDAABCAwAAQwMAAEQDAABFAwAARgMAAEcDAABIAwAASQMAAEoDAABLAwAATAMAAE0DAABQAwAAUQMAAAEAAAAB");base64DecodeToExistingUint8Array(bufferView,63965,"FQoAABU=");base64DecodeToExistingUint8Array(bufferView,63988,"FRAMExweAw0fICEiIxsaERkZGRkZGRkZGRkWEgIOCw8cGBgYGBgYFhYWFhYWFhYWFhYWFhYWFhYWFhYUHAQcFhwYGBgYGBgWFhYWFhYWFhYWFhYWFhYWFhYWFhwkHBwcCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBgYGBgYGBgYGBgYGBgYGBgcHBwcH");base64DecodeToExistingUint8Array(bufferView,64210,"AQFSAwAAUwMAAFQDAABVAwAAVgMAAFQDAABXAwAAWAMAAFkD");base64DecodeToExistingUint8Array(bufferView,64256,"NsoAAEHKAABKygAAUMoAAFfKAABgyg==");base64DecodeToExistingUint8Array(bufferView,64288,"IPgAAID/AAA8+wAAqPwAAKj8AAAU/gAAPPsAAEADAABBAwAAQgMAAEMDAABEAwAARQMAAEYDAABHAwAASAMAAEkDAABKAwAASwMAAEwDAABNAwAAUAMAAFEDAAABAAAAAQ==");base64DecodeToExistingUint8Array(bufferView,64397,"FQoAAAk=");base64DecodeToExistingUint8Array(bufferView,64420,"FRAMExweAw0fICEiIxsaERkZGRkZGRkZGRkWEgIOCw8cGBgYGBgYFhYWFhYWFhYWFhYWFhYWFhYWFhYUHAQcFhwYGBgYGBgWFhYWFhYWFhYWFhYWFhYWFhYWFhwkHBwcCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBgYGBgYGBgYGBgYGBgYGBgcHBwcH");base64DecodeToExistingUint8Array(bufferView,64642,"AQFSAwAAUwMAAFQDAABVAwAAVgMAAFQDAABXAwAAWAMAAFkDAABaAwAAWwMAAFwDAABdAwAAXgMAAF8DAABgAwAAYQMAAGIDAABjAwAAZAMAAGUDAABmAwAAZwMAAGgDAABpAwAAAg==");base64DecodeToExistingUint8Array(bufferView,64761,"FQoAAAk=");base64DecodeToExistingUint8Array(bufferView,64784,"FRAMExweAw0fICEiIxsaERkZGRkZGRkZGRkWEgIOCw8cGBgYGBgYFhYWFhYWFhYWFhYWFhYWFhYWFhYUHAQcFhwYGBgYGBgWFhYWFhYWFhYWFhYWFhYWFhYWFhwkHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcFhwcHBwcHBwcHBwWHBocHBYcHBwcHBYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWHBYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYcFhYWFhYWFhY=");base64DecodeToExistingUint8Array(bufferView,65044,"agMAAGsDAABsAwAAbQMAAG4DAABvAwAAcAMAAHEDAAByAwAAcwMAAHQDAAB1AwAAdgMAAHcDAAB4AwAAeQMAAAI=");base64DecodeToExistingUint8Array(bufferView,65125,"FQoAAAk=");base64DecodeToExistingUint8Array(bufferView,65148,"FRAMExweAw0fICEiIxsaERkZGRkZGRkZGRkWEgIOCw8cGBgYGBgYFhYWFhYWFhYWFhYWFhYWFhYWFhYUHAQcFhwYGBgYGBgWFhYWFhYWFhYWFhYWFhYWFhYWFhwkHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcFhwcHBwcHBwcHBwWHBocHBYcHBwcHBYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWHBYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYcFhYWFhYWFhY=");base64DecodeToExistingUint8Array(bufferView,65408,"QAMAAEEDAABCAwAAQwMAAEQDAABFAwAARgMAAEcDAABIAwAASQMAAEoDAABLAwAATAMAAE0DAAB6AwAATwMAAAEAAAAB");base64DecodeToExistingUint8Array(bufferView,65489,"FQoAAAk=");base64DecodeToExistingUint8Array(bufferView,65512,"FRAMExweAw0fICEiIxsaERkZGRkZGRkZGRkWEgIOCw8cGBgYGBgYFhYWFhYWFhYWFhYWFhYWFhYWFhYUHAQcFhwYGBgYGBgWFhYWFhYWFhYWFhYWFhYWFhYWFhwkHBwc");base64DecodeToExistingUint8Array(bufferView,65776,"BQ==");base64DecodeToExistingUint8Array(bufferView,65788,"fgM=");base64DecodeToExistingUint8Array(bufferView,65812,"fAMAAHsDAAB8KAE=");base64DecodeToExistingUint8Array(bufferView,65836,"Ag==");base64DecodeToExistingUint8Array(bufferView,65852,"//////////8=");base64DecodeToExistingUint8Array(bufferView,65920,"8AABAAAAAAAF");base64DecodeToExistingUint8Array(bufferView,65940,"fwM=");base64DecodeToExistingUint8Array(bufferView,65964,"fAMAAIADAACIKAEAAAQ=");base64DecodeToExistingUint8Array(bufferView,65988,"AQ==");base64DecodeToExistingUint8Array(bufferView,66004,"/////wo=");base64DecodeToExistingUint8Array(bufferView,66072,"iAEBAPAuUQCk2gAApQM=");}var scratchBuffer=new ArrayBuffer(16);var i32ScratchView=new Int32Array(scratchBuffer);var f32ScratchView=new Float32Array(scratchBuffer);var f64ScratchView=new Float64Array(scratchBuffer);function wasm2js_scratch_load_i32(index){return i32ScratchView[index];}function wasm2js_scratch_store_i32(index,value){i32ScratchView[index]=value;}function wasm2js_scratch_load_f64(){return f64ScratchView[0];}function wasm2js_scratch_store_f64(value){f64ScratchView[0]=value;}function wasm2js_scratch_store_f32(value){f32ScratchView[2]=value;}function wasm2js_scratch_load_f32(){return f32ScratchView[2];}function asmFunc(env){var memory=env.memory;var buffer=memory.buffer;memory.grow=__wasm_memory_grow;var HEAP8=new Int8Array(buffer);var HEAP16=new Int16Array(buffer);var HEAP32=new Int32Array(buffer);var HEAPU8=new Uint8Array(buffer);var HEAPU16=new Uint16Array(buffer);var HEAPU32=new Uint32Array(buffer);var HEAPF32=new Float32Array(buffer);var HEAPF64=new Float64Array(buffer);var Math_imul=Math.imul;var Math_fround=Math.fround;var Math_abs=Math.abs;var Math_clz32=Math.clz32;var Math_min=Math.min;var Math_max=Math.max;var Math_floor=Math.floor;var Math_ceil=Math.ceil;var Math_trunc=Math.trunc;var Math_sqrt=Math.sqrt;var abort=env.abort;var nan=NaN;var infinity=Infinity;var invoke_ii=env.invoke_ii;var __cxa_find_matching_catch_2=env.__cxa_find_matching_catch_2;var getTempRet0=env.getTempRet0;var __resumeException=env.__resumeException;var invoke_iii=env.invoke_iii;var invoke_iiif=env.invoke_iiif;var invoke_iiifffffff=env.invoke_iiifffffff;var invoke_iiii=env.invoke_iiii;var __cxa_find_matching_catch_3=env.__cxa_find_matching_catch_3;var invoke_vii=env.invoke_vii;var invoke_viii=env.invoke_viii;var __cxa_allocate_exception=env.__cxa_allocate_exception;var __cxa_throw=env.__cxa_throw;var __cxa_free_exception=env.__cxa_free_exception;var strftime=env.strftime;var invoke_iiiiiii=env.invoke_iiiiiii;var __cxa_begin_catch=env.__cxa_begin_catch;var invoke_vi=env.invoke_vi;var __cxa_end_catch=env.__cxa_end_catch;var invoke_v=env.invoke_v;var invoke_iiiii=env.invoke_iiiii;var invoke_iiiif=env.invoke_iiiif;var invoke_viiiiiiff=env.invoke_viiiiiiff;var invoke_vif=env.invoke_vif;var invoke_i=env.invoke_i;var emscripten_asm_const_int=env.emscripten_asm_const_int;var invoke_fiif=env.invoke_fiif;var invoke_iifff=env.invoke_iifff;var invoke_iiffff=env.invoke_iiffff;var exit=env.exit;var invoke_viiiii=env.invoke_viiiii;var invoke_viiiiiii=env.invoke_viiiiiii;var invoke_viiii=env.invoke_viiii;var invoke_iif=env.invoke_iif;var invoke_viiiiiiii=env.invoke_viiiiiiii;var invoke_fi=env.invoke_fi;var invoke_vifiii=env.invoke_vifiii;var invoke_fii=env.invoke_fii;var invoke_iiifffi=env.invoke_iiifffi;var invoke_viifi=env.invoke_viifi;var invoke_viiiiii=env.invoke_viiiiii;var invoke_vifi=env.invoke_vifi;var invoke_iiiiiiiiiiiiiiii=env.invoke_iiiiiiiiiiiiiiii;var __cxa_find_matching_catch_5=env.__cxa_find_matching_catch_5;var llvm_eh_typeid_for=env.llvm_eh_typeid_for;var _tzset_js=env._tzset_js;var _localtime_js=env._localtime_js;var _emscripten_date_now=env._emscripten_date_now;var __syscall_openat=env.__syscall_openat;var __syscall_fcntl64=env.__syscall_fcntl64;var __syscall_ioctl=env.__syscall_ioctl;var __wasi_fd_write=env.fd_write;var __wasi_fd_read=env.fd_read;var __wasi_fd_close=env.fd_close;var __syscall_fstat64=env.__syscall_fstat64;var __syscall_stat64=env.__syscall_stat64;var __syscall_newfstatat=env.__syscall_newfstatat;var __syscall_lstat64=env.__syscall_lstat64;var emscripten_resize_heap=env.emscripten_resize_heap;var __cxa_rethrow=env.__cxa_rethrow;var __cxa_uncaught_exceptions=env.__cxa_uncaught_exceptions;var invoke_iiiiii=env.invoke_iiiiii;var invoke_iiiiid=env.invoke_iiiiid;var abort=env.abort;var setTempRet0=env.setTempRet0;var legalimport$__wasi_fd_seek=env.fd_seek;var __stack_pointer=5320432;var i64toi32_i32$HIGH_BITS=0;// EMSCRIPTEN_START_FUNCS
;bufferView=HEAPU8;initActiveSegments(env);var FUNCTION_TABLE=Table([null,operator_20new_5b_5d_28unsigned_20long_29,std____2____compressed_pair_SSPRSet___2c_20std____2__allocator_SSPRSet___20_____compressed_pair_std__nullptr_t_2c_20std____2____default_init_tag__28std__nullptr_t___2c_20std____2____default_init_tag___29,std____2____compressed_pair_SSMorph___2c_20std____2__allocator_SSMorph___20_____compressed_pair_std__nullptr_t_2c_20std____2____default_init_tag__28std__nullptr_t___2c_20std____2____default_init_tag___29,std____2____split_buffer_SSPRSet__2c_20std____2__allocator_SSPRSet________construct_at_end_28unsigned_20long_2c_20SSPRSet__20const__29,std____2__vector_SSPRSet__2c_20std____2__allocator_SSPRSet___20_____swap_out_circular_buffer_28std____2____split_buffer_SSPRSet__2c_20std____2__allocator_SSPRSet______29,std____2____split_buffer_SSMorph__2c_20std____2__allocator_SSMorph________construct_at_end_28unsigned_20long_2c_20SSMorph__20const__29,std____2__vector_SSMorph__2c_20std____2__allocator_SSMorph___20_____swap_out_circular_buffer_28std____2____split_buffer_SSMorph__2c_20std____2__allocator_SSMorph______29,SSMorph__SSMorph_28char__2c_20float_29,void_20std____2__allocator_traits_std____2__allocator_SSPRSet___20___construct_SSPRSet__2c_20SSPRSet__20const__2c_20void__28std____2__allocator_SSPRSet____2c_20SSPRSet___2c_20SSPRSet__20const__29,SSPRSet__SSPRSet_28char__2c_20float_2c_20float_2c_20float_2c_20float_2c_20float_2c_20float_2c_20float_29,SSPRSet__SSPRSet_28_29,void_20std____2__allocator_traits_std____2__allocator_SSPRSet___20___destroy_SSPRSet__2c_20void__28std____2__allocator_SSPRSet____2c_20SSPRSet___29,std____2____libcpp_deallocate_28void__2c_20unsigned_20long_2c_20unsigned_20long_29,void_20std____2__allocator_traits_std____2__allocator_SSMorph___20___destroy_SSMorph__2c_20void__28std____2__allocator_SSMorph____2c_20SSMorph___29,unsigned_20long_20const__20std____2__min_unsigned_20long__28unsigned_20long_20const__2c_20unsigned_20long_20const__29,std__length_error__length_error_28char_20const__29,std__logic_error___logic_error_28_29,void_20std____2__allocator_traits_std____2__allocator_SSMorph___20___construct_SSMorph__2c_20SSMorph__20const__2c_20void__28std____2__allocator_SSMorph____2c_20SSMorph___2c_20SSMorph__20const__29,SSFrame___SSFrame_28_29,SSFrame___SSFrame_28_29_1,SSMorph___SSMorph_28_29,SSMorph___SSMorph_28_29_1,SSPRSet___SSPRSet_28_29,SSPRSet___SSPRSet_28_29_1,std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___sentry__sentry_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29,std____2__basic_ios_char_2c_20std____2__char_traits_char__20___fill_28_29_20const,std____2__ostreambuf_iterator_char_2c_20std____2__char_traits_char__20__20std____2____pad_and_output_char_2c_20std____2__char_traits_char__20__28std____2__ostreambuf_iterator_char_2c_20std____2__char_traits_char__20__2c_20char_20const__2c_20char_20const__2c_20char_20const__2c_20std____2__ios_base__2c_20char_29,std____2__basic_ios_char_2c_20std____2__char_traits_char__20___setstate_28unsigned_20int_29,std____2__ios_base____set_badbit_and_consider_rethrow_28_29,__cxa_end_catch,std____2__basic_ios_char_2c_20std____2__char_traits_char__20___rdbuf_28_29_20const,std____2__basic_streambuf_char_2c_20std____2__char_traits_char__20___sputn_28char_20const__2c_20long_29,std____2__ctype_char__20const__20std____2__use_facet_std____2__ctype_char__20__28std____2__locale_20const__29,std____2__ctype_char___widen_28char_29_20const,DynamicArray_char_2c_20_28char_290___clear_28_29,printIndent_28_IO_FILE__29,InvertibleStringArray__InvertibleStringArray_28short_29,HashAny_char_20const__2c_20int___HashAny_28int_2c_20int_29,InvertibleStringArray__InvertibleStringArray_28_29,HashChain_char_20const__2c_20int___insert_28HashChainItem_char_20const__2c_20int__29,DynamicArrayP_char_20const___DynamicArrayP_28int_29,HashAny_char_20const__2c_20int___freeStrings_28_29,DynamicArrayP_char_20const___clear_28_29,InvertibleDynamicStringArray__InvertibleDynamicStringArray_28short_2c_20bool_29,DynamicString__DynamicString_28int_29,DynamicArrayP_char___clear_28_29,TokenStream__TokenStream_28_29,DynamicArrayP_char___DynamicArrayP_28_29,DynamicArrayP_char_20const___freeAll_28_29,DynamicArrayP_OptionSpec___DynamicArrayP_28_29,DynamicArrayP_char___freeAll_28_29,DynamicArrayP_OptionSpec___clear_28_29,TokenStream__TokenStream_28char_20const__29,DynamicArrayP_char_20const___DynamicArrayP_28_29,OptionSpec__OptionSpec_28OptionType_2c_20bool_2c_20char_20const__29,TorsoCurve__TorsoCurve_28TorsoCurve_20const__2c_20TorsoCurve_20const__2c_20float_29,TorsoDecollider___TorsoDecollider_28_29,TorsoDecollider___TorsoDecollider_28_29_1,TorsoDecollider__ForceOutside_28Vector_20const__2c_20Vector__29_20const,TorsoDecollider__ForceOutsideOffset_28Vector_20const__2c_20Vector__29_20const,ControlledByScalar_Vector___ControlledByScalar_28_29,QuaternionController__QuaternionController_28_29,SHMScalarController__SHMScalarController_28_29,operator_20new_28unsigned_20long_29,OneArmAnimator__reset_28OneHConcretePosture__29,Joint__NewJointRotation_28_29,HandJointRotations__setFrom_28HandJointRotations_20const__29,HandJointRotations__HandJointRotations_28HandJointRotations_20const__29,Vector__Vector_28_29,OneHConcretePosture__computeWristLoc_28HanimAvatar_20const__2c_20Vector__29_20const,eprintf_28char_20const__2c_20____29,HanimAvatar__computeArmRotations_28JointRotation___2c_20bool_2c_20Vector_20const__2c_20Quaternion_20const__2c_20Quaternion_20const__2c_20float_2c_20float_29_20const,VectorController2__reset_28float_29,Vector__Vector_28Vector_20const__29,VectorController2__set_reference_28Vector_29,VectorController2__set_perception_28Vector_29,QuaternionController__reset_28float_29,Quaternion__Quaternion_28Quaternion_20const__29,QuaternionController__set_reference_28Quaternion_29,QuaternionController__set_perception_28Quaternion_29,SHMScalarController__reset_28float_29,SHMScalarController__set_reference_28float_29,ControlledByScalar_Vector___reset_28float_29,ControlledByScalar_Vector___set_reference_28Vector_29,ControlledByScalar_Vector___set_perception_28Vector_29,Quaternion__Quaternion_28_29,OneArmAnimator__OneArmAnimator_28OneHConcretePosture__2c_20HanimAvatar_20const__29,TwoHConcretePosture__TwoHConcretePosture_28_29,OneHConcretePosture__OneHConcretePosture_28bool_29,Quaternion__setZeroVec_28_29,SHMScalarController___SHMScalarController_28_29,SHMScalarController___SHMScalarController_28_29_1,SHMScalarController__reset_28_29,SHMScalarController__get_reference_28_29,SHMScalarController__get_reference_28float__29,SHMScalarController__set_perception_28float_29,SHMScalarController__get_perception_28_29,SHMScalarController__get_perception_28float__29,SHMScalarController__newTime_28float_29,SHMScalarController__resetVar_28float_29,SHMScalarController__new_ref1_28float_29,SHMScalarController__new_per1_28float_29,VectorController2___VectorController2_28_29,VectorController2___VectorController2_28_29_1,VectorController2__reset_28_29,VectorController2__get_reference_28_29,VectorController2__get_reference_28Vector__29,VectorController2__get_perception_28_29,VectorController2__get_perception_28Vector__29,VectorController2__newTime_28float_29,QuaternionController___QuaternionController_28_29,QuaternionController___QuaternionController_28_29_1,QuaternionController__reset_28_29,QuaternionController__get_reference_28_29,QuaternionController__get_reference_28Quaternion__29,QuaternionController__get_perception_28_29,QuaternionController__get_perception_28Quaternion__29,QuaternionController__newTime_28float_29,QuaternionController__XnewTime_28float_29,GeneralController_float_2c_20float____GeneralController_28_29,GeneralController_float_2c_20float____GeneralController_28_29_1,__cxa_pure_virtual,GeneralController_float_2c_20float___reset_28_29,GeneralController_Vector_2c_20Vector____GeneralController_28_29,GeneralController_Vector_2c_20Vector____GeneralController_28_29_1,GeneralController_Vector_2c_20Vector___reset_28_29,GeneralController_Quaternion_2c_20Quaternion____GeneralController_28_29,GeneralController_Quaternion_2c_20Quaternion____GeneralController_28_29_1,GeneralController_Quaternion_2c_20Quaternion___reset_28_29,NewMorphSet_28_29,NonZeroMorphSet_28float__29,DynamicArray1_JointRotation____DynamicArray1_28_29,DynamicArray1_JointRotation____clear_28_29,TwoArmAnimator__TwoArmAnimator_28TwoHConcretePosture__2c_20HanimAvatar_20const__29,FaceAnimator__FaceAnimator_28HanimAvatar_20const__29,SSFrame__SSFrame_28_29,DynamicArrayP_Joint___clear_28_29,DynamicArrayP_Site___clear_28_29,DynamicArrayP_Joint___DynamicArrayP_28int_29,DynamicArrayP_Site___DynamicArrayP_28int_29,HingeJointRotation__HingeJointRotation_28Joint__29,TurretJointRotation__TurretJointRotation_28Joint__29,FingerBaseJointRotation__FingerBaseJointRotation_28Joint__29,ThumbBaseJointRotation__ThumbBaseJointRotation_28Joint__29,QuatJointRotation__QuatJointRotation_28Joint__29,Vector__setZero_28_29,Quaternion__setZero_28_29,HingeJointRotation__HingeJointRotation_28HingeJointRotation__29,TurretJointRotation__TurretJointRotation_28TurretJointRotation__29,FingerBaseJointRotation__FingerBaseJointRotation_28FingerBaseJointRotation__29,ThumbBaseJointRotation__ThumbBaseJointRotation_28ThumbBaseJointRotation__29,QuatJointRotation__QuatJointRotation_28QuatJointRotation__29,JointRotation___JointRotation_28_29,JointRotation___JointRotation_28_29_1,HingeJointRotation___HingeJointRotation_28_29,HingeJointRotation__toQuaternion_28Quaternion__29_20const,HingeJointRotation__setZero_28_29,HingeJointRotation__setFromQuat_28Quaternion_20const__29,HingeJointRotation__setCompose_28Quaternion_20const__29,HingeJointRotation__setComposeInv_28Quaternion_20const__29,HingeJointRotation__setPreInvCompose_28Quaternion_20const__29,HingeJointRotation__setBendAngle_28float_29,HingeJointRotation__addBendAngle_28float_29,HingeJointRotation__setSplayAngle_28float_29,HingeJointRotation__addSplayAngle_28float_29,HingeJointRotation__setLongitAngle_28float_29,HingeJointRotation__setBendAxis_28Vector_20const__29,HingeJointRotation__setSplayAxis_28Vector_20const__29,HingeJointRotation__setLongitAxis_28Vector_20const__29,HingeJointRotation__print_28_IO_FILE__2c_20short_29_20const,HingeJointRotation__printRotationVRML_28_IO_FILE__2c_20short_29_20const,HingeJointRotation__printAxesVRML_28_IO_FILE__2c_20float_2c_20short_2c_20short_29_20const,HingeJointRotation__setFrom_28HingeJointRotation_20const__29,HingeJointRotation__interpolate_28HingeJointRotation_20const__2c_20HingeJointRotation_20const__2c_20float_29,TurretJointRotation___TurretJointRotation_28_29,TurretJointRotation__toQuaternion_28Quaternion__29_20const,TurretJointRotation__setZero_28_29,TurretJointRotation__setFromQuat_28Quaternion_20const__29,TurretJointRotation__setCompose_28Quaternion_20const__29,TurretJointRotation__setComposeInv_28Quaternion_20const__29,TurretJointRotation__setPreInvCompose_28Quaternion_20const__29,TurretJointRotation__setBendAngle_28float_29,TurretJointRotation__addBendAngle_28float_29,TurretJointRotation__setSplayAngle_28float_29,TurretJointRotation__addSplayAngle_28float_29,TurretJointRotation__setLongitAngle_28float_29,TurretJointRotation__setBendAxis_28Vector_20const__29,TurretJointRotation__setSplayAxis_28Vector_20const__29,TurretJointRotation__setLongitAxis_28Vector_20const__29,TurretJointRotation__print_28_IO_FILE__2c_20short_29_20const,TurretJointRotation__printRotationVRML_28_IO_FILE__2c_20short_29_20const,TurretJointRotation__printAxesVRML_28_IO_FILE__2c_20float_2c_20short_2c_20short_29_20const,TurretJointRotation__setFrom_28TurretJointRotation_20const__29,TurretJointRotation__interpolate_28TurretJointRotation_20const__2c_20TurretJointRotation_20const__2c_20float_29,FingerBaseJointRotation___FingerBaseJointRotation_28_29,FingerBaseJointRotation__toQuaternion_28Quaternion__29_20const,FingerBaseJointRotation__setZero_28_29,FingerBaseJointRotation__setFromQuat_28Quaternion_20const__29,FingerBaseJointRotation__setCompose_28Quaternion_20const__29,FingerBaseJointRotation__setComposeInv_28Quaternion_20const__29,FingerBaseJointRotation__setPreInvCompose_28Quaternion_20const__29,FingerBaseJointRotation__setBendAngle_28float_29,FingerBaseJointRotation__addBendAngle_28float_29,FingerBaseJointRotation__setSplayAngle_28float_29,FingerBaseJointRotation__addSplayAngle_28float_29,FingerBaseJointRotation__setLongitAngle_28float_29,FingerBaseJointRotation__setBendAxis_28Vector_20const__29,FingerBaseJointRotation__setSplayAxis_28Vector_20const__29,FingerBaseJointRotation__setLongitAxis_28Vector_20const__29,FingerBaseJointRotation__print_28_IO_FILE__2c_20short_29_20const,FingerBaseJointRotation__printRotationVRML_28_IO_FILE__2c_20short_29_20const,FingerBaseJointRotation__printAxesVRML_28_IO_FILE__2c_20float_2c_20short_2c_20short_29_20const,FingerBaseJointRotation__setFrom_28FingerBaseJointRotation_20const__29,FingerBaseJointRotation__interpolate_28FingerBaseJointRotation_20const__2c_20FingerBaseJointRotation_20const__2c_20float_29,ThumbBaseJointRotation___ThumbBaseJointRotation_28_29,ThumbBaseJointRotation__toQuaternion_28Quaternion__29_20const,ThumbBaseJointRotation__setZero_28_29,ThumbBaseJointRotation__setFromQuat_28Quaternion_20const__29,ThumbBaseJointRotation__setCompose_28Quaternion_20const__29,ThumbBaseJointRotation__setComposeInv_28Quaternion_20const__29,ThumbBaseJointRotation__setPreInvCompose_28Quaternion_20const__29,ThumbBaseJointRotation__setBendAngle_28float_29,ThumbBaseJointRotation__addBendAngle_28float_29,ThumbBaseJointRotation__setSplayAngle_28float_29,ThumbBaseJointRotation__addSplayAngle_28float_29,ThumbBaseJointRotation__setLongitAngle_28float_29,ThumbBaseJointRotation__setBendAxis_28Vector_20const__29,ThumbBaseJointRotation__setSplayAxis_28Vector_20const__29,ThumbBaseJointRotation__setLongitAxis_28Vector_20const__29,ThumbBaseJointRotation__print_28_IO_FILE__2c_20short_29_20const,ThumbBaseJointRotation__printRotationVRML_28_IO_FILE__2c_20short_29_20const,ThumbBaseJointRotation__printAxesVRML_28_IO_FILE__2c_20float_2c_20short_2c_20short_29_20const,ThumbBaseJointRotation__setFrom_28ThumbBaseJointRotation_20const__29,ThumbBaseJointRotation__interpolate_28ThumbBaseJointRotation_20const__2c_20ThumbBaseJointRotation_20const__2c_20float_29,QuatJointRotation___QuatJointRotation_28_29,QuatJointRotation__toQuaternion_28Quaternion__29_20const,QuatJointRotation__setZero_28_29,QuatJointRotation__setFromQuat_28Quaternion_20const__29,QuatJointRotation__setCompose_28Quaternion_20const__29,QuatJointRotation__setComposeInv_28Quaternion_20const__29,QuatJointRotation__setPreInvCompose_28Quaternion_20const__29,QuatJointRotation__setBendAngle_28float_29,QuatJointRotation__addBendAngle_28float_29,QuatJointRotation__setSplayAngle_28float_29,QuatJointRotation__addSplayAngle_28float_29,QuatJointRotation__setLongitAngle_28float_29,QuatJointRotation__setBendAxis_28Vector_20const__29,QuatJointRotation__setSplayAxis_28Vector_20const__29,QuatJointRotation__setLongitAxis_28Vector_20const__29,QuatJointRotation__print_28_IO_FILE__2c_20short_29_20const,QuatJointRotation__printRotationVRML_28_IO_FILE__2c_20short_29_20const,QuatJointRotation__printAxesVRML_28_IO_FILE__2c_20float_2c_20short_2c_20short_29_20const,QuatJointRotation__setFrom_28QuatJointRotation_20const__29,QuatJointRotation__interpolate_28QuatJointRotation_20const__2c_20QuatJointRotation_20const__2c_20float_29,DynamicArray1_Vector___DynamicArray1_28int_29,DynamicArray_short_2c_20_28short_29_1___DynamicArray_28int_29,DynamicArray1_Vector___clear_28_29,DynamicArray_short_2c_20_28short_29_1___clear_28_29,DynamicArray_short_2c_20_28short_29_1___DynamicArray_28_29,DynamicArray1_Vector___DynamicArray1_28_29,DynamicArray1_Quaternion___DynamicArray1_28_29,DynamicArray1_Quaternion___clear_28_29,ShoulderConstraint__ShoulderConstraint_28_29,XMLCell__element_28char_20const__29,XMLCell__attrib_REAL_28char_20const__2c_20float_29,Vector__Vector_28float_2c_20float_2c_20float_29,XMLCell__attrib_REALVEC3_28Vector__2c_20char_20const__2c_20Vector_20const__29,DynamicArrayP_Joint___DynamicArrayP_28_29,HanimAvatar__LookupJoint_28char_20const__29_20const,__cxa_throw,HanimAvatar__LookupSite_28char_20const__29_20const,DynamicArrayP_Joint___appendElement_28Joint__29,DynamicArray_int_2c_20_1___DynamicArray_28_29,DynamicArray_int_2c_20_1___appendElement_28int_20const__29,DynamicArray_int_2c_20_1___clear_28_29,SiteID__print_28_IO_FILE__29_20const,AvatarNameIndex__AvatarNameIndex_28_29,HashAny_char_20const__2c_20SiteID___HashAny_28SiteID_2c_20int_29,HashAny_char_20const__20const_2c_20AvatarType___HashAny_28AvatarType_2c_20int_29,HashAny_char_20const__2c_20char_20const____HashAny_28char_20const__2c_20int_29,HashChain_char_20const__2c_20SiteID___insert_28HashChainItem_char_20const__2c_20SiteID__29,HashChain_char_20const__20const_2c_20AvatarType___insert_28HashChainItem_char_20const__20const_2c_20AvatarType__29,DynamicArrayP_Site___DynamicArrayP_28_29,DynamicArrayP_Segment___DynamicArrayP_28_29,AvatarJointIndex__AvatarJointIndex_28HanimAvatar__29,AvatarJointNumIndex__AvatarJointNumIndex_28AvatarJointIndex_20const__29,StaticArmData__StaticArmData_28_29,HashAny_SiteID_20const_2c_20Site____HashAny_28Site__2c_20int_29,AvatarTiming__AvatarTiming_28_29,copyString_28char_20const__29,Quaternion__Quaternion_28float_2c_20float_2c_20float_2c_20float_29,HanimAvatar__initialise_28_29,InvertibleDynamicStringArray__length_28_29_20const,HashAny_char_20const__2c_20int___lookupString_28char_20const__29_20const,Joint__Joint_28char_20const__2c_20int_2c_20Joint__2c_20Segment__2c_20DynamicArrayP_Site___29,DynamicArrayP_Joint___setElement_28int_2c_20Joint__29,HashAny_char_20const__2c_20int___addItem_28char_20const__2c_20int_29,InvertibleDynamicStringArray__valueFromIndex_28int_29_20const,Joint__addChildJoint_28Joint__29,Transform__setFrom_28Vector_20const__2c_20Quaternion_20const__29,exit,Joint__computeGlobalFromLocalTransforms_28_29,HanimAvatar__completeQuadSites_28char_20const__2c_20char_20const__2c_20char_20const__2c_20char_20const__29,Site__Site_28char_20const__2c_20int_29,LogTime_28_29,HashAny_char_20const__2c_20SiteID___lookupString_28char_20const__29_20const,eputc_28char_29,Site__print_28_IO_FILE__29_20const,DynamicArrayP_Site___setElement_28int_2c_20Site__29,HashAny_SiteID_20const_2c_20Site____addItem_28SiteID_2c_20Site__29,Joint__addSite_28Site__29,DynamicArray1_Vector___getElement_28int_29_20const,Site__setLocalPosition_28Vector_20const__29,UNIMPLEMENTED_28char_20const__29,Site__printName_28_IO_FILE__29_20const,HanimAvatar__CreateJointIndex_28_29,HanimAvatar__createARPFacePoints_28_29,HanimAvatar__createFacePolygons_28_29,AvatarConstraints__AvatarConstraints_28_29,AvatarConstraints__initialise_28HanimAvatar__29,Segment__Segment_28char_20const__2c_20int_29,DynamicArrayP_Segment___setElement_28int_2c_20Segment__29,MakeSiteID_28Location_2c_20AbsoluteBodySide_2c_20ExtremitySide_2c_20short_2c_20Proximity_2c_20bool_29,HanimAvatar__createQuincunxCentreSite_28SiteID_29,HanimAvatar__duplicateSite_28SiteID_2c_20SiteID_29,DynamicArray1_Quaternion___getElement_28int_29_20const,HashChain_SiteID_20const_2c_20Site____insert_28HashChainItem_SiteID_20const_2c_20Site___29,Site__Site_28char_20const__29,Vector__Vector_28Vector_20const__29_1,TorsoDecollider__TorsoDecollider_28short_29,TorsoCurve__TorsoCurve_28Vector_20const__2c_20Vector_20const__2c_20Vector_20const__2c_20Vector_20const__2c_20Vector_20const__29,DynamicArrayP_Segment___clear_28_29,HashChain_char_20const__2c_20char_20const____insert_28HashChainItem_char_20const__2c_20char_20const___29,Decollider___Decollider_28_29,Decollider___Decollider_28_29_1,Controller__Controller_28ControllerParams_29,Controller__resetVar_28float_29,Controller__new_ref1_28float_29,Controller__update_28float_29,eputs_28char_20const__29,TrajectoryParams__print_28_IO_FILE__29,Trajectory__Trajectory_28_29,Trajectory__Trajectory_28TrajectoryParams_20const__29,SiteIDPair__SiteIDPair_28_29,Mirroring__print_28_IO_FILE__29_20const,SiGMLConstellation__print_28_IO_FILE__29_20const,ArmHandConstellation__print_28_IO_FILE__29_20const,SiteID__defined_28_29_20const,SiteIDPair__defined_28_29_20const,SiteIDPair__print_28_IO_FILE__29_20const,SiteID__isArmHandSite_28_29_20const,MirrorBodySide_28AbsoluteBodySide_29,SiteID__isUndef_28_29_20const,CheckIsHandSite_28SiteID__2c_20bool_29,SiteID__defaultFrom_28SiteID_29,InvertibleStringArray__valueFromIndex_28int_29_20const,SiGMLConstellation__SiGMLConstellation_28_29,OneHGesture__OneHGesture_28bool_2c_20Gesture__29,Gesture__Gesture_28_29,Gesture__Gesture_28char_20const__2c_20HanimAvatar_20const__2c_20bool_29,TwoHandStuff__TwoHandStuff_28_29,TwoHAbstractPosture__TwoHAbstractPosture_28Gesture_20const__29,OneHandStuff__OneHandStuff_28bool_29,SiGMLConstellation__SiGMLConstellation_28SiGMLConstellation_20const__29,ArmHandConstellation__ArmHandConstellation_28SiGMLConstellation_2c_20ArmHandConstellation_20const__2c_20SET_OF_HANDS_2c_20Mirroring_2c_20bool_29,Joint__pathToRoot_28DynamicArrayP_Joint___29,Transform__setZero_28_29,Transform__Transform_28_29,Transform__setInverse_28_29,Joint__getGlobalBoneTranslation_28_29,Transform__setCompose_28Vector_20const__2c_20Quaternion_20const__29,Quaternion__print_28_IO_FILE__2c_20int_29,Transform__setCompose_28Transform_20const__29,Transform__print_28_IO_FILE__2c_20int_29_20const,DynamicArrayP_Gesture___clear_28_29,TargettedMovement__TargettedMovement_28SET_OF_HANDS_2c_20Gesture__29,NoMovement__NoMovement_28SET_OF_HANDS_29,SeqMovement__SeqMovement_28SET_OF_HANDS_29,DynamicArray0_float___DynamicArray0_28float_29,DynamicArrayP_BasicMovement___DynamicArrayP_28_29,ParTimedMorph__ParTimedMorph_28_29,DynamicArrayP_AbstractTimedMorph___DynamicArrayP_28_29,HandleXMLGesture_28void__2c_20XMLCell__29,std____2__basic_string_char_2c_20std____2__char_traits_char__2c_20std____2__allocator_char__20___operator__28char_20const__29,std____2__basic_string_char_2c_20std____2__char_traits_char__2c_20std____2__allocator_char__20___operator___28char_29,std____2__basic_string_char_2c_20std____2__char_traits_char__2c_20std____2__allocator_char__20___operator___28char_20const__29,GestureParser__readXMLFile_28char_20const__2c_20ParserData__29,HashAny_char_20const__2c_20Gesture____lookupString_28char_20const__29_20const,ReportXMLError_28XMLResultCode_2c_20char_20const__29,FailedSiGML_28_29,std____2____compressed_pair_std____2__basic_string_char_2c_20std____2__char_traits_char__2c_20std____2__allocator_char__20_____rep_2c_20std____2__allocator_char__20_____compressed_pair_std____2____default_init_tag_2c_20std____2____default_init_tag__28std____2____default_init_tag___2c_20std____2____default_init_tag___29,HashAny_SiGML_Element_2c_20void_20_28__29_28void__2c_20XMLCell__29___HashAny_28void_20_28__29_28void__2c_20XMLCell__29_2c_20int_29,handle_mocap_sign_28void__2c_20XMLCell__29,handle_bonesanimation_sign_28void__2c_20XMLCell__29,handle_hamgestural_sign_28void__2c_20XMLCell__29,handle_gloss_sign_28void__2c_20XMLCell__29,DynamicArrayP_Gesture___DynamicArrayP_28_29,DynamicArrayP_BasicMovement___clear_28_29,DynamicArray1_DynamicArray1_AtomicNonmanual_____DynamicArray1_28int_29,DynamicArray1_AtomicNonmanual___DynamicArray1_28int_29,HashAny_int_2c_20int___lookupString_28int_29_20const,handle_nonmanual_item_28AtomicNonmanual__2c_20NonmanualItems_2c_20XMLCell__29,DynamicArray1_AtomicNonmanual___appendElement_28AtomicNonmanual_20const__29,DynamicArray1_AtomicNonmanual___DynamicArray1_28_29,DynamicArray1_DynamicArray1_AtomicNonmanual_____appendElement_28DynamicArray1_AtomicNonmanual___20const__29,HashChain_char_20const__2c_20Gesture____insert_28HashChainItem_char_20const__2c_20Gesture___29,DynamicArray1_DynamicArray1_AtomicNonmanual_____clear_28_29,DynamicArray1_AtomicNonmanual___clear_28_29,HashChain_SiGML_Element_2c_20void_20_28__29_28void__2c_20XMLCell__29___insert_28HashChainItem_SiGML_Element_2c_20void_20_28__29_28void__2c_20XMLCell__29__29,CompoundMovement___CompoundMovement_28_29,CompoundMovement___CompoundMovement_28_29_1,BasicMovement__setBodyPart_28Location_29,BasicMovement__setOwnMotionAttributes_28MotionAttributes_20const__29,BasicMovement__setAvatarDependentValues_28Gesture_20const__2c_20TwoHAbstractPosture__29,BasicMovement__propagateHandStuff_28TwoHandStuff__2c_20ArmHandConstellation__29,BasicMovement__propagateChangeFlags_28PostureChangeFlags_2c_20PostureChangeFlags_29,BasicMovement__setFinalHandStuff_28TwoHandStuff_20const__2c_20ArmHandConstellation_20const__29,BasicMovement__FinaliseGestures_28_29,BasicMovement__setInitialPosture_28TwoHConcretePosture_20const__29,BasicMovement__set1FinalPos_28Vector_20const__2c_20bool_29,BasicMovement__setFinalPos_28Vector_20const__2c_20Vector_20const__29,BasicMovement__offset1FinalPos_28Vector_20const__2c_20bool_29,BasicMovement__offsetFinalPos_28Vector_20const__2c_20Vector_20const__29,BasicMovement__GetCurrentPosture_28TwoHConcretePosture__2c_20float_2c_20bool_29,BasicMovement__setDuration_28float_2c_20bool_29,BasicMovement__UseExplicitDuration_28_29,BasicMovement__print_28_IO_FILE__29_20const,BasicMovement__printTopLevelSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29_20const,BasicMovement__printSiGMLAttribs_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20bool_29_20const,CalcThumbBending_28ThumbBending__2c_20HandshapeType_2c_20BendSource_2c_20FingerbendType_2c_20FingerBending_2c_20FingerbendType_2c_20ThumbBending_2c_20ThumbbendType_29,ThumbBending__setAdd_28ThumbBending_20const__29,printFingerbendCode_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20FingerBending_2c_20char_20const__29,printThumbbendCode_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20ThumbBending_2c_20char_20const__29,HandJointRotations__HandJointRotations_28bool_2c_20Gesture_20const__29,SiGMLHandshape__SiGMLHandshape_28_29,SeqTimedMorph__SeqTimedMorph_28_29,AtomicTimedMorph__AtomicTimedMorph_28_29,CharToMorphTime_28char_29,CharToMorphAnchoring_28char_2c_20bool_29,TokenStream__TokeniseString_28char_20const__29,TokenStream__nextToken_28_29,StringToAnchoring_28char_20const__2c_20bool_29,StringToMorphTime_28char__29,DynamicArrayP_AbstractTimedMorph___clear_28_29,Handshape__Handshape_28bool_2c_20Gesture__29,OneHAbstractPosture__OneHAbstractPosture_28OneHAbstractPosture_20const__29,ConstellationInfo__ConstellationInfo_28_29,calcLeadFractions_28float__2c_20float_2c_20PostureChangeFlags_2c_20PostureChangeTiming_2c_20bool_29,SiteIDPair__isUndef_28_29_20const,isArmHandLocation_28int_29,HanimAvatar__siteStdDistance_28SiteIDPair_20const__29_20const,OneHConcretePosture__setCopyRest_28OneHConcretePosture_20const__29,DynamicArray1_AtomicNonmanual___getElement_28int_29_20const,DynamicArray1_AbstractTimedMorph____clear_28_29,AtomicTimedMorph__AtomicTimedMorph_28int_2c_20float_2c_20float_2c_20float_2c_20char_20const__29,DynamicArray1_AbstractTimedMorph____DynamicArray1_28int_29,HashAny_char_20const__2c_20AbstractTimedMorph____HashAny_28AbstractTimedMorph__2c_20int_29,DynamicArray1_AbstractTimedMorph____DynamicArray1_28_29,ANMtoATM_28AtomicNonmanual_29,ParTimedMorph__appendElement_28AbstractTimedMorph__29,AtomicNonmanual__printSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29_20const,TwoHDirMoveSpec__TwoHDirMoveSpec_28_29,DirectedMovement__operator__28DirectedMovement_20const__29,DirectedMovement__DirectedMovement_28DirectedMovement_20const__29,TwoHCircMoveSpec__TwoHCircMoveSpec_28_29,CircularMovement__operator__28CircularMovement_20const__29,OneHCircMoveSpec__OneHCircMoveSpec_28_29,CircularMovement__CircularMovement_28CircularMovement_20const__29,NoMovement__NoMovement_28NoMovement_20const__29,WristMovement__WristMovement_28WristMovement_20const__29,FingerPlayMovement__FingerPlayMovement_28FingerPlayMovement_20const__29,RepSpec__RepSpec_28_29,RepeatMovement__operator__28RepeatMovement_20const__29,RepeatMovement__RepeatMovement_28RepeatMovement_20const__29,ArmHandConstellation__ArmHandConstellation_28ArmHandConstellation_20const__29,OneHandStuff__OneHandStuff_28OneHandStuff_20const__29,Gesture__CopyGesture_28_29_20const,TargettedMovement__TargettedMovement_28TargettedMovement_20const__29,makeContact_28SiteIDPair_2c_20SiteID_29,Gesture__printPostureSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20PostureChangeFlags_2c_20PostureChangeFlags_29_20const,DynamicArrayP_BasicMovement___setElement_28int_2c_20BasicMovement__29,ParMovement__ParMovement_28ParMovement_20const__29,TwoHConcretePosture__print_28_IO_FILE__29_20const,TwoHandStuff__TwoHandStuff_28TwoHandStuff_20const__29,TwoHandStuff__update_28TwoHandStuff_20const__29,ArmHandConstellation__updateFrom_28ArmHandConstellation_20const__29,InstallParPosture_28Vector__2c_20Vector__2c_20OneHConcretePosture__2c_20PostureChangeFlags_20const__2c_20OneHConcretePosture_20const__2c_20Vector_20const__29,SeqMovement__SeqMovement_28SeqMovement_20const__29,TwoHConcretePosture__setCopyRest_28TwoHConcretePosture_20const__29,TwoHAbstractPosture__operator__28TwoHAbstractPosture_20const__29,BasicMovement__scaleDuration_28float_2c_20bool_29,DynamicArray0_float___appendElement_28float_20const__29,TwoHConcretePostureChange__print_28_IO_FILE__29_20const,TwoHConcretePosture__totallyDefined_28SET_OF_HANDS_29_20const,TwoHConcretePostureChange__printFinalUndefined_28_IO_FILE__2c_20SET_OF_HANDS_29_20const,ConstellationInfo__ConstellationInfo_28ConstellationInfo_20const__29,SplitMovement__SplitMovement_28BasicMovement__2c_20BasicMovement__29,SplitMovement__SplitMovement_28SplitMovement_20const__29,OneHandStuff__update_28OneHandStuff_20const__29,OneHConcretePosture__OneHConcretePosture_28OneHConcretePosture_20const__29,DynamicArrayP_BasicMovement___appendElements_28DynamicArrayP_BasicMovement___29,DynamicArrayP_BasicMovement___appendElement_28BasicMovement__29,MergeTgts_28DynamicArrayP_BasicMovement___29,ParMovement__ParMovement_28SET_OF_HANDS_29,RepeatMovement__RepeatMovement_28SET_OF_HANDS_29,DirectedMovement__DirectedMovement_28SET_OF_HANDS_29,CircularMovement__CircularMovement_28SET_OF_HANDS_29,WristMovement__WristMovement_28SET_OF_HANDS_29,FingerPlayMovement__FingerPlayMovement_28SET_OF_HANDS_29,SiGML__convertAttributeH_28InvertibleStringArray_20const__2c_20char_20const__29,MannerFlags__setManner_28Manner_29,SiGML__convertboolfalse_28char_20const__29,Direction3__Direction3_28char_20const__29,Direction3__handedVector_28bool_29,Direction3__operator__28Direction3_20const__29,Direction2__Direction2_28char_20const__29,Direction2__handedVector_28bool_29,Direction2__operator__28Direction2_20const__29,Direction2__EllipseDirection_28char_20const__29,Direction2__set_handedVector_28bool_29,Direction3__handedAxis_28bool_29,DynamicArray0_float___clear_28_29,HashChain_char_20const__2c_20AbstractTimedMorph____insert_28HashChainItem_char_20const__2c_20AbstractTimedMorph___29,AbstractTimedMorph___AbstractTimedMorph_28_29,AtomicTimedMorph___AtomicTimedMorph_28_29,AtomicTimedMorph__newCopy_28_29_20const,AtomicTimedMorph__CalcTiming_28float_29,AtomicTimedMorph__fillMorphFrame_28float_2c_20float__2c_20bool_29_20const,AbstractTimedMorph__setDuration_28float_29,AtomicTimedMorph__scaleAmount_28float_29,AtomicTimedMorph__scaleDuration_28float_29,AtomicTimedMorph__setStart_28float_29,AtomicTimedMorph__shiftStart_28float_29,AtomicTimedMorph__print_28_IO_FILE__29_20const,AtomicTimedMorph__printIndented_28_IO_FILE__2c_20int_29_20const,AbstractTimedMorph__rescale_28float_2c_20float_2c_20float_29,AbstractTimedMorph__rescale_28XMLCell__29,BasicMovement___BasicMovement_28_29,BasicMovement___BasicMovement_28_29_1,NonmanualMovement___NonmanualMovement_28_29,NonmanualMovement___NonmanualMovement_28_29_1,NonmanualMovement__print_28_IO_FILE__29_20const,NonmanualMovement__printSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29_20const,NonmanualMovement__printSiGMLAttribs_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20bool_29_20const,DirectedMovement___DirectedMovement_28_29,DirectedMovement__CopyMovement_28_29_20const,DirectedMovement__setBodyPart_28Location_29,DirectedMovement__setOwnMotionAttributes_28MotionAttributes_20const__29,DirectedMovement__setAvatarDependentValues_28Gesture_20const__2c_20TwoHAbstractPosture__29,DirectedMovement__propagateHandStuff_28TwoHandStuff__2c_20ArmHandConstellation__29,DirectedMovement__offset1FinalPos_28Vector_20const__2c_20bool_29,DirectedMovement__GetCurrentPosture_28TwoHConcretePosture__2c_20float_2c_20bool_29,DirectedMovement__print_28_IO_FILE__29_20const,DirectedMovement__printSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29_20const,DirectedMovement__printSiGMLAttribs_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20bool_29_20const,CircularMovement___CircularMovement_28_29,CircularMovement___CircularMovement_28_29_1,CircularMovement__CopyMovement_28_29_20const,CircularMovement__setBodyPart_28Location_29,CircularMovement__setOwnMotionAttributes_28MotionAttributes_20const__29,CircularMovement__setAvatarDependentValues_28Gesture_20const__2c_20TwoHAbstractPosture__29,CircularMovement__set1FinalPos_28Vector_20const__2c_20bool_29,CircularMovement__offset1FinalPos_28Vector_20const__2c_20bool_29,CircularMovement__GetCurrentPosture_28TwoHConcretePosture__2c_20float_2c_20bool_29,CircularMovement__print_28_IO_FILE__29_20const,CircularMovement__printSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29_20const,CircularMovement__printSiGMLAttribs_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20bool_29_20const,NoMovement___NoMovement_28_29,NoMovement__CopyMovement_28_29_20const,NoMovement__setOwnMotionAttributes_28MotionAttributes_20const__29,NoMovement__setAvatarDependentValues_28Gesture_20const__2c_20TwoHAbstractPosture__29,NoMovement__setInitialPosture_28TwoHConcretePosture_20const__29,NoMovement__print_28_IO_FILE__29_20const,NoMovement__printSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29_20const,NoMovement__printSiGMLAttribs_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20bool_29_20const,WristMovement___WristMovement_28_29,WristMovement__CopyMovement_28_29_20const,WristMovement__setOwnMotionAttributes_28MotionAttributes_20const__29,WristMovement__setAvatarDependentValues_28Gesture_20const__2c_20TwoHAbstractPosture__29,WristMovement__set1FinalPos_28Vector_20const__2c_20bool_29,WristMovement__offset1FinalPos_28Vector_20const__2c_20bool_29,WristMovement__GetCurrentPosture_28TwoHConcretePosture__2c_20float_2c_20bool_29,WristMovement__print_28_IO_FILE__29_20const,WristMovement__printSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29_20const,WristMovement__printSiGMLAttribs_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20bool_29_20const,FingerPlayMovement___FingerPlayMovement_28_29,FingerPlayMovement__CopyMovement_28_29_20const,FingerPlayMovement__setOwnMotionAttributes_28MotionAttributes_20const__29,FingerPlayMovement__setAvatarDependentValues_28Gesture_20const__2c_20TwoHAbstractPosture__29,FingerPlayMovement__set1FinalPos_28Vector_20const__2c_20bool_29,FingerPlayMovement__offset1FinalPos_28Vector_20const__2c_20bool_29,FingerPlayMovement__GetCurrentPosture_28TwoHConcretePosture__2c_20float_2c_20bool_29,FingerPlayMovement__print_28_IO_FILE__29_20const,FingerPlayMovement__printSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29_20const,FingerPlayMovement__printSiGMLAttribs_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20bool_29_20const,RepeatMovement___RepeatMovement_28_29,RepeatMovement___RepeatMovement_28_29_1,RepeatMovement__CopyMovement_28_29_20const,RepeatMovement__setBodyPart_28Location_29,RepeatMovement__setOwnMotionAttributes_28MotionAttributes_20const__29,RepeatMovement__setAvatarDependentValues_28Gesture_20const__2c_20TwoHAbstractPosture__29,RepeatMovement__propagateHandStuff_28TwoHandStuff__2c_20ArmHandConstellation__29,RepeatMovement__propagateChangeFlags_28PostureChangeFlags_2c_20PostureChangeFlags_29,RepeatMovement__setFinalHandStuff_28TwoHandStuff_20const__2c_20ArmHandConstellation_20const__29,RepeatMovement__FinaliseGestures_28_29,RepeatMovement__GetCurrentPosture_28TwoHConcretePosture__2c_20float_2c_20bool_29,RepeatMovement__setDuration_28float_2c_20bool_29,RepeatMovement__print_28_IO_FILE__29_20const,RepeatMovement__printSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29_20const,RepeatMovement__printSiGMLAttribs_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20bool_29_20const,TargettedMovement___TargettedMovement_28_29,TargettedMovement___TargettedMovement_28_29_1,TargettedMovement__CopyMovement_28_29_20const,TargettedMovement__setBodyPart_28Location_29,TargettedMovement__setOwnMotionAttributes_28MotionAttributes_20const__29,TargettedMovement__setAvatarDependentValues_28Gesture_20const__2c_20TwoHAbstractPosture__29,TargettedMovement__propagateHandStuff_28TwoHandStuff__2c_20ArmHandConstellation__29,TargettedMovement__setFinalHandStuff_28TwoHandStuff_20const__2c_20ArmHandConstellation_20const__29,TargettedMovement__FinaliseGestures_28_29,TargettedMovement__GetCurrentPosture_28TwoHConcretePosture__2c_20float_2c_20bool_29,TargettedMovement__print_28_IO_FILE__29_20const,TargettedMovement__printSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29_20const,TargettedMovement__printSiGMLAttribs_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20bool_29_20const,ParMovement___ParMovement_28_29,ParMovement__CopyMovement_28_29_20const,ParMovement__setBodyPart_28Location_29,ParMovement__setOwnMotionAttributes_28MotionAttributes_20const__29,ParMovement__setAvatarDependentValues_28Gesture_20const__2c_20TwoHAbstractPosture__29,ParMovement__propagateHandStuff_28TwoHandStuff__2c_20ArmHandConstellation__29,ParMovement__propagateChangeFlags_28PostureChangeFlags_2c_20PostureChangeFlags_29,ParMovement__setFinalHandStuff_28TwoHandStuff_20const__2c_20ArmHandConstellation_20const__29,ParMovement__FinaliseGestures_28_29,ParMovement__set1FinalPos_28Vector_20const__2c_20bool_29,ParMovement__offset1FinalPos_28Vector_20const__2c_20bool_29,ParMovement__GetCurrentPosture_28TwoHConcretePosture__2c_20float_2c_20bool_29,ParMovement__setDuration_28float_2c_20bool_29,ParMovement__print_28_IO_FILE__29_20const,ParMovement__printSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29_20const,ParMovement__printSiGMLAttribs_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20bool_29_20const,SeqMovement___SeqMovement_28_29,SeqMovement___SeqMovement_28_29_1,SeqMovement__CopyMovement_28_29_20const,SeqMovement__setBodyPart_28Location_29,SeqMovement__setOwnMotionAttributes_28MotionAttributes_20const__29,SeqMovement__setAvatarDependentValues_28Gesture_20const__2c_20TwoHAbstractPosture__29,SeqMovement__propagateHandStuff_28TwoHandStuff__2c_20ArmHandConstellation__29,SeqMovement__propagateChangeFlags_28PostureChangeFlags_2c_20PostureChangeFlags_29,SeqMovement__setFinalHandStuff_28TwoHandStuff_20const__2c_20ArmHandConstellation_20const__29,SeqMovement__FinaliseGestures_28_29,SeqMovement__setInitialPosture_28TwoHConcretePosture_20const__29,SeqMovement__set1FinalPos_28Vector_20const__2c_20bool_29,SeqMovement__offset1FinalPos_28Vector_20const__2c_20bool_29,SeqMovement__GetCurrentPosture_28TwoHConcretePosture__2c_20float_2c_20bool_29,SeqMovement__setDuration_28float_2c_20bool_29,SeqMovement__print_28_IO_FILE__29_20const,SeqMovement__printTopLevelSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29_20const,SeqMovement__printSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29_20const,SeqMovement__printSiGMLAttribs_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20bool_29_20const,SplitMovement___SplitMovement_28_29,SplitMovement___SplitMovement_28_29_1,SplitMovement__CopyMovement_28_29_20const,SplitMovement__setBodyPart_28Location_29,SplitMovement__setAvatarDependentValues_28Gesture_20const__2c_20TwoHAbstractPosture__29,SplitMovement__propagateHandStuff_28TwoHandStuff__2c_20ArmHandConstellation__29,SplitMovement__propagateChangeFlags_28PostureChangeFlags_2c_20PostureChangeFlags_29,SplitMovement__setFinalHandStuff_28TwoHandStuff_20const__2c_20ArmHandConstellation_20const__29,SplitMovement__FinaliseGestures_28_29,SplitMovement__setInitialPosture_28TwoHConcretePosture_20const__29,SplitMovement__set1FinalPos_28Vector_20const__2c_20bool_29,SplitMovement__offset1FinalPos_28Vector_20const__2c_20bool_29,SplitMovement__GetCurrentPosture_28TwoHConcretePosture__2c_20float_2c_20bool_29,SplitMovement__setDuration_28float_2c_20bool_29,SplitMovement__print_28_IO_FILE__29_20const,SplitMovement__printSiGML_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___29_20const,SplitMovement__printSiGMLAttribs_28std____2__basic_ostream_char_2c_20std____2__char_traits_char__20___2c_20bool_29_20const,AbstractTimedMorph___AbstractTimedMorph_28_29_1,AbstractTimedMorph__scaleDuration_28float_29,AbstractTimedMorph__setStart_28float_29,AbstractTimedMorph__shiftStart_28float_29,ParTimedMorph___ParTimedMorph_28_29,ParTimedMorph___ParTimedMorph_28_29_1,ParTimedMorph__newCopy_28_29_20const,ParTimedMorph__CalcTiming_28float_29,ParTimedMorph__fillMorphFrame_28float_2c_20float__2c_20bool_29_20const,ParTimedMorph__scaleAmount_28float_29,ParTimedMorph__scaleDuration_28float_29,ParTimedMorph__shiftStart_28float_29,ParTimedMorph__print_28_IO_FILE__29_20const,ParTimedMorph__printIndented_28_IO_FILE__2c_20int_29_20const,SeqTimedMorph___SeqTimedMorph_28_29,SeqTimedMorph___SeqTimedMorph_28_29_1,SeqTimedMorph__newCopy_28_29_20const,SeqTimedMorph__CalcTiming_28float_29,SeqTimedMorph__fillMorphFrame_28float_2c_20float__2c_20bool_29_20const,SeqTimedMorph__scaleAmount_28float_29,SeqTimedMorph__scaleDuration_28float_29,SeqTimedMorph__shiftStart_28float_29,SeqTimedMorph__print_28_IO_FILE__29_20const,SeqTimedMorph__printIndented_28_IO_FILE__2c_20int_29_20const,OneHGesture__ConcreteLocateSite_28Vector__2c_20SiteIDPair_29,CannedHandshape__CannedHandshape_28_29,__cxx_global_array_dtor,__cxx_global_array_dtor_10,__cxx_global_array_dtor_12,__cxx_global_array_dtor_14,HashAny_int_2c_20int___HashAny_28int_2c_20int_29,XMLCell__attrib_string_28char_20const__29,FingerBending__FingerBending_28char_20const__29,MakeDigits_28char_20const__29,CannedHandshape__CannedHandshape_28FingerBending_2c_20FingerBending_2c_20ThumbbendType_2c_20ThumbBending_2c_20ThumbbendType_2c_20ThumbBending_2c_20ThumbbendType_2c_20ThumbBending_2c_20ThumbbendType_2c_20ThumbBending_2c_20ThumbbendType_2c_20ThumbBending_2c_20short_2c_20HandshapeClass_29,SpecialHandshapes__SpecialHandshapes_28_29,HashAny_char_20const__2c_20HashAny_char_20const__2c_20int_____HashAny_28HashAny_char_20const__2c_20int___2c_20int_29,std____2__basic_string_char_2c_20std____2__char_traits_char__2c_20std____2__allocator_char__20___basic_string_28std____2__basic_string_char_2c_20std____2__char_traits_char__2c_20std____2__allocator_char__20__20const__29,appendIntToString_28std____2__basic_string_char_2c_20std____2__char_traits_char__2c_20std____2__allocator_char__20__2c_20int_29,HashChain_int_2c_20int___insert_28HashChainItem_int_2c_20int__29,HashChain_char_20const__2c_20HashAny_char_20const__2c_20int_____insert_28HashChainItem_char_20const__2c_20HashAny_char_20const__2c_20int____29,DynamicArrayP_XMLCell___DynamicArrayP_28_29,XMLCell__clear_28_29,DynamicArrayP_XMLCell___clear_28_29,DynamicArrayP_char_20const___appendElement_28char_20const__29,XML_ParserCreate,XML_SetElementHandler,Expat_start_28void__2c_20char_20const__2c_20char_20const___29,Expat_end_28void__2c_20char_20const__29,XML_SetUserData,XMLCell__XMLCell_28char__29,XML_ParserFree,ExpatWrapper__ExpatWrapper_28_29,HashAny_char_20const__2c_20char_20const____lookupString_28char_20const__29_20const,HashAny_char_20const__2c_20char_20const____addItem_28char_20const__2c_20char_20const__29,DynamicArrayP_XMLCell___appendElement_28XMLCell__29,DynamicArrayP_XMLCell___setElement_28int_2c_20XMLCell__29,XMLCell__mergeXMLCell_28XMLCell_20const__29,XMLWrapper___XMLWrapper_28_29,XMLWrapper___XMLWrapper_28_29_1,ExpatWrapper___ExpatWrapper_28_29,ExpatWrapper___ExpatWrapper_28_29_1,ExpatWrapper__ParseFile_28_IO_FILE__29,ExpatWrapper__ParseString_28char_20const__29,AnimgenInstance__AnimgenInstance_28int_29,AGIStatusCallback_28void__2c_20AnimgenStatus_2c_20int_29,AGISignStartCallback_28void__2c_20char_20const__2c_20int_2c_20int_29,AGIFrameCallback_28void__2c_20SSFrame__29,AGIPostMortemCallback_28void__2c_20PostMortem__29,InitVersionInfo,VersionString_28_29,VersionDate_28_29,__clock,Getopts__Getopts_28_29,setupOptions_28Getopts__29,Getopts__processArgs_28char_20const___29,ProcessOptions_28Getopts__29,Getopts__printValue_28_IO_FILE__29,BuildTables_28_29,BuildHanimAvatar_28_29,HashAny_char_20const__2c_20Gesture____HashAny_28Gesture__2c_20int_29,CreateWaitGesture_28_29,ZeroPostMortem,InitHanimAnimator_28_29,ASDdata__ASDdata_28char_20const__2c_20bool_29,HanimAvatar__HanimAvatar_28ASDdata_20const__29,GestureParser__readXMLXML_28XMLCell__2c_20ParserData__2c_20Gesture___29,Gesture__InitPosture_28TwoHConcretePosture__29,HanimAnimationRecord__HanimAnimationRecord_28_29,GestureParser__readXMLString_28char_20const__2c_20ParserData__29,totalTime_28DynamicArrayP_Gesture__20const__29,dlmalloc,dlrealloc,dlfree,prologInitProcessor,prologProcessor,errorProcessor,contentProcessor,cdataSectionProcessor,epilogProcessor,externalEntityContentProcessor,internalEntityProcessor,prolog0,prolog1,doctype0,error,doctype1,internalSubset,prolog2,doctype3,doctype2,entity0,attlist0,element0,notation0,doctype5,doctype4,entity1,entity2,attlist1,element1,notation1,entity7,entity4,entity3,declClose,attlist2,element2,notation3,notation2,entity9,entity8,entity5,entity10,entity6,attlist8,attlist5,attlist3,attlist9,attlist6,attlist4,attlist7,element3,element6,element7,element4,element5,notation4,unknown_isInvalid,unknown_isNmstrt,unknown_isName,unknown_toUtf16,unknown_toUtf8,initUpdatePosition,initScanContent,initScanProlog,normal_prologTok,normal_contentTok,normal_cdataSectionTok,normal_attributeValueTok,normal_entityValueTok,normal_sameName,normal_nameMatchesAscii,normal_nameLength,normal_skipS,normal_getAtts,normal_charRefNumber,normal_predefinedEntityName,normal_updatePosition,normal_isPublicId,latin1_toUtf8,latin1_toUtf16,utf8_toUtf8,utf8_toUtf16,utf8_isName2,utf8_isName3,isNever,utf8_isNmstrt2,utf8_isNmstrt3,utf8_isInvalid2,utf8_isInvalid3,utf8_isInvalid4,big2_prologTok,big2_contentTok,big2_cdataSectionTok,big2_attributeValueTok,big2_entityValueTok,big2_sameName,big2_nameMatchesAscii,big2_nameLength,big2_skipS,big2_getAtts,big2_charRefNumber,big2_predefinedEntityName,big2_updatePosition,big2_isPublicId,big2_toUtf8,big2_toUtf16,little2_prologTok,little2_contentTok,little2_cdataSectionTok,little2_attributeValueTok,little2_entityValueTok,little2_sameName,little2_nameMatchesAscii,little2_nameLength,little2_skipS,little2_getAtts,little2_charRefNumber,little2_predefinedEntityName,little2_updatePosition,little2_isPublicId,little2_toUtf8,little2_toUtf16,ascii_toUtf8,__stdio_seek,__stdio_write,__stdio_read,__stdio_close,__emscripten_stdout_close,__emscripten_stdout_seek,fmt_fp,pop_arg_long_double,sn_write,string_read,std____2__basic_streambuf_char_2c_20std____2__char_traits_char__20___pubsync_28_29,std____2__basic_ios_char_2c_20std____2__char_traits_char__20___good_28_29_20const,std____2__ios_base__getloc_28_29_20const,std____2__num_put_char_2c_20std____2__ostreambuf_iterator_char_2c_20std____2__char_traits_char__20__20__20const__20std____2__use_facet_std____2__num_put_char_2c_20std____2__ostreambuf_iterator_char_2c_20std____2__char_traits_char__20__20__20__28std____2__locale_20const__29,std____2__num_put_char_2c_20std____2__ostreambuf_iterator_char_2c_20std____2__char_traits_char__20__20___put_28std____2__ostreambuf_iterator_char_2c_20std____2__char_traits_char__20__2c_20std____2__ios_base__2c_20char_2c_20long_29_20const,std____2__num_put_char_2c_20std____2__ostreambuf_iterator_char_2c_20std____2__char_traits_char__20__20___put_28std____2__ostreambuf_iterator_char_2c_20std____2__char_traits_char__20__2c_20std____2__ios_base__2c_20char_2c_20double_29_20const,std__bad_cast___bad_cast_28_29,__cxx_global_array_dtor_1,std____2__ios_base__failure__failure_28char_20const__2c_20std____2__error_code_20const__29,std____2__ios_base__failure___failure_28_29,std____2__error_category___error_category_28_29,std____2____iostream_category_____iostream_category_28_29,std____2____iostream_category__name_28_29_20const,std____2__error_category__default_error_condition_28int_29_20const,std____2__error_category__equivalent_28int_2c_20std____2__error_condition_20const__29_20const,std____2__error_category__equivalent_28std____2__error_code_20const__2c_20int_29_20const,std____2____iostream_category__message_28int_29_20const,std____2__ios_base__failure___failure_28_29_1,std__runtime_error__what_28_29_20const,std____2__locale__id____init_28_29,void_20std____2____call_once_proxy_std____2__tuple_std____2___28anonymous_20namespace_29____fake_bind____20__28void__29,std____2____libcpp_mutex_unlock_28pthread_mutex_t__29,std____2____libcpp_mutex_lock_28pthread_mutex_t__29,std____2____libcpp_condvar_broadcast_28pthread_cond_t__29,__cxa_rethrow,std__exception___exception_28_29,std____2____libcpp_refstring____libcpp_refstring_28char_20const__29,std____2__basic_string_char_2c_20std____2__char_traits_char__2c_20std____2__allocator_char__20___operator___28std____2__basic_string_char_2c_20std____2__char_traits_char__2c_20std____2__allocator_char__20__20const__29,std____2__system_error____init_28std____2__error_code_20const__2c_20std____2__basic_string_char_2c_20std____2__char_traits_char__2c_20std____2__allocator_char__20__29,std__runtime_error__runtime_error_28std____2__basic_string_char_2c_20std____2__char_traits_char__2c_20std____2__allocator_char__20__20const__29,std____2__system_error___system_error_28_29,std____2__system_error___system_error_28_29_1,abort,abort_message,__cxxabiv1____shim_type_info_____shim_type_info_28_29,__cxxabiv1____class_type_info_____class_type_info_28_29,__cxxabiv1____shim_type_info__noop1_28_29_20const,__cxxabiv1____shim_type_info__noop2_28_29_20const,__cxxabiv1____class_type_info__can_catch_28__cxxabiv1____shim_type_info_20const__2c_20void___29_20const,__cxxabiv1____class_type_info__search_above_dst_28__cxxabiv1____dynamic_cast_info__2c_20void_20const__2c_20void_20const__2c_20int_2c_20bool_29_20const,__cxxabiv1____class_type_info__search_below_dst_28__cxxabiv1____dynamic_cast_info__2c_20void_20const__2c_20int_2c_20bool_29_20const,__cxxabiv1____class_type_info__has_unambiguous_public_base_28__cxxabiv1____dynamic_cast_info__2c_20void__2c_20int_29_20const,__cxxabiv1____si_class_type_info_____si_class_type_info_28_29,__cxxabiv1____si_class_type_info__search_above_dst_28__cxxabiv1____dynamic_cast_info__2c_20void_20const__2c_20void_20const__2c_20int_2c_20bool_29_20const,__cxxabiv1____si_class_type_info__search_below_dst_28__cxxabiv1____dynamic_cast_info__2c_20void_20const__2c_20int_2c_20bool_29_20const,__cxxabiv1____si_class_type_info__has_unambiguous_public_base_28__cxxabiv1____dynamic_cast_info__2c_20void__2c_20int_29_20const,__cxxabiv1____vmi_class_type_info_____vmi_class_type_info_28_29,__cxxabiv1____vmi_class_type_info__search_above_dst_28__cxxabiv1____dynamic_cast_info__2c_20void_20const__2c_20void_20const__2c_20int_2c_20bool_29_20const,__cxxabiv1____vmi_class_type_info__search_below_dst_28__cxxabiv1____dynamic_cast_info__2c_20void_20const__2c_20int_2c_20bool_29_20const,__cxxabiv1____vmi_class_type_info__has_unambiguous_public_base_28__cxxabiv1____dynamic_cast_info__2c_20void__2c_20int_29_20const,std__bad_alloc___bad_alloc_28_29,std__bad_alloc__what_28_29_20const,std__exception___exception_28_29_1,std__exception__what_28_29_20const,std__logic_error___logic_error_28_29_1,std__logic_error__what_28_29_20const,std__runtime_error___runtime_error_28_29,std__runtime_error___runtime_error_28_29_1,std__length_error___length_error_28_29,std__bad_cast___bad_cast_28_29_1,std__bad_cast__what_28_29_20const]);function __wasm_memory_size(){return buffer.byteLength/65536|0;}function __wasm_memory_grow(pagesToAdd){pagesToAdd=pagesToAdd|0;var oldPages=__wasm_memory_size()|0;var newPages=oldPages+pagesToAdd|0;if(oldPages<newPages&&newPages<65536){var newBuffer=new ArrayBuffer(Math_imul(newPages,65536));var newHEAP8=new Int8Array(newBuffer);newHEAP8.set(HEAP8);HEAP8=new Int8Array(newBuffer);HEAP16=new Int16Array(newBuffer);HEAP32=new Int32Array(newBuffer);HEAPU8=new Uint8Array(newBuffer);HEAPU16=new Uint16Array(newBuffer);HEAPU32=new Uint32Array(newBuffer);HEAPF32=new Float32Array(newBuffer);HEAPF64=new Float64Array(newBuffer);buffer=newBuffer;memory.buffer=buffer;bufferView=HEAPU8;}return oldPages;}return{"__wasm_call_ctors":__wasm_call_ctors,"__indirect_function_table":FUNCTION_TABLE,"malloc":dlmalloc,"free":dlfree,"animgenInit":animgenInit,"animgenAllocate":animgenAllocate,"animgenSetOutput":animgenSetOutput,"animgenSetAvatar":animgenSetAvatar,"animgenSetSequence":animgenSetSequence,"animgenGenerateFrames":animgenGenerateFrames,"animgenDeAllocate":animgenDeAllocate,"animgenTerminate":animgenTerminate,"__errno_location":__errno_location,"setThrew":setThrew,"stackSave":stackSave,"stackRestore":stackRestore,"stackAlloc":stackAlloc,"__cxa_can_catch":__cxa_can_catch,"__cxa_is_pointer_type":__cxa_is_pointer_type,"dynCall_jiji":legalstub$dynCall_jiji};}return asmFunc(asmLibraryArg);}// EMSCRIPTEN_END_ASM
(asmLibraryArg);},instantiate:/** @suppress{checkTypes} */function(binary,info){return{then:function(ok){var module=new WebAssembly.Module(binary);ok({'instance':new WebAssembly.Instance(module)});}};},RuntimeError:Error};// We don't need to actually download a wasm binary, mark it as present but empty.
wasmBinary=[];// end include: wasm2js.js
if(typeof WebAssembly!='object'){abort('no native wasm support detected');}// include: runtime_safe_heap.js
// In MINIMAL_RUNTIME, setValue() and getValue() are only available when
// building with safe heap enabled, for heap safety checking.
// In traditional runtime, setValue() and getValue() are always available
// (although their use is highly discouraged due to perf penalties)
/** @param {number} ptr
@param {number} value
@param {string} type
@param {number|boolean=} noSafe */function setValue(ptr,value,type='i8',noSafe){if(type.endsWith('*'))type='i32';switch(type){case'i1':HEAP8[ptr>>0]=value;break;case'i8':HEAP8[ptr>>0]=value;break;case'i16':HEAP16[ptr>>1]=value;break;case'i32':HEAP32[ptr>>2]=value;break;case'i64':tempI64=[value>>>0,(tempDouble=value,+Math.abs(tempDouble)>=1.0?tempDouble>0.0?(Math.min(+Math.floor(tempDouble/4294967296.0),4294967295.0)|0)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296.0)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case'float':HEAPF32[ptr>>2]=value;break;case'double':HEAPF64[ptr>>3]=value;break;default:abort('invalid type for setValue: '+type);}}/** @param {number} ptr
@param {string} type
@param {number|boolean=} noSafe */function getValue(ptr,type='i8',noSafe){if(type.endsWith('*'))type='i32';switch(type){case'i1':return HEAP8[ptr>>0];case'i8':return HEAP8[ptr>>0];case'i16':return HEAP16[ptr>>1];case'i32':return HEAP32[ptr>>2];case'i64':return HEAP32[ptr>>2];case'float':return HEAPF32[ptr>>2];case'double':return Number(HEAPF64[ptr>>3]);default:abort('invalid type for getValue: '+type);}}// end include: runtime_safe_heap.js
// Wasm globals
var wasmMemory;//========================================
// Runtime essentials
//========================================
// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT=false;// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;/** @type {function(*, string=)} */function assert(condition,text){if(!condition){// This build was created without ASSERTIONS defined.  `assert()` should not
// ever be called in this configuration but in case there are callers in
// the wild leave this simple abort() implemenation here for now.
abort(text);}}// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident){var func=Module['_'+ident];// closure exported function
return func;}// C calling interface.
/** @param {string|null=} returnType
@param {Array=} argTypes
@param {Arguments|Array=} args
@param {Object=} opts */function ccall(ident,returnType,argTypes,args,opts){// For fast lookup of conversion functions
var toC={'string':function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){// null string
// at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
var len=(str.length<<2)+1;ret=stackAlloc(len);stringToUTF8(str,ret,len);}return ret;},'array':function(arr){var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret;}};function convertReturnValue(ret){if(returnType==='string')return UTF8ToString(ret);if(returnType==='boolean')return Boolean(ret);return ret;}var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i]);}else{cArgs[i]=args[i];}}}var ret=func.apply(null,cArgs);function onDone(ret){if(stack!==0)stackRestore(stack);return convertReturnValue(ret);}ret=onDone(ret);return ret;}/** @param {string=} returnType
@param {Array=} argTypes
@param {Object=} opts */function cwrap(ident,returnType,argTypes,opts){argTypes=argTypes||[];// When the function takes numbers and returns a number, we can just return
// the original function
var numericArgs=argTypes.every(function(type){return type==='number';});var numericRet=returnType!=='string';if(numericRet&&numericArgs&&!opts){return getCFunc(ident);}return function(){return ccall(ident,returnType,argTypes,arguments,opts);};}// include: runtime_legacy.js
var ALLOC_NORMAL=0;// Tries to use _malloc()
var ALLOC_STACK=1;// Lives for the duration of the current function call
/**
* allocate(): This function is no longer used by emscripten but is kept around to avoid
*             breaking external users.
*             You should normally not use allocate(), and instead allocate
*             memory using _malloc()/stackAlloc(), initialize it with
*             setValue(), and so forth.
* @param {(Uint8Array|Array<number>)} slab: An array of data.
* @param {number=} allocator : How to allocate memory, see ALLOC_*
*/function allocate(slab,allocator){var ret;if(allocator==ALLOC_STACK){ret=stackAlloc(slab.length);}else{ret=_malloc(slab.length);}if(!slab.subarray&&!slab.slice){slab=new Uint8Array(slab);}HEAPU8.set(slab,ret);return ret;}// end include: runtime_legacy.js
// include: runtime_strings.js
// runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.
var UTF8Decoder=typeof TextDecoder!='undefined'?new TextDecoder('utf8'):undefined;// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.
/**
* heapOrArray is either a regular array, or a JavaScript typed array view.
* @param {number} idx
* @param {number=} maxBytesToRead
* @return {string}
*/function UTF8ArrayToString(heapOrArray,idx,maxBytesToRead){var endIdx=idx+maxBytesToRead;var endPtr=idx;// TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
// Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
// (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
while(heapOrArray[endPtr]&&!(endPtr>=endIdx))++endPtr;if(endPtr-idx>16&&heapOrArray.buffer&&UTF8Decoder){return UTF8Decoder.decode(heapOrArray.subarray(idx,endPtr));}else{var str='';// If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
while(idx<endPtr){// For UTF8 byte structure, see:
// http://en.wikipedia.org/wiki/UTF-8#Description
// https://www.ietf.org/rfc/rfc2279.txt
// https://tools.ietf.org/html/rfc3629
var u0=heapOrArray[idx++];if(!(u0&0x80)){str+=String.fromCharCode(u0);continue;}var u1=heapOrArray[idx++]&63;if((u0&0xE0)==0xC0){str+=String.fromCharCode((u0&31)<<6|u1);continue;}var u2=heapOrArray[idx++]&63;if((u0&0xF0)==0xE0){u0=(u0&15)<<12|u1<<6|u2;}else{u0=(u0&7)<<18|u1<<12|u2<<6|heapOrArray[idx++]&63;}if(u0<0x10000){str+=String.fromCharCode(u0);}else{var ch=u0-0x10000;str+=String.fromCharCode(0xD800|ch>>10,0xDC00|ch&0x3FF);}}}return str;}// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
* @param {number} ptr
* @param {number=} maxBytesToRead
* @return {string}
*/function UTF8ToString(ptr,maxBytesToRead){;return ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):'';}// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.
function stringToUTF8Array(str,heap,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))// Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;// -1 for string null terminator.
for(var i=0;i<str.length;++i){// Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
// See http://unicode.org/faq/utf_bom.html#utf16-3
// For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
var u=str.charCodeAt(i);// possibly a lead surrogate
if(u>=0xD800&&u<=0xDFFF){var u1=str.charCodeAt(++i);u=0x10000+((u&0x3FF)<<10)|u1&0x3FF;}if(u<=0x7F){if(outIdx>=endIdx)break;heap[outIdx++]=u;}else if(u<=0x7FF){if(outIdx+1>=endIdx)break;heap[outIdx++]=0xC0|u>>6;heap[outIdx++]=0x80|u&63;}else if(u<=0xFFFF){if(outIdx+2>=endIdx)break;heap[outIdx++]=0xE0|u>>12;heap[outIdx++]=0x80|u>>6&63;heap[outIdx++]=0x80|u&63;}else{if(outIdx+3>=endIdx)break;heap[outIdx++]=0xF0|u>>18;heap[outIdx++]=0x80|u>>12&63;heap[outIdx++]=0x80|u>>6&63;heap[outIdx++]=0x80|u&63;}}// Null-terminate the pointer to the buffer.
heap[outIdx]=0;return outIdx-startIdx;}// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.
function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite);}// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){// Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
// See http://unicode.org/faq/utf_bom.html#utf16-3
var u=str.charCodeAt(i);// possibly a lead surrogate
if(u>=0xD800&&u<=0xDFFF)u=0x10000+((u&0x3FF)<<10)|str.charCodeAt(++i)&0x3FF;if(u<=0x7F)++len;else if(u<=0x7FF)len+=2;else if(u<=0xFFFF)len+=3;else len+=4;}return len;}// end include: runtime_strings.js
// include: runtime_strings_extra.js
// runtime_strings_extra.js: Strings related runtime functions that are available only in regular runtime.
// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function AsciiToString(ptr){var str='';while(1){var ch=HEAPU8[ptr++>>0];if(!ch)return str;str+=String.fromCharCode(ch);}}// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.
function stringToAscii(str,outPtr){return writeAsciiToMemory(str,outPtr,false);}// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
var UTF16Decoder=typeof TextDecoder!='undefined'?new TextDecoder('utf-16le'):undefined;function UTF16ToString(ptr,maxBytesToRead){var endPtr=ptr;// TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
// Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
var idx=endPtr>>1;var maxIdx=idx+maxBytesToRead/2;// If maxBytesToRead is not passed explicitly, it will be undefined, and this
// will always evaluate to true. This saves on code size.
while(!(idx>=maxIdx)&&HEAPU16[idx])++idx;endPtr=idx<<1;if(endPtr-ptr>32&&UTF16Decoder){return UTF16Decoder.decode(HEAPU8.subarray(ptr,endPtr));}else{var str='';// If maxBytesToRead is not passed explicitly, it will be undefined, and the for-loop's condition
// will always evaluate to true. The loop is then terminated on the first null char.
for(var i=0;!(i>=maxBytesToRead/2);++i){var codeUnit=HEAP16[ptr+i*2>>1];if(codeUnit==0)break;// fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
str+=String.fromCharCode(codeUnit);}return str;}}// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.
function stringToUTF16(str,outPtr,maxBytesToWrite){// Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
if(maxBytesToWrite===undefined){maxBytesToWrite=0x7FFFFFFF;}if(maxBytesToWrite<2)return 0;maxBytesToWrite-=2;// Null terminator.
var startPtr=outPtr;var numCharsToWrite=maxBytesToWrite<str.length*2?maxBytesToWrite/2:str.length;for(var i=0;i<numCharsToWrite;++i){// charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
var codeUnit=str.charCodeAt(i);// possibly a lead surrogate
HEAP16[outPtr>>1]=codeUnit;outPtr+=2;}// Null-terminate the pointer to the HEAP.
HEAP16[outPtr>>1]=0;return outPtr-startPtr;}// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF16(str){return str.length*2;}function UTF32ToString(ptr,maxBytesToRead){var i=0;var str='';// If maxBytesToRead is not passed explicitly, it will be undefined, and this
// will always evaluate to true. This saves on code size.
while(!(i>=maxBytesToRead/4)){var utf32=HEAP32[ptr+i*4>>2];if(utf32==0)break;++i;// Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
// See http://unicode.org/faq/utf_bom.html#utf16-3
if(utf32>=0x10000){var ch=utf32-0x10000;str+=String.fromCharCode(0xD800|ch>>10,0xDC00|ch&0x3FF);}else{str+=String.fromCharCode(utf32);}}return str;}// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.
function stringToUTF32(str,outPtr,maxBytesToWrite){// Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
if(maxBytesToWrite===undefined){maxBytesToWrite=0x7FFFFFFF;}if(maxBytesToWrite<4)return 0;var startPtr=outPtr;var endPtr=startPtr+maxBytesToWrite-4;for(var i=0;i<str.length;++i){// Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
// See http://unicode.org/faq/utf_bom.html#utf16-3
var codeUnit=str.charCodeAt(i);// possibly a lead surrogate
if(codeUnit>=0xD800&&codeUnit<=0xDFFF){var trailSurrogate=str.charCodeAt(++i);codeUnit=0x10000+((codeUnit&0x3FF)<<10)|trailSurrogate&0x3FF;}HEAP32[outPtr>>2]=codeUnit;outPtr+=4;if(outPtr+4>endPtr)break;}// Null-terminate the pointer to the HEAP.
HEAP32[outPtr>>2]=0;return outPtr-startPtr;}// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF32(str){var len=0;for(var i=0;i<str.length;++i){// Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
// See http://unicode.org/faq/utf_bom.html#utf16-3
var codeUnit=str.charCodeAt(i);if(codeUnit>=0xD800&&codeUnit<=0xDFFF)++i;// possibly a lead surrogate, so skip over the tail surrogate.
len+=4;}return len;}// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str){var size=lengthBytesUTF8(str)+1;var ret=_malloc(size);if(ret)stringToUTF8Array(str,HEAP8,ret,size);return ret;}// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str){var size=lengthBytesUTF8(str)+1;var ret=stackAlloc(size);stringToUTF8Array(str,HEAP8,ret,size);return ret;}// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated
@param {boolean=} dontAddNull */function writeStringToMemory(string,buffer,dontAddNull){warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');var/** @type {number} */lastChar,/** @type {number} */end;if(dontAddNull){// stringToUTF8Array always appends null. If we don't want to do that, remember the
// character that existed at the location where the null will be placed, and restore
// that after the write (below).
end=buffer+lengthBytesUTF8(string);lastChar=HEAP8[end];}stringToUTF8(string,buffer,Infinity);if(dontAddNull)HEAP8[end]=lastChar;// Restore the value under the null character.
}function writeArrayToMemory(array,buffer){HEAP8.set(array,buffer);}/** @param {boolean=} dontAddNull */function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i);}// Null-terminate the pointer to the HEAP.
if(!dontAddNull)HEAP8[buffer>>0]=0;}// end include: runtime_strings_extra.js
// Memory management
var HEAP,/** @type {!ArrayBuffer} */buffer,/** @type {!Int8Array} */HEAP8,/** @type {!Uint8Array} */HEAPU8,/** @type {!Int16Array} */HEAP16,/** @type {!Uint16Array} */HEAPU16,/** @type {!Int32Array} */HEAP32,/** @type {!Uint32Array} */HEAPU32,/** @type {!Float32Array} */HEAPF32,/** @type {!Float64Array} */HEAPF64;function updateGlobalBufferAndViews(buf){buffer=buf;Module['HEAP8']=HEAP8=new Int8Array(buf);Module['HEAP16']=HEAP16=new Int16Array(buf);Module['HEAP32']=HEAP32=new Int32Array(buf);Module['HEAPU8']=HEAPU8=new Uint8Array(buf);Module['HEAPU16']=HEAPU16=new Uint16Array(buf);Module['HEAPU32']=HEAPU32=new Uint32Array(buf);Module['HEAPF32']=HEAPF32=new Float32Array(buf);Module['HEAPF64']=HEAPF64=new Float64Array(buf);}var TOTAL_STACK=5242880;var INITIAL_MEMORY=Module['INITIAL_MEMORY']||16777216;// In non-standalone/normal mode, we create the memory here.
// include: runtime_init_memory.js
// Create the wasm memory. (Note: this only applies if IMPORTED_MEMORY is defined)
if(Module['wasmMemory']){wasmMemory=Module['wasmMemory'];}else{wasmMemory=new WebAssembly.Memory({'initial':INITIAL_MEMORY/65536,// In theory we should not need to emit the maximum if we want "unlimited"
// or 4GB of memory, but VMs error on that atm, see
// https://github.com/emscripten-core/emscripten/issues/14130
// And in the pthreads case we definitely need to emit a maximum. So
// always emit one.
'maximum':2147483648/65536});}if(wasmMemory){buffer=wasmMemory.buffer;}// If the user provides an incorrect length, just use that length instead rather than providing the user to
// specifically provide the memory length with Module['INITIAL_MEMORY'].
INITIAL_MEMORY=buffer.byteLength;updateGlobalBufferAndViews(buffer);// end include: runtime_init_memory.js
// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;// end include: runtime_init_table.js
// include: runtime_stack_check.js
// end include: runtime_stack_check.js
// include: runtime_assertions.js
// end include: runtime_assertions.js
var __ATPRERUN__=[];// functions called before the runtime is initialized
var __ATINIT__=[];// functions called during startup
var __ATEXIT__=[];// functions called during shutdown
var __ATPOSTRUN__=[];// functions called after the main() is called
var runtimeInitialized=false;function keepRuntimeAlive(){return noExitRuntime;}function preRun(){if(Module['preRun']){if(typeof Module['preRun']=='function')Module['preRun']=[Module['preRun']];while(Module['preRun'].length){addOnPreRun(Module['preRun'].shift());}}callRuntimeCallbacks(__ATPRERUN__);}function initRuntime(){runtimeInitialized=true;if(!Module["noFSInit"]&&!FS.init.initialized)FS.init();FS.ignorePermissions=false;TTY.init();callRuntimeCallbacks(__ATINIT__);}function postRun(){if(Module['postRun']){if(typeof Module['postRun']=='function')Module['postRun']=[Module['postRun']];while(Module['postRun'].length){addOnPostRun(Module['postRun'].shift());}}callRuntimeCallbacks(__ATPOSTRUN__);}function addOnPreRun(cb){__ATPRERUN__.unshift(cb);}function addOnInit(cb){__ATINIT__.unshift(cb);}function addOnExit(cb){}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb);}// include: runtime_math.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;// overridden to take different actions when all run dependencies are fulfilled
function getUniqueRunDependency(id){return id;}function addRunDependency(id){runDependencies++;if(Module['monitorRunDependencies']){Module['monitorRunDependencies'](runDependencies);}}function removeRunDependency(id){runDependencies--;if(Module['monitorRunDependencies']){Module['monitorRunDependencies'](runDependencies);}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null;}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback();// can add another dependenciesFulfilled
}}}/** @param {string|number=} what */function abort(what){{if(Module['onAbort']){Module['onAbort'](what);}}what='Aborted('+what+')';// TODO(sbc): Should we remove printing and leave it up to whoever
// catches the exception?
err(what);ABORT=true;EXITSTATUS=1;what+='. Build with -sASSERTIONS for more info.';// Use a wasm runtime error, because a JS error might be seen as a foreign
// exception, which means we'd run destructors on it. We need the error to
// simply make the program stop.
// Suppress closure compiler warning here. Closure compiler's builtin extern
// defintion for WebAssembly.RuntimeError claims it takes no arguments even
// though it can.
// TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
/** @suppress {checkTypes} */var e=new WebAssembly.RuntimeError(what);// Throw the error whether or not MODULARIZE is set because abort is used
// in code paths apart from instantiation where an exception is expected
// to be thrown when abort is called.
throw e;}// {{MEM_INITIALIZER}}
// include: memoryprofiler.js
// end include: memoryprofiler.js
// include: URIUtils.js
// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix='data:application/octet-stream;base64,';// Indicates whether filename is a base64 data URI.
function isDataURI(filename){// Prefix of data URIs emitted by SINGLE_FILE and related options.
return filename.startsWith(dataURIPrefix);}// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename){return filename.startsWith('file://');}// end include: URIUtils.js
var wasmBinaryFile;wasmBinaryFile='animgencwa.wasm';if(!isDataURI(wasmBinaryFile)){wasmBinaryFile=locateFile(wasmBinaryFile);}function getBinary(file){try{if(file==wasmBinaryFile&&wasmBinary){return new Uint8Array(wasmBinary);}var binary=tryParseAsDataURI(file);if(binary){return binary;}if(readBinary){return readBinary(file);}else{throw"both async and sync fetching of the wasm failed";}}catch(err){abort(err);}}function getBinaryPromise(){// If we don't have the binary yet, try to to load it asynchronously.
// Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
// See https://github.com/github/fetch/pull/92#issuecomment-140665932
// Cordova or Electron apps are typically loaded from a file:// url.
// So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
if(!wasmBinary&&(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER)){if(typeof fetch=='function'&&!isFileURI(wasmBinaryFile)){return fetch(wasmBinaryFile,{credentials:'same-origin'}).then(function(response){if(!response['ok']){throw"failed to load wasm binary file at '"+wasmBinaryFile+"'";}return response['arrayBuffer']();}).catch(function(){return getBinary(wasmBinaryFile);});}else{if(readAsync){// fetch is not available or url is file => try XHR (readAsync uses XHR internally)
return new Promise(function(resolve,reject){readAsync(wasmBinaryFile,function(response){resolve(new Uint8Array(/** @type{!ArrayBuffer} */response));},reject);});}}}// Otherwise, getBinary should be able to get it synchronously
return Promise.resolve().then(function(){return getBinary(wasmBinaryFile);});}// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm(){// prepare imports
var info={'env':asmLibraryArg,'wasi_snapshot_preview1':asmLibraryArg};// Load the wasm module and create an instance of using native support in the JS engine.
// handle a generated wasm instance, receiving its exports and
// performing other necessary setup
/** @param {WebAssembly.Module=} module*/function receiveInstance(instance,module){var exports=instance.exports;Module['asm']=exports;wasmTable=Module['asm']['__indirect_function_table'];addOnInit(Module['asm']['__wasm_call_ctors']);removeRunDependency('wasm-instantiate');}// we can't run yet (except in a pthread, where we have a custom sync instantiator)
addRunDependency('wasm-instantiate');// Prefer streaming instantiation if available.
function receiveInstantiationResult(result){// 'result' is a ResultObject object which has both the module and instance.
// receiveInstance() will swap in the exports (to Module.asm) so they can be called
// TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
// When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
receiveInstance(result['instance']);}function instantiateArrayBuffer(receiver){return getBinaryPromise().then(function(binary){return WebAssembly.instantiate(binary,info);}).then(function(instance){return instance;}).then(receiver,function(reason){err('failed to asynchronously prepare wasm: '+reason);abort(reason);});}function instantiateAsync(){if(!wasmBinary&&typeof WebAssembly.instantiateStreaming=='function'&&!isDataURI(wasmBinaryFile)&&// Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
!isFileURI(wasmBinaryFile)&&typeof fetch=='function'){return fetch(wasmBinaryFile,{credentials:'same-origin'}).then(function(response){// Suppress closure warning here since the upstream definition for
// instantiateStreaming only allows Promise<Repsponse> rather than
// an actual Response.
// TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
/** @suppress {checkTypes} */var result=WebAssembly.instantiateStreaming(response,info);return result.then(receiveInstantiationResult,function(reason){// We expect the most common failure cause to be a bad MIME type for the binary,
// in which case falling back to ArrayBuffer instantiation should work.
err('wasm streaming compile failed: '+reason);err('falling back to ArrayBuffer instantiation');return instantiateArrayBuffer(receiveInstantiationResult);});});}else{return instantiateArrayBuffer(receiveInstantiationResult);}}// User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
// to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
// to any other async startup actions they are performing.
// Also pthreads and wasm workers initialize the wasm instance through this path.
if(Module['instantiateWasm']){try{var exports=Module['instantiateWasm'](info,receiveInstance);return exports;}catch(e){err('Module.instantiateWasm callback failed with error: '+e);return false;}}instantiateAsync();return{};// no exports yet; we'll fill them in later
}// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;var tempI64;// === Body ===
var ASM_CONSTS={66088:function($0){jName=Module.UTF8ToString($0);console.log('buildFromXMLCell: filename '+jName+'. Found no avatarStaticData');},66205:function($0){jName=Module.UTF8ToString($0);console.log('buildFromXMLCell: filename '+jName+'. Found no avatar');},66312:function($0){jName=Module.UTF8ToString($0);console.log('buildFromXMLCell: filename '+jName+'. Found no skeleton');},66421:function($0){jName=Module.UTF8ToString($0);console.log('buildFromXMLCell: filename '+jName+'. Found no joint');},66527:function($0,$1,$2){Module.CB_SeqStart($0,$1,$2);},66563:function($0,$1,$2,$3){jGloss=Module.UTF8ToString($1);Module.CB_SignStart($0,jGloss,$2,$3);},66642:function($0,$1,$2,$3,$4){Module.CB_FrameStart($0,$1,$2,$3,$4);},66684:function($0,$1,$2){fourCC=Module.UTF8ToString($1);newMorph={id4cc:fourCC};newMorph.amount=$2;Module.CB_Morph($0,newMorph);},66802:function($0,$1,$2,$3,$4,$5,$6,$7,$8){fourCC=Module.UTF8ToString($1);transArray=[$6];transArray.push($7);transArray.push($8);newBone={id4cc:fourCC};newBone.trans=transArray;rotArray=[$2];rotArray.push($3);rotArray.push($4);rotArray.push($5);newBone.rot=rotArray;Module.CB_Bone($0,newBone);},67082:function($0){Module.Util_Debug('Test Debug in AGIPostMortem');Module.CB_SeqEnd($0);},67158:function($0){jName=Module.UTF8ToString($0);console.log('animgen_lite_initialise: avatar '+jName+'. Caught unknown exception');},67279:function($0){jName=Module.UTF8ToString($0);console.log('animgen_lite_initialise: avatar '+jName+'. Caught GeneralError');},67395:function($0){jName=Module.UTF8ToString($0);console.log('animgen_lite_initialise: avatar '+jName+'. Caught AnimgenError');}};function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=='function'){callback(Module);// Pass the module as the first argument.
continue;}var func=callback.func;if(typeof func=='number'){if(callback.arg===undefined){// Run the wasm function ptr with signature 'v'. If no function
// with such signature was exported, this call does not need
// to be emitted (and would confuse Closure)
getWasmTableEntry(func)();}else{// If any function with signature 'vi' was exported, run
// the callback with that signature.
getWasmTableEntry(func)(callback.arg);}}else{func(callback.arg===undefined?null:callback.arg);}}}function withStackSave(f){var stack=stackSave();var ret=f();stackRestore(stack);return ret;}function demangle(func){return func;}function demangleAll(text){var regex=/\b_Z[\w\d_]+/g;return text.replace(regex,function(x){var y=demangle(x);return x===y?x:y+' ['+x+']';});}function getWasmTableEntry(funcPtr){// In -Os and -Oz builds, do not implement a JS side wasm table mirror for small
// code size, but directly access wasmTable, which is a bit slower as uncached.
return wasmTable.get(funcPtr);}function handleException(e){// Certain exception types we do not treat as errors since they are used for
// internal control flow.
// 1. ExitStatus, which is thrown by exit()
// 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
//    that wish to return to JS event loop.
if(e instanceof ExitStatus||e=='unwind'){return EXITSTATUS;}quit_(1,e);}function jsStackTrace(){var error=new Error();if(!error.stack){// IE10+ special cases: It does have callstack info, but it is only
// populated if an Error object is thrown, so try that as a special-case.
try{throw new Error();}catch(e){error=e;}if(!error.stack){return'(no stack trace available)';}}return error.stack.toString();}function setWasmTableEntry(idx,func){wasmTable.set(idx,func);}function stackTrace(){var js=jsStackTrace();if(Module['extraStackTrace'])js+='\n'+Module['extraStackTrace']();return demangleAll(js);}function ___cxa_allocate_exception(size){// Thrown object is prepended by exception metadata block
return _malloc(size+24)+24;}var exceptionCaught=[];function exception_addRef(info){info.add_ref();}var uncaughtExceptionCount=0;function ___cxa_begin_catch(ptr){var info=new ExceptionInfo(ptr);if(!info.get_caught()){info.set_caught(true);uncaughtExceptionCount--;}info.set_rethrown(false);exceptionCaught.push(info);exception_addRef(info);return info.get_exception_ptr();}var exceptionLast=0;/** @constructor */function ExceptionInfo(excPtr){this.excPtr=excPtr;this.ptr=excPtr-24;this.set_type=function(type){HEAPU32[this.ptr+4>>2]=type;};this.get_type=function(){return HEAPU32[this.ptr+4>>2];};this.set_destructor=function(destructor){HEAPU32[this.ptr+8>>2]=destructor;};this.get_destructor=function(){return HEAPU32[this.ptr+8>>2];};this.set_refcount=function(refcount){HEAP32[this.ptr>>2]=refcount;};this.set_caught=function(caught){caught=caught?1:0;HEAP8[this.ptr+12>>0]=caught;};this.get_caught=function(){return HEAP8[this.ptr+12>>0]!=0;};this.set_rethrown=function(rethrown){rethrown=rethrown?1:0;HEAP8[this.ptr+13>>0]=rethrown;};this.get_rethrown=function(){return HEAP8[this.ptr+13>>0]!=0;};// Initialize native structure fields. Should be called once after allocated.
this.init=function(type,destructor){this.set_adjusted_ptr(0);this.set_type(type);this.set_destructor(destructor);this.set_refcount(0);this.set_caught(false);this.set_rethrown(false);};this.add_ref=function(){var value=HEAP32[this.ptr>>2];HEAP32[this.ptr>>2]=value+1;};// Returns true if last reference released.
this.release_ref=function(){var prev=HEAP32[this.ptr>>2];HEAP32[this.ptr>>2]=prev-1;return prev===1;};this.set_adjusted_ptr=function(adjustedPtr){HEAPU32[this.ptr+16>>2]=adjustedPtr;};this.get_adjusted_ptr=function(){return HEAPU32[this.ptr+16>>2];};// Get pointer which is expected to be received by catch clause in C++ code. It may be adjusted
// when the pointer is casted to some of the exception object base classes (e.g. when virtual
// inheritance is used). When a pointer is thrown this method should return the thrown pointer
// itself.
this.get_exception_ptr=function(){// Work around a fastcomp bug, this code is still included for some reason in a build without
// exceptions support.
var isPointer=___cxa_is_pointer_type(this.get_type());if(isPointer){return HEAPU32[this.excPtr>>2];}var adjusted=this.get_adjusted_ptr();if(adjusted!==0)return adjusted;return this.excPtr;};}function ___cxa_free_exception(ptr){return _free(new ExceptionInfo(ptr).ptr);}function exception_decRef(info){// A rethrown exception can reach refcount 0; it must not be discarded
// Its next handler will clear the rethrown flag and addRef it, prior to
// final decRef and destruction here
if(info.release_ref()&&!info.get_rethrown()){var destructor=info.get_destructor();if(destructor){// In Wasm, destructors return 'this' as in ARM
getWasmTableEntry(destructor)(info.excPtr);}___cxa_free_exception(info.excPtr);}}function ___cxa_end_catch(){// Clear state flag.
_setThrew(0);// Call destructor if one is registered then clear it.
var info=exceptionCaught.pop();exception_decRef(info);exceptionLast=0;// XXX in decRef?
}function ___resumeException(ptr){if(!exceptionLast){exceptionLast=ptr;}throw ptr;}function ___cxa_find_matching_catch_2(){var thrown=exceptionLast;if(!thrown){// just pass through the null ptr
setTempRet0(0);return 0;}var info=new ExceptionInfo(thrown);info.set_adjusted_ptr(thrown);var thrownType=info.get_type();if(!thrownType){// just pass through the thrown ptr
setTempRet0(0);return thrown;}var typeArray=Array.prototype.slice.call(arguments);// can_catch receives a **, add indirection
// The different catch blocks are denoted by different types.
// Due to inheritance, those types may not precisely match the
// type of the thrown object. Find one which matches, and
// return the type of the catch block which should be called.
for(var i=0;i<typeArray.length;i++){var caughtType=typeArray[i];if(caughtType===0||caughtType===thrownType){// Catch all clause matched or exactly the same type is caught
break;}var adjusted_ptr_addr=info.ptr+16;if(___cxa_can_catch(caughtType,thrownType,adjusted_ptr_addr)){setTempRet0(caughtType);return thrown;}}setTempRet0(thrownType);return thrown;}function ___cxa_find_matching_catch_3(){var thrown=exceptionLast;if(!thrown){// just pass through the null ptr
setTempRet0(0);return 0;}var info=new ExceptionInfo(thrown);info.set_adjusted_ptr(thrown);var thrownType=info.get_type();if(!thrownType){// just pass through the thrown ptr
setTempRet0(0);return thrown;}var typeArray=Array.prototype.slice.call(arguments);// can_catch receives a **, add indirection
// The different catch blocks are denoted by different types.
// Due to inheritance, those types may not precisely match the
// type of the thrown object. Find one which matches, and
// return the type of the catch block which should be called.
for(var i=0;i<typeArray.length;i++){var caughtType=typeArray[i];if(caughtType===0||caughtType===thrownType){// Catch all clause matched or exactly the same type is caught
break;}var adjusted_ptr_addr=info.ptr+16;if(___cxa_can_catch(caughtType,thrownType,adjusted_ptr_addr)){setTempRet0(caughtType);return thrown;}}setTempRet0(thrownType);return thrown;}function ___cxa_find_matching_catch_5(){var thrown=exceptionLast;if(!thrown){// just pass through the null ptr
setTempRet0(0);return 0;}var info=new ExceptionInfo(thrown);info.set_adjusted_ptr(thrown);var thrownType=info.get_type();if(!thrownType){// just pass through the thrown ptr
setTempRet0(0);return thrown;}var typeArray=Array.prototype.slice.call(arguments);// can_catch receives a **, add indirection
// The different catch blocks are denoted by different types.
// Due to inheritance, those types may not precisely match the
// type of the thrown object. Find one which matches, and
// return the type of the catch block which should be called.
for(var i=0;i<typeArray.length;i++){var caughtType=typeArray[i];if(caughtType===0||caughtType===thrownType){// Catch all clause matched or exactly the same type is caught
break;}var adjusted_ptr_addr=info.ptr+16;if(___cxa_can_catch(caughtType,thrownType,adjusted_ptr_addr)){setTempRet0(caughtType);return thrown;}}setTempRet0(thrownType);return thrown;}function ___cxa_rethrow(){var info=exceptionCaught.pop();if(!info){abort('no exception to throw');}var ptr=info.excPtr;if(!info.get_rethrown()){// Only pop if the corresponding push was through rethrow_primary_exception
exceptionCaught.push(info);info.set_rethrown(true);info.set_caught(false);uncaughtExceptionCount++;}exceptionLast=ptr;throw ptr;}function ___cxa_throw(ptr,type,destructor){var info=new ExceptionInfo(ptr);// Initialize ExceptionInfo content after it was allocated in __cxa_allocate_exception.
info.init(type,destructor);exceptionLast=ptr;uncaughtExceptionCount++;throw ptr;}function ___cxa_uncaught_exceptions(){return uncaughtExceptionCount;}function setErrNo(value){HEAP32[___errno_location()>>2]=value;return value;}var PATH={isAbs:path=>path.charAt(0)==='/',splitPath:filename=>{var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return splitPathRe.exec(filename).slice(1);},normalizeArray:(parts,allowAboveRoot)=>{// if the path tries to go above the root, `up` ends up > 0
var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==='.'){parts.splice(i,1);}else if(last==='..'){parts.splice(i,1);up++;}else if(up){parts.splice(i,1);up--;}}// if the path is allowed to go above the root, restore leading ..s
if(allowAboveRoot){for(;up;up--){parts.unshift('..');}}return parts;},normalize:path=>{var isAbsolute=PATH.isAbs(path),trailingSlash=path.substr(-1)==='/';// Normalize the path
path=PATH.normalizeArray(path.split('/').filter(p=>!!p),!isAbsolute).join('/');if(!path&&!isAbsolute){path='.';}if(path&&trailingSlash){path+='/';}return(isAbsolute?'/':'')+path;},dirname:path=>{var result=PATH.splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){// No dirname whatsoever
return'.';}if(dir){// It has a dirname, strip trailing slash
dir=dir.substr(0,dir.length-1);}return root+dir;},basename:path=>{// EMSCRIPTEN return '/'' for '/', not an empty string
if(path==='/')return'/';path=PATH.normalize(path);path=path.replace(/\/$/,"");var lastSlash=path.lastIndexOf('/');if(lastSlash===-1)return path;return path.substr(lastSlash+1);},join:function(){var paths=Array.prototype.slice.call(arguments,0);return PATH.normalize(paths.join('/'));},join2:(l,r)=>{return PATH.normalize(l+'/'+r);}};function getRandomDevice(){if(typeof crypto=='object'&&typeof crypto['getRandomValues']=='function'){// for modern web browsers
var randomBuffer=new Uint8Array(1);return function(){crypto.getRandomValues(randomBuffer);return randomBuffer[0];};}else if(ENVIRONMENT_IS_NODE){// for nodejs with or without crypto support included
try{var crypto_module=require('crypto');// nodejs has crypto support
return function(){return crypto_module['randomBytes'](1)[0];};}catch(e){// nodejs doesn't have crypto support
}}// we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096
return function(){abort("randomDevice");};}var PATH_FS={resolve:function(){var resolvedPath='',resolvedAbsolute=false;for(var i=arguments.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?arguments[i]:FS.cwd();// Skip empty and invalid entries
if(typeof path!='string'){throw new TypeError('Arguments to path.resolve must be strings');}else if(!path){return'';// an invalid portion invalidates the whole thing
}resolvedPath=path+'/'+resolvedPath;resolvedAbsolute=PATH.isAbs(path);}// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)
resolvedPath=PATH.normalizeArray(resolvedPath.split('/').filter(p=>!!p),!resolvedAbsolute).join('/');return(resolvedAbsolute?'/':'')+resolvedPath||'.';},relative:(from,to)=>{from=PATH_FS.resolve(from).substr(1);to=PATH_FS.resolve(to).substr(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=='')break;}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=='')break;}if(start>end)return[];return arr.slice(start,end-start+1);}var fromParts=trim(from.split('/'));var toParts=trim(to.split('/'));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break;}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push('..');}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join('/');}};var TTY={ttys:[],init:function(){// https://github.com/emscripten-core/emscripten/pull/1555
// if (ENVIRONMENT_IS_NODE) {
//   // currently, FS.init does not distinguish if process.stdin is a file or TTY
//   // device, it always assumes it's a TTY device. because of this, we're forcing
//   // process.stdin to UTF8 encoding to at least make stdin reading compatible
//   // with text files until FS.init can be refactored.
//   process['stdin']['setEncoding']('utf8');
// }
},shutdown:function(){// https://github.com/emscripten-core/emscripten/pull/1555
// if (ENVIRONMENT_IS_NODE) {
//   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
//   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
//   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
//   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
//   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
//   process['stdin']['pause']();
// }
},register:function(dev,ops){TTY.ttys[dev]={input:[],output:[],ops:ops};FS.registerDevice(dev,TTY.stream_ops);},stream_ops:{open:function(stream){var tty=TTY.ttys[stream.node.rdev];if(!tty){throw new FS.ErrnoError(43);}stream.tty=tty;stream.seekable=false;},close:function(stream){// flush any pending line data
stream.tty.ops.flush(stream.tty);},flush:function(stream){stream.tty.ops.flush(stream.tty);},read:function(stream,buffer,offset,length,pos/* ignored */){if(!stream.tty||!stream.tty.ops.get_char){throw new FS.ErrnoError(60);}var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=stream.tty.ops.get_char(stream.tty);}catch(e){throw new FS.ErrnoError(29);}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(6);}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result;}if(bytesRead){stream.node.timestamp=Date.now();}return bytesRead;},write:function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.put_char){throw new FS.ErrnoError(60);}try{for(var i=0;i<length;i++){stream.tty.ops.put_char(stream.tty,buffer[offset+i]);}}catch(e){throw new FS.ErrnoError(29);}if(length){stream.node.timestamp=Date.now();}return i;}},default_tty_ops:{get_char:function(tty){if(!tty.input.length){var result=null;if(ENVIRONMENT_IS_NODE){// we will read data by chunks of BUFSIZE
var BUFSIZE=256;var buf=Buffer.alloc(BUFSIZE);var bytesRead=0;try{bytesRead=fs.readSync(process.stdin.fd,buf,0,BUFSIZE,-1);}catch(e){// Cross-platform differences: on Windows, reading EOF throws an exception, but on other OSes,
// reading EOF returns 0. Uniformize behavior by treating the EOF exception to return 0.
if(e.toString().includes('EOF'))bytesRead=0;else throw e;}if(bytesRead>0){result=buf.slice(0,bytesRead).toString('utf-8');}else{result=null;}}else if(typeof window!='undefined'&&typeof window.prompt=='function'){// Browser.
result=window.prompt('Input: ');// returns null on cancel
if(result!==null){result+='\n';}}else if(typeof readline=='function'){// Command line.
result=readline();if(result!==null){result+='\n';}}if(!result){return null;}tty.input=intArrayFromString(result,true);}return tty.input.shift();},put_char:function(tty,val){if(val===null||val===10){out(UTF8ArrayToString(tty.output,0));tty.output=[];}else{if(val!=0)tty.output.push(val);// val == 0 would cut text output off in the middle.
}},flush:function(tty){if(tty.output&&tty.output.length>0){out(UTF8ArrayToString(tty.output,0));tty.output=[];}}},default_tty1_ops:{put_char:function(tty,val){if(val===null||val===10){err(UTF8ArrayToString(tty.output,0));tty.output=[];}else{if(val!=0)tty.output.push(val);}},flush:function(tty){if(tty.output&&tty.output.length>0){err(UTF8ArrayToString(tty.output,0));tty.output=[];}}}};function zeroMemory(address,size){HEAPU8.fill(0,address,address+size);}function alignMemory(size,alignment){return Math.ceil(size/alignment)*alignment;}function mmapAlloc(size){abort();}var MEMFS={ops_table:null,mount:function(mount){return MEMFS.createNode(null,'/',16384|511/* 0777 */,0);},createNode:function(parent,name,mode,dev){if(FS.isBlkdev(mode)||FS.isFIFO(mode)){// no supported
throw new FS.ErrnoError(63);}if(!MEMFS.ops_table){MEMFS.ops_table={dir:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,lookup:MEMFS.node_ops.lookup,mknod:MEMFS.node_ops.mknod,rename:MEMFS.node_ops.rename,unlink:MEMFS.node_ops.unlink,rmdir:MEMFS.node_ops.rmdir,readdir:MEMFS.node_ops.readdir,symlink:MEMFS.node_ops.symlink},stream:{llseek:MEMFS.stream_ops.llseek}},file:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:{llseek:MEMFS.stream_ops.llseek,read:MEMFS.stream_ops.read,write:MEMFS.stream_ops.write,allocate:MEMFS.stream_ops.allocate,mmap:MEMFS.stream_ops.mmap,msync:MEMFS.stream_ops.msync}},link:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,readlink:MEMFS.node_ops.readlink},stream:{}},chrdev:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:FS.chrdev_stream_ops}};}var node=FS.createNode(parent,name,mode,dev);if(FS.isDir(node.mode)){node.node_ops=MEMFS.ops_table.dir.node;node.stream_ops=MEMFS.ops_table.dir.stream;node.contents={};}else if(FS.isFile(node.mode)){node.node_ops=MEMFS.ops_table.file.node;node.stream_ops=MEMFS.ops_table.file.stream;node.usedBytes=0;// The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
// When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
// for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
// penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
node.contents=null;}else if(FS.isLink(node.mode)){node.node_ops=MEMFS.ops_table.link.node;node.stream_ops=MEMFS.ops_table.link.stream;}else if(FS.isChrdev(node.mode)){node.node_ops=MEMFS.ops_table.chrdev.node;node.stream_ops=MEMFS.ops_table.chrdev.stream;}node.timestamp=Date.now();// add the new node to the parent
if(parent){parent.contents[name]=node;parent.timestamp=node.timestamp;}return node;},getFileDataAsTypedArray:function(node){if(!node.contents)return new Uint8Array(0);if(node.contents.subarray)return node.contents.subarray(0,node.usedBytes);// Make sure to not return excess unused bytes.
return new Uint8Array(node.contents);},expandFileStorage:function(node,newCapacity){var prevCapacity=node.contents?node.contents.length:0;if(prevCapacity>=newCapacity)return;// No need to expand, the storage was already large enough.
// Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
// For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
// avoid overshooting the allocation cap by a very large margin.
var CAPACITY_DOUBLING_MAX=1024*1024;newCapacity=Math.max(newCapacity,prevCapacity*(prevCapacity<CAPACITY_DOUBLING_MAX?2.0:1.125)>>>0);if(prevCapacity!=0)newCapacity=Math.max(newCapacity,256);// At minimum allocate 256b for each file when expanding.
var oldContents=node.contents;node.contents=new Uint8Array(newCapacity);// Allocate new storage.
if(node.usedBytes>0)node.contents.set(oldContents.subarray(0,node.usedBytes),0);// Copy old data over to the new storage.
},resizeFileStorage:function(node,newSize){if(node.usedBytes==newSize)return;if(newSize==0){node.contents=null;// Fully decommit when requesting a resize to zero.
node.usedBytes=0;}else{var oldContents=node.contents;node.contents=new Uint8Array(newSize);// Allocate new storage.
if(oldContents){node.contents.set(oldContents.subarray(0,Math.min(newSize,node.usedBytes)));// Copy old data over to the new storage.
}node.usedBytes=newSize;}},node_ops:{getattr:function(node){var attr={};// device numbers reuse inode numbers.
attr.dev=FS.isChrdev(node.mode)?node.id:1;attr.ino=node.id;attr.mode=node.mode;attr.nlink=1;attr.uid=0;attr.gid=0;attr.rdev=node.rdev;if(FS.isDir(node.mode)){attr.size=4096;}else if(FS.isFile(node.mode)){attr.size=node.usedBytes;}else if(FS.isLink(node.mode)){attr.size=node.link.length;}else{attr.size=0;}attr.atime=new Date(node.timestamp);attr.mtime=new Date(node.timestamp);attr.ctime=new Date(node.timestamp);// NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
//       but this is not required by the standard.
attr.blksize=4096;attr.blocks=Math.ceil(attr.size/attr.blksize);return attr;},setattr:function(node,attr){if(attr.mode!==undefined){node.mode=attr.mode;}if(attr.timestamp!==undefined){node.timestamp=attr.timestamp;}if(attr.size!==undefined){MEMFS.resizeFileStorage(node,attr.size);}},lookup:function(parent,name){throw FS.genericErrors[44];},mknod:function(parent,name,mode,dev){return MEMFS.createNode(parent,name,mode,dev);},rename:function(old_node,new_dir,new_name){// if we're overwriting a directory at new_name, make sure it's empty.
if(FS.isDir(old_node.mode)){var new_node;try{new_node=FS.lookupNode(new_dir,new_name);}catch(e){}if(new_node){for(var i in new_node.contents){throw new FS.ErrnoError(55);}}}// do the internal rewiring
delete old_node.parent.contents[old_node.name];old_node.parent.timestamp=Date.now();old_node.name=new_name;new_dir.contents[new_name]=old_node;new_dir.timestamp=old_node.parent.timestamp;old_node.parent=new_dir;},unlink:function(parent,name){delete parent.contents[name];parent.timestamp=Date.now();},rmdir:function(parent,name){var node=FS.lookupNode(parent,name);for(var i in node.contents){throw new FS.ErrnoError(55);}delete parent.contents[name];parent.timestamp=Date.now();},readdir:function(node){var entries=['.','..'];for(var key in node.contents){if(!node.contents.hasOwnProperty(key)){continue;}entries.push(key);}return entries;},symlink:function(parent,newname,oldpath){var node=MEMFS.createNode(parent,newname,511/* 0777 */|40960,0);node.link=oldpath;return node;},readlink:function(node){if(!FS.isLink(node.mode)){throw new FS.ErrnoError(28);}return node.link;}},stream_ops:{read:function(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=stream.node.usedBytes)return 0;var size=Math.min(stream.node.usedBytes-position,length);if(size>8&&contents.subarray){// non-trivial, and typed array
buffer.set(contents.subarray(position,position+size),offset);}else{for(var i=0;i<size;i++)buffer[offset+i]=contents[position+i];}return size;},write:function(stream,buffer,offset,length,position,canOwn){// If the buffer is located in main memory (HEAP), and if
// memory can grow, we can't hold on to references of the
// memory buffer, as they may get invalidated. That means we
// need to do copy its contents.
if(buffer.buffer===HEAP8.buffer){canOwn=false;}if(!length)return 0;var node=stream.node;node.timestamp=Date.now();if(buffer.subarray&&(!node.contents||node.contents.subarray)){// This write is from a typed array to a typed array?
if(canOwn){node.contents=buffer.subarray(offset,offset+length);node.usedBytes=length;return length;}else if(node.usedBytes===0&&position===0){// If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
node.contents=buffer.slice(offset,offset+length);node.usedBytes=length;return length;}else if(position+length<=node.usedBytes){// Writing to an already allocated and used subrange of the file?
node.contents.set(buffer.subarray(offset,offset+length),position);return length;}}// Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
MEMFS.expandFileStorage(node,position+length);if(node.contents.subarray&&buffer.subarray){// Use typed array write which is available.
node.contents.set(buffer.subarray(offset,offset+length),position);}else{for(var i=0;i<length;i++){node.contents[position+i]=buffer[offset+i];// Or fall back to manual write if not.
}}node.usedBytes=Math.max(node.usedBytes,position+length);return length;},llseek:function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position;}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.usedBytes;}}if(position<0){throw new FS.ErrnoError(28);}return position;},allocate:function(stream,offset,length){MEMFS.expandFileStorage(stream.node,offset+length);stream.node.usedBytes=Math.max(stream.node.usedBytes,offset+length);},mmap:function(stream,address,length,position,prot,flags){if(address!==0){// We don't currently support location hints for the address of the mapping
throw new FS.ErrnoError(28);}if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43);}var ptr;var allocated;var contents=stream.node.contents;// Only make a new copy when MAP_PRIVATE is specified.
if(!(flags&2)&&contents.buffer===buffer){// We can't emulate MAP_SHARED when the file is not backed by the buffer
// we're mapping to (e.g. the HEAP buffer).
allocated=false;ptr=contents.byteOffset;}else{// Try to avoid unnecessary slices.
if(position>0||position+length<contents.length){if(contents.subarray){contents=contents.subarray(position,position+length);}else{contents=Array.prototype.slice.call(contents,position,position+length);}}allocated=true;ptr=mmapAlloc(length);if(!ptr){throw new FS.ErrnoError(48);}HEAP8.set(contents,ptr);}return{ptr:ptr,allocated:allocated};},msync:function(stream,buffer,offset,length,mmapFlags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43);}if(mmapFlags&2){// MAP_PRIVATE calls need not to be synced back to underlying fs
return 0;}var bytesWritten=MEMFS.stream_ops.write(stream,buffer,0,length,offset,false);// should we check if bytesWritten and length are the same?
return 0;}}};/** @param {boolean=} noRunDep */function asyncLoad(url,onload,onerror,noRunDep){var dep=!noRunDep?getUniqueRunDependency('al '+url):'';readAsync(url,function(arrayBuffer){assert(arrayBuffer,'Loading data file "'+url+'" failed (no arrayBuffer).');onload(new Uint8Array(arrayBuffer));if(dep)removeRunDependency(dep);},function(event){if(onerror){onerror();}else{throw'Loading data file "'+url+'" failed.';}});if(dep)addRunDependency(dep);}var ERRNO_CODES={};var NODEFS={isWindows:false,staticInit:()=>{NODEFS.isWindows=!!process.platform.match(/^win/);var flags=process["binding"]("constants");// Node.js 4 compatibility: it has no namespaces for constants
if(flags["fs"]){flags=flags["fs"];}NODEFS.flagsForNodeMap={"1024":flags["O_APPEND"],"64":flags["O_CREAT"],"128":flags["O_EXCL"],"256":flags["O_NOCTTY"],"0":flags["O_RDONLY"],"2":flags["O_RDWR"],"4096":flags["O_SYNC"],"512":flags["O_TRUNC"],"1":flags["O_WRONLY"],"131072":flags["O_NOFOLLOW"]};},convertNodeCode:e=>{var code=e.code;return ERRNO_CODES[code];},mount:mount=>{return NODEFS.createNode(null,'/',NODEFS.getMode(mount.opts.root),0);},createNode:(parent,name,mode,dev)=>{if(!FS.isDir(mode)&&!FS.isFile(mode)&&!FS.isLink(mode)){throw new FS.ErrnoError(28);}var node=FS.createNode(parent,name,mode);node.node_ops=NODEFS.node_ops;node.stream_ops=NODEFS.stream_ops;return node;},getMode:path=>{var stat;try{stat=fs.lstatSync(path);if(NODEFS.isWindows){// Node.js on Windows never represents permission bit 'x', so
// propagate read bits to execute bits
stat.mode=stat.mode|(stat.mode&292)>>2;}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}return stat.mode;},realPath:node=>{var parts=[];while(node.parent!==node){parts.push(node.name);node=node.parent;}parts.push(node.mount.opts.root);parts.reverse();return PATH.join.apply(null,parts);},flagsForNode:flags=>{flags&=~2097152;// Ignore this flag from musl, otherwise node.js fails to open the file.
flags&=~2048;// Ignore this flag from musl, otherwise node.js fails to open the file.
flags&=~32768;// Ignore this flag from musl, otherwise node.js fails to open the file.
flags&=~524288;// Some applications may pass it; it makes no sense for a single process.
flags&=~65536;// Node.js doesn't need this passed in, it errors.
var newFlags=0;for(var k in NODEFS.flagsForNodeMap){if(flags&k){newFlags|=NODEFS.flagsForNodeMap[k];flags^=k;}}if(!flags){return newFlags;}else{throw new FS.ErrnoError(28);}},node_ops:{getattr:node=>{var path=NODEFS.realPath(node);var stat;try{stat=fs.lstatSync(path);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}// node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
// See http://support.microsoft.com/kb/140365
if(NODEFS.isWindows&&!stat.blksize){stat.blksize=4096;}if(NODEFS.isWindows&&!stat.blocks){stat.blocks=(stat.size+stat.blksize-1)/stat.blksize|0;}return{dev:stat.dev,ino:stat.ino,mode:stat.mode,nlink:stat.nlink,uid:stat.uid,gid:stat.gid,rdev:stat.rdev,size:stat.size,atime:stat.atime,mtime:stat.mtime,ctime:stat.ctime,blksize:stat.blksize,blocks:stat.blocks};},setattr:(node,attr)=>{var path=NODEFS.realPath(node);try{if(attr.mode!==undefined){fs.chmodSync(path,attr.mode);// update the common node structure mode as well
node.mode=attr.mode;}if(attr.timestamp!==undefined){var date=new Date(attr.timestamp);fs.utimesSync(path,date,date);}if(attr.size!==undefined){fs.truncateSync(path,attr.size);}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}},lookup:(parent,name)=>{var path=PATH.join2(NODEFS.realPath(parent),name);var mode=NODEFS.getMode(path);return NODEFS.createNode(parent,name,mode);},mknod:(parent,name,mode,dev)=>{var node=NODEFS.createNode(parent,name,mode,dev);// create the backing node for this in the fs root as well
var path=NODEFS.realPath(node);try{if(FS.isDir(node.mode)){fs.mkdirSync(path,node.mode);}else{fs.writeFileSync(path,'',{mode:node.mode});}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}return node;},rename:(oldNode,newDir,newName)=>{var oldPath=NODEFS.realPath(oldNode);var newPath=PATH.join2(NODEFS.realPath(newDir),newName);try{fs.renameSync(oldPath,newPath);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}oldNode.name=newName;},unlink:(parent,name)=>{var path=PATH.join2(NODEFS.realPath(parent),name);try{fs.unlinkSync(path);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}},rmdir:(parent,name)=>{var path=PATH.join2(NODEFS.realPath(parent),name);try{fs.rmdirSync(path);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}},readdir:node=>{var path=NODEFS.realPath(node);try{return fs.readdirSync(path);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}},symlink:(parent,newName,oldPath)=>{var newPath=PATH.join2(NODEFS.realPath(parent),newName);try{fs.symlinkSync(oldPath,newPath);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}},readlink:node=>{var path=NODEFS.realPath(node);try{path=fs.readlinkSync(path);path=nodePath.relative(nodePath.resolve(node.mount.opts.root),path);return path;}catch(e){if(!e.code)throw e;// node under windows can return code 'UNKNOWN' here:
// https://github.com/emscripten-core/emscripten/issues/15468
if(e.code==='UNKNOWN')throw new FS.ErrnoError(28);throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}}},stream_ops:{open:stream=>{var path=NODEFS.realPath(stream.node);try{if(FS.isFile(stream.node.mode)){stream.nfd=fs.openSync(path,NODEFS.flagsForNode(stream.flags));}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}},close:stream=>{try{if(FS.isFile(stream.node.mode)&&stream.nfd){fs.closeSync(stream.nfd);}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}},read:(stream,buffer,offset,length,position)=>{// Node.js < 6 compatibility: node errors on 0 length reads
if(length===0)return 0;try{return fs.readSync(stream.nfd,Buffer.from(buffer.buffer),offset,length,position);}catch(e){throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}},write:(stream,buffer,offset,length,position)=>{try{return fs.writeSync(stream.nfd,Buffer.from(buffer.buffer),offset,length,position);}catch(e){throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}},llseek:(stream,offset,whence)=>{var position=offset;if(whence===1){position+=stream.position;}else if(whence===2){if(FS.isFile(stream.node.mode)){try{var stat=fs.fstatSync(stream.nfd);position+=stat.size;}catch(e){throw new FS.ErrnoError(NODEFS.convertNodeCode(e));}}}if(position<0){throw new FS.ErrnoError(28);}return position;},mmap:(stream,address,length,position,prot,flags)=>{if(address!==0){// We don't currently support location hints for the address of the mapping
throw new FS.ErrnoError(28);}if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43);}var ptr=mmapAlloc(length);NODEFS.stream_ops.read(stream,HEAP8,ptr,length,position);return{ptr:ptr,allocated:true};},msync:(stream,buffer,offset,length,mmapFlags)=>{if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43);}if(mmapFlags&2){// MAP_PRIVATE calls need not to be synced back to underlying fs
return 0;}var bytesWritten=NODEFS.stream_ops.write(stream,buffer,0,length,offset,false);return 0;}}};var FS={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},filesystems:null,syncFSRequests:0,lookupPath:(path,opts={})=>{path=PATH_FS.resolve(FS.cwd(),path);if(!path)return{path:'',node:null};var defaults={follow_mount:true,recurse_count:0};opts=Object.assign(defaults,opts);if(opts.recurse_count>8){// max recursive lookup of 8
throw new FS.ErrnoError(32);}// split the path
var parts=PATH.normalizeArray(path.split('/').filter(p=>!!p),false);// start at the root
var current=FS.root;var current_path='/';for(var i=0;i<parts.length;i++){var islast=i===parts.length-1;if(islast&&opts.parent){// stop resolving
break;}current=FS.lookupNode(current,parts[i]);current_path=PATH.join2(current_path,parts[i]);// jump to the mount's root node if this is a mountpoint
if(FS.isMountpoint(current)){if(!islast||islast&&opts.follow_mount){current=current.mounted.root;}}// by default, lookupPath will not follow a symlink if it is the final path component.
// setting opts.follow = true will override this behavior.
if(!islast||opts.follow){var count=0;while(FS.isLink(current.mode)){var link=FS.readlink(current_path);current_path=PATH_FS.resolve(PATH.dirname(current_path),link);var lookup=FS.lookupPath(current_path,{recurse_count:opts.recurse_count+1});current=lookup.node;if(count++>40){// limit max consecutive symlinks to 40 (SYMLOOP_MAX).
throw new FS.ErrnoError(32);}}}}return{path:current_path,node:current};},getPath:node=>{var path;while(true){if(FS.isRoot(node)){var mount=node.mount.mountpoint;if(!path)return mount;return mount[mount.length-1]!=='/'?mount+'/'+path:mount+path;}path=path?node.name+'/'+path:node.name;node=node.parent;}},hashName:(parentid,name)=>{var hash=0;for(var i=0;i<name.length;i++){hash=(hash<<5)-hash+name.charCodeAt(i)|0;}return(parentid+hash>>>0)%FS.nameTable.length;},hashAddNode:node=>{var hash=FS.hashName(node.parent.id,node.name);node.name_next=FS.nameTable[hash];FS.nameTable[hash]=node;},hashRemoveNode:node=>{var hash=FS.hashName(node.parent.id,node.name);if(FS.nameTable[hash]===node){FS.nameTable[hash]=node.name_next;}else{var current=FS.nameTable[hash];while(current){if(current.name_next===node){current.name_next=node.name_next;break;}current=current.name_next;}}},lookupNode:(parent,name)=>{var errCode=FS.mayLookup(parent);if(errCode){throw new FS.ErrnoError(errCode,parent);}var hash=FS.hashName(parent.id,name);for(var node=FS.nameTable[hash];node;node=node.name_next){var nodeName=node.name;if(node.parent.id===parent.id&&nodeName===name){return node;}}// if we failed to find it in the cache, call into the VFS
return FS.lookup(parent,name);},createNode:(parent,name,mode,rdev)=>{var node=new FS.FSNode(parent,name,mode,rdev);FS.hashAddNode(node);return node;},destroyNode:node=>{FS.hashRemoveNode(node);},isRoot:node=>{return node===node.parent;},isMountpoint:node=>{return!!node.mounted;},isFile:mode=>{return(mode&61440)===32768;},isDir:mode=>{return(mode&61440)===16384;},isLink:mode=>{return(mode&61440)===40960;},isChrdev:mode=>{return(mode&61440)===8192;},isBlkdev:mode=>{return(mode&61440)===24576;},isFIFO:mode=>{return(mode&61440)===4096;},isSocket:mode=>{return(mode&49152)===49152;},flagModes:{"r":0,"r+":2,"w":577,"w+":578,"a":1089,"a+":1090},modeStringToFlags:str=>{var flags=FS.flagModes[str];if(typeof flags=='undefined'){throw new Error('Unknown file open mode: '+str);}return flags;},flagsToPermissionString:flag=>{var perms=['r','w','rw'][flag&3];if(flag&512){perms+='w';}return perms;},nodePermissions:(node,perms)=>{if(FS.ignorePermissions){return 0;}// return 0 if any user, group or owner bits are set.
if(perms.includes('r')&&!(node.mode&292)){return 2;}else if(perms.includes('w')&&!(node.mode&146)){return 2;}else if(perms.includes('x')&&!(node.mode&73)){return 2;}return 0;},mayLookup:dir=>{var errCode=FS.nodePermissions(dir,'x');if(errCode)return errCode;if(!dir.node_ops.lookup)return 2;return 0;},mayCreate:(dir,name)=>{try{var node=FS.lookupNode(dir,name);return 20;}catch(e){}return FS.nodePermissions(dir,'wx');},mayDelete:(dir,name,isdir)=>{var node;try{node=FS.lookupNode(dir,name);}catch(e){return e.errno;}var errCode=FS.nodePermissions(dir,'wx');if(errCode){return errCode;}if(isdir){if(!FS.isDir(node.mode)){return 54;}if(FS.isRoot(node)||FS.getPath(node)===FS.cwd()){return 10;}}else{if(FS.isDir(node.mode)){return 31;}}return 0;},mayOpen:(node,flags)=>{if(!node){return 44;}if(FS.isLink(node.mode)){return 32;}else if(FS.isDir(node.mode)){if(FS.flagsToPermissionString(flags)!=='r'||// opening for write
flags&512){// TODO: check for O_SEARCH? (== search for dir only)
return 31;}}return FS.nodePermissions(node,FS.flagsToPermissionString(flags));},MAX_OPEN_FDS:4096,nextfd:(fd_start=0,fd_end=FS.MAX_OPEN_FDS)=>{for(var fd=fd_start;fd<=fd_end;fd++){if(!FS.streams[fd]){return fd;}}throw new FS.ErrnoError(33);},getStream:fd=>FS.streams[fd],createStream:(stream,fd_start,fd_end)=>{if(!FS.FSStream){FS.FSStream=/** @constructor */function(){this.shared={};};FS.FSStream.prototype={object:{get:function(){return this.node;},set:function(val){this.node=val;}},isRead:{get:function(){return(this.flags&2097155)!==1;}},isWrite:{get:function(){return(this.flags&2097155)!==0;}},isAppend:{get:function(){return this.flags&1024;}},flags:{get:function(){return this.shared.flags;},set:function(val){this.shared.flags=val;}},position:{get function(){return this.shared.position;},set:function(val){this.shared.position=val;}}};}// clone it, so we can return an instance of FSStream
stream=Object.assign(new FS.FSStream(),stream);var fd=FS.nextfd(fd_start,fd_end);stream.fd=fd;FS.streams[fd]=stream;return stream;},closeStream:fd=>{FS.streams[fd]=null;},chrdev_stream_ops:{open:stream=>{var device=FS.getDevice(stream.node.rdev);// override node's stream ops with the device's
stream.stream_ops=device.stream_ops;// forward the open call
if(stream.stream_ops.open){stream.stream_ops.open(stream);}},llseek:()=>{throw new FS.ErrnoError(70);}},major:dev=>dev>>8,minor:dev=>dev&0xff,makedev:(ma,mi)=>ma<<8|mi,registerDevice:(dev,ops)=>{FS.devices[dev]={stream_ops:ops};},getDevice:dev=>FS.devices[dev],getMounts:mount=>{var mounts=[];var check=[mount];while(check.length){var m=check.pop();mounts.push(m);check.push.apply(check,m.mounts);}return mounts;},syncfs:(populate,callback)=>{if(typeof populate=='function'){callback=populate;populate=false;}FS.syncFSRequests++;if(FS.syncFSRequests>1){err('warning: '+FS.syncFSRequests+' FS.syncfs operations in flight at once, probably just doing extra work');}var mounts=FS.getMounts(FS.root.mount);var completed=0;function doCallback(errCode){FS.syncFSRequests--;return callback(errCode);}function done(errCode){if(errCode){if(!done.errored){done.errored=true;return doCallback(errCode);}return;}if(++completed>=mounts.length){doCallback(null);}};// sync all mounts
mounts.forEach(mount=>{if(!mount.type.syncfs){return done(null);}mount.type.syncfs(mount,populate,done);});},mount:(type,opts,mountpoint)=>{var root=mountpoint==='/';var pseudo=!mountpoint;var node;if(root&&FS.root){throw new FS.ErrnoError(10);}else if(!root&&!pseudo){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});mountpoint=lookup.path;// use the absolute path
node=lookup.node;if(FS.isMountpoint(node)){throw new FS.ErrnoError(10);}if(!FS.isDir(node.mode)){throw new FS.ErrnoError(54);}}var mount={type:type,opts:opts,mountpoint:mountpoint,mounts:[]};// create a root node for the fs
var mountRoot=type.mount(mount);mountRoot.mount=mount;mount.root=mountRoot;if(root){FS.root=mountRoot;}else if(node){// set as a mountpoint
node.mounted=mount;// add the new mount to the current mount's children
if(node.mount){node.mount.mounts.push(mount);}}return mountRoot;},unmount:mountpoint=>{var lookup=FS.lookupPath(mountpoint,{follow_mount:false});if(!FS.isMountpoint(lookup.node)){throw new FS.ErrnoError(28);}// destroy the nodes for this mount, and all its child mounts
var node=lookup.node;var mount=node.mounted;var mounts=FS.getMounts(mount);Object.keys(FS.nameTable).forEach(hash=>{var current=FS.nameTable[hash];while(current){var next=current.name_next;if(mounts.includes(current.mount)){FS.destroyNode(current);}current=next;}});// no longer a mountpoint
node.mounted=null;// remove this mount from the child mounts
var idx=node.mount.mounts.indexOf(mount);node.mount.mounts.splice(idx,1);},lookup:(parent,name)=>{return parent.node_ops.lookup(parent,name);},mknod:(path,mode,dev)=>{var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);if(!name||name==='.'||name==='..'){throw new FS.ErrnoError(28);}var errCode=FS.mayCreate(parent,name);if(errCode){throw new FS.ErrnoError(errCode);}if(!parent.node_ops.mknod){throw new FS.ErrnoError(63);}return parent.node_ops.mknod(parent,name,mode,dev);},create:(path,mode)=>{mode=mode!==undefined?mode:438/* 0666 */;mode&=4095;mode|=32768;return FS.mknod(path,mode,0);},mkdir:(path,mode)=>{mode=mode!==undefined?mode:511/* 0777 */;mode&=511|512;mode|=16384;return FS.mknod(path,mode,0);},mkdirTree:(path,mode)=>{var dirs=path.split('/');var d='';for(var i=0;i<dirs.length;++i){if(!dirs[i])continue;d+='/'+dirs[i];try{FS.mkdir(d,mode);}catch(e){if(e.errno!=20)throw e;}}},mkdev:(path,mode,dev)=>{if(typeof dev=='undefined'){dev=mode;mode=438/* 0666 */;}mode|=8192;return FS.mknod(path,mode,dev);},symlink:(oldpath,newpath)=>{if(!PATH_FS.resolve(oldpath)){throw new FS.ErrnoError(44);}var lookup=FS.lookupPath(newpath,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(44);}var newname=PATH.basename(newpath);var errCode=FS.mayCreate(parent,newname);if(errCode){throw new FS.ErrnoError(errCode);}if(!parent.node_ops.symlink){throw new FS.ErrnoError(63);}return parent.node_ops.symlink(parent,newname,oldpath);},rename:(old_path,new_path)=>{var old_dirname=PATH.dirname(old_path);var new_dirname=PATH.dirname(new_path);var old_name=PATH.basename(old_path);var new_name=PATH.basename(new_path);// parents must exist
var lookup,old_dir,new_dir;// let the errors from non existant directories percolate up
lookup=FS.lookupPath(old_path,{parent:true});old_dir=lookup.node;lookup=FS.lookupPath(new_path,{parent:true});new_dir=lookup.node;if(!old_dir||!new_dir)throw new FS.ErrnoError(44);// need to be part of the same mount
if(old_dir.mount!==new_dir.mount){throw new FS.ErrnoError(75);}// source must exist
var old_node=FS.lookupNode(old_dir,old_name);// old path should not be an ancestor of the new path
var relative=PATH_FS.relative(old_path,new_dirname);if(relative.charAt(0)!=='.'){throw new FS.ErrnoError(28);}// new path should not be an ancestor of the old path
relative=PATH_FS.relative(new_path,old_dirname);if(relative.charAt(0)!=='.'){throw new FS.ErrnoError(55);}// see if the new path already exists
var new_node;try{new_node=FS.lookupNode(new_dir,new_name);}catch(e){// not fatal
}// early out if nothing needs to change
if(old_node===new_node){return;}// we'll need to delete the old entry
var isdir=FS.isDir(old_node.mode);var errCode=FS.mayDelete(old_dir,old_name,isdir);if(errCode){throw new FS.ErrnoError(errCode);}// need delete permissions if we'll be overwriting.
// need create permissions if new doesn't already exist.
errCode=new_node?FS.mayDelete(new_dir,new_name,isdir):FS.mayCreate(new_dir,new_name);if(errCode){throw new FS.ErrnoError(errCode);}if(!old_dir.node_ops.rename){throw new FS.ErrnoError(63);}if(FS.isMountpoint(old_node)||new_node&&FS.isMountpoint(new_node)){throw new FS.ErrnoError(10);}// if we are going to change the parent, check write permissions
if(new_dir!==old_dir){errCode=FS.nodePermissions(old_dir,'w');if(errCode){throw new FS.ErrnoError(errCode);}}// remove the node from the lookup hash
FS.hashRemoveNode(old_node);// do the underlying fs rename
try{old_dir.node_ops.rename(old_node,new_dir,new_name);}catch(e){throw e;}finally{// add the node back to the hash (in case node_ops.rename
// changed its name)
FS.hashAddNode(old_node);}},rmdir:path=>{var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var errCode=FS.mayDelete(parent,name,true);if(errCode){throw new FS.ErrnoError(errCode);}if(!parent.node_ops.rmdir){throw new FS.ErrnoError(63);}if(FS.isMountpoint(node)){throw new FS.ErrnoError(10);}parent.node_ops.rmdir(parent,name);FS.destroyNode(node);},readdir:path=>{var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;if(!node.node_ops.readdir){throw new FS.ErrnoError(54);}return node.node_ops.readdir(node);},unlink:path=>{var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(44);}var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var errCode=FS.mayDelete(parent,name,false);if(errCode){// According to POSIX, we should map EISDIR to EPERM, but
// we instead do what Linux does (and we must, as we use
// the musl linux libc).
throw new FS.ErrnoError(errCode);}if(!parent.node_ops.unlink){throw new FS.ErrnoError(63);}if(FS.isMountpoint(node)){throw new FS.ErrnoError(10);}parent.node_ops.unlink(parent,name);FS.destroyNode(node);},readlink:path=>{var lookup=FS.lookupPath(path);var link=lookup.node;if(!link){throw new FS.ErrnoError(44);}if(!link.node_ops.readlink){throw new FS.ErrnoError(28);}return PATH_FS.resolve(FS.getPath(link.parent),link.node_ops.readlink(link));},stat:(path,dontFollow)=>{var lookup=FS.lookupPath(path,{follow:!dontFollow});var node=lookup.node;if(!node){throw new FS.ErrnoError(44);}if(!node.node_ops.getattr){throw new FS.ErrnoError(63);}return node.node_ops.getattr(node);},lstat:path=>{return FS.stat(path,true);},chmod:(path,mode,dontFollow)=>{var node;if(typeof path=='string'){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node;}else{node=path;}if(!node.node_ops.setattr){throw new FS.ErrnoError(63);}node.node_ops.setattr(node,{mode:mode&4095|node.mode&~4095,timestamp:Date.now()});},lchmod:(path,mode)=>{FS.chmod(path,mode,true);},fchmod:(fd,mode)=>{var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(8);}FS.chmod(stream.node,mode);},chown:(path,uid,gid,dontFollow)=>{var node;if(typeof path=='string'){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node;}else{node=path;}if(!node.node_ops.setattr){throw new FS.ErrnoError(63);}node.node_ops.setattr(node,{timestamp:Date.now()// we ignore the uid / gid for now
});},lchown:(path,uid,gid)=>{FS.chown(path,uid,gid,true);},fchown:(fd,uid,gid)=>{var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(8);}FS.chown(stream.node,uid,gid);},truncate:(path,len)=>{if(len<0){throw new FS.ErrnoError(28);}var node;if(typeof path=='string'){var lookup=FS.lookupPath(path,{follow:true});node=lookup.node;}else{node=path;}if(!node.node_ops.setattr){throw new FS.ErrnoError(63);}if(FS.isDir(node.mode)){throw new FS.ErrnoError(31);}if(!FS.isFile(node.mode)){throw new FS.ErrnoError(28);}var errCode=FS.nodePermissions(node,'w');if(errCode){throw new FS.ErrnoError(errCode);}node.node_ops.setattr(node,{size:len,timestamp:Date.now()});},ftruncate:(fd,len)=>{var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(8);}if((stream.flags&2097155)===0){throw new FS.ErrnoError(28);}FS.truncate(stream.node,len);},utime:(path,atime,mtime)=>{var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;node.node_ops.setattr(node,{timestamp:Math.max(atime,mtime)});},open:(path,flags,mode)=>{if(path===""){throw new FS.ErrnoError(44);}flags=typeof flags=='string'?FS.modeStringToFlags(flags):flags;mode=typeof mode=='undefined'?438/* 0666 */:mode;if(flags&64){mode=mode&4095|32768;}else{mode=0;}var node;if(typeof path=='object'){node=path;}else{path=PATH.normalize(path);try{var lookup=FS.lookupPath(path,{follow:!(flags&131072)});node=lookup.node;}catch(e){// ignore
}}// perhaps we need to create the node
var created=false;if(flags&64){if(node){// if O_CREAT and O_EXCL are set, error out if the node already exists
if(flags&128){throw new FS.ErrnoError(20);}}else{// node doesn't exist, try to create it
node=FS.mknod(path,mode,0);created=true;}}if(!node){throw new FS.ErrnoError(44);}// can't truncate a device
if(FS.isChrdev(node.mode)){flags&=~512;}// if asked only for a directory, then this must be one
if(flags&65536&&!FS.isDir(node.mode)){throw new FS.ErrnoError(54);}// check permissions, if this is not a file we just created now (it is ok to
// create and write to a file with read-only permissions; it is read-only
// for later use)
if(!created){var errCode=FS.mayOpen(node,flags);if(errCode){throw new FS.ErrnoError(errCode);}}// do truncation if necessary
if(flags&512&&!created){FS.truncate(node,0);}// we've already handled these, don't pass down to the underlying vfs
flags&=~(128|512|131072);// register the stream with the filesystem
var stream=FS.createStream({node:node,path:FS.getPath(node),// we want the absolute path to the node
flags:flags,seekable:true,position:0,stream_ops:node.stream_ops,// used by the file family libc calls (fopen, fwrite, ferror, etc.)
ungotten:[],error:false});// call the new stream's open function
if(stream.stream_ops.open){stream.stream_ops.open(stream);}if(Module['logReadFiles']&&!(flags&1)){if(!FS.readFiles)FS.readFiles={};if(!(path in FS.readFiles)){FS.readFiles[path]=1;}}return stream;},close:stream=>{if(FS.isClosed(stream)){throw new FS.ErrnoError(8);}if(stream.getdents)stream.getdents=null;// free readdir state
try{if(stream.stream_ops.close){stream.stream_ops.close(stream);}}catch(e){throw e;}finally{FS.closeStream(stream.fd);}stream.fd=null;},isClosed:stream=>{return stream.fd===null;},llseek:(stream,offset,whence)=>{if(FS.isClosed(stream)){throw new FS.ErrnoError(8);}if(!stream.seekable||!stream.stream_ops.llseek){throw new FS.ErrnoError(70);}if(whence!=0&&whence!=1&&whence!=2){throw new FS.ErrnoError(28);}stream.position=stream.stream_ops.llseek(stream,offset,whence);stream.ungotten=[];return stream.position;},read:(stream,buffer,offset,length,position)=>{if(length<0||position<0){throw new FS.ErrnoError(28);}if(FS.isClosed(stream)){throw new FS.ErrnoError(8);}if((stream.flags&2097155)===1){throw new FS.ErrnoError(8);}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(31);}if(!stream.stream_ops.read){throw new FS.ErrnoError(28);}var seeking=typeof position!='undefined';if(!seeking){position=stream.position;}else if(!stream.seekable){throw new FS.ErrnoError(70);}var bytesRead=stream.stream_ops.read(stream,buffer,offset,length,position);if(!seeking)stream.position+=bytesRead;return bytesRead;},write:(stream,buffer,offset,length,position,canOwn)=>{if(length<0||position<0){throw new FS.ErrnoError(28);}if(FS.isClosed(stream)){throw new FS.ErrnoError(8);}if((stream.flags&2097155)===0){throw new FS.ErrnoError(8);}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(31);}if(!stream.stream_ops.write){throw new FS.ErrnoError(28);}if(stream.seekable&&stream.flags&1024){// seek to the end before writing in append mode
FS.llseek(stream,0,2);}var seeking=typeof position!='undefined';if(!seeking){position=stream.position;}else if(!stream.seekable){throw new FS.ErrnoError(70);}var bytesWritten=stream.stream_ops.write(stream,buffer,offset,length,position,canOwn);if(!seeking)stream.position+=bytesWritten;return bytesWritten;},allocate:(stream,offset,length)=>{if(FS.isClosed(stream)){throw new FS.ErrnoError(8);}if(offset<0||length<=0){throw new FS.ErrnoError(28);}if((stream.flags&2097155)===0){throw new FS.ErrnoError(8);}if(!FS.isFile(stream.node.mode)&&!FS.isDir(stream.node.mode)){throw new FS.ErrnoError(43);}if(!stream.stream_ops.allocate){throw new FS.ErrnoError(138);}stream.stream_ops.allocate(stream,offset,length);},mmap:(stream,address,length,position,prot,flags)=>{// User requests writing to file (prot & PROT_WRITE != 0).
// Checking if we have permissions to write to the file unless
// MAP_PRIVATE flag is set. According to POSIX spec it is possible
// to write to file opened in read-only mode with MAP_PRIVATE flag,
// as all modifications will be visible only in the memory of
// the current process.
if((prot&2)!==0&&(flags&2)===0&&(stream.flags&2097155)!==2){throw new FS.ErrnoError(2);}if((stream.flags&2097155)===1){throw new FS.ErrnoError(2);}if(!stream.stream_ops.mmap){throw new FS.ErrnoError(43);}return stream.stream_ops.mmap(stream,address,length,position,prot,flags);},msync:(stream,buffer,offset,length,mmapFlags)=>{if(!stream||!stream.stream_ops.msync){return 0;}return stream.stream_ops.msync(stream,buffer,offset,length,mmapFlags);},munmap:stream=>0,ioctl:(stream,cmd,arg)=>{if(!stream.stream_ops.ioctl){throw new FS.ErrnoError(59);}return stream.stream_ops.ioctl(stream,cmd,arg);},readFile:(path,opts={})=>{opts.flags=opts.flags||0;opts.encoding=opts.encoding||'binary';if(opts.encoding!=='utf8'&&opts.encoding!=='binary'){throw new Error('Invalid encoding type "'+opts.encoding+'"');}var ret;var stream=FS.open(path,opts.flags);var stat=FS.stat(path);var length=stat.size;var buf=new Uint8Array(length);FS.read(stream,buf,0,length,0);if(opts.encoding==='utf8'){ret=UTF8ArrayToString(buf,0);}else if(opts.encoding==='binary'){ret=buf;}FS.close(stream);return ret;},writeFile:(path,data,opts={})=>{opts.flags=opts.flags||577;var stream=FS.open(path,opts.flags,opts.mode);if(typeof data=='string'){var buf=new Uint8Array(lengthBytesUTF8(data)+1);var actualNumBytes=stringToUTF8Array(data,buf,0,buf.length);FS.write(stream,buf,0,actualNumBytes,undefined,opts.canOwn);}else if(ArrayBuffer.isView(data)){FS.write(stream,data,0,data.byteLength,undefined,opts.canOwn);}else{throw new Error('Unsupported data type');}FS.close(stream);},cwd:()=>FS.currentPath,chdir:path=>{var lookup=FS.lookupPath(path,{follow:true});if(lookup.node===null){throw new FS.ErrnoError(44);}if(!FS.isDir(lookup.node.mode)){throw new FS.ErrnoError(54);}var errCode=FS.nodePermissions(lookup.node,'x');if(errCode){throw new FS.ErrnoError(errCode);}FS.currentPath=lookup.path;},createDefaultDirectories:()=>{FS.mkdir('/tmp');FS.mkdir('/home');FS.mkdir('/home/web_user');},createDefaultDevices:()=>{// create /dev
FS.mkdir('/dev');// setup /dev/null
FS.registerDevice(FS.makedev(1,3),{read:()=>0,write:(stream,buffer,offset,length,pos)=>length});FS.mkdev('/dev/null',FS.makedev(1,3));// setup /dev/tty and /dev/tty1
// stderr needs to print output using err() rather than out()
// so we register a second tty just for it.
TTY.register(FS.makedev(5,0),TTY.default_tty_ops);TTY.register(FS.makedev(6,0),TTY.default_tty1_ops);FS.mkdev('/dev/tty',FS.makedev(5,0));FS.mkdev('/dev/tty1',FS.makedev(6,0));// setup /dev/[u]random
var random_device=getRandomDevice();FS.createDevice('/dev','random',random_device);FS.createDevice('/dev','urandom',random_device);// we're not going to emulate the actual shm device,
// just create the tmp dirs that reside in it commonly
FS.mkdir('/dev/shm');FS.mkdir('/dev/shm/tmp');},createSpecialDirectories:()=>{// create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
// name of the stream for fd 6 (see test_unistd_ttyname)
FS.mkdir('/proc');var proc_self=FS.mkdir('/proc/self');FS.mkdir('/proc/self/fd');FS.mount({mount:()=>{var node=FS.createNode(proc_self,'fd',16384|511/* 0777 */,73);node.node_ops={lookup:(parent,name)=>{var fd=+name;var stream=FS.getStream(fd);if(!stream)throw new FS.ErrnoError(8);var ret={parent:null,mount:{mountpoint:'fake'},node_ops:{readlink:()=>stream.path}};ret.parent=ret;// make it look like a simple root node
return ret;}};return node;}},{},'/proc/self/fd');},createStandardStreams:()=>{// TODO deprecate the old functionality of a single
// input / output callback and that utilizes FS.createDevice
// and instead require a unique set of stream ops
// by default, we symlink the standard streams to the
// default tty devices. however, if the standard streams
// have been overwritten we create a unique device for
// them instead.
if(Module['stdin']){FS.createDevice('/dev','stdin',Module['stdin']);}else{FS.symlink('/dev/tty','/dev/stdin');}if(Module['stdout']){FS.createDevice('/dev','stdout',null,Module['stdout']);}else{FS.symlink('/dev/tty','/dev/stdout');}if(Module['stderr']){FS.createDevice('/dev','stderr',null,Module['stderr']);}else{FS.symlink('/dev/tty1','/dev/stderr');}// open default streams for the stdin, stdout and stderr devices
var stdin=FS.open('/dev/stdin',0);var stdout=FS.open('/dev/stdout',1);var stderr=FS.open('/dev/stderr',1);},ensureErrnoError:()=>{if(FS.ErrnoError)return;FS.ErrnoError=/** @this{Object} */function ErrnoError(errno,node){this.node=node;this.setErrno=/** @this{Object} */function(errno){this.errno=errno;};this.setErrno(errno);this.message='FS error';};FS.ErrnoError.prototype=new Error();FS.ErrnoError.prototype.constructor=FS.ErrnoError;// Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
[44].forEach(code=>{FS.genericErrors[code]=new FS.ErrnoError(code);FS.genericErrors[code].stack='<generic error, no stack>';});},staticInit:()=>{FS.ensureErrnoError();FS.nameTable=new Array(4096);FS.mount(MEMFS,{},'/');FS.createDefaultDirectories();FS.createDefaultDevices();FS.createSpecialDirectories();FS.filesystems={'MEMFS':MEMFS,'NODEFS':NODEFS};},init:(input,output,error)=>{FS.init.initialized=true;FS.ensureErrnoError();// Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
Module['stdin']=input||Module['stdin'];Module['stdout']=output||Module['stdout'];Module['stderr']=error||Module['stderr'];FS.createStandardStreams();},quit:()=>{FS.init.initialized=false;// Call musl-internal function to close all stdio streams, so nothing is
// left in internal buffers.
// close all of our streams
for(var i=0;i<FS.streams.length;i++){var stream=FS.streams[i];if(!stream){continue;}FS.close(stream);}},getMode:(canRead,canWrite)=>{var mode=0;if(canRead)mode|=292|73;if(canWrite)mode|=146;return mode;},findObject:(path,dontResolveLastLink)=>{var ret=FS.analyzePath(path,dontResolveLastLink);if(ret.exists){return ret.object;}else{return null;}},analyzePath:(path,dontResolveLastLink)=>{// operate from within the context of the symlink's target
try{var lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});path=lookup.path;}catch(e){}var ret={isRoot:false,exists:false,error:0,name:null,path:null,object:null,parentExists:false,parentPath:null,parentObject:null};try{var lookup=FS.lookupPath(path,{parent:true});ret.parentExists=true;ret.parentPath=lookup.path;ret.parentObject=lookup.node;ret.name=PATH.basename(path);lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});ret.exists=true;ret.path=lookup.path;ret.object=lookup.node;ret.name=lookup.node.name;ret.isRoot=lookup.path==='/';}catch(e){ret.error=e.errno;};return ret;},createPath:(parent,path,canRead,canWrite)=>{parent=typeof parent=='string'?parent:FS.getPath(parent);var parts=path.split('/').reverse();while(parts.length){var part=parts.pop();if(!part)continue;var current=PATH.join2(parent,part);try{FS.mkdir(current);}catch(e){// ignore EEXIST
}parent=current;}return current;},createFile:(parent,name,properties,canRead,canWrite)=>{var path=PATH.join2(typeof parent=='string'?parent:FS.getPath(parent),name);var mode=FS.getMode(canRead,canWrite);return FS.create(path,mode);},createDataFile:(parent,name,data,canRead,canWrite,canOwn)=>{var path=name;if(parent){parent=typeof parent=='string'?parent:FS.getPath(parent);path=name?PATH.join2(parent,name):parent;}var mode=FS.getMode(canRead,canWrite);var node=FS.create(path,mode);if(data){if(typeof data=='string'){var arr=new Array(data.length);for(var i=0,len=data.length;i<len;++i)arr[i]=data.charCodeAt(i);data=arr;}// make sure we can write to the file
FS.chmod(node,mode|146);var stream=FS.open(node,577);FS.write(stream,data,0,data.length,0,canOwn);FS.close(stream);FS.chmod(node,mode);}return node;},createDevice:(parent,name,input,output)=>{var path=PATH.join2(typeof parent=='string'?parent:FS.getPath(parent),name);var mode=FS.getMode(!!input,!!output);if(!FS.createDevice.major)FS.createDevice.major=64;var dev=FS.makedev(FS.createDevice.major++,0);// Create a fake device that a set of stream ops to emulate
// the old behavior.
FS.registerDevice(dev,{open:stream=>{stream.seekable=false;},close:stream=>{// flush any pending line data
if(output&&output.buffer&&output.buffer.length){output(10);}},read:(stream,buffer,offset,length,pos/* ignored */)=>{var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=input();}catch(e){throw new FS.ErrnoError(29);}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(6);}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result;}if(bytesRead){stream.node.timestamp=Date.now();}return bytesRead;},write:(stream,buffer,offset,length,pos)=>{for(var i=0;i<length;i++){try{output(buffer[offset+i]);}catch(e){throw new FS.ErrnoError(29);}}if(length){stream.node.timestamp=Date.now();}return i;}});return FS.mkdev(path,mode,dev);},forceLoadFile:obj=>{if(obj.isDevice||obj.isFolder||obj.link||obj.contents)return true;if(typeof XMLHttpRequest!='undefined'){throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");}else if(read_){// Command-line.
try{// WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
//          read() will try to parse UTF8.
obj.contents=intArrayFromString(read_(obj.url),true);obj.usedBytes=obj.contents.length;}catch(e){throw new FS.ErrnoError(29);}}else{throw new Error('Cannot load without read() or XMLHttpRequest.');}},createLazyFile:(parent,name,url,canRead,canWrite)=>{// Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
/** @constructor */function LazyUint8Array(){this.lengthKnown=false;this.chunks=[];// Loaded chunks. Index is the chunk number
}LazyUint8Array.prototype.get=/** @this{Object} */function LazyUint8Array_get(idx){if(idx>this.length-1||idx<0){return undefined;}var chunkOffset=idx%this.chunkSize;var chunkNum=idx/this.chunkSize|0;return this.getter(chunkNum)[chunkOffset];};LazyUint8Array.prototype.setDataGetter=function LazyUint8Array_setDataGetter(getter){this.getter=getter;};LazyUint8Array.prototype.cacheLength=function LazyUint8Array_cacheLength(){// Find length
var xhr=new XMLHttpRequest();xhr.open('HEAD',url,false);xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);var datalength=Number(xhr.getResponseHeader("Content-length"));var header;var hasByteServing=(header=xhr.getResponseHeader("Accept-Ranges"))&&header==="bytes";var usesGzip=(header=xhr.getResponseHeader("Content-Encoding"))&&header==="gzip";var chunkSize=1024*1024;// Chunk size in bytes
if(!hasByteServing)chunkSize=datalength;// Function to get a range from the remote URL.
var doXHR=(from,to)=>{if(from>to)throw new Error("invalid range ("+from+", "+to+") or no bytes requested!");if(to>datalength-1)throw new Error("only "+datalength+" bytes available! programmer error!");// TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
var xhr=new XMLHttpRequest();xhr.open('GET',url,false);if(datalength!==chunkSize)xhr.setRequestHeader("Range","bytes="+from+"-"+to);// Some hints to the browser that we want binary data.
xhr.responseType='arraybuffer';if(xhr.overrideMimeType){xhr.overrideMimeType('text/plain; charset=x-user-defined');}xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);if(xhr.response!==undefined){return new Uint8Array(/** @type{Array<number>} */xhr.response||[]);}else{return intArrayFromString(xhr.responseText||'',true);}};var lazyArray=this;lazyArray.setDataGetter(chunkNum=>{var start=chunkNum*chunkSize;var end=(chunkNum+1)*chunkSize-1;// including this byte
end=Math.min(end,datalength-1);// if datalength-1 is selected, this is the last block
if(typeof lazyArray.chunks[chunkNum]=='undefined'){lazyArray.chunks[chunkNum]=doXHR(start,end);}if(typeof lazyArray.chunks[chunkNum]=='undefined')throw new Error('doXHR failed!');return lazyArray.chunks[chunkNum];});if(usesGzip||!datalength){// if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
chunkSize=datalength=1;// this will force getter(0)/doXHR do download the whole file
datalength=this.getter(0).length;chunkSize=datalength;out("LazyFiles on gzip forces download of the whole file when length is accessed");}this._length=datalength;this._chunkSize=chunkSize;this.lengthKnown=true;};if(typeof XMLHttpRequest!='undefined'){if(!ENVIRONMENT_IS_WORKER)throw'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';var lazyArray=new LazyUint8Array();Object.defineProperties(lazyArray,{length:{get:/** @this{Object} */function(){if(!this.lengthKnown){this.cacheLength();}return this._length;}},chunkSize:{get:/** @this{Object} */function(){if(!this.lengthKnown){this.cacheLength();}return this._chunkSize;}}});var properties={isDevice:false,contents:lazyArray};}else{var properties={isDevice:false,url:url};}var node=FS.createFile(parent,name,properties,canRead,canWrite);// This is a total hack, but I want to get this lazy file code out of the
// core of MEMFS. If we want to keep this lazy file concept I feel it should
// be its own thin LAZYFS proxying calls to MEMFS.
if(properties.contents){node.contents=properties.contents;}else if(properties.url){node.contents=null;node.url=properties.url;}// Add a function that defers querying the file size until it is asked the first time.
Object.defineProperties(node,{usedBytes:{get:/** @this {FSNode} */function(){return this.contents.length;}}});// override each stream op with one that tries to force load the lazy file first
var stream_ops={};var keys=Object.keys(node.stream_ops);keys.forEach(key=>{var fn=node.stream_ops[key];stream_ops[key]=function forceLoadLazyFile(){FS.forceLoadFile(node);return fn.apply(null,arguments);};});// use a custom read function
stream_ops.read=(stream,buffer,offset,length,position)=>{FS.forceLoadFile(node);var contents=stream.node.contents;if(position>=contents.length)return 0;var size=Math.min(contents.length-position,length);if(contents.slice){// normal array
for(var i=0;i<size;i++){buffer[offset+i]=contents[position+i];}}else{for(var i=0;i<size;i++){// LazyUint8Array from sync binary XHR
buffer[offset+i]=contents.get(position+i);}}return size;};node.stream_ops=stream_ops;return node;},createPreloadedFile:(parent,name,url,canRead,canWrite,onload,onerror,dontCreateFile,canOwn,preFinish)=>{// TODO we should allow people to just pass in a complete filename instead
// of parent and name being that we just join them anyways
var fullname=name?PATH_FS.resolve(PATH.join2(parent,name)):parent;var dep=getUniqueRunDependency('cp '+fullname);// might have several active requests for the same fullname
function processData(byteArray){function finish(byteArray){if(preFinish)preFinish();if(!dontCreateFile){FS.createDataFile(parent,name,byteArray,canRead,canWrite,canOwn);}if(onload)onload();removeRunDependency(dep);}if(Browser.handledByPreloadPlugin(byteArray,fullname,finish,()=>{if(onerror)onerror();removeRunDependency(dep);})){return;}finish(byteArray);}addRunDependency(dep);if(typeof url=='string'){asyncLoad(url,byteArray=>processData(byteArray),onerror);}else{processData(url);}},indexedDB:()=>{return window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;},DB_NAME:()=>{return'EM_FS_'+window.location.pathname;},DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:(paths,onload,onerror)=>{onload=onload||(()=>{});onerror=onerror||(()=>{});var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION);}catch(e){return onerror(e);}openRequest.onupgradeneeded=()=>{out('creating db');var db=openRequest.result;db.createObjectStore(FS.DB_STORE_NAME);};openRequest.onsuccess=()=>{var db=openRequest.result;var transaction=db.transaction([FS.DB_STORE_NAME],'readwrite');var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror();}paths.forEach(path=>{var putRequest=files.put(FS.analyzePath(path).object.contents,path);putRequest.onsuccess=()=>{ok++;if(ok+fail==total)finish();};putRequest.onerror=()=>{fail++;if(ok+fail==total)finish();};});transaction.onerror=onerror;};openRequest.onerror=onerror;},loadFilesFromDB:(paths,onload,onerror)=>{onload=onload||(()=>{});onerror=onerror||(()=>{});var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION);}catch(e){return onerror(e);}openRequest.onupgradeneeded=onerror;// no database to load from
openRequest.onsuccess=()=>{var db=openRequest.result;try{var transaction=db.transaction([FS.DB_STORE_NAME],'readonly');}catch(e){onerror(e);return;}var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror();}paths.forEach(path=>{var getRequest=files.get(path);getRequest.onsuccess=()=>{if(FS.analyzePath(path).exists){FS.unlink(path);}FS.createDataFile(PATH.dirname(path),PATH.basename(path),getRequest.result,true,true,true);ok++;if(ok+fail==total)finish();};getRequest.onerror=()=>{fail++;if(ok+fail==total)finish();};});transaction.onerror=onerror;};openRequest.onerror=onerror;}};var SYSCALLS={DEFAULT_POLLMASK:5,calculateAt:function(dirfd,path,allowEmpty){if(PATH.isAbs(path)){return path;}// relative path
var dir;if(dirfd===-100){dir=FS.cwd();}else{var dirstream=FS.getStream(dirfd);if(!dirstream)throw new FS.ErrnoError(8);dir=dirstream.path;}if(path.length==0){if(!allowEmpty){throw new FS.ErrnoError(44);;}return dir;}return PATH.join2(dir,path);},doStat:function(func,path,buf){try{var stat=func(path);}catch(e){if(e&&e.node&&PATH.normalize(path)!==PATH.normalize(FS.getPath(e.node))){// an error occurred while trying to look up the path; we should just report ENOTDIR
return-54;}throw e;}HEAP32[buf>>2]=stat.dev;HEAP32[buf+4>>2]=0;HEAP32[buf+8>>2]=stat.ino;HEAP32[buf+12>>2]=stat.mode;HEAP32[buf+16>>2]=stat.nlink;HEAP32[buf+20>>2]=stat.uid;HEAP32[buf+24>>2]=stat.gid;HEAP32[buf+28>>2]=stat.rdev;HEAP32[buf+32>>2]=0;tempI64=[stat.size>>>0,(tempDouble=stat.size,+Math.abs(tempDouble)>=1.0?tempDouble>0.0?(Math.min(+Math.floor(tempDouble/4294967296.0),4294967295.0)|0)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296.0)>>>0:0)],HEAP32[buf+40>>2]=tempI64[0],HEAP32[buf+44>>2]=tempI64[1];HEAP32[buf+48>>2]=4096;HEAP32[buf+52>>2]=stat.blocks;HEAP32[buf+56>>2]=stat.atime.getTime()/1000|0;HEAP32[buf+60>>2]=0;HEAP32[buf+64>>2]=stat.mtime.getTime()/1000|0;HEAP32[buf+68>>2]=0;HEAP32[buf+72>>2]=stat.ctime.getTime()/1000|0;HEAP32[buf+76>>2]=0;tempI64=[stat.ino>>>0,(tempDouble=stat.ino,+Math.abs(tempDouble)>=1.0?tempDouble>0.0?(Math.min(+Math.floor(tempDouble/4294967296.0),4294967295.0)|0)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296.0)>>>0:0)],HEAP32[buf+80>>2]=tempI64[0],HEAP32[buf+84>>2]=tempI64[1];return 0;},doMsync:function(addr,stream,len,flags,offset){var buffer=HEAPU8.slice(addr,addr+len);FS.msync(stream,buffer,offset,len,flags);},varargs:undefined,get:function(){SYSCALLS.varargs+=4;var ret=HEAP32[SYSCALLS.varargs-4>>2];return ret;},getStr:function(ptr){var ret=UTF8ToString(ptr);return ret;},getStreamFromFD:function(fd){var stream=FS.getStream(fd);if(!stream)throw new FS.ErrnoError(8);return stream;}};function ___syscall_fcntl64(fd,cmd,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(fd);switch(cmd){case 0:{var arg=SYSCALLS.get();if(arg<0){return-28;}var newStream;newStream=FS.createStream(stream,arg);return newStream.fd;}case 1:case 2:return 0;// FD_CLOEXEC makes no sense for a single process.
case 3:return stream.flags;case 4:{var arg=SYSCALLS.get();stream.flags|=arg;return 0;}case 5:/* case 5: Currently in musl F_GETLK64 has same value as F_GETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */{var arg=SYSCALLS.get();var offset=0;// We're always unlocked.
HEAP16[arg+offset>>1]=2;return 0;}case 6:case 7:/* case 6: Currently in musl F_SETLK64 has same value as F_SETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */ /* case 7: Currently in musl F_SETLKW64 has same value as F_SETLKW, so omitted to avoid duplicate case blocks. If that changes, uncomment this */return 0;// Pretend that the locking is successful.
case 16:case 8:return-28;// These are for sockets. We don't have them fully implemented yet.
case 9:// musl trusts getown return values, due to a bug where they must be, as they overlap with errors. just return -1 here, so fnctl() returns that, and we set errno ourselves.
setErrNo(28);return-1;default:{return-28;}}}catch(e){if(typeof FS=='undefined'||!(e instanceof FS.ErrnoError))throw e;return-e.errno;}}function ___syscall_fstat64(fd,buf){try{var stream=SYSCALLS.getStreamFromFD(fd);return SYSCALLS.doStat(FS.stat,stream.path,buf);}catch(e){if(typeof FS=='undefined'||!(e instanceof FS.ErrnoError))throw e;return-e.errno;}}function ___syscall_ioctl(fd,op,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(fd);switch(op){case 21509:case 21505:{if(!stream.tty)return-59;return 0;}case 21510:case 21511:case 21512:case 21506:case 21507:case 21508:{if(!stream.tty)return-59;return 0;// no-op, not actually adjusting terminal settings
}case 21519:{if(!stream.tty)return-59;var argp=SYSCALLS.get();HEAP32[argp>>2]=0;return 0;}case 21520:{if(!stream.tty)return-59;return-28;// not supported
}case 21531:{var argp=SYSCALLS.get();return FS.ioctl(stream,op,argp);}case 21523:{// TODO: in theory we should write to the winsize struct that gets
// passed in, but for now musl doesn't read anything on it
if(!stream.tty)return-59;return 0;}case 21524:{// TODO: technically, this ioctl call should change the window size.
// but, since emscripten doesn't have any concept of a terminal window
// yet, we'll just silently throw it away as we do TIOCGWINSZ
if(!stream.tty)return-59;return 0;}default:abort('bad ioctl syscall '+op);}}catch(e){if(typeof FS=='undefined'||!(e instanceof FS.ErrnoError))throw e;return-e.errno;}}function ___syscall_lstat64(path,buf){try{path=SYSCALLS.getStr(path);return SYSCALLS.doStat(FS.lstat,path,buf);}catch(e){if(typeof FS=='undefined'||!(e instanceof FS.ErrnoError))throw e;return-e.errno;}}function ___syscall_newfstatat(dirfd,path,buf,flags){try{path=SYSCALLS.getStr(path);var nofollow=flags&256;var allowEmpty=flags&4096;flags=flags&~4352;path=SYSCALLS.calculateAt(dirfd,path,allowEmpty);return SYSCALLS.doStat(nofollow?FS.lstat:FS.stat,path,buf);}catch(e){if(typeof FS=='undefined'||!(e instanceof FS.ErrnoError))throw e;return-e.errno;}}function ___syscall_openat(dirfd,path,flags,varargs){SYSCALLS.varargs=varargs;try{path=SYSCALLS.getStr(path);path=SYSCALLS.calculateAt(dirfd,path);var mode=varargs?SYSCALLS.get():0;return FS.open(path,flags,mode).fd;}catch(e){if(typeof FS=='undefined'||!(e instanceof FS.ErrnoError))throw e;return-e.errno;}}function ___syscall_stat64(path,buf){try{path=SYSCALLS.getStr(path);return SYSCALLS.doStat(FS.stat,path,buf);}catch(e){if(typeof FS=='undefined'||!(e instanceof FS.ErrnoError))throw e;return-e.errno;}}function __emscripten_date_now(){return Date.now();}function __localtime_js(time,tmPtr){var date=new Date(HEAP32[time>>2]*1000);HEAP32[tmPtr>>2]=date.getSeconds();HEAP32[tmPtr+4>>2]=date.getMinutes();HEAP32[tmPtr+8>>2]=date.getHours();HEAP32[tmPtr+12>>2]=date.getDate();HEAP32[tmPtr+16>>2]=date.getMonth();HEAP32[tmPtr+20>>2]=date.getFullYear()-1900;HEAP32[tmPtr+24>>2]=date.getDay();var start=new Date(date.getFullYear(),0,1);var yday=(date.getTime()-start.getTime())/(1000*60*60*24)|0;HEAP32[tmPtr+28>>2]=yday;HEAP32[tmPtr+36>>2]=-(date.getTimezoneOffset()*60);// Attention: DST is in December in South, and some regions don't have DST at all.
var summerOffset=new Date(date.getFullYear(),6,1).getTimezoneOffset();var winterOffset=start.getTimezoneOffset();var dst=(summerOffset!=winterOffset&&date.getTimezoneOffset()==Math.min(winterOffset,summerOffset))|0;HEAP32[tmPtr+32>>2]=dst;}function _tzset_impl(timezone,daylight,tzname){var currentYear=new Date().getFullYear();var winter=new Date(currentYear,0,1);var summer=new Date(currentYear,6,1);var winterOffset=winter.getTimezoneOffset();var summerOffset=summer.getTimezoneOffset();// Local standard timezone offset. Local standard time is not adjusted for daylight savings.
// This code uses the fact that getTimezoneOffset returns a greater value during Standard Time versus Daylight Saving Time (DST).
// Thus it determines the expected output during Standard Time, and it compares whether the output of the given date the same (Standard) or less (DST).
var stdTimezoneOffset=Math.max(winterOffset,summerOffset);// timezone is specified as seconds west of UTC ("The external variable
// `timezone` shall be set to the difference, in seconds, between
// Coordinated Universal Time (UTC) and local standard time."), the same
// as returned by stdTimezoneOffset.
// See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html
HEAP32[timezone>>2]=stdTimezoneOffset*60;HEAP32[daylight>>2]=Number(winterOffset!=summerOffset);function extractZone(date){var match=date.toTimeString().match(/\(([A-Za-z ]+)\)$/);return match?match[1]:"GMT";};var winterName=extractZone(winter);var summerName=extractZone(summer);var winterNamePtr=allocateUTF8(winterName);var summerNamePtr=allocateUTF8(summerName);if(summerOffset<winterOffset){// Northern hemisphere
HEAP32[tzname>>2]=winterNamePtr;HEAP32[tzname+4>>2]=summerNamePtr;}else{HEAP32[tzname>>2]=summerNamePtr;HEAP32[tzname+4>>2]=winterNamePtr;}}function __tzset_js(timezone,daylight,tzname){// TODO: Use (malleable) environment variables instead of system settings.
if(__tzset_js.called)return;__tzset_js.called=true;_tzset_impl(timezone,daylight,tzname);}function _abort(){abort('');}var readAsmConstArgsArray=[];function readAsmConstArgs(sigPtr,buf){;readAsmConstArgsArray.length=0;var ch;// Most arguments are i32s, so shift the buffer pointer so it is a plain
// index into HEAP32.
buf>>=2;while(ch=HEAPU8[sigPtr++]){// Floats are always passed as doubles, and doubles and int64s take up 8
// bytes (two 32-bit slots) in memory, align reads to these:
buf+=ch!=105&buf;readAsmConstArgsArray.push(ch==105/*i*/?HEAP32[buf]:HEAPF64[buf++>>1]);++buf;}return readAsmConstArgsArray;}function _emscripten_asm_const_int(code,sigPtr,argbuf){var args=readAsmConstArgs(sigPtr,argbuf);return ASM_CONSTS[code].apply(null,args);}function _emscripten_get_heap_max(){// Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
// full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
// for any code that deals with heap sizes, which would require special
// casing all heap size related code to treat 0 specially.
return 2147483648;}function emscripten_realloc_buffer(size){try{// round size grow request up to wasm page size (fixed 64KB per spec)
wasmMemory.grow(size-buffer.byteLength+65535>>>16);// .grow() takes a delta compared to the previous size
updateGlobalBufferAndViews(wasmMemory.buffer);return 1/*success*/;}catch(e){}// implicit 0 return to save code size (caller will cast "undefined" into 0
// anyhow)
}function _emscripten_resize_heap(requestedSize){var oldSize=HEAPU8.length;requestedSize=requestedSize>>>0;// With multithreaded builds, races can happen (another thread might increase the size
// in between), so return a failure, and let the caller retry.
// Memory resize rules:
// 1.  Always increase heap size to at least the requested size, rounded up
//     to next page multiple.
// 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap
//     geometrically: increase the heap size according to
//     MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%), At most
//     overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
// 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap
//     linearly: increase the heap size by at least
//     MEMORY_GROWTH_LINEAR_STEP bytes.
// 3.  Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by
//     MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
// 4.  If we were unable to allocate as much memory, it may be due to
//     over-eager decision to excessively reserve due to (3) above.
//     Hence if an allocation fails, cut down on the amount of excess
//     growth, in an attempt to succeed to perform a smaller allocation.
// A limit is set for how much we can grow. We should not exceed that
// (the wasm binary specifies it, so if we tried, we'd fail anyhow).
var maxHeapSize=_emscripten_get_heap_max();if(requestedSize>maxHeapSize){return false;}let alignUp=(x,multiple)=>x+(multiple-x%multiple)%multiple;// Loop through potential heap size increases. If we attempt a too eager
// reservation that fails, cut down on the attempted size and reserve a
// smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
for(var cutDown=1;cutDown<=4;cutDown*=2){var overGrownHeapSize=oldSize*(1+0.2/cutDown);// ensure geometric growth
// but limit overreserving (default to capping at +96MB overgrowth at most)
overGrownHeapSize=Math.min(overGrownHeapSize,requestedSize+100663296);var newSize=Math.min(maxHeapSize,alignUp(Math.max(requestedSize,overGrownHeapSize),65536));var replacement=emscripten_realloc_buffer(newSize);if(replacement){return true;}}return false;}function _exit(status){// void _exit(int status);
// http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
exit(status);}function _fd_close(fd){try{var stream=SYSCALLS.getStreamFromFD(fd);FS.close(stream);return 0;}catch(e){if(typeof FS=='undefined'||!(e instanceof FS.ErrnoError))throw e;return e.errno;}}/** @param {number=} offset */function doReadv(stream,iov,iovcnt,offset){var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAPU32[iov>>2];var len=HEAPU32[iov+4>>2];iov+=8;var curr=FS.read(stream,HEAP8,ptr,len,offset);if(curr<0)return-1;ret+=curr;if(curr<len)break;// nothing more to read
}return ret;}function _fd_read(fd,iov,iovcnt,pnum){try{var stream=SYSCALLS.getStreamFromFD(fd);var num=doReadv(stream,iov,iovcnt);HEAP32[pnum>>2]=num;return 0;}catch(e){if(typeof FS=='undefined'||!(e instanceof FS.ErrnoError))throw e;return e.errno;}}function _fd_seek(fd,offset_low,offset_high,whence,newOffset){try{var stream=SYSCALLS.getStreamFromFD(fd);var HIGH_OFFSET=0x100000000;// 2^32
// use an unsigned operator on low and shift high by 32-bits
var offset=offset_high*HIGH_OFFSET+(offset_low>>>0);var DOUBLE_LIMIT=0x20000000000000;// 2^53
// we also check for equality since DOUBLE_LIMIT + 1 == DOUBLE_LIMIT
if(offset<=-DOUBLE_LIMIT||offset>=DOUBLE_LIMIT){return 61;}FS.llseek(stream,offset,whence);tempI64=[stream.position>>>0,(tempDouble=stream.position,+Math.abs(tempDouble)>=1.0?tempDouble>0.0?(Math.min(+Math.floor(tempDouble/4294967296.0),4294967295.0)|0)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296.0)>>>0:0)],HEAP32[newOffset>>2]=tempI64[0],HEAP32[newOffset+4>>2]=tempI64[1];if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;// reset readdir state
return 0;}catch(e){if(typeof FS=='undefined'||!(e instanceof FS.ErrnoError))throw e;return e.errno;}}/** @param {number=} offset */function doWritev(stream,iov,iovcnt,offset){var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAPU32[iov>>2];var len=HEAPU32[iov+4>>2];iov+=8;var curr=FS.write(stream,HEAP8,ptr,len,offset);if(curr<0)return-1;ret+=curr;}return ret;}function _fd_write(fd,iov,iovcnt,pnum){try{;var stream=SYSCALLS.getStreamFromFD(fd);var num=doWritev(stream,iov,iovcnt);HEAP32[pnum>>2]=num;return 0;}catch(e){if(typeof FS=='undefined'||!(e instanceof FS.ErrnoError))throw e;return e.errno;}}function _getTempRet0(){return getTempRet0();}function _llvm_eh_typeid_for(type){return type;}function _setTempRet0(val){setTempRet0(val);}function __isLeapYear(year){return year%4===0&&(year%100!==0||year%400===0);}function __arraySum(array,index){var sum=0;for(var i=0;i<=index;sum+=array[i++]){// no-op
}return sum;}var __MONTH_DAYS_LEAP=[31,29,31,30,31,30,31,31,30,31,30,31];var __MONTH_DAYS_REGULAR=[31,28,31,30,31,30,31,31,30,31,30,31];function __addDays(date,days){var newDate=new Date(date.getTime());while(days>0){var leap=__isLeapYear(newDate.getFullYear());var currentMonth=newDate.getMonth();var daysInCurrentMonth=(leap?__MONTH_DAYS_LEAP:__MONTH_DAYS_REGULAR)[currentMonth];if(days>daysInCurrentMonth-newDate.getDate()){// we spill over to next month
days-=daysInCurrentMonth-newDate.getDate()+1;newDate.setDate(1);if(currentMonth<11){newDate.setMonth(currentMonth+1);}else{newDate.setMonth(0);newDate.setFullYear(newDate.getFullYear()+1);}}else{// we stay in current month
newDate.setDate(newDate.getDate()+days);return newDate;}}return newDate;}function _strftime(s,maxsize,format,tm){// size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
// http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
var tm_zone=HEAP32[tm+40>>2];var date={tm_sec:HEAP32[tm>>2],tm_min:HEAP32[tm+4>>2],tm_hour:HEAP32[tm+8>>2],tm_mday:HEAP32[tm+12>>2],tm_mon:HEAP32[tm+16>>2],tm_year:HEAP32[tm+20>>2],tm_wday:HEAP32[tm+24>>2],tm_yday:HEAP32[tm+28>>2],tm_isdst:HEAP32[tm+32>>2],tm_gmtoff:HEAP32[tm+36>>2],tm_zone:tm_zone?UTF8ToString(tm_zone):''};var pattern=UTF8ToString(format);// expand format
var EXPANSION_RULES_1={'%c':'%a %b %d %H:%M:%S %Y',// Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
'%D':'%m/%d/%y',// Equivalent to %m / %d / %y
'%F':'%Y-%m-%d',// Equivalent to %Y - %m - %d
'%h':'%b',// Equivalent to %b
'%r':'%I:%M:%S %p',// Replaced by the time in a.m. and p.m. notation
'%R':'%H:%M',// Replaced by the time in 24-hour notation
'%T':'%H:%M:%S',// Replaced by the time
'%x':'%m/%d/%y',// Replaced by the locale's appropriate date representation
'%X':'%H:%M:%S',// Replaced by the locale's appropriate time representation
// Modified Conversion Specifiers
'%Ec':'%c',// Replaced by the locale's alternative appropriate date and time representation.
'%EC':'%C',// Replaced by the name of the base year (period) in the locale's alternative representation.
'%Ex':'%m/%d/%y',// Replaced by the locale's alternative date representation.
'%EX':'%H:%M:%S',// Replaced by the locale's alternative time representation.
'%Ey':'%y',// Replaced by the offset from %EC (year only) in the locale's alternative representation.
'%EY':'%Y',// Replaced by the full alternative year representation.
'%Od':'%d',// Replaced by the day of the month, using the locale's alternative numeric symbols, filled as needed with leading zeros if there is any alternative symbol for zero; otherwise, with leading <space> characters.
'%Oe':'%e',// Replaced by the day of the month, using the locale's alternative numeric symbols, filled as needed with leading <space> characters.
'%OH':'%H',// Replaced by the hour (24-hour clock) using the locale's alternative numeric symbols.
'%OI':'%I',// Replaced by the hour (12-hour clock) using the locale's alternative numeric symbols.
'%Om':'%m',// Replaced by the month using the locale's alternative numeric symbols.
'%OM':'%M',// Replaced by the minutes using the locale's alternative numeric symbols.
'%OS':'%S',// Replaced by the seconds using the locale's alternative numeric symbols.
'%Ou':'%u',// Replaced by the weekday as a number in the locale's alternative representation (Monday=1).
'%OU':'%U',// Replaced by the week number of the year (Sunday as the first day of the week, rules corresponding to %U ) using the locale's alternative numeric symbols.
'%OV':'%V',// Replaced by the week number of the year (Monday as the first day of the week, rules corresponding to %V ) using the locale's alternative numeric symbols.
'%Ow':'%w',// Replaced by the number of the weekday (Sunday=0) using the locale's alternative numeric symbols.
'%OW':'%W',// Replaced by the week number of the year (Monday as the first day of the week) using the locale's alternative numeric symbols.
'%Oy':'%y'// Replaced by the year (offset from %C ) using the locale's alternative numeric symbols.
};for(var rule in EXPANSION_RULES_1){pattern=pattern.replace(new RegExp(rule,'g'),EXPANSION_RULES_1[rule]);}var WEEKDAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];function leadingSomething(value,digits,character){var str=typeof value=='number'?value.toString():value||'';while(str.length<digits){str=character[0]+str;}return str;}function leadingNulls(value,digits){return leadingSomething(value,digits,'0');}function compareByDay(date1,date2){function sgn(value){return value<0?-1:value>0?1:0;}var compare;if((compare=sgn(date1.getFullYear()-date2.getFullYear()))===0){if((compare=sgn(date1.getMonth()-date2.getMonth()))===0){compare=sgn(date1.getDate()-date2.getDate());}}return compare;}function getFirstWeekStartDate(janFourth){switch(janFourth.getDay()){case 0:// Sunday
return new Date(janFourth.getFullYear()-1,11,29);case 1:// Monday
return janFourth;case 2:// Tuesday
return new Date(janFourth.getFullYear(),0,3);case 3:// Wednesday
return new Date(janFourth.getFullYear(),0,2);case 4:// Thursday
return new Date(janFourth.getFullYear(),0,1);case 5:// Friday
return new Date(janFourth.getFullYear()-1,11,31);case 6:// Saturday
return new Date(janFourth.getFullYear()-1,11,30);}}function getWeekBasedYear(date){var thisDate=__addDays(new Date(date.tm_year+1900,0,1),date.tm_yday);var janFourthThisYear=new Date(thisDate.getFullYear(),0,4);var janFourthNextYear=new Date(thisDate.getFullYear()+1,0,4);var firstWeekStartThisYear=getFirstWeekStartDate(janFourthThisYear);var firstWeekStartNextYear=getFirstWeekStartDate(janFourthNextYear);if(compareByDay(firstWeekStartThisYear,thisDate)<=0){// this date is after the start of the first week of this year
if(compareByDay(firstWeekStartNextYear,thisDate)<=0){return thisDate.getFullYear()+1;}else{return thisDate.getFullYear();}}else{return thisDate.getFullYear()-1;}}var EXPANSION_RULES_2={'%a':function(date){return WEEKDAYS[date.tm_wday].substring(0,3);},'%A':function(date){return WEEKDAYS[date.tm_wday];},'%b':function(date){return MONTHS[date.tm_mon].substring(0,3);},'%B':function(date){return MONTHS[date.tm_mon];},'%C':function(date){var year=date.tm_year+1900;return leadingNulls(year/100|0,2);},'%d':function(date){return leadingNulls(date.tm_mday,2);},'%e':function(date){return leadingSomething(date.tm_mday,2,' ');},'%g':function(date){// %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year.
// In this system, weeks begin on a Monday and week 1 of the year is the week that includes
// January 4th, which is also the week that includes the first Thursday of the year, and
// is also the first week that contains at least four days in the year.
// If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of
// the last week of the preceding year; thus, for Saturday 2nd January 1999,
// %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th,
// or 31st is a Monday, it and any following days are part of week 1 of the following year.
// Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
return getWeekBasedYear(date).toString().substring(2);},'%G':function(date){return getWeekBasedYear(date);},'%H':function(date){return leadingNulls(date.tm_hour,2);},'%I':function(date){var twelveHour=date.tm_hour;if(twelveHour==0)twelveHour=12;else if(twelveHour>12)twelveHour-=12;return leadingNulls(twelveHour,2);},'%j':function(date){// Day of the year (001-366)
return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900)?__MONTH_DAYS_LEAP:__MONTH_DAYS_REGULAR,date.tm_mon-1),3);},'%m':function(date){return leadingNulls(date.tm_mon+1,2);},'%M':function(date){return leadingNulls(date.tm_min,2);},'%n':function(){return'\n';},'%p':function(date){if(date.tm_hour>=0&&date.tm_hour<12){return'AM';}else{return'PM';}},'%S':function(date){return leadingNulls(date.tm_sec,2);},'%t':function(){return'\t';},'%u':function(date){return date.tm_wday||7;},'%U':function(date){var days=date.tm_yday+7-date.tm_wday;return leadingNulls(Math.floor(days/7),2);},'%V':function(date){// Replaced by the week number of the year (Monday as the first day of the week)
// as a decimal number [01,53]. If the week containing 1 January has four
// or more days in the new year, then it is considered week 1.
// Otherwise, it is the last week of the previous year, and the next week is week 1.
// Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
var val=Math.floor((date.tm_yday+7-(date.tm_wday+6)%7)/7);// If 1 Jan is just 1-3 days past Monday, the previous week
// is also in this year.
if((date.tm_wday+371-date.tm_yday-2)%7<=2){val++;}if(!val){val=52;// If 31 December of prev year a Thursday, or Friday of a
// leap year, then the prev year has 53 weeks.
var dec31=(date.tm_wday+7-date.tm_yday-1)%7;if(dec31==4||dec31==5&&__isLeapYear(date.tm_year%400-1)){val++;}}else if(val==53){// If 1 January is not a Thursday, and not a Wednesday of a
// leap year, then this year has only 52 weeks.
var jan1=(date.tm_wday+371-date.tm_yday)%7;if(jan1!=4&&(jan1!=3||!__isLeapYear(date.tm_year)))val=1;}return leadingNulls(val,2);},'%w':function(date){return date.tm_wday;},'%W':function(date){var days=date.tm_yday+7-(date.tm_wday+6)%7;return leadingNulls(Math.floor(days/7),2);},'%y':function(date){// Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
return(date.tm_year+1900).toString().substring(2);},'%Y':function(date){// Replaced by the year as a decimal number (for example, 1997). [ tm_year]
return date.tm_year+1900;},'%z':function(date){// Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ).
// For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich).
var off=date.tm_gmtoff;var ahead=off>=0;off=Math.abs(off)/60;// convert from minutes into hhmm format (which means 60 minutes = 100 units)
off=off/60*100+off%60;return(ahead?'+':'-')+String("0000"+off).slice(-4);},'%Z':function(date){return date.tm_zone;},'%%':function(){return'%';}};// Replace %% with a pair of NULLs (which cannot occur in a C string), then
// re-inject them after processing.
pattern=pattern.replace(/%%/g,'\0\0');for(var rule in EXPANSION_RULES_2){if(pattern.includes(rule)){pattern=pattern.replace(new RegExp(rule,'g'),EXPANSION_RULES_2[rule](date));}}pattern=pattern.replace(/\0\0/g,'%');var bytes=intArrayFromString(pattern,false);if(bytes.length>maxsize){return 0;}writeArrayToMemory(bytes,s);return bytes.length-1;}var FSNode=/** @constructor */function(parent,name,mode,rdev){if(!parent){parent=this;// root node sets parent to itself
}this.parent=parent;this.mount=parent.mount;this.mounted=null;this.id=FS.nextInode++;this.name=name;this.mode=mode;this.node_ops={};this.stream_ops={};this.rdev=rdev;};var readMode=292/*292*/|73/*73*/;var writeMode=146/*146*/;Object.defineProperties(FSNode.prototype,{read:{get:/** @this{FSNode} */function(){return(this.mode&readMode)===readMode;},set:/** @this{FSNode} */function(val){val?this.mode|=readMode:this.mode&=~readMode;}},write:{get:/** @this{FSNode} */function(){return(this.mode&writeMode)===writeMode;},set:/** @this{FSNode} */function(val){val?this.mode|=writeMode:this.mode&=~writeMode;}},isFolder:{get:/** @this{FSNode} */function(){return FS.isDir(this.mode);}},isDevice:{get:/** @this{FSNode} */function(){return FS.isChrdev(this.mode);}}});FS.FSNode=FSNode;FS.staticInit();;if(ENVIRONMENT_IS_NODE){requireNodeFS();NODEFS.staticInit();};ERRNO_CODES={'EPERM':63,'ENOENT':44,'ESRCH':71,'EINTR':27,'EIO':29,'ENXIO':60,'E2BIG':1,'ENOEXEC':45,'EBADF':8,'ECHILD':12,'EAGAIN':6,'EWOULDBLOCK':6,'ENOMEM':48,'EACCES':2,'EFAULT':21,'ENOTBLK':105,'EBUSY':10,'EEXIST':20,'EXDEV':75,'ENODEV':43,'ENOTDIR':54,'EISDIR':31,'EINVAL':28,'ENFILE':41,'EMFILE':33,'ENOTTY':59,'ETXTBSY':74,'EFBIG':22,'ENOSPC':51,'ESPIPE':70,'EROFS':69,'EMLINK':34,'EPIPE':64,'EDOM':18,'ERANGE':68,'ENOMSG':49,'EIDRM':24,'ECHRNG':106,'EL2NSYNC':156,'EL3HLT':107,'EL3RST':108,'ELNRNG':109,'EUNATCH':110,'ENOCSI':111,'EL2HLT':112,'EDEADLK':16,'ENOLCK':46,'EBADE':113,'EBADR':114,'EXFULL':115,'ENOANO':104,'EBADRQC':103,'EBADSLT':102,'EDEADLOCK':16,'EBFONT':101,'ENOSTR':100,'ENODATA':116,'ETIME':117,'ENOSR':118,'ENONET':119,'ENOPKG':120,'EREMOTE':121,'ENOLINK':47,'EADV':122,'ESRMNT':123,'ECOMM':124,'EPROTO':65,'EMULTIHOP':36,'EDOTDOT':125,'EBADMSG':9,'ENOTUNIQ':126,'EBADFD':127,'EREMCHG':128,'ELIBACC':129,'ELIBBAD':130,'ELIBSCN':131,'ELIBMAX':132,'ELIBEXEC':133,'ENOSYS':52,'ENOTEMPTY':55,'ENAMETOOLONG':37,'ELOOP':32,'EOPNOTSUPP':138,'EPFNOSUPPORT':139,'ECONNRESET':15,'ENOBUFS':42,'EAFNOSUPPORT':5,'EPROTOTYPE':67,'ENOTSOCK':57,'ENOPROTOOPT':50,'ESHUTDOWN':140,'ECONNREFUSED':14,'EADDRINUSE':3,'ECONNABORTED':13,'ENETUNREACH':40,'ENETDOWN':38,'ETIMEDOUT':73,'EHOSTDOWN':142,'EHOSTUNREACH':23,'EINPROGRESS':26,'EALREADY':7,'EDESTADDRREQ':17,'EMSGSIZE':35,'EPROTONOSUPPORT':66,'ESOCKTNOSUPPORT':137,'EADDRNOTAVAIL':4,'ENETRESET':39,'EISCONN':30,'ENOTCONN':53,'ETOOMANYREFS':141,'EUSERS':136,'EDQUOT':19,'ESTALE':72,'ENOTSUP':138,'ENOMEDIUM':148,'EILSEQ':25,'EOVERFLOW':61,'ECANCELED':11,'ENOTRECOVERABLE':56,'EOWNERDEAD':62,'ESTRPIPE':135};;var ASSERTIONS=false;/** @type {function(string, boolean=, number=)} */function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array;}function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>0xFF){if(ASSERTIONS){assert(false,'Character code '+chr+' ('+String.fromCharCode(chr)+')  at offset '+i+' not in 0x00-0xFF.');}chr&=0xFF;}ret.push(String.fromCharCode(chr));}return ret.join('');}// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149
// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com
/**
* Decodes a base64 string.
* @param {string} input The string to decode.
*/var decodeBase64=typeof atob=='function'?atob:function(input){var keyStr='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';var output='';var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
input=input.replace(/[^A-Za-z0-9\+\/\=]/g,'');do{enc1=keyStr.indexOf(input.charAt(i++));enc2=keyStr.indexOf(input.charAt(i++));enc3=keyStr.indexOf(input.charAt(i++));enc4=keyStr.indexOf(input.charAt(i++));chr1=enc1<<2|enc2>>4;chr2=(enc2&15)<<4|enc3>>2;chr3=(enc3&3)<<6|enc4;output=output+String.fromCharCode(chr1);if(enc3!==64){output=output+String.fromCharCode(chr2);}if(enc4!==64){output=output+String.fromCharCode(chr3);}}while(i<input.length);return output;};// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s){if(typeof ENVIRONMENT_IS_NODE=='boolean'&&ENVIRONMENT_IS_NODE){var buf=Buffer.from(s,'base64');return new Uint8Array(buf['buffer'],buf['byteOffset'],buf['byteLength']);}try{var decoded=decodeBase64(s);var bytes=new Uint8Array(decoded.length);for(var i=0;i<decoded.length;++i){bytes[i]=decoded.charCodeAt(i);}return bytes;}catch(_){throw new Error('Converting base64 string to bytes failed.');}}// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename){if(!isDataURI(filename)){return;}return intArrayFromBase64(filename.slice(dataURIPrefix.length));}var asmLibraryArg={"__cxa_allocate_exception":___cxa_allocate_exception,"__cxa_begin_catch":___cxa_begin_catch,"__cxa_end_catch":___cxa_end_catch,"__cxa_find_matching_catch_2":___cxa_find_matching_catch_2,"__cxa_find_matching_catch_3":___cxa_find_matching_catch_3,"__cxa_find_matching_catch_5":___cxa_find_matching_catch_5,"__cxa_free_exception":___cxa_free_exception,"__cxa_rethrow":___cxa_rethrow,"__cxa_throw":___cxa_throw,"__cxa_uncaught_exceptions":___cxa_uncaught_exceptions,"__resumeException":___resumeException,"__syscall_fcntl64":___syscall_fcntl64,"__syscall_fstat64":___syscall_fstat64,"__syscall_ioctl":___syscall_ioctl,"__syscall_lstat64":___syscall_lstat64,"__syscall_newfstatat":___syscall_newfstatat,"__syscall_openat":___syscall_openat,"__syscall_stat64":___syscall_stat64,"_emscripten_date_now":__emscripten_date_now,"_localtime_js":__localtime_js,"_tzset_js":__tzset_js,"abort":_abort,"emscripten_asm_const_int":_emscripten_asm_const_int,"emscripten_resize_heap":_emscripten_resize_heap,"exit":_exit,"fd_close":_fd_close,"fd_read":_fd_read,"fd_seek":_fd_seek,"fd_write":_fd_write,"getTempRet0":getTempRet0,"invoke_fi":invoke_fi,"invoke_fii":invoke_fii,"invoke_fiif":invoke_fiif,"invoke_i":invoke_i,"invoke_ii":invoke_ii,"invoke_iif":invoke_iif,"invoke_iifff":invoke_iifff,"invoke_iiffff":invoke_iiffff,"invoke_iii":invoke_iii,"invoke_iiif":invoke_iiif,"invoke_iiifffffff":invoke_iiifffffff,"invoke_iiifffi":invoke_iiifffi,"invoke_iiii":invoke_iiii,"invoke_iiiif":invoke_iiiif,"invoke_iiiii":invoke_iiiii,"invoke_iiiiid":invoke_iiiiid,"invoke_iiiiii":invoke_iiiiii,"invoke_iiiiiii":invoke_iiiiiii,"invoke_iiiiiiiiiiiiiiii":invoke_iiiiiiiiiiiiiiii,"invoke_v":invoke_v,"invoke_vi":invoke_vi,"invoke_vif":invoke_vif,"invoke_vifi":invoke_vifi,"invoke_vifiii":invoke_vifiii,"invoke_vii":invoke_vii,"invoke_viifi":invoke_viifi,"invoke_viii":invoke_viii,"invoke_viiii":invoke_viiii,"invoke_viiiii":invoke_viiiii,"invoke_viiiiii":invoke_viiiiii,"invoke_viiiiiiff":invoke_viiiiiiff,"invoke_viiiiiii":invoke_viiiiiii,"invoke_viiiiiiii":invoke_viiiiiiii,"llvm_eh_typeid_for":_llvm_eh_typeid_for,"memory":wasmMemory,"setTempRet0":setTempRet0,"strftime":_strftime};var asm=createWasm();/** @type {function(...*):?} */var ___wasm_call_ctors=Module["___wasm_call_ctors"]=function(){return(___wasm_call_ctors=Module["___wasm_call_ctors"]=Module["asm"]["__wasm_call_ctors"]).apply(null,arguments);};/** @type {function(...*):?} */var _malloc=Module["_malloc"]=function(){return(_malloc=Module["_malloc"]=Module["asm"]["malloc"]).apply(null,arguments);};/** @type {function(...*):?} */var _free=Module["_free"]=function(){return(_free=Module["_free"]=Module["asm"]["free"]).apply(null,arguments);};/** @type {function(...*):?} */var _animgenInit=Module["_animgenInit"]=function(){return(_animgenInit=Module["_animgenInit"]=Module["asm"]["animgenInit"]).apply(null,arguments);};/** @type {function(...*):?} */var _animgenAllocate=Module["_animgenAllocate"]=function(){return(_animgenAllocate=Module["_animgenAllocate"]=Module["asm"]["animgenAllocate"]).apply(null,arguments);};/** @type {function(...*):?} */var _animgenSetOutput=Module["_animgenSetOutput"]=function(){return(_animgenSetOutput=Module["_animgenSetOutput"]=Module["asm"]["animgenSetOutput"]).apply(null,arguments);};/** @type {function(...*):?} */var _animgenSetAvatar=Module["_animgenSetAvatar"]=function(){return(_animgenSetAvatar=Module["_animgenSetAvatar"]=Module["asm"]["animgenSetAvatar"]).apply(null,arguments);};/** @type {function(...*):?} */var _animgenSetSequence=Module["_animgenSetSequence"]=function(){return(_animgenSetSequence=Module["_animgenSetSequence"]=Module["asm"]["animgenSetSequence"]).apply(null,arguments);};/** @type {function(...*):?} */var _animgenGenerateFrames=Module["_animgenGenerateFrames"]=function(){return(_animgenGenerateFrames=Module["_animgenGenerateFrames"]=Module["asm"]["animgenGenerateFrames"]).apply(null,arguments);};/** @type {function(...*):?} */var _animgenDeAllocate=Module["_animgenDeAllocate"]=function(){return(_animgenDeAllocate=Module["_animgenDeAllocate"]=Module["asm"]["animgenDeAllocate"]).apply(null,arguments);};/** @type {function(...*):?} */var _animgenTerminate=Module["_animgenTerminate"]=function(){return(_animgenTerminate=Module["_animgenTerminate"]=Module["asm"]["animgenTerminate"]).apply(null,arguments);};/** @type {function(...*):?} */var ___errno_location=Module["___errno_location"]=function(){return(___errno_location=Module["___errno_location"]=Module["asm"]["__errno_location"]).apply(null,arguments);};/** @type {function(...*):?} */var _setThrew=Module["_setThrew"]=function(){return(_setThrew=Module["_setThrew"]=Module["asm"]["setThrew"]).apply(null,arguments);};/** @type {function(...*):?} */var stackSave=Module["stackSave"]=function(){return(stackSave=Module["stackSave"]=Module["asm"]["stackSave"]).apply(null,arguments);};/** @type {function(...*):?} */var stackRestore=Module["stackRestore"]=function(){return(stackRestore=Module["stackRestore"]=Module["asm"]["stackRestore"]).apply(null,arguments);};/** @type {function(...*):?} */var stackAlloc=Module["stackAlloc"]=function(){return(stackAlloc=Module["stackAlloc"]=Module["asm"]["stackAlloc"]).apply(null,arguments);};/** @type {function(...*):?} */var ___cxa_can_catch=Module["___cxa_can_catch"]=function(){return(___cxa_can_catch=Module["___cxa_can_catch"]=Module["asm"]["__cxa_can_catch"]).apply(null,arguments);};/** @type {function(...*):?} */var ___cxa_is_pointer_type=Module["___cxa_is_pointer_type"]=function(){return(___cxa_is_pointer_type=Module["___cxa_is_pointer_type"]=Module["asm"]["__cxa_is_pointer_type"]).apply(null,arguments);};/** @type {function(...*):?} */var dynCall_jiji=Module["dynCall_jiji"]=function(){return(dynCall_jiji=Module["dynCall_jiji"]=Module["asm"]["dynCall_jiji"]).apply(null,arguments);};function invoke_ii(index,a1){var sp=stackSave();try{return getWasmTableEntry(index)(a1);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iii(index,a1,a2){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iiif(index,a1,a2,a3){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iiifffffff(index,a1,a2,a3,a4,a5,a6,a7,a8,a9){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iiii(index,a1,a2,a3){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_vii(index,a1,a2){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_viii(index,a1,a2,a3){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2,a3);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iiiiiii(index,a1,a2,a3,a4,a5,a6){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_vi(index,a1){var sp=stackSave();try{getWasmTableEntry(index)(a1);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_v(index){var sp=stackSave();try{getWasmTableEntry(index)();}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iiiii(index,a1,a2,a3,a4){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3,a4);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iiiif(index,a1,a2,a3,a4){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3,a4);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_viiiiiiff(index,a1,a2,a3,a4,a5,a6,a7,a8){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_vif(index,a1,a2){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_i(index){var sp=stackSave();try{return getWasmTableEntry(index)();}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_fiif(index,a1,a2,a3){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iifff(index,a1,a2,a3,a4){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3,a4);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iiffff(index,a1,a2,a3,a4,a5){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3,a4,a5);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_viiiii(index,a1,a2,a3,a4,a5){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2,a3,a4,a5);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_viiii(index,a1,a2,a3,a4){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2,a3,a4);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iif(index,a1,a2){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_fi(index,a1){var sp=stackSave();try{return getWasmTableEntry(index)(a1);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_vifiii(index,a1,a2,a3,a4,a5){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2,a3,a4,a5);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_fii(index,a1,a2){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iiifffi(index,a1,a2,a3,a4,a5,a6){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_viifi(index,a1,a2,a3,a4){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2,a3,a4);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_vifi(index,a1,a2,a3){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2,a3);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iiiiiiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iiiiii(index,a1,a2,a3,a4,a5){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3,a4,a5);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iiiiid(index,a1,a2,a3,a4,a5){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3,a4,a5);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}// === Auto-generated postamble setup entry stuff ===
Module["ccall"]=ccall;Module["cwrap"]=cwrap;Module["UTF8ToString"]=UTF8ToString;var calledRun;/**
* @constructor
* @this {ExitStatus}
*/function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status;}var calledMain=false;dependenciesFulfilled=function runCaller(){// If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
if(!calledRun)run();if(!calledRun)dependenciesFulfilled=runCaller;// try this again later, after new deps are fulfilled
};/** @type {function(Array=)} */function run(args){args=args||arguments_;if(runDependencies>0){return;}preRun();// a preRun added a dependency, run will be called later
if(runDependencies>0){return;}function doRun(){// run may have just been called through dependencies being fulfilled just in this very frame,
// or while the async setStatus time below was happening
if(calledRun)return;calledRun=true;Module['calledRun']=true;if(ABORT)return;initRuntime();if(Module['onRuntimeInitialized'])Module['onRuntimeInitialized']();postRun();}if(Module['setStatus']){Module['setStatus']('Running...');setTimeout(function(){setTimeout(function(){Module['setStatus']('');},1);doRun();},1);}else{doRun();}}Module['run']=run;/** @param {boolean|number=} implicit */function exit(status,implicit){EXITSTATUS=status;procExit(status);}function procExit(code){EXITSTATUS=code;if(!keepRuntimeAlive()){if(Module['onExit'])Module['onExit'](code);ABORT=true;}quit_(code,new ExitStatus(code));}if(Module['preInit']){if(typeof Module['preInit']=='function')Module['preInit']=[Module['preInit']];while(Module['preInit'].length>0){Module['preInit'].pop()();}}run();// -------- AvDefView.js --------
// Generated by CoffeeScript 2.6.1
(function(){var AvDefView,FourCC,Logger,RQ,V3,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("Avatar");FourCC=cwaenv.get("FourCC");V3=cwaenv.get("E3Vec");RQ=cwaenv.get("RotQuat");//--------------
AvDefView=class AvDefView{//--------------
constructor(av,data,pngURIGen){var fpsc;this.av=av;this.data=data;this.pngURIGen=pngURIGen;//----------
// Avatar def DataView index:
this.i=0;//CAS frame indexing/timing data:
[this.ic,this.tc,fpsc]=[0,0,25];}nextUbyte(){var ii;ii=this.i;this.i+=1;return this.data.getUint8(ii);}//--------
nextUshort(){var ii;ii=this.i;this.i+=2;return this.data.getUint16(ii,true);}//---------
nextUint(){var ii;ii=this.i;this.i+=4;return this.data.getUint32(ii,true);}//-------
nextFloat(){var ii;ii=this.i;this.i+=4;return this.data.getFloat32(ii,true);}//--------
nextBool(){return this.nextUbyte()!==0;}//-------
nextStr(){var i,j,len,ref,str;//------
[len,str]=[this.nextUint(),""];for(j=i=0,ref=len;0<=ref?i<ref:i>ref;j=0<=ref?++i:--i){str+=String.fromCharCode(this.nextUbyte());}return str;}nextStr4cc(){return FourCC.fourCCInt(this.nextStr());}//---------
nextVec2(){var i,j,results;results=[];for(j=i=0;i<2;j=++i){results.push(this.nextFloat());}return results;}//-------
nextVec3(){var j;return V3.copyOfV3(function(){var i,results;results=[];for(j=i=0;i<3;j=++i){results.push(this.nextFloat());}return results;}.call(this));}//-------
nextQuat(){var j;return RQ.copyOfQV(function(){var i,results;results=[];for(j=i=0;i<4;j=++i){results.push(this.nextFloat());}return results;}.call(this));}//-------
nextMorphSet(){var ms,nml,ost,vtx,wgt;//-----------
vtx=this.nextUint();wgt=this.nextFloat();ost=this.nextVec3();nml=this.nextVec3();return ms={vertex:vtx,weight:wgt,offset:ost,normal:nml};}nextCASMorph(){var amt,id4,morph;//-----------
id4=this.nextUint();amt=this.nextFloat();return morph={id4cc:id4,amount:amt};}nextCASTRSet(){var id4,rtn,trn,trset;//-----------
id4=this.nextUint();trn=this.nextVec3();rtn=this.nextQuat();return trset={id4cc:id4,trans:trn,rot:rtn};}// CAS Frame sequence data:
resetCASTiming(fps){return[this.ic,this.tc,this.fpsc]=[0,0,fps];}//-------------
nextCASFrame(){var bns,dur,frame,icur,inxt,m,mphs,nm,nt,s,tcur,tnxt;//-----------
inxt=this.ic+1;tnxt=inxt*(1000/this.fpsc);[icur,tcur,dur,this.ic,this.tc]=[this.ic,this.tc,tnxt-this.tc,inxt,tnxt];if(typeof lggr.trace==="function"){lggr.trace(`AvDefView: iAmb=${icur}  tAmb=${tcur}`);}nm=this.nextUint();mphs=function(){var i,ref,results;results=[];for(m=i=0,ref=nm;0<=ref?i<ref:i>ref;m=0<=ref?++i:--i){results.push(this.nextCASMorph());}return results;}.call(this);nt=this.nextUint();bns=function(){var i,ref,results;results=[];for(s=i=0,ref=nt;0<=ref?i<ref:i>ref;s=0<=ref?++i:--i){results.push(this.nextCASTRSet());}return results;}.call(this);return frame={time:tcur,duration:dur,morphs:mphs,bones:bns};}nextSkelBone(){var bone,id4,iix,len,pr4,rtn,trn;//-----------
id4=this.nextUint();pr4=this.nextUint();trn=this.nextVec3();rtn=this.nextQuat();iix=this.nextQuat();len=this.nextFloat();return bone={id4cc:id4,parent4cc:pr4,trans:trn,rot:rtn,invInitXRot:iix,length:len};}checkBytes(lo,n,pfx){var bhex,i,ihex,k,lpad,ref,ref1,str,thisadv;//---------
thisadv=this;lpad=function(s,w){// pad numeric string with zeros to width w;
var i,ixs,ns,ref,ref1,ss;[ss,ns]=[s,s.length];if(ns<w){for(ixs=i=ref=ns,ref1=w;ref<=ref1?i<ref1:i>ref1;ixs=ref<=ref1?++i:--i){ss="0"+ss;}}return ss;};bhex=function(b){return lpad(b.toString(16),2);};ihex=function(z){return lpad(z.toString(16),8);};str="";for(k=i=ref=lo,ref1=lo+n;ref<=ref1?i<ref1:i>ref1;k=ref<=ref1?++i:--i){str+=bhex(this.data.getUint8(k))+" ";}return typeof lggr.trace==="function"?lggr.trace("AvDefView: "):void 0;//{ihex lo} #{pfx||''}: #{str}"
}bin2str(getfun,lo,n){var k,parts;//------
parts=function(){var i,ref,ref1,results;results=[];for(k=i=ref=lo,ref1=lo+n;ref<=ref1?i<ref1:i>ref1;k=ref<=ref1?++i:--i){results.push(String.fromCharCode(getfun(k)));}return results;}();return parts.join("");}base64Str(getfun,lo,n,pfx){var chars,k;//--------
chars=function(){var i,ref,ref1,results;results=[];for(k=i=ref=lo,ref1=lo+n;ref<=ref1?i<ref1:i>ref1;k=ref<=ref1?++i:--i){results.push(String.fromCharCode(getfun(k)));}return results;}();return window.btoa(chars.join(""));}};// getAllAvData: ->
//   @version = do @nextStr
//   lggr.debug? "Version: #{@version}"
//   lggr.debug "(now i=#{@i})"
//   @scale = do @nextFloat
//   @volMin = do @nextVec3
//   @volMax = do @nextVec3
//   @matRefl = do @nextVec3
//   @skelYOffset = do @nextFloat
//   @nMeshes = do @nextUint
//   lggr.debug "scale: #{@scale}"
//   lggr.debug "Mesh count: #{@nMeshes}"
//   lggr.debug "(now i=#{@i})"
//   for m in [0...@nMeshes]
//     @lodRange = do @nextFloat
//     @nMeshPts = do @nextUint
//     lggr.debug "Mesh points count: #{@nMeshPts}"
//     lggr.debug "(now i=#{@i})"
//     for p in [0...@nMeshPts]
//       @nInfluences = do @nextUint
//       mpiRange = [0...@nInfluences]
//       mpiOffsets = (do @nextVec3 for j in mpiRange)
//       mpiBaseNorms = (do @nextVec3 for j in mpiRange)
//       mpiNames = (do @nextStr for j in mpiRange)
//       mpiWeights = (do @nextFloat for j in mpiRange)
//       mpiBEDistances = (do @nextFloat for j in mpiRange)
//     @nTriStripIxs = do @nextUint
//     lggr.debug "TriStrip Index count: #{@nTriStripIxs}"
//     lggr.debug "(now i=#{@i})"
//     @triStripIndices = (do @nextUshort for j in [0...@nTriStripIxs])
//     @nDupVertices = do @nextUint
//     lggr.debug "Dup Vertices count: #{@nDupVertices}"
//     lggr.debug "(now i=#{@i})"
//     @dupVtxIndices = (do @nextUint for j in [0...@nDupVertices])
//     @nTxtrCoordPairs = do @nextUint
//     lggr.debug "Texture coord pairs count: #{@nTxtrCoordPairs}"
//     lggr.debug "(now i=#{@i})"
//     @textureCoordPairs = (do @nextVec2 for j in [0...@nTxtrCoordPairs])
//     @nMorphTargets = do @nextUint
//     lggr.debug "Morph Target count: #{@nMorphTargets}"
//     lggr.debug "(now i=#{@i})"
//     for t in [0...@nMorphTargets]
//       @mtName = do @nextStr
//       @nMorphSets = do @nextUint
//       @morphSets = (do @nextMorphSet for j in [0...@nMorphSets])
//   @nInitPose = do @nextUint
//   lggr.debug "Init Pose bone count: #{@nInitPose}"
//   lggr.debug "(now i=#{@i})"
//   initPose = (do @nextCASTRSet for j in [0...@nInitPose])
//   @nSkelBones = do @nextUint
//   lggr.debug "Skel bone count: #{@nSkelBones}"
//   lggr.debug "(now i=#{@i})"
//   skelBones = (do @nextSkelBone for j in [0...@nSkelBones])
//   #@checkBytes @i, 16, "at nAmbient"    #++++++++++++++++++++++++
//   @nAmbFrames = do @nextUint
//   lggr.debug "Ambient frames count: #{@nAmbFrames}"
//   lggr.debug "(now i=#{@i})"
//   if @nAmbFrames is 0
//     @ambFPS = -1
//     @ambFrames = []
//   else
//     @ambFPS = do @nextFloat
//     @resetCASTiming @ambFPS
//     @ambFrames = (do @nextCASFrame for j in [0...@nAmbFrames])
//   doLogLastAF = true
//   if doLogLastAF and @nAmbFrames
//     lastAF = @ambFrames[@nAmbFrames-1]
//     lastAFBones = lastAF.bones
//     lastAFBone = lastAFBones[lastAFBones.length-1]
//     lastAFBoneTrans = lastAFBone.trans
//     lggr.debug "Last ambient frame: i=#{@nAmbFrames-1}  t=#{lastAF.time}  "+
//       "nBones=#{lastAFBones.length}  "
//     lggr.debug "... id4cc: #{lastAFBone.id4cc.toString(16)}"
//     lggr.debug "... transX: #{lastAFBone.trans[0]}"
//   #@checkBytes @i, 8, "at tFileName"    #++++++++++++++++++++++++
//   @tFileName = do @nextStr
//   @tFlags = (do @nextBool for j in [0...12])
//   lggr.debug "Texture file:    [#{@tFileName}]"
//   lggr.debug "Embedded flag:   #{@tFlags[0]}"
//   lggr.debug "Compressed flag: #{@tFlags[1]}"
//   lggr.debug "PNG fmt. flag:   #{@tFlags[2]}"
//   lggr.debug "TGA fmt. flag:   #{@tFlags[3]}"
//   lggr.debug "JIB fmt. flag:   #{@tFlags[4]}"
//   lggr.debug "(now i=#{@i})"
//   #@tWidth = do @nextUint
//   #@tHeight = do @nextUint
//   nRemaining = @data.byteLength - @i
//   lggr.debug "Remaining block length: #{nRemaining}."
//   lggr.debug "----------------------------------------"
//   # Test conversion to base64
//   #
//   blockSize = @data.byteLength
//   thedata = @data;  dget = (k) -> thedata.getUint8 k
//   #lggr.debug "====  original  ===="
//   #lggr.debug "#{kk}: #{dget kk}" for kk in [256..264]
//   d64 = @base64Str dget, 0, blockSize
//   #lggr.debug "====  d64 [16384..18432)  ===="
//   #lggr.debug "#{d64[16384...18432]}"
//   invd64 = window.atob d64
//   dcopy = (invd64.charCodeAt kk for kk in [0...invd64.length])
//   lggr.debug "len dcopy: #{dcopy.length}"
//   #lggr.debug "====  copied  ===="
//   #lggr.debug "#{kk}: #{dcopy[kk]}" for kk in [256..264]
//   nMatch = 0
//   nMatch += Number((dget kk) is dcopy[kk]) for kk in [0...blockSize]
//   mmsg = if nMatch is blockSize then "OK" else "fail: nMatch=#{nMatch}"
//   lggr.debug "base64 test #{mmsg}."
// Export
cwaenv.add(AvDefView,"AvDefView");// (End AvDefView.coffee)
}).call(this);// -------- AvDataAccess.js --------
// Generated by CoffeeScript 2.6.1
(function(){var AvDataAccess,AvDefView,Config,Logger,cwaenv,document,lggr,setTimeout,zip;document=this.document;setTimeout=this.setTimeout;zip=this.zip;cwaenv=this.getCWAEnv();Config=cwaenv.get("Config");AvDefView=cwaenv.get("AvDefView");Logger=cwaenv.get("Logger");lggr=Logger.get("Avatar");// , "trace" # debug
AvDataAccess=function(){//-----------------
class AvDataAccess{static IS_PNG(ename){return /.+\.png$/.test(ename);}//------
constructor(avName,avDefHandler){var aitmap,aittag,ename,ref,tag;// "Instance" members.
/*
zip.js
------
Readers:
zip.TextReader( txt )
zip.BlobReader( blob )
zip.Data64URIReader( dataURI )
zip.HttpReader( url )
zip.HttpRangeReader( url )
Writers:
zip.TextWriter()
zip.BlobWriter()
zip.FileWriter( fileEntry )
zip.Data64URIWriter( [mimeString] )
* Added to the standard repertoire:
zip.DataViewWriter( bytelength )
*/this.setStatus=this.setStatus.bind(this);this.extractAvDefEntry=this.extractAvDefEntry.bind(this);// Process avatar definition #using provided AvDefHandler
this.procAvDef=this.procAvDef.bind(this);this.avName=avName;this.avDefHandler=avDefHandler;//----------
// avDefHandler may be undefined, but base and avName should be defined
this.setStatus("Initialising");this.avURL=`${Config.getAvBase(this.avName)}${this.avName}.jar`;this.avDataView=false;// Copy the standard filename-->tag map.
aitmap={};aittag=[];ref=AvDataAccess.STD_JARP_ITEM_TAG_MAP;for(ename in ref){tag=ref[ename];aitmap[ename]=tag;if(aittag.indexOf(tag)===-1){aittag.push(tag);}}this.avItemTagMap=aitmap;this.avItemTags=aittag;// Promise created by _AsynchAvJARScan
this.scanZIP=null;//Populated by ZIP scan
this.entries={};this.pngEntries={};this.XMLs={};this._AsynchAvJARScan();}setStatus(msg){msg=`AvDataAccess for ${this.avName}: `+msg;this.status=msg;return typeof lggr.trace==="function"?lggr.trace(msg):void 0;}_checksumdv(dv,prev=0){var c,i,j,ref;//----------
c=prev;for(i=j=0,ref=dv.byteLength;0<=ref?j<ref:j>ref;i=0<=ref?++j:--j){c=((c>>>1)+((c&1)<<15)|0)+(dv.getUint8(i)&0xff)&0xffff|0;}return c;}_startZIPScan(zURL,entryFun,doneFun,errorFun){var entriesFun,failFun;//------------
entriesFun=function(entries){var N,entry,i;N=entries.length;if(typeof lggr.debug==="function"){lggr.debug(`AvDataAccess: ${zURL} has ${N} ZIP entries.`);}for(i in entries){entry=entries[i];entryFun(i,entry);}return doneFun(N);};failFun=error=>{lggr.warn(`AvDataAccess: Error for ${zURL}: ${error}`);return errorFun(`Avatar ${this.avName}: ${error}`);};// do doneFun  # entry count arg is undefined
// 3 args: HTTP zip reader, reader callback, error callback
// The reader callback delivers a ZipReader.
return zip.createReader(new zip.HttpReader(zURL),function(zrdr){return zrdr.getEntries(entriesFun);},failFun);}_AsynchAvJARScan(){var N_ap,avPfx,jarURL;//--------------
this.setStatus("Scanning ZIP entries");jarURL=this.avURL;avPfx=`${this.avName}/`;N_ap=avPfx.length;if(typeof lggr.debug==="function"){lggr.debug(`AsynchAvJARScan started url=${jarURL}`);}return this.scanZIP=new Promise((resolve,reject)=>{var doneAllHandler,entryHandler;entryHandler=(i,entry)=>{var aitag,efname,ename,szc,szu;efname=entry.filename;if(efname.substring(0,N_ap)===avPfx){ename=efname.substring(N_ap);aitag=this.avItemTagMap[ename];if(aitag){this.entries[aitag]=entry;}else if(AvDataAccess.IS_PNG(ename)){this.pngEntries[ename]=entry;}szc=entry.compressedSize;szu=entry.uncompressedSize;if(szc===0){return typeof lggr.trace==="function"?lggr.trace(`AsynchAvJARScan ${this.avName}: entry '${ename}': (empty)`):void 0;}else{return typeof lggr.trace==="function"?lggr.trace(`AsynchAvJARScan ${this.avName}: entry '${ename}': ${szc}/${szu}`):void 0;}}};doneAllHandler=N=>{if(N){if(typeof lggr.debug==="function"){lggr.debug(`AsynchAvJARScan ${this.avName}: Ended url=${jarURL}. Entries=${N}`);}if(typeof lggr.trace==="function"){lggr.trace(`AsynchAvJARScan ${this.avName}: Entries:  ${Object.keys(this.entries)}`);}this.setStatus(`Found ${N} ZIP entries`);}else{// reject new Error "Scan of JAR #{jarURL} failed"
this.setStatus(`Scan of JAR ${jarURL} failed`);}return resolve(this);};return this._startZIPScan(jarURL,entryHandler,doneAllHandler,reject);});}extractAvDefEntry(ent){if(typeof lggr.trace==="function"){lggr.trace(`extractAvDefEntry: Seeking ${ent} for ${this.avName}`);}return this.scanZIP.then(ada=>{var base,theEntry;theEntry=ada.entries[ent];if(theEntry!=null){if(typeof lggr.trace==="function"){lggr.trace(`extractAvDefEntry: Valid ${ent} for ${this.avName}`);}return(base=ada.XMLs)[ent]!=null?base[ent]:base[ent]=new Promise((resolveXML,rejectXML)=>{var DVWriter,cb;if(typeof lggr.trace==="function"){lggr.trace(`extractAvDefEntry: Create Promise for ${ent} for ${this.avName}`);}cb=content=>{if(ent===AvDataAccess.STD_JARP_TAG){if(typeof lggr.trace==="function"){lggr.trace(`extractAvDefEntry: Loaded ${ent} for ${this.avName}: byteLength=${content.byteLength}`);}}else{if(typeof lggr.trace==="function"){lggr.trace(`extractAvDefEntry: Loaded ${ent} for ${this.avName}: length=${content.length}`);}}return resolveXML(content);};if(ent===AvDataAccess.STD_JARP_TAG){DVWriter=new zip.DataViewWriter(theEntry.uncompressedSize);}else{DVWriter=new zip.TextWriter("UTF-8");}theEntry.getData(DVWriter,cb);return void 0;});}else{if(typeof lggr.debug==="function"){lggr.debug(`extractAvDefEntry: No ${ent} for ${this.avName}`);}return Promise.reject(new Error(`No ${ent} for ${this.avName}`));}});}procAvDef(){return this.extractAvDefEntry(AvDataAccess.STD_JARP_TAG).then(dv=>{if(typeof lggr.info==="function"){lggr.info(`AvDataAccess: Process DataView for ${this.avName}: len=${dv.byteLength} chk=${this._checksumdv(dv)}`);}this.avDataView=dv;return new AvDefView(this.avName,this.avDataView,this._getPNGURIGenerator());});}// Returns a function that, given the entry name for a PNG file,
// returns an in-memory data URI string generator for that entry. (If
// there is no PNG entry with the given name the generator will return
// a null URL string.)
// Looks crazily overcomplicated. Considering use, cannot see point of the outer level of function call. JRWG
_getPNGURIGenerator(){//------------------
// Result: a function returning the URL generator for a given PNG
// file name.
return pngName=>{var pngEntry;pngEntry=this.pngEntries[pngName];// Result: PNG URI generator for the given PNG file:
return function(pngHandler){if(pngEntry){// Asynchronous delivery of PNG data.
pngEntry.getData(new zip.Data64URIWriter("image/png"),function(pngURI){return pngHandler(pngURI);});}else{// Asynchronous delivery of null PNG.
setTimeout(function(){return pngHandler(null);},0);}return void 0;// void result from PNG URI generator
};};}};//-----------------
// "Static" members.
AvDataAccess.STD_JARP_ITEM_TAG_MAP={//------------------
"asd.xml":"asd","avatardef.jarp":"avDef","avatardef.arp":"avDef","config.xml":"config","nonmanuals.xml":"nonManuals"};AvDataAccess.STD_JARP_TAG="avDef";return AvDataAccess;}.call(this);// Export
cwaenv.add(AvDataAccess,"AvDataAccess");// (End AvDataAccess.coffee)
}).call(this);// -------- AvatarCamera.js --------
// Generated by CoffeeScript 2.6.1
(function(){var AvatarCamera,Logger,M4,RQ,V3,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("Avatar");V3=cwaenv.get("E3Vec");RQ=cwaenv.get("RotQuat");M4=cwaenv.get("Mat4");AvatarCamera=function(){// Mangled/extended version of Wayne''s orbit_camera.js .
//-----------------
class AvatarCamera{//-----------------
constructor(gl,camData,yAdjust,FROM_METRES){this.touchstart=this.touchstart.bind(this);this.touchend=this.touchend.bind(this);this.touchmove=this.touchmove.bind(this);this.gl=gl;this.camData=camData;this.yAdjust=yAdjust;this.FROM_METRES=FROM_METRES;//----------
// Camera parameters -- as for JARP -- in @camData:
// Target (c.o.r.) [X,Y],  CamLoc [R,theta,phi], FOV,
//    Rotation Limits [l,r]
// Target Z==0,  CamLoc theta: from +Z in XZ plane,
//    phi: from XZ towards +Y;
// Lengths (X,Y,R):  in metres.
// Angles (theta,phi,FOV,l,r): in degrees.
// Typical values:  [ 0,0,  4,12,19,  30,  -1,-1 ];
// Psuedo-constants.
this.X_UNIT=V3.makeV3(1,0,0);this.Y_UNIT=V3.makeV3(0,1,0);// FROM_METRES scales lengths from metres to avatar/renderer''s
// internal units.
//@FROM_METRES
// The matrices defined by this camera for the GL Draw*() functions.
this.viewMat=AvatarCamera.makeIdTRMat();this.projMat=AvatarCamera.makeIdTRMat();// NB
// These matrices cannot be properly set in this ctor, because we
// need prototype methods that are not yet defined/accessible -- so
// we cache the necessary data now, and rely on the initial
// invocation of checkUpdateViewport() -- via update() -- to complete
// their initialisation.
// Data for projection matrix:
// - Viewport dimensions -- initially unknown, supplied as update
//   parameters;
// - Clip-plane Z values (metres);
// - FoV (degrees).
this.viewWidth=-1;this.viewHeight=-1;this.Z_NEAR=0.05;this.Z_FAR=500;this.FOV=this.camData[5];// Data defining the camera:
// - rotation of "looking-at" vector(cam/eye to target/c.o.r.);
// - radius, i.e. length of "looking-at" vector;
// - target position.
this.qCamRot=AvatarCamera.createRotation(this.Y_UNIT,0);this.orbitRadius=this.camData[2];this.camTarget=V3.makeV3(this.camData[0],this.camData[1]+this.yAdjust,0);// Cache camera rotation angles ("theta", "phi") for first viewport
// update.
this.initCamRots=[this.camData[3],-this.camData[4]];// Workspace for view matrix computation -- saves dynamic allocation.
this.camEye=V3.make3Vec();this.camEyeR=V3.make3Vec();this.camTargetR=V3.make3Vec();// Mouse-related data for camera control through mouse drags.
// Drag mode values:
// -ve: idle;
// 0:   no modifier keys -- rotate round Y-axis;
// 1:   SHIFT  -- up/down means zoom in/out;
// 2:   CTRL/CMD -- up/down means pan up/down.
this.dragMode=-1;this.shiftDown=false;this.ctrlDown=false;this.prevMouseXY=[0,0];this.newMouseXY=[0,0];// Reporting on camera updates
// Probably reports before mesh is ready
this.fixCount=1;this.vRotTot=0;this.hRotTot=0;// Touch-related data for camera control through mouse drags.
// Drag mode values:
// -ve: idle;
// 0:   1 finger drag -- rotate round Y-axis;
// 1:   2 finger drag -- up/down means zoom in/out;
// 2:   3 finger drag -- up/down means pan up/down.
this.prevTouchXY=[0,0];this.newTouchXY=[0,0];// Pseudo-constants for mouse and touch drag sensitivity configuration.
this.SCALE_TIME=200;this.DRAG_SENSITIVITY=0.7;this.DELTA_DIST_SCALE=0.01;if(typeof lggr.debug==="function"){lggr.debug(`AvatarCamera: Y-adjust (Metres): ${this.yAdjust.toFixed(3)}`);}if(typeof lggr.debug==="function"){lggr.debug(`AvatarCamera: Scale from Metres: ${this.FROM_METRES.toFixed(3)}`);}}//------------
//   Creates and returns a new quaternion vector representing the
//   rotation about the given axis about the given angle.
static createRotation(axis,angle){//--------------
return RQ.setAxisAngleQV(RQ.makeQV(0,0,0,0),axis,angle);}//   Creates and returns an identity TR transform matrix.
static makeIdTRMat(){var m;//---------
m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m;}// "Instance" members.
//================  ACCESSORS  ================
//   Returns the view matrix for this camera.
getViewMatrix(){return this.viewMat;}//------------
//   Returns the projection matrix for this camera..
getProjMatrix(){return this.projMat;}//------------
//================  MAIN SETTER  ================
//   Update camera, with any view shifts driven by mouse dragging,
//   for time lapse of dt (milliseconds), and latest viewport width,
//   height values.
//   Should be invoked before each draw() operation.
update(dt,w,h){var dts,dx,dxm,dy,dym,newCamData;//-----
this.checkUpdateViewport(w,h);if(0<=this.dragMode){// Allow a combination of touch and mouse events
// Turn mouse-motion and/or touch motion into xy rotation deltas in degrees.
dts=this.SCALE_TIME*dt;dx=this.newMouseXY[0]-this.prevMouseXY[0]+this.newTouchXY[0]-this.prevTouchXY[0];dy=this.newMouseXY[1]-this.prevMouseXY[1]+this.newTouchXY[1]-this.prevTouchXY[1];// The dts value is large in practice -- so this clamping is
// probably redundant without some tweaking:
dx=0<dx?Math.min(dts,dx):Math.max(-dts,dx);dy=0<dy?Math.min(dts,dy):Math.max(-dts,dy);dxm=dx*this.DRAG_SENSITIVITY;dym=dy*this.DRAG_SENSITIVITY;// Check for camera change
if(dx!==0||dy!==0){// lggr.debug? "Drag [#{dxm},#{dym}]"
this.fixCount=10;// Frames without camera change to report setting
}if(this.dragMode===0){// Neither CTRL nor SHIFT down.
// Horizontal mouse is rotate around y-axis (model-space).
// Vertical mouse is zoom -- up==in, down==out.
this.applyRotsOnVertAndHoriz(-dxm,0);this.orbitRadius-=dy*this.DELTA_DIST_SCALE;}else if(this.dragMode===1){// SHIFT down.
// Horizontal mouse is rotate around y-axis (model-space).
// Vertical mouse is rotate around x-axis (camera-space).
this.applyRotsOnVertAndHoriz(-dxm,-dym);}else if(this.dragMode===2){// CTRL down.
// Horizontal mouse does nothing.
// Vertical mouse pans up/down y-axis (object-space).
V3.setAddV3(this.camTarget,[0,dy*this.DELTA_DIST_SCALE,0]);}this.prevMouseXY=this.newMouseXY;this.prevTouchXY=this.newTouchXY;return this.updateViewMatrix();// TBD
// Suppress extreme movements -- e.g. z-distance too low, rotate
// over top or under bottom.
}else if(this.fixCount>0){this.fixCount--;if(this.fixCount===0){newCamData=[this.camTarget[0],this.camTarget[1]-this.yAdjust,this.orbitRadius,this.vRotTot,-this.hRotTot,this.FOV,this.camData[6],this.camData[7]];return typeof lggr.info==="function"?lggr.info(`New Camera: [${newCamData.map(function(v){return v.toFixed(2);}).toString()}]`):void 0;}}}// lggr.debug? "Orig Camera: [#{do (@camData.map (v) -> v.toFixed 2).toString}]"
// yAdjust=#{@yAdjust} camTarget=[#{do @camTarget.toString}]
//================  EVENT HANDLERS  ================
setShift(flag){return this.shiftDown=Boolean(flag);}//-------
setCtrl(flag){return this.ctrlDown=Boolean(flag);}//------
mouseover(evt){}//--------
// We''d like to check if this is the continuation of an earlier
// drag, but currently we have no way of doing so -- see mouseout()
// below -- so this is just a NO-OP.
mouseout(evt){//-------
// Without getting into a more elaborate event bubbling/capturing
// set up we have no way of detecting whether or not a subsequent
// mouseover is a continuation of the current drag (assuming
// mousedown is true at the present stage) -- so it''s best for us
// to treat every mouseout as an implicit mouseup, forcing
// termination of any camera-changing drags.
return this.mouseup();}mousedown(evt){//--------
this.setShift(evt.shiftKey);this.setCtrl(evt.ctrlKey||evt.metaKey);this.dragMode=this.shiftDown?1:this.ctrlDown?2:0;this.prevMouseXY=[evt.screenX,evt.screenY];return this.mousemove(evt);}mouseup(){return this.dragMode=-1;}//------
mousemove(evt){//--------
this.setShift(evt.shiftKey);this.setCtrl(evt.ctrlKey||evt.metaKey);if(0<=this.dragMode){return this.newMouseXY=[evt.screenX,evt.screenY];}}touchstart(evt){//---------
this.dragMode=Math.min(evt.touches.length-1,2);this.prevTouchXY=[evt.touches[0].pageX,evt.touches[0].pageY];//stat "Touchstart ln=#{evt.touches.length} mode=#{@dragMode} x=#{evt.touches[0].pageX} y=#{evt.touches[0].pageY}"
return this.touchmove(evt);}touchend(evt){//-------
//stat "Touchend"
return this.dragMode=-1;}touchmove(evt){//--------
evt.preventDefault();evt.stopPropagation();//stat "Touchmove mode=#{@dragMode} x=#{evt.touches[0].pageX} y=#{evt.touches[0].pageY}"
if(0<=this.dragMode){return this.newTouchXY=[evt.touches[0].pageX,evt.touches[0].pageY];}}//================  INTERNAL  ================
zVecFromViewMat(zXYZ,m4){return V3.setV3_xyz(zXYZ,m4[2],m4[6],m4[10]);}//--------------
//   Arguments are rotation angles, in degrees, on vertical and
//   horizontal axes.
applyRotsOnVertAndHoriz(vdegs,hdegs){var DEGS_TO_RADS,qrotH,qrotV;//----------------------
DEGS_TO_RADS=AvatarCamera.DEGS_TO_RADS;if(vdegs!==0){this.vRotTot+=vdegs;qrotV=AvatarCamera.createRotation(this.Y_UNIT,vdegs*DEGS_TO_RADS);RQ.setProductQV(this.qCamRot,qrotV,this.qCamRot);}if(hdegs!==0){this.hRotTot+=hdegs;qrotH=AvatarCamera.createRotation(this.X_UNIT,hdegs*DEGS_TO_RADS);RQ.setProductQV(this.qCamRot,this.qCamRot,qrotH);}// Assume at least one of our arguments is non-zero.
// We need the transpose to give the inversion required for the
// view matrix.
return RQ.setRotMat4x4TransposeFromQV(this.viewMat,this.qCamRot);}checkUpdateViewport(w,h){var crots;//------------------
crots=this.initCamRots;// Check for "first time through".
if(crots){// We want to do this in the ctor, but prototype methods aren't
// available at that stage.
this.applyRotsOnVertAndHoriz(crots[0],crots[1]);this.initCamRots=null;this.updateViewMatrix();// ...i.e. set it properly for first time.
}if(this.viewWidth!==w||this.viewHeight!==h){this.viewWidth=w;this.viewHeight=h;return this.setProjMatrix();}}setProjMatrix(){var h,szFar,szNear,w;//------------
w=this.viewWidth;h=this.viewHeight;szNear=this.Z_NEAR*this.FROM_METRES;szFar=this.Z_FAR*this.FROM_METRES;return M4.setPerspective(this.projMat,this.FOV,w/h,szNear,szFar);}updateViewMatrix(){//---------------
// Get eye position via view matrix z axis.
this.zVecFromViewMat(this.camEye,this.viewMat);V3.setScaleV3(this.camEye,this.orbitRadius);V3.setAddV3(this.camEye,this.camTarget);// Convert target and eye to renderer length units, and generate
// updated view matrix
V3.setV3(this.camEyeR,this.camEye);V3.setV3(this.camTargetR,this.camTarget);V3.setScaleV3(this.camEyeR,this.FROM_METRES);V3.setScaleV3(this.camTargetR,this.FROM_METRES);return M4.setLookAt(this.viewMat,this.camEyeR,this.camTargetR,this.Y_UNIT);}};// "Static" members.
//   Conversion factor: degrees to radians.
AvatarCamera.DEGS_TO_RADS=RQ.DEGS_TO_RADS;return AvatarCamera;}.call(this);// Export
cwaenv.add(AvatarCamera,"AvatarCamera");// (End AvatarCamera.coffee)
}).call(this);// -------- AvCache.js --------
// Generated by CoffeeScript 2.6.1
(function(){var AvCache,AvDataAccess,Logger,cwaenv,document,lggr;cwaenv=this.getCWAEnv();AvDataAccess=cwaenv.get("AvDataAccess");document=this.document;Logger=cwaenv.get("Logger");lggr=Logger.get("Avatar");// , "trace" # debug
AvCache=function(){//------------
class AvCache{//------------
// Automatically create empty entry when accessed
// Constructor should not be used directly
// Holds an AvDataAccess
constructor(avName){this.avName=avName;//----------
this.ADA=new AvDataAccess(this.avName);this.getZIPEnt=this.ADA.extractAvDefEntry;this.procAvDef=this.ADA.procAvDef;this.characters={};}static get(av){var cac,ref;cac=(ref=AvCache._theCache)!=null?ref[av]:void 0;if(cac!=null){if(typeof lggr.debug==="function"){lggr.debug(`AvCache: Get ${av}: Found`);}}else{if(typeof lggr.debug==="function"){lggr.debug(`AvCache: Get ${av}: Added`);}AvCache._theCache[av]=cac=new AvCache(av);}return cac;}static clear(av){var cac,ref,ref1;cac=(ref=AvCache._theCache)!=null?ref[av]:void 0;if(cac!=null){if((ref1=AvCache._theCache)!=null){ref1[av]=null;}return typeof lggr.debug==="function"?lggr.debug(`AvCache: Clear ${av}: Removed`):void 0;}else{return typeof lggr.debug==="function"?lggr.debug(`AvCache: Clear ${av}: Not Found`):void 0;}}// "Instance" members.
// getZIPEnt: (ent) -> @ADA.extractAvDefEntry ent   # See constructor
// procAvDef: -> do @ADA.procAvDef   # See constructor
setCharacter(theChar,avIx){return this.characters[avIx]=theChar;}getCharacter(avIx){return this.characters[avIx];}};// "Static" members.
AvCache._theCache={};return AvCache;}.call(this);// Export
cwaenv.add(AvCache,"AvCache");// (End AvCache.coffee)
}).call(this);// -------- CASTRSet.js --------
// Generated by CoffeeScript 2.6.1
(function(){var CASTRSet,FourCC,Logger,RQ,V3,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("CASAnim");FourCC=cwaenv.get("FourCC");V3=cwaenv.get("E3Vec");RQ=cwaenv.get("RotQuat");//-------------
CASTRSet=class CASTRSet{//-------------
constructor(){//----------
this.fourCCName=0;this.rotation=[0,0,0,1];this.translation=[0,0,0];}// "Static" members.
//   Creates a new JSA CAS TRSet copied from the given JSON TRSet.
static fromJSON(jsntrset){var trset;//--------
trset=new CASTRSet();trset.setFromJSON(jsntrset);return trset;}//   Creates a new JSA CAS TRSet copied from the given XML <bone> element.
static fromXML(boneel){var trset;//-------
trset=new CASTRSet();trset.setFromXML(boneel);return trset;}static fromBin(avdv){var trset;//-------
trset=new CASTRSet();trset.setFromBin(avdv);return trset;}//   Creates a new JSA CAS TRSet from the given components.
static create(name4cc,rot,trans){var trset;//------
trset=new CASTRSet();trset.setFrom(name4cc,rot,trans);return trset;}//   Creates a new JSA CAS TRSet from the given components.
static createFromStr(name4ccstr,rot,trans){var trset;//-------------
trset=new CASTRSet();trset.setFromStr(name4ccstr,rot,trans);return trset;}//   Tests whether the given pair of translations are (exactly) equal.
static equalTrans(ta,tb){//----------
return ta[0]===tb[0]&&ta[1]===tb[1]&&ta[2]===tb[2];}//   Checks whether the given pair of values are approximately equal.
static approxEq(x,y){var DIFF,EPS,SIZE;//--------
EPS=5e-5;DIFF=Math.abs(x-y);SIZE=Math.max(Math.abs(x),Math.abs(y));if(SIZE<=1){return DIFF<EPS;}else{return DIFF/SIZE<EPS;}}//   Tests whether the given pair of translations are approximately equal.
static approxEqTrans(ta,tb){var aeq,i;//------–-----
aeq=function(){var j,results;results=[];for(i=j=0;j<3;i=++j){results.push(this.approxEq(ta[i],tb[i]));}return results;}.call(this);return aeq[0]&&aeq[1]&&aeq[2];}//   Tests whether the given pair of rotations are approximately equal.
static approxEqRots(ra,rb){var aeq,i;//------–-----
aeq=function(){var j,results;results=[];for(i=j=0;j<4;i=++j){results.push(this.approxEq(ra[i],rb[i]));}return results;}.call(this);return aeq[0]&&aeq[1]&&aeq[2]&&aeq[3];}// "Instance" members.
//   Constructs this TR-Set from the given stream.
setFromJSON(jsntrset){//----------
// JSON CAS TR Set:
// { "id4cc": "ROOT", "trans": [0,0,0], "rot": [0,0,0.707,0.707] }
this.fourCCName=FourCC.fourCCInt(jsntrset.id4cc);if(jsntrset.rot){// NB Our arrays already exist.
// Allow for the possibility that rot and/or trans are left undefined,
// because unchanged w.r.t. previous frame.
RQ.setQV(this.rotation,jsntrset.rot);}if(jsntrset.trans){return V3.setV3(this.translation,jsntrset.trans);}}//   Defines this TR-set from the given XML CAS <bone> element.
setFromXML(boneel){var bname,brot,btrans,c,pel,rel,xyz,xyzw;//---------
btrans=null;brot=null;bname=boneel.getAttribute("name");pel=boneel.getElementsByTagName("position").item(0);rel=boneel.getElementsByTagName("qRotation").item(0);if(pel){xyz=["x","y","z"];btrans=function(){var j,len,results;results=[];for(j=0,len=xyz.length;j<len;j++){c=xyz[j];results.push(Number(pel.getAttribute(c)));}return results;}();}if(rel){xyzw=["x","y","z","w"];brot=function(){var j,len,results;results=[];for(j=0,len=xyzw.length;j<len;j++){c=xyzw[j];results.push(Number(rel.getAttribute(c)));}return results;}();}return this.setFromStr(bname,brot,btrans);}setFromBin(avdv){var id4cc,rot,trans,xyz,xyzw;//---------
id4cc=avdv.nextUint();trans=function(){var j,len,ref,results;ref=avdv.nextVec3();results=[];for(j=0,len=ref.length;j<len;j++){xyz=ref[j];results.push(xyz);}return results;}();rot=function(){var j,len,ref,results;ref=avdv.nextQuat();results=[];for(j=0,len=ref.length;j<len;j++){xyzw=ref[j];results.push(xyzw);}return results;}();return this.setFrom(id4cc,rot,trans);}//   Constructs a new CASTRSet with the given name, and using the
//   given rotation and translation arrays (which are not copied).
setFromStr(name,rot,trans){//---------
// Shallow copy.
return this.setFrom(FourCC.fourCCInt(name),rot,trans);}//   Constructs a new CASTRSet with the given (4cc) name, and
//   using the given rotation and translation arrays (which are not
//   copied).
setFrom(name4cc,rot,trans){//------
// Shallow copy.
this.fourCCName=name4cc;this.rotation=rot;return this.translation=trans;}//   Constructs a new TR-Set, copied from the given one -- by overwriting
//   the existing rotation and translation arrays.
setFromTRSet(trs){//-----------
this.fourCCName=trs.getFourCC();// Overwrite rotation, translation.
RQ.setQV(this.rotation,trs.getRotation());return V3.setV3(this.translation,trs.getTranslation());}//   Indicates whether or not this TR set has the given 4-CC name.
has4CCName(nm4cc){return this.fourCCName===nm4cc;}//---------
//   Returns this PR-Set''s name.
getFourCC(){return this.fourCCName;}//--------
//   Returns this TR-Set''s translation array (length 3).
getTranslation(){return this.translation;}//-------------
//   Returns this TR-Set''s rotation array [xyzw] (length 4).
getRotation(){return this.rotation;}//----------
//   Updates this TR-Set to be a copy of the given one.
//   JS/CS version: this is a synonym for setFromTRSet.
//   That is, we copy the array data, not the array refs.
set(trs){return this.setFromTRSet(trs);}//--
//   Sets this TR-Set''s Four-CC name.
setFourCC(fcctag){return this.fourCCName=fcctag;}//--------
//   Sets this PR-Set''s rotation values from the given PR-set.
//   (Still needed for JS version?)
setRotation(trs){//----------
return this.rotation=RQ.copyOfQV(trs.getRotation());}//   Sets this TR-Set''s translation values from the given TR-set.
//   (Still needed for JS version?)
setTranslation(trs){//-------------
return this.translation=V3.copyOfV3(trs.getTranslation());}//   Returns a hash code value for this object. (Not needed for JS?)
hashCode(){var rhc,thc;//-------
// This is rather a crude definition but it respects our
// definition of equals() below.
thc=this.translation===null?0:this.translation.hashCode();rhc=this.rotation===null?0:this.rotation.hashCode();return this.fourCCName+thc+rhc;}//   Determines whether or not the given object is a CASTRSet
//   whose components match this one -- in the sense that the 4cc
//   tags are equal, the translations are exactly equal, and the
//   rotations are approximately equal.
matches(other){var FOURCC,ROT,TRANS,TRS,eq;//------
TRS=CASTRSet;eq=this===other;// (JS: is 'instanceof' going to be OK here?)
if(!eq&&other instanceof TRS){FOURCC=other.getFourCC();TRANS=other.getTranslation();ROT=other.getRotation();if(this.fourCCName===FOURCC){if(TRS.equalTrans(this.translation,TRANS)){if(TRS.approxEqRots(this.rotation,ROT)){eq=true;}}}}return eq;}//   Return a CASTRSet as an object
asObject(){return{id4cc:FourCC.fourCCStr(this.fourCCName),trans:this.translation,rot:this.rotation};}};// Export
cwaenv.add(CASTRSet,"CASTRSet");// (End CASTRSet.coffee)
}).call(this);// -------- CASMorph.js --------
// Generated by CoffeeScript 2.6.1
(function(){var CASMorph,FourCC,Logger,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("CASAnim");FourCC=cwaenv.get("FourCC");CASMorph=function(){//-------------
class CASMorph{//-------------
constructor(){this.fourCCName=0;this.amount=0;}//---------
//   Creates a new JSA CAS Morph copied from the given JSON morph.
static fromJSON(jsnmorph){var morph;//--------
morph=new CASMorph();morph.setFromJSON(jsnmorph);return morph;}//   Creates a new JSA CAS Morph copied from the given XML <morph> element.
static fromXML(mrphel){var morph;//-------
morph=new CASMorph();morph.setFromXML(mrphel);return morph;}static fromBin(avdv){var morph;//-------
morph=new CASMorph();morph.setFromBin(avdv);return morph;}//   Creates a new JSA CAS Morph from the given argument values.
static create(name4cc,value){var morph;//------
morph=new CASMorph();morph.set(name4cc,value);return morph;}//   Creates a new JSA CAS Morph from the given argument values.
static createFromStr(name4ccstr,value){var morph;//-------------
morph=new CASMorph();morph.setFromStr(name4ccstr,value);return morph;}// "Instance" members.
//   Defines this morph from the given JSON morph object.
setFromJSON(jsnmrph){//----------
// JSON morph:  { "id4cc" : "eylc", "amount" : 0.16 }
this.fourCCName=FourCC.fourCCInt(jsnmrph.id4cc);return this.amount=jsnmrph.amount;}//   Defines this morph from the given XML CAS <morph> element.
setFromXML(mrphel){//---------
return this.setFromStr(mrphel.getAttribute("name"),Number(mrphel.getAttribute("amount")));}setFromBin(avdv){//---------
this.fourCCName=avdv.nextUint();return this.amount=avdv.nextFloat();}//   Constructs a shape morph with the given name and amount value.
setFromStr(name,value){//---------
return this.set(FourCC.fourCCInt(name),value);}//   Redefines this morph from the given (4cc) name and amount values.
set(name4cc,value){this.fourCCName=name4cc;return this.amount=value;}//--
//   Constructs a copy of the given morph.
setFromMorph(morph){//-----------
this.fourCCName=morph.getName();return this.amount=morph.getAmount();}//   Indicates whether or not this morph has the given Four-CC name.
hasName(nm4cc){return this.fourCCName===nm4cc;}//------
//   Returns this morph''s Four-CC name.
getName(){return this.fourCCName;}//------
//   Returns this morph''s Four-CC name.
getFourCC(){return this.fourCCName;}//--------
//   Returns this morph''s Four-CC name as a string.
getFourCCStr(){return FourCC.fourCCStr(this.fourCCName);}//-----------
//   Returns this morph''s amount value.
getAmount(){return this.amount;}//--------
//   Private method: returns a text string representing this
//   morph, using the given amount string.
_makeText(amtstr){var NX,nmstr,pad;//--------
nmstr=FourCC.fourCCString(this.fourCCName);NX=4-nmstr.length;pad=0<NX?"    ".slice(0,NX):"";return`${nmstr}${pad}  ${this.amtstr}`;}//   Returns a string representation of this morph.
asText(){return this._makeText(`${this.amount}`);}//-----
//   Returns a string representation of this morph, with the amount
//   value represented restricted to four fractional digits.
asText4(){return this._makeText(`${this.amount.toFixed(4)}`);}//-----
//   Return a CASMorph as an object
asObject(){return{id4cc:FourCC.fourCCStr(this.fourCCName),amount:this.amount};}};//----------
// "Static" members.
//   Standard empty set of morphs.
CASMorph.NO_MORPHS=[];return CASMorph;}.call(this);// Export
cwaenv.add(CASMorph,"CASMorph");// (End CASMorph.coffee)
}).call(this);// -------- CASFrame.js --------
// Generated by CoffeeScript 2.6.1
(function(){var CASFrame,CASMorph,CASTRSet,Logger,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("CASAnim");CASTRSet=cwaenv.get("CASTRSet");CASMorph=cwaenv.get("CASMorph");CASFrame=function(){//-------------
class CASFrame{//-------------
constructor(){//----------
this.timeStamp=this.duration=0;this.trSets=this.morphs=this.trSetMap=this.morphMap=null;this.sign=null;}//---------
//   Creates a new JSA CAS Frame from the given JSON frame.
static fromJSON(jsnframe){var frame;//--------
frame=new CASFrame();frame.setFromJSON(jsnframe);return frame;}//   Creates a new JSA CAS Frame from the given XML <frame> element.
static fromXML(frmel){var frame;//-------
frame=new CASFrame();frame.setFromXML(frmel);return frame;}//   Creates a new JSA CAS Frame from the given binary avatar
//   definition view.
static fromBin(avdv){var frame;//-------
frame=new CASFrame();frame.setFromBin(avdv);return frame;}//   Creates a new CAS Frame with the given components.
static create(time,dur,bones,morphs){var frame;//------
frame=new CASFrame();frame.set(time,dur,bones,morphs);return frame;}//   Returns the frame rate for the given frames array, calculated
//   from the duration of the initial frame.
static getFrameRate(frames){var frameok;//------------
// Use 25fps as the somewhat arbitrary default value.
frameok=frames&&frames.length!==0;if(frameok){return 1000/frames[0].duration;}else{return 25;}}// "Instance" members.
//   Constructs a frame by copying all the data from the given one.
//   [==  CURRENTLY UNUSED  ==]
copyCASFrame(frame){//-----------
return this.copy(frame.getTime(),frame.getDuration(),frame.getTRSets(),frame.getMorphs());}//   Completely redefines this frame by creating its own copies
//   of all the given data.
//   [==  CURRENTLY UNUSED  ==]
copy(time,dur,bones,morphvec){//---
// Was: @set time, dur, (do bones.slice), (do morphvec?.slice)
return this.set(time,dur,bones.slice(),morphvec!=null?morphvec.slice():void 0);}//   Constructs a frame using the given arrays.
setCASFrameBM(bones,morphs){return this.set(-1,0,bones,morphs);}//------------
//   Constructs a frame using the given time-stamp and data arrays.
setCASFrameTBM(time,bones,morphs){return this.set(time,0,bones,morphs);}//-------------
//   Constructs a new frame with the given timing values
//   and the morphs and bones data taken from the given JSON frame.
//   JRWG: Unused, which is good as @time should presumably be @timeStamp
setFromJSON_TD(jsnframe,t,dur){//-------------
this.setFromJSON(jsnframe);this.time=t;return this.duration=dur;}//   Constructs a new frame from the given JSON frame.
setFromJSON(jsnframe){var JMPHS,bones,morphs;//----------
JMPHS=jsnframe.morphs;morphs=JMPHS.length===0?null:JMPHS.map(CASMorph.fromJSON);bones=jsnframe.bones.map(CASTRSet.fromJSON);return this.set(jsnframe.time,jsnframe.duration,bones,morphs);}//   Constructs a new frame from the given XML <frame> element.
setFromXML(frmel){var NB,NM,b,bones,dur,fbones,fmphs,j,k,m,morphs,ref,ref1,time;//---------
morphs=null;bones=[];time=Number(frmel.getAttribute("time"));dur=Number(frmel.getAttribute("duration"));fmphs=frmel.getElementsByTagName("morph");fbones=frmel.getElementsByTagName("bone");NM=fmphs.length;NB=fbones.length;if(NM!==0){morphs=[];for(m=j=0,ref=NM;0<=ref?j<ref:j>ref;m=0<=ref?++j:--j){morphs.push(CASMorph.fromXML(fmphs.item(m)));}}for(b=k=0,ref1=NB;0<=ref1?k<ref1:k>ref1;b=0<=ref1?++k:--k){bones.push(CASTRSet.fromXML(fbones.item(b)));}return this.set(time,dur,bones,morphs);}//   Constructs a new frame from the given binary avatar definition
//   view.
setFromBin(avdv){var b,bones,m,morphs,nBones,nMorphs;//---------
nMorphs=avdv.nextUint();morphs=nMorphs===0?null:function(){var j,ref,results;results=[];for(m=j=0,ref=nMorphs;0<=ref?j<ref:j>ref;m=0<=ref?++j:--j){results.push(CASMorph.fromBin(avdv));}return results;}();nBones=avdv.nextUint();bones=function(){var j,ref,results;results=[];for(b=j=0,ref=nBones;0<=ref?j<ref:j>ref;b=0<=ref?++j:--j){results.push(CASTRSet.fromBin(avdv));}return results;}();return this.set(-1,-1,bones,morphs);}//   Completely redefines this frame by attaching the given
//   data to it -- that is, the array references are copied, not
//   the arrays themselves.
set(time,dur,bones,morphs){//--
this.timeStamp=time;this.duration=dur;this.trSets=bones;this.morphs=morphs||CASMorph.NO_MORPHS;// In JARP, the decision to create maps was determined by the array
// sizes.  In JSARP, we always have a map (a sparse array).
// For now we assume the map is always used (or the context is not
// time-critical), so we create it here and now.
// (But this assumption may need to be reviewed.)
this.makeTRSetMap();return this.makeMorphMap();}//   Returns this frame's timestamp.
getTime(){return this.timeStamp;}//------
//   Returns this frame's timestamp.
getDuration(){return this.duration;}//----------
//   Returns this frame's TR-Set (bones) array.
getTRSets(){return this.trSets;}//--------
//   Returns this frame's morph array.
getMorphs(){return this.morphs;}//--------
//   Returns this frame''s TR-set of the given name, if it has one,
//   or {@code null} otherwise.
getTRSet(bone4cc){return this.trSetMap[bone4cc]||null;}//-------
//   Returns this frame''s morph of the given name if it has one, or
//   {@code null} otherwise.
getMorph(morph4cc){return this.morphMap[morph4cc]||null;}//-------
//   Sets the timestamp for this frame.
setTime(ts){return this.timeStamp=ts;}//------
//   Increases this frame''s timestamp by the given amount.
adjustTime(tadj){return this.timeStamp+=tadj;}//---------
//   Sets the duration for this frame.
setDuration(dur){return this.duration=dur;}//----------
//   Creates the TRSet map for this frame, mapping the name of each
//   of the frame''s bones to its entry in the frame''s {@link CASTRSet}
//   list.
makeTRSetMap(){var NS,TRSETS,TRSMAP,i,j,ref,trs;//-----------
TRSETS=this.trSets;NS=TRSETS.length;TRSMAP=[];for(i=j=0,ref=NS;0<=ref?j<ref:j>ref;i=0<=ref?++j:--j){trs=TRSETS[i],TRSMAP[trs.getFourCC()]=trs;}return this.trSetMap=TRSMAP;}//   Creates the morph map for this frame, mapping each of the
//   morph names used in the frame to its entry in the frame''s
//   {@link CASMorph} list.
makeMorphMap(){var MORPHS,MPHMAP,NM,i,j,mph,ref;//-----------
MORPHS=this.morphs;NM=MORPHS.length;MPHMAP=[];for(i=j=0,ref=NM;0<=ref?j<ref:j>ref;i=0<=ref?++j:--j){// Empty MORPHS should always be represented as [], rather than null.
// (See set() method above.)
mph=MORPHS[i],MPHMAP[mph.getFourCC()]=mph;}return this.morphMap=MPHMAP;}//   Return a CASFrame as an object
asObject(){var mp,ts;return{sign:this.sign,time:this.timeStamp,duration:this.duration,sign:this.sign,morphs:function(){var j,len,ref,results;ref=this.morphs;results=[];for(j=0,len=ref.length;j<len;j++){mp=ref[j];results.push(mp.asObject());}return results;}.call(this),bones:function(){var j,len,ref,results;ref=this.trSets;results=[];for(j=0,len=ref.length;j<len;j++){ts=ref[j];results.push(ts.asObject());}return results;}.call(this)};}};// "Static" members.
//   Threshold value for size at which a map is used
//   (From Java version -- not used in JS).
CASFrame.MAP_LO_SIZE=8;//-----------
//   Empty array of CASMorphs.
CASFrame.NO_MORPHS=[];return CASFrame;}.call(this);// Export
cwaenv.add(CASFrame,"CASFrame");// (End CASFrame.coffee)
}).call(this);// -------- Bone.js --------
// Generated by CoffeeScript 2.6.1
(function(){var Bone,FourCC,Logger,RQ,TRX,V3,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;FourCC=cwaenv.get("FourCC");V3=cwaenv.get("E3Vec");RQ=cwaenv.get("RotQuat");TRX=cwaenv.get("TRXform");Logger=cwaenv.get("Logger");lggr=Logger.get("Animate");Bone=function(){//---------
class Bone{//---------
constructor(){//----------
this.parent=null;this.fourCCName=this.parentFourCCName=0;// Local translation is a 3-vector, rotation is a 4-vector.
this.localTrans=null;this.localRot=null;this.inverseInitRotationX=null;this.length=0;this.doWristTwist=this.doShoulderTwist=false;this.childBones=[];this.globalTRX=TRX.create();this.bindPoseTRX=TRX.create();this.invBindPoseTRX=TRX.create();this.skinTRX=TRX.create();}//--------
static fromJSON(jsnbone){var bone;//--------
bone=new Bone();bone.setFromJSON(jsnbone);return bone;}static fromBin(avdv){var bone;//-------
bone=new Bone();bone.setFromBin(avdv);return bone;}// "Instance" members.
setFromJSON(jsnbone){var CVT4cc;//----------
// Get own and parent 4cc codes.
CVT4cc=FourCC.fourCCInt;this.fourCCName=CVT4cc(jsnbone.id4cc);this.parentFourCCName=CVT4cc(jsnbone.parent4cc);// Get the initial translation and rotation (as float-arrays).
this.localTrans=V3.copyOfV3(jsnbone.trans);this.localRot=RQ.copyOfQV(jsnbone.rot);// Get (the inverse of) the initial X-rotation.
this.inverseInitRotationX=jsnbone.invInitXRot;// Get the length.
this.length=jsnbone.length;return this.setSlideFlags();}setFromBin(avdv){var xyz,xyzw;//---------
// Get own and parent 4cc codes.
this.fourCCName=avdv.nextUint();this.parentFourCCName=avdv.nextUint();// Get the initial translation and rotation (as float-arrays).
this.localTrans=function(){var j,len,ref,results;ref=avdv.nextVec3();results=[];for(j=0,len=ref.length;j<len;j++){xyz=ref[j];results.push(xyz);}return results;}();this.localRot=function(){var j,len,ref,results;ref=avdv.nextQuat();results=[];for(j=0,len=ref.length;j<len;j++){xyzw=ref[j];results.push(xyzw);}return results;}();// Get the inverse of the initial X-rotation.
this.inverseInitRotationX=function(){var j,len,ref,results;ref=avdv.nextQuat();results=[];for(j=0,len=ref.length;j<len;j++){xyzw=ref[j];results.push(xyzw);}return results;}();// Get the length.
this.length=avdv.nextFloat();return this.setSlideFlags();}setSlideFlags(){var B,ID4;//------------
B=Bone;ID4=this.fourCCName;this.doShoulderTwist=ID4===B.LUPA_4CC||ID4===B.RUPA_4CC;return this.doWristTwist=ID4===B.LLRA_4CC||ID4===B.RLRA_4CC;}//   Sets this bone''s parent.
setParent(prnt){return this.parent=prnt;}//--------
//   Returns this bone''s current global transform.
getGlobalTRX(){return this.globalTRX;}//-----------
//   Returns this bone''s parent bone.
getParent(){return this.parent;}//--------
//   Returns the child bone of this bone with the given index.
getChild(i){return this.childBones[i];}//-------
//   Adds the given bone to this bone''s dynamic children list.
addChild(cb){return this.childBones.push(cb);}//-------
//   Determines whether or not this bone is at the root of its
//   hierarchy (by testing whether or not it has a parent).
isRoot(){return this.parent===null;}//-----
//   Returns this bone''s Four-CC name.
get4CC(){return this.fourCCName;}//-----
//   Returns the Four-CC name of this bone''s parent.
getParent4CC(){return this.parentFourCCName;}//-----------
//   Returns this bone''s length.
getLength(){return this.length;}//--------
//   Returns this bone's current rotation in local coordinates,
//   as an XYZ vector.
getLocalRot(){return this.localRot;}//----------
//   Returns this bone's "inverse initial rotation on X", i.e. the
//   inverse of its initial twist rotation.
getInvInitRotX(){return this.inverseInitRotationX;}//-------------
//   Indicate if this bone does twisting.
doesTwist(){//--------
return this.doShoulderTwist||this.doWristTwist||this.parentDoesWristTwist();}//   Indicate if this bone''s parent (if any) does skin-sliding.
parentDoesWristTwist(){return this.parent!==null&&this.parent.doWristTwist();}//-------------------
doesShoulderTwist(){return this.doShoulderTwist;}//----------------
doesWristTwist(){return this.doWristTwist;}//-------------
//   Returns this bone's bind pose TR transform.
getBindPoseTRX(){return this.bindPoseTRX;}//-------------
//   Returns this bone's bind pose TR transform.
getInvBindPoseTRX(){return this.invBindPoseTRX;}//----------------
//   Update this bone''s local translation and rotation from the given
//   TR-Set data.
updateLocalTransAndRot(newtrs){//---------------------
this.localTrans=newtrs.getTranslation();return this.localRot=newtrs.getRotation();}//   Update this bone''s local rotation from the given TR-Set data
//   (so the given translation is ignored).
updateLocalRot(newtrs){return this.localRot=newtrs.getRotation();}//-------------
//   Computes this bone''s gobal transform from that of its parent
//   (unless this is the root bone) together with its own current
//   TR transform, and then does the same recursively for its
//   descendants in the hierarchy.
computeGlobalTransforms(){var child,j,len,ref,results;//----------------------
this.globalTRX.copyTRV(this.localTrans,this.localRot);if(!this.isRoot()){this.globalTRX.setPreStar(this.parent.getGlobalTRX());}ref=this.childBones;results=[];for(j=0,len=ref.length;j<len;j++){child=ref[j];results.push(child.computeGlobalTransforms());}return results;}//   Generates bind pose data for this bone from its current global
//   TR transform
generateBindPoseData(){//-------------------
// We need to retain TR xforms for both the bind pose and its inverse.
this.bindPoseTRX.copyTRX(this.globalTRX);this.invBindPoseTRX.copyTRX(this.globalTRX);return this.invBindPoseTRX.setInvert();}//   Generates this bone's skinning matrix data, from its current global
//   TR transform, in the given 3x4 row-major matrix.
generateSkinMatRows(m){//------------------
this.skinTRX.copyTRX(this.globalTRX);this.skinTRX.setPostStar(this.invBindPoseTRX);this.skinTRX.convertToRowsMat3x4(m);return m;// return the given skin matrix
}idStr(){return FourCC.fourCCStr(this.fourCCName);}};// "Static" members.
Bone.DEGS_TO_RADS=RQ.DEGS_TO_RADS;//------------
Bone.RADS_TO_DEGS=RQ.RADS_TO_DEGS;//------------
Bone.LUPA_4CC=FourCC.fourCCInt("LUPA");//--------
Bone.RUPA_4CC=FourCC.fourCCInt("RUPA");//--------
Bone.LLRA_4CC=FourCC.fourCCInt("LLRA");//--------
Bone.RLRA_4CC=FourCC.fourCCInt("RLRA");return Bone;}.call(this);/*-------- for debugging --------
idStr: -> FourCC.fourCCStr @fourCCName
#----
showTRMat: (tag, m) ->
#--------
SP = " "
rowStr = (i) -> RQ.qStr (m[i+4*j] for j in [0...4]), 2
id = do @idStr
lggr.debug? "#{id} #{tag}:"
lggr.debug? "        #{rowStr i}" for i in [0...4]
*/ // Export
cwaenv.add(Bone,"Bone");// (End Bone.coffee)
}).call(this);// -------- Skeleton.js --------
// Generated by CoffeeScript 2.6.1
(function(){var Bone,FourCC,Logger,RQ,Skeleton,cwaenv,document,lggr,setTimeout,splice=[].splice;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("Animate");FourCC=cwaenv.get("FourCC");RQ=cwaenv.get("RotQuat");Bone=cwaenv.get("Bone");Skeleton=function(){//-------------
class Skeleton{//-------------
constructor(usetrx,cputrx2mat){//----------
this.root=null;// To support access to the individual bones we have two arrays:
// the bones as a contiguous array, and a (sparse) map from the bones'
// 4cc names to the bones' primary indices, i.e their indices in the
// first array.  These indices give a topological sort w.r.t. the
// skeleton hierarchy -- i.e. the root bone comes first and every
// other bone appears later than its parent. Considering these arrays
// as mappings, the composition of the first with the second gives a
// mapping to the bones from their 4cc names.
this.bones=null;this.boneIndicesBy4CC=null;this.skinMatRows=null;this.boneSkinMatRows=null;this.USE_TRX_BONE_DATA=usetrx;this.TEST_CPU_TRX_TO_MAT=cputrx2mat;this.skelTexWidth=0;this.skelTexHeight=0;this.skelXformsData=null;this.twistData=null;this.ntdchk=0;//----
this.nchk=0;}//-------
static create(jsnskel,usetrx,cputrx2mat){var skeleton;//------
skeleton=new Skeleton(usetrx,cputrx2mat);skeleton.setFromJSON(jsnskel);return skeleton;}static fromBin(avdv,usetrx,cputrx2mat){var skeleton;//------
skeleton=new Skeleton(usetrx,cputrx2mat);skeleton.setFromBin(avdv);return skeleton;}// "Instance" members.
setFromJSON(jsnbones){//----------
return this.buildSkeleton(jsnbones.length,function(b){return Bone.fromJSON(jsnbones[b]);});}setFromBin(avdv){//---------
return this.buildSkeleton(avdv.nextUint(),function(){return Bone.fromBin(avdv);});}buildSkeleton(nbones,nextBoneFun){var b,bone,k,ref;//------------
this.bones=new Array(nbones);this.boneIndicesBy4CC=[];for(b=k=0,ref=nbones;0<=ref?k<ref:k>ref;b=0<=ref?++k:--k){this.bones[b]=bone=nextBoneFun(b);this.setExtraDataForBone(b,bone);}this.createTwistData();return this.generateBindPoseData();}setExtraDataForBone(b,bone){var b4cc,p4cc,parentBone;//------------------
b4cc=bone.get4CC();if(b4cc===Skeleton.ROOT4cc){// Check for root bone.
this.root=bone;}// Record the mapping of the bone''s 4cc name to its index in this
// skeleton''s main @bones array.
this.boneIndicesBy4CC[b4cc]=b;if(typeof lggr.trace==="function"){lggr.trace(`boneIndicesBy4CC[\"${FourCC.fourCCStr(b4cc)}\"(${b4cc})] = ${this.boneIndicesBy4CC[b4cc]}`);}// If the bone has a parent, then make the links in both directions
// between parent and child.
// JRWG: relies on parent being defined first
p4cc=bone.getParent4CC();if(p4cc){if(typeof lggr.trace==="function"){lggr.trace(`getBoneBy4CC parent \"${FourCC.fourCCStr(p4cc)}\"(${p4cc}) bone ix=${this.boneIndicesBy4CC[p4cc]}`);}parentBone=this.getBoneBy4CC(p4cc);bone.setParent(parentBone);return parentBone.addChild(bone);}}calcTexSize(elFloats,elRows){var texHeight,texWidth;//----------
texWidth=1;while(texWidth<elFloats){texWidth*=2;}// Sanity Check
if(elFloats!==texWidth){lggr.warn(`calTexSize: WARNING: Element size ${elFloats} for data as texture needs to be power of two`);}// Width at least one 4-float pixel
texWidth=Math.max(4,texWidth);texHeight=1;while(texWidth*texHeight<elRows*elFloats){texHeight*=2;}if(typeof lggr.trace==="function"){lggr.trace(`calcTexSize(${elFloats},${elRows}) -> [${texWidth*texHeight},${texWidth/4},${texHeight}]`);}return[texWidth*texHeight,texWidth/4,texHeight];}createTwistData(){var NB,SKEL,b,b4,bTwData,bone,flags,i,k,len,p4cc,parentID,ref,results,rotW,rotX,vecSize;//--------------
NB=this.bones.length;SKEL=Skeleton;[vecSize,this.twistTexWidth,this.twistTexHeight]=this.calcTexSize(4,NB);this.twistData=new Float32Array(vecSize);ref=this.bones;results=[];for(b=k=0,len=ref.length;k<len;b=++k){bone=ref[b];b4=4*b;flags=1;if(bone.doesShoulderTwist()){flags*=SKEL.SHOULDER_TWIST_FLAG_VALUE;}if(bone.doesWristTwist()){flags*=SKEL.WRIST_TWIST_FLAG_VALUE;}p4cc=bone.getParent4CC();parentID=p4cc===0?-1:this.boneIndicesBy4CC[p4cc];rotX=rotW=-1;bTwData=[rotX,rotW,parentID,flags];results.push(function(){var l,results1;results1=[];for(i=l=0;l<4;i=++l){results1.push(this.twistData[b4+i]=bTwData[i]);}return results1;}.call(this));}return results;}updateTwistData(){var b,b4,bone,iirxRQ,k,len,ref,tbone,twistRQ;//--------------
twistRQ=RQ.create();iirxRQ=RQ.create();ref=this.bones;for(b=k=0,len=ref.length;k<len;b=++k){bone=ref[b];b4=4*b;// Flags value > 1 implies twisting on this bone.
if(this.twistData[b4+3]!==1){// For upper arm (shoulder) twist it's the twist of the bone
// itself (w.r.t. its parent) that we want; for lower arm (wrist)
// twist it's the twist of the bone's first child.
tbone=bone;if(bone.doesWristTwist()){tbone=bone.getChild(0);}iirxRQ.setVec(tbone.getInvInitRotX());twistRQ.setVec(tbone.getLocalRot());twistRQ.setExtractRotX();twistRQ.setPostMultiply(iirxRQ);if(bone.doesShoulderTwist()){// For a shoulder twist we effectively invert the hierarchy at
// that joint, so the rotation of the "child" (under this inversion)
// is the inverse of the rotation of the actual child.
twistRQ.setInvertX();}// For a rotation on the x-axis, the y- and z- components are
// both zero and need not be transmitted.
this.twistData[b4+0]=twistRQ.xyzw[0];this.twistData[b4+1]=twistRQ.xyzw[3];}}//     if @ntdchk < 10
//       lggr.trace? "____  skel twist data #{@ntdchk}"
//       for bone,b in @bones
//         bStr = do bone.idStr
//         [tda, tdb, tdc, tdd] = (@twistData[b*4+i] for i in [0...4])
//         if @ntdchk is 0 or tdc is 39
//           tdas = RQ.fStr tda, 3;  tdbs = RQ.fStr tdb, 3
//           tdcs = ""+Math.floor tdc;    tdds = ""+Math.floor tdd
//           lggr.trace? "#{bStr}: #{tdas} #{tdbs} #{tdcs} #{tdds}"
return++this.ntdchk;}generateBindPoseData(){var NB,bone,k,len,ref,vecSize;//-------------------
// Generate bind pose data from our bones' current (presumably
// initial) translation and rotation data.
this.root.computeGlobalTransforms();ref=this.bones;for(k=0,len=ref.length;k<len;k++){bone=ref[k];bone.generateBindPoseData();}if(this.USE_TRX_BONE_DATA){// The shader needs transform data (translation + rotation)
// for the inverse bind pose and for the current pose.  To overcome
// limitations in older GLES implementations, we pack these four
// items into a single 4x4 matrix.
NB=this.bones.length;[vecSize,this.skelTexWidth,this.skelTexHeight]=this.calcTexSize(16,NB);// For bone texture skinning
this.skelXformsData=new Float32Array(vecSize);if(this.TEST_CPU_TRX_TO_MAT){//---- Testing: do (rotation) matrix version as well.
this.skinMatRows=new Float32Array(this.bones.length*3*4);this.boneSkinMatRows=new Float32Array(3*4);// Our spoof of the vertex shader skin mat.
this.vsSkinMatRows=new Array(this.bones.length*3*4);}this.setInvBindPoseTRXData();this.updateCurGlobalPoseTRXData();this.updateTwistData();}else{this.skinMatRows=new Float32Array(this.bones.length*3*4);this.boneSkinMatRows=new Float32Array(3*4);this.updateSkinMatRows();}return void 0;// void result
}setInvBindPoseTRXData(){var boneIBPFun;//-----------------
boneIBPFun=function(bone){return bone.getInvBindPoseTRX();};return this._setTRXDataBuffers(0,boneIBPFun);}updateCurGlobalPoseTRXData(){var boneCGPFun;//----------------------
boneCGPFun=function(bone){return bone.getGlobalTRX();};this._setTRXDataBuffers(2*4,boneCGPFun);if(this.TEST_CPU_TRX_TO_MAT){//----  Testing: do the skin mat as well.
this.updateSkinMatRows();return this.updateVSSkinMatRows();}}//----
_setTRXDataBuffers(offset,btrxfun){var b,bone,br,brot,bt,btrans,btrx,i,k,l,len,ref,results;ref=this.bones;//-----------------
// Offsets within each @skelXforms 4 x 4 block:
//     Inverse Bind Pose Translation:  0
//     Inverse Bind Pose Rotation:     4
//     Current Pose Translation:       8
//     Current Pose Rotation:         12
// so the offset parameter should be either 0 for the Inverse
// Bind Pose, or 8 for the Current Pose.
results=[];for(b=k=0,len=ref.length;k<len;b=++k){bone=ref[b];bt=b*4*4+offset;br=bt+4;btrx=btrxfun(bone);btrans=btrx.trans().xyz;brot=btrx.rot().xyzw;for(i=l=0;l<3;i=++l){this.skelXformsData[bt+i]=btrans[i];}results.push(function(){var m,results1;results1=[];for(i=m=0;m<4;i=++m){results1.push(this.skelXformsData[br+i]=brot[i]);}return results1;}.call(this));}return results;}updateSkinMatRows(){var b,b12,bSMR,bone,i,k,l,len,len1,ref,ref1,s,sMR;//----------------
// Collect all bones' skinning matrix data, in row-major order,
// for use by the GL shader.
sMR=this.skinMatRows;bSMR=this.boneSkinMatRows;b12=0;ref=this.bones;for(b=k=0,len=ref.length;k<len;b=++k){bone=ref[b];ref1=bone.generateSkinMatRows(bSMR);for(i=l=0,len1=ref1.length;l<len1;i=++l){s=ref1[i];sMR[b12+i]=s;}b12+=3*4;}return void 0;// void result
}// Returns the entire bones array.
getBones(){return this.bones;}//-------
// Returns the number of bones in this skeleton.
getBonesCount(){if(this.bones){return this.bones.length;}else{return 0;}}//------------
// Returns the bone with the given 4CC name.
getBoneBy4CC(fourcc){return this.bones[this.boneIndicesBy4CC[fourcc]];}//-----------
// Returns the bone with the given index.
getBone(b){return this.bones[b];}//------
// Returns the bone index for the given 4CC name
getBoneIndex(fourcc){return this.boneIndicesBy4CC[fourcc];}//-----------
// Updates the skeleton's bones with the given local
// translation/rotation data -- the translation data being ignored
// for all bones except the root bone.
setBones(trsets){var bone,k,len,trset;//-------
for(k=0,len=trsets.length;k<len;k++){trset=trsets[k];bone=this.getBoneBy4CC(trset.getFourCC());if(bone){if(bone.isRoot()){bone.updateLocalTransAndRot(trset);}else{bone.updateLocalRot(trset);}}}this.root.computeGlobalTransforms();if(this.USE_TRX_BONE_DATA){this.updateCurGlobalPoseTRXData();return this.updateTwistData();}else{return this.updateSkinMatRows();}}// Returns the current skinning matrix rows array, containing
// 3 * 4 matrix components per bone.
getSkinMatRows(){return this.skinMatRows;}//-------------
getSkelXformsData(){return this.skelXformsData;}//-----------------
getSkelTexWidth(){return this.skelTexWidth;}//--------------
getSkelTexHeight(){return this.skelTexHeight;}//---------------
getBoneTwistData(){return this.twistData;}//---------------
getTwistTexWidth(){return this.twistTexWidth;}//---------------
getTwistTexHeight(){return this.twistTexHeight;}//----------------
//   Returns the result of our spoof of the vertex shader's skinning
//   matrix generation (which does not happen unless @USE_TRX_BONE_DATA
//   and TEST_CPU_TRX_TO_MAT are both true).
getVSSkinMatRows(){return this.vsSkinMatRows;}//---------------
updateVSSkinMatRows(){var b,b12,bone,i,i4,j,k,l,len,m,ref,vsbsmr;//------------------
vsbsmr=[[0,0,0,0],[0,0,0,0],[0,0,0,0]];ref=this.bones;for(b=k=0,len=ref.length;k<len;b=++k){bone=ref[b];b12=b*3*4;this._vsSetSkinMatRowsForBone(vsbsmr,b);for(i=l=0;l<3;i=++l){i4=i*4;for(j=m=0;m<4;j=++m){this.vsSkinMatRows[b12+i4+j]=vsbsmr[i][j];}}}return this.checkSkinningTRXs();}checkSkinningTRXs(){var b,b12,bok,i,k,l,m,n,nmatch,ref,rowstr,smrb,vssmrb;//----------------
if(this.nchk===0){rowstr=(mat,b,i)=>{var base,j,row;base=(b*3+i)*4;row=function(){var k,results;results=[];for(j=k=0;k<4;j=++k){results.push(mat[base+j]);}return results;}();return RQ.qStr(row,3);};nmatch=0;for(b=k=0,ref=this.bones.length;0<=ref?k<ref:k>ref;b=0<=ref?++k:--k){if(typeof lggr.trace==="function"){lggr.trace(`--------  bone ${b} SMR  --------`);}for(i=l=0;l<3;i=++l){if(typeof lggr.trace==="function"){lggr.trace(`${rowstr(this.skinMatRows,b,i)}`);}}if(typeof lggr.trace==="function"){lggr.trace(`--------  bone ${b} VS-SMR  --------`);}for(i=m=0;m<3;i=++m){if(typeof lggr.trace==="function"){lggr.trace(`${rowstr(this.vsSkinMatRows,b,i)}`);}}if(typeof lggr.trace==="function"){lggr.trace("----------------");}b12=b*3*4;smrb=function(){var n,results;results=[];for(i=n=0;n<12;i=++n){results.push(this.skinMatRows[b12+i]);}return results;}.call(this);vssmrb=function(){var n,results;results=[];for(i=n=0;n<12;i=++n){results.push(this.vsSkinMatRows[b12+i]);}return results;}.call(this);bok=true;for(i=n=0;n<=12;i=++n){if(1e-4<=Math.abs(smrb[i]-vssmrb[i])){bok=false;}}if(!bok){if(typeof lggr.debug==="function"){lggr.debug(`skin mats match FAILS for bone ${b}`);}}if(bok){++nmatch;}}if(typeof lggr.debug==="function"){lggr.debug(`matching skin mat count: ${nmatch} / ${this.bones.length}`);}return++this.nchk;}}//--------  Our spoof of the vertex shader skin mat generation  --------
_setQProd(qr,qa,qb){var i,k,rc,rd,re,va,vb,wa,wb;va=[qa[0],qa[1],qa[2]];vb=[qb[0],qb[1],qb[2]];wa=qa[3];wb=qb[3];qr[3]=wa*wb-(va[0]*vb[0]+va[1]*vb[1]+va[2]*vb[2]);rc=[wa*vb[0],wa*vb[1],wa*vb[2]];rd=[wb*va[0],wb*va[1],wb*va[2]];re=[va[1]*vb[2]-va[2]*vb[1],va[2]*vb[0]-va[0]*vb[2],va[0]*vb[1]-va[1]*vb[0]];for(i=k=0;k<3;i=++k){qr[i]=rc[i]+rd[i]+re[i];}return void 0;}_setRotate(tr,t,q){var i,k,qc,qq,qr,qt;qc=[-q[0],-q[1],-q[2],q[3]];qt=[t[0],t[1],t[2],0];qq=[0,0,0,0];qr=[0,0,0,0];this._setQProd(qq,qt,qc);this._setQProd(qr,q,qq);for(i=k=0;k<3;i=++k){tr[i]=qr[i];}return void 0;}_setTRXProd(tr,rr,ta,ra,tb,rb){var i,k,tba;tba=[0,0,0];this._setRotate(tba,tb,ra);for(i=k=0;k<3;i=++k){tr[i]=ta[i]+tba[i];}this._setQProd(rr,ra,rb);return void 0;}_setTRMatRows(smr,t,r){var ref,ref1,ref2,w,wx2,wy2,wz2,x,x2,xx2,xy2,xz2,y,y2,yy2,yz2,z,z2,zz2;x=r[0];y=r[1];z=r[2];w=r[3];x2=x+x;y2=y+y;z2=z+z;wx2=w*x2;wy2=w*y2;wz2=w*z2;xx2=x*x2;xy2=x*y2;xz2=x*z2;yy2=y*y2;yz2=y*z2;zz2=z*z2;splice.apply(smr[0],[0,4].concat(ref=[1.0-yy2-zz2,xy2-wz2,xz2+wy2,t[0]])),ref;splice.apply(smr[1],[0,4].concat(ref1=[xy2+wz2,1.0-xx2-zz2,yz2-wx2,t[1]])),ref1;return splice.apply(smr[2],[0,4].concat(ref2=[xz2-wy2,yz2+wx2,1.0-xx2-yy2,t[2]])),ref2;}//   Spoof of vertex shader's setSkinMatRowsForBone() function.
_vsSetSkinMatRowsForBone(bsmr,b){var i,icgr,icgt,iibr,iibt,rCGb,rIBb,rSkinb,tCGb,tIBb,tSkinb;iibt=b*4*4;iibr=iibt+4;//  Inverse Bind Pose
icgt=iibr+4;icgr=icgt+4;//  Current (global) Pose
tSkinb=[0,0,0];rSkinb=[0,0,0,0];tCGb=function(){var k,results;results=[];for(i=k=0;k<3;i=++k){results.push(this.skelXforms[icgt+i]);}return results;}.call(this);rCGb=function(){var k,results;results=[];for(i=k=0;k<4;i=++k){results.push(this.skelXforms[icgr+i]);}return results;}.call(this);tIBb=function(){var k,results;results=[];for(i=k=0;k<3;i=++k){results.push(this.skelXforms[iibt+i]);}return results;}.call(this);rIBb=function(){var k,results;results=[];for(i=k=0;k<4;i=++k){results.push(this.skelXforms[iibr+i]);}return results;}.call(this);this._setTRXProd(tSkinb,rSkinb,tCGb,rCGb,tIBb,rIBb);return this._setTRMatRows(bsmr,tSkinb,rSkinb);}};// "Static" members.
Skeleton.SHOULDER_TWIST_FLAG_VALUE=2;Skeleton.WRIST_TWIST_FLAG_VALUE=3;//@PARENT_WRIST_TWIST_FLAG_VALUE = 5
Skeleton.ROOT4cc=FourCC.fourCCInt("ROOT");void 0;// void result
return Skeleton;}.call(this);// Export
cwaenv.add(Skeleton,"Skeleton");// (End Skeleton.coffee)
}).call(this);// -------- MorphVertex.js --------
// Generated by CoffeeScript 2.6.1
(function(){var Logger,MorphVertex,V3,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("Morphs");V3=cwaenv.get("E3Vec");//----------------
MorphVertex=class MorphVertex{//----------------
constructor(){this.ixVertex=-1;this.offset=this.normal=null;}//----------
// "Static" members.
//   Creates a new JSA Morph Set from the given JSON morph set.
static fromJSON(jsnmphvtx){var mphvtx;//--------
mphvtx=new MorphVertex();mphvtx.setFromJSON(jsnmphvtx);return mphvtx;}static fromBin(avdv){var mphvtx;//--------
mphvtx=new MorphVertex();mphvtx.setFromBin(avdv);return mphvtx;}// "Instance" members.
setFromJSON(jsnmphvtx){//----------
//	{ "vertex" : 3242, "weight" : 0.92,
//   "offset" : [ 0.0, -0.124, 0.0 ],
//   "normal" : [ 0.344, 0.042, 0.93i ] }
this.ixVertex=jsnmphvtx.vertex;this.offset=V3.copyOfV3(jsnmphvtx.offset);return this.normal=V3.copyOfV3(jsnmphvtx.normal);}setFromBin(avdv){var weight;//----------
this.ixVertex=avdv.nextUint();weight=avdv.nextFloat();this.offset=avdv.nextVec3();return this.normal=avdv.nextVec3();}//   Returns this morph-set''s vertex index.
getVertexId(){return this.ixVertex;}//----------
//   Returns this morph-set''s offset (distortion) vector.
getOffset(){return this.offset;}//--------
//   Returns this morph-set''s normal vector.
getNormal(){return this.normal;}};//--------
// Export
cwaenv.add(MorphVertex,"MorphVertex");// (End MorphVertex.coffee)
}).call(this);// -------- MorphTarget.js --------
// Generated by CoffeeScript 2.6.1
(function(){var FourCC,Logger,MorphTarget,MorphVertex,RQ,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("Morphs");FourCC=cwaenv.get("FourCC");RQ=cwaenv.get("RotQuat");MorphVertex=cwaenv.get("MorphVertex");//----------------
MorphTarget=class MorphTarget{//----------------
constructor(){//----------
this.fourCCName=0;this.vertices=null;this.stdVerticesDesc=[-1,0,[],[]];this.dupVerticesDesc=[-1,0,[],[]];}// "Static" members.
//   Creates a new JSA Morph Target from the given JSON morph target.
static fromJSON(jsnmphtgt){var mphtgt;//--------
mphtgt=new MorphTarget();mphtgt.setFromJSON(jsnmphtgt);return mphtgt;}static fromBin(avdv){var mphtgt;//--------
mphtgt=new MorphTarget();mphtgt.setFromBin(avdv);return mphtgt;}//   Constructs this MorphTarget from the given stream.
//   The boolean parameter indicates whether or not each morph target
//   has its own normal.
setFromJSON(jsnmphtgt){//----------
this.fourCCName=FourCC.fourCCInt(jsnmphtgt.morphTargetName);return this.vertices=jsnmphtgt.morphSets.map(MorphVertex.fromJSON);}setFromBin(avdv){var nMorphSets,s;//----------
this.fourCCName=avdv.nextStr4cc();nMorphSets=avdv.nextUint();return this.vertices=function(){var j,ref,results;results=[];for(s=j=0,ref=nMorphSets;0<=ref?j<ref:j>ref;s=0<=ref?++j:--j){results.push(MorphVertex.fromBin(avdv));}return results;}();}//   Returns the Four-CC name of this xmorph-target. */
getFourCCName(){return this.fourCCName;}//------------
//   Returns the number of MorphVertexes for this morph-target. */
getVertexCount(){return this.vertices.length;}//-------------
//   Returns the MorphVertex array for this morph-target. */
getVertices(){return this.vertices;}//-----------
//   Returns the MorphVertex with the given index. */
getVertex(i){return this.vertices[i];}//--------
getVertexSegments(){return[this.stdVerticesDesc,this.dupVerticesDesc];}//----------------
vertexRangeLimits(NV,NVNoDups,dupLists){var dhi,dlo,dv,hi,j,l,len,len1,lo,ref,ref1,v,vtx;//----------------
lo=NVNoDups;hi=0;dlo=NV;dhi=NVNoDups;ref=this.vertices;for(j=0,len=ref.length;j<len;j++){vtx=ref[j];v=vtx.getVertexId();if(v<lo){lo=v;}if(hi<=v){hi=v+1;}ref1=dupLists[v];for(l=0,len1=ref1.length;l<len1;l++){dv=ref1[l];if(dv<dlo){dlo=dv;}if(dhi<=dv){dhi=dv+1;}}}if(hi<=lo){lo=hi=-1;}if(dhi<=dlo){dlo=dhi=-1;}return[lo,hi,dlo,dhi];}makeVertexArraySegments(NV,NVNoDups,dupLists,headRotQV){var NM,NM3,NMD,NMD3,NV3,NVND,delta,dhi,dlo,dmnorm,dmpos,dmv,dmv3,hi,j,k,l,len,len1,lo,m,mnorm,mpos,mtItem,mv,mv3,n,ref,ref1,ref2,ref3;//----------------------
NV3=NV*3;NVND=NVNoDups;[lo,hi,dlo,dhi]=this.vertexRangeLimits(NV,NVND,dupLists);NM=hi-lo;NMD=dhi-dlo;NM3=3*NM;NMD3=3*NMD;mpos=new Float32Array(NM3);mnorm=new Float32Array(NM3);for(k=j=0,ref=NM3;0<=ref?j<ref:j>ref;k=0<=ref?++j:--j){mpos[k]=0,mnorm[k]=0;}dmpos=new Float32Array(NMD3);dmnorm=new Float32Array(NMD3);for(k=l=0,ref1=NM3;0<=ref1?l<ref1:l>ref1;k=0<=ref1?++l:--l){dmpos[k]=0,dmnorm[k]=0;}delta=[0,0,0];ref2=this.vertices;for(m=0,len=ref2.length;m<len;m++){mtItem=ref2[m];// Get the vertex index.
mv=mtItem.getVertexId();mv3=3*(mv-lo);// Update vertex offset, via rotated morph target data in delta.
RQ.rotateV3(delta,mtItem.getOffset(),headRotQV);mpos[mv3]=delta[0];mpos[mv3+1]=delta[1];mpos[mv3+2]=delta[2];// Update vertex normal, via rotated morph target data in delta.
RQ.rotateV3(delta,mtItem.getNormal(),headRotQV);mnorm[mv3]=delta[0];mnorm[mv3+1]=delta[1];mnorm[mv3+2]=delta[2];// Do the same updates for any duplicates of vertex mv.
if(dupLists[mv].length!==0){ref3=dupLists[mv];for(n=0,len1=ref3.length;n<len1;n++){dmv=ref3[n];dmv3=3*(dmv-dlo);dmpos[dmv3]=mpos[mv3];dmpos[dmv3+1]=mpos[mv3+1];dmpos[dmv3+2]=mpos[mv3+2];dmnorm[dmv3]=mnorm[mv3];dmnorm[dmv3+1]=mnorm[mv3+1];dmnorm[dmv3+2]=mnorm[mv3+2];}}}//     @stdVerticesDesc = [lo, NM, mpos, mnorm]
//     @dupVerticesDesc = [dlo, NMD, dmpos, dmnorm]
this.stdVerticesDesc={range:{base:lo,size:NM},buffers:{pos:mpos,norm:mnorm}};this.dupVerticesDesc={range:{base:dlo,size:NMD},buffers:{pos:dmpos,norm:dmnorm}};return void 0;// void result
}};// Export
cwaenv.add(MorphTarget,"MorphTarget");// (End MorphTarget.coffee)
}).call(this);// -------- MorphsManager.js --------
// Generated by CoffeeScript 2.6.1
(function(){var Logger,MorphTarget,MorphsManager,RQ,VBO,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;// No Logger uses. Need to reintroduce tracing calls in place of log calls
Logger=cwaenv.get("Logger");lggr=Logger.get("Morphs");VBO=cwaenv.get("VBO");RQ=cwaenv.get("RotQuat");MorphTarget=cwaenv.get("MorphTarget");//------------------
MorphsManager=class MorphsManager{//------------------
constructor(mtags){//----------
// Context
// -------
// A morphs manager holds the definitions for the set of morph
// targets associated with a given character's surface mesh.
// Each morph target effectively defines a deformation for each
// vertex in some subset of the mesh's vertices, that vertex
// deformation being represented by a 3D offset (w.r.t. the vertex's
// standard postion) and the 3D vertex normal caused by the
// deformation.
// The morphs manager also manages a fixed set of OpenGL (GPU)
// VBO slots used to apply morph targets during animation (i.e.
// rendering) of the associated character mesh.  Typically this set
// will contain exactly or around 4 slots.  Each VBO slot consists
// of a pair of vertex buffers, one to hold the offset data and one
// to hold the normal data, either (a) for a given morph target, or
// possibly (b) the weighted sum of such data for several morph
// targets.  Case (a) occurs when the number of morph targets
// required to render a given frame does not exceed the number of
// VBO slots; case (b) arises when the former number does exceed the
// latter, meaning that the data from two or more morph targets must
// be combined (by methods in this class) into a single VBO slot
// prior to upload to the VBO slot's GPU buffers.
// The tags corresponding to the morph target VBO slots -- e.g.
// ['A', 'B', 'C', 'D'] assuming the vertex shader has 4 morph target
// slots.
this.MORPH_TAGS=mtags;// Array of MorphTarget objects for the mesh associated with this
// morph manager.
this.morphTargets=[];// Array mapping the morph targets' 4cc codes to their indices, i.e.
// indices in the @morphTargets array.
this.mtIndicesBy4CC=null;//---
// The number of vertices for the associated Mesh.
this.nVertices=-1;// The number of mesh vertices excluding duplicates,
// so @nVerticesNoDups <= @nVertices
this.nVerticesNoDups=-1;// Arrays of morph offset (position) and normal buffer references,
// indexed by morph-target: each array has one entry per morph target
// and each entry is a link to a buffer containing 3 * @nVertices
// float values.
this.morphOffsetBufs=[];this.morphNormBufs=[];// Position (offset) and normal VBO arrays for this morph manager.
// Each array has one entry per VBO slot.
// Usually the actual VBO holds the contents of the pair of
// @morphOffsetBufs and @morphNormBufs entries for the particular
// morph target assigned to that VBO slot.  But when the VBO slot
// is assigned "multiple morphs" (as described above) the pair of
// VBOs for that slot will hold the appropriately weighted sums of
// the contents of several pairs of @morphOffsetBufs and
// @morphNormBufs entries from @morphOffsetBufs.
this.posVBOs=null;this.normVBOs=null;// A morph target buffer (of length 3 * @nVertices) containing all
// zeros -- used to clear both position (offset) and normal VBOs.
this.zeroMorphBuf=null;// The pair of morph target buffers (in CPU memory) used to build
// weighted sums of individual per-vertex morph target data (from
// @morphOffsetBufs and @morphNormBufs) for uploading to the
// "multiple morphs" pair of VBOs.
this.multiMorphOffsetBuf=null;this.multiMorphNormBuf=null;// Records the current usage status for the morph target VBOs:
// there is one entry for each VBO slot, each holding a pair of
// vertex segment definitions (i.e. vertex index ranges) -- one for
// the "main" vertices of the current mesh (i.e. those with indices
// below @nVerticesNoDups) and one for the mesh's duplicate vertices
// -- i.e. those with indices in the range
// [@nVerticesNoDups .. @nVertices).
this.vbosUsage=null;// Array, with one entry per morph target VBO slot), recording the
// current assignment of morph targets to the VBO slots.  Each entry
// either is the relevant morph target index or is negative,
// indicating either that the slot is currently unused or that it
// is currently assigned multiple morph targets.
this.morphAlloc=null;// Array of flags, one per VBO slot, indicating whether or not the
// current morph target assignment to that slot is newly made, i.e.
// whether it was made for the current rendering operation
// (automatically false if there is no current assignment for the
// given slot, or if multiple morphs are assigned to it).
this.morphAllocIsNew=null;// The index of the current multiple morphs VBO slot if there is one,
// or a negative value otherwise.
this.iMulti=-1;// Array containing the indices of the morph targets included in the
// current multiple morphs set.
this.multiMorphs=[];// Array defining the weight (i.e. CASMorph amount) to be applied
// for each currently active morph target VBO slot, i.e. for each
// non-negative entry in @morphAlloc; always set to 1.0 for the
// current multiple morphs slot if there is one (i.e. when @iMulti
// is non-negative).
this.morphWeights=null;// A copy of @morphAlloc as was during the previous rendering
// operation -- supports the updating of @morphAllocIsNew.
this.prevMorphAlloc=null;// The pair of effective vertex ranges for the current set of multiple
// morph targets -- the smallest superset range of the individual
// morph target ranges in both cases.
this.mmRanges=null;// Array containing one entry for each morph target in the current
// multiple morph targets set, each entry itself contains a pair of
// items, for main and duplicate vertex ranges, holding the morph
// target weight and vertex data in each case -- unless there is
// no vertex data for the given range in which case the entire
// entry is null.
this.mmWeightedSegsList=null;}// "Static" members.
//   Creates a new JSA Morph Handler from the given JSON morph target
//   list.
static fromJSON(jsnmtl,mtags){var mm;//--------
mm=new MorphsManager(mtags);mm.setFromJSON(jsnmtl);return mm;}static fromBin(avdv,mtags){var mm;//-------
mm=new MorphsManager(mtags);mm.setFromBin(avdv);return mm;}// "Instance" members.
_lohi(lo,hi){return[lo,hi];}//---
_lohistr(lohi){var hi,lo;[lo,hi]=lohi;return`[${lo}..${hi})`;}//-------
_lohi2str(lo,hi){return this._lohistr(this._lohi(lo,hi));}//--------
_limits(rng){var lo,sz;lo=rng.base;sz=rng.size;return this._lohi(lo,lo+sz);}//------
_rngstr(rng){return this._lohistr(this._limits(rng));}//-------
_jstr(j){if(j===0){return"main";}else{return" dup";}}//----
//   Constructs this MorphHandler from the given JSON morph target list.
setFromJSON(jsnmtl){var NMT,json2mt,t;//----------
json2mt=MorphTarget.fromJSON;NMT=jsnmtl.length;this.morphTargets=function(){var k,ref,results;results=[];for(t=k=0,ref=NMT;0<=ref?k<ref:k>ref;t=0<=ref?++k:--k){results.push(json2mt(jsnmtl[t]));}return results;}();return this.set4CCIndex();}setFromBin(avdv){var NMT,t;//---------
NMT=avdv.nextUint();this.morphTargets=function(){var k,ref,results;results=[];for(t=k=0,ref=NMT;0<=ref?k<ref:k>ref;t=0<=ref?++k:--k){results.push(MorphTarget.fromBin(avdv));}return results;}();return this.set4CCIndex();}set4CCIndex(){var k,len,m,mBy4cc,mtgt,ref;//----------
mBy4cc=[];ref=this.morphTargets;for(m=k=0,len=ref.length;k<len;m=++k){mtgt=ref[m];mBy4cc[mtgt.getFourCCName()]=m;}return this.mtIndicesBy4CC=mBy4cc;}enableMorphVBOs(){var i,k,len,ref,w;ref=this.morphWeights;//--------------
for(i=k=0,len=ref.length;k<len;i=++k){w=ref[i];if(!(w!==0)){continue;}this.posVBOs[i].enableAttrib();this.normVBOs[i].enableAttrib();}return void 0;// (void result)
}disableMorphVBOs(){var i,k,len,ref,w;ref=this.morphWeights;//---------------
for(i=k=0,len=ref.length;k<len;i=++k){w=ref[i];if(!(w!==0)){continue;}this.posVBOs[i].disableAttrib();this.normVBOs[i].disableAttrib();}return void 0;// (void result)
}getMorphWeights(){return this.morphWeights;}//--------------
createCPUVertexBuffers(nv){var nV3;//---------------------
this.nVertices=nv;nV3=nv*3;this.zeroMorphBuf=new Float32Array(nV3);this.multiMorphOffsetBuf=new Float32Array(nV3);return this.multiMorphNormBuf=new Float32Array(nV3);}createGLVBOs(gl,getAttrLoc){var abcd,k,len,ref,setVBO;//-----------
// Auxiliary definitions.
this.gl=gl;this.posVBOs=[];this.normVBOs=[];setVBO=(vbos,id,buf)=>{return vbos.push(VBO.makeDyn(gl,3,buf,getAttrLoc(id)));};ref=this.MORPH_TAGS;for(k=0,len=ref.length;k<len;k++){abcd=ref[k];setVBO(this.posVBOs,`MorphPos${abcd}`,this.zeroMorphBuf);setVBO(this.normVBOs,`MorphNorm${abcd}`,this.zeroMorphBuf);}return void 0;// dummy result, simplifies JS output
}makeVertexArrays(vDupIndices,globalHeadRot){var NMT,NV,NV3,NVND,d,dupLists,i,k,l,len,len1,m,mtgt,n,ref,ref1,t,v;//---------------
NV=this.nVertices;NV3=3*NV;this.nVerticesNoDups=NVND=NV-vDupIndices.length;NMT=this.morphTargets.length;dupLists=function(){var k,ref,results;results=[];for(i=k=0,ref=NVND;0<=ref?k<ref:k>ref;i=0<=ref?++k:--k){results.push([]);}return results;}();for(d=k=0,len=vDupIndices.length;k<len;d=++k){v=vDupIndices[d];dupLists[v].push(NVND+d);}ref=this.morphTargets;for(m=l=0,len1=ref.length;l<len1;m=++l){mtgt=ref[m];mtgt.makeVertexArraySegments(NV,NVND,dupLists,globalHeadRot.xyzw);}this.morphAlloc=[];this.morphWeights=[];this.vbosUsage=[];for(t=n=0,ref1=this.MORPH_TAGS.length;0<=ref1?n<ref1:n>ref1;t=0<=ref1?++n:--n){this.morphAlloc.push(-1);this.morphWeights.push(0);this.vbosUsage.push([{base:-1,size:0},{base:-1,size:0}]);}// LOGGING
//     log "--------  Morph Target ranges  --------"
//     for mtgt,m in @morphTargets
//       [mrng, drng] = (vs.range for vs in do mtgt.getVertexSegments)
//       dstr = (if drng.size is 0 then "none" else @_rngstr drng)
//       log "#{m}:  #{@_rngstr mrng}  #{dstr}"
//     log "----------------------------------------"
// TEST
//    do @testDirtyRangesForVBOClean
return void 0;}setGLDataForDraw(currentMorphs){var activeMorphs,k,len,m,morph,t;//---------------
this.prevMorphAlloc=this.morphAlloc;this.morphWeights=function(){var k,ref,results;results=[];for(t=k=0,ref=this.MORPH_TAGS.length;0<=ref?k<ref:k>ref;t=0<=ref?++k:--k){results.push(0);}return results;}.call(this);// Active morphs in the new cycle: record index and weight for each.
activeMorphs=[];for(k=0,len=currentMorphs.length;k<len;k++){morph=currentMorphs[k];if(!(morph.getAmount()!==0)){continue;}m=this.mtIndicesBy4CC[morph.getName()];activeMorphs.push([m,morph.getAmount()]);}if(activeMorphs.length!==0){this.allocGLMorphSlots(activeMorphs);this.morphDataToGPU();}//       if 4 < activeMorphs.length
//         ma = @morphAlloc;  mw = @morphWeights
//         log "____  uGLM #{@nUGLM}"+
//           "  alloc: #{ma[0]} #{ma[1]} #{ma[2]} #{ma[3]}"+
//           "  wghts:  #{mw[0]} #{mw[1]} #{mw[2]} #{mw[3]}"
//         if 0 <= @iMulti
//           mstr = (mlt[0] for mlt in @multiMorphs).join " "
//           log "              ... multiMorphs @ #{iMulti}: #{mstr}"
return void 0;}allocGLMorphSlots(activeMorphs){var NMT,a,aMph,aa,assignSlot,getFreeSlot,i,iMulti,k,l,len,multi,nUnalloc,nUsed,pm,ref,ref1,t,uLimit;//----------------
// activeMorphs Format:
//    [ [morphIndex, morphAmount], ... ]
// @morphAlloc, @prevMorphAlloc
// Each of these has one entry per GPU morph slot, each entry being
// the index of the morph allocated to the given slot, or negative
// (-1) for an inactive/as-yet-unallocated slot.
// For each active slot, @morphWeights has the weight for the morph
// allocated to that slot, i.e. for the matching @morphAlloc entry.
NMT=this.MORPH_TAGS.length;this.morphAlloc=[];this.morphAllocIsNew=[];for(t=k=0,ref=NMT;0<=ref?k<ref:k>ref;t=0<=ref?++k:--k){this.morphAlloc.push(-1),this.morphAllocIsNew.push(false);}nUsed=0;nUnalloc=activeMorphs.length;// Number of slots we can use for single morphs.
uLimit=activeMorphs.length<=NMT?NMT:NMT-1;// Function to allocate a given active morph to a given slot.
assignSlot=(i,aMph)=>{this.morphAlloc[i]=aMph[0];this.morphWeights[i]=aMph[1];++nUsed;--nUnalloc;return aMph[0]=-1;// (mark aMph as allocated)
};ref1=this.prevMorphAlloc;// Deal with morphs from the previous cycle that are still active
// in this one.
for(i=l=0,len=ref1.length;l<len;i=++l){pm=ref1[i];if(!(0<=pm&&nUsed!==uLimit)){continue;}a=0;aa=activeMorphs.length;// Bounded linear search for pm in activeMorphs: if pm is found
// then re-use its slot -- i.e. the slot with index i.
while(a!==aa){if(activeMorphs[a][0]===pm){aa=a;}else{++a;}}if(a!==activeMorphs.length){assignSlot(i,activeMorphs[a]);}}// Function to find the next free slot (which must exist).
getFreeSlot=()=>{i=0;(function(){var results;results=[];while(0<=this.morphAlloc[i]){results.push(++i);}return results;}).call(this);return i;};// Deal with remaining unallocated active morphs, if any.
multi=[];iMulti=-1;a=0;while(nUnalloc!==0){// Test that we've not reached an overloaded final slot.
if(nUsed!==uLimit){// Find the next unallocated morph for this cycle.
while(activeMorphs[a][0]<0){++a;}// Allocate a free slot to the unallocated morph, and
// flag the fact that the slot's data must be updated.
i=getFreeSlot();this.morphAllocIsNew[i]=true;assignSlot(i,activeMorphs[a]);++a;}else{// We're at the final slot and it's overloaded: collect the
// activeMorphs entries for this slot in multi, determine
// the slot index, and fix the slot weight at 1, since we shall
// apply the individual weights before uploading to the GPU.
multi=function(){var len1,n,results;results=[];for(n=0,len1=activeMorphs.length;n<len1;n++){aMph=activeMorphs[n];if(0<=aMph[0]){results.push(aMph);}}return results;}();iMulti=getFreeSlot();this.morphWeights[iMulti]=1;++nUsed;nUnalloc-=multi.length;// (should force termination)
}}// Caller expects us to have set @morphAlloc, @morphWeights,
// @morphAllocIsNew, @iMulti, @multiMorphs .
this.iMulti=iMulti;this.multiMorphs=multi;return void 0;// void result
}dirtyRangesForVBOClean(usedrange,newrange){var hi,k,len,limslist,lo,results,uhi,ulo;//---------------------
// ASSERT: usedrange.size isnt 0 AND newrange.size isnt 0
ulo=usedrange.base;uhi=ulo+usedrange.size;lo=newrange.base;hi=lo+newrange.size;// We want the set difference, [ulo..uhi) \ [lo..hi),
// expressed as a list of non-empty ranges.
if(ulo<lo&&hi<uhi){// ranges.length = 2
limslist=[[ulo,lo],[hi,uhi]];}else if(lo<=ulo&&uhi<=hi){// ranges.length = 0
limslist=[];}else{// ranges.length = 1
// (ulo < lo AND uhi <= hi) NEQ (lo <= ulo AND hi < uhi)
if(uhi<=hi){limslist=[[ulo,lo<uhi?lo:uhi]];}// We could replace the next "if ... then" with "else"
// but for symmetry's sake we leave it.
if(lo<=ulo){limslist=[[ulo<hi?hi:ulo,uhi]];}}results=[];for(k=0,len=limslist.length;k<len;k++){[lo,hi]=limslist[k];results.push({// Result is a list of range objects.
base:lo,size:hi-lo});}return results;}cleanMorphVBOs(i,m,newsegs){var cleanBuf,dhi,dlo,dr,drngs,j,k,l,len,len1,newrng,ref,usedrng,vbou_i;//-------------
vbou_i=this.vbosUsage[i];ref=[0,1];//     for j in [0,1]
//       log "____  cleanMphVBOS #{i},#{m} (#{@_jstr j}):"+
//         "  old #{@_rngstr vbou_i[j]}  new #{@_rngstr newsegs[j].range}"
for(k=0,len=ref.length;k<len;k++){j=ref[k];//       sjstr = "slot #{i} #{@_jstr j}"
usedrng=vbou_i[j];newrng=newsegs[j].range;if(usedrng.size===0||newrng.size===0){}else{//         log "____  #{sjstr}:  (skip cleaning check)"
drngs=this.dirtyRangesForVBOClean(usedrng,newrng);for(l=0,len1=drngs.length;l<len1;l++){dr=drngs[l];dlo=dr.base;dhi=dlo+dr.size;cleanBuf=this.zeroMorphBuf.subarray(3*dlo,3*dhi);this.posVBOs[i].uploadPartialData(dlo,cleanBuf);this.normVBOs[i].uploadPartialData(dlo,cleanBuf);}}// LOGGING ...
//         pfxstr =
//           "#{sjstr}: #{@_rngstr usedrng} \\ #{@_rngstr newrng} (#{m})"
//         drstr =
//           if drngs.length is 0 then "EMPTY"
//           else if drngs[0].size isnt usedrng.size
//                 "NEW "+(@_rngstr dr for dr in drngs).join ","
//           else "SAME"
//         log "____  #{pfxstr} --> #{drstr}"
// Update @vbosUsage if there is a new segment.
if(newrng.size!==0){usedrng.base=newrng.base;usedrng.size=newrng.size;}}//       log "____  ... new @vbosUsage is:  #{@_rngstr @vbosUsage[i][j]}"
return void 0;}setMorphVBOs(i,mVtxSegs){var bufs,j,k,len,mvsegs,ref,rng;ref=[0,1];// main vertices, duplicate vertices
//-----------
for(k=0,len=ref.length;k<len;k++){j=ref[k];mvsegs=mVtxSegs[j];rng=mvsegs.range;bufs=mvsegs.buffers;if(rng.size!==0){this.posVBOs[i].uploadPartialData(rng.base,bufs.pos);this.normVBOs[i].uploadPartialData(rng.base,bufs.norm);}}return void 0;}generateMultiMorphsSegsDescs(){var NV,NVND,hi,j,k,l,len,len1,limits,lo,lohi,m,mmrng,mweight,ref,ref1,segs,segsj,shi,slo,srng,ssz,wSegs,wSegsList,wSegs_j,wSegsj;//---------------------------
// Determine (for both vertex ranges -- main and duplicate)
// the limits of the effective vertex range and the list
// of individual morph vertex segments (each with the appropriate
// weight) contributing to the composite morph definition.
NV=this.nVertices;NVND=this.nVerticesNoDups;// Initial segment limits, and initial segments.
limits=[[NVND,0],[NV,NVND]];wSegsList=[];ref=this.multiMorphs;// Iterate over the contributing morphs.
for(k=0,len=ref.length;k<len;k++){[m,mweight]=ref[k];segs=this.morphTargets[m].getVertexSegments();wSegs=[];ref1=[0,1];// main vertices, duplicate vertices
for(l=0,len1=ref1.length;l<len1;l++){j=ref1[l];segsj=segs[j];srng=segsj.range;slo=srng.base;ssz=srng.size;shi=slo+ssz;[lo,hi]=lohi=limits[j];// Segment for morph m makes no contribution if it's empty.
wSegs_j=null;if(ssz!==0){if(slo<lo){// Determine whether the overall range needs to be extended
// at either or both ends on account of segsj
//log "____  morph #{m} #{@_jstr j}: #{@_rngstr srng}"
lohi[0]=slo;}if(hi<shi){lohi[1]=shi;}// Data for segsj's contribution.
wSegsj={range:segsj.range,buffers:segsj.buffers,weight:mweight};}// Record segsj's (i.e. morph m's) contribution for vertex
// range j.
wSegs.push(wSegsj);}// Record morph m's pair of contributions.
wSegsList.push(wSegs);}mmrng=function(lohi){[lo,hi]=lohi;if(hi<=lo){lo=hi=-1;}return{base:lo,size:hi-lo};};// LOGGING
//     for j in [0,1]
//       log "____  #{@_jstr j} limits: #{@_rngstr (mmrng limits[j])}"
this.mmRanges=function(){var len2,n,results;results=[];for(n=0,len2=limits.length;n<len2;n++){lohi=limits[n];results.push(mmrng(lohi));}return results;}();this.mmWeightedSegsList=wSegsList;return void 0;}generateMultiMorphsVBOs(){var hi,hi3,j,k,k3,l,len,len1,lo,lo3,mmNBuf,mmPBuf,n,nbseg,normbuf,o,pbseg,posbuf,ranges,ref,ref1,ref2,ref3,rng,slo,slo3,ssz,ssz3,wSegs,wSegsList,wSegsj,weight;//----------------------
ranges=this.mmRanges;wSegsList=this.mmWeightedSegsList;mmPBuf=this.multiMorphOffsetBuf;mmNBuf=this.multiMorphNormBuf;ref=[0,1];// main vertices, duplicate vertices
for(k=0,len=ref.length;k<len;k++){j=ref[k];rng=ranges[j];lo=rng.base;hi=lo+rng.size;if(lo<hi){lo3=3*lo;hi3=3*hi;for(k3=l=ref1=lo3,ref2=hi3;ref1<=ref2?l<ref2:l>ref2;k3=ref1<=ref2?++l:--l){// Clear the relevant segments of our local offset/normal buffers.
mmPBuf[k3]=0,mmNBuf[k3]=0;}// Iterate over those morphs which contribute to vertex range j.
for(n=0,len1=wSegsList.length;n<len1;n++){wSegs=wSegsList[n];if(!wSegs[j]){continue;}// Extract the weight, range data and offset/normal values
// for the given morph and accumulate its weighted
// contribution in our local offset/normal buffers.
wSegsj=wSegs[j];weight=wSegsj.weight;rng=wSegsj.range;slo=rng.base;ssz=rng.size;posbuf=wSegsj.buffers.pos;normbuf=wSegsj.buffers.norm;slo3=3*slo;ssz3=3*ssz;for(k3=o=0,ref3=ssz3;0<=ref3?o<ref3:o>ref3;k3=0<=ref3?++o:--o){mmPBuf[slo3+k3]+=weight*posbuf[k3];mmNBuf[slo3+k3]+=weight*normbuf[k3];}}// Create typed arrays for the operative segments of
// our local offset/normal buffers, and upload them to the GL
// VBOs.
pbseg=mmPBuf.subarray(lo3,hi3);nbseg=mmNBuf.subarray(lo3,hi3);this.posVBOs[this.iMulti].uploadPartialData(lo,pbseg);this.normVBOs[this.iMulti].uploadPartialData(lo,nbseg);}}return void 0;}morphDataToGPU(){var GL,GL_A_BUF,i,k,len,m,mmrng,mmvsegs,mvsegs,ref;//-------------
GL=this.gl;GL_A_BUF=GL.ARRAY_BUFFER;ref=this.morphAlloc;// LOGGING
//     imnew = ([i,m] for m,i in @morphAlloc when 0<=m and @morphAllocIsNew[i])
//     nnew = imnew.length
//     if (nnew isnt 0 or 0 <= @iMulti) and (@_f isnt undefined)
//       log "____  ----------------------------------------"
//       log "____  f=#{@_f}  n_new=#{nnew} ..."
//       log "____  newAlloc [i,m] pairs:  "+("#{nn}" for nn in imnew).join "  "
// Update the GL data for those slots to which a single
// morph has been newly allocated in this cycle.
for(i=k=0,len=ref.length;k<len;i=++k){m=ref[i];if(!(0<=m&&this.morphAllocIsNew[i])){continue;}mvsegs=this.morphTargets[m].getVertexSegments();this.cleanMorphVBOs(i,m,mvsegs);this.setMorphVBOs(i,mvsegs);}// Is there also a multi-morph slot on this cycle?
if(0<=this.iMulti){// LOGGING
//       mms = ("#{m}" for [m,w] in @multiMorphs when 0 <= m).join ","
//       log "____  --------"
//       log "____  iMulti=#{@iMulti}  morphs: #{mms}"
//       cstr = ("#{@_rngstr urng}" for urng in @vbosUsage[@iMulti]).join "  "
//       log "____  CURRENTLY USED ranges:  #{cstr}"
// Generate multi-morphs segments data.
this.generateMultiMorphsSegsDescs();// Pseudo-segments pair for the multi-morph VBO slot.
mmvsegs=function(){var l,len1,ref1,results;ref1=this.mmRanges;results=[];for(l=0,len1=ref1.length;l<len1;l++){mmrng=ref1[l];results.push({range:mmrng});}return results;}.call(this);// Clean slot @iMulti's VBOs.
this.cleanMorphVBOs(this.iMulti,-1,mmvsegs);// Use the multi-morphs segments data to generate and upload
// their VBOs.
this.generateMultiMorphsVBOs();}return void 0;// void result
}};//   testDirtyRangesForVBOClean: ->
//     urec = {base:8, size: 5}
//     check = (lo, hi) =>
//       rr = @dirtyRangesForVBOClean urec, {base: lo, size: hi-lo}
//       ulo = urec.base;  uhi = ulo + urec.size
//       rrstr = ("#{@_rngstr r}" for r in rr).join ", "
//       log "old: #{@_rngstr urec}, new: #{@_lohi2str lo, hi} --> #{rrstr}  (N=#{rr.length})"
//     log "----------------------------------------"
//     check 5, 6
//     check 5, 8
//     check 5, 9
//     check 8, 9
//     check 8, 10
//     check 8, 13
//     check 7, 13
//     check 7, 14
//     check 7, 12
//     check 8, 12
//     check 9, 12
//     check 10,11
//     check 11,12
//     check 11,13
//     check 12,13
//     check 13,14
//     check 14,15
//     check 14,20
//     log "----------------------------------------"
// Export
cwaenv.add(MorphsManager,"MorphsManager");// (End MorphsManager.coffee)
}).call(this);// -------- MeshVertex.js --------
// Generated by CoffeeScript 2.6.1
(function(){var FourCC,Logger,MeshVertex,V3,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("Animate");FourCC=cwaenv.get("FourCC");V3=cwaenv.get("E3Vec");//---------------
MeshVertex=class MeshVertex{//---------------
constructor(){//----------
this.index=-1;this.countBones=0;this.bone4cc=null;this.weight=null;this.offsetVector=null;this.baseNormal=null;this.distance=null;}// "Static" members.
//   Creates a new JSA Mesh Vertex from the given JSON mesh vertex
//   and index (of the vertex within the enclosing array).
static fromJSON(jsnmvtx,ix){var mvtx;//--------
mvtx=new MeshVertex();mvtx.setFromJSON(jsnmvtx,ix);return mvtx;}static fromBin(avdv,ix){var mvtx;//-------
mvtx=new MeshVertex();mvtx.setFromBin(avdv,ix);return mvtx;}// "Instance" members.
//   Constructs this MeshVertex from the given JSON mesh vertex object
//   assigning it the given index.
setFromJSON(jsnmvtx,ix){var CVT_4CC,MAKE_V3F;//----------
CVT_4CC=FourCC.fourCCInt;MAKE_V3F=V3.fromVec.bind(V3);// Index within the enclosing mesh vertex list.
this.index=ix;// Get the actual number of influencing-bones for this mesh-point.
this.countBones=jsnmvtx.countInfluences;// Offset Vectors.
this.offsetVector=jsnmvtx.offsets.map(MAKE_V3F);// Base-Normal Vectors.
this.baseNormal=jsnmvtx.baseNormals.map(MAKE_V3F);// Influencing-Bone-IDs -- later these will be replaced by
// a matching array of references to the bones themselves.
this.bone4cc=jsnmvtx.influenceNames.map(CVT_4CC);// Influence weights.
this.weight=jsnmvtx.weights.slice();// Distances to ends of influencing bones.
return this.distance=jsnmvtx.xDistances.slice();}setFromBin(avdv,ix){var b,i,ibRange,ref,ref1;//---------
this.index=ix;this.countBones=avdv.nextUint();// No. of influencing bones.
ibRange=function(){var results=[];for(var i=0,ref=this.countBones;0<=ref?i<ref:i>ref;0<=ref?i++:i--){results.push(i);}return results;}.apply(this);this.offsetVector=function(){var i,len,results;results=[];for(i=0,len=ibRange.length;i<len;i++){b=ibRange[i];results.push(V3.fromVec(avdv.nextVec3()));}return results;}();this.baseNormal=function(){var i,len,results;results=[];for(i=0,len=ibRange.length;i<len;i++){b=ibRange[i];results.push(V3.fromVec(avdv.nextVec3()));}return results;}();// JRWG Could also try UInt32Array. And is using a named range a problem?
//@bone4cc      = (do avdv.nextStr4cc for b in ibRange)
this.bone4cc=new Array(this.countBones);for(b=i=0,ref1=this.countBones;0<=ref1?i<ref1:i>ref1;b=0<=ref1?++i:--i){this.bone4cc[b]=avdv.nextStr4cc();}this.weight=function(){var j,len,results;results=[];for(j=0,len=ibRange.length;j<len;j++){b=ibRange[j];results.push(avdv.nextFloat());}return results;}();return this.distance=function(){var j,len,results;results=[];for(j=0,len=ibRange.length;j<len;j++){b=ibRange[j];results.push(avdv.nextFloat());}return results;}();}//   Returns the distance from this point to its (main) bone-end.
getBoneEndDistance(b){return this.distance[b];}//-----------------
//   Returns this point''s index, w.r.t. its mesh''s points array.
getIndex(){return this.index;}//-------
//   Returns the number of bones influencing this point.
getNumBones(){return this.countBones;}//----------
//   Returns the specified influencing bone for this mesh-point.
getBone4cc(b){return this.bone4cc[b];}//---------
//   Returns the specified weight component for this mesh-point.
getWeight(b){return this.weight[b];}//--------
//   Returns the specified offset vector for this mesh-point.
getOffset(b){return this.offsetVector[b];}//--------
//   Returns the base-normal vector for this mesh-point.
getBaseNormal(b){return this.baseNormal[b];}};//------------
// Export
//this.MeshVertex = MeshVertex
cwaenv.add(MeshVertex,"MeshVertex");// (End MeshVertex.coffee)
}).call(this);// -------- Mesh.js --------
// Generated by CoffeeScript 2.6.1
(function(){var Config,Data,FourCC,Logger,M4,Mesh,MeshVertex,MorphsManager,RQ,Shader,Texture,V3,VBO,cwaenv,document,lggr,setTimeout;cwaenv=this.getCWAEnv();document=this.document;setTimeout=this.setTimeout;Logger=cwaenv.get("Logger");lggr=Logger.get("Animate");Config=cwaenv.get("Config");Data=cwaenv.get("Data");Shader=cwaenv.get("Shader");Texture=cwaenv.get("Texture");VBO=cwaenv.get("VBO");FourCC=cwaenv.get("FourCC");V3=cwaenv.get("E3Vec");RQ=cwaenv.get("RotQuat");M4=cwaenv.get("Mat4");MorphsManager=cwaenv.get("MorphsManager");MeshVertex=cwaenv.get("MeshVertex");Mesh=function(){//---------
class Mesh{static _shaderSourceLoaded(){var ref,ref1;return((ref=this._shaderSource)!=null?ref.vert:void 0)&&((ref1=this._shaderSource)!=null?ref1.frag:void 0);}static _fetchShaders(callback){var cb,fsloaded,fsloc,ref,ref1,sroot,vsloaded,vsloc;sroot="qskin";this._shaderPath.vert=`shaders/${sroot}.vert`;this._shaderPath.frag=`shaders/${sroot}.frag`;cb=()=>{if(this._shaderSourceLoaded()){if(typeof lggr.debug==="function"){lggr.debug("Fetched shader sources");}return callback();}};if(this._shaderSourceLoaded()){return cb();}else{if(!((ref=this._shaderSource)!=null?ref.vert:void 0)){vsloaded=vstxt=>{if(typeof lggr.debug==="function"){lggr.debug(`Fetched vert shader source ${this._shaderPath.vert}`);}this._shaderSource.vert=vstxt;return cb();};vsloc=Data.absoluteURI(this._shaderPath.vert,Config.theConfig.cwaBase);Data.fetchText(vsloc,vsloaded);}if(!((ref1=this._shaderSource)!=null?ref1.frag:void 0)){fsloaded=fstxt=>{if(typeof lggr.debug==="function"){lggr.debug(`Fetched frag shader source ${this._shaderPath.frag}`);}this._shaderSource.frag=fstxt;return cb();};fsloc=Data.absoluteURI(this._shaderPath.frag,Config.theConfig.cwaBase);return Data.fetchText(fsloc,fsloaded);}}}constructor(gl,usebonetrx,cputrx2mat){var floatext,ref,ref1;this.gl=gl;//----------
this.modelMat=M4.makeMat4();this.modelViewMat=M4.makeMat4();this.modelViewProjMat=M4.makeMat4();this.skinningShader=null;// boneIDs: bone indices (w.r.t. skeleton bones array) -- 4 per
// vertex, with the value 0 (i.e. ROOT) indicating an unused entry.
this.vertices=null;this.vertexDuplicateIndices=null;this.texture=null;this.texCoords=null;this.boneIxs=null;// i.e. bone indices, 4 per vertex (see above);
this.boneWeights=null;this.triStripIndices=null;this.bindPos=null;this.bindNorm=null;this.vbos=[];this.morphsManager=null;this.uniformMVMat=null;this.uniformMVPMat=null;this.uniformBones=null;this.uniformMorphWeights=null;this.uniformTexture=null;this.DO_TRX_BONE_UNIFORMS=usebonetrx;this.TEST_CPU_TRX_TO_MAT=cputrx2mat;this.boneTexture=null;this.twistTexture=null;this.uniformSkelXforms=null;this.uniformSkelXformsWidth=null;this.uniformSkelXformsHeight=null;this.boneTwists=null;this.uniformBoneTwistData=null;this.uniformBoneTwistWidth=null;this.uniformBoneTwistHeight=null;// Shader and Texture loaded
this.isReady=false;this.reportReady=true;if(typeof lggr.debug==="function"){lggr.debug(`WebGL extensions available: ${(ref=this.gl)!=null?ref.getSupportedExtensions():void 0}`);}floatext=(ref1=this.gl)!=null?ref1.getExtension('OES_texture_float'):void 0;this.DO_ARM_TWISTS=true;this._SUPPRESS_A_T=false;this.USE_TEXTURES=floatext!=null;if(typeof lggr.debug==="function"){lggr.debug(`Mesh: DO_TRX_BONE_UNIFORMS: ${this.DO_TRX_BONE_UNIFORMS}, TEST_CPU_TRX_TO_MAT: ${this.TEST_CPU_TRX_TO_MAT}, DO_ARM_TWISTS: ${this.DO_ARM_TWISTS}, SUPPRESS_A_T: ${this._SUPPRESS_A_T}, USE_TEXTURES: ${this.USE_TEXTURES}`);}}setFromJSON(jsnmesh){//----------
// Raw I/O.
this.loadVertices(jsnmesh.meshPoints);this.loadTriangleStripIndices(jsnmesh.triangleStripIndices);this.loadVertexDuplicateData(jsnmesh.duplicateVertexIndices);this.loadTextureCoords(jsnmesh.textureCoordinatePairs);this.morphsManager=MorphsManager.fromJSON(jsnmesh.morphTargets,Mesh.MORPH_TAGS);return this.createCPUVertexBuffers();}// (Defer shader creation until character provides skeleton bones count.)
// (Defer texture creation until character provides its URL.)
setFromBin(avdv){//---------
this.lodRange=avdv.nextFloat();this.loadVerticesBin(avdv);this.loadTriangleStripIndicesBin(avdv);this.loadVertexDuplicateDataBin(avdv);this.loadTextureCoordsBin(avdv);this.morphsManager=MorphsManager.fromBin(avdv,Mesh.MORPH_TAGS);return this.createCPUVertexBuffers();}// (Defer shader creation until character provides skeleton bones count.)
// (Defer texture creation until character provides its filename.)
//   Loads the mesh-points array from the given stream.
loadVertices(jsnmpts){//-----------
this.vertices=jsnmpts.map(MeshVertex.fromJSON);return this.nVertsNoDups=this.vertices.length;}loadVerticesBin(avdv){var nMV,v;//--------------
nMV=avdv.nextUint();this.vertices=function(){var l,ref,results;results=[];for(v=l=0,ref=nMV;0<=ref?l<ref:l>ref;v=0<=ref?++l:--l){results.push(MeshVertex.fromBin(avdv,v));}return results;}();return this.nVertsNoDups=this.vertices.length;}//   Loads the index list for this mesh from the given stream.
loadTriangleStripIndices(jsntsis){//-----------------------
return this.triStripIndices=new Uint16Array(jsntsis);}loadTriangleStripIndicesBin(avdv){var l,nTSI,ref,t,tsi;//--------------------------
nTSI=avdv.nextUint();tsi=new Uint16Array(nTSI);for(t=l=0,ref=nTSI;0<=ref?l<ref:l>ref;t=0<=ref?++l:--l){tsi[t]=avdv.nextUshort();}return this.triStripIndices=tsi;}appendDuplicatedVertices(){var l,len,ref,results,vdi;ref=this.vertexDuplicateIndices;results=[];for(l=0,len=ref.length;l<len;l++){vdi=ref[l];//-----------------------
results.push(this.vertices.push(this.vertices[vdi]));}return results;}//   Loads the duplicate vertices map for this mesh.
loadVertexDuplicateData(jsndvis){//----------------------
this.vertexDuplicateIndices=jsndvis;return this.appendDuplicatedVertices();}loadVertexDuplicateDataBin(avdv){var j,nDupVertices;//-------------------------
nDupVertices=avdv.nextUint();this.vertexDuplicateIndices=function(){var l,ref,results;results=[];for(j=l=0,ref=nDupVertices;0<=ref?l<ref:l>ref;j=0<=ref?++l:--l){results.push(avdv.nextUint());}return results;}();return this.appendDuplicatedVertices();}//   Loads the mesh-points array from the given stream.
loadTextureCoords(jsntcpairs){var i,tca;//----------------
// Flatten the JSON TC pairs on insertion into the texCoords array.
tca=new Float32Array(2*jsntcpairs.length);i=0;jsntcpairs.forEach(function(cc){this[i]=cc[0];this[i+1]=cc[1];return i+=2;},tca);return this.texCoords=tca;}loadTextureCoordsBin(avdv){var c,cc,i,l,nTC2,ref,tca;//-------------------
// Create a flattened array of coord pairs.
nTC2=avdv.nextUint();tca=new Float32Array(2*nTC2);i=0;for(c=l=0,ref=nTC2;0<=ref?l<ref:l>ref;c=0<=ref?++l:--l){cc=avdv.nextVec2();tca[i]=cc[0];tca[i+1]=cc[1];i+=2;}return this.texCoords=tca;}createCPUVertexBuffers(){var nV,nV3,nV4;//---------------------
nV=this.vertices.length;nV3=nV*3;nV4=nV*4;this.bindPos=new Float32Array(nV3);this.bindNorm=new Float32Array(nV3);this.boneIxs=new Float32Array(nV4);this.boneWeights=new Float32Array(nV4);if(this.DO_ARM_TWISTS){this.boneTwists=new Float32Array(nV4);}return this.morphsManager.createCPUVertexBuffers(nV);}createShaders(callback,nbones){var allLoaded,useQSkin,vssubs;//------------
// We always use qskin shaders
useQSkin=this.DO_TRX_BONE_UNIFORMS&&!this.TEST_CPU_TRX_TO_MAT;if(!useQSkin){if(typeof lggr.info==="function"){lggr.info("Only \"qskin\" shaders supported");}}// Global substitution lists -- to be applied to shader sources
// before compilations.
vssubs=[["N_BONES",`${nbones}`],["DO_TWIST",this.DO_ARM_TWISTS?"1":"0"],["USE_TXTR",this.USE_TEXTURES?"1":"0"]];allLoaded=()=>{if(typeof lggr.debug==="function"){lggr.debug("Creating Shader");}this.skinningShader=new Shader(this.gl,Mesh._shaderPath.vert,Mesh._shaderPath.frag,Mesh._shaderSource.vert,Mesh._shaderSource.frag,vssubs);return callback();};return Mesh._fetchShaders(allLoaded);}createTextureFromJSON(tURL){if(typeof lggr.debug==="function"){lggr.debug(`Texture directly from URL ${tURL}`);}// Assumes that texture does not need to be flipped
return this.texture=new Texture(this.gl,function(tURLHandler){return tURLHandler(tURL);},false);}createTextureFromAvDV(avdv,tName,mustFlip){if(typeof lggr.debug==="function"){lggr.debug(`Asynchronous texture PNG URI via AvDef entry for ${tName}`);}// Have inspected JARP flag to decide whether to flip
return this.texture=new Texture(this.gl,avdv.pngURIGen(tName),mustFlip);}bindTextureForGL(tName){if(typeof lggr.debug==="function"){lggr.debug(`Bind texture for GL for ${tName}`);}return this.texture.bind();}releaseMesh(tName){if(typeof lggr.debug==="function"){lggr.debug(`Release Mesh from GL for ${tName}`);}this.isReady=false;this.reportReady=true;return this.texture.release();}prepareSkeleton(skel){//--------------
this.makeVertexArraysForBones(skel);this.makeVertexArraysForMorphs(skel);return this.generateBindPose(skel);}prepareForGL(skel){var finishShaders;//-----------
if(this.USE_TEXTURES){this.boneTexture=this.gl.createTexture();this.twistTexture=this.gl.createTexture();}finishShaders=()=>{if(this.skinningShader.isValid()){this.createGLVBOs(skel);return this.cacheGLUniformLocations();}};// Moved after creation of vertex arrays and bindpose
return this.createShaders(finishShaders,skel.getBonesCount());}makeVertexArraysForBones(skel){var b,bb,bone,k,l,len,m,nV4,o,ref,ref1,ref2,results,scale,stw,v,v4,vertex,wtw;//-----------------------
nV4=this.vertices.length*4;for(k=l=0,ref=nV4;0<=ref?l<ref:l>ref;k=0<=ref?++l:--l){// Initialise bone index & weight streams.
this.boneIxs[k]=0,this.boneWeights[k]=0;}if(this.DO_ARM_TWISTS){for(k=m=0,ref1=nV4;0<=ref1?m<ref1:m>ref1;k=0<=ref1?++m:--m){this.boneTwists[k]=-1;}}ref2=this.vertices;// Scan vertices
results=[];for(v=o=0,len=ref2.length;o<len;v=++o){vertex=ref2[v];v4=v*4;results.push(function(){var p,ref3,results1;// For each of the (<=4) vertex''s influencing-bones, record
// the bone index and influence weight.
results1=[];for(b=p=0,ref3=vertex.getNumBones();0<=ref3?p<ref3:p>ref3;b=0<=ref3?++p:--p){bb=skel.getBoneIndex(vertex.getBone4cc(b));this.boneIxs[v4+b]=bb;this.boneWeights[v4+b]=vertex.getWeight(b);if(this.DO_ARM_TWISTS&&!this._SUPPRESS_A_T){scale=-1;bone=skel.getBone(bb);stw=bone.doesShoulderTwist();wtw=bone.doesWristTwist();if(stw||wtw){scale=vertex.getBoneEndDistance(b)/bone.getLength();if(scale<0){scale=0;}if(1<scale){scale=1;}if(stw){// Invert scale for upper arm (shoulder) twist, since this
// twist occurs at the base of the bone, not at its farther end.
scale=1-scale;}if(typeof lggr.trace==="function"){lggr.trace(`____ Vtx,B ${v},${b}: scale=${RQ.fStr(scale,3)}`);}}results1.push(this.boneTwists[v4+b]=scale);}else{results1.push(void 0);}}return results1;}.call(this));}return results;}makeVertexArraysForMorphs(skel){var globalHeadRot,headBone;//------------------------
// Get global transform for the frame given by rotating the head bone
// frame through a negative quarter circle, so that x and y axes point
// (approximately) rightwards and upwards, respectively.
headBone=skel.getBoneBy4CC(FourCC.fourCCInt("HEAD"));// NB Although in the past we've always used a TR transform here,
// only the rotation part gets used, so now we make that explicit.
globalHeadRot=RQ.fromRQ(headBone.getGlobalTRX().rot());globalHeadRot.setPostMultiply(RQ.ROT_NEG_PI_BY_2_ON_Z);return this.morphsManager.makeVertexArrays(this.vertexDuplicateIndices,globalHeadRot);}generateBindPose(skeleton){var b,bone,bpTRX,i,l,len,m,norm3V,normXYZ,o,offset3V,offsetXYZ,ref,ref1,v,v3,v4,vertex,weight;//---------------
// Workspace for offset and normal vectors -
offset3V=V3.create();offsetXYZ=offset3V.xyz;norm3V=V3.create();normXYZ=norm3V.xyz;ref=this.vertices;// For each mesh point...
for(v=l=0,len=ref.length;l<len;v=++l){vertex=ref[v];v3=v*3;v4=v*4;// For each of the vertex''s influencing-bones ...
for(b=m=0,ref1=vertex.getNumBones();0<=ref1?m<ref1:m>ref1;b=0<=ref1?++m:--m){bone=skeleton.getBone(this.boneIxs[v4+b]);weight=this.boneWeights[v4+b];bpTRX=bone.getBindPoseTRX();// Get vertex's offset and normal vectors for bone b.
offset3V.setFromE3V(vertex.getOffset(b));norm3V.setFromE3V(vertex.getBaseNormal(b));// Apply bone's BP xform to offset and normal and add the results
// into our BP offset and normal arrays.
bpTRX.transform(offset3V);// effectively updates offsetXYZ
bpTRX.rot().rotate(norm3V);// effectively updates normXYZ
for(i=o=0;o<3;i=++o){this.bindPos[v3+i]+=offsetXYZ[i]*weight;this.bindNorm[v3+i]+=normXYZ[i]*weight;}}}return void 0;// (dummy result, simplifies JS output)
}// Builds all the VBOs.
createGLVBOs(skeleton){var GL,setVBO_std,ssal;//-----------
// Auxiliary definitions.
GL=this.gl;ssal=id=>{return this.skinningShader.getAttributeLocation(id);};setVBO_std=(id,n,buf)=>{this.vbos[id]=VBO.makeStd(GL,n,buf,ssal(id));return void 0;};// Create the buffers.
setVBO_std("BindPos",3,this.bindPos);setVBO_std("BindNorm",3,this.bindNorm);setVBO_std("BoneIxs",4,this.boneIxs);setVBO_std("BoneWeights",4,this.boneWeights);if(this.DO_ARM_TWISTS){setVBO_std("BoneTwists",4,this.boneTwists);}setVBO_std("VSTexCoord0",2,this.texCoords);this.morphsManager.createGLVBOs(GL,ssal);this.vbos["TriStripIndices"]=VBO.makeEls(GL,1,this.triStripIndices,GL.TRIANGLE_STRIP,false);return void 0;// (dummy result, simplifies JS output)
}// Gets locations for vertex shader uniform variables.
cacheGLUniformLocations(){var ssuLoc,ssuaLoc;//----------------------
ssuLoc=unm=>{return this.skinningShader.getUniformLocation(unm);};ssuaLoc=function(uanm){return ssuLoc(`${uanm}[0]`);};this.uniformMVMat=ssuLoc("ModelViewMat");this.uniformMVPMat=ssuLoc("ModelViewProjMat");if(this.DO_TRX_BONE_UNIFORMS){if(!this.TEST_CPU_TRX_TO_MAT){if(this.USE_TEXTURES){this.uniformSkelXformsWidth=ssuLoc("SkelXformsWidth");this.uniformSkelXformsHeight=ssuLoc("SkelXformsHeight");this.uniformSkelXforms=ssuLoc("SkelXforms");if(this.DO_ARM_TWISTS){this.uniformBoneTwistWidth=ssuLoc("BoneTwistWidth");this.uniformBoneTwistHeight=ssuLoc("BoneTwistHeight");this.uniformBoneTwistData=ssuLoc("BoneTwistData");}}else{this.uniformSkelXforms=ssuaLoc("SkelXforms");if(this.DO_ARM_TWISTS){this.uniformBoneTwistData=ssuaLoc("BoneTwistData");}}}else{this.uniformBones=ssuaLoc("Bones");}}else{this.uniformBones=ssuaLoc("Bones");}this.uniformMorphWeights=ssuLoc("MorphWeights");return this.uniformTexture=ssuLoc("Texture");}checkReady(){var ready;// Was: ready = @skinningShader? && do @skinningShader?.isValid && do @texture?.isValid
ready=this.skinningShader!=null&&this.skinningShader.isValid()&&this.texture!=null&&this.texture.isValid();if(ready||this.reportReady){this.reportReady=false;if(typeof lggr.debug==="function"){lggr.debug(`Mesh Ready is ${ready}`);}}return ready;}draw(skeleton,currentMorphs,x,y,z,viewMat,projMat){//---
// Delay if shaders or image not ready
if(this.isReady||(this.isReady=this.checkReady())){return this.doDraw(skeleton,currentMorphs,x,y,z,viewMat,projMat);}}doDraw(skeleton,currentMorphs,x,y,z,viewMat,projMat){var GL,GL_A_BUF,GL_EL_A_BUF,avbo,avbos,avids,id,l,len,len1,m,mWeights,skelXforms,texHeight,texWidth,twistData;//-----
this.morphsManager.setGLDataForDraw(currentMorphs);// Standard ModelViewProj matrices.
M4.setTRComposeT(this.modelViewMat,viewMat,x,y,z);M4.setProduct(this.modelViewProjMat,projMat,this.modelViewMat);// Cache oft-used GL values
GL=this.gl;GL_A_BUF=GL.ARRAY_BUFFER;GL_EL_A_BUF=GL.ELEMENT_ARRAY_BUFFER;GL.useProgram(this.skinningShader.getHandle());// Upload transforms, bones data, and morph weights.
// Bones new: TR transform data for inverse bind pose, and current
// pose (allowing the possibility of arm sliding).
// Bones old: first three rows of each bone's global skinning matrix
// (bind pose -> current pose).
GL.uniformMatrix4fv(this.uniformMVMat,false,this.modelViewMat);GL.uniformMatrix4fv(this.uniformMVPMat,false,this.modelViewProjMat);if(this.DO_TRX_BONE_UNIFORMS){if(!this.TEST_CPU_TRX_TO_MAT){skelXforms=skeleton.getSkelXformsData();twistData=skeleton.getBoneTwistData();if(this.USE_TEXTURES){// Skel Xforms on Texture 1
texWidth=skeleton.getSkelTexWidth();texHeight=skeleton.getSkelTexHeight();GL.activeTexture(GL.TEXTURE1);GL.bindTexture(GL.TEXTURE_2D,this.boneTexture);GL.uniform1i(this.uniformSkelXforms,1);// Link to Active Texture presumably
// Set bone texture
// All copied from three.js but may not all be necessary
GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL,false);GL.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);GL.pixelStorei(GL.UNPACK_ALIGNMENT,4);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_WRAP_S,GL.CLAMP_TO_EDGE);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_WRAP_T,GL.CLAMP_TO_EDGE);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_MAG_FILTER,GL.NEAREST);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_MIN_FILTER,GL.NEAREST);if(typeof lggr.trace==="function"){lggr.trace(`texImage2D: l=${skelXforms.length} w=${texWidth} h=${texHeight} glFormat=${GL.RGBA} glType=${GL.FLOAT}`);}GL.texImage2D(GL.TEXTURE_2D,0,GL.RGBA,texWidth,texHeight,0,GL.RGBA,GL.FLOAT,skelXforms);GL.uniform1i(this.uniformSkelXformsWidth,texWidth);GL.uniform1i(this.uniformSkelXformsHeight,texHeight);if(this.DO_ARM_TWISTS){// Bone twists on Texture 2
texWidth=skeleton.getTwistTexWidth();texHeight=skeleton.getTwistTexHeight();GL.activeTexture(GL.TEXTURE2);GL.bindTexture(GL.TEXTURE_2D,this.twistTexture);GL.uniform1i(this.uniformBoneTwistData,2);// Link to Active Texture presumably
// Set twist texture
// All copied from three.js but may not all be necessary
GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL,false);GL.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);GL.pixelStorei(GL.UNPACK_ALIGNMENT,4);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_WRAP_S,GL.CLAMP_TO_EDGE);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_WRAP_T,GL.CLAMP_TO_EDGE);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_MAG_FILTER,GL.NEAREST);GL.texParameteri(GL.TEXTURE_2D,GL.TEXTURE_MIN_FILTER,GL.NEAREST);if(typeof lggr.trace==="function"){lggr.trace(`texImage2D: l=${twistData.length} w=${texWidth} h=${texHeight} glFormat=${GL.RGBA} glType=${GL.FLOAT}`);}GL.texImage2D(GL.TEXTURE_2D,0,GL.RGBA,texWidth,texHeight,0,GL.RGBA,GL.FLOAT,twistData);GL.uniform1i(this.uniformBoneTwistWidth,texWidth);GL.uniform1i(this.uniformBoneTwistHeight,texHeight);}}else{GL.uniformMatrix4fv(this.uniformSkelXforms,false,skelXforms);if(this.DO_ARM_TWISTS){GL.uniform4fv(this.uniformBoneTwistData,twistData);}}}else{GL.uniform4fv(this.uniformBones,skeleton.getVSSkinMatRows());}}else{GL.uniform4fv(this.uniformBones,skeleton.getSkinMatRows());}mWeights=this.morphsManager.getMorphWeights();// to suppress morphs, use: [0,0,0,0]
GL.uniform4fv(this.uniformMorphWeights,mWeights);// Texturing.
GL.activeTexture(GL.TEXTURE0);GL.bindTexture(GL.TEXTURE_2D,this.texture.getHandle());GL.uniform1i(this.uniformTexture,0);// Make a list of active vertex attribute VBOs (apart from morph VBOs).
avids=["BindPos","BindNorm","BoneIxs","BoneWeights"];if(this.DO_ARM_TWISTS){// avids.push "SkelXformsN"  if @USE_TEXTURES
avids.push("BoneTwists");}avids.push("VSTexCoord0");avbos=function(){var l,len,results;results=[];for(l=0,len=avids.length;l<len;l++){id=avids[l];results.push(this.vbos[id]);}return results;}.call(this);for(l=0,len=avbos.length;l<len;l++){avbo=avbos[l];// Turn on vertex data streams.
avbo.enableAttrib();}this.morphsManager.enableMorphVBOs();// Draw.
this.vbos["TriStripIndices"].drawElements();// Turn off vertex streams.
this.morphsManager.disableMorphVBOs();for(m=0,len1=avbos.length;m<len1;m++){avbo=avbos[m];avbo.disableAttrib();}GL.useProgram(null);return void 0;// (dummy result, simplifies JS output)
}checkMesh(tag,skel){var b,b4cc,bb,l,len,max4cc,nb,nondup,ref,results,sb,v,vertex,vl;//--------
max4cc=Math.pow(2,32)-1;// Was: sb = do skel?.getBonesCount
sb=skel!=null?skel.getBonesCount():void 0;vl=this.vertices.length;nondup=vl-this.vertexDuplicateIndices.length;if(typeof lggr.debug==="function"){lggr.debug(`* ${tag} Check Mesh: vertices=${vl} of which duplicates=${this.vertexDuplicateIndices.length}`);}ref=this.vertices;// Check valid influencing bones
results=[];for(v=l=0,len=ref.length;l<len;v=++l){vertex=ref[v];if(v<nondup&&v!==vertex.getIndex()){if(typeof lggr.debug==="function"){lggr.debug(`* Mesh: Mismatch pos=${v} index=${vertex.getIndex()}`);}}nb=vertex.getNumBones();if(nb==null){results.push(typeof lggr.debug==="function"?lggr.debug(`* Mesh: undefined getNumBones for v=${v}`):void 0);}else if(nb<0||nb>4){results.push(typeof lggr.debug==="function"?lggr.debug(`* Mesh: bad ib count (${nb}) for v=${v}/${vl}`):void 0);}else{results.push(function(){var m,ref1,results1;results1=[];for(b=m=0,ref1=nb;0<=ref1?m<ref1:m>ref1;b=0<=ref1?++m:--m){b4cc=vertex.getBone4cc(b);if(b4cc==null){results1.push(typeof lggr.debug==="function"?lggr.debug(`* Mesh: undefined getBone4cc for v=${v} ib=${b}/${nb}`):void 0);}else if(b4cc<0||b4cc>max4cc){results1.push(typeof lggr.debug==="function"?lggr.debug(`* Mesh: invalid getBone4cc for v=${v} ib=${b}/${nb} b4cc=${b4cc}(\"${FourCC.fourCCStr(b4cc)}\")`):void 0);}else if(skel!=null){bb=skel.getBoneBy4CC(b4cc);if(bb==null){results1.push(typeof lggr.debug==="function"?lggr.debug(`* Mesh: missing bone for v=${v}/${vl} ib=${b}/${nb} b4cc=${b4cc}(\"${FourCC.fourCCStr(b4cc)}\")`):void 0);}else if(bb<0||bb>=sb){results1.push(typeof lggr.debug==="function"?lggr.debug(`* Mesh: bad bone number for v=${v}/${vl} ib=${b}/${nb} b4cc=${b4cc}(\"${FourCC.fourCCStr(b4cc)}\") bb=${bb}/${sb}`):void 0);}else{results1.push(void 0);}}else{results1.push(void 0);}}return results1;}());}}return results;}};//---------
// Statics cacheing skinning templates
Mesh._shaderPath={};Mesh._shaderSource={};Mesh.MORPH_TAGS=["A","B","C","D"];return Mesh;}.call(this);// ----------------------------------------------------------------------
// _checkBEDistClamping: (skel) ->
// #-------------------
//   # We need the skel, so this must be called from Character, where
//   # the skel is available.
//   nV = 0;  nBI = 0;  nLo = 0;  nHi = 0;  nXHi = 0
//   for vtx,v in @vertices
//     ++ nV
//     for b in [0...do vtx.getNumBones]
//       ++ nBI
//       blen = do (skel.getBoneBy4CC (vtx.getBone4cc b)).getLength
//       vx = (vtx.getOffset b).xyz[0]
//       vxd = vtx.getBoneEndDistance b
//       ++ nLo if vx < vxd     # Count clamping at low-end.
//       ++ nHi if vxd < vx     # Count clamping at high-end.
//       ++ nXHi if blen < vx   # Count opportunities for high-end clamp.
//   lggr.debug? "$$$$  mesh bone-end dist clamping:  nV=#{nV}  nBI=#{nBI}"
//   lggr.debug? "$$$$                               nLo=#{nLo}  nHi=#{nHi}  nXHi=#{nXHi}"
// RESULT (for luna):
// $$$$  mesh bone-end dist clamping:  nV=6704  nBI=9269
// $$$$                               nLo=1631  nHi=0  nXHi=2349
// So, it appears that a clamp is applied at the bottom end, but
// not at the top: 2349 cases (i.e. about 25% of the total) where
// bone length < vertex x-offset, but the B-E distance is nevertheless
// not clamped.
// ----------------------------------------------------------------------
// Export
cwaenv.add(Mesh,"Mesh");// (End Mesh.coffee)
}).call(this);// -------- HNSDefs.js --------
// Generated by CoffeeScript 2.6.1
(function(){//   Definitions fo H-SiGML and G-SiGML files
var HNSDefs,Logger,cwaenv,lggr;cwaenv=this.getCWAEnv();Logger=cwaenv.get("Logger");lggr=Logger.get("SiGML");HNSDefs=function(){class HNSDefs{};// Statics
HNSDefs.tokenNameMap=["",// 00   0
"",// 01   1
"",// 02   2
"",// 03   3
"",// 04   4
"",// 05   5
"",// 06   6
"",// 07   7
"",// 08   8
"hamtab",// 09   9
"hamlinefeed",// 0a  10
"",// 0b  11
"hampagebreak",// 0c  12
"hamreturn",// 0d  13
"",// 0e  14
"",// 0f  15
"",// 10  16
"",// 11  17
"",// 12  18
"",// 13  19
"hamversion40",// 14  20
"",// 15  21
"",// 16  22
"",// 17  23
"",// 18  24
"",// 19  25
"",// 1a  26
"",// 1b  27
"",// 1c  28
"",// 1d  29
"",// 1e  30
"",// 1f  31
"hamspace",// 20  32
"hamexclaim",// 21  33
"hamquery",// 22  34
"hamfullstop",// 23  35
"hamcomma",// 24  36
"hamplus",// 25  37
"hammetaalt",// 26  38
"hamclocku",// 27  39
"hamclockul",// 28  40
"hamclockl",// 29  41
"hamclockdl",// 2a  42
"hamclockd",// 2b  43
"hamclockdr",// 2c  44
"hamclockr",// 2d  45
"hamclockur",// 2e  46
"hamclockfull",// 2f  47
"hamsymmpar",// 30  48
"hamsymmlr",// 31  49
"hamfist",// 32  50
"hamflathand",// 33  51
"hamfinger2",// 34  52
"hamfinger23",// 35  53
"hamfinger23spread",// 36  54
"hamfinger2345",// 37  55
"hamthumboutmod",// 38  56
"hamthumbacrossmod",// 39  57
"hampinch12",// 3a  58
"hampinchall",// 3b  59
"hampinch12open",// 3c  60
"hamcee12",// 3d  61
"hamceeall",// 3e  62
"hamcee12open hamceeopen",// 3f  63
"hamthumbopenmod",// 40  64
"hamfingerstraightmod",// 41  65
"hamfingerbendmod",// 42  66
"hamfingerhookedmod hamfingerhookmod",// 43  67
"hamnondominant",// 44  68
"hamdoublebent",// 45  69
"hamdoublehooked",// 46  70
"",// 47  71
"hamextfingeru",// 48  72
"hamextfingerur",// 49  73
"hamextfingerr",// 4a  74
"hamextfingerdr",// 4b  75
"hamextfingerd",// 4c  76
"hamextfingerdl",// 4d  77
"hamextfingerl",// 4e  78
"hamextfingerul",// 4f  79
"hamextfingerol",// 50  80
"hamextfingero",// 51  81
"hamextfingeror",// 52  82
"hamextfingeril",// 53  83
"hamextfingeri",// 54  84
"hamextfingerir",// 55  85
"hamextfingerui",// 56  86
"hamextfingerdi",// 57  87
"hamextfingerdo",// 58  88
"hamextfingeruo",// 59  89
"",// 5a  90
"",// 5b  91
"",// 5c  92
"hamearlobe",// 5d  93
"hamnostrils",// 5e  94
"hamshouldertop",// 5f  95
"hampalmu",// 60  96
"hampalmur",// 61  97
"hampalmr",// 62  98
"hampalmdr",// 63  99
"hampalmd",// 64 100
"hampalmdl",// 65 101
"hampalml",// 66 102
"hampalmul",// 67 103
"hamreplace",// 68 104
"hamarmextended",// 69 105
"hambehind",// 6a 106
"hametc",// 6b 107
"hamorirelative",// 6c 108
"hamtongue",// 6d 109
"hamteeth",// 6e 110
"hamstomach",// 6f 111
"hamneutralspace",// 70 112
"hamhead",// 71 113
"hamheadtop",// 72 114
"hamforehead",// 73 115
"hameyebrows",// 74 116
"hameyes",// 75 117
"hamnose",// 76 118
"hamear",// 77 119
"hamcheek",// 78 120
"hamlips",// 79 121
"hamchin",// 7a 122
"hamunderchin",// 7b 123
"hamneck",// 7c 124
"hamshoulders",// 7d 125
"hamchest",// 7e 126
"hamstomach",// 7f 127
"hambelowstomach",// 80 128
"hamlrbeside",// 129
"hamlrat",// 130
"hamUpperarm",// 131
"hamelbow",// 132
"hamelbowinside",// 133
"hamlowerarm",// 134
"hamwristback",// 135
"hamwristpulse",// 136
"hamthumbball",// 137
"hampalm",// 138
"hamhandback",// 139
"hamthumb",// 140
"hamindexfinger",// 141
"hammiddlefinger",// 142
"hamringfinger",// 143
"hampinky",// 144
"hamthumbside",// 145
"hampinkyside",// 146
"hambetween",// 147
"hamfingertip",// 148
"hamfingernail",// 149
"hamfingerpad",// 150
"hamfingermidjoint",// 151
"hamfingerbase",// 152
"hamfingerside",// 153
"hamwristtopulse",// 154
"hamwristtoback",// 155
"hamwristtothumb",// 156
"hamwristtopinky",// 157
"hamcoreftag",// 158
"hamcorefref",// 159
"hamnomotion",// 160
"hammoveu",// 161
"hammoveur",// 162
"hammover",// 163
"hammovedr",// 164
"hammoved",// 165
"hammovedl",// 166
"hammovel",// 167
"hammoveul",// 168
"hammoveol",// 169
"hammoveo",// 170
"hammoveor",// 171
"hammoveil",// 172
"hammovei",// 173
"hammoveir",// 174
"hammoveui",// 175
"hammovedi",// 176
"hammovedo",// 177
"hammoveuo",// 178
"hammovecross",// 179
"hammovex",// 180
"hamsmallmod",// 181
"hamlargemod",// 182
"hamarcl",// 183
"hamarcu",// 184
"hamarcr",// 185
"hamarcd",// 186
"hamwavy",// 187
"hamzigzag",// 188
"hamfingerplay",// 189
"hamparbegin",// 190
"hamparend",// 191
"hamcircleo",// 192
"hamcirclei",// 193
"hamcircled",// 194
"hamcircleu",// 195
"hamcirclel",// 196
"hamcircler",// 197
"hamincreasing",// 198
"hamdecreasing",// 199
"hamclose",// 200
"hamtouch",// 201
"haminterlock",// 202
"hamcross",// 203
"hamfast",// 204
"hamslow",// 205
"hamtense",// 206
"hamrest",// 207
"hamhalt",// 208
"hamrepeatfromstart",// 209
"hamrepeatfromstartseveral",// 210
"hamrepeatcontinue",// 211
"hamrepeatcontinueseveral",// 212
"hamseqbegin",// 213
"hamseqend",// 214
"hamalternatingmotion",// 215
"hamrepeatreverse",// 216
"hambrushing",// 217
"hamnonipsi",// 218
"",// 219
"hamellipseh",// 220
"hamellipseur",// 221
"hamellipsev",// 222
"hamellipseul",// 223
"hammime",// 224
"hamaltbegin",// 225
"hamaltend",// 226
"hamnodding",// 227
"hamswinging",// 228
"hamtwisting",// 229
"hamstircw",// 230
"hamstirccw",// 231
"",// 232
"",// 233
"",// 234
"",// 235
"hamfusionbegin",// 236
"hamfusionend",// 237
"",// 238
"",// 239
"hamcircleul",// 240
"hamcircledr",// 241
"hamcircleur",// 242
"hamcircledl",// 243
"hamcircleol",// 244
"hamcircleir",// 245
"hamcircleor",// 246
"hamcircleil",// 247
"hamcircledo",// 248
"hamcircleui",// 249
"hamcircledi",// 250
"hamcircleuo",// 251
"",// 252
"",// 253
"hamnbs",// 254
""// 255
];HNSDefs.hamMap=function(){var i,ix,j,len,len1,ref,ref1,str,strs,theMap;theMap={};if(typeof lggr.debug==="function"){lggr.debug(`Building hamMap ${HNSDefs.tokenNameMap.length}`);}ref=HNSDefs.tokenNameMap;for(ix=i=0,len=ref.length;i<len;ix=++i){strs=ref[ix];if(typeof lggr.trace==="function"){lggr.trace(`HNSDefs: ${strs} at ${ix}`);}ref1=strs.split(" ");for(j=0,len1=ref1.length;j<len1;j++){str=ref1[j];theMap[str]=String.fromCharCode(ix);}}return theMap;}();HNSDefs.MOUTH_PICTURE_LETTER="m";HNSDefs.EYES_LETTER="e";HNSDefs.MOUTH_GESTURE_LETTERS="djlct";HNSDefs.NON_MOUTH_RELATED_LETTERS="sbh"+HNSDefs.EYES_LETTER+"n";HNSDefs.EYES_TAG_LISTS=[// Eyes - Gaze:
"AD FR HD HI HC UP DN LE RI NO RO LU LD RU RD",// Eyes - Brows:
"RB RR RL FU",// Eyes - Lids:
"WB WR WL SB SR SL CB CR CL TB TR TL BB"];HNSDefs.HNS_SHOULDER_TAG="hnm_shoulder";HNSDefs.HNS_BODY_TAG="hnm_body";HNSDefs.HNS_HEAD_TAG="hnm_head";HNSDefs.HNS_NOSE_TAG="hnm_nose";HNSDefs.NON_MOUTH_RELATED_HML_TAGS=[HNSDefs.HNS_SHOULDER_TAG,HNSDefs.HNS_BODY_TAG,HNSDefs.HNS_HEAD_TAG,null,HNSDefs.HNS_NOSE_TAG];HNSDefs.HNS_EYEGAZE_TAG="hnm_eyegaze";HNSDefs.HNS_EYEBROWS_TAG="hnm_eyebrows";HNSDefs.HNS_EYELIDS_TAG="hnm_eyelids";HNSDefs.EYE_RELATED_HML_TAGS=[HNSDefs.HNS_EYEGAZE_TAG,HNSDefs.HNS_EYEBROWS_TAG,HNSDefs.HNS_EYELIDS_TAG];HNSDefs.HNS_MOUTHGESTURE_TAG="hnm_mouthgesture";HNSDefs.HNS_MOUTHPICTURE_TAG="hnm_mouthpicture";HNSDefs.HNS_EXTRA_TAG="hnm_extra";HNSDefs.HNS_NONMAN_TAG="hamnosys_nonmanual";HNSDefs.PICTURE_ATTR="picture";HNSDefs.TAG_ATTR="tag";HNSDefs.xmlSpecials="<>&\'\"";HNSDefs.xmlEscapes=["&lt;","&gt;","&amp;","&apos;","&quot;"];return HNSDefs;}.call(this);// Export
cwaenv.add(HNSDefs,"HNSDefs");// (End HNSDefs.coffee)
}).call(this);// -------- antlr3-all-min.js --------
/*
Copyright (c) 2003-2008 Terence Parr. All rights reserved.
Code licensed under the BSD License:
http://www.antlr.org/license.html
Some parts of the ANTLR class:
Copyright (c) 2008, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
*/if(typeof org=="undefined"||!org){var org={};}if(typeof org.antlr=="undefined"||!org.antlr){org.antlr={};}org.antlr.global=function(){return this;}.call(null);org.antlr.namespace=function(){var A=arguments,E=null,C,B,D;for(C=0;C<A.length;C=C+1){D=A[C].split(".");E=org.antlr.global;for(B=0;B<D.length;B=B+1){E[D[B]]=E[D[B]]||{};E=E[D[B]];}}return E;};org.antlr.env=org.antlr.env||{};org.antlr.env.ua=function(){var D={ie:0,opera:0,gecko:0,webkit:0,mobile:null,air:0,rhino:false};var B,A;try{B=navigator.userAgent;if(/KHTML/.test(B)){D.webkit=1;}A=B.match(/AppleWebKit\/([^\s]*)/);if(A&&A[1]){D.webkit=parseFloat(A[1]);if(/ Mobile\//.test(B)){D.mobile="Apple";}else{A=B.match(/NokiaN[^\/]*/);if(A){D.mobile=A[0];}}A=B.match(/AdobeAIR\/([^\s]*)/);if(A){D.air=A[0];}}if(!D.webkit){A=B.match(/Opera[\s\/]([^\s]*)/);if(A&&A[1]){D.opera=parseFloat(A[1]);A=B.match(/Opera Mini[^;]*/);if(A){D.mobile=A[0];}}else{A=B.match(/MSIE\s([^;]*)/);if(A&&A[1]){D.ie=parseFloat(A[1]);}else{A=B.match(/Gecko\/([^\s]*)/);if(A){D.gecko=1;A=B.match(/rv:([^\s\)]*)/);if(A&&A[1]){D.gecko=parseFloat(A[1]);}}}}}}catch(C){}try{if(typeof window=="undefined"&&loadClass){D.rhino=true;}}catch(C){}return D;}();org.antlr.namespace("org.antlr.runtime.tree");org.antlr.lang=org.antlr.lang||{isArray:function(B){if(B){var A=org.antlr.lang;return A.isNumber(B.length)&&A.isFunction(B.splice);}return false;},isBoolean:function(A){return typeof A==="boolean";},isFunction:function(A){return typeof A==="function";},isNull:function(A){return A===null;},isNumber:function(A){return typeof A==="number"&&isFinite(A);},isObject:function(A){return A&&(typeof A==="object"||org.antlr.lang.isFunction(A))||false;},isString:function(A){return typeof A==="string";},isUndefined:function(A){return typeof A==="undefined";},_IEEnumFix:function(C,B){if(org.antlr.env.ua.ie){var E=["toString","valueOf"],A;for(A=0;A<E.length;A=A+1){var F=E[A],D=B[F];if(org.antlr.lang.isFunction(D)&&D!=Object.prototype[F]){C[F]=D;}}}},extend:function(D,E,C){if(!E||!D){throw new Error("org.antlr.lang.extend failed, please check that all dependencies are included.");}var B=function(){};B.prototype=E.prototype;D.prototype=new B();D.prototype.constructor=D;D.superclass=E.prototype;if(E.prototype.constructor==Object.prototype.constructor){E.prototype.constructor=E;}if(C){for(var A in C){D.prototype[A]=C[A];}org.antlr.lang._IEEnumFix(D.prototype,C);}},augmentObject:function(E,D){if(!D||!E){throw new Error("Absorb failed, verify dependencies.");}var A=arguments,C,F,B=A[2];if(B&&B!==true){for(C=2;C<A.length;C=C+1){E[A[C]]=D[A[C]];}}else{for(F in D){if(B||!E[F]){E[F]=D[F];}}org.antlr.lang._IEEnumFix(E,D);}},augmentProto:function(D,C){if(!C||!D){throw new Error("Augment failed, verify dependencies.");}var A=[D.prototype,C.prototype];for(var B=2;B<arguments.length;B=B+1){A.push(arguments[B]);}org.antlr.lang.augmentObject.apply(this,A);},merge:function(){var D={},B=arguments;for(var C=0,A=B.length;C<A;C=C+1){org.antlr.lang.augmentObject(D,B[C],true);}return D;},isValue:function(B){var A=org.antlr.lang;return A.isObject(B)||A.isString(B)||A.isNumber(B)||A.isBoolean(B);},array:{peek:function(B){if(!org.antlr.lang.isArray(B)){throw new Error("org.antlr.lang.array.peek: a is not an array.");}var A=B.length;if(A<=0){throw new Error("org.antlr.lang.array.peek: a is empty.");}return B[A-1];}}};org.antlr.runtime.RecognizerSharedState=function(){this.following=[];this._fsp=-1;this.errorRecovery=false;this.lastErrorIndex=-1;this.failed=false;this.syntaxErrors=0;this.backtracking=0;this.ruleMemo=null;this.token=null;this.tokenStartCharIndex=-1;this.text=null;};org.antlr.runtime.IndexOutOfBoundsException=function(A){org.antlr.runtime.IndexOutOfBoundsException.superclass.constructor.call(this,A);};org.antlr.lang.extend(org.antlr.runtime.IndexOutOfBoundsException,Error,{name:"org.antlr.runtime.IndexOutOfBoundsException"});org.antlr.runtime.RecognitionException=function(A){org.antlr.runtime.RecognitionException.superclass.constructor.call(this);this.input=A;this.index=A.index();if(A instanceof org.antlr.runtime.CommonTokenStream){this.token=A.LT(1);this.line=this.token.getLine();this.charPositionInLine=this.token.getCharPositionInLine();}if(A instanceof org.antlr.runtime.tree.TreeNodeStream){this.extractInformationFromTreeNodeStream(A);}else{if(A instanceof org.antlr.runtime.ANTLRStringStream){this.c=A.LA(1);this.line=A.getLine();this.charPositionInLine=A.getCharPositionInLine();}else{this.c=A.LA(1);}}this.message=this.toString();};org.antlr.lang.extend(org.antlr.runtime.RecognitionException,Error,{input:null,index:null,token:null,node:null,c:null,line:null,name:"org.antlr.runtime.RecognitionException",charPositionInLine:null,approximateLineInfo:null,extractInformationFromTreeNodeStream:function(F){var A=F,E,I,D,H,C;this.node=A.LT(1);var B=A.getTreeAdaptor(),G=B.getToken(this.node);if(G){this.token=G;if(G.getLine()<=0){C=-1;E=A.LT(C);while(E){priorPayload=B.getToken(E);if(priorPayload&&priorPayload.getLine()>0){this.line=priorPayload.getLine();this.charPositionInLine=priorPayload.getCharPositionInLine();this.approximateLineInfo=true;break;}--C;E=A.LT(C);}}else{this.line=G.getLine();this.charPositionInLine=G.getCharPositionInLine();}}else{if(this.node instanceof org.antlr.runtime.tree.CommonTree){this.line=this.node.getLine();this.charPositionInLine=this.node.getCharPositionInLine();if(this.node instanceof org.antlr.runtime.tree.CommonTree){this.token=this.node.token;}}else{D=B.getType(this.node);H=B.getText(this.node);this.token=new org.antlr.runtime.CommonToken(D,H);}}},getUnexpectedType:function(){if(this.input instanceof org.antlr.runtime.CommonTokenStream){return this.token.getType();}else{if(this.input instanceof org.antlr.runtime.tree.TreeNodeStream){var A=this.input;var B=A.getTreeAdaptor();return B.getType(this.node);}else{return this.c;}}}});org.antlr.runtime.MismatchedTokenException=function(B,A){if(arguments.length===0){this.expecting=org.antlr.runtime.Token.INVALID_TOKEN_TYPE;}else{org.antlr.runtime.MismatchedTokenException.superclass.constructor.call(this,A);this.expecting=B;}};org.antlr.lang.extend(org.antlr.runtime.MismatchedTokenException,org.antlr.runtime.RecognitionException,{toString:function(){return"MismatchedTokenException("+this.getUnexpectedType()+"!="+this.expecting+")";},name:"org.antlr.runtime.MismatchedTokenException"});org.antlr.runtime.UnwantedTokenException=function(B,A){if(arguments.length>0){org.antlr.runtime.UnwantedTokenException.superclass.constructor.call(this,B,A);}};org.antlr.lang.extend(org.antlr.runtime.UnwantedTokenException,org.antlr.runtime.MismatchedTokenException,{getUnexpectedToken:function(){return this.token;},toString:function(){var A=", expected "+this.expecting;if(this.expecting===org.antlr.runtime.Token.INVALID_TOKEN_TYPE){A="";}if(!org.antlr.lang.isValue(this.token)){return"UnwantedTokenException(found="+A+")";}return"UnwantedTokenException(found="+this.token.getText()+A+")";},name:"org.antlr.runtime.UnwantedTokenException"});org.antlr.runtime.MissingTokenException=function(B,A,C){if(arguments.length>0){org.antlr.runtime.MissingTokenException.superclass.constructor.call(this,B,A);this.inserted=C;}};org.antlr.lang.extend(org.antlr.runtime.MissingTokenException,org.antlr.runtime.MismatchedTokenException,{getMissingType:function(){return this.expecting;},toString:function(){if(org.antlr.lang.isValue(this.inserted)&&org.antlr.lang.isValue(this.token)){return"MissingTokenException(inserted "+this.inserted+" at "+this.token.getText()+")";}if(org.antlr.lang.isValue(this.token)){return"MissingTokenException(at "+this.token.getText()+")";}return"MissingTokenException";},name:"org.antlr.runtime.MissingTokenException"});org.antlr.runtime.NoViableAltException=function(C,B,D,A){org.antlr.runtime.NoViableAltException.superclass.constructor.call(this,A);this.grammarDecisionDescription=C;this.decisionNumber=B;this.stateNumber=D;};org.antlr.lang.extend(org.antlr.runtime.NoViableAltException,org.antlr.runtime.RecognitionException,{toString:function(){if(this.input instanceof org.antlr.runtime.ANTLRStringStream){return"NoViableAltException('"+this.getUnexpectedType()+"'@["+this.grammarDecisionDescription+"])";}else{return"NoViableAltException("+this.getUnexpectedType()+"@["+this.grammarDecisionDescription+"])";}},name:"org.antlr.runtime.NoViableAltException"});org.antlr.runtime.EarlyExitException=function(B,A){org.antlr.runtime.EarlyExitException.superclass.constructor.call(this,A);this.decisionNumber=B;};org.antlr.lang.extend(org.antlr.runtime.EarlyExitException,org.antlr.runtime.RecognitionException,{name:"org.antlr.runtime.EarlyExitException"});org.antlr.runtime.MismatchedSetException=function(B,A){org.antlr.runtime.MismatchedSetException.superclass.constructor.call(this,A);this.expecting=B;};org.antlr.lang.extend(org.antlr.runtime.MismatchedSetException,org.antlr.runtime.RecognitionException,{toString:function(){return"MismatchedSetException("+this.getUnexpectedType()+"!="+this.expecting+")";},name:"org.antlr.runtime.MismatchedSetException"});org.antlr.runtime.MismatchedNotSetException=function(B,A){org.antlr.runtime.MismatchedNotSetException.superclass.constructor.call(this,B,A);};org.antlr.lang.extend(org.antlr.runtime.MismatchedNotSetException,org.antlr.runtime.MismatchedSetException,{toString:function(){return"MismatchedNotSetException("+this.getUnexpectedType()+"!="+this.expecting+")";},name:"org.antlr.runtime.MismatchedNotSetException"});org.antlr.runtime.MismatchedRangeException=function(B,A,C){if(arguments.length===0){return this;}org.antlr.runtime.MismatchedRangeException.superclass.constructor.call(this,C);this.a=B;this.b=A;};org.antlr.lang.extend(org.antlr.runtime.MismatchedRangeException,org.antlr.runtime.RecognitionException,{toString:function(){return"MismatchedRangeException("+this.getUnexpectedType()+" not in ["+this.a+","+this.b+"])";},name:"org.antlr.runtime.MismatchedRangeException"});org.antlr.runtime.FailedPredicateException=function(A,C,B){org.antlr.runtime.FailedPredicateException.superclass.constructor.call(this,A);this.ruleName=C;this.predicateText=B;};org.antlr.lang.extend(org.antlr.runtime.FailedPredicateException,org.antlr.runtime.RecognitionException,{toString:function(){return"FailedPredicateException("+this.ruleName+",{"+this.predicateText+"}?)";},name:"org.antlr.runtime.FailedPredicateException"});org.antlr.runtime.BitSet=function(A){if(!A){A=org.antlr.runtime.BitSet.BITS;}if(org.antlr.lang.isArray(A)){this.bits=A;}else{if(org.antlr.lang.isNumber(A)){this.bits=[];}}};org.antlr.lang.augmentObject(org.antlr.runtime.BitSet,{BITS:32,LOG_BITS:5,MOD_MASK:31,bitMask:function(B){var A=B&org.antlr.runtime.BitSet.MOD_MASK;return 1<<A;},numWordsToHold:function(A){return(A>>org.antlr.runtime.BitSet.LOG_BITS)+1;},wordNumber:function(A){return A>>org.antlr.runtime.BitSet.LOG_BITS;},of:function(D,A){var B,F,C,E;if(org.antlr.lang.isNumber(D)){if(org.antlr.lang.isNumber(A)){C=new org.antlr.runtime.BitSet(A+1);for(B=D;B<=A;B++){F=org.antlr.runtime.BitSet.wordNumber(B);C.bits[F]|=org.antlr.runtime.BitSet.bitMask(B);}return C;}else{C=new org.antlr.runtime.BitSet(D+1);C.add(D);return C;}}else{if(org.antlr.lang.isArray(D)){C=new org.antlr.runtime.BitSet();for(B=D.length-1;B>=0;B--){C.add(D[B]);}return C;}else{if(D instanceof org.antlr.runtime.BitSet){if(!D){return null;}return D;}else{if(D instanceof org.antlr.runtime.IntervalSet){if(!D){return null;}C=new org.antlr.runtime.BitSet();C.addAll(D);return C;}else{if(org.antlr.lang.isObject(D)){E=[];for(B in D){if(org.antlr.lang.isNumber(B)){E.push(B);}}return org.antlr.runtime.BitSet.of(E);}}}}}}});org.antlr.runtime.BitSet.prototype={add:function(A){var B=org.antlr.runtime.BitSet.wordNumber(A);if(B>=this.bits.length){this.growToInclude(A);}this.bits[B]|=org.antlr.runtime.BitSet.bitMask(A);},addAll:function(C){var A,B,D;if(C instanceof org.antlr.runtime.BitSet){this.orInPlace(C);}else{if(C instanceof org.antlr.runtime.IntervalSet){A=C;}else{if(org.antlr.lang.isArray(C)){for(B=0;B<C.length;B++){D=C[B];this.add(D);}}else{return;}}}},and:function(A){var B=this.clone();B.andInPlace(A);return B;},andInPlace:function(A){var C=Math.min(this.bits.length,A.bits.length),B;for(B=C-1;B>=0;B--){this.bits[B]&=A.bits[B];}for(B=C;B<this.bits.length;B++){this.bits[B]=0;}},clear:function(B){if(arguments.length===0){var A;for(A=this.bits.length-1;A>=0;A--){this.bits[A]=0;}return;}var C=org.antlr.runtime.BitSet.wordNumber(B);if(C>=this.bits.length){this.growToInclude(B);}this.bits[C]&=~org.antlr.runtime.BitSet.bitMask(B);},clone:function(){var C,B,A=[];for(C=0,B=this.bits.length;C<B;C++){A[C]=this.bits[C];}return new org.antlr.runtime.BitSet(A);},size:function(){var B=0,A,C,D;for(A=this.bits.length-1;A>=0;A--){C=this.bits[A];if(C!==0){for(D=org.antlr.runtime.BitSet.BITS-1;D>=0;D--){if((C&1<<D)!==0){B++;}}}}return B;},equals:function(A){if(!A||!(A instanceof org.antlr.runtime.BitSet)){return false;}var B=A,C,D=Math.min(this.bits.length,B.bits.length);for(C=0;C<D;C++){if(this.bits[C]!=B.bits[C]){return false;}}if(this.bits.length>D){for(C=D+1;C<this.bits.length;C++){if(this.bits[C]!==0){return false;}}}else{if(B.bits.length>D){for(C=D+1;C<B.bits.length;C++){if(B.bits[C]!==0){return false;}}}}return true;},growToInclude:function(D){var A=Math.max(this.bits.length<<1,org.antlr.runtime.BitSet.numWordsToHold(D)),C=[],B;for(B=0,len=this.bits.length;B<len;B++){C[B]=this.bits[B];}this.bits=C;},member:function(A){var B=org.antlr.runtime.BitSet.wordNumber(A);if(B>=this.bits.length){return false;}return(this.bits[B]&org.antlr.runtime.BitSet.bitMask(A))!==0;},getSingleElement:function(){var A;for(A=0;A<this.bits.length<<org.antlr.runtime.BitSet.LOG_BITS;A++){if(this.member(A)){return A;}}return-1;},isNil:function(){var A;for(A=this.bits.length-1;A>=0;A--){if(this.bits[A]!==0){return false;}}return true;},complement:function(B){if(B){return B.subtract(this);}else{var A=this.clone();A.notInPlace();return A;}},notInPlace:function(){var A,D,B,C;if(arguments.length===0){for(B=this.bits.length-1;B>=0;B--){this.bits[B]=~this.bits[B];}}else{if(arguments.length===1){A=0;D=arguments[0];}else{A=arguments[0];D=arguments[1];}this.growToInclude(D);for(B=A;B<=D;B++){C=org.antlr.runtime.BitSet.wordNumber(B);this.bits[C]^=org.antlr.runtime.BitSet.bitMask(B);}}},or:function(A){if(!A){return this;}var B=this.clone();B.orInPlace(A);return B;},orInPlace:function(A){if(!A){return;}if(A.bits.length>this.bits.length){this.setSize(A.bits.length);}var C=Math.min(this.bits.length,A.bits.length),B;for(B=C-1;B>=0;B--){this.bits[B]|=A.bits[B];}},remove:function(A){var B=org.antlr.runtime.BitSet.wordNumber(A);if(B>=this.bits.length){this.growToInclude(A);}this.bits[B]&=~org.antlr.runtime.BitSet.bitMask(A);},setSize:function(A){var B=A-this.bits.length;while(B>=0){this.bits.push(0);B--;}},numBits:function(){return this.bits.length<<org.antlr.runtime.BitSet.LOG_BITS;},lengthInLongWords:function(){return this.bits.length;},subset:function(A){if(!A){return false;}return this.and(A).equals(this);},subtractInPlace:function(A){if(!A){return;}var B;for(B=0;B<this.bits.length&&B<A.bits.length;B++){this.bits[B]&=~A.bits[B];}},subtract:function(A){if(!A||!(A instanceof org.antlr.runtime.BitSet)){return null;}var B=this.clone();B.subtractInPlace(A);return B;},toArray:function(){var A=[],C,B=0;for(C=0;C<this.bits.length<<org.antlr.runtime.BitSet.LOG_BITS;C++){if(this.member(C)){A[B++]=C;}}return A;},toPackedArray:function(){return this.bits;},toString:function(){if(arguments.length===0){return this.toString1(null);}else{if(org.antlr.lang.isString(arguments[0])){if(!org.antlr.lang.isValue(arguments[1])){return this.toString1(null);}else{return this.toString2(arguments[0],arguments[1]);}}else{return this.toString1(arguments[0]);}}},toString1:function(D){var A="{",E=",",B,C=false;for(B=0;B<this.bits.length<<org.antlr.runtime.BitSet.LOG_BITS;B++){if(this.member(B)){if(B>0&&C){A+=E;}if(D){A+=D.getTokenDisplayName(B);}else{A+=B.toString();}C=true;}}return A+"}";},toString2:function(C,B){var D="",A;for(A=0;A<this.bits.length<<org.antlr.runtime.BitSet.LOG_BITS;A++){if(this.member(A)){if(D.length>0){D+=C;}if(A>=B.size()){D+="'"+A+"'";}else{if(!org.antlr.lang.isValue(B.get(A))){D+="'"+A+"'";}else{D+=B.get(A);}}}}return D;}};org.antlr.runtime.CharStream={EOF:-1};org.antlr.runtime.CommonToken=function(){var A;this.charPositionInLine=-1;this.channel=0;this.index=-1;if(arguments.length==1){if(org.antlr.lang.isNumber(arguments[0])){this.type=arguments[0];}else{A=arguments[0];this.text=A.getText();this.type=A.getType();this.line=A.getLine();this.index=A.getTokenIndex();this.charPositionInLine=A.getCharPositionInLine();this.channel=A.getChannel();if(A instanceof org.antlr.runtime.CommonToken){this.start=A.start;this.stop=A.stop;}}}else{if(arguments.length==2){this.type=arguments[0];this.text=arguments[1];this.channel=0;}else{if(arguments.length==5){this.input=arguments[0];this.type=arguments[1];this.channel=arguments[2];this.start=arguments[3];this.stop=arguments[4];}}}};org.antlr.runtime.CommonToken.prototype={getType:function(){return this.type;},setLine:function(A){this.line=A;},getText:function(){if(org.antlr.lang.isString(this.text)){return this.text;}if(!this.input){return null;}this.text=this.input.substring(this.start,this.stop);return this.text;},setText:function(A){this.text=A;},getLine:function(){return this.line;},getCharPositionInLine:function(){return this.charPositionInLine;},setCharPositionInLine:function(A){this.charPositionInLine=A;},getChannel:function(){return this.channel;},setChannel:function(A){this.channel=A;},setType:function(A){this.type=A;},getStartIndex:function(){return this.start;},setStartIndex:function(A){this.start=A;},getStopIndex:function(){return this.stop;},setStopIndex:function(A){this.stop=A;},getTokenIndex:function(){return this.index;},setTokenIndex:function(A){this.index=A;},getInputStream:function(){return this.input;},setInputStream:function(A){this.input=A;},toString:function(){var B="";if(this.channel>0){B=",channel="+this.channel;}var A=this.getText();if(!org.antlr.lang.isNull(A)){A=A.replace(/\n/g,"\\\\n");A=A.replace(/\r/g,"\\\\r");A=A.replace(/\t/g,"\\\\t");}else{A="<no text>";}return"[@"+this.getTokenIndex()+","+this.start+":"+this.stop+"='"+A+"',<"+this.type+">"+B+","+this.line+":"+this.getCharPositionInLine()+"]";}};org.antlr.runtime.Token=function(){};org.antlr.lang.augmentObject(org.antlr.runtime.Token,{EOR_TOKEN_TYPE:1,DOWN:2,UP:3,MIN_TOKEN_TYPE:4,EOF:org.antlr.runtime.CharStream.EOF,EOF_TOKEN:new org.antlr.runtime.CommonToken(org.antlr.runtime.CharStream.EOF),INVALID_TOKEN_TYPE:0,INVALID_TOKEN:new org.antlr.runtime.CommonToken(0),SKIP_TOKEN:new org.antlr.runtime.CommonToken(0),DEFAULT_CHANNEL:0,HIDDEN_CHANNEL:99});org.antlr.lang.augmentObject(org.antlr.runtime.CommonToken,org.antlr.runtime.Token);org.antlr.runtime.tree.RewriteCardinalityException=function(A){this.elementDescription=A;};org.antlr.lang.extend(org.antlr.runtime.tree.RewriteCardinalityException,Error,{getMessage:function(){if(org.antlr.lang.isString(this.elementDescription)){return this.elementDescription;}return null;},name:function(){return"org.antlr.runtime.tree.RewriteCardinalityException";}});org.antlr.runtime.tree.RewriteEmptyStreamException=function(B){var A=org.antlr.runtime.tree.RewriteEmptyStreamException.superclass;A.constructor.call(this,B);};org.antlr.lang.extend(org.antlr.runtime.tree.RewriteEmptyStreamException,org.antlr.runtime.tree.RewriteCardinalityException,{name:function(){return"org.antlr.runtime.tree.RewriteEmptyStreamException";}});org.antlr.runtime.tree.RewriteEarlyExitException=function(B){var A=org.antlr.runtime.tree.RewriteEarlyExitException.superclass;if(org.antlr.lang.isUndefined(B)){B=null;}A.constructor.call(this,B);};org.antlr.lang.extend(org.antlr.runtime.tree.RewriteEarlyExitException,org.antlr.runtime.tree.RewriteCardinalityException,{name:function(){return"org.antlr.runtime.tree.RewriteEarlyExitException";}});org.antlr.runtime.MismatchedTreeNodeException=function(B,A){if(B&&A){org.antlr.runtime.MismatchedTreeNodeException.superclass.constructor.call(this,A);this.expecting=B;}};org.antlr.lang.extend(org.antlr.runtime.MismatchedTreeNodeException,org.antlr.runtime.RecognitionException,{toString:function(){return"MismatchedTreeNodeException("+this.getUnexpectedType()+"!="+this.expecting+")";},name:"org.antlr.runtime.MismatchedTreeNodeException"});org.antlr.runtime.tree.BaseTree=function(){};org.antlr.runtime.tree.BaseTree.prototype={getChild:function(A){if(!this.children||A>=this.children.length){return null;}return this.children[A];},getChildren:function(){return this.children;},getFirstChildWithType:function(C){var B,A;for(B=0;this.children&&B<this.children.length;B++){A=this.children[B];if(A.getType()===C){return A;}}return null;},getChildCount:function(){if(!this.children){return 0;}return this.children.length;},addChild:function(B){if(!org.antlr.lang.isValue(B)){return;}var C=B,E,A,D;if(C.isNil()){if(this.children&&this.children==C.children){throw new Error("attempt to add child list to itself");}if(C.children){if(this.children){E=C.children.length;for(A=0;A<E;A++){D=C.children[A];this.children.push(D);D.setParent(this);D.setChildIndex(this.children.length-1);}}else{this.children=C.children;this.freshenParentAndChildIndexes();}}}else{if(!this.children){this.children=this.createChildrenList();}this.children.push(B);C.setParent(this);C.setChildIndex(this.children.length-1);}},addChildren:function(A){var C,B;for(C=0;C<A.length;C++){B=A[C];this.addChild(B);}},setChild:function(B,A){if(!A){return;}if(A.isNil()){throw new Error("Can't set single child to a list");}if(!this.children){this.children=this.createChildrenList();}this.children[B]=A;A.setParent(this);A.setChildIndex(B);},deleteChild:function(B){if(!this.children){return null;}if(B<0||B>=this.children.length){throw new Error("Index out of bounds.");}var A=this.children.splice(B,1)[0];this.freshenParentAndChildIndexes(B);return A;},replaceChildren:function(H,I,P){if(!this.children){throw new Error("indexes invalid; no children in list");}var O=I-H+1;var A;var K=P;var D=null;if(K.isNil()){D=K.children;}else{D=[];D.push(K);}A=D.length;var B=D.length;var N=O-A;var F,G,C,E,M,J,L;if(N===0){F=0;for(G=H;G<=I;G++){C=D[F];this.children[G]=C;C.setParent(this);C.setChildIndex(G);F++;}}else{if(N>0){for(F=0;F<B;F++){this.children[H+F]=D[F];}E=H+B;for(M=E;M<=I;M++){J=this.children.splice(E,1)[0];}this.freshenParentAndChildIndexes(H);}else{for(F=0;F<O;F++){this.children[H+F]=D[F];}L=A-O;for(F=O;F<A;F++){this.children.splice(H+F,0,D[F]);}this.freshenParentAndChildIndexes(H);}}},createChildrenList:function(){return[];},isNil:function(){return false;},freshenParentAndChildIndexes:function(A){if(!org.antlr.lang.isNumber(A)){A=0;}var D=this.getChildCount(),C,B;for(C=A;C<D;C++){B=this.getChild(C);B.setChildIndex(C);B.setParent(this);}},sanityCheckParentAndChildIndexes:function(B,A){if(arguments.length===0){B=null;A=-1;}if(B!==this.getParent()){throw new Error("parents don't match; expected "+B+" found "+this.getParent());}if(A!==this.getChildIndex()){throw new Error("child indexes don't match; expected "+A+" found "+this.getChildIndex());}var E=this.getChildCount(),D,C;for(D=0;D<E;D++){C=this.getChild(D);C.sanityCheckParentAndChildIndexes(this,D);}},getChildIndex:function(){return 0;},setChildIndex:function(A){},getParent:function(){return null;},setParent:function(A){},getTree:function(){return this;},toStringTree:function(){if(!this.children||this.children.length===0){return this.toString();}var A="",C,B;if(!this.isNil()){A+="(";A+=this.toString();A+=" ";}for(C=0;this.children&&C<this.children.length;C++){B=this.children[C];if(C>0){A+=" ";}A+=B.toStringTree();}if(!this.isNil()){A+=")";}return A;},getLine:function(){return 0;},getCharPositionInLine:function(){return 0;}};org.antlr.runtime.tree.CommonTree=function(A){this.startIndex=-1;this.stopIndex=-1;this.childIndex=-1;this.parent=null;this.token=null;if(A instanceof org.antlr.runtime.tree.CommonTree){org.antlr.runtime.tree.CommonTree.superclass.constructor.call(this,A);this.token=A.token;this.startIndex=A.startIndex;this.stopIndex=A.stopIndex;}else{if(A instanceof org.antlr.runtime.CommonToken){this.token=A;}}};org.antlr.lang.extend(org.antlr.runtime.tree.CommonTree,org.antlr.runtime.tree.BaseTree,{getToken:function(){return this.token;},dupNode:function(){return new org.antlr.runtime.tree.CommonTree(this);},isNil:function(){return!this.token;},getType:function(){if(!this.token){return org.antlr.runtime.Token.INVALID_TOKEN_TYPE;}return this.token.getType();},getText:function(){if(!this.token){return null;}return this.token.getText();},getLine:function(){if(!this.token||this.token.getLine()===0){if(this.getChildCount()>0){return this.getChild(0).getLine();}return 0;}return this.token.getLine();},getCharPositionInLine:function(){if(!this.token||this.token.getCharPositionInLine()===-1){if(this.getChildCount()>0){return this.getChild(0).getCharPositionInLine();}return 0;}return this.token.getCharPositionInLine();},getTokenStartIndex:function(){if(this.token){return this.token.getTokenIndex();}return this.startIndex;},setTokenStartIndex:function(A){this.startIndex=A;},getTokenStopIndex:function(){if(this.token){return this.token.getTokenIndex();}return this.stopIndex;},setTokenStopIndex:function(A){this.stopIndex=A;},getChildIndex:function(){return this.childIndex;},getParent:function(){return this.parent;},setParent:function(A){this.parent=A;},setChildIndex:function(A){this.childIndex=A;},toString:function(){if(this.isNil()){return"nil";}if(this.getType()===org.antlr.runtime.Token.INVALID_TOKEN_TYPE){return"<errornode>";}if(!this.token){return null;}return this.token.getText();}});org.antlr.runtime.tree.Tree={INVALID_NODE:new org.antlr.runtime.tree.CommonTree(org.antlr.runtime.Token.INVALID_TOKEN)};org.antlr.runtime.tree.CommonErrorNode=function(A,D,B,C){if(!B||B.getTokenIndex()<D.getTokenIndex()&&B.getType()!=org.antlr.runtime.Token.EOF){B=D;}this.input=A;this.start=D;this.stop=B;this.trappedException=C;};org.antlr.lang.extend(org.antlr.runtime.tree.CommonErrorNode,org.antlr.runtime.tree.CommonTree,{isNil:function(){return false;},getType:function(){return org.antlr.runtime.Token.INVALID_TOKEN_TYPE;},getText:function(){var C=null;if(this.start instanceof org.antlr.runtime.CommonToken){var B=this.start.getTokenIndex();var A=this.stop.getTokenIndex();if(this.stop.getType()===org.antlr.runtime.Token.EOF){A=this.input.size();}C=this.input.toString(B,A);}else{if(this.start instanceof org.antlr.runtime.tree.CommonTree){C=this.input.toString(this.start,this.stop);}else{C="<unknown>";}}return C;},toString:function(){if(this.trappedException instanceof org.antlr.runtime.MissingTokenException){return"<missing type: "+this.trappedException.getMissingType()+">";}else{if(this.trappedException instanceof org.antlr.runtime.UnwantedTokenException){return"<extraneous: "+this.trappedException.getUnexpectedToken()+", resync="+this.getText()+">";}else{if(this.trappedException instanceof org.antlr.runtime.MismatchedTokenException){return"<mismatched token: "+this.trappedException.token+", resync="+this.getText()+">";}else{if(this.trappedException instanceof org.antlr.runtime.NoViableAltException){return"<unexpected: "+this.trappedException.token+", resync="+this.getText()+">";}}}}return"<error: "+this.getText()+">";}});org.antlr.runtime.tree.BaseTreeAdaptor=function(){this.uniqueNodeID=1;};org.antlr.runtime.tree.BaseTreeAdaptor.prototype={nil:function(){return this.create(null);},errorNode:function(A,E,C,D){var B=new org.antlr.runtime.tree.CommonErrorNode(A,E,C,D);return B;},isNil:function(A){return A.isNil();},dupTree:function(B,C){if(arguments.length===1){C=null;}if(!B){return null;}var D=this.dupNode(B);this.setChildIndex(D,this.getChildIndex(B));this.setParent(D,C);var G=this.getChildCount(B),A,F,E;for(A=0;A<G;A++){F=this.getChild(B,A);E=this.dupTree(F,B);this.addChild(D,E);}return D;},addChild:function(A,B){if(A&&org.antlr.lang.isValue(B)){A.addChild(B);}},becomeRoot:function(D,C){if(D instanceof org.antlr.runtime.CommonToken||!D){D=this.create(D);}var A=D,B=C;if(!C){return D;}if(A.isNil()){if(A.getChildCount()>1){throw new Error("more than one node as root (TODO: make exception hierarchy)");}A=A.getChild(0);}A.addChild(B);return A;},rulePostProcessing:function(A){var B=A;if(B&&B.isNil()){if(B.getChildCount()===0){B=null;}else{if(B.getChildCount()===1){B=B.getChild(0);B.setParent(null);B.setChildIndex(-1);}}}return B;},create:function(C,B){var D,A;if(arguments.length===2){if(org.antlr.lang.isString(arguments[1])){D=arguments[1];B=this.createToken(C,D);A=this.create(B);return A;}else{B=this.createToken(B);B.setType(C);A=this.create(B);return A;}}else{if(arguments.length===3){D=arguments[2];B=this.createToken(B);B.setType(C);B.setText(D);A=this.create(B);return A;}}},getType:function(A){A.getType();return 0;},setType:function(A,B){throw new Error("don't know enough about Tree node");},getText:function(A){return A.getText();},setText:function(A,B){throw new Error("don't know enough about Tree node");},getChild:function(B,A){return B.getChild(A);},setChild:function(B,A,C){B.setChild(A,C);},deleteChild:function(B,A){return B.deleteChild(A);},getChildCount:function(A){return A.getChildCount();},getUniqueID:function(B){if(!this.treeToUniqueIDMap){this.treeToUniqueIDMap={};}var C=this.treeToUniqueIDMap[B];if(org.antlr.lang.isValue(C)){return C;}var A=this.uniqueNodeID;this.treeToUniqueIDMap[B]=A;this.uniqueNodeID++;return A;}};org.antlr.runtime.tree.CommonTreeAdaptor=function(){};org.antlr.lang.extend(org.antlr.runtime.tree.CommonTreeAdaptor,org.antlr.runtime.tree.BaseTreeAdaptor,{dupNode:function(A){if(!org.antlr.lang.isValue(A)){return null;}return A.dupNode();},create:function(A){if(arguments.length>1){return org.antlr.runtime.tree.CommonTreeAdaptor.superclass.create.apply(this,arguments);}return new org.antlr.runtime.tree.CommonTree(A);},createToken:function(A){if(arguments.length===2){return new org.antlr.runtime.CommonToken(arguments[0],arguments[1]);}else{return new org.antlr.runtime.CommonToken(arguments[0]);}},setTokenBoundaries:function(C,E,A){if(!org.antlr.lang.isValue(C)){return;}var D=0,B=0;if(org.antlr.lang.isValue(E)){if(E.getTokenIndex){D=E.getTokenIndex();}else{if(E.getStartIndex){D=E.getStartIndex();}else{D=E.getTokenStartIndex();}}}if(org.antlr.lang.isValue(A)){if(B.getTokenIndex){B=A.getTokenIndex();}else{if(A.getStopIndex){B=A.getStopIndex();}else{B=A.getTokenStopIndex();}}}C.setTokenStartIndex(D);C.setTokenStopIndex(B);},getTokenStartIndex:function(A){if(!A){return-1;}return A.getTokenStartIndex();},getTokenStopIndex:function(A){if(!A){return-1;}return A.getTokenStopIndex();},getText:function(A){if(!A){return null;}return A.getText();},getType:function(A){if(!A){return org.antlr.runtime.Token.INVALID_TOKEN_TYPE;}return A.getType();},getToken:function(A){if(A instanceof org.antlr.runtime.tree.CommonTree){return A.getToken();}return null;},getChild:function(B,A){if(!B){return null;}return B.getChild(A);},getChildCount:function(A){if(!A){return 0;}return A.getChildCount();},getParent:function(A){return A.getParent();},setParent:function(A,B){A.setParent(B);},getChildIndex:function(A){return A.getChildIndex();},setChildIndex:function(B,A){B.setChildIndex(A);},replaceChildren:function(D,B,A,C){if(D){D.replaceChildren(B,A,C);}}});org.antlr.runtime.ANTLRStringStream=function(A){this.p=0;this.line=1;this.charPositionInLine=0;this.markDepth=0;this.markers=null;this.lastMarker=null;this.data=A;this.n=A.length;};org.antlr.runtime.ANTLRStringStream.prototype={reset:function(){this.p=0;this.line=1;this.charPositionInLine=0;this.markDepth=0;},consume:function(){if(this.p<this.n){this.charPositionInLine++;if(this.data.charAt(this.p)==="\n"){this.line++;this.charPositionInLine=0;}this.p++;}},LA:function(B){if(B<0){B++;}var A=this.p+B-1;if(A>=this.n||A<0){return org.antlr.runtime.CharStream.EOF;}return this.data.charAt(A);},index:function(){return this.p;},size:function(){return this.n;},mark:function(){if(!this.markers){this.markers=[];this.markers.push(null);}this.markDepth++;var A=null;if(this.markDepth>=this.markers.length){A={};this.markers.push(A);}else{A=this.markers[this.markDepth];}A.p=this.p;A.line=this.line;A.charPositionInLine=this.charPositionInLine;this.lastMarker=this.markDepth;return this.markDepth;},rewind:function(A){if(!org.antlr.lang.isNumber(A)){A=this.lastMarker;}var B=this.markers[A];this.seek(B.p);this.line=B.line;this.charPositionInLine=B.charPositionInLine;this.release(A);},release:function(A){this.markDepth=A;this.markDepth--;},seek:function(A){if(A<=this.p){this.p=A;return;}while(this.p<A){this.consume();}},substring:function(B,A){return this.data.substr(B,A-B+1);},getLine:function(){return this.line;},getCharPositionInLine:function(){return this.charPositionInLine;},setLine:function(A){this.line=A;},setCharPositionInLine:function(A){this.charPositionInLine=A;},getSourceName:function(){return null;}};org.antlr.runtime.ANTLRStringStream.LT=org.antlr.runtime.ANTLRStringStream.LA;org.antlr.runtime.CommonTokenStream=function(A,B){this.p=-1;this.channel=org.antlr.runtime.Token.DEFAULT_CHANNEL;this.v_discardOffChannelTokens=false;this.tokens=[];if(arguments.length>=2){this.channel=B;}else{if(arguments.length===1){this.tokenSource=A;}}};org.antlr.runtime.CommonTokenStream.prototype={setTokenSource:function(A){this.tokenSource=A;this.tokens=[];this.p=-1;this.channel=org.antlr.runtime.Token.DEFAULT_CHANNEL;},fillBuffer:function(){var B=0,C=this.tokenSource.nextToken(),A,D;while(org.antlr.lang.isValue(C)&&C.getType()!=org.antlr.runtime.CharStream.EOF){A=false;if(this.channelOverrideMap){D=this.channelOverrideMap[C.getType()];if(org.antlr.lang.isValue(D)){C.setChannel(D);}}if(this.discardSet&&this.discardSet[C.getType()]){A=true;}else{if(this.v_discardOffChannelTokens&&C.getChannel()!=this.channel){A=true;}}if(!A){C.setTokenIndex(B);this.tokens.push(C);B++;}C=this.tokenSource.nextToken();}this.p=0;this.p=this.skipOffTokenChannels(this.p);},consume:function(){if(this.p<this.tokens.length){this.p++;this.p=this.skipOffTokenChannels(this.p);}},skipOffTokenChannels:function(A){var B=this.tokens.length;while(A<B&&this.tokens[A].getChannel()!=this.channel){A++;}return A;},skipOffTokenChannelsReverse:function(A){while(A>=0&&this.tokens[A].getChannel()!=this.channel){A--;}return A;},setTokenTypeChannel:function(B,A){if(!this.channelOverrideMap){this.channelOverrideMap={};}this.channelOverrideMap[B]=A;},discardTokenType:function(A){if(!this.discardSet){this.discardSet={};}this.discardSet[A]=true;},discardOffChannelTokens:function(A){this.v_discardOffChannelTokens=A;},getTokens:function(F,D,C){if(this.p===-1){this.fillBuffer();}if(arguments.length===0){return this.tokens;}if(org.antlr.lang.isArray(C)){C=new org.antlr.runtime.BitSet(C);}else{if(org.antlr.lang.isNumber(C)){C=org.antlr.runtime.BitSet.of(C);}}if(D>=this.tokens.length){D=this.tokens.length-1;}if(F<0){F=0;}if(F>D){return null;}var E=[],B,A;for(B=F;B<=D;B++){A=this.tokens[B];if(!this.types||C.member(A.getType())){E.push(A);}}if(E.length===0){E=null;}return E;},LT:function(A){if(this.p===-1){this.fillBuffer();}if(A===0){return null;}if(A<0){return this.LB(-1*A);}if(this.p+A-1>=this.tokens.length){return org.antlr.runtime.Token.EOF_TOKEN;}var B=this.p,C=1;while(C<A){B=this.skipOffTokenChannels(B+1);C++;}if(B>=this.tokens.length){return org.antlr.runtime.Token.EOF_TOKEN;}return this.tokens[B];},LB:function(A){if(this.p===-1){this.fillBuffer();}if(A===0){return null;}if(this.p-A<0){return null;}var B=this.p,C=1;while(C<=A){B=this.skipOffTokenChannelsReverse(B-1);C++;}if(B<0){return null;}return this.tokens[B];},get:function(A){return this.tokens[A];},LA:function(A){return this.LT(A).getType();},mark:function(){if(this.p===-1){this.fillBuffer();}this.lastMarker=this.index();return this.lastMarker;},release:function(A){},size:function(){return this.tokens.length;},index:function(){return this.p;},rewind:function(A){if(!org.antlr.lang.isNumber(A)){A=this.lastMarker;}this.seek(A);},reset:function(){this.p=-1;this.lastMarker=0;},seek:function(A){this.p=A;},getTokenSource:function(){return this.tokenSource;},getSourceName:function(){return this.getTokenSource().getSourceName();},toString:function(D,C){if(arguments.length===0){if(this.p===-1){this.fillBuffer();}D=0;C=this.tokens.length-1;}if(!org.antlr.lang.isNumber(D)&&!org.antlr.lang.isNumber(C)){if(org.antlr.lang.isValue(D)&&org.antlr.lang.isValue(C)){D=D.getTokenIndex();C=C.getTokenIndex();}else{return null;}}var A="",B;if(D<0||C<0){return null;}if(this.p==-1){this.fillBuffer();}if(C>=this.tokens.length){C=this.tokens.length-1;}for(B=D;B<=C;B++){t=this.tokens[B];A=A+this.tokens[B].getText();}return A;}};org.antlr.runtime.TokenRewriteStream=function(){var A=org.antlr.runtime.TokenRewriteStream.superclass;this.programs=null;this.lastRewriteTokenIndexes=null;if(arguments.length===0){this.init();}else{A.constructor.apply(this,arguments);this.init();}};(function(){var A=org.antlr.runtime.TokenRewriteStream;org.antlr.lang.augmentObject(A,{DEFAULT_PROGRAM_NAME:"default",PROGRAM_INIT_SIZE:100,MIN_TOKEN_INDEX:0});A.RewriteOperation=function(B,C){this.index=B;this.text=C;};A.RewriteOperation.prototype={execute:function(B){return this.index;},toString:function(){return this.text;}};A.InsertBeforeOp=function(B,C){A.InsertBeforeOp.superclass.constructor.call(this,B,C);};org.antlr.lang.extend(A.InsertBeforeOp,A.RewriteOperation,{execute:function(B){B.push(this.text);return this.index;}});A.ReplaceOp=function(D,C,B){A.ReplaceOp.superclass.constructor.call(this,D,B);this.lastIndex=C;};org.antlr.lang.extend(A.ReplaceOp,A.RewriteOperation,{execute:function(B){if(org.antlr.lang.isValue(this.text)){B.push(this.text);}return this.lastIndex+1;}});A.DeleteOp=function(C,B){A.DeleteOp.superclass.constructor.call(this,C,B);};org.antlr.lang.extend(A.DeleteOp,A.ReplaceOp);org.antlr.lang.extend(A,org.antlr.runtime.CommonTokenStream,{init:function(){this.programs={};this.programs[A.DEFAULT_PROGRAM_NAME]=[];this.lastRewriteTokenIndexes={};},rollback:function(){var B,C;if(arguments.length===1){B=A.DEFAULT_PROGRAM_NAME;C=arguments[0];}else{if(arguments.length===2){B=arguments[0];C=arguments[1];}}var D=this.programs[B];if(D){programs[B]=D.slice(A.MIN_TOKEN_INDEX,this.instructionIndex);}},deleteProgram:function(B){B=B||A.DEFAULT_PROGRAM_NAME;this.rollback(B,A.MIN_TOKEN_INDEX);},addToSortedRewriteList:function(){var H,E;if(arguments.length===1){H=A.DEFAULT_PROGRAM_NAME;E=arguments[0];}else{if(arguments.length===2){H=arguments[0];E=arguments[1];}}var F=this.getProgram(H);var G,I,D,J,B,C;for(I=0,G=F.length;I<G;I++){D=F[I];if(D.index===E.index){if(E instanceof A.ReplaceOp){J=false;for(C=I;C<F.length;C++){B=F[I];if(B.index!==E.index){break;}if(B instanceof A.ReplaceOp){F[I]=E;J=true;break;}}if(!J){F.splice(C,0,E);}}else{F.splice(I,0,E);}break;}else{if(D.index>E.index){F.splice(I,0,E);break;}}}if(I===G){F.push(E);}},insertAfter:function(){var C,B,D;if(arguments.length===2){B=A.DEFAULT_PROGRAM_NAME;C=arguments[0];D=arguments[1];}else{if(arguments.length===3){B=arguments[0];C=arguments[1];D=arguments[2];}}if(C instanceof org.antlr.runtime.CommonToken){C=C.index;}this.insertBefore(B,C+1,D);},insertBefore:function(){var C,B,D;if(arguments.length===2){B=A.DEFAULT_PROGRAM_NAME;C=arguments[0];D=arguments[1];}else{if(arguments.length===3){B=arguments[0];C=arguments[1];D=arguments[2];}}if(C instanceof org.antlr.runtime.CommonToken){C=C.index;}this.addToSortedRewriteList(B,new A.InsertBeforeOp(C,D));},replace:function(){var B,E,C,D;if(arguments.length===2){B=A.DEFAULT_PROGRAM_NAME;E=arguments[0];C=arguments[0];D=arguments[1];}else{if(arguments.length===3){B=A.DEFAULT_PROGRAM_NAME;E=arguments[0];C=arguments[1];D=arguments[2];}}if(arguments.length===4){B=arguments[0];E=arguments[1];C=arguments[2];D=arguments[3];}if(E instanceof org.antlr.runtime.CommonToken){E=E.index;}if(C instanceof org.antlr.runtime.CommonToken){C=C.index;}if(E>C||C<0||E<0){return;}this.addToSortedRewriteList(B,new A.ReplaceOp(E,C,D));},remove:function(){var B=[],C=arguments.length-1;while(C>=0){B[C]=arguments[C];C--;}B.push("");this.replace.apply(this,B);},getLastRewriteTokenIndex:function(B){B=B||A.DEFAULT_PROGRAM_NAME;return this.lastRewriteTokenIndexes[B]||-1;},setLastRewriteTokenIndex:function(B,C){this.lastRewriteTokenIndexes[B]=C;},getProgram:function(B){var C=this.programs[B];if(!C){C=this.initializeProgram(B);}return C;},initializeProgram:function(B){var C=[];this.programs[B]=C;return C;},toOriginalString:function(E,B){if(!org.antlr.lang.isNumber(E)){E=A.MIN_TOKEN_INDEX;}if(!org.antlr.lang.isNumber(B)){B=this.size()-1;}var C=[],D;for(D=E;D>=A.MIN_TOKEN_INDEX&&D<=B&&D<this.tokens.length;D++){C.push(this.get(D).getText());}return C.join("");},toString:function(){var J,B,F;if(arguments.length===0){J=A.DEFAULT_PROGRAM_NAME;B=A.MIN_TOKEN_INDEX;F=this.size()-1;}else{if(arguments.length===1){J=arguments[0];B=A.MIN_TOKEN_INDEX;F=this.size()-1;}else{if(arguments.length===2){J=A.DEFAULT_PROGRAM_NAME;B=arguments[0];F=arguments[1];}}}var H=this.programs[J];if(!H||H.length===0){return this.toOriginalString(B,F);}var E=0,D=B,C=[],G;while(D>=A.MIN_TOKEN_INDEX&&D<=F&&D<this.tokens.length){if(E<H.length){G=H[E];while(G.index<D&&E<H.length){E++;if(E<H.length){G=H[E];}}while(D===G.index&&E<H.length){D=G.execute(C);E++;if(E<H.length){G=H[E];}}}if(D<=F){C.push(this.get(D).getText());D++;}}var I;for(I=E;I<H.length;I++){G=H[I];if(G.index>=this.size()){G.execute(C);}}return C.join("");},toDebugString:function(E,B){if(!org.antlr.lang.isNumber(E)){E=A.MIN_TOKEN_INDEX;}if(!org.antlr.lang.isNumber(B)){B=this.size()-1;}var C=[],D;for(D=E;D>=A.MIN_TOKEN_INDEX&&D<=B&&D<this.tokens.length;D++){C.push(this.get(D));}return C.join("");}});})();org.antlr.runtime.tree.TreeNodeStream=function(){};org.antlr.runtime.tree.CommonTreeNodeStream=function(D,A,B){if(arguments.length===1){A=D;D=new org.antlr.runtime.tree.CommonTreeAdaptor();}if(arguments.length<=2){B=org.antlr.runtime.tree.CommonTreeNodeStream.DEFAULT_INITIAL_BUFFER_SIZE;}this.uniqueNavigationNodes=false;this.p=-1;var C=org.antlr.runtime.Token;this.root=A;this.adaptor=D;this.nodes=[];this.down=this.adaptor.create(C.DOWN,"DOWN");this.up=this.adaptor.create(C.UP,"UP");this.eof=this.adaptor.create(C.EOF,"EOF");};org.antlr.lang.augmentObject(org.antlr.runtime.tree.CommonTreeNodeStream,{DEFAULT_INITIAL_BUFFER_SIZE:100,INITIAL_CALL_STACK_SIZE:10});org.antlr.lang.extend(org.antlr.runtime.tree.CommonTreeNodeStream,org.antlr.runtime.tree.TreeNodeStream,{StreamIterator:function(){var C=0,B=this.nodes,A=this.eof;return{hasNext:function(){return C<B.length;},next:function(){var D=C;C++;if(D<B.length){return B[D];}return A;},remove:function(){throw new Error("cannot remove nodes from stream");}};},fillBuffer:function(C){var B=false;if(org.antlr.lang.isUndefined(C)){C=this.root;B=true;}var A=this.adaptor.isNil(C);if(!A){this.nodes.push(C);}var F=this.adaptor.getChildCount(C);if(!A&&F>0){this.addNavigationNode(org.antlr.runtime.Token.DOWN);}var E,D;for(E=0;E<F;E++){D=this.adaptor.getChild(C,E);this.fillBuffer(D);}if(!A&&F>0){this.addNavigationNode(org.antlr.runtime.Token.UP);}if(B){this.p=0;}},getNodeIndex:function(C){if(this.p==-1){this.fillBuffer();}var B,A;for(B=0;B<this.nodes.length;B++){A=this.nodes[B];if(A===C){return B;}}return-1;},addNavigationNode:function(B){var A=null;if(B===org.antlr.runtime.Token.DOWN){if(this.hasUniqueNavigationNodes()){A=this.adaptor.create(org.antlr.runtime.Token.DOWN,"DOWN");}else{A=this.down;}}else{if(this.hasUniqueNavigationNodes()){A=this.adaptor.create(org.antlr.runtime.Token.UP,"UP");}else{A=this.up;}}this.nodes.push(A);},get:function(A){if(this.p===-1){this.fillBuffer();}return this.nodes[A];},LT:function(A){if(this.p===-1){this.fillBuffer();}if(A===0){return null;}if(A<0){return this.LB(-1*A);}if(this.p+A-1>=this.nodes.length){return this.eof;}return this.nodes[this.p+A-1];},getCurrentSymbol:function(){return this.LT(1);},LB:function(A){if(A===0){return null;}if(this.p-A<0){return null;}return this.nodes[this.p-A];},getTreeSource:function(){return this.root;},getSourceName:function(){return this.getTokenStream().getSourceName();},getTokenStream:function(){return this.tokens;},setTokenStream:function(A){this.tokens=A;},getTreeAdaptor:function(){return this.adaptor;},setTreeAdaptor:function(A){this.adaptor=A;},hasUniqueNavigationNodes:function(){return this.uniqueNavigationNodes;},setUniqueNavigationNodes:function(A){this.uniqueNavigationNodes=A;},consume:function(){if(this.p===-1){this.fillBuffer();}this.p++;},LA:function(A){return this.adaptor.getType(this.LT(A));},mark:function(){if(this.p===-1){this.fillBuffer();}this.lastMarker=this.index();return this.lastMarker;},release:function(A){},index:function(){return this.p;},rewind:function(A){if(!org.antlr.lang.isNumber(A)){A=this.lastMarker;}this.seek(A);},seek:function(A){if(this.p===-1){this.fillBuffer();}this.p=A;},push:function(A){if(!this.calls){this.calls=[];}this.calls.push(this.p);this.seek(A);},pop:function(){var A=this.calls.pop();this.seek(A);return A;},reset:function(){this.p=-1;this.lastMarker=0;if(this.calls){this.calls=[];}},size:function(){if(this.p===-1){this.fillBuffer();}return this.nodes.length;},iterator:function(){if(this.p===-1){this.fillBuffer();}return this.StreamIterator();},replaceChildren:function(D,B,A,C){if(D){this.adaptor.replaceChildren(D,B,A,C);}},toTokenString:function(E,D){if(this.p===-1){this.fillBuffer();}var A="",C,B;for(C=E;C<this.nodes.length&&C<=D;C++){B=this.nodes[C];A+=" "+this.adaptor.getToken(B);}return A;},toString:function(H,D){var A="",E,C,B;if(arguments.length===0){if(this.p===-1){this.fillBuffer();}for(B=0;B<this.nodes.length;B++){C=this.nodes[B];A+=" ";A+=this.adaptor.getType(C);}return A;}else{if(!org.antlr.lang.isNumber(H)||!org.antlr.lang.isNumber(D)){return null;}if(this.p===-1){this.fillBuffer();}if(H instanceof org.antlr.runtime.tree.CommonTree){}else{}if(D instanceof org.antlr.runtime.tree.CommonTree){}else{}var G,F;if(this.tokens){G=this.adaptor.getTokenStartIndex(H);F=this.adaptor.getTokenStopIndex(D);if(this.adaptor.getType(D)===org.antlr.runtime.Token.UP){F=this.adaptor.getTokenStopIndex(H);}else{if(this.adaptor.getType(D)==org.antlr.runtime.Token.EOF){F=this.size()-2;}}return this.tokens.toString(G,F);}C=null;B=0;for(;B<this.nodes.length;B++){C=this.nodes[B];if(C===H){break;}}A=E="";C=this.nodes[B];while(C!==D){E=this.adaptor.getText(C);if(!org.antlr.lang.isString(E)){E=" "+this.adaptor.getType(C).toString();}A+=E;B++;C=nodes[B];}E=this.adaptor.getText(D);if(!org.antlr.lang.isString(E)){E=" "+this.adaptor.getType(D).toString();}A+=E;return A;}}});org.antlr.runtime.tree.RewriteRuleElementStream=function(C,B,A){this.cursor=0;this.dirty=false;this.elementDescription=B;this.adaptor=C;if(A){if(org.antlr.lang.isArray(A)){this.singleElement=null;this.elements=A;}else{this.add(A);}}};org.antlr.runtime.tree.RewriteRuleElementStream.prototype={reset:function(){this.cursor=0;this.dirty=true;},add:function(A){if(!org.antlr.lang.isValue(A)){return;}if(this.elements){this.elements.push(A);return;}if(!org.antlr.lang.isValue(this.singleElement)){this.singleElement=A;return;}this.elements=[];this.elements.push(this.singleElement);this.singleElement=null;this.elements.push(A);},nextTree:function(){var B=this.size(),A;if(this.dirty||this.cursor>=B&&B==1){A=this._next();return this.dup(A);}A=this._next();return A;},_next:function(){var B=this.size();if(B===0){throw new org.antlr.runtime.tree.RewriteEmptyStreamException(this.elementDescription);}if(this.cursor>=B){if(B===1){return this.toTree(this.singleElement);}throw new org.antlr.runtime.tree.RewriteCardinalityException(this.elementDescription);}if(org.antlr.lang.isValue(this.singleElement)){this.cursor++;return this.toTree(this.singleElement);}var A=this.toTree(this.elements[this.cursor]);this.cursor++;return A;},toTree:function(A){if(A&&A.getTree){return A.getTree();}return A;},hasNext:function(){return org.antlr.lang.isValue(this.singleElement)&&this.cursor<1||this.elements&&this.cursor<this.elements.length;},size:function(){var A=0;if(org.antlr.lang.isValue(this.singleElement)){A=1;}if(this.elements){return this.elements.length;}return A;},getDescription:function(){return this.elementDescription;}};org.antlr.runtime.tree.RewriteRuleNodeStream=function(C,B,A){org.antlr.runtime.tree.RewriteRuleNodeStream.superclass.constructor.apply(this,arguments);};org.antlr.lang.extend(org.antlr.runtime.tree.RewriteRuleNodeStream,org.antlr.runtime.tree.RewriteRuleElementStream,{nextNode:function(){return this._next();},toTree:function(A){return this.adaptor.dupNode(A);},dup:function(){throw new Error("dup can't be called for a node stream.");}});org.antlr.runtime.tree.RewriteRuleTokenStream=function(D,C,B){var A=org.antlr.runtime.tree.RewriteRuleTokenStream.superclass;A.constructor.apply(this,arguments);};org.antlr.lang.extend(org.antlr.runtime.tree.RewriteRuleTokenStream,org.antlr.runtime.tree.RewriteRuleElementStream,{nextNode:function(){var A=this._next();return this.adaptor.create(A);},nextToken:function(){return this._next();},toTree:function(A){return A;},dup:function(A){throw new Error("dup can't be called for a token stream.");}});org.antlr.runtime.tree.RewriteRuleSubtreeStream=function(){var A=org.antlr.runtime.tree.RewriteRuleSubtreeStream.superclass;A.constructor.apply(this,arguments);};org.antlr.lang.extend(org.antlr.runtime.tree.RewriteRuleSubtreeStream,org.antlr.runtime.tree.RewriteRuleElementStream,{nextNode:function(){var B=this.size(),A;if(this.dirty||this.cursor>=B&&B===1){A=this._next();return this.adaptor.dupNode(A);}A=this._next();return A;},dup:function(A){return this.adaptor.dupTree(A);}});org.antlr.runtime.BaseRecognizer=function(A){this.state=A||new org.antlr.runtime.RecognizerSharedState();};org.antlr.lang.augmentObject(org.antlr.runtime.BaseRecognizer,{MEMO_RULE_FAILED:-2,MEMO_RULE_UNKNOWN:-1,INITIAL_FOLLOW_STACK_SIZE:100,MEMO_RULE_FAILED_I:-2,DEFAULT_TOKEN_CHANNEL:org.antlr.runtime.Token.DEFAULT_CHANNEL,HIDDEN:org.antlr.runtime.Token.HIDDEN_CHANNEL,NEXT_TOKEN_RULE_NAME:"nextToken"});org.antlr.runtime.BaseRecognizer.prototype={reset:function(){var B,A;if(!this.state){return;}this.state._fsp=-1;this.state.errorRecovery=false;this.state.lastErrorIndex=-1;this.state.failed=false;this.state.syntaxErrors=0;this.state.backtracking=0;if(this.state.ruleMemo){for(B=0,A=this.state.ruleMemo.length;B<A;B++){this.state.ruleMemo[B]=null;}}},match:function(B,D,A){var C=this.getCurrentInputSymbol(B);if(B.LA(1)===D){B.consume();this.state.errorRecovery=false;this.state.failed=false;return C;}if(this.state.backtracking>0){this.state.failed=true;return C;}C=this.recoverFromMismatchedToken(B,D,A);return C;},matchAny:function(A){this.state.errorRecovery=false;this.state.failed=false;A.consume();},mismatchIsUnwantedToken:function(A,B){return A.LA(2)===B;},mismatchIsMissingToken:function(C,A){if(!A){return false;}if(A.member(org.antlr.runtime.Token.EOR_TOKEN_TYPE)){if(this.state._fsp>=0){A.remove(org.antlr.runtime.Token.EOR_TOKEN_TYPE);}var B=this.computeContextSensitiveRuleFOLLOW();A=A.or(this.viableTokensFollowingThisRule);}if(A.member(C.LA(1))||A.member(org.antlr.runtime.Token.EOR_TOKEN_TYPE)){return true;}return false;},mismatch:function(B,C,A){if(this.mismatchIsUnwantedToken(B,C)){throw new org.antlr.runtime.UnwantedTokenException(C,B);}else{if(this.mismatchIsMissingToken(B,A)){throw new org.antlr.runtime.MissingTokenException(C,B,null);}}throw new org.antlr.runtime.MismatchedTokenException(C,B);},reportError:function(A){if(this.state.errorRecovery){return;}this.state.syntaxErrors++;this.state.errorRecovery=true;this.displayRecognitionError(this.getTokenNames(),A);},displayRecognitionError:function(A,B){var D=this.getErrorHeader(B),C=this.getErrorMessage(B,A);this.emitErrorMessage(D+" "+C);},getErrorHeader:function(A){if(!org.antlr.lang.isNumber(A.line)){A.line=0;}return"line "+A.line+":"+A.charPositionInLine;},emitErrorMessage:function(A){if(typeof window!="undefined"&&window.alert){alert(A);}else{print(A);}},getErrorMessage:function(E,D){var F=E&&E.getMessage?E.getMessage():null,A,C;if(E instanceof org.antlr.runtime.UnwantedTokenException){var B=E;C="<unknown>";if(B.expecting==org.antlr.runtime.Token.EOF){C="EOF";}else{C=D[B.expecting];}F="extraneous input "+this.getTokenErrorDisplay(B.getUnexpectedToken())+" expecting "+C;}else{if(E instanceof org.antlr.runtime.MissingTokenException){A=E;C="<unknown>";if(A.expecting==org.antlr.runtime.Token.EOF){C="EOF";}else{C=D[A.expecting];}F="missing "+C+" at "+this.getTokenErrorDisplay(E.token);}else{if(E instanceof org.antlr.runtime.MismatchedTokenException){A=E;C="<unknown>";if(A.expecting==org.antlr.runtime.Token.EOF){C="EOF";}else{C=D[A.expecting];}F="mismatched input "+this.getTokenErrorDisplay(E.token)+" expecting "+C;}else{if(E instanceof org.antlr.runtime.NoViableAltException){F="no viable alternative at input "+this.getTokenErrorDisplay(E.token);}else{if(E instanceof org.antlr.runtime.EarlyExitException){F="required (...)+ loop did not match anything at input "+this.getTokenErrorDisplay(E.token);}else{if(E instanceof org.antlr.runtime.MismatchedSetException){F="mismatched input "+this.getTokenErrorDisplay(E.token)+" expecting set "+E.expecting;}else{if(E instanceof org.antlr.runtime.MismatchedNotSetException){F="mismatched input "+this.getTokenErrorDisplay(E.token)+" expecting set "+E.expecting;}else{if(E instanceof org.antlr.runtime.FailedPredicateException){F="rule "+E.ruleName+" failed predicate: {"+E.predicateText+"}?";}}}}}}}}return F;},getNumberOfSyntaxErrors:function(){return this.state.syntaxErrors;},getTokenErrorDisplay:function(A){var B=A.getText();if(!org.antlr.lang.isValue(B)){if(A.getType()==org.antlr.runtime.Token.EOF){B="<EOF>";}else{B="<"+A.getType()+">";}}B=B.replace(/\n/g,"\\n");B=B.replace(/\r/g,"\\r");B=B.replace(/\t/g,"\\t");return"'"+B+"'";},recover:function(A,B){if(this.state.lastErrorIndex==A.index()){A.consume();}this.state.lastErrorIndex=A.index();var C=this.computeErrorRecoverySet();this.beginResync();this.consumeUntil(A,C);this.endResync();},beginResync:function(){},endResync:function(){},computeErrorRecoverySet:function(){return this.combineFollows(false);},computeContextSensitiveRuleFOLLOW:function(){return this.combineFollows(true);},combineFollows:function(C){var E=this.state._fsp,B,A,D=new org.antlr.runtime.BitSet();for(B=E;B>=0;B--){A=this.state.following[B];D.orInPlace(A);if(C){if(A.member(org.antlr.runtime.Token.EOR_TOKEN_TYPE)){if(B>0){D.remove(org.antlr.runtime.Token.EOR_TOKEN_TYPE);}}else{break;}}}return D;},recoverFromMismatchedToken:function(B,F,A){var E=null;if(this.mismatchIsUnwantedToken(B,F)){E=new org.antlr.runtime.UnwantedTokenException(F,B);this.beginResync();B.consume();this.endResync();this.reportError(E);var D=this.getCurrentInputSymbol(B);B.consume();return D;}if(this.mismatchIsMissingToken(B,A)){var C=this.getMissingSymbol(B,E,F,A);E=new org.antlr.runtime.MissingTokenException(F,B,C);this.reportError(E);return C;}E=new org.antlr.runtime.MismatchedTokenException(F,B);throw E;},recoverFromMismatchedSet:function(B,C,A){if(this.mismatchIsMissingToken(B,A)){this.reportError(C);return this.getMissingSymbol(B,C,org.antlr.runtime.Token.INVALID_TOKEN_TYPE,A);}throw C;},getCurrentInputSymbol:function(A){return null;},getMissingSymbol:function(B,D,C,A){return null;},consumeUntil:function(A,C){var B=A.LA(1);while(B!=org.antlr.runtime.Token.EOF&&!C.member(B)){A.consume();B=A.LA(1);}},pushFollow:function(A){if(this.state._fsp+1>=this.state.following.length){var C=[];var B;for(B=this.state.following.length-1;B>=0;B--){C[B]=this.state.following[B];}this.state.following=C;}this.state._fsp++;this.state.following[this.state._fsp]=A;},getRuleInvocationStack:function(B,A){throw new Error("Not implemented.");},getBacktrackingLevel:function(){return this.state.backtracking;},getTokenNames:function(){return null;},getGrammarFileName:function(){return null;},toStrings:function(C){if(!C){return null;}var A=[];var B;for(B=0;B<C.length;B++){A.push(C[B].getText());}return A;},getRuleMemoization:function(B,A){if(!this.state.ruleMemo[B]){this.state.ruleMemo[B]={};}var C=this.state.ruleMemo[B][A];if(!org.antlr.lang.isNumber(C)){return org.antlr.runtime.BaseRecognizer.MEMO_RULE_UNKNOWN;}return C;},alreadyParsedRule:function(B,C){var A=this.getRuleMemoization(C,B.index());if(A==org.antlr.runtime.BaseRecognizer.MEMO_RULE_UNKNOWN){return false;}if(A==org.antlr.runtime.BaseRecognizer.MEMO_RULE_FAILED){this.state.failed=true;}else{B.seek(A+1);}return true;},memoize:function(C,D,B){var A=this.state.failed?org.antlr.runtime.BaseRecognizer.MEMO_RULE_FAILED:C.index()-1;if(!org.antlr.lang.isValue(this.state.ruleMemo)){throw new Error("!!!!!!!!! memo array is null for "+this.getGrammarFileName());}if(D>=this.state.ruleMemo.length){throw new Error("!!!!!!!!! memo size is "+this.state.ruleMemo.length+", but rule index is "+D);}if(org.antlr.lang.isValue(this.state.ruleMemo[D])){this.state.ruleMemo[D][B]=A;}},getRuleMemoizationCacheSize:function(){var C=0,A;for(A=0;this.state.ruleMemo&&A<this.state.ruleMemo.length;A++){var B=this.state.ruleMemo[A];if(B){C+=B.length;}}return C;},traceIn:function(C,B,A){this.emitErrorMessage("enter "+C+" "+A);if(this.state.failed){this.emitErrorMessage(" failed="+this.failed);}if(this.state.backtracking>0){this.emitErrorMessage(" backtracking="+this.state.backtracking);}},traceOut:function(C,B,A){this.emitErrorMessage("exit "+C+" "+A);if(this.state.failed){this.emitErrorMessage(" failed="+this.state.failed);}if(this.state.backtracking>0){this.emitErrorMessage(" backtracking="+this.state.backtracking);}}};org.antlr.runtime.Lexer=function(A,B){if(B){org.antlr.runtime.Lexer.superclass.constructor.call(this,B);}if(A){this.input=A;}};org.antlr.lang.extend(org.antlr.runtime.Lexer,org.antlr.runtime.BaseRecognizer,{reset:function(){org.antlr.runtime.Lexer.superclass.reset.call(this);if(org.antlr.lang.isValue(this.input)){this.input.seek(0);}if(!org.antlr.lang.isValue(this.state)){return;}this.state.token=null;this.state.type=org.antlr.runtime.Token.INVALID_TOKEN_TYPE;this.state.channel=org.antlr.runtime.Token.DEFAULT_CHANNEL;this.state.tokenStartCharIndex=-1;this.state.tokenStartCharPositionInLine=-1;this.state.tokenStartLine=-1;this.state.text=null;},nextToken:function(){while(true){this.state.token=null;this.state.channel=org.antlr.runtime.Token.DEFAULT_CHANNEL;this.state.tokenStartCharIndex=this.input.index();this.state.tokenStartCharPositionInLine=this.input.getCharPositionInLine();this.state.tokenStartLine=this.input.getLine();this.state.text=null;if(this.input.LA(1)===org.antlr.runtime.CharStream.EOF){return org.antlr.runtime.Token.EOF_TOKEN;}try{this.mTokens();if(!org.antlr.lang.isValue(this.state.token)){this.emit();}else{if(this.state.token==org.antlr.runtime.Token.SKIP_TOKEN){continue;}}return this.state.token;}catch(A){if(A instanceof org.antlr.runtime.RecognitionException){this.reportError(A);}else{if(A instanceof org.antlr.runtime.NoViableAltException){this.reportError(A);this.recover(A);}else{throw A;}}}}},skip:function(){this.state.token=org.antlr.runtime.Token.SKIP_TOKEN;},setCharStream:function(A){this.input=null;this.reset();this.input=A;},getCharStream:function(){return this.input;},getSourceName:function(){return this.input.getSourceName();},emit:function(){if(arguments.length===0){var A=new org.antlr.runtime.CommonToken(this.input,this.state.type,this.state.channel,this.state.tokenStartCharIndex,this.getCharIndex()-1);A.setLine(this.state.tokenStartLine);A.setText(this.state.text);A.setCharPositionInLine(this.state.tokenStartCharPositionInLine);this.state.token=A;return A;}else{this.state.token=arguments[0];}},match:function(C){var B=0,A;if(org.antlr.lang.isString(C)){while(B<C.length){if(this.input.LA(1)!=C.charAt(B)){if(this.state.backtracking>0){this.state.failed=true;return;}A=new org.antlr.runtime.MismatchedTokenException(C.charAt(B),this.input);this.recover(A);throw A;}B++;this.input.consume();this.state.failed=false;}}else{if(org.antlr.lang.isNumber(C)){if(this.input.LA(1)!=C){if(this.state.backtracking>0){this.state.failed=true;return;}A=new org.antlr.runtime.MismatchedTokenException(C,this.input);this.recover(A);throw A;}this.input.consume();this.state.failed=false;}}},matchAny:function(){this.input.consume();},matchRange:function(B,A){if(this.input.LA(1)<B||this.input.LA(1)>A){if(this.state.backtracking>0){this.state.failed=true;return;}mre=new org.antlr.runtime.MismatchedRangeException(B,A,this.input);this.recover(mre);throw mre;}this.input.consume();this.state.failed=false;},getLine:function(){return this.input.getLine();},getCharPositionInLine:function(){return this.input.getCharPositionInLine();},getCharIndex:function(){return this.input.index();},getText:function(){if(org.antlr.lang.isString(this.state.text)){return this.state.text;}return this.input.substring(this.state.tokenStartCharIndex,this.getCharIndex()-1);},setText:function(A){this.state.text=A;},reportError:function(A){this.displayRecognitionError(this.getTokenNames(),A);},getErrorMessage:function(B,A){var C=null;if(B instanceof org.antlr.runtime.MismatchedTokenException){C="mismatched character "+this.getCharErrorDisplay(B.c)+" expecting "+this.getCharErrorDisplay(B.expecting);}else{if(B instanceof org.antlr.runtime.NoViableAltException){C="no viable alternative at character "+this.getCharErrorDisplay(B.c);}else{if(B instanceof org.antlr.runtime.EarlyExitException){C="required (...)+ loop did not match anything at character "+this.getCharErrorDisplay(B.c);}else{if(B instanceof org.antlr.runtime.MismatchedNotSetException){C="mismatched character "+this.getCharErrorDisplay(B.c)+" expecting set "+B.expecting;}else{if(B instanceof org.antlr.runtime.MismatchedSetException){C="mismatched character "+this.getCharErrorDisplay(B.c)+" expecting set "+B.expecting;}else{if(B instanceof org.antlr.runtime.MismatchedRangeException){C="mismatched character "+this.getCharErrorDisplay(B.c)+" expecting set "+this.getCharErrorDisplay(B.a)+".."+this.getCharErrorDisplay(B.b);}else{C=org.antlr.runtime.Lexer.superclass.getErrorMessage.call(this,B,A);}}}}}}return C;},getCharErrorDisplay:function(B){var A=B;switch(A){case org.antlr.runtime.Token.EOF:A="<EOF>";break;case"\n":A="\\n";break;case"\t":A="\\t";break;case"\r":A="\\r";break;}return"'"+A+"'";},recover:function(A){this.input.consume();},traceIn:function(C,B){var A=String.fromCharCode(this.input.LT(1))+" line="+this.getLine()+":"+this.getCharPositionInLine();org.antlr.runtime.Lexer.superclass.traceIn.call(this,C,B,A);},traceOut:function(C,B){var A=String.fromCharCode(this.input.LT(1))+" line="+this.getLine()+":"+this.getCharPositionInLine();org.antlr.runtime.Lexer.superclass.traceOut.call(this,C,B,A);}});org.antlr.runtime.ParserRuleReturnScope=function(){};org.antlr.runtime.ParserRuleReturnScope.prototype={getStart:function(){return this.start;},getStop:function(){return this.stop;}};org.antlr.runtime.tree.TreeRuleReturnScope=function(){};org.antlr.runtime.tree.TreeRuleReturnScope.prototype={getStart:function(){return this.start;}};org.antlr.runtime.Parser=function(A,B){org.antlr.runtime.Parser.superclass.constructor.call(this,B);this.setTokenStream(A);};org.antlr.lang.extend(org.antlr.runtime.Parser,org.antlr.runtime.BaseRecognizer,{reset:function(){org.antlr.runtime.Parser.superclass.reset.call(this);if(org.antlr.lang.isValue(this.input)){this.input.seek(0);}},getCurrentInputSymbol:function(A){return A.LT(1);},getMissingSymbol:function(C,G,E,A){var B="<missing "+this.getTokenNames()[E]+">";var D=new org.antlr.runtime.CommonToken(E,B);var F=C.LT(1);var H;if(F.getType()===org.antlr.runtime.Token.EOF){H=F;F=C.LT(-1);if(!F){F=H;}}D.line=F.getLine();D.charPositionInLine=F.getCharPositionInLine();D.channel=org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;return D;},setTokenStream:function(A){this.input=null;this.reset();this.input=A;},getTokenStream:function(){return this.input;},getSourceName:function(){return this.input.getSourceName();},traceIn:function(B,A){org.antlr.runtime.Parser.superclass.traceIn.call(this,B,A,this.input.LT(1));},traceOut:function(B,A){org.antlr.runtime.Parser.superclass.traceOut.call(this,B,A,this.input.LT(1));}});org.antlr.runtime.DFA=function(){};org.antlr.runtime.DFA.prototype={predict:function(C){var F=C.mark(),D=0,B,E,A;try{while(true){B=this.special[D];if(B>=0){D=this.specialStateTransition(B,C);if(D===-1){this.noViableAlt(D,C);return 0;}C.consume();continue;}if(this.accept[D]>=1){return this.accept[D];}E=C.LA(1);if(E===org.antlr.runtime.Token.EOF){E=-1;}else{if(org.antlr.lang.isString(E)){E=E.charCodeAt(0);}}if(E>=this.min[D]&&E<=this.max[D]){A=this.transition[D][E-this.min[D]];if(A<0){if(this.eot[D]>=0){D=this.eot[D];C.consume();continue;}this.noViableAlt(D,C);return 0;}D=A;C.consume();continue;}if(this.eot[D]>=0){D=this.eot[D];C.consume();continue;}if(E==org.antlr.runtime.Token.EOF&&this.eof[D]>=0){return this.accept[this.eof[D]];}this.noViableAlt(D,C);return 0;}}finally{C.rewind(F);}},noViableAlt:function(C,A){if(this.recognizer.state.backtracking>0){this.recognizer.state.failed=true;return;}var B=new org.antlr.runtime.NoViableAltException(this.getDescription(),this.decisionNumber,C,A);this.error(B);throw B;},error:function(A){},specialStateTransition:function(B,A){return-1;},getDescription:function(){return"n/a";}};org.antlr.lang.augmentObject(org.antlr.runtime.DFA,{unpackEncodedString:function(D){var C,F=[],E=0,G,A,B;for(C=0;C<D.length;C+=2){G=D.charCodeAt(C);A=D.charCodeAt(C+1);if(A===65535){A=-1;}for(B=1;B<=G;B++){F[E++]=A;}}return F;},unpackEncodedStringToUnsignedChars:function(A){return org.antlr.runtime.DFA.unpackEncodedString(A);}});org.antlr.runtime.tree.TreeParser=function(A){org.antlr.runtime.tree.TreeParser.superclass.constructor.call(this,arguments[1]);this.setTreeNodeStream(A);};(function(){var A=org.antlr.runtime.tree.TreeParser;org.antlr.lang.augmentObject(A,{DOWN:org.antlr.runtime.Token.DOWN,UP:org.antlr.runtime.Token.UP});org.antlr.lang.extend(A,org.antlr.runtime.BaseRecognizer,{reset:function(){A.superclass.reset.call(this);if(this.input){this.input.seek(0);}},setTreeNodeStream:function(B){this.input=B;},getTreeNodeStream:function(){return this.input;},getSourceName:function(){return this.input.getSourceName();},getCurrentInputSymbol:function(B){return B.LT(1);},getMissingSymbol:function(D,F,E,B){var C="<missing "+this.getTokenNames()[E]+">";return new org.antlr.runtime.tree.CommonTree(new org.antlr.runtime.CommonToken(E,C));},matchAny:function(E){this.state.errorRecovery=false;this.state.failed=false;var B=this.input.LT(1);if(this.input.getTreeAdaptor().getChildCount(B)===0){this.input.consume();return;}var D=0,C=this.input.getTreeAdaptor().getType(B);while(C!==org.antlr.runtime.Token.EOF&&!(C===A.UP&&D===0)){this.input.consume();B=this.input.LT(1);C=this.input.getTreeAdaptor().getType(B);if(C===A.DOWN){D++;}else{if(C===A.UP){D--;}}}this.input.consume();},mismatch:function(C,D,B){throw new org.antlr.runtime.MismatchedTreeNodeException(D,C);},getErrorHeader:function(B){return this.getGrammarFileName()+": node from "+(B.approximateLineInfo?"after ":"")+"line "+B.line+":"+B.charPositionInLine;},getErrorMessage:function(C,B){var D;if(this instanceof A){D=C.input.getTreeAdaptor();C.token=D.getToken(C.node);if(!org.antlr.lang.isValue(C.token)){C.token=new org.antlr.runtime.CommonToken(D.getType(C.node),D.getText(C.node));}}return A.superclass.getErrorMessage.call(this,C,B);},traceIn:function(C,B){A.superclass.traceIn.call(this,C,B,this.input.LT(1));},traceOut:function(C,B){A.superclass.traceOut.call(this,C,B,this.input.LT(1));}});})();// -------- Ham4Parser.js --------
// $ANTLR 3.3 Nov 30, 2010 12:50:56 Ham4Parser.g 2022-05-19 22:32:18
// Parser header: Start
// Logger enhanced when run from HtoG Tool
var H4PLogger=this.getCWAEnv().get("Logger").get("SiGML");// Parser header: End
var Ham4Parser=function(input,state){if(!state){state=new org.antlr.runtime.RecognizerSharedState();}(function(){// Parser members
var errorCount=0;var errorString="";this.reportError=function(ex){if(typeof H4PLogger.warn==="function")H4PLogger.warn("Parsing Error: "+ex);var pfx=errorCount==0?"":"\n";errorCount++;errorString+=pfx+"["+ex+"]";};this.trace=function(str){if(typeof H4PLogger.trace==="function")H4PLogger.trace(str);};this.checkErrors=function(){if(errorCount==0)return null;else return{errCount:errorCount,errText:errorString};};// //########  BEGIN GENERATED CODE  ########
}).call(this);Ham4Parser.superclass.constructor.call(this,input,state);this.dfa13=new Ham4Parser.DFA13(this);this.dfa14=new Ham4Parser.DFA14(this);this.dfa16=new Ham4Parser.DFA16(this);this.dfa15=new Ham4Parser.DFA15(this);this.dfa18=new Ham4Parser.DFA18(this);this.dfa21=new Ham4Parser.DFA21(this);this.dfa25=new Ham4Parser.DFA25(this);this.dfa23=new Ham4Parser.DFA23(this);this.dfa26=new Ham4Parser.DFA26(this);this.dfa33=new Ham4Parser.DFA33(this);this.dfa34=new Ham4Parser.DFA34(this);this.dfa35=new Ham4Parser.DFA35(this);this.dfa36=new Ham4Parser.DFA36(this);this.dfa49=new Ham4Parser.DFA49(this);this.dfa54=new Ham4Parser.DFA54(this);this.dfa56=new Ham4Parser.DFA56(this);this.dfa57=new Ham4Parser.DFA57(this);this.dfa58=new Ham4Parser.DFA58(this);this.dfa59=new Ham4Parser.DFA59(this);this.dfa60=new Ham4Parser.DFA60(this);this.dfa61=new Ham4Parser.DFA61(this);this.dfa92=new Ham4Parser.DFA92(this);this.dfa93=new Ham4Parser.DFA93(this);this.dfa95=new Ham4Parser.DFA95(this);this.dfa98=new Ham4Parser.DFA98(this);this.dfa97=new Ham4Parser.DFA97(this);this.dfa96=new Ham4Parser.DFA96(this);this.dfa102=new Ham4Parser.DFA102(this);this.dfa103=new Ham4Parser.DFA103(this);this.dfa104=new Ham4Parser.DFA104(this);this.dfa105=new Ham4Parser.DFA105(this);this.dfa106=new Ham4Parser.DFA106(this);this.dfa107=new Ham4Parser.DFA107(this);this.dfa108=new Ham4Parser.DFA108(this);this.dfa111=new Ham4Parser.DFA111(this);this.dfa109=new Ham4Parser.DFA109(this);this.dfa110=new Ham4Parser.DFA110(this);this.dfa112=new Ham4Parser.DFA112(this);this.dfa113=new Ham4Parser.DFA113(this);this.dfa114=new Ham4Parser.DFA114(this);this.dfa115=new Ham4Parser.DFA115(this);this.dfa116=new Ham4Parser.DFA116(this);this.dfa127=new Ham4Parser.DFA127(this);this.dfa128=new Ham4Parser.DFA128(this);this.dfa129=new Ham4Parser.DFA129(this);this.dfa130=new Ham4Parser.DFA130(this);this.dfa131=new Ham4Parser.DFA131(this);this.dfa132=new Ham4Parser.DFA132(this);this.dfa133=new Ham4Parser.DFA133(this);this.dfa134=new Ham4Parser.DFA134(this);this.dfa136=new Ham4Parser.DFA136(this);this.dfa137=new Ham4Parser.DFA137(this);this.dfa157=new Ham4Parser.DFA157(this);this.dfa171=new Ham4Parser.DFA171(this);this.dfa173=new Ham4Parser.DFA173(this);this.dfa180=new Ham4Parser.DFA180(this);this.dfa181=new Ham4Parser.DFA181(this);this.dfa182=new Ham4Parser.DFA182(this);/* @todo only create adaptor if output=AST */this.adaptor=new org.antlr.runtime.tree.CommonTreeAdaptor();};org.antlr.lang.augmentObject(Ham4Parser,{EOF:-1,WS:4,HamTab:5,HamLinefeed:6,HamPagebreak:7,HamReturn:8,HamVersion40:9,HamSpace:10,HamExclaim:11,HamQuery:12,HamFullstop:13,HamComma:14,HamPlus:15,HamMetaalt:16,HamClocku:17,HamClockul:18,HamClockl:19,HamClockdl:20,HamClockd:21,HamClockdr:22,HamClockr:23,HamClockur:24,HamClockfull:25,HamSymmpar:26,HamSymmlr:27,HamFist:28,HamFlathand:29,HamFinger2:30,HamFinger23:31,HamFinger23spread:32,HamFinger2345:33,HamThumboutmod:34,HamThumbacrossmod:35,HamPinch12:36,HamPinchall:37,HamPinch12open:38,HamCee12:39,HamCeeall:40,HamCee12open:41,HamThumbopenmod:42,HamFingerstraightmod:43,HamFingerbendmod:44,HamFingerhookedmod:45,HamNondominant:46,HamDoublebent:47,HamDoublehooked:48,HamExtfingeru:49,HamExtfingerur:50,HamExtfingerr:51,HamExtfingerdr:52,HamExtfingerd:53,HamExtfingerdl:54,HamExtfingerl:55,HamExtfingerul:56,HamExtfingerol:57,HamExtfingero:58,HamExtfingeror:59,HamExtfingeril:60,HamExtfingeri:61,HamExtfingerir:62,HamExtfingerui:63,HamExtfingerdi:64,HamExtfingerdo:65,HamExtfingeruo:66,HamEarlobe:67,HamNostrils:68,HamShouldertop:69,HamPalmu:70,HamPalmur:71,HamPalmr:72,HamPalmdr:73,HamPalmd:74,HamPalmdl:75,HamPalml:76,HamPalmul:77,HamReplace:78,HamArmextended:79,HamBehind:80,HamEtc:81,HamOrirelative:82,HamTongue:83,HamTeeth:84,HamStomach:85,HamNeutralspace:86,HamHead:87,HamHeadtop:88,HamForehead:89,HamEyebrows:90,HamEyes:91,HamNose:92,HamEar:93,HamCheek:94,HamLips:95,HamChin:96,HamUnderchin:97,HamNeck:98,HamShoulders:99,HamChest:100,HamBelowstomach:101,HamLrbeside:102,HamLrat:103,HamUpperarm:104,HamElbow:105,HamElbowinside:106,HamLowerarm:107,HamWristback:108,HamWristpulse:109,HamThumbball:110,HamPalm:111,HamHandback:112,HamThumb:113,HamIndexfinger:114,HamMiddlefinger:115,HamRingfinger:116,HamPinky:117,HamThumbside:118,HamPinkyside:119,HamBetween:120,HamFingertip:121,HamFingernail:122,HamFingerpad:123,HamFingermidjoint:124,HamFingerbase:125,HamFingerside:126,HamWristtopulse:127,HamWristtoback:128,HamWristtothumb:129,HamWristtopinky:130,HamCoreftag:131,HamCorefref:132,HamNomotion:133,HamMoveu:134,HamMoveur:135,HamMover:136,HamMovedr:137,HamMoved:138,HamMovedl:139,HamMovel:140,HamMoveul:141,HamMoveol:142,HamMoveo:143,HamMoveor:144,HamMoveil:145,HamMovei:146,HamMoveir:147,HamMoveui:148,HamMovedi:149,HamMovedo:150,HamMoveuo:151,HamMovecross:152,HamMovex:153,HamSmallmod:154,HamLargemod:155,HamArcl:156,HamArcu:157,HamArcr:158,HamArcd:159,HamWavy:160,HamZigzag:161,HamFingerplay:162,HamParbegin:163,HamParend:164,HamCircleo:165,HamCirclei:166,HamCircled:167,HamCircleu:168,HamCirclel:169,HamCircler:170,HamIncreasing:171,HamDecreasing:172,HamClose:173,HamTouch:174,HamInterlock:175,HamCross:176,HamFast:177,HamSlow:178,HamTense:179,HamRest:180,HamHalt:181,HamRepeatfromstart:182,HamRepeatfromstartseveral:183,HamRepeatcontinue:184,HamRepeatcontinueseveral:185,HamSeqbegin:186,HamSeqend:187,HamAlternatingmotion:188,HamRepeatreverse:189,HamBrushing:190,HamNonipsi:191,HamEllipseh:192,HamEllipseur:193,HamEllipsev:194,HamEllipseul:195,HamMime:196,HamAltbegin:197,HamAltend:198,HamNodding:199,HamSwinging:200,HamTwisting:201,HamStircw:202,HamStirccw:203,HamFusionbegin:204,HamFusionend:205,HamCircleul:206,HamCircledr:207,HamCircleur:208,HamCircledl:209,HamCircleol:210,HamCircleir:211,HamCircleor:212,HamCircleil:213,HamCircledo:214,HamCircleui:215,HamCircledi:216,HamCircleuo:217,HamNbs:218,HAMSIGNS:219,SIGN2:220,SIGN1:221,ICFG2:222,ICFG1:223,NMICLIST:224,NMICUNIT:225,MICFG2:226,MICFG1:227,HDCONFIG2:228,HDCONFIG1:229,SPLITHDCFG2:230,HDCFGTAIL2:231,HSHAPE2:232,HSHAPE1:233,BASICHDSHP1:234,BASICHDSHP:235,HSCLASS:236,FIBENDING:237,THUMBPOS:238,FINGERLIST:239,FISHPLIST:240,FICRSSLIST:241,FSHAPE:242,FCROSSING:243,THSPECIAL:244,EXTFIDIR2:245,EXTFIDIR1:246,EXTFIDIR:247,PALMOR2:248,PALMOR1:249,LOC2:250,LOC1:251,LOCTNBODYARM:252,LOCTNBODY:253,LOCTNHAND:254,LOCTNARM:255,LEVBODY:256,LEVHAND:257,LEVARM:258,HCONSTLLN:259,CNTCTBODY:260,CNTCTHAND:261,CNTCTOFHAND:262,A2TLIST:263,A1TLIST:264,A1LIST:265,ACTION2T:266,ACTION1T:267,ACTION2:268,ACTION1:269,PARACT2T:270,SEQACT2T:271,SPLITACT2LOC2:272,SPLITACT2T:273,PARACT1T:274,SEQACT1T:275,NMACT1T:276,PARACT1:277,REPETITIONS:278,SIMPLEMVMT:279,STRGHTMVMT:280,CRCLRMVMT:281,REPLACE:282,SPLITREPLACETL:283,REPLACETAIL1:284,HSFINGERITEM:285,LOCBODY:286,MOVINGREPETITION:287,SEQACT1:288,SEQFUSEDACT2T:289,SEQFUSEDACT1T:290,SEQFUSEDACT1:291,CNTCTOHHAND:292,CNTCTOHARM:293});(function(){// public class variables
var EOF=-1,WS=4,HamTab=5,HamLinefeed=6,HamPagebreak=7,HamReturn=8,HamVersion40=9,HamSpace=10,HamExclaim=11,HamQuery=12,HamFullstop=13,HamComma=14,HamPlus=15,HamMetaalt=16,HamClocku=17,HamClockul=18,HamClockl=19,HamClockdl=20,HamClockd=21,HamClockdr=22,HamClockr=23,HamClockur=24,HamClockfull=25,HamSymmpar=26,HamSymmlr=27,HamFist=28,HamFlathand=29,HamFinger2=30,HamFinger23=31,HamFinger23spread=32,HamFinger2345=33,HamThumboutmod=34,HamThumbacrossmod=35,HamPinch12=36,HamPinchall=37,HamPinch12open=38,HamCee12=39,HamCeeall=40,HamCee12open=41,HamThumbopenmod=42,HamFingerstraightmod=43,HamFingerbendmod=44,HamFingerhookedmod=45,HamNondominant=46,HamDoublebent=47,HamDoublehooked=48,HamExtfingeru=49,HamExtfingerur=50,HamExtfingerr=51,HamExtfingerdr=52,HamExtfingerd=53,HamExtfingerdl=54,HamExtfingerl=55,HamExtfingerul=56,HamExtfingerol=57,HamExtfingero=58,HamExtfingeror=59,HamExtfingeril=60,HamExtfingeri=61,HamExtfingerir=62,HamExtfingerui=63,HamExtfingerdi=64,HamExtfingerdo=65,HamExtfingeruo=66,HamEarlobe=67,HamNostrils=68,HamShouldertop=69,HamPalmu=70,HamPalmur=71,HamPalmr=72,HamPalmdr=73,HamPalmd=74,HamPalmdl=75,HamPalml=76,HamPalmul=77,HamReplace=78,HamArmextended=79,HamBehind=80,HamEtc=81,HamOrirelative=82,HamTongue=83,HamTeeth=84,HamStomach=85,HamNeutralspace=86,HamHead=87,HamHeadtop=88,HamForehead=89,HamEyebrows=90,HamEyes=91,HamNose=92,HamEar=93,HamCheek=94,HamLips=95,HamChin=96,HamUnderchin=97,HamNeck=98,HamShoulders=99,HamChest=100,HamBelowstomach=101,HamLrbeside=102,HamLrat=103,HamUpperarm=104,HamElbow=105,HamElbowinside=106,HamLowerarm=107,HamWristback=108,HamWristpulse=109,HamThumbball=110,HamPalm=111,HamHandback=112,HamThumb=113,HamIndexfinger=114,HamMiddlefinger=115,HamRingfinger=116,HamPinky=117,HamThumbside=118,HamPinkyside=119,HamBetween=120,HamFingertip=121,HamFingernail=122,HamFingerpad=123,HamFingermidjoint=124,HamFingerbase=125,HamFingerside=126,HamWristtopulse=127,HamWristtoback=128,HamWristtothumb=129,HamWristtopinky=130,HamCoreftag=131,HamCorefref=132,HamNomotion=133,HamMoveu=134,HamMoveur=135,HamMover=136,HamMovedr=137,HamMoved=138,HamMovedl=139,HamMovel=140,HamMoveul=141,HamMoveol=142,HamMoveo=143,HamMoveor=144,HamMoveil=145,HamMovei=146,HamMoveir=147,HamMoveui=148,HamMovedi=149,HamMovedo=150,HamMoveuo=151,HamMovecross=152,HamMovex=153,HamSmallmod=154,HamLargemod=155,HamArcl=156,HamArcu=157,HamArcr=158,HamArcd=159,HamWavy=160,HamZigzag=161,HamFingerplay=162,HamParbegin=163,HamParend=164,HamCircleo=165,HamCirclei=166,HamCircled=167,HamCircleu=168,HamCirclel=169,HamCircler=170,HamIncreasing=171,HamDecreasing=172,HamClose=173,HamTouch=174,HamInterlock=175,HamCross=176,HamFast=177,HamSlow=178,HamTense=179,HamRest=180,HamHalt=181,HamRepeatfromstart=182,HamRepeatfromstartseveral=183,HamRepeatcontinue=184,HamRepeatcontinueseveral=185,HamSeqbegin=186,HamSeqend=187,HamAlternatingmotion=188,HamRepeatreverse=189,HamBrushing=190,HamNonipsi=191,HamEllipseh=192,HamEllipseur=193,HamEllipsev=194,HamEllipseul=195,HamMime=196,HamAltbegin=197,HamAltend=198,HamNodding=199,HamSwinging=200,HamTwisting=201,HamStircw=202,HamStirccw=203,HamFusionbegin=204,HamFusionend=205,HamCircleul=206,HamCircledr=207,HamCircleur=208,HamCircledl=209,HamCircleol=210,HamCircleir=211,HamCircleor=212,HamCircleil=213,HamCircledo=214,HamCircleui=215,HamCircledi=216,HamCircleuo=217,HamNbs=218,HAMSIGNS=219,SIGN2=220,SIGN1=221,ICFG2=222,ICFG1=223,NMICLIST=224,NMICUNIT=225,MICFG2=226,MICFG1=227,HDCONFIG2=228,HDCONFIG1=229,SPLITHDCFG2=230,HDCFGTAIL2=231,HSHAPE2=232,HSHAPE1=233,BASICHDSHP1=234,BASICHDSHP=235,HSCLASS=236,FIBENDING=237,THUMBPOS=238,FINGERLIST=239,FISHPLIST=240,FICRSSLIST=241,FSHAPE=242,FCROSSING=243,THSPECIAL=244,EXTFIDIR2=245,EXTFIDIR1=246,EXTFIDIR=247,PALMOR2=248,PALMOR1=249,LOC2=250,LOC1=251,LOCTNBODYARM=252,LOCTNBODY=253,LOCTNHAND=254,LOCTNARM=255,LEVBODY=256,LEVHAND=257,LEVARM=258,HCONSTLLN=259,CNTCTBODY=260,CNTCTHAND=261,CNTCTOFHAND=262,A2TLIST=263,A1TLIST=264,A1LIST=265,ACTION2T=266,ACTION1T=267,ACTION2=268,ACTION1=269,PARACT2T=270,SEQACT2T=271,SPLITACT2LOC2=272,SPLITACT2T=273,PARACT1T=274,SEQACT1T=275,NMACT1T=276,PARACT1=277,REPETITIONS=278,SIMPLEMVMT=279,STRGHTMVMT=280,CRCLRMVMT=281,REPLACE=282,SPLITREPLACETL=283,REPLACETAIL1=284,HSFINGERITEM=285,LOCBODY=286,MOVINGREPETITION=287,SEQACT1=288,SEQFUSEDACT2T=289,SEQFUSEDACT1T=290,SEQFUSEDACT1=291,CNTCTOHHAND=292,CNTCTOHARM=293;// public instance methods/vars
org.antlr.lang.extend(Ham4Parser,org.antlr.runtime.Parser,{setTreeAdaptor:function(adaptor){this.adaptor=adaptor;},getTreeAdaptor:function(){return this.adaptor;},getTokenNames:function(){return Ham4Parser.tokenNames;},getGrammarFileName:function(){return"Ham4Parser.g";}});org.antlr.lang.augmentObject(Ham4Parser.prototype,{// inline static return class
hamsinglesign_return:function(){Ham4Parser.hamsinglesign_return=function(){};org.antlr.lang.extend(Ham4Parser.hamsinglesign_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:142:1: hamsinglesign : hamsignseq EOF -> ^( HAMSIGNS ( hamsignseq )? ) ;
// $ANTLR start "hamsinglesign"
hamsinglesign:function(){var retval=new Ham4Parser.hamsinglesign_return();retval.start=this.input.LT(1);var root_0=null;var EOF2=null;var hamsignseq1=null;var EOF2_tree=null;var stream_EOF=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token EOF");var stream_hamsignseq=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule hamsignseq");try{// Ham4Parser.g:143:2: ( hamsignseq EOF -> ^( HAMSIGNS ( hamsignseq )? ) )
// Ham4Parser.g:143:6: hamsignseq EOF
this.pushFollow(Ham4Parser.FOLLOW_hamsignseq_in_hamsinglesign734);hamsignseq1=this.hamsignseq();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_hamsignseq.add(hamsignseq1.getTree());EOF2=this.match(this.input,EOF,Ham4Parser.FOLLOW_EOF_in_hamsinglesign744);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_EOF.add(EOF2);// AST REWRITE
// elements: hamsignseq
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 146:2: -> ^( HAMSIGNS ( hamsignseq )? )
{// Ham4Parser.g:146:5: ^( HAMSIGNS ( hamsignseq )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(HAMSIGNS,"HAMSIGNS"),root_1);// Ham4Parser.g:146:16: ( hamsignseq )?
if(stream_hamsignseq.hasNext()){this.adaptor.addChild(root_1,stream_hamsignseq.nextTree());}stream_hamsignseq.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
hamsignseq_return:function(){Ham4Parser.hamsignseq_return=function(){};org.antlr.lang.extend(Ham4Parser.hamsignseq_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:152:1: hamsignseq : ( sign2or1 ( HamPlus sign2or1 )* )? ;
// $ANTLR start "hamsignseq"
hamsignseq:function(){var retval=new Ham4Parser.hamsignseq_return();retval.start=this.input.LT(1);var root_0=null;var HamPlus4=null;var sign2or13=null;var sign2or15=null;var HamPlus4_tree=null;this.trace("ANTLR Parse: hamsignseq starts "+this.state.backtracking);try{// Ham4Parser.g:173:5: ( ( sign2or1 ( HamPlus sign2or1 )* )? )
// Ham4Parser.g:174:9: ( sign2or1 ( HamPlus sign2or1 )* )?
root_0=this.adaptor.nil();// Ham4Parser.g:174:9: ( sign2or1 ( HamPlus sign2or1 )* )?
var alt2=2;var LA2_0=this.input.LA(1);if(LA2_0>=HamSymmpar&&LA2_0<=HamFinger2345||LA2_0>=HamPinch12&&LA2_0<=HamCee12open||LA2_0==HamNondominant||LA2_0==HamNomotion||LA2_0==HamParbegin||LA2_0==HamSeqbegin){alt2=1;}switch(alt2){case 1:// Ham4Parser.g:175:13: sign2or1 ( HamPlus sign2or1 )*
this.pushFollow(Ham4Parser.FOLLOW_sign2or1_in_hamsignseq812);sign2or13=this.sign2or1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,sign2or13.getTree());// Ham4Parser.g:176:13: ( HamPlus sign2or1 )*
loop1:do{var alt1=2;var LA1_0=this.input.LA(1);if(LA1_0==HamPlus){alt1=1;}switch(alt1){case 1:// Ham4Parser.g:177:17: HamPlus sign2or1
HamPlus4=this.match(this.input,HamPlus,Ham4Parser.FOLLOW_HamPlus_in_hamsignseq844);if(this.state.failed)return retval;this.pushFollow(Ham4Parser.FOLLOW_sign2or1_in_hamsignseq864);sign2or15=this.sign2or1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,sign2or15.getTree());break;default:break loop1;}}while(true);break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: hamsignseq finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
sign2or1_return:function(){Ham4Parser.sign2or1_return=function(){};org.antlr.lang.extend(Ham4Parser.sign2or1_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:183:1: sign2or1 : ( ( HamNondominant initialconfig1 )=> nondomsign1 | sign2 );
// $ANTLR start "sign2or1"
sign2or1:function(){var retval=new Ham4Parser.sign2or1_return();retval.start=this.input.LT(1);var root_0=null;var nondomsign16=null;var sign27=null;this.trace("ANTLR Parse: sign2or1 starts "+this.state.backtracking);try{// Ham4Parser.g:202:5: ( ( HamNondominant initialconfig1 )=> nondomsign1 | sign2 )
var alt3=2;var LA3_0=this.input.LA(1);if(LA3_0==HamNondominant){var LA3_1=this.input.LA(2);if(this.synpred1_Ham4Parser()){alt3=1;}else if(true){alt3=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",3,1,this.input);throw nvae;}}else if(LA3_0>=HamSymmpar&&LA3_0<=HamFinger2345||LA3_0>=HamPinch12&&LA3_0<=HamCee12open||LA3_0==HamNomotion||LA3_0==HamParbegin||LA3_0==HamSeqbegin){alt3=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",3,0,this.input);throw nvae;}switch(alt3){case 1:// Ham4Parser.g:203:9: ( HamNondominant initialconfig1 )=> nondomsign1
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_nondomsign1_in_sign2or1951);nondomsign16=this.nondomsign1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,nondomsign16.getTree());break;case 2:// Ham4Parser.g:207:9: sign2
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_sign2_in_sign2or1967);sign27=this.sign2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,sign27.getTree());break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: sign2or1 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
sign2_return:function(){Ham4Parser.sign2_return=function(){};org.antlr.lang.extend(Ham4Parser.sign2_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:210:1: sign2 : ( symmoperator initialconfig2 a2tstar -> ^( SIGN2 symmoperator initialconfig2 a2tstar ) | initialconfig2 a1tstar -> ^( SIGN2 initialconfig2 a1tstar ) | ( HamNomotion HamNondominant initialconfig1 )=> HamNomotion HamNondominant initialconfig1 a1tstar -> ^( SIGN2 HamNomotion HamNondominant initialconfig1 a1tstar ) | HamNomotion initialconfig1 a1tstar -> ^( SIGN2 HamNomotion initialconfig1 a1tstar ) ) ;
// $ANTLR start "sign2"
sign2:function(){var retval=new Ham4Parser.sign2_return();retval.start=this.input.LT(1);var root_0=null;var HamNomotion13=null;var HamNondominant14=null;var HamNomotion17=null;var symmoperator8=null;var initialconfig29=null;var a2tstar10=null;var initialconfig211=null;var a1tstar12=null;var initialconfig115=null;var a1tstar16=null;var initialconfig118=null;var a1tstar19=null;var HamNomotion13_tree=null;var HamNondominant14_tree=null;var HamNomotion17_tree=null;var stream_HamNomotion=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamNomotion");var stream_HamNondominant=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamNondominant");var stream_symmoperator=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule symmoperator");var stream_a2tstar=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule a2tstar");var stream_initialconfig2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule initialconfig2");var stream_a1tstar=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule a1tstar");var stream_initialconfig1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule initialconfig1");this.trace("ANTLR Parse: sign2 starts "+this.state.backtracking);try{// Ham4Parser.g:254:5: ( ( symmoperator initialconfig2 a2tstar -> ^( SIGN2 symmoperator initialconfig2 a2tstar ) | initialconfig2 a1tstar -> ^( SIGN2 initialconfig2 a1tstar ) | ( HamNomotion HamNondominant initialconfig1 )=> HamNomotion HamNondominant initialconfig1 a1tstar -> ^( SIGN2 HamNomotion HamNondominant initialconfig1 a1tstar ) | HamNomotion initialconfig1 a1tstar -> ^( SIGN2 HamNomotion initialconfig1 a1tstar ) ) )
// Ham4Parser.g:255:5: ( symmoperator initialconfig2 a2tstar -> ^( SIGN2 symmoperator initialconfig2 a2tstar ) | initialconfig2 a1tstar -> ^( SIGN2 initialconfig2 a1tstar ) | ( HamNomotion HamNondominant initialconfig1 )=> HamNomotion HamNondominant initialconfig1 a1tstar -> ^( SIGN2 HamNomotion HamNondominant initialconfig1 a1tstar ) | HamNomotion initialconfig1 a1tstar -> ^( SIGN2 HamNomotion initialconfig1 a1tstar ) )
// Ham4Parser.g:255:5: ( symmoperator initialconfig2 a2tstar -> ^( SIGN2 symmoperator initialconfig2 a2tstar ) | initialconfig2 a1tstar -> ^( SIGN2 initialconfig2 a1tstar ) | ( HamNomotion HamNondominant initialconfig1 )=> HamNomotion HamNondominant initialconfig1 a1tstar -> ^( SIGN2 HamNomotion HamNondominant initialconfig1 a1tstar ) | HamNomotion initialconfig1 a1tstar -> ^( SIGN2 HamNomotion initialconfig1 a1tstar ) )
var alt4=4;switch(this.input.LA(1)){case HamSymmpar:case HamSymmlr:alt4=1;break;case HamFist:case HamFlathand:case HamFinger2:case HamFinger23:case HamFinger23spread:case HamFinger2345:case HamPinch12:case HamPinchall:case HamPinch12open:case HamCee12:case HamCeeall:case HamCee12open:case HamNondominant:case HamParbegin:case HamSeqbegin:alt4=2;break;case HamNomotion:var LA4_6=this.input.LA(2);if(this.synpred2_Ham4Parser()){alt4=3;}else if(true){alt4=4;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",4,6,this.input);throw nvae;}break;default:if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",4,0,this.input);throw nvae;}switch(alt4){case 1:// Ham4Parser.g:256:9: symmoperator initialconfig2 a2tstar
this.pushFollow(Ham4Parser.FOLLOW_symmoperator_in_sign21008);symmoperator8=this.symmoperator();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_symmoperator.add(symmoperator8.getTree());this.pushFollow(Ham4Parser.FOLLOW_initialconfig2_in_sign21018);initialconfig29=this.initialconfig2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_initialconfig2.add(initialconfig29.getTree());this.pushFollow(Ham4Parser.FOLLOW_a2tstar_in_sign21028);a2tstar10=this.a2tstar();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_a2tstar.add(a2tstar10.getTree());// AST REWRITE
// elements: a2tstar, symmoperator, initialconfig2
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 259:6: -> ^( SIGN2 symmoperator initialconfig2 a2tstar )
{// Ham4Parser.g:259:9: ^( SIGN2 symmoperator initialconfig2 a2tstar )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(SIGN2,"SIGN2"),root_1);this.adaptor.addChild(root_1,stream_symmoperator.nextTree());this.adaptor.addChild(root_1,stream_initialconfig2.nextTree());this.adaptor.addChild(root_1,stream_a2tstar.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;case 2:// Ham4Parser.g:261:9: initialconfig2 a1tstar
this.pushFollow(Ham4Parser.FOLLOW_initialconfig2_in_sign21061);initialconfig211=this.initialconfig2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_initialconfig2.add(initialconfig211.getTree());this.pushFollow(Ham4Parser.FOLLOW_a1tstar_in_sign21071);a1tstar12=this.a1tstar();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_a1tstar.add(a1tstar12.getTree());// AST REWRITE
// elements: a1tstar, initialconfig2
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 263:6: -> ^( SIGN2 initialconfig2 a1tstar )
{// Ham4Parser.g:263:9: ^( SIGN2 initialconfig2 a1tstar )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(SIGN2,"SIGN2"),root_1);this.adaptor.addChild(root_1,stream_initialconfig2.nextTree());this.adaptor.addChild(root_1,stream_a1tstar.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;case 3:// Ham4Parser.g:272:9: ( HamNomotion HamNondominant initialconfig1 )=> HamNomotion HamNondominant initialconfig1 a1tstar
HamNomotion13=this.match(this.input,HamNomotion,Ham4Parser.FOLLOW_HamNomotion_in_sign21137);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamNomotion.add(HamNomotion13);HamNondominant14=this.match(this.input,HamNondominant,Ham4Parser.FOLLOW_HamNondominant_in_sign21147);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamNondominant.add(HamNondominant14);this.pushFollow(Ham4Parser.FOLLOW_initialconfig1_in_sign21157);initialconfig115=this.initialconfig1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_initialconfig1.add(initialconfig115.getTree());this.pushFollow(Ham4Parser.FOLLOW_a1tstar_in_sign21167);a1tstar16=this.a1tstar();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_a1tstar.add(a1tstar16.getTree());// AST REWRITE
// elements: a1tstar, HamNomotion, initialconfig1, HamNondominant
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 278:6: -> ^( SIGN2 HamNomotion HamNondominant initialconfig1 a1tstar )
{// Ham4Parser.g:278:9: ^( SIGN2 HamNomotion HamNondominant initialconfig1 a1tstar )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(SIGN2,"SIGN2"),root_1);this.adaptor.addChild(root_1,stream_HamNomotion.nextNode());this.adaptor.addChild(root_1,stream_HamNondominant.nextNode());this.adaptor.addChild(root_1,stream_initialconfig1.nextTree());this.adaptor.addChild(root_1,stream_a1tstar.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;case 4:// Ham4Parser.g:280:9: HamNomotion initialconfig1 a1tstar
HamNomotion17=this.match(this.input,HamNomotion,Ham4Parser.FOLLOW_HamNomotion_in_sign21202);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamNomotion.add(HamNomotion17);this.pushFollow(Ham4Parser.FOLLOW_initialconfig1_in_sign21212);initialconfig118=this.initialconfig1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_initialconfig1.add(initialconfig118.getTree());this.pushFollow(Ham4Parser.FOLLOW_a1tstar_in_sign21222);a1tstar19=this.a1tstar();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_a1tstar.add(a1tstar19.getTree());// AST REWRITE
// elements: HamNomotion, initialconfig1, a1tstar
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 283:6: -> ^( SIGN2 HamNomotion initialconfig1 a1tstar )
{// Ham4Parser.g:283:9: ^( SIGN2 HamNomotion initialconfig1 a1tstar )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(SIGN2,"SIGN2"),root_1);this.adaptor.addChild(root_1,stream_HamNomotion.nextNode());this.adaptor.addChild(root_1,stream_initialconfig1.nextTree());this.adaptor.addChild(root_1,stream_a1tstar.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: sign2 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
nondomsign1_return:function(){Ham4Parser.nondomsign1_return=function(){};org.antlr.lang.extend(Ham4Parser.nondomsign1_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:287:1: nondomsign1 : HamNondominant initialconfig1 a1tstar -> ^( SIGN1 HamNondominant initialconfig1 a1tstar ) ;
// $ANTLR start "nondomsign1"
nondomsign1:function(){var retval=new Ham4Parser.nondomsign1_return();retval.start=this.input.LT(1);var root_0=null;var HamNondominant20=null;var initialconfig121=null;var a1tstar22=null;var HamNondominant20_tree=null;var stream_HamNondominant=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamNondominant");var stream_initialconfig1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule initialconfig1");var stream_a1tstar=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule a1tstar");this.trace("ANTLR Parse: nondomsign1 starts "+this.state.backtracking);try{// Ham4Parser.g:305:5: ( HamNondominant initialconfig1 a1tstar -> ^( SIGN1 HamNondominant initialconfig1 a1tstar ) )
// Ham4Parser.g:305:9: HamNondominant initialconfig1 a1tstar
HamNondominant20=this.match(this.input,HamNondominant,Ham4Parser.FOLLOW_HamNondominant_in_nondomsign11274);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamNondominant.add(HamNondominant20);this.pushFollow(Ham4Parser.FOLLOW_initialconfig1_in_nondomsign11284);initialconfig121=this.initialconfig1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_initialconfig1.add(initialconfig121.getTree());this.pushFollow(Ham4Parser.FOLLOW_a1tstar_in_nondomsign11294);a1tstar22=this.a1tstar();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_a1tstar.add(a1tstar22.getTree());// AST REWRITE
// elements: initialconfig1, HamNondominant, a1tstar
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 309:9: -> ^( SIGN1 HamNondominant initialconfig1 a1tstar )
{// Ham4Parser.g:309:12: ^( SIGN1 HamNondominant initialconfig1 a1tstar )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(SIGN1,"SIGN1"),root_1);this.adaptor.addChild(root_1,stream_HamNondominant.nextNode());this.adaptor.addChild(root_1,stream_initialconfig1.nextTree());this.adaptor.addChild(root_1,stream_a1tstar.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: nondomsign1 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
symmoperator_return:function(){Ham4Parser.symmoperator_return=function(){};org.antlr.lang.extend(Ham4Parser.symmoperator_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:312:1: symmoperator : ( HamSymmpar | HamSymmlr ) ( HamFingerstraightmod ( HamLargemod )? | HamLargemod ( HamFingerstraightmod )? )? ( HamAlternatingmotion )? ( HamNonipsi )? ;
// $ANTLR start "symmoperator"
symmoperator:function(){var retval=new Ham4Parser.symmoperator_return();retval.start=this.input.LT(1);var root_0=null;var set23=null;var HamFingerstraightmod24=null;var HamLargemod25=null;var HamLargemod26=null;var HamFingerstraightmod27=null;var HamAlternatingmotion28=null;var HamNonipsi29=null;var set23_tree=null;var HamFingerstraightmod24_tree=null;var HamLargemod25_tree=null;var HamLargemod26_tree=null;var HamFingerstraightmod27_tree=null;var HamAlternatingmotion28_tree=null;var HamNonipsi29_tree=null;this.trace("ANTLR Parse: symmoperator starts "+this.state.backtracking);try{// Ham4Parser.g:339:5: ( ( HamSymmpar | HamSymmlr ) ( HamFingerstraightmod ( HamLargemod )? | HamLargemod ( HamFingerstraightmod )? )? ( HamAlternatingmotion )? ( HamNonipsi )? )
// Ham4Parser.g:339:9: ( HamSymmpar | HamSymmlr ) ( HamFingerstraightmod ( HamLargemod )? | HamLargemod ( HamFingerstraightmod )? )? ( HamAlternatingmotion )? ( HamNonipsi )?
root_0=this.adaptor.nil();set23=this.input.LT(1);if(this.input.LA(1)>=HamSymmpar&&this.input.LA(1)<=HamSymmlr){this.input.consume();if(this.state.backtracking===0)this.adaptor.addChild(root_0,this.adaptor.create(set23));this.state.errorRecovery=false;this.state.failed=false;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var mse=new org.antlr.runtime.MismatchedSetException(null,this.input);throw mse;}// Ham4Parser.g:344:9: ( HamFingerstraightmod ( HamLargemod )? | HamLargemod ( HamFingerstraightmod )? )?
var alt7=3;var LA7_0=this.input.LA(1);if(LA7_0==HamFingerstraightmod){alt7=1;}else if(LA7_0==HamLargemod){alt7=2;}switch(alt7){case 1:// Ham4Parser.g:345:13: HamFingerstraightmod ( HamLargemod )?
HamFingerstraightmod24=this.match(this.input,HamFingerstraightmod,Ham4Parser.FOLLOW_HamFingerstraightmod_in_symmoperator1424);if(this.state.failed)return retval;if(this.state.backtracking===0){HamFingerstraightmod24_tree=this.adaptor.create(HamFingerstraightmod24);this.adaptor.addChild(root_0,HamFingerstraightmod24_tree);}// Ham4Parser.g:346:13: ( HamLargemod )?
var alt5=2;var LA5_0=this.input.LA(1);if(LA5_0==HamLargemod){alt5=1;}switch(alt5){case 1:// Ham4Parser.g:346:15: HamLargemod
HamLargemod25=this.match(this.input,HamLargemod,Ham4Parser.FOLLOW_HamLargemod_in_symmoperator1440);if(this.state.failed)return retval;if(this.state.backtracking===0){HamLargemod25_tree=this.adaptor.create(HamLargemod25);this.adaptor.addChild(root_0,HamLargemod25_tree);}break;}break;case 2:// Ham4Parser.g:348:13: HamLargemod ( HamFingerstraightmod )?
HamLargemod26=this.match(this.input,HamLargemod,Ham4Parser.FOLLOW_HamLargemod_in_symmoperator1467);if(this.state.failed)return retval;if(this.state.backtracking===0){HamLargemod26_tree=this.adaptor.create(HamLargemod26);this.adaptor.addChild(root_0,HamLargemod26_tree);}// Ham4Parser.g:349:13: ( HamFingerstraightmod )?
var alt6=2;var LA6_0=this.input.LA(1);if(LA6_0==HamFingerstraightmod){alt6=1;}switch(alt6){case 1:// Ham4Parser.g:349:15: HamFingerstraightmod
HamFingerstraightmod27=this.match(this.input,HamFingerstraightmod,Ham4Parser.FOLLOW_HamFingerstraightmod_in_symmoperator1483);if(this.state.failed)return retval;if(this.state.backtracking===0){HamFingerstraightmod27_tree=this.adaptor.create(HamFingerstraightmod27);this.adaptor.addChild(root_0,HamFingerstraightmod27_tree);}break;}break;}// Ham4Parser.g:351:9: ( HamAlternatingmotion )?
var alt8=2;var LA8_0=this.input.LA(1);if(LA8_0==HamAlternatingmotion){alt8=1;}switch(alt8){case 1:// Ham4Parser.g:351:11: HamAlternatingmotion
HamAlternatingmotion28=this.match(this.input,HamAlternatingmotion,Ham4Parser.FOLLOW_HamAlternatingmotion_in_symmoperator1509);if(this.state.failed)return retval;if(this.state.backtracking===0){HamAlternatingmotion28_tree=this.adaptor.create(HamAlternatingmotion28);this.adaptor.addChild(root_0,HamAlternatingmotion28_tree);}break;}// Ham4Parser.g:352:9: ( HamNonipsi )?
var alt9=2;var LA9_0=this.input.LA(1);if(LA9_0==HamNonipsi){alt9=1;}switch(alt9){case 1:// Ham4Parser.g:352:11: HamNonipsi
HamNonipsi29=this.match(this.input,HamNonipsi,Ham4Parser.FOLLOW_HamNonipsi_in_symmoperator1524);if(this.state.failed)return retval;if(this.state.backtracking===0){HamNonipsi29_tree=this.adaptor.create(HamNonipsi29);this.adaptor.addChild(root_0,HamNonipsi29_tree);}break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: symmoperator finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
initialconfig2_return:function(){Ham4Parser.initialconfig2_return=function(){};org.antlr.lang.extend(Ham4Parser.initialconfig2_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:358:1: initialconfig2 : ( nminitialconfig )? minitialconfig2 -> ^( ICFG2 ( nminitialconfig )? minitialconfig2 ) ;
// $ANTLR start "initialconfig2"
initialconfig2:function(){var retval=new Ham4Parser.initialconfig2_return();retval.start=this.input.LT(1);var root_0=null;var nminitialconfig30=null;var minitialconfig231=null;var stream_minitialconfig2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule minitialconfig2");var stream_nminitialconfig=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule nminitialconfig");this.trace("ANTLR Parse: initialconfig2 starts "+this.state.backtracking);try{// Ham4Parser.g:375:5: ( ( nminitialconfig )? minitialconfig2 -> ^( ICFG2 ( nminitialconfig )? minitialconfig2 ) )
// Ham4Parser.g:375:9: ( nminitialconfig )? minitialconfig2
// Ham4Parser.g:375:9: ( nminitialconfig )?
var alt10=2;var LA10_0=this.input.LA(1);if(LA10_0==HamSeqbegin){alt10=1;}switch(alt10){case 1:// Ham4Parser.g:375:11: nminitialconfig
this.pushFollow(Ham4Parser.FOLLOW_nminitialconfig_in_initialconfig21561);nminitialconfig30=this.nminitialconfig();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_nminitialconfig.add(nminitialconfig30.getTree());break;}this.pushFollow(Ham4Parser.FOLLOW_minitialconfig2_in_initialconfig21574);minitialconfig231=this.minitialconfig2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_minitialconfig2.add(minitialconfig231.getTree());// AST REWRITE
// elements: nminitialconfig, minitialconfig2
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 378:9: -> ^( ICFG2 ( nminitialconfig )? minitialconfig2 )
{// Ham4Parser.g:378:12: ^( ICFG2 ( nminitialconfig )? minitialconfig2 )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(ICFG2,"ICFG2"),root_1);// Ham4Parser.g:378:20: ( nminitialconfig )?
if(stream_nminitialconfig.hasNext()){this.adaptor.addChild(root_1,stream_nminitialconfig.nextTree());}stream_nminitialconfig.reset();this.adaptor.addChild(root_1,stream_minitialconfig2.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: initialconfig2 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
initialconfig1_return:function(){Ham4Parser.initialconfig1_return=function(){};org.antlr.lang.extend(Ham4Parser.initialconfig1_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:381:1: initialconfig1 : ( nminitialconfig )? minitialconfig1 -> ^( ICFG1 ( nminitialconfig )? minitialconfig1 ) ;
// $ANTLR start "initialconfig1"
initialconfig1:function(){var retval=new Ham4Parser.initialconfig1_return();retval.start=this.input.LT(1);var root_0=null;var nminitialconfig32=null;var minitialconfig133=null;var stream_minitialconfig1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule minitialconfig1");var stream_nminitialconfig=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule nminitialconfig");this.trace("ANTLR Parse: initialconfig1 starts "+this.state.backtracking);try{// Ham4Parser.g:398:5: ( ( nminitialconfig )? minitialconfig1 -> ^( ICFG1 ( nminitialconfig )? minitialconfig1 ) )
// Ham4Parser.g:398:9: ( nminitialconfig )? minitialconfig1
// Ham4Parser.g:398:9: ( nminitialconfig )?
var alt11=2;var LA11_0=this.input.LA(1);if(LA11_0==HamSeqbegin){alt11=1;}switch(alt11){case 1:// Ham4Parser.g:398:11: nminitialconfig
this.pushFollow(Ham4Parser.FOLLOW_nminitialconfig_in_initialconfig11633);nminitialconfig32=this.nminitialconfig();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_nminitialconfig.add(nminitialconfig32.getTree());break;}this.pushFollow(Ham4Parser.FOLLOW_minitialconfig1_in_initialconfig11646);minitialconfig133=this.minitialconfig1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_minitialconfig1.add(minitialconfig133.getTree());// AST REWRITE
// elements: nminitialconfig, minitialconfig1
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 401:9: -> ^( ICFG1 ( nminitialconfig )? minitialconfig1 )
{// Ham4Parser.g:401:12: ^( ICFG1 ( nminitialconfig )? minitialconfig1 )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(ICFG1,"ICFG1"),root_1);// Ham4Parser.g:401:20: ( nminitialconfig )?
if(stream_nminitialconfig.hasNext()){this.adaptor.addChild(root_1,stream_nminitialconfig.nextTree());}stream_nminitialconfig.reset();this.adaptor.addChild(root_1,stream_minitialconfig1.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: initialconfig1 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
nminitialconfig_return:function(){Ham4Parser.nminitialconfig_return=function(){};org.antlr.lang.extend(Ham4Parser.nminitialconfig_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:404:1: nminitialconfig : ( nmicunit )+ -> ^( NMICLIST ( nmicunit )* ) ;
// $ANTLR start "nminitialconfig"
nminitialconfig:function(){var retval=new Ham4Parser.nminitialconfig_return();retval.start=this.input.LT(1);var root_0=null;var nmicunit34=null;var stream_nmicunit=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule nmicunit");this.trace("ANTLR Parse: nminitialconfig starts "+this.state.backtracking);try{// Ham4Parser.g:421:5: ( ( nmicunit )+ -> ^( NMICLIST ( nmicunit )* ) )
// Ham4Parser.g:421:9: ( nmicunit )+
// Ham4Parser.g:421:9: ( nmicunit )+
var cnt12=0;loop12:do{var alt12=2;var LA12_0=this.input.LA(1);if(LA12_0==HamSeqbegin){alt12=1;}switch(alt12){case 1:// Ham4Parser.g:422:13: nmicunit
this.pushFollow(Ham4Parser.FOLLOW_nmicunit_in_nminitialconfig1717);nmicunit34=this.nmicunit();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_nmicunit.add(nmicunit34.getTree());break;default:if(cnt12>=1){break loop12;}if(this.state.backtracking>0){this.state.failed=true;return retval;}var eee=new org.antlr.runtime.EarlyExitException(12,this.input);throw eee;}cnt12++;}while(true);// AST REWRITE
// elements: nmicunit
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 424:9: -> ^( NMICLIST ( nmicunit )* )
{// Ham4Parser.g:424:12: ^( NMICLIST ( nmicunit )* )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(NMICLIST,"NMICLIST"),root_1);// Ham4Parser.g:424:23: ( nmicunit )*
while(stream_nmicunit.hasNext()){this.adaptor.addChild(root_1,stream_nmicunit.nextTree());}stream_nmicunit.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: nminitialconfig finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
nmicunit_return:function(){Ham4Parser.nmicunit_return=function(){};org.antlr.lang.extend(Ham4Parser.nmicunit_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:427:1: nmicunit : HamSeqbegin ( ( levelbody )=> levelbody | levelarm ) action1 HamSeqend -> ^( NMICUNIT ( levelbody )? ( levelarm )? action1 ) ;
// $ANTLR start "nmicunit"
nmicunit:function(){var retval=new Ham4Parser.nmicunit_return();retval.start=this.input.LT(1);var root_0=null;var HamSeqbegin35=null;var HamSeqend39=null;var levelbody36=null;var levelarm37=null;var action138=null;var HamSeqbegin35_tree=null;var HamSeqend39_tree=null;var stream_HamSeqbegin=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamSeqbegin");var stream_HamSeqend=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamSeqend");var stream_levelbody=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule levelbody");var stream_levelarm=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule levelarm");var stream_action1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule action1");this.trace("ANTLR Parse: nmicunit starts "+this.state.backtracking);try{// Ham4Parser.g:451:5: ( HamSeqbegin ( ( levelbody )=> levelbody | levelarm ) action1 HamSeqend -> ^( NMICUNIT ( levelbody )? ( levelarm )? action1 ) )
// Ham4Parser.g:452:9: HamSeqbegin ( ( levelbody )=> levelbody | levelarm ) action1 HamSeqend
HamSeqbegin35=this.match(this.input,HamSeqbegin,Ham4Parser.FOLLOW_HamSeqbegin_in_nmicunit1780);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamSeqbegin.add(HamSeqbegin35);// Ham4Parser.g:453:9: ( ( levelbody )=> levelbody | levelarm )
var alt13=2;alt13=this.dfa13.predict(this.input);switch(alt13){case 1:// Ham4Parser.g:454:11: ( levelbody )=> levelbody
this.pushFollow(Ham4Parser.FOLLOW_levelbody_in_nmicunit1811);levelbody36=this.levelbody();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_levelbody.add(levelbody36.getTree());break;case 2:// Ham4Parser.g:456:11: levelarm
this.pushFollow(Ham4Parser.FOLLOW_levelarm_in_nmicunit1833);levelarm37=this.levelarm();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_levelarm.add(levelarm37.getTree());break;}this.pushFollow(Ham4Parser.FOLLOW_action1_in_nmicunit1853);action138=this.action1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_action1.add(action138.getTree());HamSeqend39=this.match(this.input,HamSeqend,Ham4Parser.FOLLOW_HamSeqend_in_nmicunit1863);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamSeqend.add(HamSeqend39);// AST REWRITE
// elements: levelbody, levelarm, action1
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 461:9: -> ^( NMICUNIT ( levelbody )? ( levelarm )? action1 )
{// Ham4Parser.g:461:12: ^( NMICUNIT ( levelbody )? ( levelarm )? action1 )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(NMICUNIT,"NMICUNIT"),root_1);// Ham4Parser.g:461:23: ( levelbody )?
if(stream_levelbody.hasNext()){this.adaptor.addChild(root_1,stream_levelbody.nextTree());}stream_levelbody.reset();// Ham4Parser.g:461:34: ( levelarm )?
if(stream_levelarm.hasNext()){this.adaptor.addChild(root_1,stream_levelarm.nextTree());}stream_levelarm.reset();this.adaptor.addChild(root_1,stream_action1.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: nmicunit finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
minitialconfig2_return:function(){Ham4Parser.minitialconfig2_return=function(){};org.antlr.lang.extend(Ham4Parser.minitialconfig2_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:465:1: minitialconfig2 : ( ( handconfig2 )=> handconfig2 ( ( location2 )=> location2 )? -> ^( MICFG2 handconfig2 ( location2 )? ) | HamParbegin handconfig1 ( ( HamPlus )=> HamPlus location1 HamParend -> ^( MICFG2 handconfig1 HamPlus location1 ) | loc= location1 HamPlus (ploc= location1 )? HamParend -> ^( MICFG2 handconfig1 $loc HamPlus ( $ploc)? ) ) ) ;
// $ANTLR start "minitialconfig2"
minitialconfig2:function(){var retval=new Ham4Parser.minitialconfig2_return();retval.start=this.input.LT(1);var root_0=null;var HamParbegin42=null;var HamPlus44=null;var HamParend46=null;var HamPlus47=null;var HamParend48=null;var loc=null;var ploc=null;var handconfig240=null;var location241=null;var handconfig143=null;var location145=null;var HamParbegin42_tree=null;var HamPlus44_tree=null;var HamParend46_tree=null;var HamPlus47_tree=null;var HamParend48_tree=null;var stream_HamPlus=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamPlus");var stream_HamParend=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamParend");var stream_HamParbegin=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamParbegin");var stream_location1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule location1");var stream_location2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule location2");var stream_handconfig1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule handconfig1");var stream_handconfig2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule handconfig2");this.trace("ANTLR Parse: minitialconfig2 starts "+this.state.backtracking);try{// Ham4Parser.g:509:5: ( ( ( handconfig2 )=> handconfig2 ( ( location2 )=> location2 )? -> ^( MICFG2 handconfig2 ( location2 )? ) | HamParbegin handconfig1 ( ( HamPlus )=> HamPlus location1 HamParend -> ^( MICFG2 handconfig1 HamPlus location1 ) | loc= location1 HamPlus (ploc= location1 )? HamParend -> ^( MICFG2 handconfig1 $loc HamPlus ( $ploc)? ) ) ) )
// Ham4Parser.g:510:5: ( ( handconfig2 )=> handconfig2 ( ( location2 )=> location2 )? -> ^( MICFG2 handconfig2 ( location2 )? ) | HamParbegin handconfig1 ( ( HamPlus )=> HamPlus location1 HamParend -> ^( MICFG2 handconfig1 HamPlus location1 ) | loc= location1 HamPlus (ploc= location1 )? HamParend -> ^( MICFG2 handconfig1 $loc HamPlus ( $ploc)? ) ) )
// Ham4Parser.g:510:5: ( ( handconfig2 )=> handconfig2 ( ( location2 )=> location2 )? -> ^( MICFG2 handconfig2 ( location2 )? ) | HamParbegin handconfig1 ( ( HamPlus )=> HamPlus location1 HamParend -> ^( MICFG2 handconfig1 HamPlus location1 ) | loc= location1 HamPlus (ploc= location1 )? HamParend -> ^( MICFG2 handconfig1 $loc HamPlus ( $ploc)? ) ) )
var alt17=2;var LA17_0=this.input.LA(1);if((LA17_0>=HamFist&&LA17_0<=HamFinger2345||LA17_0>=HamPinch12&&LA17_0<=HamCee12open)&&this.synpred4_Ham4Parser()){alt17=1;}else if(LA17_0==HamNondominant&&this.synpred4_Ham4Parser()){alt17=1;}else if(LA17_0==HamParbegin){var LA17_3=this.input.LA(2);if(this.synpred4_Ham4Parser()){alt17=1;}else if(true){alt17=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",17,3,this.input);throw nvae;}}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",17,0,this.input);throw nvae;}switch(alt17){case 1:// Ham4Parser.g:511:9: ( handconfig2 )=> handconfig2 ( ( location2 )=> location2 )?
this.pushFollow(Ham4Parser.FOLLOW_handconfig2_in_minitialconfig21961);handconfig240=this.handconfig2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handconfig2.add(handconfig240.getTree());// Ham4Parser.g:514:9: ( ( location2 )=> location2 )?
var alt14=2;alt14=this.dfa14.predict(this.input);switch(alt14){case 1:// Ham4Parser.g:515:13: ( location2 )=> location2
this.pushFollow(Ham4Parser.FOLLOW_location2_in_minitialconfig22017);location241=this.location2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_location2.add(location241.getTree());break;}// AST REWRITE
// elements: location2, handconfig2
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 519:6: -> ^( MICFG2 handconfig2 ( location2 )? )
{// Ham4Parser.g:519:9: ^( MICFG2 handconfig2 ( location2 )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(MICFG2,"MICFG2"),root_1);this.adaptor.addChild(root_1,stream_handconfig2.nextTree());// Ham4Parser.g:519:30: ( location2 )?
if(stream_location2.hasNext()){this.adaptor.addChild(root_1,stream_location2.nextTree());}stream_location2.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;case 2:// Ham4Parser.g:521:9: HamParbegin handconfig1 ( ( HamPlus )=> HamPlus location1 HamParend -> ^( MICFG2 handconfig1 HamPlus location1 ) | loc= location1 HamPlus (ploc= location1 )? HamParend -> ^( MICFG2 handconfig1 $loc HamPlus ( $ploc)? ) )
HamParbegin42=this.match(this.input,HamParbegin,Ham4Parser.FOLLOW_HamParbegin_in_minitialconfig22060);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamParbegin.add(HamParbegin42);this.pushFollow(Ham4Parser.FOLLOW_handconfig1_in_minitialconfig22071);handconfig143=this.handconfig1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handconfig1.add(handconfig143.getTree());// Ham4Parser.g:523:9: ( ( HamPlus )=> HamPlus location1 HamParend -> ^( MICFG2 handconfig1 HamPlus location1 ) | loc= location1 HamPlus (ploc= location1 )? HamParend -> ^( MICFG2 handconfig1 $loc HamPlus ( $ploc)? ) )
var alt16=2;alt16=this.dfa16.predict(this.input);switch(alt16){case 1:// Ham4Parser.g:524:13: ( HamPlus )=> HamPlus location1 HamParend
HamPlus44=this.match(this.input,HamPlus,Ham4Parser.FOLLOW_HamPlus_in_minitialconfig22127);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamPlus.add(HamPlus44);this.pushFollow(Ham4Parser.FOLLOW_location1_in_minitialconfig22142);location145=this.location1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_location1.add(location145.getTree());HamParend46=this.match(this.input,HamParend,Ham4Parser.FOLLOW_HamParend_in_minitialconfig22156);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamParend.add(HamParend46);// AST REWRITE
// elements: location1, handconfig1, HamPlus
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 530:6: -> ^( MICFG2 handconfig1 HamPlus location1 )
{// Ham4Parser.g:530:9: ^( MICFG2 handconfig1 HamPlus location1 )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(MICFG2,"MICFG2"),root_1);this.adaptor.addChild(root_1,stream_handconfig1.nextTree());this.adaptor.addChild(root_1,stream_HamPlus.nextNode());this.adaptor.addChild(root_1,stream_location1.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;case 2:// Ham4Parser.g:532:13: loc= location1 HamPlus (ploc= location1 )? HamParend
this.pushFollow(Ham4Parser.FOLLOW_location1_in_minitialconfig22200);loc=this.location1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_location1.add(loc.getTree());HamPlus47=this.match(this.input,HamPlus,Ham4Parser.FOLLOW_HamPlus_in_minitialconfig22214);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamPlus.add(HamPlus47);// Ham4Parser.g:535:13: (ploc= location1 )?
var alt15=2;alt15=this.dfa15.predict(this.input);switch(alt15){case 1:// Ham4Parser.g:535:15: ploc= location1
this.pushFollow(Ham4Parser.FOLLOW_location1_in_minitialconfig22233);ploc=this.location1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_location1.add(ploc.getTree());break;}HamParend48=this.match(this.input,HamParend,Ham4Parser.FOLLOW_HamParend_in_minitialconfig22250);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamParend.add(HamParend48);// AST REWRITE
// elements: loc, ploc, handconfig1, HamPlus
// token labels: 
// rule labels: loc, ploc, retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_loc=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token loc",loc!=null?loc.tree:null);var stream_ploc=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token ploc",ploc!=null?ploc.tree:null);var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 537:6: -> ^( MICFG2 handconfig1 $loc HamPlus ( $ploc)? )
{// Ham4Parser.g:537:9: ^( MICFG2 handconfig1 $loc HamPlus ( $ploc)? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(MICFG2,"MICFG2"),root_1);this.adaptor.addChild(root_1,stream_handconfig1.nextTree());this.adaptor.addChild(root_1,stream_loc.nextTree());this.adaptor.addChild(root_1,stream_HamPlus.nextNode());// Ham4Parser.g:537:43: ( $ploc)?
if(stream_ploc.hasNext()){this.adaptor.addChild(root_1,stream_ploc.nextTree());}stream_ploc.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;}break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: minitialconfig2 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
minitialconfig1_return:function(){Ham4Parser.minitialconfig1_return=function(){};org.antlr.lang.extend(Ham4Parser.minitialconfig1_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:542:1: minitialconfig1 : handconfig1 ( location1 )? -> ^( MICFG1 handconfig1 ( location1 )? ) ;
// $ANTLR start "minitialconfig1"
minitialconfig1:function(){var retval=new Ham4Parser.minitialconfig1_return();retval.start=this.input.LT(1);var root_0=null;var handconfig149=null;var location150=null;var stream_location1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule location1");var stream_handconfig1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule handconfig1");this.trace("ANTLR Parse: minitialconfig1 starts "+this.state.backtracking);try{// Ham4Parser.g:560:5: ( handconfig1 ( location1 )? -> ^( MICFG1 handconfig1 ( location1 )? ) )
// Ham4Parser.g:561:9: handconfig1 ( location1 )?
this.pushFollow(Ham4Parser.FOLLOW_handconfig1_in_minitialconfig12324);handconfig149=this.handconfig1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handconfig1.add(handconfig149.getTree());// Ham4Parser.g:562:9: ( location1 )?
var alt18=2;alt18=this.dfa18.predict(this.input);switch(alt18){case 1:// Ham4Parser.g:562:11: location1
this.pushFollow(Ham4Parser.FOLLOW_location1_in_minitialconfig12336);location150=this.location1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_location1.add(location150.getTree());break;}// AST REWRITE
// elements: handconfig1, location1
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 564:6: -> ^( MICFG1 handconfig1 ( location1 )? )
{// Ham4Parser.g:564:9: ^( MICFG1 handconfig1 ( location1 )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(MICFG1,"MICFG1"),root_1);this.adaptor.addChild(root_1,stream_handconfig1.nextTree());// Ham4Parser.g:564:30: ( location1 )?
if(stream_location1.hasNext()){this.adaptor.addChild(root_1,stream_location1.nextTree());}stream_location1.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: minitialconfig1 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
handconfig2_return:function(){Ham4Parser.handconfig2_return=function(){};org.antlr.lang.extend(Ham4Parser.handconfig2_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:570:1: handconfig2 : ( ( handshape2 ( HamParbegin )? extfidir1 )=> handshape2 handconfigtail2 -> ^( HDCONFIG2 handshape2 handconfigtail2 ) | ( handshape2 )=> handshape2 -> ^( HDCONFIG2 handshape2 ) | splithandconfig2 -> ^( HDCONFIG2 splithandconfig2 ) ) ;
// $ANTLR start "handconfig2"
handconfig2:function(){var retval=new Ham4Parser.handconfig2_return();retval.start=this.input.LT(1);var root_0=null;var handshape251=null;var handconfigtail252=null;var handshape253=null;var splithandconfig254=null;var stream_handshape2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule handshape2");var stream_handconfigtail2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule handconfigtail2");var stream_splithandconfig2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule splithandconfig2");this.trace("ANTLR Parse: handconfig2 starts "+this.state.backtracking);try{// Ham4Parser.g:599:5: ( ( ( handshape2 ( HamParbegin )? extfidir1 )=> handshape2 handconfigtail2 -> ^( HDCONFIG2 handshape2 handconfigtail2 ) | ( handshape2 )=> handshape2 -> ^( HDCONFIG2 handshape2 ) | splithandconfig2 -> ^( HDCONFIG2 splithandconfig2 ) ) )
// Ham4Parser.g:600:5: ( ( handshape2 ( HamParbegin )? extfidir1 )=> handshape2 handconfigtail2 -> ^( HDCONFIG2 handshape2 handconfigtail2 ) | ( handshape2 )=> handshape2 -> ^( HDCONFIG2 handshape2 ) | splithandconfig2 -> ^( HDCONFIG2 splithandconfig2 ) )
// Ham4Parser.g:600:5: ( ( handshape2 ( HamParbegin )? extfidir1 )=> handshape2 handconfigtail2 -> ^( HDCONFIG2 handshape2 handconfigtail2 ) | ( handshape2 )=> handshape2 -> ^( HDCONFIG2 handshape2 ) | splithandconfig2 -> ^( HDCONFIG2 splithandconfig2 ) )
var alt19=3;switch(this.input.LA(1)){case HamFist:case HamFlathand:case HamFinger2:case HamFinger23:case HamFinger23spread:case HamFinger2345:case HamPinch12:case HamPinchall:case HamPinch12open:case HamCee12:case HamCeeall:case HamCee12open:var LA19_1=this.input.LA(2);if(this.synpred7_Ham4Parser()){alt19=1;}else if(this.synpred8_Ham4Parser()){alt19=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",19,1,this.input);throw nvae;}break;case HamNondominant:var LA19_2=this.input.LA(2);if(this.synpred7_Ham4Parser()){alt19=1;}else if(this.synpred8_Ham4Parser()){alt19=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",19,2,this.input);throw nvae;}break;case HamParbegin:var LA19_3=this.input.LA(2);if(this.synpred7_Ham4Parser()){alt19=1;}else if(this.synpred8_Ham4Parser()){alt19=2;}else if(true){alt19=3;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",19,3,this.input);throw nvae;}break;default:if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",19,0,this.input);throw nvae;}switch(alt19){case 1:// Ham4Parser.g:601:9: ( handshape2 ( HamParbegin )? extfidir1 )=> handshape2 handconfigtail2
this.pushFollow(Ham4Parser.FOLLOW_handshape2_in_handconfig22441);handshape251=this.handshape2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handshape2.add(handshape251.getTree());this.pushFollow(Ham4Parser.FOLLOW_handconfigtail2_in_handconfig22451);handconfigtail252=this.handconfigtail2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handconfigtail2.add(handconfigtail252.getTree());// AST REWRITE
// elements: handconfigtail2, handshape2
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 605:6: -> ^( HDCONFIG2 handshape2 handconfigtail2 )
{// Ham4Parser.g:605:9: ^( HDCONFIG2 handshape2 handconfigtail2 )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(HDCONFIG2,"HDCONFIG2"),root_1);this.adaptor.addChild(root_1,stream_handshape2.nextTree());this.adaptor.addChild(root_1,stream_handconfigtail2.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;case 2:// Ham4Parser.g:607:9: ( handshape2 )=> handshape2
this.pushFollow(Ham4Parser.FOLLOW_handshape2_in_handconfig22506);handshape253=this.handshape2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handshape2.add(handshape253.getTree());// AST REWRITE
// elements: handshape2
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 610:6: -> ^( HDCONFIG2 handshape2 )
{// Ham4Parser.g:610:9: ^( HDCONFIG2 handshape2 )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(HDCONFIG2,"HDCONFIG2"),root_1);this.adaptor.addChild(root_1,stream_handshape2.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;case 3:// Ham4Parser.g:612:9: splithandconfig2
this.pushFollow(Ham4Parser.FOLLOW_splithandconfig2_in_handconfig22535);splithandconfig254=this.splithandconfig2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_splithandconfig2.add(splithandconfig254.getTree());// AST REWRITE
// elements: splithandconfig2
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 613:6: -> ^( HDCONFIG2 splithandconfig2 )
{// Ham4Parser.g:613:9: ^( HDCONFIG2 splithandconfig2 )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(HDCONFIG2,"HDCONFIG2"),root_1);this.adaptor.addChild(root_1,stream_splithandconfig2.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: handconfig2 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
handconfig1_return:function(){Ham4Parser.handconfig1_return=function(){};org.antlr.lang.extend(Ham4Parser.handconfig1_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:618:1: handconfig1 : handshape1 ( extfidir1 palmor1 )? -> ^( HDCONFIG1 handshape1 ( extfidir1 )? ( palmor1 )? ) ;
// $ANTLR start "handconfig1"
handconfig1:function(){var retval=new Ham4Parser.handconfig1_return();retval.start=this.input.LT(1);var root_0=null;var handshape155=null;var extfidir156=null;var palmor157=null;var stream_handshape1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule handshape1");var stream_palmor1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule palmor1");var stream_extfidir1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule extfidir1");this.trace("ANTLR Parse: handconfig1 starts "+this.state.backtracking);try{// Ham4Parser.g:638:5: ( handshape1 ( extfidir1 palmor1 )? -> ^( HDCONFIG1 handshape1 ( extfidir1 )? ( palmor1 )? ) )
// Ham4Parser.g:638:9: handshape1 ( extfidir1 palmor1 )?
this.pushFollow(Ham4Parser.FOLLOW_handshape1_in_handconfig12584);handshape155=this.handshape1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handshape1.add(handshape155.getTree());// Ham4Parser.g:639:9: ( extfidir1 palmor1 )?
var alt20=2;var LA20_0=this.input.LA(1);if(LA20_0>=HamExtfingeru&&LA20_0<=HamExtfingeruo){alt20=1;}switch(alt20){case 1:// Ham4Parser.g:640:13: extfidir1 palmor1
this.pushFollow(Ham4Parser.FOLLOW_extfidir1_in_handconfig12608);extfidir156=this.extfidir1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_extfidir1.add(extfidir156.getTree());this.pushFollow(Ham4Parser.FOLLOW_palmor1_in_handconfig12622);palmor157=this.palmor1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_palmor1.add(palmor157.getTree());break;}// AST REWRITE
// elements: handshape1, palmor1, extfidir1
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 644:6: -> ^( HDCONFIG1 handshape1 ( extfidir1 )? ( palmor1 )? )
{// Ham4Parser.g:644:9: ^( HDCONFIG1 handshape1 ( extfidir1 )? ( palmor1 )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(HDCONFIG1,"HDCONFIG1"),root_1);this.adaptor.addChild(root_1,stream_handshape1.nextTree());// Ham4Parser.g:644:32: ( extfidir1 )?
if(stream_extfidir1.hasNext()){this.adaptor.addChild(root_1,stream_extfidir1.nextTree());}stream_extfidir1.reset();// Ham4Parser.g:644:43: ( palmor1 )?
if(stream_palmor1.hasNext()){this.adaptor.addChild(root_1,stream_palmor1.nextTree());}stream_palmor1.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: handconfig1 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
splithandconfig2_return:function(){Ham4Parser.splithandconfig2_return=function(){};org.antlr.lang.extend(Ham4Parser.splithandconfig2_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:649:1: splithandconfig2 : HamParbegin handconfig1 HamPlus handconfig1 HamParend -> ^( SPLITHDCFG2 ( handconfig1 )* ) ;
// $ANTLR start "splithandconfig2"
splithandconfig2:function(){var retval=new Ham4Parser.splithandconfig2_return();retval.start=this.input.LT(1);var root_0=null;var HamParbegin58=null;var HamPlus60=null;var HamParend62=null;var handconfig159=null;var handconfig161=null;var HamParbegin58_tree=null;var HamPlus60_tree=null;var HamParend62_tree=null;var stream_HamPlus=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamPlus");var stream_HamParend=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamParend");var stream_HamParbegin=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamParbegin");var stream_handconfig1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule handconfig1");this.trace("ANTLR Parse: splithandconfig2 starts "+this.state.backtracking);try{// Ham4Parser.g:669:5: ( HamParbegin handconfig1 HamPlus handconfig1 HamParend -> ^( SPLITHDCFG2 ( handconfig1 )* ) )
// Ham4Parser.g:669:9: HamParbegin handconfig1 HamPlus handconfig1 HamParend
HamParbegin58=this.match(this.input,HamParbegin,Ham4Parser.FOLLOW_HamParbegin_in_splithandconfig22692);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamParbegin.add(HamParbegin58);this.pushFollow(Ham4Parser.FOLLOW_handconfig1_in_splithandconfig22703);handconfig159=this.handconfig1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handconfig1.add(handconfig159.getTree());HamPlus60=this.match(this.input,HamPlus,Ham4Parser.FOLLOW_HamPlus_in_splithandconfig22713);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamPlus.add(HamPlus60);this.pushFollow(Ham4Parser.FOLLOW_handconfig1_in_splithandconfig22724);handconfig161=this.handconfig1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handconfig1.add(handconfig161.getTree());HamParend62=this.match(this.input,HamParend,Ham4Parser.FOLLOW_HamParend_in_splithandconfig22734);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamParend.add(HamParend62);// AST REWRITE
// elements: handconfig1
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 675:6: -> ^( SPLITHDCFG2 ( handconfig1 )* )
{// Ham4Parser.g:675:9: ^( SPLITHDCFG2 ( handconfig1 )* )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(SPLITHDCFG2,"SPLITHDCFG2"),root_1);// Ham4Parser.g:675:23: ( handconfig1 )*
while(stream_handconfig1.hasNext()){this.adaptor.addChild(root_1,stream_handconfig1.nextTree());}stream_handconfig1.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: splithandconfig2 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
handconfigtail2_return:function(){Ham4Parser.handconfigtail2_return=function(){};org.antlr.lang.extend(Ham4Parser.handconfigtail2_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:678:1: handconfigtail2 : ( ( extfidir2 )=> extfidir2 palmor2 -> ^( HDCFGTAIL2 extfidir2 palmor2 ) | HamParbegin efd1= extfidir1 por1= palmor1 HamPlus efd2= extfidir1 por2= palmor1 HamParend -> ^( HDCFGTAIL2 $efd1 $por1 $efd2 $por2) ) ;
// $ANTLR start "handconfigtail2"
handconfigtail2:function(){var retval=new Ham4Parser.handconfigtail2_return();retval.start=this.input.LT(1);var root_0=null;var HamParbegin65=null;var HamPlus66=null;var HamParend67=null;var efd1=null;var por1=null;var efd2=null;var por2=null;var extfidir263=null;var palmor264=null;var HamParbegin65_tree=null;var HamPlus66_tree=null;var HamParend67_tree=null;var stream_HamPlus=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamPlus");var stream_HamParend=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamParend");var stream_HamParbegin=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamParbegin");var stream_palmor2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule palmor2");var stream_palmor1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule palmor1");var stream_extfidir1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule extfidir1");var stream_extfidir2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule extfidir2");this.trace("ANTLR Parse: handconfigtail2 starts "+this.state.backtracking);try{// Ham4Parser.g:708:5: ( ( ( extfidir2 )=> extfidir2 palmor2 -> ^( HDCFGTAIL2 extfidir2 palmor2 ) | HamParbegin efd1= extfidir1 por1= palmor1 HamPlus efd2= extfidir1 por2= palmor1 HamParend -> ^( HDCFGTAIL2 $efd1 $por1 $efd2 $por2) ) )
// Ham4Parser.g:709:5: ( ( extfidir2 )=> extfidir2 palmor2 -> ^( HDCFGTAIL2 extfidir2 palmor2 ) | HamParbegin efd1= extfidir1 por1= palmor1 HamPlus efd2= extfidir1 por2= palmor1 HamParend -> ^( HDCFGTAIL2 $efd1 $por1 $efd2 $por2) )
// Ham4Parser.g:709:5: ( ( extfidir2 )=> extfidir2 palmor2 -> ^( HDCFGTAIL2 extfidir2 palmor2 ) | HamParbegin efd1= extfidir1 por1= palmor1 HamPlus efd2= extfidir1 por2= palmor1 HamParend -> ^( HDCFGTAIL2 $efd1 $por1 $efd2 $por2) )
var alt21=2;alt21=this.dfa21.predict(this.input);switch(alt21){case 1:// Ham4Parser.g:710:9: ( extfidir2 )=> extfidir2 palmor2
this.pushFollow(Ham4Parser.FOLLOW_extfidir2_in_handconfigtail22823);extfidir263=this.extfidir2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_extfidir2.add(extfidir263.getTree());this.pushFollow(Ham4Parser.FOLLOW_palmor2_in_handconfigtail22833);palmor264=this.palmor2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_palmor2.add(palmor264.getTree());// AST REWRITE
// elements: palmor2, extfidir2
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 714:5: -> ^( HDCFGTAIL2 extfidir2 palmor2 )
{// Ham4Parser.g:714:8: ^( HDCFGTAIL2 extfidir2 palmor2 )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(HDCFGTAIL2,"HDCFGTAIL2"),root_1);this.adaptor.addChild(root_1,stream_extfidir2.nextTree());this.adaptor.addChild(root_1,stream_palmor2.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;case 2:// Ham4Parser.g:716:9: HamParbegin efd1= extfidir1 por1= palmor1 HamPlus efd2= extfidir1 por2= palmor1 HamParend
HamParbegin65=this.match(this.input,HamParbegin,Ham4Parser.FOLLOW_HamParbegin_in_handconfigtail22863);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamParbegin.add(HamParbegin65);this.pushFollow(Ham4Parser.FOLLOW_extfidir1_in_handconfigtail22876);efd1=this.extfidir1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_extfidir1.add(efd1.getTree());this.pushFollow(Ham4Parser.FOLLOW_palmor1_in_handconfigtail22888);por1=this.palmor1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_palmor1.add(por1.getTree());HamPlus66=this.match(this.input,HamPlus,Ham4Parser.FOLLOW_HamPlus_in_handconfigtail22898);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamPlus.add(HamPlus66);this.pushFollow(Ham4Parser.FOLLOW_extfidir1_in_handconfigtail22911);efd2=this.extfidir1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_extfidir1.add(efd2.getTree());this.pushFollow(Ham4Parser.FOLLOW_palmor1_in_handconfigtail22923);por2=this.palmor1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_palmor1.add(por2.getTree());HamParend67=this.match(this.input,HamParend,Ham4Parser.FOLLOW_HamParend_in_handconfigtail22933);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamParend.add(HamParend67);// AST REWRITE
// elements: por1, efd2, por2, efd1
// token labels: 
// rule labels: efd2, efd1, por1, por2, retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_efd2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token efd2",efd2!=null?efd2.tree:null);var stream_efd1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token efd1",efd1!=null?efd1.tree:null);var stream_por1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token por1",por1!=null?por1.tree:null);var stream_por2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token por2",por2!=null?por2.tree:null);var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 723:5: -> ^( HDCFGTAIL2 $efd1 $por1 $efd2 $por2)
{// Ham4Parser.g:723:8: ^( HDCFGTAIL2 $efd1 $por1 $efd2 $por2)
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(HDCFGTAIL2,"HDCFGTAIL2"),root_1);this.adaptor.addChild(root_1,stream_efd1.nextTree());this.adaptor.addChild(root_1,stream_por1.nextTree());this.adaptor.addChild(root_1,stream_efd2.nextTree());this.adaptor.addChild(root_1,stream_por2.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: handconfigtail2 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
handshape2_return:function(){Ham4Parser.handshape2_return=function(){};org.antlr.lang.extend(Ham4Parser.handshape2_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:730:1: handshape2 : ( handshape1 -> ^( HSHAPE2 handshape1 ) | HamParbegin hs1= handshape1 HamPlus hs2= handshape1 HamParend -> ^( HSHAPE2 $hs1 $hs2) ) ;
// $ANTLR start "handshape2"
handshape2:function(){var retval=new Ham4Parser.handshape2_return();retval.start=this.input.LT(1);var root_0=null;var HamParbegin69=null;var HamPlus70=null;var HamParend71=null;var hs1=null;var hs2=null;var handshape168=null;var HamParbegin69_tree=null;var HamPlus70_tree=null;var HamParend71_tree=null;var stream_HamPlus=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamPlus");var stream_HamParend=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamParend");var stream_HamParbegin=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamParbegin");var stream_handshape1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule handshape1");this.trace("ANTLR Parse: handshape2 starts "+this.state.backtracking);try{// Ham4Parser.g:755:5: ( ( handshape1 -> ^( HSHAPE2 handshape1 ) | HamParbegin hs1= handshape1 HamPlus hs2= handshape1 HamParend -> ^( HSHAPE2 $hs1 $hs2) ) )
// Ham4Parser.g:756:5: ( handshape1 -> ^( HSHAPE2 handshape1 ) | HamParbegin hs1= handshape1 HamPlus hs2= handshape1 HamParend -> ^( HSHAPE2 $hs1 $hs2) )
// Ham4Parser.g:756:5: ( handshape1 -> ^( HSHAPE2 handshape1 ) | HamParbegin hs1= handshape1 HamPlus hs2= handshape1 HamParend -> ^( HSHAPE2 $hs1 $hs2) )
var alt22=2;var LA22_0=this.input.LA(1);if(LA22_0>=HamFist&&LA22_0<=HamFinger2345||LA22_0>=HamPinch12&&LA22_0<=HamCee12open||LA22_0==HamNondominant){alt22=1;}else if(LA22_0==HamParbegin){alt22=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",22,0,this.input);throw nvae;}switch(alt22){case 1:// Ham4Parser.g:757:9: handshape1
this.pushFollow(Ham4Parser.FOLLOW_handshape1_in_handshape23006);handshape168=this.handshape1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handshape1.add(handshape168.getTree());// AST REWRITE
// elements: handshape1
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 758:6: -> ^( HSHAPE2 handshape1 )
{// Ham4Parser.g:758:9: ^( HSHAPE2 handshape1 )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(HSHAPE2,"HSHAPE2"),root_1);this.adaptor.addChild(root_1,stream_handshape1.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;case 2:// Ham4Parser.g:760:9: HamParbegin hs1= handshape1 HamPlus hs2= handshape1 HamParend
HamParbegin69=this.match(this.input,HamParbegin,Ham4Parser.FOLLOW_HamParbegin_in_handshape23035);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamParbegin.add(HamParbegin69);this.pushFollow(Ham4Parser.FOLLOW_handshape1_in_handshape23050);hs1=this.handshape1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handshape1.add(hs1.getTree());HamPlus70=this.match(this.input,HamPlus,Ham4Parser.FOLLOW_HamPlus_in_handshape23060);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamPlus.add(HamPlus70);this.pushFollow(Ham4Parser.FOLLOW_handshape1_in_handshape23075);hs2=this.handshape1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handshape1.add(hs2.getTree());HamParend71=this.match(this.input,HamParend,Ham4Parser.FOLLOW_HamParend_in_handshape23085);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamParend.add(HamParend71);// AST REWRITE
// elements: hs1, hs2
// token labels: 
// rule labels: hs2, hs1, retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_hs2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token hs2",hs2!=null?hs2.tree:null);var stream_hs1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token hs1",hs1!=null?hs1.tree:null);var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 765:6: -> ^( HSHAPE2 $hs1 $hs2)
{// Ham4Parser.g:765:9: ^( HSHAPE2 $hs1 $hs2)
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(HSHAPE2,"HSHAPE2"),root_1);this.adaptor.addChild(root_1,stream_hs1.nextTree());this.adaptor.addChild(root_1,stream_hs2.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: handshape2 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
handshape1_return:function(){Ham4Parser.handshape1_return=function(){};org.antlr.lang.extend(Ham4Parser.handshape1_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:769:1: handshape1 : basichandshape1 ( ( ( hsfingeritem )+ HamBetween finger )=> cautiousfingerlist fingershapelist fingercrossinglist thumbbetweenexplicit | ( ( hsdigit )* ( fingerbending | fingerpart ) )=> cautiousfingerlist fingershapelist fingercrossinglist ( ( thumbspecial )=> thumbspecial )? | ( ( hsfingeritem )* ( thumbbetweendefault | thumbextra ) )=> fingerlist fingershapelist fingercrossinglist ( thumbbetweendefault | thumbextra ) | fingerlist fingershapelist fingercrossinglist ) -> ^( HSHAPE1 basichandshape1 ( cautiousfingerlist )? ( fingerlist )? ( fingershapelist )? ( fingercrossinglist )? ( thumbbetweenexplicit )? ( thumbspecial )? ( thumbbetweendefault )? ( thumbextra )? ) ;
// $ANTLR start "handshape1"
handshape1:function(){var retval=new Ham4Parser.handshape1_return();retval.start=this.input.LT(1);var root_0=null;var basichandshape172=null;var cautiousfingerlist73=null;var fingershapelist74=null;var fingercrossinglist75=null;var thumbbetweenexplicit76=null;var cautiousfingerlist77=null;var fingershapelist78=null;var fingercrossinglist79=null;var thumbspecial80=null;var fingerlist81=null;var fingershapelist82=null;var fingercrossinglist83=null;var thumbbetweendefault84=null;var thumbextra85=null;var fingerlist86=null;var fingershapelist87=null;var fingercrossinglist88=null;var stream_thumbbetweenexplicit=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule thumbbetweenexplicit");var stream_cautiousfingerlist=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule cautiousfingerlist");var stream_thumbspecial=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule thumbspecial");var stream_thumbbetweendefault=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule thumbbetweendefault");var stream_basichandshape1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule basichandshape1");var stream_fingershapelist=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule fingershapelist");var stream_fingercrossinglist=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule fingercrossinglist");var stream_fingerlist=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule fingerlist");var stream_thumbextra=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule thumbextra");this.trace("ANTLR Parse: handshape1 starts "+this.state.backtracking);try{// Ham4Parser.g:817:5: ( basichandshape1 ( ( ( hsfingeritem )+ HamBetween finger )=> cautiousfingerlist fingershapelist fingercrossinglist thumbbetweenexplicit | ( ( hsdigit )* ( fingerbending | fingerpart ) )=> cautiousfingerlist fingershapelist fingercrossinglist ( ( thumbspecial )=> thumbspecial )? | ( ( hsfingeritem )* ( thumbbetweendefault | thumbextra ) )=> fingerlist fingershapelist fingercrossinglist ( thumbbetweendefault | thumbextra ) | fingerlist fingershapelist fingercrossinglist ) -> ^( HSHAPE1 basichandshape1 ( cautiousfingerlist )? ( fingerlist )? ( fingershapelist )? ( fingercrossinglist )? ( thumbbetweenexplicit )? ( thumbspecial )? ( thumbbetweendefault )? ( thumbextra )? ) )
// Ham4Parser.g:817:7: basichandshape1 ( ( ( hsfingeritem )+ HamBetween finger )=> cautiousfingerlist fingershapelist fingercrossinglist thumbbetweenexplicit | ( ( hsdigit )* ( fingerbending | fingerpart ) )=> cautiousfingerlist fingershapelist fingercrossinglist ( ( thumbspecial )=> thumbspecial )? | ( ( hsfingeritem )* ( thumbbetweendefault | thumbextra ) )=> fingerlist fingershapelist fingercrossinglist ( thumbbetweendefault | thumbextra ) | fingerlist fingershapelist fingercrossinglist )
this.pushFollow(Ham4Parser.FOLLOW_basichandshape1_in_handshape13136);basichandshape172=this.basichandshape1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_basichandshape1.add(basichandshape172.getTree());// Ham4Parser.g:818:9: ( ( ( hsfingeritem )+ HamBetween finger )=> cautiousfingerlist fingershapelist fingercrossinglist thumbbetweenexplicit | ( ( hsdigit )* ( fingerbending | fingerpart ) )=> cautiousfingerlist fingershapelist fingercrossinglist ( ( thumbspecial )=> thumbspecial )? | ( ( hsfingeritem )* ( thumbbetweendefault | thumbextra ) )=> fingerlist fingershapelist fingercrossinglist ( thumbbetweendefault | thumbextra ) | fingerlist fingershapelist fingercrossinglist )
var alt25=4;alt25=this.dfa25.predict(this.input);switch(alt25){case 1:// Ham4Parser.g:819:13: ( ( hsfingeritem )+ HamBetween finger )=> cautiousfingerlist fingershapelist fingercrossinglist thumbbetweenexplicit
this.pushFollow(Ham4Parser.FOLLOW_cautiousfingerlist_in_handshape13201);cautiousfingerlist73=this.cautiousfingerlist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_cautiousfingerlist.add(cautiousfingerlist73.getTree());this.pushFollow(Ham4Parser.FOLLOW_fingershapelist_in_handshape13215);fingershapelist74=this.fingershapelist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_fingershapelist.add(fingershapelist74.getTree());this.pushFollow(Ham4Parser.FOLLOW_fingercrossinglist_in_handshape13229);fingercrossinglist75=this.fingercrossinglist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_fingercrossinglist.add(fingercrossinglist75.getTree());this.pushFollow(Ham4Parser.FOLLOW_thumbbetweenexplicit_in_handshape13243);thumbbetweenexplicit76=this.thumbbetweenexplicit();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_thumbbetweenexplicit.add(thumbbetweenexplicit76.getTree());break;case 2:// Ham4Parser.g:827:13: ( ( hsdigit )* ( fingerbending | fingerpart ) )=> cautiousfingerlist fingershapelist fingercrossinglist ( ( thumbspecial )=> thumbspecial )?
this.pushFollow(Ham4Parser.FOLLOW_cautiousfingerlist_in_handshape13321);cautiousfingerlist77=this.cautiousfingerlist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_cautiousfingerlist.add(cautiousfingerlist77.getTree());this.pushFollow(Ham4Parser.FOLLOW_fingershapelist_in_handshape13335);fingershapelist78=this.fingershapelist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_fingershapelist.add(fingershapelist78.getTree());this.pushFollow(Ham4Parser.FOLLOW_fingercrossinglist_in_handshape13349);fingercrossinglist79=this.fingercrossinglist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_fingercrossinglist.add(fingercrossinglist79.getTree());// Ham4Parser.g:832:13: ( ( thumbspecial )=> thumbspecial )?
var alt23=2;alt23=this.dfa23.predict(this.input);switch(alt23){case 1:// Ham4Parser.g:832:15: ( thumbspecial )=> thumbspecial
this.pushFollow(Ham4Parser.FOLLOW_thumbspecial_in_handshape13373);thumbspecial80=this.thumbspecial();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_thumbspecial.add(thumbspecial80.getTree());break;}break;case 3:// Ham4Parser.g:835:13: ( ( hsfingeritem )* ( thumbbetweendefault | thumbextra ) )=> fingerlist fingershapelist fingercrossinglist ( thumbbetweendefault | thumbextra )
this.pushFollow(Ham4Parser.FOLLOW_fingerlist_in_handshape13454);fingerlist81=this.fingerlist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_fingerlist.add(fingerlist81.getTree());this.pushFollow(Ham4Parser.FOLLOW_fingershapelist_in_handshape13468);fingershapelist82=this.fingershapelist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_fingershapelist.add(fingershapelist82.getTree());this.pushFollow(Ham4Parser.FOLLOW_fingercrossinglist_in_handshape13482);fingercrossinglist83=this.fingercrossinglist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_fingercrossinglist.add(fingercrossinglist83.getTree());// Ham4Parser.g:840:13: ( thumbbetweendefault | thumbextra )
var alt24=2;var LA24_0=this.input.LA(1);if(LA24_0==HamBetween){alt24=1;}else if(LA24_0==HamThumb||LA24_0>=HamFingertip&&LA24_0<=HamFingerside){alt24=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",24,0,this.input);throw nvae;}switch(alt24){case 1:// Ham4Parser.g:840:15: thumbbetweendefault
this.pushFollow(Ham4Parser.FOLLOW_thumbbetweendefault_in_handshape13498);thumbbetweendefault84=this.thumbbetweendefault();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_thumbbetweendefault.add(thumbbetweendefault84.getTree());break;case 2:// Ham4Parser.g:840:37: thumbextra
this.pushFollow(Ham4Parser.FOLLOW_thumbextra_in_handshape13502);thumbextra85=this.thumbextra();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_thumbextra.add(thumbextra85.getTree());break;}break;case 4:// Ham4Parser.g:843:13: fingerlist fingershapelist fingercrossinglist
this.pushFollow(Ham4Parser.FOLLOW_fingerlist_in_handshape13535);fingerlist86=this.fingerlist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_fingerlist.add(fingerlist86.getTree());this.pushFollow(Ham4Parser.FOLLOW_fingershapelist_in_handshape13549);fingershapelist87=this.fingershapelist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_fingershapelist.add(fingershapelist87.getTree());this.pushFollow(Ham4Parser.FOLLOW_fingercrossinglist_in_handshape13563);fingercrossinglist88=this.fingercrossinglist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_fingercrossinglist.add(fingercrossinglist88.getTree());break;}// AST REWRITE
// elements: thumbspecial, thumbbetweendefault, cautiousfingerlist, basichandshape1, fingershapelist, fingercrossinglist, thumbbetweenexplicit, fingerlist, thumbextra
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 850:2: -> ^( HSHAPE1 basichandshape1 ( cautiousfingerlist )? ( fingerlist )? ( fingershapelist )? ( fingercrossinglist )? ( thumbbetweenexplicit )? ( thumbspecial )? ( thumbbetweendefault )? ( thumbextra )? )
{// Ham4Parser.g:850:5: ^( HSHAPE1 basichandshape1 ( cautiousfingerlist )? ( fingerlist )? ( fingershapelist )? ( fingercrossinglist )? ( thumbbetweenexplicit )? ( thumbspecial )? ( thumbbetweendefault )? ( thumbextra )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(HSHAPE1,"HSHAPE1"),root_1);this.adaptor.addChild(root_1,stream_basichandshape1.nextTree());// Ham4Parser.g:850:31: ( cautiousfingerlist )?
if(stream_cautiousfingerlist.hasNext()){this.adaptor.addChild(root_1,stream_cautiousfingerlist.nextTree());}stream_cautiousfingerlist.reset();// Ham4Parser.g:850:51: ( fingerlist )?
if(stream_fingerlist.hasNext()){this.adaptor.addChild(root_1,stream_fingerlist.nextTree());}stream_fingerlist.reset();// Ham4Parser.g:850:63: ( fingershapelist )?
if(stream_fingershapelist.hasNext()){this.adaptor.addChild(root_1,stream_fingershapelist.nextTree());}stream_fingershapelist.reset();// Ham4Parser.g:850:80: ( fingercrossinglist )?
if(stream_fingercrossinglist.hasNext()){this.adaptor.addChild(root_1,stream_fingercrossinglist.nextTree());}stream_fingercrossinglist.reset();// Ham4Parser.g:851:4: ( thumbbetweenexplicit )?
if(stream_thumbbetweenexplicit.hasNext()){this.adaptor.addChild(root_1,stream_thumbbetweenexplicit.nextTree());}stream_thumbbetweenexplicit.reset();// Ham4Parser.g:851:26: ( thumbspecial )?
if(stream_thumbspecial.hasNext()){this.adaptor.addChild(root_1,stream_thumbspecial.nextTree());}stream_thumbspecial.reset();// Ham4Parser.g:851:40: ( thumbbetweendefault )?
if(stream_thumbbetweendefault.hasNext()){this.adaptor.addChild(root_1,stream_thumbbetweendefault.nextTree());}stream_thumbbetweendefault.reset();// Ham4Parser.g:851:61: ( thumbextra )?
if(stream_thumbextra.hasNext()){this.adaptor.addChild(root_1,stream_thumbextra.nextTree());}stream_thumbextra.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: handshape1 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
basichandshape1_return:function(){Ham4Parser.basichandshape1_return=function(){};org.antlr.lang.extend(Ham4Parser.basichandshape1_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:854:1: basichandshape1 : basichandshape ( ( HamBetween handshapeclass )=> HamBetween basichandshape )? -> ^( BASICHDSHP1 ( basichandshape )* ) ;
// $ANTLR start "basichandshape1"
basichandshape1:function(){var retval=new Ham4Parser.basichandshape1_return();retval.start=this.input.LT(1);var root_0=null;var HamBetween90=null;var basichandshape89=null;var basichandshape91=null;var HamBetween90_tree=null;var stream_HamBetween=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamBetween");var stream_basichandshape=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule basichandshape");this.trace("ANTLR Parse: basichandshape1 starts "+this.state.backtracking);try{// Ham4Parser.g:875:5: ( basichandshape ( ( HamBetween handshapeclass )=> HamBetween basichandshape )? -> ^( BASICHDSHP1 ( basichandshape )* ) )
// Ham4Parser.g:875:9: basichandshape ( ( HamBetween handshapeclass )=> HamBetween basichandshape )?
this.pushFollow(Ham4Parser.FOLLOW_basichandshape_in_basichandshape13649);basichandshape89=this.basichandshape();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_basichandshape.add(basichandshape89.getTree());// Ham4Parser.g:876:9: ( ( HamBetween handshapeclass )=> HamBetween basichandshape )?
var alt26=2;alt26=this.dfa26.predict(this.input);switch(alt26){case 1:// Ham4Parser.g:877:13: ( HamBetween handshapeclass )=> HamBetween basichandshape
HamBetween90=this.match(this.input,HamBetween,Ham4Parser.FOLLOW_HamBetween_in_basichandshape13714);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamBetween.add(HamBetween90);this.pushFollow(Ham4Parser.FOLLOW_basichandshape_in_basichandshape13729);basichandshape91=this.basichandshape();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_basichandshape.add(basichandshape91.getTree());break;}// AST REWRITE
// elements: basichandshape
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 882:6: -> ^( BASICHDSHP1 ( basichandshape )* )
{// Ham4Parser.g:882:9: ^( BASICHDSHP1 ( basichandshape )* )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(BASICHDSHP1,"BASICHDSHP1"),root_1);// Ham4Parser.g:882:23: ( basichandshape )*
while(stream_basichandshape.hasNext()){this.adaptor.addChild(root_1,stream_basichandshape.nextTree());}stream_basichandshape.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: basichandshape1 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
basichandshape_return:function(){Ham4Parser.basichandshape_return=function(){};org.antlr.lang.extend(Ham4Parser.basichandshape_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:885:1: basichandshape : ( handshapeclass | HamNondominant ) ( HamEtc )? ( handbendandthumb )? -> ^( BASICHDSHP ( handshapeclass )? ( HamNondominant )? ( HamEtc )? ( handbendandthumb )? ) ;
// $ANTLR start "basichandshape"
basichandshape:function(){var retval=new Ham4Parser.basichandshape_return();retval.start=this.input.LT(1);var root_0=null;var HamNondominant93=null;var HamEtc94=null;var handshapeclass92=null;var handbendandthumb95=null;var HamNondominant93_tree=null;var HamEtc94_tree=null;var stream_HamNondominant=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamNondominant");var stream_HamEtc=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamEtc");var stream_handshapeclass=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule handshapeclass");var stream_handbendandthumb=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule handbendandthumb");this.trace("ANTLR Parse: basichandshape starts "+this.state.backtracking);try{// Ham4Parser.g:907:5: ( ( handshapeclass | HamNondominant ) ( HamEtc )? ( handbendandthumb )? -> ^( BASICHDSHP ( handshapeclass )? ( HamNondominant )? ( HamEtc )? ( handbendandthumb )? ) )
// Ham4Parser.g:907:9: ( handshapeclass | HamNondominant ) ( HamEtc )? ( handbendandthumb )?
// Ham4Parser.g:907:9: ( handshapeclass | HamNondominant )
var alt27=2;var LA27_0=this.input.LA(1);if(LA27_0>=HamFist&&LA27_0<=HamFinger2345||LA27_0>=HamPinch12&&LA27_0<=HamCee12open){alt27=1;}else if(LA27_0==HamNondominant){alt27=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",27,0,this.input);throw nvae;}switch(alt27){case 1:// Ham4Parser.g:908:13: handshapeclass
this.pushFollow(Ham4Parser.FOLLOW_handshapeclass_in_basichandshape3797);handshapeclass92=this.handshapeclass();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handshapeclass.add(handshapeclass92.getTree());break;case 2:// Ham4Parser.g:910:13: HamNondominant
HamNondominant93=this.match(this.input,HamNondominant,Ham4Parser.FOLLOW_HamNondominant_in_basichandshape3821);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamNondominant.add(HamNondominant93);break;}// Ham4Parser.g:912:9: ( HamEtc )?
var alt28=2;var LA28_0=this.input.LA(1);if(LA28_0==HamEtc){alt28=1;}switch(alt28){case 1:// Ham4Parser.g:912:11: HamEtc
HamEtc94=this.match(this.input,HamEtc,Ham4Parser.FOLLOW_HamEtc_in_basichandshape3843);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamEtc.add(HamEtc94);break;}// Ham4Parser.g:913:9: ( handbendandthumb )?
var alt29=2;var LA29_0=this.input.LA(1);if(LA29_0>=HamThumboutmod&&LA29_0<=HamThumbacrossmod||LA29_0>=HamThumbopenmod&&LA29_0<=HamFingerhookedmod||LA29_0>=HamDoublebent&&LA29_0<=HamDoublehooked){alt29=1;}switch(alt29){case 1:// Ham4Parser.g:913:9: handbendandthumb
this.pushFollow(Ham4Parser.FOLLOW_handbendandthumb_in_basichandshape3856);handbendandthumb95=this.handbendandthumb();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handbendandthumb.add(handbendandthumb95.getTree());break;}// AST REWRITE
// elements: handbendandthumb, handshapeclass, HamEtc, HamNondominant
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 915:9: -> ^( BASICHDSHP ( handshapeclass )? ( HamNondominant )? ( HamEtc )? ( handbendandthumb )? )
{// Ham4Parser.g:915:12: ^( BASICHDSHP ( handshapeclass )? ( HamNondominant )? ( HamEtc )? ( handbendandthumb )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(BASICHDSHP,"BASICHDSHP"),root_1);// Ham4Parser.g:915:25: ( handshapeclass )?
if(stream_handshapeclass.hasNext()){this.adaptor.addChild(root_1,stream_handshapeclass.nextTree());}stream_handshapeclass.reset();// Ham4Parser.g:915:41: ( HamNondominant )?
if(stream_HamNondominant.hasNext()){this.adaptor.addChild(root_1,stream_HamNondominant.nextNode());}stream_HamNondominant.reset();// Ham4Parser.g:915:57: ( HamEtc )?
if(stream_HamEtc.hasNext()){this.adaptor.addChild(root_1,stream_HamEtc.nextNode());}stream_HamEtc.reset();// Ham4Parser.g:915:65: ( handbendandthumb )?
if(stream_handbendandthumb.hasNext()){this.adaptor.addChild(root_1,stream_handbendandthumb.nextTree());}stream_handbendandthumb.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: basichandshape finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
handbendandthumb_return:function(){Ham4Parser.handbendandthumb_return=function(){};org.antlr.lang.extend(Ham4Parser.handbendandthumb_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:918:1: handbendandthumb : ( thumbpos ( fingerbending )? | fingerbending ( thumbpos )? );
// $ANTLR start "handbendandthumb"
handbendandthumb:function(){var retval=new Ham4Parser.handbendandthumb_return();retval.start=this.input.LT(1);var root_0=null;var thumbpos96=null;var fingerbending97=null;var fingerbending98=null;var thumbpos99=null;this.trace("ANTLR Parse: handbendandthumb starts "+this.state.backtracking);try{// Ham4Parser.g:937:5: ( thumbpos ( fingerbending )? | fingerbending ( thumbpos )? )
var alt32=2;var LA32_0=this.input.LA(1);if(LA32_0>=HamThumboutmod&&LA32_0<=HamThumbacrossmod||LA32_0==HamThumbopenmod){alt32=1;}else if(LA32_0>=HamFingerstraightmod&&LA32_0<=HamFingerhookedmod||LA32_0>=HamDoublebent&&LA32_0<=HamDoublehooked){alt32=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",32,0,this.input);throw nvae;}switch(alt32){case 1:// Ham4Parser.g:938:9: thumbpos ( fingerbending )?
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_thumbpos_in_handbendandthumb3927);thumbpos96=this.thumbpos();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,thumbpos96.getTree());// Ham4Parser.g:939:9: ( fingerbending )?
var alt30=2;var LA30_0=this.input.LA(1);if(LA30_0>=HamFingerstraightmod&&LA30_0<=HamFingerhookedmod||LA30_0>=HamDoublebent&&LA30_0<=HamDoublehooked){alt30=1;}switch(alt30){case 1:// Ham4Parser.g:939:11: fingerbending
this.pushFollow(Ham4Parser.FOLLOW_fingerbending_in_handbendandthumb3939);fingerbending97=this.fingerbending();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,fingerbending97.getTree());break;}break;case 2:// Ham4Parser.g:941:9: fingerbending ( thumbpos )?
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_fingerbending_in_handbendandthumb3958);fingerbending98=this.fingerbending();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,fingerbending98.getTree());// Ham4Parser.g:942:9: ( thumbpos )?
var alt31=2;var LA31_0=this.input.LA(1);if(LA31_0>=HamThumboutmod&&LA31_0<=HamThumbacrossmod||LA31_0==HamThumbopenmod){alt31=1;}switch(alt31){case 1:// Ham4Parser.g:942:11: thumbpos
this.pushFollow(Ham4Parser.FOLLOW_thumbpos_in_handbendandthumb3970);thumbpos99=this.thumbpos();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,thumbpos99.getTree());break;}break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: handbendandthumb finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
fingerlist_return:function(){Ham4Parser.fingerlist_return=function(){};org.antlr.lang.extend(Ham4Parser.fingerlist_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:945:1: fingerlist : recfingerlist -> ^( FINGERLIST ( recfingerlist )? ) ;
// $ANTLR start "fingerlist"
fingerlist:function(){var retval=new Ham4Parser.fingerlist_return();retval.start=this.input.LT(1);var root_0=null;var recfingerlist100=null;var stream_recfingerlist=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule recfingerlist");this.trace("ANTLR Parse: fingerlist starts "+this.state.backtracking);try{// Ham4Parser.g:960:5: ( recfingerlist -> ^( FINGERLIST ( recfingerlist )? ) )
// Ham4Parser.g:960:9: recfingerlist
this.pushFollow(Ham4Parser.FOLLOW_recfingerlist_in_fingerlist4002);recfingerlist100=this.recfingerlist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_recfingerlist.add(recfingerlist100.getTree());// AST REWRITE
// elements: recfingerlist
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 961:5: -> ^( FINGERLIST ( recfingerlist )? )
{// Ham4Parser.g:961:8: ^( FINGERLIST ( recfingerlist )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(FINGERLIST,"FINGERLIST"),root_1);// Ham4Parser.g:961:21: ( recfingerlist )?
if(stream_recfingerlist.hasNext()){this.adaptor.addChild(root_1,stream_recfingerlist.nextTree());}stream_recfingerlist.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: fingerlist finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
recfingerlist_return:function(){Ham4Parser.recfingerlist_return=function(){};org.antlr.lang.extend(Ham4Parser.recfingerlist_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:964:1: recfingerlist : ( ( hsfingeritem )=> hsfingeritem recfingerlist )? ;
// $ANTLR start "recfingerlist"
recfingerlist:function(){var retval=new Ham4Parser.recfingerlist_return();retval.start=this.input.LT(1);var root_0=null;var hsfingeritem101=null;var recfingerlist102=null;this.trace("ANTLR Parse: recfingerlist starts "+this.state.backtracking);try{// Ham4Parser.g:984:5: ( ( ( hsfingeritem )=> hsfingeritem recfingerlist )? )
// Ham4Parser.g:985:9: ( ( hsfingeritem )=> hsfingeritem recfingerlist )?
root_0=this.adaptor.nil();// Ham4Parser.g:985:9: ( ( hsfingeritem )=> hsfingeritem recfingerlist )?
var alt33=2;alt33=this.dfa33.predict(this.input);switch(alt33){case 1:// Ham4Parser.g:986:13: ( hsfingeritem )=> hsfingeritem recfingerlist
this.pushFollow(Ham4Parser.FOLLOW_hsfingeritem_in_recfingerlist4111);hsfingeritem101=this.hsfingeritem();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,hsfingeritem101.getTree());this.pushFollow(Ham4Parser.FOLLOW_recfingerlist_in_recfingerlist4125);recfingerlist102=this.recfingerlist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,recfingerlist102.getTree());break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: recfingerlist finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
cautiousfingerlist_return:function(){Ham4Parser.cautiousfingerlist_return=function(){};org.antlr.lang.extend(Ham4Parser.cautiousfingerlist_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:993:1: cautiousfingerlist : reccautiousfingerlist -> ^( FINGERLIST ( reccautiousfingerlist )? ) ;
// $ANTLR start "cautiousfingerlist"
cautiousfingerlist:function(){var retval=new Ham4Parser.cautiousfingerlist_return();retval.start=this.input.LT(1);var root_0=null;var reccautiousfingerlist103=null;var stream_reccautiousfingerlist=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule reccautiousfingerlist");this.trace("ANTLR Parse: cautiousfingerlist starts "+this.state.backtracking);try{// Ham4Parser.g:1008:5: ( reccautiousfingerlist -> ^( FINGERLIST ( reccautiousfingerlist )? ) )
// Ham4Parser.g:1008:9: reccautiousfingerlist
this.pushFollow(Ham4Parser.FOLLOW_reccautiousfingerlist_in_cautiousfingerlist4165);reccautiousfingerlist103=this.reccautiousfingerlist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_reccautiousfingerlist.add(reccautiousfingerlist103.getTree());// AST REWRITE
// elements: reccautiousfingerlist
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1009:5: -> ^( FINGERLIST ( reccautiousfingerlist )? )
{// Ham4Parser.g:1009:8: ^( FINGERLIST ( reccautiousfingerlist )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(FINGERLIST,"FINGERLIST"),root_1);// Ham4Parser.g:1009:21: ( reccautiousfingerlist )?
if(stream_reccautiousfingerlist.hasNext()){this.adaptor.addChild(root_1,stream_reccautiousfingerlist.nextTree());}stream_reccautiousfingerlist.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: cautiousfingerlist finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
reccautiousfingerlist_return:function(){Ham4Parser.reccautiousfingerlist_return=function(){};org.antlr.lang.extend(Ham4Parser.reccautiousfingerlist_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1012:1: reccautiousfingerlist : ( ( hsfingeritem digit )=> hsfingeritem reccautiousfingerlist )? ;
// $ANTLR start "reccautiousfingerlist"
reccautiousfingerlist:function(){var retval=new Ham4Parser.reccautiousfingerlist_return();retval.start=this.input.LT(1);var root_0=null;var hsfingeritem104=null;var reccautiousfingerlist105=null;this.trace("ANTLR Parse: reccautiousfingerlist starts "+this.state.backtracking);try{// Ham4Parser.g:1032:5: ( ( ( hsfingeritem digit )=> hsfingeritem reccautiousfingerlist )? )
// Ham4Parser.g:1033:9: ( ( hsfingeritem digit )=> hsfingeritem reccautiousfingerlist )?
root_0=this.adaptor.nil();// Ham4Parser.g:1033:9: ( ( hsfingeritem digit )=> hsfingeritem reccautiousfingerlist )?
var alt34=2;alt34=this.dfa34.predict(this.input);switch(alt34){case 1:// Ham4Parser.g:1034:13: ( hsfingeritem digit )=> hsfingeritem reccautiousfingerlist
this.pushFollow(Ham4Parser.FOLLOW_hsfingeritem_in_reccautiousfingerlist4268);hsfingeritem104=this.hsfingeritem();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,hsfingeritem104.getTree());this.pushFollow(Ham4Parser.FOLLOW_reccautiousfingerlist_in_reccautiousfingerlist4282);reccautiousfingerlist105=this.reccautiousfingerlist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,reccautiousfingerlist105.getTree());break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: reccautiousfingerlist finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
fingershapelist_return:function(){Ham4Parser.fingershapelist_return=function(){};org.antlr.lang.extend(Ham4Parser.fingershapelist_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1041:1: fingershapelist : recfingershapelist -> ^( FISHPLIST ( recfingershapelist )? ) ;
// $ANTLR start "fingershapelist"
fingershapelist:function(){var retval=new Ham4Parser.fingershapelist_return();retval.start=this.input.LT(1);var root_0=null;var recfingershapelist106=null;var stream_recfingershapelist=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule recfingershapelist");this.trace("ANTLR Parse: fingershapelist starts "+this.state.backtracking);try{// Ham4Parser.g:1056:5: ( recfingershapelist -> ^( FISHPLIST ( recfingershapelist )? ) )
// Ham4Parser.g:1056:9: recfingershapelist
this.pushFollow(Ham4Parser.FOLLOW_recfingershapelist_in_fingershapelist4322);recfingershapelist106=this.recfingershapelist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_recfingershapelist.add(recfingershapelist106.getTree());// AST REWRITE
// elements: recfingershapelist
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1057:5: -> ^( FISHPLIST ( recfingershapelist )? )
{// Ham4Parser.g:1057:8: ^( FISHPLIST ( recfingershapelist )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(FISHPLIST,"FISHPLIST"),root_1);// Ham4Parser.g:1057:20: ( recfingershapelist )?
if(stream_recfingershapelist.hasNext()){this.adaptor.addChild(root_1,stream_recfingershapelist.nextTree());}stream_recfingershapelist.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: fingershapelist finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
recfingershapelist_return:function(){Ham4Parser.recfingershapelist_return=function(){};org.antlr.lang.extend(Ham4Parser.recfingershapelist_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1060:1: recfingershapelist : ( ( fingershape )=> fingershape recfingershapelist )? ;
// $ANTLR start "recfingershapelist"
recfingershapelist:function(){var retval=new Ham4Parser.recfingershapelist_return();retval.start=this.input.LT(1);var root_0=null;var fingershape107=null;var recfingershapelist108=null;this.trace("ANTLR Parse: recfingershapelist starts "+this.state.backtracking);try{// Ham4Parser.g:1080:5: ( ( ( fingershape )=> fingershape recfingershapelist )? )
// Ham4Parser.g:1081:9: ( ( fingershape )=> fingershape recfingershapelist )?
root_0=this.adaptor.nil();// Ham4Parser.g:1081:9: ( ( fingershape )=> fingershape recfingershapelist )?
var alt35=2;alt35=this.dfa35.predict(this.input);switch(alt35){case 1:// Ham4Parser.g:1082:13: ( fingershape )=> fingershape recfingershapelist
this.pushFollow(Ham4Parser.FOLLOW_fingershape_in_recfingershapelist4426);fingershape107=this.fingershape();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,fingershape107.getTree());this.pushFollow(Ham4Parser.FOLLOW_recfingershapelist_in_recfingershapelist4440);recfingershapelist108=this.recfingershapelist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,recfingershapelist108.getTree());break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: recfingershapelist finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
fingercrossinglist_return:function(){Ham4Parser.fingercrossinglist_return=function(){};org.antlr.lang.extend(Ham4Parser.fingercrossinglist_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1089:1: fingercrossinglist : recfingercrossinglist -> ^( FICRSSLIST ( recfingercrossinglist )? ) ;
// $ANTLR start "fingercrossinglist"
fingercrossinglist:function(){var retval=new Ham4Parser.fingercrossinglist_return();retval.start=this.input.LT(1);var root_0=null;var recfingercrossinglist109=null;var stream_recfingercrossinglist=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule recfingercrossinglist");this.trace("ANTLR Parse: fingercrossinglist starts "+this.state.backtracking);try{// Ham4Parser.g:1104:5: ( recfingercrossinglist -> ^( FICRSSLIST ( recfingercrossinglist )? ) )
// Ham4Parser.g:1104:9: recfingercrossinglist
this.pushFollow(Ham4Parser.FOLLOW_recfingercrossinglist_in_fingercrossinglist4480);recfingercrossinglist109=this.recfingercrossinglist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_recfingercrossinglist.add(recfingercrossinglist109.getTree());// AST REWRITE
// elements: recfingercrossinglist
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1105:5: -> ^( FICRSSLIST ( recfingercrossinglist )? )
{// Ham4Parser.g:1105:8: ^( FICRSSLIST ( recfingercrossinglist )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(FICRSSLIST,"FICRSSLIST"),root_1);// Ham4Parser.g:1105:21: ( recfingercrossinglist )?
if(stream_recfingercrossinglist.hasNext()){this.adaptor.addChild(root_1,stream_recfingercrossinglist.nextTree());}stream_recfingercrossinglist.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: fingercrossinglist finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
recfingercrossinglist_return:function(){Ham4Parser.recfingercrossinglist_return=function(){};org.antlr.lang.extend(Ham4Parser.recfingercrossinglist_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1108:1: recfingercrossinglist : ( ( fingercrossing )=> fingercrossing recfingercrossinglist )? ;
// $ANTLR start "recfingercrossinglist"
recfingercrossinglist:function(){var retval=new Ham4Parser.recfingercrossinglist_return();retval.start=this.input.LT(1);var root_0=null;var fingercrossing110=null;var recfingercrossinglist111=null;this.trace("ANTLR Parse: recfingercrossinglist starts "+this.state.backtracking);try{// Ham4Parser.g:1128:5: ( ( ( fingercrossing )=> fingercrossing recfingercrossinglist )? )
// Ham4Parser.g:1129:9: ( ( fingercrossing )=> fingercrossing recfingercrossinglist )?
root_0=this.adaptor.nil();// Ham4Parser.g:1129:9: ( ( fingercrossing )=> fingercrossing recfingercrossinglist )?
var alt36=2;alt36=this.dfa36.predict(this.input);switch(alt36){case 1:// Ham4Parser.g:1130:13: ( fingercrossing )=> fingercrossing recfingercrossinglist
this.pushFollow(Ham4Parser.FOLLOW_fingercrossing_in_recfingercrossinglist4581);fingercrossing110=this.fingercrossing();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,fingercrossing110.getTree());this.pushFollow(Ham4Parser.FOLLOW_recfingercrossinglist_in_recfingercrossinglist4595);recfingercrossinglist111=this.recfingercrossinglist();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,recfingercrossinglist111.getTree());break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: recfingercrossinglist finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
hsfingeritem_return:function(){Ham4Parser.hsfingeritem_return=function(){};org.antlr.lang.extend(Ham4Parser.hsfingeritem_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1137:1: hsfingeritem : finger ( HamLargemod )? -> ^( HSFINGERITEM finger ( HamLargemod )? ) ;
// $ANTLR start "hsfingeritem"
hsfingeritem:function(){var retval=new Ham4Parser.hsfingeritem_return();retval.start=this.input.LT(1);var root_0=null;var HamLargemod113=null;var finger112=null;var HamLargemod113_tree=null;var stream_HamLargemod=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamLargemod");var stream_finger=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule finger");this.trace("ANTLR Parse: hsfingeritem starts "+this.state.backtracking);try{// Ham4Parser.g:1154:5: ( finger ( HamLargemod )? -> ^( HSFINGERITEM finger ( HamLargemod )? ) )
// Ham4Parser.g:1154:9: finger ( HamLargemod )?
this.pushFollow(Ham4Parser.FOLLOW_finger_in_hsfingeritem4651);finger112=this.finger();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_finger.add(finger112.getTree());// Ham4Parser.g:1155:9: ( HamLargemod )?
var alt37=2;var LA37_0=this.input.LA(1);if(LA37_0==HamLargemod){alt37=1;}switch(alt37){case 1:// Ham4Parser.g:1155:11: HamLargemod
HamLargemod113=this.match(this.input,HamLargemod,Ham4Parser.FOLLOW_HamLargemod_in_hsfingeritem4663);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamLargemod.add(HamLargemod113);break;}// AST REWRITE
// elements: HamLargemod, finger
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1157:9: -> ^( HSFINGERITEM finger ( HamLargemod )? )
{// Ham4Parser.g:1157:12: ^( HSFINGERITEM finger ( HamLargemod )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(HSFINGERITEM,"HSFINGERITEM"),root_1);this.adaptor.addChild(root_1,stream_finger.nextTree());// Ham4Parser.g:1157:34: ( HamLargemod )?
if(stream_HamLargemod.hasNext()){this.adaptor.addChild(root_1,stream_HamLargemod.nextNode());}stream_HamLargemod.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: hsfingeritem finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
digit_return:function(){Ham4Parser.digit_return=function(){};org.antlr.lang.extend(Ham4Parser.digit_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1160:1: digit : ( thumb | finger );
// $ANTLR start "digit"
digit:function(){var retval=new Ham4Parser.digit_return();retval.start=this.input.LT(1);var root_0=null;var thumb114=null;var finger115=null;this.trace("ANTLR Parse: digit starts "+this.state.backtracking);try{// Ham4Parser.g:1175:5: ( thumb | finger )
var alt38=2;var LA38_0=this.input.LA(1);if(LA38_0==HamThumb){alt38=1;}else if(LA38_0>=HamIndexfinger&&LA38_0<=HamPinky){alt38=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",38,0,this.input);throw nvae;}switch(alt38){case 1:// Ham4Parser.g:1175:9: thumb
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_thumb_in_digit4723);thumb114=this.thumb();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,thumb114.getTree());break;case 2:// Ham4Parser.g:1176:9: finger
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_finger_in_digit4733);finger115=this.finger();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,finger115.getTree());break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: digit finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
hsdigit_return:function(){Ham4Parser.hsdigit_return=function(){};org.antlr.lang.extend(Ham4Parser.hsdigit_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1179:1: hsdigit : ( thumb | hsfingeritem );
// $ANTLR start "hsdigit"
hsdigit:function(){var retval=new Ham4Parser.hsdigit_return();retval.start=this.input.LT(1);var root_0=null;var thumb116=null;var hsfingeritem117=null;this.trace("ANTLR Parse: hsdigit starts "+this.state.backtracking);try{// Ham4Parser.g:1194:5: ( thumb | hsfingeritem )
var alt39=2;var LA39_0=this.input.LA(1);if(LA39_0==HamThumb){alt39=1;}else if(LA39_0>=HamIndexfinger&&LA39_0<=HamPinky){alt39=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",39,0,this.input);throw nvae;}switch(alt39){case 1:// Ham4Parser.g:1194:9: thumb
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_thumb_in_hsdigit4783);thumb116=this.thumb();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,thumb116.getTree());break;case 2:// Ham4Parser.g:1195:9: hsfingeritem
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_hsfingeritem_in_hsdigit4793);hsfingeritem117=this.hsfingeritem();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,hsfingeritem117.getTree());break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: hsdigit finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
fingershape_return:function(){Ham4Parser.fingershape_return=function(){};org.antlr.lang.extend(Ham4Parser.fingershape_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1198:1: fingershape : digit fingerbending -> ^( FSHAPE digit fingerbending ) ;
// $ANTLR start "fingershape"
fingershape:function(){var retval=new Ham4Parser.fingershape_return();retval.start=this.input.LT(1);var root_0=null;var digit118=null;var fingerbending119=null;var stream_fingerbending=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule fingerbending");var stream_digit=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule digit");this.trace("ANTLR Parse: fingershape starts "+this.state.backtracking);try{// Ham4Parser.g:1215:5: ( digit fingerbending -> ^( FSHAPE digit fingerbending ) )
// Ham4Parser.g:1215:9: digit fingerbending
this.pushFollow(Ham4Parser.FOLLOW_digit_in_fingershape4822);digit118=this.digit();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_digit.add(digit118.getTree());this.pushFollow(Ham4Parser.FOLLOW_fingerbending_in_fingershape4832);fingerbending119=this.fingerbending();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_fingerbending.add(fingerbending119.getTree());// AST REWRITE
// elements: fingerbending, digit
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1218:9: -> ^( FSHAPE digit fingerbending )
{// Ham4Parser.g:1218:12: ^( FSHAPE digit fingerbending )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(FSHAPE,"FSHAPE"),root_1);this.adaptor.addChild(root_1,stream_digit.nextTree());this.adaptor.addChild(root_1,stream_fingerbending.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: fingershape finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
fingercrossing_return:function(){Ham4Parser.fingercrossing_return=function(){};org.antlr.lang.extend(Ham4Parser.fingercrossing_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1221:1: fingercrossing : d1= digit fingerpart d2= digit -> ^( FCROSSING $d1 fingerpart $d2) ;
// $ANTLR start "fingercrossing"
fingercrossing:function(){var retval=new Ham4Parser.fingercrossing_return();retval.start=this.input.LT(1);var root_0=null;var d1=null;var d2=null;var fingerpart120=null;var stream_fingerpart=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule fingerpart");var stream_digit=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule digit");this.trace("ANTLR Parse: fingercrossing starts "+this.state.backtracking);try{// Ham4Parser.g:1239:5: (d1= digit fingerpart d2= digit -> ^( FCROSSING $d1 fingerpart $d2) )
// Ham4Parser.g:1239:9: d1= digit fingerpart d2= digit
this.pushFollow(Ham4Parser.FOLLOW_digit_in_fingercrossing4892);d1=this.digit();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_digit.add(d1.getTree());this.pushFollow(Ham4Parser.FOLLOW_fingerpart_in_fingercrossing4902);fingerpart120=this.fingerpart();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_fingerpart.add(fingerpart120.getTree());this.pushFollow(Ham4Parser.FOLLOW_digit_in_fingercrossing4916);d2=this.digit();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_digit.add(d2.getTree());// AST REWRITE
// elements: d1, fingerpart, d2
// token labels: 
// rule labels: d1, d2, retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_d1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token d1",d1!=null?d1.tree:null);var stream_d2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token d2",d2!=null?d2.tree:null);var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1243:9: -> ^( FCROSSING $d1 fingerpart $d2)
{// Ham4Parser.g:1243:12: ^( FCROSSING $d1 fingerpart $d2)
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(FCROSSING,"FCROSSING"),root_1);this.adaptor.addChild(root_1,stream_d1.nextTree());this.adaptor.addChild(root_1,stream_fingerpart.nextTree());this.adaptor.addChild(root_1,stream_d2.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: fingercrossing finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
thumbspecial_return:function(){Ham4Parser.thumbspecial_return=function(){};org.antlr.lang.extend(Ham4Parser.thumbspecial_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1246:1: thumbspecial : ( thumbbetween | thumbextra );
// $ANTLR start "thumbspecial"
thumbspecial:function(){var retval=new Ham4Parser.thumbspecial_return();retval.start=this.input.LT(1);var root_0=null;var thumbbetween121=null;var thumbextra122=null;this.trace("ANTLR Parse: thumbspecial starts "+this.state.backtracking);try{// Ham4Parser.g:1261:5: ( thumbbetween | thumbextra )
var alt40=2;var LA40_0=this.input.LA(1);if(LA40_0>=HamIndexfinger&&LA40_0<=HamPinky||LA40_0==HamBetween){alt40=1;}else if(LA40_0==HamThumb||LA40_0>=HamFingertip&&LA40_0<=HamFingerside){alt40=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",40,0,this.input);throw nvae;}switch(alt40){case 1:// Ham4Parser.g:1261:9: thumbbetween
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_thumbbetween_in_thumbspecial4976);thumbbetween121=this.thumbbetween();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,thumbbetween121.getTree());break;case 2:// Ham4Parser.g:1262:9: thumbextra
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_thumbextra_in_thumbspecial4986);thumbextra122=this.thumbextra();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,thumbextra122.getTree());break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: thumbspecial finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
thumbbetween_return:function(){Ham4Parser.thumbbetween_return=function(){};org.antlr.lang.extend(Ham4Parser.thumbbetween_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1265:1: thumbbetween : ( thumbbetweenexplicit | thumbbetweendefault );
// $ANTLR start "thumbbetween"
thumbbetween:function(){var retval=new Ham4Parser.thumbbetween_return();retval.start=this.input.LT(1);var root_0=null;var thumbbetweenexplicit123=null;var thumbbetweendefault124=null;this.trace("ANTLR Parse: thumbbetween starts "+this.state.backtracking);try{// Ham4Parser.g:1280:5: ( thumbbetweenexplicit | thumbbetweendefault )
var alt41=2;var LA41_0=this.input.LA(1);if(LA41_0>=HamIndexfinger&&LA41_0<=HamPinky){alt41=1;}else if(LA41_0==HamBetween){alt41=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",41,0,this.input);throw nvae;}switch(alt41){case 1:// Ham4Parser.g:1280:9: thumbbetweenexplicit
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_thumbbetweenexplicit_in_thumbbetween5015);thumbbetweenexplicit123=this.thumbbetweenexplicit();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,thumbbetweenexplicit123.getTree());break;case 2:// Ham4Parser.g:1281:9: thumbbetweendefault
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_thumbbetweendefault_in_thumbbetween5025);thumbbetweendefault124=this.thumbbetweendefault();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,thumbbetweendefault124.getTree());break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: thumbbetween finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
thumbbetweenexplicit_return:function(){Ham4Parser.thumbbetweenexplicit_return=function(){};org.antlr.lang.extend(Ham4Parser.thumbbetweenexplicit_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1284:1: thumbbetweenexplicit : finger HamBetween finger -> ^( THSPECIAL ^( HamBetween ( finger )* ) ) ;
// $ANTLR start "thumbbetweenexplicit"
thumbbetweenexplicit:function(){var retval=new Ham4Parser.thumbbetweenexplicit_return();retval.start=this.input.LT(1);var root_0=null;var HamBetween126=null;var finger125=null;var finger127=null;var HamBetween126_tree=null;var stream_HamBetween=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamBetween");var stream_finger=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule finger");this.trace("ANTLR Parse: thumbbetweenexplicit starts "+this.state.backtracking);try{// Ham4Parser.g:1302:5: ( finger HamBetween finger -> ^( THSPECIAL ^( HamBetween ( finger )* ) ) )
// Ham4Parser.g:1302:9: finger HamBetween finger
this.pushFollow(Ham4Parser.FOLLOW_finger_in_thumbbetweenexplicit5054);finger125=this.finger();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_finger.add(finger125.getTree());HamBetween126=this.match(this.input,HamBetween,Ham4Parser.FOLLOW_HamBetween_in_thumbbetweenexplicit5064);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamBetween.add(HamBetween126);this.pushFollow(Ham4Parser.FOLLOW_finger_in_thumbbetweenexplicit5075);finger127=this.finger();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_finger.add(finger127.getTree());// AST REWRITE
// elements: HamBetween, finger
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1306:9: -> ^( THSPECIAL ^( HamBetween ( finger )* ) )
{// Ham4Parser.g:1306:12: ^( THSPECIAL ^( HamBetween ( finger )* ) )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(THSPECIAL,"THSPECIAL"),root_1);// Ham4Parser.g:1306:24: ^( HamBetween ( finger )* )
{var root_2=this.adaptor.nil();root_2=this.adaptor.becomeRoot(stream_HamBetween.nextNode(),root_2);// Ham4Parser.g:1306:37: ( finger )*
while(stream_finger.hasNext()){this.adaptor.addChild(root_2,stream_finger.nextTree());}stream_finger.reset();this.adaptor.addChild(root_1,root_2);}this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: thumbbetweenexplicit finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
thumbbetweendefault_return:function(){Ham4Parser.thumbbetweendefault_return=function(){};org.antlr.lang.extend(Ham4Parser.thumbbetweendefault_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1309:1: thumbbetweendefault : HamBetween -> ^( THSPECIAL HamBetween ) ;
// $ANTLR start "thumbbetweendefault"
thumbbetweendefault:function(){var retval=new Ham4Parser.thumbbetweendefault_return();retval.start=this.input.LT(1);var root_0=null;var HamBetween128=null;var HamBetween128_tree=null;var stream_HamBetween=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamBetween");this.trace("ANTLR Parse: thumbbetweendefault starts "+this.state.backtracking);try{// Ham4Parser.g:1325:5: ( HamBetween -> ^( THSPECIAL HamBetween ) )
// Ham4Parser.g:1325:9: HamBetween
HamBetween128=this.match(this.input,HamBetween,Ham4Parser.FOLLOW_HamBetween_in_thumbbetweendefault5134);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamBetween.add(HamBetween128);// AST REWRITE
// elements: HamBetween
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1327:9: -> ^( THSPECIAL HamBetween )
{// Ham4Parser.g:1327:12: ^( THSPECIAL HamBetween )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(THSPECIAL,"THSPECIAL"),root_1);this.adaptor.addChild(root_1,stream_HamBetween.nextNode());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: thumbbetweendefault finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
thumbextra_return:function(){Ham4Parser.thumbextra_return=function(){};org.antlr.lang.extend(Ham4Parser.thumbextra_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1330:1: thumbextra : ( thumb | fingerpart ) -> ^( THSPECIAL ( thumb )? ( fingerpart )? ) ;
// $ANTLR start "thumbextra"
thumbextra:function(){var retval=new Ham4Parser.thumbextra_return();retval.start=this.input.LT(1);var root_0=null;var thumb129=null;var fingerpart130=null;var stream_fingerpart=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule fingerpart");var stream_thumb=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule thumb");this.trace("ANTLR Parse: thumbextra starts "+this.state.backtracking);try{// Ham4Parser.g:1350:5: ( ( thumb | fingerpart ) -> ^( THSPECIAL ( thumb )? ( fingerpart )? ) )
// Ham4Parser.g:1351:5: ( thumb | fingerpart )
// Ham4Parser.g:1351:5: ( thumb | fingerpart )
var alt42=2;var LA42_0=this.input.LA(1);if(LA42_0==HamThumb){alt42=1;}else if(LA42_0>=HamFingertip&&LA42_0<=HamFingerside){alt42=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",42,0,this.input);throw nvae;}switch(alt42){case 1:// Ham4Parser.g:1352:9: thumb
this.pushFollow(Ham4Parser.FOLLOW_thumb_in_thumbextra5200);thumb129=this.thumb();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_thumb.add(thumb129.getTree());break;case 2:// Ham4Parser.g:1354:9: fingerpart
this.pushFollow(Ham4Parser.FOLLOW_fingerpart_in_thumbextra5216);fingerpart130=this.fingerpart();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_fingerpart.add(fingerpart130.getTree());break;}// AST REWRITE
// elements: fingerpart, thumb
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1356:5: -> ^( THSPECIAL ( thumb )? ( fingerpart )? )
{// Ham4Parser.g:1356:8: ^( THSPECIAL ( thumb )? ( fingerpart )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(THSPECIAL,"THSPECIAL"),root_1);// Ham4Parser.g:1356:20: ( thumb )?
if(stream_thumb.hasNext()){this.adaptor.addChild(root_1,stream_thumb.nextTree());}stream_thumb.reset();// Ham4Parser.g:1356:27: ( fingerpart )?
if(stream_fingerpart.hasNext()){this.adaptor.addChild(root_1,stream_fingerpart.nextTree());}stream_fingerpart.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: thumbextra finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
extfidir2_return:function(){Ham4Parser.extfidir2_return=function(){};org.antlr.lang.extend(Ham4Parser.extfidir2_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1362:1: extfidir2 : ( extfidir1 | splitextfidir2 ) -> ^( EXTFIDIR2 ( extfidir1 )? ( splitextfidir2 )? ) ;
// $ANTLR start "extfidir2"
extfidir2:function(){var retval=new Ham4Parser.extfidir2_return();retval.start=this.input.LT(1);var root_0=null;var extfidir1131=null;var splitextfidir2132=null;var stream_splitextfidir2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule splitextfidir2");var stream_extfidir1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule extfidir1");this.trace("ANTLR Parse: extfidir2 starts "+this.state.backtracking);try{// Ham4Parser.g:1382:5: ( ( extfidir1 | splitextfidir2 ) -> ^( EXTFIDIR2 ( extfidir1 )? ( splitextfidir2 )? ) )
// Ham4Parser.g:1383:5: ( extfidir1 | splitextfidir2 )
// Ham4Parser.g:1383:5: ( extfidir1 | splitextfidir2 )
var alt43=2;var LA43_0=this.input.LA(1);if(LA43_0>=HamExtfingeru&&LA43_0<=HamExtfingeruo){alt43=1;}else if(LA43_0==HamParbegin){alt43=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",43,0,this.input);throw nvae;}switch(alt43){case 1:// Ham4Parser.g:1384:9: extfidir1
this.pushFollow(Ham4Parser.FOLLOW_extfidir1_in_extfidir25282);extfidir1131=this.extfidir1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_extfidir1.add(extfidir1131.getTree());break;case 2:// Ham4Parser.g:1386:9: splitextfidir2
this.pushFollow(Ham4Parser.FOLLOW_splitextfidir2_in_extfidir25298);splitextfidir2132=this.splitextfidir2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_splitextfidir2.add(splitextfidir2132.getTree());break;}// AST REWRITE
// elements: splitextfidir2, extfidir1
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1388:5: -> ^( EXTFIDIR2 ( extfidir1 )? ( splitextfidir2 )? )
{// Ham4Parser.g:1388:8: ^( EXTFIDIR2 ( extfidir1 )? ( splitextfidir2 )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(EXTFIDIR2,"EXTFIDIR2"),root_1);// Ham4Parser.g:1388:20: ( extfidir1 )?
if(stream_extfidir1.hasNext()){this.adaptor.addChild(root_1,stream_extfidir1.nextTree());}stream_extfidir1.reset();// Ham4Parser.g:1388:31: ( splitextfidir2 )?
if(stream_splitextfidir2.hasNext()){this.adaptor.addChild(root_1,stream_splitextfidir2.nextTree());}stream_splitextfidir2.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: extfidir2 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
splitextfidir2_return:function(){Ham4Parser.splitextfidir2_return=function(){};org.antlr.lang.extend(Ham4Parser.splitextfidir2_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1391:1: splitextfidir2 : HamParbegin extfidir1 HamPlus extfidir1 HamParend ;
// $ANTLR start "splitextfidir2"
splitextfidir2:function(){var retval=new Ham4Parser.splitextfidir2_return();retval.start=this.input.LT(1);var root_0=null;var HamParbegin133=null;var HamPlus135=null;var HamParend137=null;var extfidir1134=null;var extfidir1136=null;var HamParbegin133_tree=null;var HamPlus135_tree=null;var HamParend137_tree=null;this.trace("ANTLR Parse: splitextfidir2 starts "+this.state.backtracking);try{// Ham4Parser.g:1409:5: ( HamParbegin extfidir1 HamPlus extfidir1 HamParend )
// Ham4Parser.g:1409:9: HamParbegin extfidir1 HamPlus extfidir1 HamParend
root_0=this.adaptor.nil();HamParbegin133=this.match(this.input,HamParbegin,Ham4Parser.FOLLOW_HamParbegin_in_splitextfidir25349);if(this.state.failed)return retval;this.pushFollow(Ham4Parser.FOLLOW_extfidir1_in_splitextfidir25361);extfidir1134=this.extfidir1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,extfidir1134.getTree());HamPlus135=this.match(this.input,HamPlus,Ham4Parser.FOLLOW_HamPlus_in_splitextfidir25371);if(this.state.failed)return retval;this.pushFollow(Ham4Parser.FOLLOW_extfidir1_in_splitextfidir25383);extfidir1136=this.extfidir1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,extfidir1136.getTree());HamParend137=this.match(this.input,HamParend,Ham4Parser.FOLLOW_HamParend_in_splitextfidir25393);if(this.state.failed)return retval;retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: splitextfidir2 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
extfidir1_return:function(){Ham4Parser.extfidir1_return=function(){};org.antlr.lang.extend(Ham4Parser.extfidir1_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1416:1: extfidir1 : extfidir ( HamBetween extfidir )? ( HamOrirelative )? -> ^( EXTFIDIR1 ( extfidir )* ( HamOrirelative )* ) ;
// $ANTLR start "extfidir1"
extfidir1:function(){var retval=new Ham4Parser.extfidir1_return();retval.start=this.input.LT(1);var root_0=null;var HamBetween139=null;var HamOrirelative141=null;var extfidir138=null;var extfidir140=null;var HamBetween139_tree=null;var HamOrirelative141_tree=null;var stream_HamBetween=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamBetween");var stream_HamOrirelative=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamOrirelative");var stream_extfidir=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule extfidir");this.trace("ANTLR Parse: extfidir1 starts "+this.state.backtracking);try{// Ham4Parser.g:1438:5: ( extfidir ( HamBetween extfidir )? ( HamOrirelative )? -> ^( EXTFIDIR1 ( extfidir )* ( HamOrirelative )* ) )
// Ham4Parser.g:1438:9: extfidir ( HamBetween extfidir )? ( HamOrirelative )?
this.pushFollow(Ham4Parser.FOLLOW_extfidir_in_extfidir15424);extfidir138=this.extfidir();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_extfidir.add(extfidir138.getTree());// Ham4Parser.g:1439:9: ( HamBetween extfidir )?
var alt44=2;var LA44_0=this.input.LA(1);if(LA44_0==HamBetween){alt44=1;}switch(alt44){case 1:// Ham4Parser.g:1440:13: HamBetween extfidir
HamBetween139=this.match(this.input,HamBetween,Ham4Parser.FOLLOW_HamBetween_in_extfidir15448);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamBetween.add(HamBetween139);this.pushFollow(Ham4Parser.FOLLOW_extfidir_in_extfidir15462);extfidir140=this.extfidir();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_extfidir.add(extfidir140.getTree());break;}// Ham4Parser.g:1443:9: ( HamOrirelative )?
var alt45=2;var LA45_0=this.input.LA(1);if(LA45_0==HamOrirelative){alt45=1;}switch(alt45){case 1:// Ham4Parser.g:1444:13: HamOrirelative
HamOrirelative141=this.match(this.input,HamOrirelative,Ham4Parser.FOLLOW_HamOrirelative_in_extfidir15497);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamOrirelative.add(HamOrirelative141);break;}// AST REWRITE
// elements: HamOrirelative, extfidir
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1446:6: -> ^( EXTFIDIR1 ( extfidir )* ( HamOrirelative )* )
{// Ham4Parser.g:1446:9: ^( EXTFIDIR1 ( extfidir )* ( HamOrirelative )* )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(EXTFIDIR1,"EXTFIDIR1"),root_1);// Ham4Parser.g:1446:21: ( extfidir )*
while(stream_extfidir.hasNext()){this.adaptor.addChild(root_1,stream_extfidir.nextTree());}stream_extfidir.reset();// Ham4Parser.g:1446:31: ( HamOrirelative )*
while(stream_HamOrirelative.hasNext()){this.adaptor.addChild(root_1,stream_HamOrirelative.nextNode());}stream_HamOrirelative.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: extfidir1 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
palmor2_return:function(){Ham4Parser.palmor2_return=function(){};org.antlr.lang.extend(Ham4Parser.palmor2_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1452:1: palmor2 : ( palmor1 | splitpalmor2 ) -> ^( PALMOR2 ( palmor1 )? ( splitpalmor2 )? ) ;
// $ANTLR start "palmor2"
palmor2:function(){var retval=new Ham4Parser.palmor2_return();retval.start=this.input.LT(1);var root_0=null;var palmor1142=null;var splitpalmor2143=null;var stream_splitpalmor2=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule splitpalmor2");var stream_palmor1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule palmor1");this.trace("ANTLR Parse: palmor2 starts "+this.state.backtracking);try{// Ham4Parser.g:1472:5: ( ( palmor1 | splitpalmor2 ) -> ^( PALMOR2 ( palmor1 )? ( splitpalmor2 )? ) )
// Ham4Parser.g:1473:5: ( palmor1 | splitpalmor2 )
// Ham4Parser.g:1473:5: ( palmor1 | splitpalmor2 )
var alt46=2;var LA46_0=this.input.LA(1);if(LA46_0>=HamPalmu&&LA46_0<=HamPalmul){alt46=1;}else if(LA46_0==HamParbegin){alt46=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",46,0,this.input);throw nvae;}switch(alt46){case 1:// Ham4Parser.g:1474:9: palmor1
this.pushFollow(Ham4Parser.FOLLOW_palmor1_in_palmor25569);palmor1142=this.palmor1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_palmor1.add(palmor1142.getTree());break;case 2:// Ham4Parser.g:1476:9: splitpalmor2
this.pushFollow(Ham4Parser.FOLLOW_splitpalmor2_in_palmor25585);splitpalmor2143=this.splitpalmor2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_splitpalmor2.add(splitpalmor2143.getTree());break;}// AST REWRITE
// elements: splitpalmor2, palmor1
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1478:5: -> ^( PALMOR2 ( palmor1 )? ( splitpalmor2 )? )
{// Ham4Parser.g:1478:8: ^( PALMOR2 ( palmor1 )? ( splitpalmor2 )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(PALMOR2,"PALMOR2"),root_1);// Ham4Parser.g:1478:18: ( palmor1 )?
if(stream_palmor1.hasNext()){this.adaptor.addChild(root_1,stream_palmor1.nextTree());}stream_palmor1.reset();// Ham4Parser.g:1478:27: ( splitpalmor2 )?
if(stream_splitpalmor2.hasNext()){this.adaptor.addChild(root_1,stream_splitpalmor2.nextTree());}stream_splitpalmor2.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: palmor2 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
splitpalmor2_return:function(){Ham4Parser.splitpalmor2_return=function(){};org.antlr.lang.extend(Ham4Parser.splitpalmor2_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1481:1: splitpalmor2 : HamParbegin palmor1 HamPlus palmor1 HamParend ;
// $ANTLR start "splitpalmor2"
splitpalmor2:function(){var retval=new Ham4Parser.splitpalmor2_return();retval.start=this.input.LT(1);var root_0=null;var HamParbegin144=null;var HamPlus146=null;var HamParend148=null;var palmor1145=null;var palmor1147=null;var HamParbegin144_tree=null;var HamPlus146_tree=null;var HamParend148_tree=null;this.trace("ANTLR Parse: splitpalmor2 starts "+this.state.backtracking);try{// Ham4Parser.g:1499:5: ( HamParbegin palmor1 HamPlus palmor1 HamParend )
// Ham4Parser.g:1499:9: HamParbegin palmor1 HamPlus palmor1 HamParend
root_0=this.adaptor.nil();HamParbegin144=this.match(this.input,HamParbegin,Ham4Parser.FOLLOW_HamParbegin_in_splitpalmor25636);if(this.state.failed)return retval;this.pushFollow(Ham4Parser.FOLLOW_palmor1_in_splitpalmor25648);palmor1145=this.palmor1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,palmor1145.getTree());HamPlus146=this.match(this.input,HamPlus,Ham4Parser.FOLLOW_HamPlus_in_splitpalmor25658);if(this.state.failed)return retval;this.pushFollow(Ham4Parser.FOLLOW_palmor1_in_splitpalmor25670);palmor1147=this.palmor1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,palmor1147.getTree());HamParend148=this.match(this.input,HamParend,Ham4Parser.FOLLOW_HamParend_in_splitpalmor25680);if(this.state.failed)return retval;retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: splitpalmor2 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
palmor1_return:function(){Ham4Parser.palmor1_return=function(){};org.antlr.lang.extend(Ham4Parser.palmor1_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1506:1: palmor1 : palmor ( HamBetween palmor | HamEtc )? ( HamOrirelative )? -> ^( PALMOR1 ( palmor )* ( HamEtc )* ( HamOrirelative )* ) ;
// $ANTLR start "palmor1"
palmor1:function(){var retval=new Ham4Parser.palmor1_return();retval.start=this.input.LT(1);var root_0=null;var HamBetween150=null;var HamEtc152=null;var HamOrirelative153=null;var palmor149=null;var palmor151=null;var HamBetween150_tree=null;var HamEtc152_tree=null;var HamOrirelative153_tree=null;var stream_HamBetween=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamBetween");var stream_HamEtc=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamEtc");var stream_HamOrirelative=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamOrirelative");var stream_palmor=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule palmor");this.trace("ANTLR Parse: palmor1 starts "+this.state.backtracking);try{// Ham4Parser.g:1530:5: ( palmor ( HamBetween palmor | HamEtc )? ( HamOrirelative )? -> ^( PALMOR1 ( palmor )* ( HamEtc )* ( HamOrirelative )* ) )
// Ham4Parser.g:1530:9: palmor ( HamBetween palmor | HamEtc )? ( HamOrirelative )?
this.pushFollow(Ham4Parser.FOLLOW_palmor_in_palmor15711);palmor149=this.palmor();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_palmor.add(palmor149.getTree());// Ham4Parser.g:1531:9: ( HamBetween palmor | HamEtc )?
var alt47=3;var LA47_0=this.input.LA(1);if(LA47_0==HamBetween){alt47=1;}else if(LA47_0==HamEtc){alt47=2;}switch(alt47){case 1:// Ham4Parser.g:1532:13: HamBetween palmor
HamBetween150=this.match(this.input,HamBetween,Ham4Parser.FOLLOW_HamBetween_in_palmor15735);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamBetween.add(HamBetween150);this.pushFollow(Ham4Parser.FOLLOW_palmor_in_palmor15749);palmor151=this.palmor();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_palmor.add(palmor151.getTree());break;case 2:// Ham4Parser.g:1535:7: HamEtc
HamEtc152=this.match(this.input,HamEtc,Ham4Parser.FOLLOW_HamEtc_in_palmor15767);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamEtc.add(HamEtc152);break;}// Ham4Parser.g:1537:9: ( HamOrirelative )?
var alt48=2;var LA48_0=this.input.LA(1);if(LA48_0==HamOrirelative){alt48=1;}switch(alt48){case 1:// Ham4Parser.g:1538:13: HamOrirelative
HamOrirelative153=this.match(this.input,HamOrirelative,Ham4Parser.FOLLOW_HamOrirelative_in_palmor15802);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamOrirelative.add(HamOrirelative153);break;}// AST REWRITE
// elements: palmor, HamEtc, HamOrirelative
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1540:6: -> ^( PALMOR1 ( palmor )* ( HamEtc )* ( HamOrirelative )* )
{// Ham4Parser.g:1540:9: ^( PALMOR1 ( palmor )* ( HamEtc )* ( HamOrirelative )* )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(PALMOR1,"PALMOR1"),root_1);// Ham4Parser.g:1540:19: ( palmor )*
while(stream_palmor.hasNext()){this.adaptor.addChild(root_1,stream_palmor.nextTree());}stream_palmor.reset();// Ham4Parser.g:1540:27: ( HamEtc )*
while(stream_HamEtc.hasNext()){this.adaptor.addChild(root_1,stream_HamEtc.nextNode());}stream_HamEtc.reset();// Ham4Parser.g:1540:35: ( HamOrirelative )*
while(stream_HamOrirelative.hasNext()){this.adaptor.addChild(root_1,stream_HamOrirelative.nextNode());}stream_HamOrirelative.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: palmor1 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
location2_return:function(){Ham4Parser.location2_return=function(){};org.antlr.lang.extend(Ham4Parser.location2_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1546:1: location2 : ( location1as2 | location2not1 ) ;
// $ANTLR start "location2"
location2:function(){var retval=new Ham4Parser.location2_return();retval.start=this.input.LT(1);var root_0=null;var location1as2154=null;var location2not1155=null;this.trace("ANTLR Parse: location2 starts "+this.state.backtracking);try{// Ham4Parser.g:1565:5: ( ( location1as2 | location2not1 ) )
// Ham4Parser.g:1566:5: ( location1as2 | location2not1 )
root_0=this.adaptor.nil();// Ham4Parser.g:1566:5: ( location1as2 | location2not1 )
var alt49=2;alt49=this.dfa49.predict(this.input);switch(alt49){case 1:// Ham4Parser.g:1567:9: location1as2
this.pushFollow(Ham4Parser.FOLLOW_location1as2_in_location25877);location1as2154=this.location1as2();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,location1as2154.getTree());break;case 2:// Ham4Parser.g:1569:9: location2not1
this.pushFollow(Ham4Parser.FOLLOW_location2not1_in_location25893);location2not1155=this.location2not1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,location2not1155.getTree());break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: location2 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
location1as2_return:function(){Ham4Parser.location1as2_return=function(){};org.antlr.lang.extend(Ham4Parser.location1as2_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1573:1: location1as2 : location1 -> ^( LOC2 location1 ) ;
// $ANTLR start "location1as2"
location1as2:function(){var retval=new Ham4Parser.location1as2_return();retval.start=this.input.LT(1);var root_0=null;var location1156=null;var stream_location1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule location1");this.trace("ANTLR Parse: location1as2 starts "+this.state.backtracking);try{// Ham4Parser.g:1588:5: ( location1 -> ^( LOC2 location1 ) )
// Ham4Parser.g:1588:9: location1
this.pushFollow(Ham4Parser.FOLLOW_location1_in_location1as25928);location1156=this.location1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_location1.add(location1156.getTree());// AST REWRITE
// elements: location1
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1589:6: -> ^( LOC2 location1 )
{// Ham4Parser.g:1589:9: ^( LOC2 location1 )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(LOC2,"LOC2"),root_1);this.adaptor.addChild(root_1,stream_location1.nextTree());this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: location1as2 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
location2not1_return:function(){Ham4Parser.location2not1_return=function(){};org.antlr.lang.extend(Ham4Parser.location2not1_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1592:1: location2not1 : ( ( handconstellation )=> handconstellation ( HamNeutralspace ( HamArmextended )? | ( locationbody )? ) -> ^( LOC2 handconstellation ( HamArmextended )? ( locationbody )? ) | HamParbegin location1 HamPlus location1 HamParend -> ^( LOC2 ( location1 )* ) ) ;
// $ANTLR start "location2not1"
location2not1:function(){var retval=new Ham4Parser.location2not1_return();retval.start=this.input.LT(1);var root_0=null;var HamNeutralspace158=null;var HamArmextended159=null;var HamParbegin161=null;var HamPlus163=null;var HamParend165=null;var handconstellation157=null;var locationbody160=null;var location1162=null;var location1164=null;var HamNeutralspace158_tree=null;var HamArmextended159_tree=null;var HamParbegin161_tree=null;var HamPlus163_tree=null;var HamParend165_tree=null;var stream_HamPlus=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamPlus");var stream_HamParend=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamParend");var stream_HamArmextended=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamArmextended");var stream_HamParbegin=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamParbegin");var stream_HamNeutralspace=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamNeutralspace");var stream_location1=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule location1");var stream_locationbody=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule locationbody");var stream_handconstellation=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule handconstellation");this.trace("ANTLR Parse: location2not1 starts "+this.state.backtracking);try{// Ham4Parser.g:1625:5: ( ( ( handconstellation )=> handconstellation ( HamNeutralspace ( HamArmextended )? | ( locationbody )? ) -> ^( LOC2 handconstellation ( HamArmextended )? ( locationbody )? ) | HamParbegin location1 HamPlus location1 HamParend -> ^( LOC2 ( location1 )* ) ) )
// Ham4Parser.g:1626:5: ( ( handconstellation )=> handconstellation ( HamNeutralspace ( HamArmextended )? | ( locationbody )? ) -> ^( LOC2 handconstellation ( HamArmextended )? ( locationbody )? ) | HamParbegin location1 HamPlus location1 HamParend -> ^( LOC2 ( location1 )* ) )
// Ham4Parser.g:1626:5: ( ( handconstellation )=> handconstellation ( HamNeutralspace ( HamArmextended )? | ( locationbody )? ) -> ^( LOC2 handconstellation ( HamArmextended )? ( locationbody )? ) | HamParbegin location1 HamPlus location1 HamParend -> ^( LOC2 ( location1 )* ) )
var alt53=2;var LA53_0=this.input.LA(1);if(LA53_0==HamParbegin){var LA53_1=this.input.LA(2);if(this.synpred19_Ham4Parser()){alt53=1;}else if(true){alt53=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",53,1,this.input);throw nvae;}}else if(LA53_0>=HamClose&&LA53_0<=HamTouch&&this.synpred19_Ham4Parser()){alt53=1;}else if(LA53_0>=HamInterlock&&LA53_0<=HamCross&&this.synpred19_Ham4Parser()){alt53=1;}else if(LA53_0==HamSeqbegin&&this.synpred19_Ham4Parser()){alt53=1;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",53,0,this.input);throw nvae;}switch(alt53){case 1:// Ham4Parser.g:1627:9: ( handconstellation )=> handconstellation ( HamNeutralspace ( HamArmextended )? | ( locationbody )? )
this.pushFollow(Ham4Parser.FOLLOW_handconstellation_in_location2not16006);handconstellation157=this.handconstellation();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_handconstellation.add(handconstellation157.getTree());// Ham4Parser.g:1630:9: ( HamNeutralspace ( HamArmextended )? | ( locationbody )? )
var alt52=2;var LA52_0=this.input.LA(1);if(LA52_0==HamNeutralspace){alt52=1;}else if(LA52_0==EOF||LA52_0==HamPlus||LA52_0>=HamEarlobe&&LA52_0<=HamShouldertop||LA52_0==HamReplace||LA52_0>=HamTongue&&LA52_0<=HamStomach||LA52_0>=HamHead&&LA52_0<=HamLrat||LA52_0>=HamNomotion&&LA52_0<=HamMovex||LA52_0>=HamFingerplay&&LA52_0<=HamCircler||LA52_0>=HamRepeatfromstart&&LA52_0<=HamRepeatreverse||LA52_0>=HamNodding&&LA52_0<=HamCircleuo){alt52=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",52,0,this.input);throw nvae;}switch(alt52){case 1:// Ham4Parser.g:1631:13: HamNeutralspace ( HamArmextended )?
HamNeutralspace158=this.match(this.input,HamNeutralspace,Ham4Parser.FOLLOW_HamNeutralspace_in_location2not16030);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamNeutralspace.add(HamNeutralspace158);// Ham4Parser.g:1632:13: ( HamArmextended )?
var alt50=2;var LA50_0=this.input.LA(1);if(LA50_0==HamArmextended){alt50=1;}switch(alt50){case 1:// Ham4Parser.g:1632:15: HamArmextended
HamArmextended159=this.match(this.input,HamArmextended,Ham4Parser.FOLLOW_HamArmextended_in_location2not16046);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamArmextended.add(HamArmextended159);break;}break;case 2:// Ham4Parser.g:1634:13: ( locationbody )?
// Ham4Parser.g:1634:13: ( locationbody )?
var alt51=2;var LA51_0=this.input.LA(1);if(LA51_0>=HamEarlobe&&LA51_0<=HamShouldertop||LA51_0>=HamTongue&&LA51_0<=HamStomach||LA51_0>=HamHead&&LA51_0<=HamLrat){alt51=1;}switch(alt51){case 1:// Ham4Parser.g:1634:15: locationbody
this.pushFollow(Ham4Parser.FOLLOW_locationbody_in_location2not16075);locationbody160=this.locationbody();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_locationbody.add(locationbody160.getTree());break;}break;}// AST REWRITE
// elements: handconstellation, locationbody, HamArmextended
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1636:6: -> ^( LOC2 handconstellation ( HamArmextended )? ( locationbody )? )
{// Ham4Parser.g:1636:9: ^( LOC2 handconstellation ( HamArmextended )? ( locationbody )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(LOC2,"LOC2"),root_1);this.adaptor.addChild(root_1,stream_handconstellation.nextTree());// Ham4Parser.g:1636:34: ( HamArmextended )?
if(stream_HamArmextended.hasNext()){this.adaptor.addChild(root_1,stream_HamArmextended.nextNode());}stream_HamArmextended.reset();// Ham4Parser.g:1636:50: ( locationbody )?
if(stream_locationbody.hasNext()){this.adaptor.addChild(root_1,stream_locationbody.nextTree());}stream_locationbody.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;case 2:// Ham4Parser.g:1638:9: HamParbegin location1 HamPlus location1 HamParend
HamParbegin161=this.match(this.input,HamParbegin,Ham4Parser.FOLLOW_HamParbegin_in_location2not16123);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamParbegin.add(HamParbegin161);this.pushFollow(Ham4Parser.FOLLOW_location1_in_location2not16133);location1162=this.location1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_location1.add(location1162.getTree());HamPlus163=this.match(this.input,HamPlus,Ham4Parser.FOLLOW_HamPlus_in_location2not16143);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamPlus.add(HamPlus163);this.pushFollow(Ham4Parser.FOLLOW_location1_in_location2not16153);location1164=this.location1();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_location1.add(location1164.getTree());HamParend165=this.match(this.input,HamParend,Ham4Parser.FOLLOW_HamParend_in_location2not16163);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamParend.add(HamParend165);// AST REWRITE
// elements: location1
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1643:6: -> ^( LOC2 ( location1 )* )
{// Ham4Parser.g:1643:9: ^( LOC2 ( location1 )* )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(LOC2,"LOC2"),root_1);// Ham4Parser.g:1643:16: ( location1 )*
while(stream_location1.hasNext()){this.adaptor.addChild(root_1,stream_location1.nextTree());}stream_location1.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: location2not1 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
location1_return:function(){Ham4Parser.location1_return=function(){};org.antlr.lang.extend(Ham4Parser.location1_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1647:1: location1 : ( ( locationindexuse )=> locationindexuse | ( levelhand )=> locationhand | locationbodyarm ) -> ^( LOC1 ( locationindexuse )? ( locationhand )? ( locationbodyarm )? ) ;
// $ANTLR start "location1"
location1:function(){var retval=new Ham4Parser.location1_return();retval.start=this.input.LT(1);var root_0=null;var locationindexuse166=null;var locationhand167=null;var locationbodyarm168=null;var stream_locationindexuse=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule locationindexuse");var stream_locationhand=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule locationhand");var stream_locationbodyarm=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule locationbodyarm");this.trace("ANTLR Parse: location1 starts "+this.state.backtracking);try{// Ham4Parser.g:1673:5: ( ( ( locationindexuse )=> locationindexuse | ( levelhand )=> locationhand | locationbodyarm ) -> ^( LOC1 ( locationindexuse )? ( locationhand )? ( locationbodyarm )? ) )
// Ham4Parser.g:1674:5: ( ( locationindexuse )=> locationindexuse | ( levelhand )=> locationhand | locationbodyarm )
// Ham4Parser.g:1674:5: ( ( locationindexuse )=> locationindexuse | ( levelhand )=> locationhand | locationbodyarm )
var alt54=3;alt54=this.dfa54.predict(this.input);switch(alt54){case 1:// Ham4Parser.g:1675:9: ( locationindexuse )=> locationindexuse
this.pushFollow(Ham4Parser.FOLLOW_locationindexuse_in_location16268);locationindexuse166=this.locationindexuse();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_locationindexuse.add(locationindexuse166.getTree());break;case 2:// Ham4Parser.g:1679:9: ( levelhand )=> locationhand
this.pushFollow(Ham4Parser.FOLLOW_locationhand_in_location16308);locationhand167=this.locationhand();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_locationhand.add(locationhand167.getTree());break;case 3:// Ham4Parser.g:1683:9: locationbodyarm
this.pushFollow(Ham4Parser.FOLLOW_locationbodyarm_in_location16324);locationbodyarm168=this.locationbodyarm();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_locationbodyarm.add(locationbodyarm168.getTree());break;}// AST REWRITE
// elements: locationhand, locationbodyarm, locationindexuse
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1685:5: -> ^( LOC1 ( locationindexuse )? ( locationhand )? ( locationbodyarm )? )
{// Ham4Parser.g:1685:8: ^( LOC1 ( locationindexuse )? ( locationhand )? ( locationbodyarm )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(LOC1,"LOC1"),root_1);// Ham4Parser.g:1685:15: ( locationindexuse )?
if(stream_locationindexuse.hasNext()){this.adaptor.addChild(root_1,stream_locationindexuse.nextTree());}stream_locationindexuse.reset();// Ham4Parser.g:1685:33: ( locationhand )?
if(stream_locationhand.hasNext()){this.adaptor.addChild(root_1,stream_locationhand.nextTree());}stream_locationhand.reset();// Ham4Parser.g:1685:47: ( locationbodyarm )?
if(stream_locationbodyarm.hasNext()){this.adaptor.addChild(root_1,stream_locationbodyarm.nextTree());}stream_locationbodyarm.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: location1 finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
locationindexdefine_return:function(){Ham4Parser.locationindexdefine_return=function(){};org.antlr.lang.extend(Ham4Parser.locationindexdefine_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1688:1: locationindexdefine : digit HamCoreftag ;
// $ANTLR start "locationindexdefine"
locationindexdefine:function(){var retval=new Ham4Parser.locationindexdefine_return();retval.start=this.input.LT(1);var root_0=null;var HamCoreftag170=null;var digit169=null;var HamCoreftag170_tree=null;this.trace("ANTLR Parse: locationindexdefine starts "+this.state.backtracking);try{// Ham4Parser.g:1704:5: ( digit HamCoreftag )
// Ham4Parser.g:1705:9: digit HamCoreftag
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_digit_in_locationindexdefine6384);digit169=this.digit();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,digit169.getTree());HamCoreftag170=this.match(this.input,HamCoreftag,Ham4Parser.FOLLOW_HamCoreftag_in_locationindexdefine6394);if(this.state.failed)return retval;retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: locationindexdefine finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
locationindexuse_return:function(){Ham4Parser.locationindexuse_return=function(){};org.antlr.lang.extend(Ham4Parser.locationindexuse_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1709:1: locationindexuse : digit HamCorefref ;
// $ANTLR start "locationindexuse"
locationindexuse:function(){var retval=new Ham4Parser.locationindexuse_return();retval.start=this.input.LT(1);var root_0=null;var HamCorefref172=null;var digit171=null;var HamCorefref172_tree=null;this.trace("ANTLR Parse: locationindexuse starts "+this.state.backtracking);try{// Ham4Parser.g:1725:5: ( digit HamCorefref )
// Ham4Parser.g:1726:9: digit HamCorefref
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_digit_in_locationindexuse6431);digit171=this.digit();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,digit171.getTree());HamCorefref172=this.match(this.input,HamCorefref,Ham4Parser.FOLLOW_HamCorefref_in_locationindexuse6441);if(this.state.failed)return retval;retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: locationindexuse finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
locationbodyarm_return:function(){Ham4Parser.locationbodyarm_return=function(){};org.antlr.lang.extend(Ham4Parser.locationbodyarm_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1730:1: locationbodyarm : ( HamNeutralspace ( HamArmextended )? | ( levelbody )=> locationbody | locationarm ) -> ^( LOCTNBODYARM ( HamArmextended )* ( locationbody )* ( locationarm )* ) ;
// $ANTLR start "locationbodyarm"
locationbodyarm:function(){var retval=new Ham4Parser.locationbodyarm_return();retval.start=this.input.LT(1);var root_0=null;var HamNeutralspace173=null;var HamArmextended174=null;var locationbody175=null;var locationarm176=null;var HamNeutralspace173_tree=null;var HamArmextended174_tree=null;var stream_HamArmextended=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamArmextended");var stream_HamNeutralspace=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamNeutralspace");var stream_locationbody=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule locationbody");var stream_locationarm=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule locationarm");this.trace("ANTLR Parse: locationbodyarm starts "+this.state.backtracking);try{// Ham4Parser.g:1755:5: ( ( HamNeutralspace ( HamArmextended )? | ( levelbody )=> locationbody | locationarm ) -> ^( LOCTNBODYARM ( HamArmextended )* ( locationbody )* ( locationarm )* ) )
// Ham4Parser.g:1756:5: ( HamNeutralspace ( HamArmextended )? | ( levelbody )=> locationbody | locationarm )
// Ham4Parser.g:1756:5: ( HamNeutralspace ( HamArmextended )? | ( levelbody )=> locationbody | locationarm )
var alt56=3;alt56=this.dfa56.predict(this.input);switch(alt56){case 1:// Ham4Parser.g:1757:9: HamNeutralspace ( HamArmextended )?
HamNeutralspace173=this.match(this.input,HamNeutralspace,Ham4Parser.FOLLOW_HamNeutralspace_in_locationbodyarm6484);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamNeutralspace.add(HamNeutralspace173);// Ham4Parser.g:1758:9: ( HamArmextended )?
var alt55=2;var LA55_0=this.input.LA(1);if(LA55_0==HamArmextended){alt55=1;}switch(alt55){case 1:// Ham4Parser.g:1758:11: HamArmextended
HamArmextended174=this.match(this.input,HamArmextended,Ham4Parser.FOLLOW_HamArmextended_in_locationbodyarm6496);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamArmextended.add(HamArmextended174);break;}break;case 2:// Ham4Parser.g:1760:9: ( levelbody )=> locationbody
this.pushFollow(Ham4Parser.FOLLOW_locationbody_in_locationbodyarm6539);locationbody175=this.locationbody();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_locationbody.add(locationbody175.getTree());break;case 3:// Ham4Parser.g:1764:9: locationarm
this.pushFollow(Ham4Parser.FOLLOW_locationarm_in_locationbodyarm6555);locationarm176=this.locationarm();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_locationarm.add(locationarm176.getTree());break;}// AST REWRITE
// elements: HamArmextended, locationarm, locationbody
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1766:5: -> ^( LOCTNBODYARM ( HamArmextended )* ( locationbody )* ( locationarm )* )
{// Ham4Parser.g:1766:8: ^( LOCTNBODYARM ( HamArmextended )* ( locationbody )* ( locationarm )* )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(LOCTNBODYARM,"LOCTNBODYARM"),root_1);// Ham4Parser.g:1766:23: ( HamArmextended )*
while(stream_HamArmextended.hasNext()){this.adaptor.addChild(root_1,stream_HamArmextended.nextNode());}stream_HamArmextended.reset();// Ham4Parser.g:1766:39: ( locationbody )*
while(stream_locationbody.hasNext()){this.adaptor.addChild(root_1,stream_locationbody.nextTree());}stream_locationbody.reset();// Ham4Parser.g:1766:53: ( locationarm )*
while(stream_locationarm.hasNext()){this.adaptor.addChild(root_1,stream_locationarm.nextTree());}stream_locationarm.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: locationbodyarm finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
locationbody_return:function(){Ham4Parser.locationbody_return=function(){};org.antlr.lang.extend(Ham4Parser.locationbody_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1769:1: locationbody : levelcomplexbody ( HamBehind )? ( ( contactbody )=> contactbody )? -> ^( LOCTNBODY levelcomplexbody ( HamBehind )? ( contactbody )? ) ;
// $ANTLR start "locationbody"
locationbody:function(){var retval=new Ham4Parser.locationbody_return();retval.start=this.input.LT(1);var root_0=null;var HamBehind178=null;var levelcomplexbody177=null;var contactbody179=null;var HamBehind178_tree=null;var stream_HamBehind=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamBehind");var stream_levelcomplexbody=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule levelcomplexbody");var stream_contactbody=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule contactbody");this.trace("ANTLR Parse: locationbody starts "+this.state.backtracking);try{// Ham4Parser.g:1787:5: ( levelcomplexbody ( HamBehind )? ( ( contactbody )=> contactbody )? -> ^( LOCTNBODY levelcomplexbody ( HamBehind )? ( contactbody )? ) )
// Ham4Parser.g:1787:9: levelcomplexbody ( HamBehind )? ( ( contactbody )=> contactbody )?
this.pushFollow(Ham4Parser.FOLLOW_levelcomplexbody_in_locationbody6609);levelcomplexbody177=this.levelcomplexbody();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_levelcomplexbody.add(levelcomplexbody177.getTree());// Ham4Parser.g:1788:9: ( HamBehind )?
var alt57=2;alt57=this.dfa57.predict(this.input);switch(alt57){case 1:// Ham4Parser.g:1788:11: HamBehind
HamBehind178=this.match(this.input,HamBehind,Ham4Parser.FOLLOW_HamBehind_in_locationbody6621);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamBehind.add(HamBehind178);break;}// Ham4Parser.g:1789:9: ( ( contactbody )=> contactbody )?
var alt58=2;alt58=this.dfa58.predict(this.input);switch(alt58){case 1:// Ham4Parser.g:1789:11: ( contactbody )=> contactbody
this.pushFollow(Ham4Parser.FOLLOW_contactbody_in_locationbody6644);contactbody179=this.contactbody();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_contactbody.add(contactbody179.getTree());break;}// AST REWRITE
// elements: levelcomplexbody, HamBehind, contactbody
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1791:7: -> ^( LOCTNBODY levelcomplexbody ( HamBehind )? ( contactbody )? )
{// Ham4Parser.g:1791:10: ^( LOCTNBODY levelcomplexbody ( HamBehind )? ( contactbody )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(LOCTNBODY,"LOCTNBODY"),root_1);this.adaptor.addChild(root_1,stream_levelcomplexbody.nextTree());// Ham4Parser.g:1791:39: ( HamBehind )?
if(stream_HamBehind.hasNext()){this.adaptor.addChild(root_1,stream_HamBehind.nextNode());}stream_HamBehind.reset();// Ham4Parser.g:1791:50: ( contactbody )?
if(stream_contactbody.hasNext()){this.adaptor.addChild(root_1,stream_contactbody.nextTree());}stream_contactbody.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: locationbody finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
locationhand_return:function(){Ham4Parser.locationhand_return=function(){};org.antlr.lang.extend(Ham4Parser.locationhand_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1794:1: locationhand : levelcomplexhand ( ( contacthand )=> contacthand )? -> ^( LOCTNHAND levelcomplexhand ( contacthand )? ) ;
// $ANTLR start "locationhand"
locationhand:function(){var retval=new Ham4Parser.locationhand_return();retval.start=this.input.LT(1);var root_0=null;var levelcomplexhand180=null;var contacthand181=null;var stream_levelcomplexhand=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule levelcomplexhand");var stream_contacthand=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule contacthand");this.trace("ANTLR Parse: locationhand starts "+this.state.backtracking);try{// Ham4Parser.g:1811:5: ( levelcomplexhand ( ( contacthand )=> contacthand )? -> ^( LOCTNHAND levelcomplexhand ( contacthand )? ) )
// Ham4Parser.g:1811:9: levelcomplexhand ( ( contacthand )=> contacthand )?
this.pushFollow(Ham4Parser.FOLLOW_levelcomplexhand_in_locationhand6705);levelcomplexhand180=this.levelcomplexhand();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_levelcomplexhand.add(levelcomplexhand180.getTree());// Ham4Parser.g:1812:9: ( ( contacthand )=> contacthand )?
var alt59=2;alt59=this.dfa59.predict(this.input);switch(alt59){case 1:// Ham4Parser.g:1812:11: ( contacthand )=> contacthand
this.pushFollow(Ham4Parser.FOLLOW_contacthand_in_locationhand6723);contacthand181=this.contacthand();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_contacthand.add(contacthand181.getTree());break;}// AST REWRITE
// elements: contacthand, levelcomplexhand
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1814:7: -> ^( LOCTNHAND levelcomplexhand ( contacthand )? )
{// Ham4Parser.g:1814:10: ^( LOCTNHAND levelcomplexhand ( contacthand )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(LOCTNHAND,"LOCTNHAND"),root_1);this.adaptor.addChild(root_1,stream_levelcomplexhand.nextTree());// Ham4Parser.g:1814:39: ( contacthand )?
if(stream_contacthand.hasNext()){this.adaptor.addChild(root_1,stream_contacthand.nextTree());}stream_contacthand.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: locationhand finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
locationarm_return:function(){Ham4Parser.locationarm_return=function(){};org.antlr.lang.extend(Ham4Parser.locationarm_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1817:1: locationarm : levelcomplexarm ( HamBehind )? ( ( contactbody )=> contactbody )? -> ^( LOCTNARM levelcomplexarm ( HamBehind )? ( contactbody )? ) ;
// $ANTLR start "locationarm"
locationarm:function(){var retval=new Ham4Parser.locationarm_return();retval.start=this.input.LT(1);var root_0=null;var HamBehind183=null;var levelcomplexarm182=null;var contactbody184=null;var HamBehind183_tree=null;var stream_HamBehind=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamBehind");var stream_contactbody=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule contactbody");var stream_levelcomplexarm=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule levelcomplexarm");this.trace("ANTLR Parse: locationarm starts "+this.state.backtracking);try{// Ham4Parser.g:1835:5: ( levelcomplexarm ( HamBehind )? ( ( contactbody )=> contactbody )? -> ^( LOCTNARM levelcomplexarm ( HamBehind )? ( contactbody )? ) )
// Ham4Parser.g:1835:9: levelcomplexarm ( HamBehind )? ( ( contactbody )=> contactbody )?
this.pushFollow(Ham4Parser.FOLLOW_levelcomplexarm_in_locationarm6781);levelcomplexarm182=this.levelcomplexarm();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_levelcomplexarm.add(levelcomplexarm182.getTree());// Ham4Parser.g:1836:9: ( HamBehind )?
var alt60=2;alt60=this.dfa60.predict(this.input);switch(alt60){case 1:// Ham4Parser.g:1836:11: HamBehind
HamBehind183=this.match(this.input,HamBehind,Ham4Parser.FOLLOW_HamBehind_in_locationarm6793);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamBehind.add(HamBehind183);break;}// Ham4Parser.g:1837:9: ( ( contactbody )=> contactbody )?
var alt61=2;alt61=this.dfa61.predict(this.input);switch(alt61){case 1:// Ham4Parser.g:1837:11: ( contactbody )=> contactbody
this.pushFollow(Ham4Parser.FOLLOW_contactbody_in_locationarm6816);contactbody184=this.contactbody();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_contactbody.add(contactbody184.getTree());break;}// AST REWRITE
// elements: levelcomplexarm, HamBehind, contactbody
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1839:7: -> ^( LOCTNARM levelcomplexarm ( HamBehind )? ( contactbody )? )
{// Ham4Parser.g:1839:10: ^( LOCTNARM levelcomplexarm ( HamBehind )? ( contactbody )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(LOCTNARM,"LOCTNARM"),root_1);this.adaptor.addChild(root_1,stream_levelcomplexarm.nextTree());// Ham4Parser.g:1839:37: ( HamBehind )?
if(stream_HamBehind.hasNext()){this.adaptor.addChild(root_1,stream_HamBehind.nextNode());}stream_HamBehind.reset();// Ham4Parser.g:1839:48: ( contactbody )?
if(stream_contactbody.hasNext()){this.adaptor.addChild(root_1,stream_contactbody.nextTree());}stream_contactbody.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: locationarm finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
levelcomplexbody_return:function(){Ham4Parser.levelcomplexbody_return=function(){};org.antlr.lang.extend(Ham4Parser.levelcomplexbody_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1842:1: levelcomplexbody : levelbody ( HamBetween levelbody )? ;
// $ANTLR start "levelcomplexbody"
levelcomplexbody:function(){var retval=new Ham4Parser.levelcomplexbody_return();retval.start=this.input.LT(1);var root_0=null;var HamBetween186=null;var levelbody185=null;var levelbody187=null;var HamBetween186_tree=null;this.trace("ANTLR Parse: levelcomplexbody starts "+this.state.backtracking);try{// Ham4Parser.g:1860:5: ( levelbody ( HamBetween levelbody )? )
// Ham4Parser.g:1860:9: levelbody ( HamBetween levelbody )?
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_levelbody_in_levelcomplexbody6877);levelbody185=this.levelbody();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,levelbody185.getTree());// Ham4Parser.g:1861:9: ( HamBetween levelbody )?
var alt62=2;var LA62_0=this.input.LA(1);if(LA62_0==HamBetween){alt62=1;}switch(alt62){case 1:// Ham4Parser.g:1862:13: HamBetween levelbody
HamBetween186=this.match(this.input,HamBetween,Ham4Parser.FOLLOW_HamBetween_in_levelcomplexbody6901);if(this.state.failed)return retval;this.pushFollow(Ham4Parser.FOLLOW_levelbody_in_levelcomplexbody6917);levelbody187=this.levelbody();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,levelbody187.getTree());break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: levelcomplexbody finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
levelcomplexhand_return:function(){Ham4Parser.levelcomplexhand_return=function(){};org.antlr.lang.extend(Ham4Parser.levelcomplexhand_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1867:1: levelcomplexhand : levelhand ( HamBetween levelhand )? ;
// $ANTLR start "levelcomplexhand"
levelcomplexhand:function(){var retval=new Ham4Parser.levelcomplexhand_return();retval.start=this.input.LT(1);var root_0=null;var HamBetween189=null;var levelhand188=null;var levelhand190=null;var HamBetween189_tree=null;this.trace("ANTLR Parse: levelcomplexhand starts "+this.state.backtracking);try{// Ham4Parser.g:1885:5: ( levelhand ( HamBetween levelhand )? )
// Ham4Parser.g:1885:9: levelhand ( HamBetween levelhand )?
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_levelhand_in_levelcomplexhand6957);levelhand188=this.levelhand();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,levelhand188.getTree());// Ham4Parser.g:1886:9: ( HamBetween levelhand )?
var alt63=2;var LA63_0=this.input.LA(1);if(LA63_0==HamBetween){alt63=1;}switch(alt63){case 1:// Ham4Parser.g:1887:13: HamBetween levelhand
HamBetween189=this.match(this.input,HamBetween,Ham4Parser.FOLLOW_HamBetween_in_levelcomplexhand6981);if(this.state.failed)return retval;this.pushFollow(Ham4Parser.FOLLOW_levelhand_in_levelcomplexhand6997);levelhand190=this.levelhand();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,levelhand190.getTree());break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: levelcomplexhand finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
levelcomplexarm_return:function(){Ham4Parser.levelcomplexarm_return=function(){};org.antlr.lang.extend(Ham4Parser.levelcomplexarm_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1892:1: levelcomplexarm : levelarm ( HamBetween levelarm )? ;
// $ANTLR start "levelcomplexarm"
levelcomplexarm:function(){var retval=new Ham4Parser.levelcomplexarm_return();retval.start=this.input.LT(1);var root_0=null;var HamBetween192=null;var levelarm191=null;var levelarm193=null;var HamBetween192_tree=null;this.trace("ANTLR Parse: levelcomplexarm starts "+this.state.backtracking);try{// Ham4Parser.g:1910:5: ( levelarm ( HamBetween levelarm )? )
// Ham4Parser.g:1910:9: levelarm ( HamBetween levelarm )?
root_0=this.adaptor.nil();this.pushFollow(Ham4Parser.FOLLOW_levelarm_in_levelcomplexarm7037);levelarm191=this.levelarm();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,levelarm191.getTree());// Ham4Parser.g:1911:9: ( HamBetween levelarm )?
var alt64=2;var LA64_0=this.input.LA(1);if(LA64_0==HamBetween){alt64=1;}switch(alt64){case 1:// Ham4Parser.g:1912:13: HamBetween levelarm
HamBetween192=this.match(this.input,HamBetween,Ham4Parser.FOLLOW_HamBetween_in_levelcomplexarm7061);if(this.state.failed)return retval;this.pushFollow(Ham4Parser.FOLLOW_levelarm_in_levelcomplexarm7077);levelarm193=this.levelarm();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)this.adaptor.addChild(root_0,levelarm193.getTree());break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: levelcomplexarm finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
levelbody_return:function(){Ham4Parser.levelbody_return=function(){};org.antlr.lang.extend(Ham4Parser.levelbody_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1917:1: levelbody : ( locbody ( HamEtc )? ( side )? -> ^( LEVBODY locbody ( HamEtc )? ( side )? ) | locsided ( HamEtc )? ( side )? -> ^( LEVBODY locsided ( HamEtc )? ( side )? ) | side ( locbody ( HamEtc )? | locsided ( HamEtc )? ) -> ^( LEVBODY side ( locbody )? ( locsided )? ( HamEtc )? ) ) ;
// $ANTLR start "levelbody"
levelbody:function(){var retval=new Ham4Parser.levelbody_return();retval.start=this.input.LT(1);var root_0=null;var HamEtc195=null;var HamEtc198=null;var HamEtc202=null;var HamEtc204=null;var locbody194=null;var side196=null;var locsided197=null;var side199=null;var side200=null;var locbody201=null;var locsided203=null;var HamEtc195_tree=null;var HamEtc198_tree=null;var HamEtc202_tree=null;var HamEtc204_tree=null;var stream_HamEtc=new org.antlr.runtime.tree.RewriteRuleTokenStream(this.adaptor,"token HamEtc");var stream_side=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule side");var stream_locsided=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule locsided");var stream_locbody=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule locbody");this.trace("ANTLR Parse: levelbody starts "+this.state.backtracking);try{// Ham4Parser.g:1952:5: ( ( locbody ( HamEtc )? ( side )? -> ^( LEVBODY locbody ( HamEtc )? ( side )? ) | locsided ( HamEtc )? ( side )? -> ^( LEVBODY locsided ( HamEtc )? ( side )? ) | side ( locbody ( HamEtc )? | locsided ( HamEtc )? ) -> ^( LEVBODY side ( locbody )? ( locsided )? ( HamEtc )? ) ) )
// Ham4Parser.g:1953:5: ( locbody ( HamEtc )? ( side )? -> ^( LEVBODY locbody ( HamEtc )? ( side )? ) | locsided ( HamEtc )? ( side )? -> ^( LEVBODY locsided ( HamEtc )? ( side )? ) | side ( locbody ( HamEtc )? | locsided ( HamEtc )? ) -> ^( LEVBODY side ( locbody )? ( locsided )? ( HamEtc )? ) )
// Ham4Parser.g:1953:5: ( locbody ( HamEtc )? ( side )? -> ^( LEVBODY locbody ( HamEtc )? ( side )? ) | locsided ( HamEtc )? ( side )? -> ^( LEVBODY locsided ( HamEtc )? ( side )? ) | side ( locbody ( HamEtc )? | locsided ( HamEtc )? ) -> ^( LEVBODY side ( locbody )? ( locsided )? ( HamEtc )? ) )
var alt72=3;switch(this.input.LA(1)){case HamNostrils:case HamShouldertop:case HamTongue:case HamTeeth:case HamStomach:case HamHead:case HamHeadtop:case HamForehead:case HamEyebrows:case HamEyes:case HamNose:case HamLips:case HamChin:case HamUnderchin:case HamNeck:case HamShoulders:case HamChest:case HamBelowstomach:alt72=1;break;case HamEarlobe:case HamEar:case HamCheek:alt72=2;break;case HamLrbeside:case HamLrat:alt72=3;break;default:if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",72,0,this.input);throw nvae;}switch(alt72){case 1:// Ham4Parser.g:1954:9: locbody ( HamEtc )? ( side )?
this.pushFollow(Ham4Parser.FOLLOW_locbody_in_levelbody7129);locbody194=this.locbody();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_locbody.add(locbody194.getTree());// Ham4Parser.g:1955:9: ( HamEtc )?
var alt65=2;var LA65_0=this.input.LA(1);if(LA65_0==HamEtc){alt65=1;}switch(alt65){case 1:// Ham4Parser.g:1955:11: HamEtc
HamEtc195=this.match(this.input,HamEtc,Ham4Parser.FOLLOW_HamEtc_in_levelbody7141);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamEtc.add(HamEtc195);break;}// Ham4Parser.g:1956:9: ( side )?
var alt66=2;var LA66_0=this.input.LA(1);if(LA66_0>=HamLrbeside&&LA66_0<=HamLrat){alt66=1;}switch(alt66){case 1:// Ham4Parser.g:1956:11: side
this.pushFollow(Ham4Parser.FOLLOW_side_in_levelbody7156);side196=this.side();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_side.add(side196.getTree());break;}// AST REWRITE
// elements: HamEtc, locbody, side
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1957:6: -> ^( LEVBODY locbody ( HamEtc )? ( side )? )
{// Ham4Parser.g:1957:9: ^( LEVBODY locbody ( HamEtc )? ( side )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(LEVBODY,"LEVBODY"),root_1);this.adaptor.addChild(root_1,stream_locbody.nextTree());// Ham4Parser.g:1957:27: ( HamEtc )?
if(stream_HamEtc.hasNext()){this.adaptor.addChild(root_1,stream_HamEtc.nextNode());}stream_HamEtc.reset();// Ham4Parser.g:1957:35: ( side )?
if(stream_side.hasNext()){this.adaptor.addChild(root_1,stream_side.nextTree());}stream_side.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;case 2:// Ham4Parser.g:1959:9: locsided ( HamEtc )? ( side )?
this.pushFollow(Ham4Parser.FOLLOW_locsided_in_levelbody7194);locsided197=this.locsided();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_locsided.add(locsided197.getTree());// Ham4Parser.g:1960:9: ( HamEtc )?
var alt67=2;var LA67_0=this.input.LA(1);if(LA67_0==HamEtc){alt67=1;}switch(alt67){case 1:// Ham4Parser.g:1960:11: HamEtc
HamEtc198=this.match(this.input,HamEtc,Ham4Parser.FOLLOW_HamEtc_in_levelbody7206);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamEtc.add(HamEtc198);break;}// Ham4Parser.g:1961:9: ( side )?
var alt68=2;var LA68_0=this.input.LA(1);if(LA68_0>=HamLrbeside&&LA68_0<=HamLrat){alt68=1;}switch(alt68){case 1:// Ham4Parser.g:1961:11: side
this.pushFollow(Ham4Parser.FOLLOW_side_in_levelbody7221);side199=this.side();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_side.add(side199.getTree());break;}// AST REWRITE
// elements: side, locsided, HamEtc
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1962:6: -> ^( LEVBODY locsided ( HamEtc )? ( side )? )
{// Ham4Parser.g:1962:9: ^( LEVBODY locsided ( HamEtc )? ( side )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(LEVBODY,"LEVBODY"),root_1);this.adaptor.addChild(root_1,stream_locsided.nextTree());// Ham4Parser.g:1962:28: ( HamEtc )?
if(stream_HamEtc.hasNext()){this.adaptor.addChild(root_1,stream_HamEtc.nextNode());}stream_HamEtc.reset();// Ham4Parser.g:1962:36: ( side )?
if(stream_side.hasNext()){this.adaptor.addChild(root_1,stream_side.nextTree());}stream_side.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;case 3:// Ham4Parser.g:1964:9: side ( locbody ( HamEtc )? | locsided ( HamEtc )? )
this.pushFollow(Ham4Parser.FOLLOW_side_in_levelbody7259);side200=this.side();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_side.add(side200.getTree());// Ham4Parser.g:1965:9: ( locbody ( HamEtc )? | locsided ( HamEtc )? )
var alt71=2;var LA71_0=this.input.LA(1);if(LA71_0>=HamNostrils&&LA71_0<=HamShouldertop||LA71_0>=HamTongue&&LA71_0<=HamStomach||LA71_0>=HamHead&&LA71_0<=HamNose||LA71_0>=HamLips&&LA71_0<=HamBelowstomach){alt71=1;}else if(LA71_0==HamEarlobe||LA71_0>=HamEar&&LA71_0<=HamCheek){alt71=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",71,0,this.input);throw nvae;}switch(alt71){case 1:// Ham4Parser.g:1966:13: locbody ( HamEtc )?
this.pushFollow(Ham4Parser.FOLLOW_locbody_in_levelbody7283);locbody201=this.locbody();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_locbody.add(locbody201.getTree());// Ham4Parser.g:1967:13: ( HamEtc )?
var alt69=2;var LA69_0=this.input.LA(1);if(LA69_0==HamEtc){alt69=1;}switch(alt69){case 1:// Ham4Parser.g:1967:15: HamEtc
HamEtc202=this.match(this.input,HamEtc,Ham4Parser.FOLLOW_HamEtc_in_levelbody7299);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamEtc.add(HamEtc202);break;}break;case 2:// Ham4Parser.g:1969:13: locsided ( HamEtc )?
this.pushFollow(Ham4Parser.FOLLOW_locsided_in_levelbody7326);locsided203=this.locsided();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_locsided.add(locsided203.getTree());// Ham4Parser.g:1970:13: ( HamEtc )?
var alt70=2;var LA70_0=this.input.LA(1);if(LA70_0==HamEtc){alt70=1;}switch(alt70){case 1:// Ham4Parser.g:1970:15: HamEtc
HamEtc204=this.match(this.input,HamEtc,Ham4Parser.FOLLOW_HamEtc_in_levelbody7342);if(this.state.failed)return retval;if(this.state.backtracking===0)stream_HamEtc.add(HamEtc204);break;}break;}// AST REWRITE
// elements: side, locbody, HamEtc, locsided
// token labels: 
// rule labels: retval
// token list labels: 
// rule list labels: 
if(this.state.backtracking===0){retval.tree=root_0;var stream_retval=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"token retval",retval!=null?retval.tree:null);root_0=this.adaptor.nil();// 1972:6: -> ^( LEVBODY side ( locbody )? ( locsided )? ( HamEtc )? )
{// Ham4Parser.g:1972:9: ^( LEVBODY side ( locbody )? ( locsided )? ( HamEtc )? )
{var root_1=this.adaptor.nil();root_1=this.adaptor.becomeRoot(this.adaptor.create(LEVBODY,"LEVBODY"),root_1);this.adaptor.addChild(root_1,stream_side.nextTree());// Ham4Parser.g:1972:24: ( locbody )?
if(stream_locbody.hasNext()){this.adaptor.addChild(root_1,stream_locbody.nextTree());}stream_locbody.reset();// Ham4Parser.g:1972:33: ( locsided )?
if(stream_locsided.hasNext()){this.adaptor.addChild(root_1,stream_locsided.nextTree());}stream_locsided.reset();// Ham4Parser.g:1972:43: ( HamEtc )?
if(stream_HamEtc.hasNext()){this.adaptor.addChild(root_1,stream_HamEtc.nextNode());}stream_HamEtc.reset();this.adaptor.addChild(root_0,root_1);}}retval.tree=root_0;}break;}retval.stop=this.input.LT(-1);if(this.state.backtracking===0){retval.tree=this.adaptor.rulePostProcessing(root_0);this.adaptor.setTokenBoundaries(retval.tree,retval.start,retval.stop);}if(this.state.backtracking===0){this.trace("ANTLR Parse: levelbody finish "+this.state.backtracking);}}catch(re){if(re instanceof org.antlr.runtime.RecognitionException){this.reportError(re);this.recover(this.input,re);retval.tree=this.adaptor.errorNode(this.input,retval.start,this.input.LT(-1),re);}else{throw re;}}finally{}return retval;},// inline static return class
levelhand_return:function(){Ham4Parser.levelhand_return=function(){};org.antlr.lang.extend(Ham4Parser.levelhand_return,org.antlr.runtime.ParserRuleReturnScope,{getTree:function(){return this.tree;}});return;}(),// Ham4Parser.g:1976:1: levelhand : ( lochand ( dorsalorpalmar )? ( side )? -> ^( LEVHAND lochand ( dorsalorpalmar )? ( side )? ) | side lochand ( dorsalorpalmar )? -> ^( LEVHAND side lochand ( dorsalorpalmar )? ) ) ;
// $ANTLR start "levelhand"
levelhand:function(){var retval=new Ham4Parser.levelhand_return();retval.start=this.input.LT(1);var root_0=null;var lochand205=null;var dorsalorpalmar206=null;var side207=null;var side208=null;var lochand209=null;var dorsalorpalmar210=null;var stream_lochand=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule lochand");var stream_side=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule side");var stream_dorsalorpalmar=new org.antlr.runtime.tree.RewriteRuleSubtreeStream(this.adaptor,"rule dorsalorpalmar");this.trace("ANTLR Parse: levelhand starts "+this.state.backtracking);try{// Ham4Parser.g:2001:5: ( ( lochand ( dorsalorpalmar )? ( side )? -> ^( LEVHAND lochand ( dorsalorpalmar )? ( side )? ) | side lochand ( dorsalorpalmar )? -> ^( LEVHAND side lochand ( dorsalorpalmar )? ) ) )
// Ham4Parser.g:2002:5: ( lochand ( dorsalorpalmar )? ( side )? -> ^( LEVHAND lochand ( dorsalorpalmar )? ( side )? ) | side lochand ( dorsalorpalmar )? -> ^( LEVHAND side lochand ( dorsalorpalmar )? ) )
// Ham4Parser.g:2002:5: ( lochand ( dorsalorpalmar )? ( side )? -> ^( LEVHAND lochand ( dorsalorpalmar )? ( side )? ) | side lochand ( dorsalorpalmar )? -> ^( LEVHAND side lochand ( dorsalorpalmar )? ) )
var alt76=2;var LA76_0=this.input.LA(1);if(LA76_0>=HamWristback&&LA76_0<=HamPinkyside||LA76_0>=HamFingertip&&LA76_0<=HamFingerside){alt76=1;}else if(LA76_0>=HamLrbeside&&LA76_0<=HamLrat){alt76=2;}else{if(this.state.backtracking>0){this.state.failed=true;return retval;}var nvae=new org.antlr.runtime.NoViableAltException("",76,0,this.input);throw nvae;}switch(alt76){case 1:// Ham4Parser.g:2003:9: lochand ( dorsalorpalmar )? ( side )?
this.pushFollow(Ham4Parser.FOLLOW_lochand_in_levelhand7424);lochand205=this.lochand();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_lochand.add(lochand205.getTree());// Ham4Parser.g:2004:9: ( dorsalorpalmar )?
var alt73=2;var LA73_0=this.input.LA(1);if(LA73_0>=HamPalm&&LA73_0<=HamHandback){alt73=1;}switch(alt73){case 1:// Ham4Parser.g:2004:11: dorsalorpalmar
this.pushFollow(Ham4Parser.FOLLOW_dorsalorpalmar_in_levelhand7436);dorsalorpalmar206=this.dorsalorpalmar();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_dorsalorpalmar.add(dorsalorpalmar206.getTree());break;}// Ham4Parser.g:2005:9: ( side )?
var alt74=2;var LA74_0=this.input.LA(1);if(LA74_0>=HamLrbeside&&LA74_0<=HamLrat){alt74=1;}switch(alt74){case 1:// Ham4Parser.g:2005:11: side
this.pushFollow(Ham4Parser.FOLLOW_side_in_levelhand7451);side207=this.side();this.state._fsp--;if(this.state.failed)return retval;if(this.state.backtracking===0)stream_side.add(side207.getTree());break;}// AST REWRITE
// elements: dorsalorpalmar, lochand, side
// Exports
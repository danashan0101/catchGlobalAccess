(function (globalScope) {
    var defaultWarnMessage = 'Accessing {0} through the global scope is deprecated.',
        hasConsole = typeof console !== 'undefined',
        hasProxy = typeof Proxy !== 'undefined',
        warnAlways = false,
        wrapped = {};

    function wrap(varName, msg, warnAlways, showCaller) {
        var globalVar = globalScope[varName],
            firstWarn = true,
            globalClone,
            prop;

        function showWarn(msg, fn) {
            if (hasConsole && (firstWarn || warnAlways)) {
                if (showCaller && fn) {
                    console.log(fn.caller);
                }

                console.warn(msg);
            }
            firstWarn = false;
        }

        if (hasProxy) {
            globalScope[varName] = new Proxy(globalVar, {
                apply: function fn(target, thisValue, args) {
                    showWarn(msg, fn);
                    return target.apply(thisValue, args);
                },
                get: function fn(target, name) {
                    showWarn(msg, fn);
                    return target[name];
                }
            });
        } else if (typeof globalVar === 'function') {
            globalClone = function fn() {
                showWarn(msg, fn);
                return globalVar.apply(this, arguments);
            };

            for (prop in globalVar) {
                if (globalVar.hasOwnProperty(prop)) {
                    globalClone[prop] = globalVar[prop];
                }
            }

            globalScope[varName] = globalClone;
        }

        wrapped[varName] = true;
    }

    function catchGlobalAccess(toCatch, showCaller) {
        var itemsToCatch = [];

        if (Array.isArray(toCatch)) {
            itemsToCatch = toCatch;
        } else if (toCatch) {
            itemsToCatch.push(toCatch);
        }

        itemsToCatch.forEach(function (item) {
            var varName;

            if (item) {
                varName = item.varName || item;

                if (globalScope[varName] && !wrapped[varName]) {
                    wrap(varName, item.message || defaultWarnMessage.replace('{0}', varName), item.warnAlways || warnAlways, showCaller);
                }
            }
        });
    }

    if (typeof define === 'function' && define.amd) {
        define('catchGlobalAccess', function () {
            return catchGlobalAccess;
        });
    } else {
        globalScope.catchGlobalAccess = catchGlobalAccess;
    }
}(this));
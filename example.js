define(['jquery', 'moment', 'catchGlobalAccess'], function ($, Moment, catchGlobalAccess) {
    // before calling "catchGlobalAccess" method,
    // we must be sure that variables
    // access to which we want catch
    // already registered in global scope
    // so we need to include them in the dependencies list
    catchGlobalAccess([{
        varName: '$',
        showCaller: true,
        warnAlways: true
    },
    {
        varName: 'moment',
        showCaller: true,
        warnAlways: true
    }]);
});

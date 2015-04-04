define(function() {

    if (typeof Object.create !== 'function') {
        Object.create = function (o) {
            function F() {}
            F.prototype = o;
            return new F();
        };
    }

    var ObjectMaker = function(baseobj, props, basename) {
        var obj;
        if (typeof baseobj === "string") {
            basename = baseobj;
            baseobj = {};
        }
        if (basename) {
            var baseproto = Object.create(baseobj);
            obj = Object.create(baseproto);
            baseproto._basename = basename;
            baseproto._baseproto = baseproto;
            baseproto[basename] = obj;
            baseproto.make = function (props, basename) {
                return ObjectMaker(this, props, basename);
            };
            baseproto.namespace = function (ns, props) {
                return ObjectMaker.namespace(this, ns, props);
            };
            baseproto.addObject = function (ns, obj) {
                ObjectMaker.addObject(this, ns, obj);
            };
        } else {
            obj = Object.create(baseobj);
        }
        if (props) {
            // NB. we do want non-ownProperties
            for (var prop in props) {
                obj[prop] = props[prop];
            }
        }
        return obj;
    };
    ObjectMaker.namespace = function (baseobj, ns, props) {
        baseobj[ns] = ObjectMaker(baseobj, props);
        return baseobj[ns];
    };
    ObjectMaker.addObject = function (baseobj, ns, obj) {
        baseobj[ns] = obj;
        if (baseobj._basename) {
            var proxyproto = obj.prototype ? obj.prototype : obj;
            proxyproto[baseobj._basename] = baseobj;
        }
        //return baseobj[ns];
    };
    // only register functions //
    // all transactions via a proxy //
    ObjectMaker.addFunction = function (baseobj, ns, fn) {
        baseobj[ns] = fn;
        if (baseobj._basename) {
            fn[baseobj._basename] = baseobj;
        }
        //return baseobj[ns];
    };

    return ObjectMaker;

});
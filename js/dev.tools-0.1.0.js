define(function(require){
    var external = {};

    external.wait = function wait (t) {
        var x = (new Date().getTime());
        while (x) {
            var x2 = (new Date().getTime());
            if (x2 - x > 0) {
                x = 0;
            }
        }
    };

    return external;
});
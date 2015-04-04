(function(){
    var schemas = [
        { name: "test", path: "test" }
    ];
    var schemaArray = [];
    var schemaNameArray = [];
    for (var i = 0, schemaLen = schemas.length; i < schemaLen; i++) {
        var schema = schemas[i];
        schemaArray.push("text!js/app/schema/" + schema["path"] + ".json");
        schemaNameArray.push(schema["name"]);
    }

    define(schemaArray, function() {
        var args = Array.prototype.slice.call(arguments);
        var Schemas = {};

        for (var i = 0, argsLen = args.length; i < argsLen; i++) {
            Schemas[schemaNameArray[i]] = JSON.parse(args[i]);
        }

        return Schemas;

    });
})();
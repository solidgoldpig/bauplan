(function(moduleFactory) {
    if(typeof exports === "object") {
        module.exports = moduleFactory(require("lodash"), require("larynx"), require("handlebars"));
    } else if(typeof define === "function" && define.amd) {
        define(["underscore", "larynx", "handlebars"], moduleFactory);
    }
}(function(_, Larynx) {

    //TODO
    /*
        revert el-tag to tag?
        force lowercase tags
        xmlify empty tags (if desired)
    */

    var Handlebars;

    var defaults = {
        "el-escape": true,
        "el-tag": "div",
        "el-join": '',
        "el-reject": /^\s*$/,
        "el-split": /(\r\n|\n\r|\n|\r)+/g,
        "el-trim": true
    };

    var elementIsEmpty = {
        area: true,
        base: true,
        br: true,
        col: true,
        hr: true,
        img: true,
        input: true,
        link: true,
        meta: true,
        param: true
    };

    var elementCanHaveNoContent = {
        textarea: true,
        script: true
    };

    var elementHasContentAttribute = {
        meta: true
    };

    var attributeCanHaveNoValue = {
        alt: true,
        value: true
    };

    var attributeIsBoolean = {
        checked: true,
        disabled: true,
        selected: true
    };

    var attributeIsEnumerate = {
        dir: ["rtl", "ltr"]
    };

    var Element = function(){
        var args = Array.prototype.slice.call(arguments);
        var options = args.pop();

        var attributes = _.extend({}, options.hash || {});
        if (attributes.attributes) {
            if (typeof attributes.attributes !== "object") {
                attributes.attributes = {
                    "el-tag": attributes.attributes
                };
            }
            attributes = _.extend({}, attributes.attributes, attributes);
            delete attributes.attributes;
        }
        attributes = _.extend({}, defaults, attributes);

        function getAttr (name) {
            var attr = attributes[name];
            delete attributes[name];
            return attr;
        }

        if (getAttr("el-abort-all")) {
            return;
        }

        var output = "";

        var context = this;

        var tagName = getAttr("el-tag");
        var escape = getAttr("el-escape");
        var wrap = getAttr("el-wrap");
        var wrapAll = getAttr("el-wrap-all");
        var wrapOuter = getAttr("el-wrap-outer");
        var join = getAttr("el-join");
        var split = getAttr("el-split");
        var reject = getAttr("el-reject");
        var firstMatch = getAttr("el-first-match");
        var ternary = getAttr("el-ternary");
        var abort = getAttr("el-abort");
        var trim = getAttr("el-trim");
        var fallback = getAttr("el-fallback");
        var fallbackClass = getAttr("el-fallback-class");
        var contentBefore = getAttr("el-content-before");
        var contentAfter = getAttr("el-content-after");

        for (var elfallbackprop in attributes) {
            if (elfallbackprop.indexOf("el-fallback-") === 0) {
                var matchprop = elfallbackprop.match(/^el-fallback-(.*)/)[1];
                if (attributes[matchprop] === undefined) {
                    attributes[matchprop] = attributes[elfallbackprop];
                }
                delete attributes[elfallbackprop];
            }
        }

        var empty = elementIsEmpty[tagName];

        var contents = getAttr("contents");
        var content = args.shift();

        if (args.length) {
            /*var lastArg = args[args.length-1];
            if (args.length === 2 && lastArg === "ternary") {
                attributes.ternary = lastArg;
                args.pop();
            } else if (lastArg === "firstmatch") {
                attributes.firstmatch = true;
            }*/
            content = [content].concat(args);
        }

        if (options.fn) {
            content = options.fn(this);
        }

        if (content === undefined) {
            if (!elementHasContentAttribute[tagName]) {
                content = attributes.content;
            }
            if (content === undefined) {
                content = attributes["el-content"];
            }
        }
        if (!elementHasContentAttribute[tagName]) {
            delete attributes["content"];
        }
        delete attributes["el-content"];

        if (contents && typeof contents !== "boolean") {
            content = contents;
            contents = true;
        }

        if (tagName === "img" && !attributes.alt) {
            attributes.alt = "";
        }

        /* http://blog.stevenlevithan.com/archives/faster-trim-javascript */
        function trim12 (str) {
            var str2 = str.replace(/^\s\s*/, '');
            var ws = /\s/;
            var i = str2.length;
            while (ws.test(str2.charAt(--i)));
            return str2.slice(0, i + 1);
        }

        function jsonifyAttr(attr) {
            // Er, why not just use JSON.parse?
            if (typeof attr === "string") {
                if (attr.indexOf("{") === 0 || attr.indexOf("[") === 0) {
                    try {
                        eval('attr = ' + attr + ';');
                    } catch(e) {}
                }
            }
            return attr;
        }

        function wrapInner(text, wrapAttr) {
            wrapAttr = jsonifyAttr(wrapAttr);
            var wrapAttrUse = typeof wrapAttr === "object" ? _.cloneDeep(wrapAttr) : {"el-tag": wrapAttr};
            text = Handlebars.helpers.el(text, {hash: wrapAttrUse});
            return text;
        }

        var chunks = [""];
        if (!content && fallback) {
            content = fallback;
        }
        if (content) {
            if (typeof content === "function") {
                content = content(attributes["el-params-content"], context);
            }
            if (_.isArray(content)) {
                chunks = content;
            } else {
                if (split) {
                    if (typeof content === "number") {
                        content = content.toString();
                    }
                    if (!content.split) {
                        console.log("no split for content", content);
                    }
                    var tmpChunks = content.split(split);
                    for (var tmpChunk = 0; tmpChunk < tmpChunks.length; tmpChunk++) {
                        if (tmpChunks[tmpChunk] && !tmpChunks[tmpChunk].match(split)) {
                            chunks.push(tmpChunks[tmpChunk]);
                        }
                    }
                } else {
                    chunks = [content];
                }
            }

            if (ternary !== undefined && chunks.length === 2) {
                var ternaryChunk = ternary ? 0 : 1;
                chunks = [chunks[ternaryChunk]];
            }

            if (firstMatch) {
                for (var fchunk in chunks) {
                    if (chunks[fchunk] || chunks[fchunk] === 0) {
                        chunks = [chunks[fchunk]];
                        break;
                    }
                }
            }

            for (var cchunk in chunks) {
                if (!chunks[cchunk]) {
                    continue;
                }
                if (attributes["el-content-phrase"]) {
                    chunks[cchunk] = Larynx.Phrase.get(chunks[cchunk]);
                } else if (typeof chunks[cchunk] === "function") {
                    chunks[cchunk] = chunks[cchunk](attributes["el-content-params"], context);
                }
            }
            if (wrap && !contents && !abort) {
                for (var chunk in chunks) {
                    chunks[chunk] = wrapInner(chunks[chunk], wrap);
                }
                chunks = [chunks.join("")];
                escape = false;
                wrap = null;
            }

            if (!contents) {
                chunks = [chunks.join(join)];
            }

            if (wrapAll && !abort) {
                chunks[0] = wrapInner(chunks[0], wrapAll);
                escape = false;
                wrapAll = null;
            }
            /*chunks = _.reject(chunks, function(val){
                return val.match(reject);
            });*/
        }

        if (abort) {
            // should this be escaped by default?
            return chunks.join("");
        }

        if (fallbackClass && _.isEmpty(attributes["class"])) {
            attributes["class"] = fallbackClass;
        }

        if (elementCanHaveNoContent[tagName]) {
            attributes["el-force"] = true;
        }

        for (var i = 0, clength = chunks.length; i < clength; i++) {
            var contentChunk = chunks[i];
            if (trim) {
                if (typeof contentChunk === "number") {
                    contentChunk = contentChunk.toString();
                }
                contentChunk = trim12(contentChunk);
            }
            if (empty || attributes["el-force"] || !contentChunk.match(reject)) {
                var attrStr = "";
                var keys = _.keys(attributes).sort();
                for (var key in keys) {
                    var prop = keys[key];
                    if (prop.indexOf("el-") !== 0) {
                        var attr = attributes[prop];
                        var escapeAttr = true;
                        var escapeFlag = attributes["el-escape-"+prop];
                        if (escapeFlag !== undefined && !escapeFlag) {
                            escapeAttr = false;
                        }
                        if (typeof attr === "function") {
                            attr = attr(attributes["el-params-"+prop]);
                        }
                        if (prop === "class") {
                            if (attr.join) {
                                attr = attr.sort().join(" ");
                            }
                        } else if (prop === "href" || prop === "src") {
                            // TODO: allow url params to be passed
                            // encodeURIComponent each param
                        }
                        if (attr || attributeCanHaveNoValue[prop]) {
                            attrStr += " " + prop;
                            if (!attributeIsBoolean[prop]) {
                                if (escapeAttr) {
                                    attr = Handlebars.Utils.escapeExpression(attr);
                                }
                                attrStr += "=\"" + attr + "\"";
                            }
                        }
                    }
                }
                if (escape !== false) {
                    contentChunk = Handlebars.Utils.escapeExpression(contentChunk);
                    //contentChunk = contentChunk.toString();
                }
                /*contentChunk = new Handlebars.SafeString(contentChunk); */
                output += "<" + tagName + attrStr + ">";
                if (!empty) {
                    if (wrap) {
                        contentChunk = wrapInner(contentChunk, wrap);
                    }
                    if (contentBefore) {
                        output += contentBefore;
                    }
                    output +=  contentChunk;
                    if (contentAfter) {
                        output += contentAfter;
                    }
                    output += "</" + tagName + ">";
                }
            }
        }
    if (output && wrapOuter) {
        var wrapOuterOptions = {
            hash: {
                attributes: wrapOuter,
                content: output,
                "el-escape": false
            }
        };
        output = Handlebars.helpers.el(wrapOuterOptions);
    }

    return output;
    /*
    console.log("content2", content);
    var newcontent = new Handlebars.SafeString(content);
    console.log("newcontent", newcontent);
    return newcontent.toString();
        //return new Handlebars.SafeString(content); */

    };

    function registerHelper (handlebars, helperName) {
        Handlebars = handlebars;
        helperName = helperName || "el";
        Handlebars.registerHelper(helperName, Element);
    }
    return {
        registerHelper: registerHelper,
        registerHelpers: registerHelper
    };
}));

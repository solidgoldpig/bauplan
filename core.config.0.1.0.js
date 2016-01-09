define({
    config: "core",
    map: {
        "*": { underscore: "lodash"}
    },
    shim: {
        lodash: {
            exports: "_"
        },
        backbone: {
            deps: [
                "underscore",
                "jquery"
            ],
            exports: "Backbone"
        },
        handlebars: {
            exports: "Handlebars"
        },
        "socket.io": {
            exports: "io"
        },
        thorax: {
            deps: [
                "underscore",
                "backbone",
                "jquery",
                "handlebars"
            ],
            exports: "Thorax"
        },
        modernizr: {
            exports: "Modernizr"
        },
        "jquery.easing": {
            deps: [
                "jquery"
            ],
            exports: "jQuery.fn.easing"
        },
        "jquery.viewport": {
            deps: [
                "jquery"
            ],
            exports: "jQuery.fn.viewport"
        },
        "jquery.autocomplete": {
            deps: [
                "jquery"
            ],
            exports: "jQuery.fn.autocomplete"
        },
        moment: {
            exports: "moment"
        },
        "moment.en.gb": {
            deps: [
                "moment"
            ]
        },
        numeral: {
            exports: "numeral"
        },
        markdown: {
            exports: "markdown"
        }
    },

    paths: {
        text: [
            "//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min",
            "lib/require/require.text-2.0.12"
        ],
        jquery: [
            "//code.jquery.com/jquery-1.11.3.min",
            "//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min"
        ],
        "jquery.cookie": [
            "//cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min",
            "lib/jquery.cookie/jquery.cookie-1.4.1"
        ],
        "jquery.easing": [
            "//cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.3/jquery.easing.min.js",
            "lib/jquery.easing/jquery.easing-1.3"
        ],
        "jquery.autocomplete": "lib/jquery.autocomplete/jquery.autocomplete-1.2.9",
        "jquery.viewport": "lib/jquery.viewport/jquery.viewport-0.0.0",
        lodash: [
            "//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.underscore.min",
            "lib/lodash/lodash.underscore-2.4.1"
        ],
        backbone: [
            "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min",
            "lib/backbone/backbone-1.1.2"
        ],
        handlebars: [
            "//cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.amd.min",
            "lib/handlebars/handlebars.amd-4.0.5"
        ],
        "socket.io": [
            "//cdnjs.cloudflare.com/ajax/libs/socket.io/0.9.16/socket.io.min",
            "lib/socket.io/socket.io-0.9.16.min"
        ],
        modernizr: [
            "//cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min",
            "lib/modernizr/modernizr-2.8.3"
        ],
        thorax: [
            "lib/thorax/thorax-cedad0bdc0ac34312185f18408d9b231935cd1f3.min"
        ],
        moment: [
            "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment-with-locales.min",
            "lib/moment/moment-with-locales-2.9.0"
        ],
        datejs: [
            "//cdnjs.cloudflare.com/ajax/libs/datejs/1.0/date.min",
            "lib/datejs/datejs-1.0.0"
        ],
        numeral: [
            "//cdnjs.cloudflare.com/ajax/libs/numeral.js/1.5.3/numeral.min",
            "lib/numeral/numeral-1.5.3.min"
        ],
        markdown: [
            "lib/markdown/markdown-0.5.0.min"
        ],
        wolsey: "lib/wolsey/wolsey-0.1.1.min",
        "handlebars.el": "lib/handlebars.el/handlebars.el-1.0.5.min",
        "handlebars.el.form": "lib/handlebars.el.form/handlebars.el.form-1.0.5.min",
        "handlebars.moment": "lib/handlebars.moment/handlebars.moment-1.0.4.min",
        "handlebars.numeral": "lib/handlebars.numeral/handlebars.numeral-0.1.1.min",
        "handlebars.choice": "lib/handlebars.choice/handlebars.choice-1.0.1.min",
        "handlebars.filter": "lib/handlebars.filter/handlebars.filter-1.0.1.min",
        "handlebars.phrase": "lib/handlebars.phrase/handlebars.phrase-1.0.4.min",
        "larynx": "lib/larynx/larynx-1.0.1.min",
        "objectmaker": "lib/objectmaker/objectmaker"
    }
});

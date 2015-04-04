# bauplan

Bauplan is a front-end framework providing models, collection, views, template helpers and loading, internationalisation (i18n), localisation, CSS functions and automatic input validation

It is built on top of

- [RequireJS]//requirejs.org
- [Thorax]//thoraxjs.org
- [Backbone]//backbonejs.org
- [jQuery]//jquery.com
- [Handlebars]//handlebarsjs.com
- [Larynx]//larynx.solidgoldpig.com
- [Less]//lesscss.org

### Version

0.1.0

### Getting it

    npm install bauplan

or

    git clone https://github.com/solidgoldpig/bauplan.git

### Creating an app

The minimum to get an app up and running would be to include the following within the html of the single page app sent by the server

    // AMD loader
    <script src="/lib/require/require-2.1.10.js"></script>
    <script>
        // minimum config
        var BauplanConfig = {
            config: "path-to-app-config"
        };
    </script>
    <script>
        // initialises app
        require(["/js/bauplan.init.js"]);
    </script>

### Initialising the app

Loading bauplan.init.js initialises the app.

It achieves this by loading the config file[s] specified. processing them and then loading the resulting list of modules, templates and resource bundles 

### Data provided by the app page

#### BauplanConfig

Provides additonal config values for the app

    var BauplanConfig = {
        baseUrl: "/",
            // where config and modules should be loaded relative to
        config: "example/example.config.1.0.0",
            // path to config (NB. without .js extension)
        clientdefaults: {},
            // any client defaults for modules to use
        features: { x: true, y: false }, // hash of boolean values 
        callback: function() {}
            // a function to call once the app has been rendered
    };

#### BauplanData

An optional object whose values are passed to bauplan%authentication

eg.

    var BauplanData = {
        loggedIn: true,
        registered: true
    };

### Anatomy of a config file

Essentially an app config file is an extension of RequireJs config values with the same properties.

#### deps

Any further config files that the current configuration depends on, so an app's config (or its dependencies) should include the following:

    "deps": "bauplan.config.0.1.0"

In turn bauplan%config%0%1%0 depends on core%config%0%1%0

#### paths

Files to be loaded as per standard RequireJS modules (ie. AMD-style)

NB. the extension .js will be added to the path.

eg.

    "todo.model": "js/model/todo.model",
    "todos.collection": "js/collection/todos.collection",
    "todo.controller": "js/controller/todo.controller",
    "todo.view": "js/view/todo.view"

##### Path key naming convention

- models - {{name}}.model
- collections - {{name}}.collection
- controllers - {{name}}.controller
- views - {{name}}.view

#### templates

Files to be loaded and processed for use as Handlebars templates

NB. the extension .hbs will be added to the path.

eg.

    "main.layout": "template/layout/main.layout",
    "control.view": "template/view/control.view",
    "actions": "template/control/actions.template",
    "checkbox.edit": "template/control/checkbox.edit.control"

##### Template key naming convention

- layout views - {{name}}.layout
- views - {{name}}.view
- templates - {{name}}
- controls - {{name}}.[edit|display]

#### langs

Files to be loaded and parsed for use in i18n

    "key": "path"

These files should be formatted as resource bundle style properties files.

NB. the extension .properties will be added to the path.

eg.

    "en.company": "app/lang/en.company"

##### Lang key naming convention

- {{lang}}.{{type}}

#### defaultlang

The default language/locale to use for the app.

Defaults to "en"

#### Additional properties

Are standard RequireJS config properties and behave accordingly

eg.

- waitSeconds
- shim

#### Cross-domain requests

In the case of non-javascript resources (eg. templates and lang files), if the path requested is from another domain, it will be suffixed with .js too. It is expected that the server will wrap the response in a define function that returns the language string.

In other words, it is possible to serve any of the files of a CDN

#### Path key overriding and resolution

- Where a later loaded config file has the same key as an earlier one, the first loaded value wins
- This makes it possible (indeed encouraged) to override a more core module/template by simply redefining its path in the higher, more specific config file. The original module can still be required using a new key.

### Modules

#### Models

Models are provided by extending [Bauplan.Model]bauplan%model

#### Collections

Collections are provided by extending [Bauplan.Collection]bauplan%collection

#### Controllers

Controllers are provided by extending [Bauplan.Controller]bauplan%controller

#### Views

Views are provided by extending [Bauplan.View]bauplan%view

#### Layout views

Layout views are provided by extending Bauplan.LayoutView in bauplan%thorax%patch.

This is handled automagically and should be handled by using the declarative layout template helper

#### Controls

Individual controls defined in the config are loaded by bauplan%controls and handled by bauplan%control%view.

The default controls are defined in default%control.

### Templates

Template files defined in the config are loaded and compiled by bauplan%templates

View templates are associated automatically with the view of the same name, unless that view's template option is set

### Template helpers

Insert the view named "foo" - instantiates the foo.view module and uses the foo.view template

    {{view "foo"}}

Insert a layout view, with the initial view set to the value of foo

    {{layout view=foo}}

Insert the template named "foo"

    {{template "foo"}}

Insert the text control with the control’s name set to "foo"

    {{control "text" name="foo"}}

For more details on helpers, see bauplan%helpers

### Internationalisation

Lang files defined in the config are loaded by bauplan%i18n

Internationalised phrases are inserted using the phrase helper (provided as part of Larynx)

    {{phrase "foo"}}

### Minimum configuration

Given that abstract views can be loaded 
- create app configuration
    - modules
        - router
        - app models
        - app views
        - app.setput (optional)
    - templates
        - views

### Unlicense

Bauplan is free and unencumbered software released into 
the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
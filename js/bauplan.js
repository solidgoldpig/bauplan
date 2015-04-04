define([
    "objectmaker",
    "bauplan.require",
    "bauplan.i18n",
    "bauplan.templates",
    "bauplan.model",
    "bauplan.collection",
    "bauplan.view",
    "bauplan.controller",
    "bauplan.layout.controller",
    "bauplan.authentication",
    "bauplan.authentication.controller",
    "bauplan.router.base",
    "bauplan.tracker",
    "bauplan.analytics",
    "bauplan.feature"
], function (
    ObjectMaker,
    BauplanRequire,
    BauplanI18N,
    BauplanTemplates,
    BauplanModel,
    BauplanCollection,
    BauplanView,
    BauplanController,
    BauplanLayoutController,
    BauplanAuthentication,
    BauplanAuthenticationController,
    BauplanRouterBase,
    BauplanTracker,
    BauplanAnalytics,
    BauplanFeature
) {
/**
 * @description ##  Convenience bundle
 *
 *     var Bauplan = require("bauplan");
 *
 * Loads main bauplan modules and makes them 
 * available as properties of the main Bauplan object
 * 
 * - {@link module:bauplan%require} => Bauplan.Require
 * - {@link module:bauplan%i18n} => Bauplan.I18N
 * - {@link module:bauplan%templates} => Bauplan.Templates
 * - {@link module:bauplan%model} => Bauplan.Model
 * - {@link module:bauplan%collection} => Bauplan.Collection
 * - {@link module:bauplan%view} => Bauplan.View
 * - {@link module:bauplan%controller} => Bauplan.Controller
 * - {@link module:bauplan%layout%controller} => Bauplan.LayoutController
 * - {@link module:bauplan%authentication} => Bauplan.Authentication
 * - {@link module:bauplan%authentication%controller} =>  Bauplan.AuthenticationController
 * - {@link module:bauplan%router%base} => Bauplan.RouterBase
 * - {@link module:bauplan%tracker} => Bauplan.Tracker
 * - {@link module:bauplan%analytics} => Bauplan.Analytics
 * - {@link module:bauplan%feature} => Bauplan.Feature
 *
 * @return {object} Bauplan object
 * @module bauplan
 */

    var Bauplan = ObjectMaker("bauplan");
    Bauplan.require = this.requirejs;

    Bauplan.namespace("Require", BauplanRequire);

    Bauplan.namespace("I18N", BauplanI18N);
    Bauplan.namespace("Templates", BauplanTemplates);

    Bauplan.addObject("Model", BauplanModel);
    Bauplan.addObject("Collection", BauplanCollection);
    Bauplan.addObject("View", BauplanView);
    Bauplan.addObject("Controller", BauplanController);

    Bauplan.addObject("LayoutController", BauplanLayoutController);

    Bauplan.addObject("Authentication", BauplanAuthentication);
    Bauplan.addObject("AuthenticationController", BauplanAuthenticationController);
    Bauplan.addObject("RouterBase", BauplanRouterBase);
    Bauplan.addObject("Tracker", BauplanTracker);
    Bauplan.addObject("Analytics", BauplanAnalytics);
    Bauplan.addObject("Feature", BauplanFeature);


    // Bauplan.Router gets added when we init Bauplan.RouterBase
    // Hmmm - should be Bauplan.Router and Bauplan.App.Router???

    return Bauplan;
});

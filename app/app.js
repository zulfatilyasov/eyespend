(function () {
	"use strict";

	var app = angular.module("app", [
		"ngRoute",
		"common",
		"ngSanitize",
		"ngTagsInput",
		"ui.mask",
		"ngAutocomplete",
		"AngularGM",
		"ngAnimate",
		"pascalprecht.translate",
		"tmh.dynamicLocale",
		"ngBootstrap",
		"geolocation",
		"LocalStorageModule",
		"n3-line-chart",
		"sun.scrollable",
		"angularSpinner",
		"ngDragDrop"
	]);

	app.run(function ($rootScope, $location) {
		$rootScope.location = $location;
	});
})();

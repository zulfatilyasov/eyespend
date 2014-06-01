(function () {
    'use strict';

    var controllerId = 'shell';
    angular.module('app').controller(controllerId, ['common', '$rootScope', 'tmhDynamicLocale', 'config', 'login', '$translate', '$timeout', shell]);

    function shell(common, $rootScope, tmhDynamicLocale, config, login, $translate, $timeout) {
        var vm = this;
        var events = config.events;
        vm.logout = login.logout;
        vm.langsOpen = false;
        var latitude;
        var longitude;

        $rootScope.showSpinner = false;
        $rootScope.placePicker = {};
        $rootScope.saveLocation = function () {
            common.$broadcast('locationSet', {
                latitude: $rootScope.markers[0].location.lat,
                longitude: $rootScope.markers[0].location.lng
            });
            $rootScope.overlayIsOpen = false;
        };
        $rootScope.setMarkerLocation = function (marker) {
            var position = marker.getPosition();
            $rootScope.markers[0].location.lat = position.lat();
            $rootScope.markers[0].location.lng = position.lng();
        };
        $rootScope.refreshMap = function () {
            $timeout(function () {
                var placeDetails = $rootScope.placePicker.details;
                console.log(placeDetails);
                if (!placeDetails)
                    return;
                latitude = placeDetails.geometry.location.k;
                longitude = placeDetails.geometry.location.A;
                $rootScope.mapCenter = new google.maps.LatLng(latitude, longitude);
                $rootScope.zoom = 17;
                $rootScope.markers = [
                    {
                        location: {
                            lat: latitude,
                            lng: longitude
                        },
                        options: function () {
                            return {
                                draggable: true
                            }
                        }
                    }
                ];
                $rootScope.$apply();
            }, 300);
        };
        function activate() {
            var promises = [];
            common.activateController(promises, controllerId)
                .then(function () {
                    common.logger.logSuccess('shell activated');
                    //@todo: Переместить в директивы.
                    $('div.overlay').css('display','block');
                });
        }

        vm.togglePopover = function () {
            vm.langsOpen = !vm.langsOpen;
//            $('#languages-menu').fadeToggle(150);
        };

        vm.translate = function (lang) {
            $translate.use(lang);
            tmhDynamicLocale.set(lang);
            vm.togglePopover();
        };

        function toggleSpinner(on) {
            $rootScope.showSpinner = on;
            $rootScope.hideContent = on;
            console.log('hide content ' + on);
        }

        $rootScope.$on('$routeChangeStart',
            function (event, next, current) {
                toggleSpinner(true);
            }
        );

        $rootScope.$on(events.controllerActivateSuccess,
            function (event, data) {
                toggleSpinner(false);
            }
        );

        $rootScope.$on(events.spinnerToggle,
            function (event, data) {
                toggleSpinner(data.show);
            }
        );

        activate();
    }

})
();

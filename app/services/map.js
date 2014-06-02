(function () {
    'use strict';

    var serviceId = 'map';
    angular.module('app').factory(serviceId, ['common', '$rootScope', 'config', 'geolocation', map]);

    function map(common, $rootScope, config, geolocation) {
        var events = config.events;

        $rootScope.showMap = true;
        $rootScope.placePicker = {};

        $rootScope.saveLocation = function () {
            common.$broadcast(events.locationSet, {
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

        function _setLocation(props) {
            $rootScope.mapCenter = new google.maps.LatLng(props.latitude, props.longitude);
            $rootScope.zoom = 17;
            if (!props.latitude || !props.longitude)
                $rootScope.zoom = 2;
            $rootScope.markers = [
                {
                    id: props.id,
                    location: {
                        lat: props.latitude,
                        lng: props.longitude
                    },
                    options: function () {
                        return {
                            draggable: props.markerDraggable
                        }
                    }
                }
            ];
        }

        function showAddress(transaction) {
            $rootScope.showMap = true;
            common.$timeout(function () {
                var mapProperties = {
                    latitude: transaction.latitude,
                    longitude: transaction.longitude,
                    markerDraggable: false,
                    id: transaction.id
                };
                _setLocation(mapProperties);
                $rootScope.overlayIsOpen = true;
                $rootScope.showPlacesInput = false;
            });
        }

        function pickAddress(transaction) {
            $rootScope.showMap = true;
            common.$timeout(function () {
                var mapProperties = {
                    latitude: transaction.latitude,
                    longitude: transaction.longitude,
                    markerDraggable: true,
                    id: transaction.id
                };
                _setLocation(mapProperties);
                if (!transaction.latitude || !transaction.longitude) {
                    geolocation.getLocation().then(function (data) {
                        mapProperties.longitude = data.coords.longitude;
                        mapProperties.latitude = data.coords.latitude;
                        _setLocation(mapProperties);
                    });
                }
                $rootScope.overlayIsOpen = true;
                $rootScope.placePicker = {};
                $rootScope.showPlacesInput = true;
            });
        }

        $rootScope.refreshMap = function () {
            common.$timeout(function () {
                var placeDetails = $rootScope.placePicker.details;
                if (!placeDetails)
                    return;
                var mapProperties = {
                    latitude: placeDetails.geometry.location.lat(),
                    longitude: placeDetails.geometry.location.lng(),
                    markerDraggable: true
                };
                _setLocation(mapProperties);
                $rootScope.$apply();
            }, 300);
        };

        return {
            pickAddress: pickAddress,
            showAddress: showAddress
        };
    }
})();

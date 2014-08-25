(function() {
  'use strict';

  var serviceId = 'map';
  angular.module('app').factory(serviceId, ['common', '$rootScope', 'config', 'geolocation', map]);

  function map(common, $rootScope, config, geolocation) {
    var events = config.events,
      lat = 0,
      lng = 0;

    $rootScope.showMap = true;
    $rootScope.placePicker = {};

    $rootScope.saveLocation = function() {
      lat = $rootScope.markers[0].location.lat;
      lng = $rootScope.markers[0].location.lng;
      $rootScope.overlayIsOpen = false;
    };

    $rootScope.closeMap = function() {
      $rootScope.overlayIsOpen = false;
      $('body').scrollTop(scrollValue);
    };

    $rootScope.setMarkerLocation = function(marker) {
      var position = marker.getPosition();
      $rootScope.markers[0].location.lat = position.lat();
      $rootScope.markers[0].location.lng = position.lng();
    };

    function _setLocation(props) {
      $rootScope.mapCenter = new google.maps.LatLng(props.latitude, props.longitude);
      $rootScope.zoom = 17;
      if (!props.latitude || !props.longitude)
        $rootScope.zoom = 2;
      $rootScope.markers = [{
        id: props.id,
        location: {
          lat: props.latitude,
          lng: props.longitude
        },
        options: function() {
          return {
            draggable: props.markerDraggable
          }
        }
      }];
    }

    function showAddress(transaction) {
      $rootScope.showPlacesInput = false;
      $rootScope.overlayIsOpen = true;
      var mapProperties = {
        latitude: transaction.latitude,
        longitude: transaction.longitude,
        markerDraggable: false,
        id: transaction.id
      };
      _setLocation(mapProperties);
    }

    function pickAddress(transaction) {
      var mapProperties = {
        latitude: transaction.latitude,
        longitude: transaction.longitude,
        markerDraggable: true,
        id: transaction.id
      };
      _setLocation(mapProperties);
      if (!transaction.latitude || !transaction.longitude) {
        geolocation.getLocation().then(function(data) {
          mapProperties.longitude = data.coords.longitude;
          mapProperties.latitude = data.coords.latitude;
          _setLocation(mapProperties);
        });
      }
      $rootScope.overlayIsOpen = true;
      $rootScope.placePicker = {};
      $rootScope.showPlacesInput = true;
    }

    $rootScope.$watch('placePicker.details', function(newVal, oldVal) {
      if (!newVal)
        return;
      $rootScope.refreshMap();
    });

    $rootScope.refreshMap = function() {
      common.$timeout(function() {
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

    function setTransactionCoords(transaction) {
      transaction.latitude = lat;
      transaction.longitude = lng;
      lat = null;
      lng = null;
    }

    return {
      pickAddress: pickAddress,
      showAddress: showAddress,
      setTxnCoords: setTransactionCoords
    };
  }
})();

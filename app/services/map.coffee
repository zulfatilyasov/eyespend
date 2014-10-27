angular.module('app').factory 'map',
 ['common', '$rootScope', 'config', 'geolocation',
    (common,$rootScope, config,geolocation) ->
        class Map
            lat = 0
            lng = 0
            $rootScope.saveLocation = ->
                lat = $rootScope.markers[0].location.lat
                lng = $rootScope.markers[0].location.lng
                $rootScope.overlayIsOpen = false
]

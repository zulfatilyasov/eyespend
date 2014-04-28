(function() {
    angular.module('app').factory('date', ['$filter', date]);

    function date($filter) {
        return {
            now: function() {
                return (new Date()).getTime();
            },
            toUnix: function toUnix(date) {
                return (new Date(date)).getTime();
            },
            format: function(date) {
                return $filter('date')(date, 'dd.MM.yyyy HH:mm');
            }
        };
    }
})();

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
            withoutTime:function(date){
                return $filter('date')(date, 'dd MMMM yyyy');
            },
            onlyTime:function(date){
                return $filter('date')(date, 'HH:mm');
            },
            format: function(date) {
                return $filter('date')(date, 'dd.MM.yyyy HH:mm');
            }
        };
    }
})();

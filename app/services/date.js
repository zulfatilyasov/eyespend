(function () {
    angular.module('app').factory('date', ['$filter', date]);

    function date($filter) {
        return {
            now: function () {
                return (new Date()).getTime();
            },
            toUnix: function toUnix(date) {
                return (new Date(date)).getTime();
            },
            withoutTime: function (date) {
                return $filter('date')(date, 'dd MMMM yyyy');
            },
            withoutTimeShort: function (date) {
                return $filter('date')(date, 'dd.MM.yyyy');
            },
            onlyTime: function (date) {
                return $filter('date')(date, 'HH:mm');
            },
            format: function (date) {
                return $filter('date')(date, 'dd.MM.yyyy HH:mm');
            },
            addTimeToTimestamp: function (timestamp, time) {
                var d = new Date();
                d.setTime(timestamp);
                time = time.replace(':','');
                var hours = time.slice(0,2);
                var minutes = time.slice(2,4);
                d.setHours(hours);
                d.setMinutes(minutes);
                return d.getTime();
            }
        };
    }
})();

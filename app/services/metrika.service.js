(function() {
    'use strict';

    var serviceId = 'metrika';
    angular.module('app').factory(serviceId, [metrika]);

    function metrika() {
        var yaCounter = yaCounter26644194

        function addedTransactions() {
            yaCounter.reachGoal('EXPENSEADDED');
        }

        function filteredTransactions() {
            yaCounter.reachGoal('EXPENSESFILTERED');
        }

        function statsOpended() {
            yaCounter.reachGoal('STATSOPENED');
        }

        function statsFiltered() {
            yaCounter.reachGoal('STATSFILTERED');
        }

        function emailLinkInitited() {
            yaCounter.reachGoal('EMAILLINKINITED');
        }

        return {
            addedTransactions: addedTransactions,
            filteredTransactions: filteredTransactions,
            statsOpended: statsOpended,
            emailLinkInitited: emailLinkInitited
        };
    }
})();

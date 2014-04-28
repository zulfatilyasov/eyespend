(function() {
    'use strict';

    var controllerId = 'shell';
    angular.module('app').controller(controllerId, ['common', shell]);

    function shell(common) {
        var vm = this;

        function activate() {
            var promises = [];
            common.activateController(promises, controllerId)
                .then(function() {
                    common.logger.logSuccess('shell activated');
                });
        }

        activate();
    }
    
})();

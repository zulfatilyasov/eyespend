(function () {
    'use strict';
    var controllerId = 'menu';
    angular.module('app').controller(controllerId, ['common', menu]);

    function menu(common) {
        var vm = this;

        function activate() {
            var promises = [];
            common.activateController(promises, controllerId)
                .then(function () {

                });
        }

        activate();
    }
})();

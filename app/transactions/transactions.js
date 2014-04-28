(function() {
    'use strict';
    var controllerId = 'transactions';
    angular.module('app').controller(controllerId, ['common', 'datacontext', '$rootScope', 'date', 'transaxns', 'angulargmContainer', transactions]);

    function transactions(common, datacontext, $rootScope, date, transaxns, angulargmContainer) {
        var getLogFn = common.logger.getLogFn;
        var logInfo = getLogFn(controllerId);
        var editedTransactionCopy;
        var vm = this;

        vm.tags = [];
        vm.trs = [];
        vm.newTnx = null;
        vm.isAdding = false;
        vm.sort = null;

        vm.showMap = function(transaction) {
            $rootScope.overlayIsOpen = true;
            $rootScope.mapCenter = new google.maps.LatLng(transaction.Address.lat, transaction.Address.lng);
            $rootScope.zoom = 17;
            $rootScope.transaction = transaction;
            $rootScope.markers = [{
                id: transaction.id,
                location: transaction.Address
            }];
        };
        vm.changeSorting = function(column) {
            vm.sort = transaxns.updateSorting(column);
        };
        // vm.search = function() {
        //     vm.trs = trs.filter(function(tranx) {
        //         var matchedTags = tranx.tags.filter(function(tag) {
        //             return tag.indexOf(vm.searchPattern) != -1
        //         })
        //         return matchedTags.length > 0;
        //     });
        // };
        // vm.searchPattern = "";

        vm.loadTags = function() {
            return common.$q.when(transaxns.userTags);
        };

        vm.getSortingForColumn = transaxns.getSortingForColumn;
        vm.total = transaxns.getTotalAmout;

        vm.filterByTags = function() {
            vm.trs = transaxns.filterByTags(vm.tags);
        };

        vm.filterByDate = function(fromDate, toDate) {
            vm.trs = transaxns.filterByDate(fromDate, toDate);
            $rootScope.$apply();
        };

        function _tagIsAlreadyAdded(tag) {
            return vm.tags.some(function(t) {
                return t.text === tag;
            });
        }

        vm.toggleAdding = function() {
            vm.isAdding = !vm.isAdding;
            vm.curDateTime = date.format(date.now());
        };
        vm.toggleEditing = function() {
            if (!vm.selectedTnx)
                return;
            if (!vm.isEditing) {
                vm.editedTnx = transaxns.copy(vm.selectedTnx);

                common.$timeout(function() {
                    vm.isEditing = true;
                    vm.selectedTnxDate = date.format(vm.selectedTnx.Date);
                });
            }
            else{
                common.$timeout(function() {
                    vm.isEditing = false;
                });   
            }
        };
        vm.saveTnx = function() {
            vm.selectedTnx.Date = vm.editedTnx.Date;
            vm.selectedTnx.Amount = vm.editedTnx.Amount;
            vm.selectedTnx.Address = vm.editedTnx.Address;
            vm.selectedTnx.tags = vm.editedTnx.tags;
            vm.isEditing = false;
        };
        vm.addTag = function(tag) {
            if (_tagIsAlreadyAdded(tag)) {
                return;
            }

            vm.tags.push({
                text: tag
            });
            vm.trs = transaxns.filterByTags(vm.tags);
        };

        vm.addTnx = function() {
            if (!vm.newTnx) {
                return;
            }
            // editedTransactionCopy = vm.selectedTnx.clone();
            console.log(editedTransactionCopy);
            var newTransaxn = transaxns.add(vm.newTnx);
            vm.trs.push(newTransaxn);
        };

        function _getTransactions() {
            return transaxns.getTransaxns()
                .then(function(trs) {
                    vm.trs = trs;
                    vm.minDate = transaxns.getMinDate();
                    vm.maxDate = transaxns.getMaxDate();
                    vm.sort = transaxns.sort;
                });
        }

        function activate() {
            var promises = [_getTransactions()];
            common.activateController(promises, controllerId)
                .then(function() {
                    common.logger.logSuccess('Данные загружены');
                });
        }
        activate();
    }
})();

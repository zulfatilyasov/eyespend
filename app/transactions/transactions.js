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
            $rootScope.mapCenter = new google.maps.LatLng(transaction.Address.lat, transaction.Address.lng);
            $rootScope.zoom = 17;
            $rootScope.transaction = transaction;
            $rootScope.markers = [{
                id: transaction.id,
                location: transaction.Address,
                options: function() {
                    return null;
                }
            }];
            $rootScope.overlayIsOpen = true;
        };

        vm.pickAddress = function() {
            $rootScope.markers = [{
                id: 0,
                location: {
                    lat: 55.80,
                    lng: 49.11
                },
                options: function() {
                    return {
                        draggable: true
                    };
                }
            }];
            $rootScope.zoom = 13;
            $rootScope.mapCenter = new google.maps.LatLng(55.80, 49.11);
            $rootScope.overlayIsOpen = true;
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
            if (!vm.isAdding) {
                vm.curDateTime = date.format(date.now());
                vm.isAdding = !vm.isAdding;
                common.$timeout(function() {
                    vm.showTransactionForm = !vm.showTransactionForm;
                }, 150);
            } else {
                vm.showTransactionForm = !vm.showTransactionForm;
                vm.isAdding = !vm.isAdding;
            }
        };

        vm.toggleEditing = function() {
            if (!vm.selectedTnx)
                return;
            if (!vm.isEditing) {
                vm.editedTnx = transaxns.copy(vm.selectedTnx);
                vm.selectedTnxDate = date.format(vm.selectedTnx.Date);
                common.$timeout(function() {
                    vm.isEditing = !vm.isEditing;
                });
                common.$timeout(function() {
                    vm.showEditForm = !vm.showEditForm;
                }, 300);
            } else {
                common.$timeout(function() {
                    vm.showEditForm = !vm.showEditForm;
                    vm.isEditing = !vm.isEditing;
                });
                common.$timeout(function() {
                    vm.editedTnx = null;
                }, 300);
            }
        };
        vm.saveTnx = function() {
            vm.selectedTnx.Date = vm.editedTnx.Date;
            vm.selectedTnx.Amount = vm.editedTnx.Amount;
            vm.selectedTnx.Address = vm.editedTnx.Address;
            vm.selectedTnx.tags = vm.editedTnx.tags;
            vm.toggleEditing();
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

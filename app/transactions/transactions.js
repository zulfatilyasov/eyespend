(function () {
    'use strict';
    var controllerId = 'transactions';
    angular.module('app').controller(controllerId, ['common', '$rootScope', '$scope', 'date', 'transaxns', '$translate', transactions]);

    function transactions(common, $rootScope, $scope, date, transaxns, $translate) {
        var vm = this;

        vm.tags = [];
        vm.trs = [];
        vm.newTnx = null;
        vm.isAdding = false;
        vm.selectedTnx = null;
        vm.sort = null;
        vm.showTransactionForm = false;
        vm.curDateTime = date.format(date.now());

        function editedTransactionNotValid() {
            return !vm.editedTnx || !vm.editedTnx.guid || !vm.selectedTnx;
        }

        function validateAndAddErrors() {
            if ($scope.newTransactionForm && !$scope.newTransactionForm.$valid) {
                $translate('CHECK_FORM_DATA').then(function (msg) {
                    vm.createError = msg;
                });
                return false;
            }
            if (!vm.newTnx) {
                vm.createError = "некорректные данные";
                return false;
            }
            return true;
        }

        vm.selectTransaction = function (transaction, $event) {
            vm.selectedTnx = transaction;

            $event.stopPropagation();
        };

        vm.showMap = function (transaction) {
            $rootScope.mapCenter = new google.maps.LatLng(transaction.latitude, transaction.longitude);
            $rootScope.zoom = 17;
            $rootScope.transaction = transaction;
            $rootScope.markers = [
                {
                    id: transaction.guid,
                    location: {
                        lat: transaction.latitude,
                        lng: transaction.longitude
                    },
                    options: function () {
                        return null;
                    }
                }
            ];
            $rootScope.overlayIsOpen = true;
        };

        vm.pickAddress = function () {
            $rootScope.markers = [
                {
                    id: 0,
                    location: {
                        lat: 55.80,
                        lng: 49.11
                    },
                    options: function () {
                        return {
                            draggable: true
                        };
                    }
                }
            ];
            $rootScope.zoom = 13;
            $rootScope.mapCenter = new google.maps.LatLng(55.80, 49.11);
            $rootScope.overlayIsOpen = true;
        };

        vm.changeSorting = function (column) {
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

        vm.loadTags = function () {
            return common.$q.when(transaxns.userTags);
        };

        vm.getSortingForColumn = transaxns.getSortingForColumn;
        vm.total = transaxns.getTotalAmout;

        vm.filterByTags = function () {
            vm.trs = transaxns.filterByTags(vm.tags);
        };

        vm.filterByDate = function (fromDate, toDate) {
            vm.trs = transaxns.filterByDate(fromDate, toDate);
            $rootScope.$apply();
        };

        function _tagIsAlreadyAdded(tag) {
            return vm.tags.some(function (t) {
                return t.text === tag;
            });
        }

        vm.toggleAdding = function () {
            if (!vm.isAdding) {
                vm.curDateTime = date.format(date.now());
                vm.isAdding = !vm.isAdding;
                common.$timeout(function () {
                    vm.showTransactionForm = !vm.showTransactionForm;
                }, 150);
            } else {
                vm.showTransactionForm = !vm.showTransactionForm;
                vm.isAdding = !vm.isAdding;
            }
        };

        vm.toggleEditing = function (transaction) {
            if (!vm.selectedTnx || !transaction || transaction.guid !== vm.selectedTnx.guid)
                return;
            if (!vm.isEditing) {
                vm.editedTnx = angular.copy(vm.selectedTnx);
                vm.selectedTnxDate = date.format(vm.selectedTnx.timestamp);
                common.$timeout(function () {
                    vm.isEditing = !vm.isEditing;
                });
                common.$timeout(function () {
                    vm.showEditForm = !vm.showEditForm;
                }, 300);
            } else {
                common.$timeout(function () {
                    vm.showEditForm = !vm.showEditForm;
                    vm.isEditing = !vm.isEditing;
                });
                common.$timeout(function () {
                    vm.editedTnx = null;
                }, 300);
            }
        };

        vm.saveTnx = function () {
            if (editedTransactionNotValid()) {
                vm.editError = "Неверные данные";
                console.error('Неверные данные при редактировании транзакции');
                return;
            }

            return transaxns.update(vm.editedTnx)
                .then(function () {
                    angular.copy(vm.editedTnx, vm.selectedTnx);
                    vm.toggleEditing();
                },
                function (msg) {
                    vm.editError = msg;
                }
            );
        };
        vm.remove = function (transaction) {
            if (!vm.selectedTnx || !transaction || vm.selectedTnx.guid !== transaction.guid)
                return;
            console.log(vm.selectedTnx.guid);
            transaxns.remove(vm.selectedTnx.guid)
                .then(function () {
                    console.log(vm.selectedTnx.guid);
                    var index = transaxns.getTransactionIndex(vm.selectedTnx.guid, vm.trs);
                    vm.trs.splice(index, 1);
                },
                function (msg) {
                    logError(msg);
                }
            );
        };
        vm.addTag = function (tag) {
            if (_tagIsAlreadyAdded(tag)) {
                return;
            }

            vm.tags.push({
                text: tag
            });
            vm.trs = transaxns.filterByTags(vm.tags);
        };

        vm.addTnx = function () {
            var newTransactionIsValid = validateAndAddErrors();
            if (!newTransactionIsValid)
                return;
            transaxns.create(vm.newTnx)
                .then(function (tnx) {
                    vm.trs.push(tnx);
                },
                function (msg) {
                    vm.createError = msg;
                }
            );
        };

        function _getTransactions() {
            return transaxns.getTransaxns()
                .then(function (trs) {
                    vm.trs = trs;
                    if (trs.length) {
                        vm.minDate = transaxns.getMinDate();
                        vm.maxDate = transaxns.getMaxDate();
                        vm.sort = transaxns.sort;
                    }
                });
        }

        function activate() {
            var promises = [_getTransactions()];
            common.activateController(promises, controllerId)
                .then(function () {
                    common.logger.logSuccess('Данные загружены');
                });
        }

        activate();
    }
})();

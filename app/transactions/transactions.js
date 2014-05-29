(function () {
    'use strict';
    var controllerId = 'transactions';
    angular.module('app').controller(controllerId, ['common', '$rootScope', '$scope', 'date', 'transaxns', '$translate', 'login', transactions]);

    function transactions(common, $rootScope, $scope, date, transaxns, $translate, login) {
        moment.lang('ru');
        var vm = this;
        var logInfo = common.logger.getLogFn(controllerId, 'log');
        var logError = common.logger.getLogFn(controllerId, 'logError');
        var fromUnixDate = null;
        var toUnixDate = null;
        vm.tags = [];
        vm.trs = [];
        vm.newTnx = {
            latitude: null,
            longitude: null
        };
        vm.isAdding = false;
        vm.isFiltering = false;
        vm.selectedTnx = null;
        vm.sort = null;
        vm.showTransactionForm = false;
        vm.showFilterForm = false;
        vm.curDateTime = date.format(date.now());
        vm.isLoading = false;
        vm.excelFileUrl = 'files/transactions.xls';
        vm.dateRanges = {
            'последние 7 дней': [moment().subtract('days', 6), moment()],
            'последние 30 дней': [moment().subtract('days', 29), moment()]
        };
        $scope.$watch('vm.filterDateRange', function (newVal, oldVal) {
            if (!newVal || !newVal.startDate || !newVal.endDate)
                return;
            vm.filterByDate(newVal.startDate.unix() * 1000, newVal.endDate.unix() * 1000);
        });
        $rootScope.showMap = true;
        function editedTransactionNotValid() {
            return !vm.editedTnx || !vm.editedTnx.id || !vm.selectedTnx;
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
        function fillMapProperties(transaction, draggable) {
            $rootScope.showMap = true;
            $rootScope.mapCenter = new google.maps.LatLng(transaction.latitude, transaction.longitude);
            $rootScope.zoom = 17;
            if (!transaction.latitude || !transaction.longitude)
                $rootScope.zoom = 2;
            $rootScope.transaction = transaction;
            $rootScope.markers = [
                {
                    id: transaction.id,
                    location: {
                        lat: transaction.latitude,
                        lng: transaction.longitude
                    },
                    options: function () {
                        return {
                            draggable: draggable
                        }
                    }
                }
            ];
        }

        vm.showMap = function (transaction) {
            $rootScope.showMap = true;
            common.$timeout(function () {
                fillMapProperties(transaction, false);
                $rootScope.overlayIsOpen = true;
                $rootScope.showPlacesInput = false;
            }, 100);
        };

        $rootScope.$on('locationSet',
            function (event, data) {
                var transaction = vm.isAdding ? vm.newTnx : vm.editedTnx;
                transaction.latitude = data.latitude;
                transaction.longitude = data.longitude;
            }
        );

        vm.pickAddress = function () {
            var transaction = vm.isAdding ? vm.newTnx : vm.editedTnx;
            fillMapProperties(transaction, true);
            $rootScope.overlayIsOpen = true;
            $rootScope.placePicker = {};
            $rootScope.showPlacesInput = true;
        };

        vm.changeSorting = function (column) {
            vm.sort = transaxns.updateSorting(column);
            $rootScope.showSpinner = true;
            console.log(vm.tags);
            transaxns.sort(fromUnixDate, toUnixDate, vm.tags)
                .success(function (transactions) {
                    vm.trs = transactions;
                    vm.richedTheEnd = false;
                    $rootScope.showSpinner = false;
                });
        };

        vm.loadTags = function () {
            return login.getUserTags();
        };

        vm.getSortingForColumn = transaxns.getSortingForColumn;

        vm.total = function () {
            return transaxns.getTotalAmout(vm.trs);
        };

        vm.filterByTags = function () {
            $rootScope.showSpinner = true;
            if (vm.tags.length === 0) {
                transaxns.sort(fromUnixDate, toUnixDate)
                    .success(function (trs) {
                        vm.trs = trs;
                        vm.richedTheEnd = false;
                        $rootScope.showSpinner = false;
                    });
            }
            else {
                transaxns.filterByTags(fromUnixDate, toUnixDate, vm.tags)
                    .success(function (transactions) {
                        vm.trs = transactions;
                        vm.richedTheEnd = true;
                        $rootScope.showSpinner = false;
                    })
                    .error(function (msg) {
                        $rootScope.showSpinner = false;
                        logError(msg);
                    });
            }
        };

        vm.datePickerRu = {
            cancelLabel: 'Отмена',
            applyLabel: 'OK',
            fromLabel:'От',
            toLabel:'До',
            customRangeLabel:'Выбрать интервал',
            monthNames: 'янв_фев_мар_апр_май_июнь_июль_авг_сен_окт_ноя_дек'.split("_")
        };

        vm.filterByDate = function (fromDate, toDate) {
            if (dateDidntChange(fromDate, toDate) || fromDate === toDate)
                return;

            if (fromDate) {
                fromUnixDate = fromDate;
                vm.minDate = date.format(fromDate);
            }
            if (toDate) {
                toUnixDate = toDate;
                vm.maxDate = date.format(toDate);
            }

            $rootScope.showSpinner = true;
            console.log(new Date(fromUnixDate));
            console.log(new Date(toUnixDate));
            transaxns.filterByDate(fromUnixDate, toUnixDate, vm.tags)
                .success(function (transactions) {
                    vm.trs = transactions;
//                    vm.richedTheEnd = true;
                    $rootScope.showSpinner = false;
                })
                .error(function (msg) {
                    $rootScope.showSpinner = false;
                    logError(msg);
                });
        };
        vm.lastWeekTransactions = function () {
            vm.tags = [];
            var weekBefore = (new Date()).setDate((new Date()).getDate() - 7);
            var today = (new Date()).getTime();
            vm.filterByDate(weekBefore, today);
        };
        vm.lastMonthTransactions = function () {
            vm.tags = [];
            var monthBefore = (new Date()).setDate((new Date()).getDate() - 30);
            var today = (new Date()).getTime();
            vm.filterByDate(monthBefore, today);
        };


        function _tagIsAlreadyAdded(tag) {
            return vm.tags.some(function (t) {
                return t.text === tag;
            });
        }

        function dateDidntChange(fromDate, toDate) {
            if ((!fromDate || fromUnixDate === fromDate ) && (!toDate || toUnixDate === toDate))
                return true;
        }

        vm.showImage = function (imgUrl) {
            $rootScope.showImage = true;
            $rootScope.showMap = false;
            $rootScope.imgUrl = imgUrl;
            $rootScope.overlayIsOpen = true;
        };

        vm.loadMoreTransactions = function ($inview, $inviewpart) {
            if (vm.isLoading || !$inview || ($inviewpart !== "bottom" && $inviewpart !== "both"))
                return;
//            logInfo('loading next transactions');
            vm.isLoading = true;
            transaxns.getTransaxns(fromUnixDate, toUnixDate, vm.tags)
                .success(function (result) {
                    if (result && result.length && result.length > vm.trs.length) {
                        vm.trs = result;
                    }
                    else {
                        vm.richedTheEnd = true;
                    }
                    vm.isLoading = false;
                })
                .error(function () {
                    vm.isLoading = false;
                    logError('error loading next batch');
                });
        };

        var openAddForm = function () {
            vm.curDateTime = date.format(date.now());
            vm.isAdding = true;
            vm.formIsOpen = true;
        };

        var openFilterForm = function () {
            vm.isFiltering = true;
            vm.formIsOpen = true;
        };

        var closeForms = function () {
            var def = common.defer();
            vm.formIsOpen = false;
            common.$timeout(function () {
                vm.isFiltering = false;
                vm.isAdding = false;
                def.resolve();
            }, 300);
            return def.promise;
        };

        vm.toggleAdding = function () {
            if (vm.isFiltering) {
                closeForms().then(function () {
                    openAddForm();
                });
            }
            else if (!vm.isAdding) {
                openAddForm();
            }
            else {
                closeForms();
            }
        };

        vm.toggleFiltering = function () {
            if (vm.isAdding) {
                closeForms().then(function () {
                    openFilterForm();
                });
            }
            else if (!vm.isFiltering) {
                openFilterForm();
            }
            else {
                closeForms();
            }
        };

        vm.toggleEditing = function (transaction) {
            if (!vm.selectedTnx || !transaction || transaction.id !== vm.selectedTnx.id)
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
                logError('Неверные данные при редактировании транзакции');
                return;
            }

            return transaxns.update(vm.editedTnx)
                .then(function () {
                    transaxns.copy(vm.editedTnx, vm.selectedTnx);
                    vm.toggleEditing(vm.selectedTnx);
                },
                function (msg) {
                    vm.editError = msg;
                }
            );
        };
        vm.remove = function (transaction) {
            if (!vm.selectedTnx || !transaction || vm.selectedTnx.id !== transaction.id)
                return;
            transaxns.remove(vm.selectedTnx.id)
                .then(function () {
                    var index = transaxns.getTransactionIndex(vm.selectedTnx.id, vm.trs);
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
            if (!vm.isFiltering)
                vm.toggleFiltering();
            vm.tags.push({
                text: tag
            });
            vm.filterByTags(vm.tags);
        };

        vm.addTnx = function () {
            var newTransactionIsValid = validateAndAddErrors();
            if (!newTransactionIsValid)
                return;
            transaxns.create(vm.newTnx)
                .then(function (tnx) {
                    vm.trs.unshift(tnx);
                    vm.newTnx = {};
                },
                function (msg) {
                    vm.createError = msg;
                }
            );
        };

        function _getTransactions() {
            $rootScope.showSpinner = true;
            vm.isLoading = true;
            return transaxns.getTransaxns()
                .success(function (trs) {
                    vm.trs = trs;
                    if (trs.length) {
                        $rootScope.showSpinner = false;
                        vm.isLoading = false;
                        vm.sort = transaxns.sortOptions;
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
})
();

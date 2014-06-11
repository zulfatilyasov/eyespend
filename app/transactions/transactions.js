(function () {
    'use strict';
    var controllerId = 'transactions';
    angular.module('app').controller(controllerId,
        ['common', '$rootScope', '$scope', 'date', 'transaxns', '$translate', 'login', 'debounce', 'geolocation', 'map', 'config', transactions]);

    function transactions(common, $rootScope, $scope, date, transaxns, $translate, login, debounce, geolocation, map, config) {
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
        vm.onlyWithPhoto = false;
        vm.isAdding = false;
        vm.isFiltering = false;
        vm.selectedTnx = null;
        vm.sort = null;
        vm.showTransactionForm = false;
        vm.showFilterForm = false;
        vm.curDateTime = date.format(date.now());
        vm.isLoading = false;
        vm.excelFileUrl = 'files/transactions.xls';
        vm.maxAmountToShow = 3000;
        vm.minAmountToShow = 0;
        vm.dateRanges = {
            'последние 7 дней': [moment().subtract('days', 6), moment()],
            'последние 30 дней': [moment().subtract('days', 29), moment()]
        };
        vm.getTagColorStyle = function (color) {
            return 'transparent ' + color + ' transparent transparent';
        };

        $scope.$watch('vm.filterDateRange', function (newVal, oldVal) {
            if (!newVal || !newVal.startDate || !newVal.endDate)
                return;
            vm.filterByDate(newVal.startDate.unix() * 1000, newVal.endDate.unix() * 1000);
        });

        $scope.$watch('vm.onlyWithPhoto', function (newVal, oldVal) {
            if (newVal == oldVal)
                return;
            transaxns.getFirstPageWithFilters(fromUnixDate, toUnixDate, vm.tags, newVal)
                .success(function (trs) {
                    vm.trs = trs;
                });
        });

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

        vm.onTransitionEnd = function () {
            if (!vm.formIsOpen && vm.isAdding)
                vm.isAdding = false;
            if (!vm.formIsOpen && vm.isFiltering)
                vm.isFiltering = false;
            console.log('transition endedd');
        };

        function fillMapProperties(props) {
            $rootScope.mapCenter = new google.maps.LatLng(props.latitude, props.longitude);
            $rootScope.zoom = 17;
            if (!props.latitude || !props.longitude)
                $rootScope.zoom = 2;
            $rootScope.markers = [
                {
                    id: props.id,
                    location: {
                        lat: props.latitude,
                        lng: props.longitude
                    },
                    options: function () {
                        return {
                            draggable: props.markerDraggable
                        }
                    }
                }
            ];
        }


        $rootScope.$on(config.events.locationSet,
            function (event, data) {
                var transaction = vm.isAdding ? vm.newTnx : vm.editedTnx;
                transaction.latitude = data.latitude;
                transaction.longitude = data.longitude;
            }
        );

        vm.showAddress = map.showAddress;
        vm.pickAddress = function () {
            var transaction = vm.isAdding ? vm.newTnx : vm.editedTnx;
            map.pickAddress(transaction);
        };

        vm.changeSorting = function (column) {
            vm.sort = transaxns.updateSorting(column);
            $rootScope.showSpinner = true;
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

        vm.tagFilterChange = debounce(vm.filterByTags, 2000, false);

        vm.datePickerRu = {
            cancelLabel: 'Отмена',
            applyLabel: 'OK',
            fromLabel: 'От',
            toLabel: 'До',
            customRangeLabel: 'Выбрать интервал',
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

        vm.downloadExcel = function () {
            transaxns.getExcelFile(fromUnixDate, toUnixDate, vm.tags, vm.onlyWithPhoto);
        }

        vm.loadMoreTransactions = function ($inview, $inviewpart) {
            if (vm.isLoading || !$inview || ($inviewpart !== "bottom" && $inviewpart !== "both"))
                return;
            vm.isLoading = true;
            transaxns.getTransaxns(fromUnixDate, toUnixDate, vm.tags, vm.onlyWithPhoto)
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

        var closeForms = function (callback) {
            var def = common.defer();
            vm.formIsOpen = false;
            if (callback) {
                common.$timeout(function () {
                    vm.isAdding = false;
                    vm.isFiltering = false;
                    callback();
                    def.resolve();
                }, 500);
            }
            if ($(window).width() <= 1024) {
                vm.isAdding = false;
                vm.isFiltering = false;
            }
            return def.promise;
        };

        vm.toggleAdding = function () {
            if (vm.isFiltering) {
                closeForms(openAddForm);
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
                closeForms(openFilterForm);
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
            $rootScope.hideContent = true;

            vm.isLoading = true;
            return transaxns.getTransaxns()
                .success(function (trs) {
                    vm.trs = trs;
                    if (trs.length) {
                        $rootScope.showSpinner = false;
                        $rootScope.hideContent = false;
                        vm.isLoading = false;
                        vm.sort = transaxns.sortOptions;
                    }
                });
        }

        function activate() {
            var promises = [_getTransactions()];
            common.activateController(promises, controllerId)
                .then(function () {
                    $('.js-slider').slider({
                        tooltip: 'hide',
                        max: vm.maxAmountToShow,
                        min: vm.minAmountToShow
                    }).on('slide', function (ev) {
                        var val = $(this).slider('getValue');
                        vm.minAmountToShow = val[0];
                        vm.maxAmountToShow = val[1];
                        $rootScope.$apply();
                    });
                });
        }

        activate();
    }
})
();

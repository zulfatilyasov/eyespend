(function () {
    'use strict';
    var controllerId = 'transactions';
    angular.module('app').controller(controllerId,
        ['common', 'config', '$rootScope', '$scope', 'date', 'transaxns', '$translate', 'login', 'debounce', 'map', transactions]);

    function transactions(common, config, $rootScope, $scope, date, transaxns, $translate, login, debounce, map) {
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
        vm.withPhotoVal = false;
        vm.onlyWithPhoto = false;
        vm.isAdding = false;
        vm.isFiltering = false;
        vm.selectedTnx = null;
        vm.sort = null;
        vm.showTransactionForm = false;
        vm.showFilterForm = false;
        vm.curDateTime = date.withoutTime(date.now());
        vm.isLoading = false;
        vm.filterDateRange = null;

        vm.getTagColorStyle = function (color) {
            return 'transparent ' + color + ' transparent transparent';
        };

        $scope.$watch('vm.filterDateRange', function (newVal, oldVal) {
            if (!newVal || !newVal.startDate || !newVal.endDate)
                return;
            vm.filterByDate(newVal.startDate.unix() * 1000, newVal.endDate.unix() * 1000);
        });

        $scope.$watch('vm.filterMobileDateRange', function (newVal, oldVal) {
            if (!newVal || !newVal.startDate || !newVal.endDate)
                return;

            setDates(newVal.startDate.unix() * 1000, newVal.endDate.unix() * 1000);
        });

        $scope.$watch('vm.withPhotoVal', function (newVal, oldVal) {
            if (newVal == oldVal)
                return;
            $rootScope.showSpinner = true;
            vm.onlyWithPhoto = newVal;
            transaxns.getFirstPageWithFilters(fromUnixDate, toUnixDate, vm.tags, newVal)
                .success(function (data) {
                    $rootScope.showSpinner = false;
                    vm.trs = data.transactions;
                    vm.total = data.total;
                });
        });
        $scope.$watch('vm.onlyWithPhotoMobile', function (newVal, oldVal) {
            if (newVal == oldVal)
                return;
            vm.onlyWithPhoto = newVal;
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

        var selectTransaction = function (transaction) {
            if (vm.editing) {
                vm.editing = false;
                var original = transaxns.getTransasctionById(vm.selectedTnx.id);
                transaxns.copy(original, vm.selectedTnx)
            }
            vm.selectedTnx = transaction;
        };

        vm.addNewTxn = function (isDesktop) {
            if (isDesktop)
                vm.trs.unshift({
                    timestamp: date.now(),
                    date: date.withoutTimeShort(date.now()),
                    time: date.onlyTime(date.now()),
                    new: true
                });
            vm.newTnx.dateTime = date.format(date.now());
            if (vm.isAdding == false)
                vm.isAdding = true;
        };

        vm.tableClicked = function ($event) {
            if ($event.target) {
                var $target = $($event.target);
                var $tr = $target.parents('tr');
                var index = parseInt($tr.attr('data-index'));
                var transaction = vm.trs[index];

                if (!transaction)
                    return;
                if (!$tr.is('.edited'))
                    selectTransaction(transaction);
                if ($target.is('.edit-transaction')) {
                    vm.editing = true;
                    common.$timeout(function () {
                        $tr.find('.amount').focus();
                    });
                }
                else if ($target.is('.fa-map-marker')) {
                    map.showAddress(vm.selectedTnx);
                }
                else if ($target.is('.pickAddress')) {
                    map.pickAddress(transaction);
                }
                else if ($target.is('.fa-picture-o')) {
                    showImage(vm.selectedTnx.imgUrl)
                }
                else if ($target.is('.fa-check')) {
                    vm.saveTnx(transaction)
                }
                else if ($target.is('.fa-trash-o')) {
                    vm.remove(transaction);
                }
                else if ($target.is('.transaction-tag')) {
                    var text = $target.text().trim();
                    vm.addTag(text);
                }
            }
        };

        vm.showAddress = map.showAddress;
        vm.pickAddress = map.pickAddress;

        vm.closeMobileInfo = function () {
            if (vm.editingMobile) {
                vm.editingMobile = false;
            }
            vm.selectedTnx = null;
        };

        vm.changeSorting = function (column) {
            vm.sort = transaxns.updateSorting(column);
            $rootScope.showSpinner = true;
            transaxns.sort(fromUnixDate, toUnixDate, vm.tags, vm.onlyWithPhoto)
                .success(function (data) {
                    vm.trs = data.transactions;
                    vm.total = data.total;
                    vm.richedTheEnd = vm.trs.length < 30;
                    $rootScope.showSpinner = false;
                });
        };

        vm.loadTags = function () {
            var def = common.defer();
            login.getUserTags()
                .then(function (data) {
                    if (vm.userTags) {
                        def.resolve(data);
                        return;
                    }
                    vm.userTags = angular.copy(data);
                    vm.selectedTag = vm.userTags[0];
                    def.resolve(vm.userTags);
                });
            return def.promise;
        };

        vm.getSortingForColumn = transaxns.getSortingForColumn;

        vm.tagFilterChange = debounce(applyfilters, 0, false);

        if (config.local == 'ru') {
            vm.datePickerTexts = {
                cancelLabel: 'Отмена',
                applyLabel: 'OK',
                fromLabel: 'От',
                toLabel: 'До',
                customRangeLabel: 'Выбрать интервал',
                firstDay: 1,
                monthNames: 'янв_фев_мар_апр_май_июнь_июль_авг_сен_окт_ноя_дек'.split("_")
            };
            vm.dateRanges = {
                'Последние 7 дней': [moment().subtract('days', 6), moment()],
                'Последние 30 дней': [moment().subtract('days', 29), moment()]
            };
        }
        else {
            vm.datePickerTexts = {
                cancelLabel: 'Cancel',
                applyLabel: 'OK',
                fromLabel: 'From',
                toLabel: 'To',
                firstDay: 0,
                customRangeLabel: 'Select interval',
                daysOfWeek: 'Su_Mo_Tu_We_Th_Fr_Sa'.split("_"),
                monthNames: 'jan_feb_mar_apr_may_jun_jul_aug_sep_okt_nov_dec'.split("_")
            };
            vm.dateRanges = {
                'Last 7 days': [moment().subtract('days', 6), moment()],
                'Last 30 days': [moment().subtract('days', 29), moment()]
            };
        }


        function applyfilters() {
            $rootScope.showSpinner = true;
            transaxns.getFirstPageWithFilters(fromUnixDate, toUnixDate, vm.tags, vm.onlyWithPhoto)
                .success(function (data) {
                    $rootScope.showSpinner = false;
                    vm.richedTheEnd = false;
                    vm.trs = data.transactions;
                    vm.total = data.total;
                })
                .error(function (msg) {
                    $rootScope.showSpinner = false;
                    logError(msg);
                });
        }

        vm.applyFilters = applyfilters;

        function setDates(fromDate, toDate) {
            if (fromDate) {
                fromUnixDate = fromDate;
                vm.minDate = date.format(fromDate);
            }
            if (toDate) {
                toUnixDate = toDate;
                vm.maxDate = date.format(toDate);
            }
        }

        vm.getTags = function () {
            var tagsStr = "";
            for (var i = 0, len = vm.tags.length; i < len; i++) {
                tagsStr += vm.tags[i].text + "; ";
            }
            return tagsStr;
        };

        vm.filterByDate = function (fromDate, toDate) {
            setDates(fromDate, toDate);
            applyfilters();
        };

        vm.showPeriod = function () {
            return (vm.minDate || vm.maxDate) && vm.minDate != vm.maxDate;
        }

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

        var showImage = function (imgUrl) {
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
                    var loadedTransactions = result.transactions;
                    vm.total = result.total;
                    if (loadedTransactions && loadedTransactions.length && loadedTransactions.length > vm.trs.length) {
                        vm.trs = loadedTransactions;
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

        function dropFilters() {
            vm.tags = [];
            vm.filterDateRange = null;
        }

        function filtersApplied() {
            return vm.tags.length || (vm.filterDateRange && fromUnixDate !== toUnixDate);
        }

        vm.toggleFiltering = function () {
            if (vm.isFiltering && filtersApplied()) {
                dropFilters();
            }
            vm.isFiltering = !vm.isFiltering;
        };

        vm.toggleEditingMobile = function () {
            vm.editedTnx = transaxns.copy(vm.selectedTnx);
            vm.editedTnx.dateTime = date.format(vm.selectedTnx.timestamp);
            vm.editingMobile = true;
        };

        vm.saveTnx = function (transaction) {
            if (transaction.new) {
                return transaxns.create(transaction)
                    .then(function (createdTxn) {
                        transaction.latitude = createdTxn.latitude;
                        transaction.longitude = createdTxn.longitude;
                        transaction.new = false;
                    }
                );
            }
            else {
                return transaxns.update(transaction)
                    .then(function () {
                        if (vm.editing)
                            vm.editing = false;
                        if (vm.editingMobile) {
                            vm.editingMobile = false;
                            transaxns.copy(transaction, vm.selectedTnx);
                        }
                    },
                    function (msg) {
                        vm.editError = msg;
                    }
                );
            }
        };

        vm.remove = function (transaction) {
            if (transaction.new) {
                removeTransactionById(transaction.id);
                return;
            }

            if (!vm.selectedTnx || !transaction || vm.selectedTnx.id !== transaction.id)
                return;

            transaxns.remove(vm.selectedTnx.id)
                .then(function () {
                    if (vm.editing) {
                        vm.editing = false;
                    }
                    if (vm.editingMobile) {
                        vm.editingMobile = false;
                    }
                    removeTransactionById(vm.selectedTnx.id);
                    vm.selectedTnx = null;
                },
                function (msg) {
                    logError(msg);
                }
            );
        };

        function removeTransactionById(id) {
            var index = transaxns.getTransactionIndex(id, vm.trs);
            vm.trs.splice(index, 1);
        }

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

        vm.addTag = function (tagText) {
            if (_tagIsAlreadyAdded(tagText)) {
                return;
            }
            vm.tags.push({
                text: tagText
            });
            if (!vm.isFiltering)
                vm.isFiltering = true;
            applyfilters();
        };

        function _getTransactions() {
            $rootScope.showSpinner = true;
            $rootScope.hideContent = true;

            vm.isLoading = true;
            return transaxns.getTransaxns()
                .success(function (data) {
                    vm.trs = data.transactions;
                    vm.total = data.total;
                    $rootScope.showSpinner = false;
                    $rootScope.hideContent = false;
                    vm.isLoading = false;
                    vm.sort = transaxns.sortOptions;
                    if (vm.trs.length < 30) {
                        vm.richedTheEnd = true;
                    }
                });
        }

        function activate() {
            var promises = [_getTransactions(), vm.loadTags()];
            common.activateController(promises, controllerId)
                .then(function () {

                });
        }

        activate();
    }
})
();

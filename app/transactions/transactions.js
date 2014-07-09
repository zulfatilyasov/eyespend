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
        vm.editNewTxnDate = false;
        vm.editNewTxnTime = false
        vm.showSideActions = false;
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
        vm.curDate = date.withoutTime(date.now());
        vm.curTime = date.onlyTime(date.now());
        vm.isLoading = false;
        vm.maxAmountToShow = 3000;
        vm.minAmountToShow = 0;

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
            if (vm.editTxn) {
                vm.editTxn = false;
                vm.editTxnDate = false;
                vm.editTxnTime = false;
            }
            if (vm.isEditing) {
                transaxns.copy(transaction, vm.editedTnx);
                vm.selectedTnxDate = date.format(vm.selectedTnx.timestamp);
            }
            vm.selectedTnx = transaction;
        };

        vm.newTransactions = [];
        vm.addNewTxn = function(){
            vm.newTransactions.push({
                timestamp:date.now()
            });
            if(vm.isAdding == false)
                vm.isAdding = true;
        };

        vm.removeNewTxn = function(index){
            vm.newTransactions.splice(index, 1);
        };

        vm.saveNewTxn = function(newTxn){

        };

        vm.tableClicked = function ($event) {
            if ($event.target) {
                var $target = $($event.target);
                var $tr = $target.parents('tr');
                if ($tr.is('.edited') && !$target.is('.focus-next'))
                    return;
                var index = $tr.data('index');

                if (!vm.trs[index])
                    return;
                if (!$tr.is('.edited'))
                    selectTransaction(vm.trs[index]);

                if (vm.isEditing && $target.is('.transaction-tag')) {
                    vm.toggleEditing(vm.selectedTnx);
                    return;
                }
                if (vm.isAdding) {
                    $rootScope.toggleAdding();
                    return;
                }
                if (vm.isFiltering && !$target.is('.transaction-tag')) {
                    $rootScope.toggleFiltering();
                    return;
                }

                if ($target.is('.edit-transaction')) {
                    vm.editedTags = angular.copy(vm.selectedTnx.tags);
                    transaxns.copy(vm.selectedTnx, vm.editedTnx);
                    vm.selectedTnxDate = date.withoutTime(vm.selectedTnx.timestamp);
                    vm.selectedTnxTime = date.onlyTime(vm.selectedTnx.timestamp);
                    vm.trs[index].edited = true;
//                    vm.editTxn = true;
                    common.$timeout(function () {
                        $tr.find('.amount').focus();
                    });
                    //vm.toggleEditing(vm.selectedTnx);
                }
                else if ($target.is('.focus-next')) {
                    vm.editTxnDate = true;
                    common.$timeout(function () {
                        $target.next().focus();
                    });
                }
                else if ($target.is('.fa-map-marker')) {
                    map.showAddress(vm.selectedTnx);
                }
                else if ($target.is('.fa-picture-o')) {
                    showImage(vm.selectedTnx.imgUrl)
                }
                else if ($target.is('.transaction-tag')) {
                    var text = $target.text().trim();
                    vm.addTag(text);
                }
            }
        };

        vm.onTransitionEnd = function () {
            if (!vm.formIsOpen && vm.isAdding)
                vm.isAdding = false;
            if (!vm.formIsOpen && vm.isFiltering)
                vm.isFiltering = false;
        };

        vm.showAddress = map.showAddress;
        vm.pickAddress = function () {
            var transaction = vm.isAdding ? vm.newTnx : vm.editedTnx;
            map.pickAddress(transaction);
        };

        vm.addMobile = function () {
            vm.isAdding = !vm.isAdding;
            if (vm.isAdding)
                vm.curDateTime = date.format(date.now());
        };
        vm.filterMobile = function () {
            vm.isFiltering = !vm.isFiltering;
        };

        vm.closeMobileInfo = function () {
            if (vm.isEditing) {
                vm.isEditing = false;
            }
            if (vm.isFiltering) {
                vm.isFiltering = false;
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
        vm.selectedInterval = "всего";

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

//        vm.total = function () {
//            return transaxns.getTotalAmout(vm.trs);
//        };

        vm.tagFilterChange = debounce(applyfilters, 2000, false);

        if (config.local == 'ru') {
            vm.datePickerRu = {
                cancelLabel: 'Отмена',
                applyLabel: 'OK',
                fromLabel: 'От',
                toLabel: 'До',
                customRangeLabel: 'Выбрать интервал',
                monthNames: 'янв_фев_мар_апр_май_июнь_июль_авг_сен_окт_ноя_дек'.split("_")
            };
            vm.dateRanges = {
                'Последние 7 дней': [moment().subtract('days', 6), moment()],
                'Последние 30 дней': [moment().subtract('days', 29), moment()]
            };
        }
        else{
            vm.datePickerRu = {
                cancelLabel: 'Cancel',
                applyLabel: 'OK',
                fromLabel: 'From',
                toLabel: 'To',
                customRangeLabel: 'Select interval',
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
            if (dateDidntChange(fromDate, toDate) || fromDate === toDate)
                return;
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

        $rootScope.toggleAdding = function () {
            if (vm.isAdding) {
                vm.showSideForm = false;
                common.$timeout(function () {
                    $rootScope.showSideActions = true;
                    vm.isAdding = false;
                }, 300);
            }
            else {
                vm.curDateTime = date.withoutTime(date.now());
                $rootScope.showSideActions = false;
                vm.isAdding = true;
                common.$timeout(function () {
                    vm.curDateTime = date.format(date.now());
                    vm.showSideForm = true;
                }, 300);
            }
        };
        $rootScope.toggleFiltering = function () {
            if (vm.isFiltering) {
                vm.showSideForm = false;
                common.$timeout(function () {
                    $rootScope.showSideActions = true;
                    vm.isFiltering = false;
                }, 300);
            }
            else {
                $rootScope.showSideActions = false;
                vm.isFiltering = true;
                common.$timeout(function () {
                    vm.curDateTime = date.format(date.now());
                    vm.showSideForm = true;
                }, 300);
            }
        };

        vm.toggleEditing = function (transaction) {
            if (!vm.selectedTnx || !transaction || transaction.id !== vm.selectedTnx.id)
                return;
            if (vm.isAdding)
                $rootScope.toggleAdding();
            if (vm.isFiltering)
                $rootScope.toggleFiltering();

            if (vm.isEditing) {
                vm.showSideForm = false;
                common.$timeout(function () {
                    $rootScope.showSideActions = true;
                    vm.isEditing = false;
                }, 300);
                vm.editedTnx = null;
            }
            else {
                transaxns.copy(transaction, vm.editedTnx);
                vm.selectedTnxDate = date.format(vm.selectedTnx.timestamp);
                $rootScope.showSideActions = false;
                vm.isEditing = true;
                common.$timeout(function () {
                    vm.showSideForm = true;
                }, 300);
            }
        };

        vm.clearFilters = function () {
            var shouldApply = vm.tags.length || vm.onlyWithPhoto;
            vm.tags = [];
            vm.onlyWithPhoto = false;
            if (shouldApply)
                applyfilters();
            if (vm.showSideForm) {
                vm.showSideForm = false;
                common.$timeout(function () {
                    $rootScope.showSideActions = true;
                    vm.isFiltering = false;
                }, 300);
            }
            else {
                vm.isFiltering = false;
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
                    if (vm.isEditing) {
                        vm.toggleEditing(vm.selectedTnx);
                    }
                    var index = transaxns.getTransactionIndex(vm.selectedTnx.id, vm.trs);
                    vm.trs.splice(index, 1);
                    vm.selectedTnx = null;
                },
                function (msg) {
                    logError(msg);
                }
            );
        };

        vm.addTag = function (tagText) {
            if (_tagIsAlreadyAdded(tagText)) {
                return;
            }
            if (!vm.isFiltering)
                $rootScope.toggleFiltering();
            vm.tags.push({
                text: tagText
            });
            applyfilters();
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
                .success(function (data) {
                    vm.trs = data.transactions;
                    vm.total = data.total;
                    if (vm.trs.length) {
                        $rootScope.showSpinner = false;
                        $rootScope.hideContent = false;
                        vm.isLoading = false;
                        vm.sort = transaxns.sortOptions;
                    }
                    if (vm.trs.length < 30) {
                        vm.richedTheEnd = true;
                    }
                });
        }

        function activate() {
            var promises = [_getTransactions(), vm.loadTags()];
            common.activateController(promises, controllerId)
                .then(function () {
                    common.$timeout(function () {
                        $rootScope.showSideActions = true;
                    }, 1000);
//                    $('.js-slider').slider({
//                        tooltip: 'hide',
//                        max: vm.smaxAmountToShow,
//                        min: vm.minAmountToShow
//                    }).on('slide', function (ev) {
//                        var val = $(this).slider('getValue');
//                        vm.minAmountToShow = val[0];
//                        vm.maxAmountToShow = val[1];
//                        $rootScope.$apply();
//                    });
                });
        }

        activate();
    }
})
();

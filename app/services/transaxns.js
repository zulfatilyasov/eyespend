(function () {

    'use strict';

    var serviceId = "transaxns";
    angular.module('app').factory(serviceId, ['datacontext', 'common', 'color', 'date', '$rootScope', transaxns]);

    function transaxns(datacontext, common, color, date, $rootScope) {
        var transactions = [],
            _userTags = [],
            sortOptions = {
                column: 'timestamp',
                descending: true
            },
            offset = 0,
            count = 30;

        function sortByDateDesc(a, b) {
            var d1 = parseInt(a.timestamp);
            var d2 = parseInt(b.timestamp);
            if (d1 > d2) {
                return -1;
            } else if (d1 < d2) {
                return 1;
            } else {
                return 0;
            }
        }

        function updateSorting(column) {
            if (sortOptions.column == column) {
                sortOptions.descending = !sortOptions.descending;
            } else {
                sortOptions.column = column;
                sortOptions.descending = false;
            }
            return sortOptions;
        }

        function sort(fromDate, toDate, tags) {
            var def = common.defer();

            offset = 0;
            var tagsArray = _convertTagsToArray(tags);
            datacontext.getTransaxns(sortOptions.column, sortOptions.descending, offset, count, fromDate || '', toDate || '', tagsArray)
                .success(function (sortedTransactions) {
                    angular.forEach(sortedTransactions, function (t) {
                        _colorAndSaveTags(t.tags);
                    });
                    offset = sortedTransactions.length;
                    transactions = sortedTransactions;
                    def.resolve(transactions.slice(0));
                });

            return def.promise;
        }

        function getUserTags() {
            return _userTags;
        }

        function getTransactionIndex(transactionId, array) {
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i].id === transactionId) {
                    return i;
                }
            }
        }
        function getExcelFile(fromDate, toDate, tags, withPhoto){
            var tagsArray = _convertTagsToArray(tags);
            datacontext.getExcelFileUrl(
                sortOptions.column, 
                sortOptions.descending, 
                offset, 
                count, 
                fromDate || '', 
                toDate || '', 
                tagsArray, 
                withPhoto)
            .success(function(data){
                location.href = data;
            });
        }

        function getSortingForColumn(column) {
            if (sortOptions.column !== column) {
                return 'sorting';
            } else {
                if (sortOptions.descending === true) {
                    return 'sorting_desc';
                } else if (sortOptions.descending === false) {
                    return 'sorting_asc';
                } else {
                    return '';
                }
            }
        }

        function _convertTagsToArray(tags) {
            var result = [ ];
            if (!tags)
                return result;
            for (var i = 0, len = tags.length; i < len; i++) {
                result.push(tags[i].text);
            }
            return result;
        }

        function filterByTags(fromDate, toDate, tags) {
            offset = 0;
            return getTransaxns(fromDate, toDate, tags);
        }

        function getFirstPageWithFilters(fromDate, toDate, tags, withPhoto) {
            offset = 0;
            return getTransaxns(fromDate, toDate, tags, withPhoto);
        }

        function filterByDate(fromDate, toDate, tags) {
            offset = 0;
            return getTransaxns(fromDate, toDate, tags);
        }

        function _colorAndSaveTags(tags) {
            if (!tags)
                return;
            for (var i = tags.length - 1; i >= 0; i--) {
                if (!tags[i].text) {
                    var text = tags[i];
                    tags[i] = {
                        text: text,
                        color: _getTagColor(text)
                    };
                }
                else {
                    tags[i].color = _getTagColor(tags[i].text);
                }
                if (_userTagsContains(tags[i]) === false) {
                    _userTags.push(tags[i]);
                }
            }
        }

        function _userTagsContains(tag) {
            return _userTags.some(function (t) {
                return t.text === tag.text;
            });
        }

        function _getTagColor(tagText) {
            var tag = _userTags.filter(function (t) {
                return t.text === tagText;
            });
            if (tag.length && tag[0].color) {
                return tag[0].color;
            } else {
                return color.get(true, 0.3);
            }
        }


        function getTotalAmout(txns) {
            var sum = 0;
            for (var i = 0; txns && i < txns.length; i++) {
                sum += parseInt(txns[i].amountInBaseCurrency);
            }
            return sum;
        }

//        function getMinUnixDate() {
//            return transactions[transactions.length - 1].timestamp;
//        }
//
//        function getMaxUnixDate() {
//            return transactions[0].timestamp;
//        }
//
//        function getMinDate() {
//            var minDate = getMinUnixDate();
//            return date.format(minDate);
//        }
//
//        function getMaxDate() {
//            var maxDate = getMaxUnixDate();
//            return date.format(maxDate);
//        }

        function getTransaxns(fromDate, toDate, tags, withPhoto) {
            var def = common.defer();

            var tagsArray = _convertTagsToArray(tags);
            datacontext.getTransaxns(sortOptions.column, sortOptions.descending, offset, count, fromDate || '', toDate || '', tagsArray, withPhoto)
                .then(function (tnxs) {
                    $rootScope.hideContent = false;
                    if (tnxs && tnxs.data instanceof Array) {
                        if (offset > 0) {
                            transactions = transactions.concat(tnxs.data);
                            offset += tnxs.data.length;
                        }
                        else {
                            transactions = tnxs.data;
                            offset = tnxs.data.length;
                        }
                        transactions.forEach(function (t) {
                            _colorAndSaveTags(t.tags);
                        });
                        def.resolve({data: transactions.slice(0)});
                    }
                    else {
                        def.reject();
                    }
                }, function (resp) {
                    console.log(resp)
                });

            return def.promise;
        }

        function getLocalTransaxns() {
            return transactions.slice(0);
        }

        function setLocation(transaction) {
            if (!transaction.placeDetails)
                return;
            try {
                transaction.latitude = transaction.placeDetails.geometry.location.k;
                transaction.longitude = transaction.placeDetails.geometry.location.A;
            }
            catch (e) {
                console.error(e.message);
            }
        }

        function copy(source, target) {
            target.id = source.id;
            target.amountInBaseCurrency = source.amountInBaseCurrency;
            target.latitude = source.latitude;
            target.longitude = source.longitude;
            target.timestamp = source.timestamp;
            for (var i = 0, len = source.tags.length; i < len; i++) {
                var tag = target.tags.filter(function (t) {
                    return t.text === source.tags[i].text;
                });
                if (tag.length == 0) {
                    target.tags.push({
                        text: source.tags[i].text
                    });
                }
            }
            _colorAndSaveTags(target.tags);
        }

        function _serverFormatTnx(tnx) {
            var serverFormattedTnx = angular.copy(tnx);
            serverFormattedTnx.tags = _convertTagsToArray(serverFormattedTnx.tags);
            return serverFormattedTnx;
        }

        function update(tnx) {
            var def = common.$q.defer();
//            setLocation(tnx);
            datacontext.updateTransaction(_serverFormatTnx(tnx))
                .then(function () {
                    var transaction = transactions.filter(function (t) {
                        return t.id === tnx.id;
                    });

                    if (!transaction.length) {
                        console.log("transaction not found");
                        def.reject("Не удалось найти транзкцию");
                        return;
                    }
                    copy(tnx,transaction[0]);
                    def.resolve();
                },
                function () {
                    def.reject("При сохранении проихошла ошибка.")
                }
            );
            return def.promise;
        }

        function create(tnx) {
            var def = common.$q.defer();
            var tnx = angular.copy(tnx);
            if (!tnx.timestamp) {
                tnx.timestamp = date.now();
            }
            tnx.timestamp = date.toUnix(tnx.timestamp);
            tnx.tags = _convertTagsToArray(tnx.tags);
            setLocation(tnx);
            datacontext.createTransaction(tnx)
                .then(function (response) {
                    var createdTnx = response.data;
                    _colorAndSaveTags(createdTnx.tags);
                    transactions.push(createdTnx);
                    def.resolve(createdTnx);
                }, function () {
                    def.reject();
                });
            return def.promise;
        }

        function remove(transactionGuid) {
            var def = common.$q.defer();
            datacontext.deleteTransaction(transactionGuid)
                .then(function () {
                    var index = getTransactionIndex(transactionGuid, transactions);
                    transactions.splice(index, 1);
                    def.resolve();
                },
                function () {
                    def.reject("При удалении произошла ошибка.")
                }
            );
            return def.promise;
        }

        return {
            getLocalTransaxns: getLocalTransaxns,
            getTransaxns: getTransaxns,
            updateSorting: updateSorting,
            getSortingForColumn: getSortingForColumn,
            filterByDate: filterByDate,
            filterByTags: filterByTags,
            getFirstPageWithFilters: getFirstPageWithFilters,
            getTotalAmout: getTotalAmout,
            create: create,
//            getMinDate: getMinDate,
//            getMaxDate: getMaxDate,
//            getMinUnixDate: getMinUnixDate,
//            getMaxUnixDate: getMaxUnixDate,
            getUserTags: getUserTags,
            sortOptions: sortOptions,
            sort: sort,
            sortByDateDesc: sortByDateDesc,
            update: update,
            getTransactionIndex: getTransactionIndex,
            remove: remove,
            copy: copy,
            getExcelFile:getExcelFile
        };
    }
})();

(function () {

    'use strict';

    var serviceId = "transaxns";
    angular.module('app').factory(serviceId, ['datacontext', 'common', 'color', 'date', transaxns]);

    function transaxns(datacontext, common, color, date) {
        var transactions = [],
            _userTags = [],
            sortOptions = {
                column: 'timestamp',
                descending: true
            },
            offset = 0;

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

        function sort() {
            var def = common.defer(),
                count = 30;

            offset = 0;
            datacontext.getTransaxns(sortOptions.column, sortOptions.descending, offset, count)
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

        function convertToString(tags) {
            var result = '';
            for (var i = 0, len = tags.length; i < len; i++) {
                result += tags[i].text;
                if (i < tags.length - 1)
                    result += ';';
            }
            return result;
        }

        function filterByTags(tags) {
            var def = common.defer();

            var tagsString = convertToString(tags);
            datacontext.getTransaxnsByTags(tagsString)
                .success(function (filteredTransactions) {
                    angular.forEach(filteredTransactions, function (t) {
                        _colorAndSaveTags(t.tags);
                    });
                    offset = 0;
                    transactions = filteredTransactions;
                    def.resolve(transactions.slice(0));
                })
                .error(function () {
                    def.reject('Ошибка при фильтрации по тегам');
                });

            return def.promise;
        }

        function filterByDate(fromDate, toDate) {
            var def = common.defer();

            datacontext.getTransaxnsByDate(fromDate, toDate)
                .success(function (filteredTransactions) {
                    angular.forEach(filteredTransactions, function (t) {
                        _colorAndSaveTags(t.tags);
                    });
                    offset = 0;
                    transactions = filteredTransactions;
                    def.resolve(transactions.slice(0));
                })
                .error(function () {
                    def.reject('Ошибка при фильтрации');
                });

            return def.promise;
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


        function getMinDate() {
            var minDate = transactions[transactions.length - 1].timestamp;
            return date.format(minDate);
        }

        function getMaxDate() {
            var maxDate = transactions[0].timestamp;
            return date.format(maxDate);
        }

        function getTransaxns() {
            var def = common.defer();

            datacontext.getTransaxns(sortOptions.column, sortOptions.descending, offset, 50)
                .then(function (tnxs) {
                    if (tnxs && tnxs.data instanceof Array) {
                        offset += tnxs.data.length;
                        transactions = transactions.concat(tnxs.data);
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

        function update(tnx) {
            var def = common.$q.defer();
//            setLocation(tnx);
            datacontext.updateTransaction(tnx)
                .then(function () {
                    var transaction = transactions.filter(function (t) {
                        return t.id === tnx.id;
                    });

                    if (!transaction.length) {
                        console.log("transaction not found");
                        def.reject("Не удалось найти транзкцию");
                        return;
                    }
//                    copy(tnx,transaction[0]);
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
            if (!tnx.DateTime) {
                tnx.DateTime = date.now();
            } else {
                tnx.DateTime = date.toUnix(tnx.DateTime);
            }
            setLocation(tnx);
            datacontext.createTransaction(tnx)
                .then(function (response) {
                    _colorAndSaveTags(tnx.tags);

                    var newTransaxn = {
                        id: response.data,
                        amountInBaseCurrency: parseInt(tnx.amountInBaseCurrency) || 0,
                        tags: tnx.tags ? angular.copy(tnx.tags) : [],
                        timestamp: tnx.DateTime,
                        latitude: tnx.latitude,
                        longitude: tnx.longitude
                    };
                    transactions.push(newTransaxn);
                    def.resolve(newTransaxn);
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
            getTotalAmout: getTotalAmout,
            create: create,
            getMinDate: getMinDate,
            getMaxDate: getMaxDate,
            getUserTags: getUserTags,
            sortOptions: sortOptions,
            sort: sort,
            sortByDateDesc: sortByDateDesc,
            update: update,
            getTransactionIndex: getTransactionIndex,
            remove: remove,
            copy: copy
        };
    }
})();

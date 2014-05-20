'use strict';

describe('transactions controller', function () {
    var scope = null;
    var timeout = null;
    var root = null;
    var transaxnsCtrl;
    var transaxnsService;
    var backend;
    var transactions = null;

    var app = angular.module('app');
    app.service(    'datacontext', ['common', '$timeout', '$rootScope', 'modelStub', fakeDataContext]);
    function fakeDataContext(comn, $timeout, $rootScope, modelStub) {
        timeout = $timeout;
        function getTransaxns() {
            var d = comn.$q.defer();

            $timeout(function () {
                d.resolve({data: modelStub.getTransactions()});
                $rootScope.$apply();
            }, 1);

            return d.promise;
        }

        function updateTransaction(transaction) {
            var d = comn.$q.defer();
            timeout(function () {
                d.resolve(200);
                $rootScope.$apply();
            }, 1);
            return d.promise;
        }

        function createTransaction(transaction) {
            var d = comn.$q.defer();
            timeout(function () {
                var id = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
                d.resolve(id);
                $rootScope.$apply();
            }, 1);
            return d.promise;
        }

        return {
            getTransaxns: getTransaxns,
            updateTransaction: updateTransaction,
            createTransaction: createTransaction
        };
    }

    beforeEach(module('app'));
    beforeEach(inject(function ($rootScope, $timeout, $httpBackend) {
        root = $rootScope;
        scope = $rootScope.$new();
        backend = $httpBackend;
    }));

    it('should acitvate', inject(function ($controller, transaxns) {
        transaxnsCtrl = $controller('transactions', {$scope: scope});
        transaxnsService = transaxns;
        timeout.flush();
        expect(transaxnsCtrl).toBeDefined();
        transactions = transaxnsService.getLocalTransaxns();
        expect(transaxnsCtrl.trs.length).toBe(transactions.length);
    }));

    it('should have valid transasctions', function () {
        var trs = transaxnsCtrl.trs;
        for (var i = 0, len = trs.length; i < len; i++) {
            expect(trs[i].id).toBeDefined();
            expect(trs[i].timestamp).toBeDefined();
            expect(trs[i].amountInBaseCurrency).toBeDefined();
        }
    });

    it('should add', function () {
        var updatedTransaxns = transaxnsService.getLocalTransaxns();
        transaxnsCtrl.newTnx = null;
        transaxnsCtrl.addTnx();
        expect(updatedTransaxns.length).toBe(transactions.length);
        expect(transaxnsCtrl.trs.length).toBe(transactions.length);
        expect(transaxnsCtrl.createError).toBe('некорректные данные');

        transaxnsCtrl.newTnx = {};
        transaxnsCtrl.addTnx();
        timeout.flush();
        updatedTransaxns = transaxnsService.getLocalTransaxns();
        expect(updatedTransaxns.length).toBe(transactions.length + 1);
        expect(transaxnsCtrl.trs.length).toBe(transactions.length + 1);

        transaxnsCtrl.newTnx = {
            amountInBaseCurrency: 123,
            tags: [
                {text: "test-tag-1"},
                {text: "teset-tag-2"}
            ]
        };
        transaxnsCtrl.addTnx();
        timeout.flush();
        updatedTransaxns = transaxnsService.getLocalTransaxns().sort(transaxnsService.sortByDateDesc);
        expect(updatedTransaxns[0].amountInBaseCurrency).toBe(123);
        expect(updatedTransaxns[0].tags[0].text).toBe("test-tag-1");

        transactions = updatedTransaxns;
    });

    it('should update', function () {
        transaxnsCtrl.editedTnx = null;
        transaxnsCtrl.selectedTnx = null;
        transaxnsCtrl.saveTnx();
        expect(transaxnsCtrl.editError).toBe("Неверные данные");

        transaxnsCtrl.editedTnx = {};
        transaxnsCtrl.selectedTnx = {};
        transaxnsCtrl.saveTnx();
        expect(transaxnsCtrl.editError).toBe("Неверные данные");

        transaxnsCtrl.selectedTnx = transactions[transactions.length - 1];
        angular.copy(transaxnsCtrl.selectedTnx, transaxnsCtrl.editedTnx);
        transaxnsCtrl.editedTnx.amountInBaseCurrency += 100;
        var totalBefore = transaxnsService.getTotalAmout(transaxnsCtrl.trs);
        transaxnsCtrl.saveTnx();
        timeout.flush();
        var totalAfter = transaxnsService.getTotalAmout(transaxnsCtrl.trs);
        expect(totalBefore).toBe(totalAfter - 100);
    });
});
    
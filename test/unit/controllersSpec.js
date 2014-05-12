'use strict';

/* jasmine specs for controllers go here */

describe('transactions controller', function () {
    var scope = null;
    var timeout = null;
    var root = null;
    var transaxnsCtrl;
    var transactions;
    var transaxnsService;
    var backend;

    beforeEach(module('app'));
    beforeEach(inject(function ($rootScope, $timeout, $httpBackend) {
        root = $rootScope;
        scope = $rootScope.$new();
        timeout = $timeout;
        backend = $httpBackend;
    }));

    it('should acitvate', inject(function ($controller, modelStub, transaxns,$httpBackend) {
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
        transaxnsCtrl.newTnx = null;
        transaxnsCtrl.addTnx();
        var updatedTransaxns = transaxnsService.getLocalTransaxns();
        expect(updatedTransaxns.length).toBe(transactions.length);
        expect(transaxnsCtrl.trs.length).toBe(transactions.length);

        transaxnsCtrl.newTnx = {};
        transaxnsCtrl.addTnx();
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
        updatedTransaxns = transaxnsService.getLocalTransaxns().sort(transaxnsService.sortByDateDesc);
        expect(updatedTransaxns[0].amountInBaseCurrency).toBe(123);
        expect(updatedTransaxns[0].tags[0].text).toBe("test-tag-1");

        transactions = updatedTransaxns;
    });

    it('should update', inject(function ($timeout, $httpBackend, $rootScope) {
        transaxnsCtrl.editedTnx = {};
        transaxnsCtrl.saveTnx();
    }));
});
    
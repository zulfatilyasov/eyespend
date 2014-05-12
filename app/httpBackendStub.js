(function () {

    console.log('======== ACHTUNG!!! USING STUBBED BACKEND ========');

    initializeStubbedBackend();

    function initializeStubbedBackend() {
        angular.module('app')
            .config(function ($provide) {
                $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
            })
            .run(function ($httpBackend, mockJson, modelStub) {
                $httpBackend.whenGET(/transactions\/.*/).passThrough();
                $httpBackend.whenGET(/login\/.*/).passThrough();
                $httpBackend.whenGET(/shell\/.*/).passThrough();
                $httpBackend.whenGET(/settings\/.*/).passThrough();
                $httpBackend.whenGET(/quickpass\/.*/).passThrough();
                $httpBackend.whenPOST(/quickpass/).passThrough();
                $httpBackend.whenPOST(/authenticate/).passThrough();
//                $httpBackend.whenGET(/api\/.*/).passThrough();
//                $httpBackend.whenPOST(/api\/.*/).passThrough();
                $httpBackend.whenGET('/api/secure/transactions').respond(modelStub.getTransactions());
               $httpBackend.whenPOST('/api/secure/updateTransaction').respond(200);
            });
    }
})();

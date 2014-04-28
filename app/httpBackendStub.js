(function() {

    console.log('======== ACHTUNG!!! USING STUBBED BACKEND ========');

    initializeStubbedBackend();

    function initializeStubbedBackend() {
        angular.module('app')
            .config(function($provide) {
                $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
            })
            .run(function($httpBackend, mockJson, modelStub) {
                $httpBackend.whenGET(/transactions\/.*/).passThrough();
                $httpBackend.whenGET(/shell\/.*/).passThrough();
                $httpBackend.whenGET('/server/getTransactions').respond(modelStub.generateTransactions());
            });
    }
})();

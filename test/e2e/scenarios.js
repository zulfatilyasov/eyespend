'use strict';

/* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

describe('eyeSpend', function () {

    browser.get('/');

    it('should automatically redirect to /view1 when location hash/fragment is empty', function () {
        expect(browser.getLocationAbsUrl()).toMatch("/");
    });

    describe('settigns', function () {

        beforeEach(function () {
            browser.get('#/settings');
        });


//        it('should render settings when user navigates to /settings', function () {
//            console.log(1111111);
//            expect('').toBe('');
//            //expect(element('.content h2').text()).toBe(/Настройки аккаунта/);
//        });

    });
//
//
//  describe('view2', function() {
//
//    beforeEach(function() {
//      browser.get('index.html#/view2');
//    });
//
//
//    it('should render view2 when user navigates to /view2', function() {
//      expect(element.all(by.css('[ng-view] p')).first().getText()).
//        toMatch(/partial for view 2/);
//    });
//
//  });
});

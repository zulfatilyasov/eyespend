'use strict';

var res = require('../../app/translations.js');
var pages = require('../e2e/pages.js');

var menu = new pages.Menu();
var content = new pages.Content();
var transactionsPage = new pages.Transactions();
var loginPage = new pages.Login();

describe('transactions page', function () {
    it('should navigate to transactions page', function(done) {
        browser.get('#/');

        browser.getLocationAbsUrl().then(function (url) {
            if (url.indexOf('/login') >= 0) {
                loginPage.loginWithAcivationCode();
            }
        });
    });

    it('should filter after tag clicked', function () {

        transactionsPage.tag.click();
        transactionsPage.tagsFilter.sendKeys('\b\b');
        transactionsPage.addTagToFilter('наличные');
    });

    it('should change language from menu', function () {
        menu.changeLanguage('en');
        expect(content.header()).toBe(res.en.EXPENSES_HISTORY);

        menu.changeLanguage('ru');
        expect(content.header()).toBe(res.ru.EXPENSES_HISTORY);
    });

    it('should log out', function(done) {
    	menu.logout.click();
    });

});

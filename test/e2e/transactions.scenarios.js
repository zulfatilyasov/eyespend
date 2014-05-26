'use strict';

var res = require('../../app/translations.js');
var pages = require('../e2e/pages.js');

var menu = new pages.Menu();
var content = new pages.Content();
var transactionsPage = new pages.Transactions();
var loginPage = new pages.Login();

describe('transactions page', function () {
    it('should navigate to transactions page', function (done) {
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
        transactionsPage.searchButton.click();
    });

    it('should add new transaction', function () {
        var ptor = protractor.getInstance();
        var startCount = 51;
//        expect(transactionsPage.rows.count()).toEqual(50);
        transactionsPage.createButton.click();
        transactionsPage.addButton.click();

        transactionsPage.dateAndTime.click();
        transactionsPage.dateAndTime.sendKeys('22.05.2014');
        transactionsPage.amountInput.sendKeys('100');
        transactionsPage.tagsInput.sendKeys('аптека\nналичные\n');
        transactionsPage.addButton.click();

        transactionsPage.amountInput.sendKeys('200');
        transactionsPage.tagsInput.sendKeys('кино\nресторан\n');
        ptor.sleep(500);
        transactionsPage.pickAddress.click();
        transactionsPage.placeInput.sendKeys('Ашан');
        ptor.sleep(2500);
        transactionsPage.placeInput.sendKeys(protractor.Key.ARROW_DOWN);
        transactionsPage.placeInput.sendKeys('\n');
        transactionsPage.savePlace.click();
        transactionsPage.addButton.click();
        expect(transactionsPage.rows.count()).toBe(startCount + 3);
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

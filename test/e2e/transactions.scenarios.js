'use strict';

var res = require('../../app/translations.js');
var pages = require('../e2e/pages.js');

var menu = new pages.Menu();
var content = new pages.Content();

function logout() {
    menu.logout.click();
    expect(loginPage.header()).toBe(res.ru.ENTER_CODE_OR_EMAIL);
}

describe('login page', function () {
    browser.get('#/');

    it('should change language from menu', function(done) {
    	menu.changeLanguage('en');
        expect(content.header()).toBe(res.en.EXPENSES_HISTORY);
    });

});

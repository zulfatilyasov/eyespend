var LoginPage = function () {
    this.codeOrEmail = element(by.input('vm.user.codeOrEmail'));
    this.password = element(by.input('vm.user.password'));
    this.submit = element(by.id('loginButton'));
    this.errorMessage = function () {
        return $('.authError').getText();
    };
    this.header = function () {
        return $('.content h4').getText();
    };

    this.setCodeOrEmail = function (value) {
        this.codeOrEmail.clear();
        this.codeOrEmail.sendKeys(value);
    };
    this.setPassWord = function (value) {
        this.password.clear();
        this.password.sendKeys(value);
    };

    this.loginWithAcivationCode = function () {
        this.setCodeOrEmail('123');
        this.submit.click();
    };
};

var LandingPage = function () {
    this.login = browser.driver.findElement(by.id('login'));
    this.codeOrEmail = browser.driver.findElement(by.id('email'));
    this.password = browser.driver.findElement(by.id('password'));
    this.header = function () {
        return browser.driver.findElement(by.css('.container h2 strong')).getText();
    };

    this.setCodeOrEmail = function (value) {
        this.codeOrEmail.clear();
        this.codeOrEmail.sendKeys(value);
    };

    this.setPassWord = function (value) {
        this.password.clear();
        this.password.sendKeys(value);
    };

    this.loginWithAcivationCode = function () {
        this.setCodeOrEmail('123');
        this.submit.click();
    };
};

var Transactions = function () {
    var repeater = by.repeater('transaction in vm.trs');
    this.transactionDate = element(repeater.row(3)).$('.date-td');
    this.showMap = element(repeater.row(0)).$('.map a');
    this.transactionFullDate = function () {
        return this.transactionDate.$('span.fullDate').getText();
    };
    this.transactionAmount = function () {
        return element(repeater.row(3)).$('.transactionAmount').getText();
    };
    this.firstDate = element(repeater.row(0)).element(by.css('.fullDate'));
    this.firstAmount = element(repeater.row(0)).element(by.css('.transactionAmount'));
    this.pencil = element(repeater.row(3)).element(by.css('#pencil'));
    this.repeater = repeater;
    this.startCount = 31;
    this.rows = element.all(by.css('#transactions-table tr'));
    this.createButton = element(by.id('createButton'));
    this.filterButton = element(by.id('filterButton'));
    this.pickAddress = $('#pickAddress');
    this.editAddress = $('#editAddress');
    this.addButton = element(by.id('addButton'));
    this.searchButton = $('#search');
    this.amountInput = $('#amountInput');
    this.dateAndTime = $('#dateAndTime');
    this.datePicker = $('datepicker');
    this.dateAndTimeEditor = $('#dateAndTimeEditor');
    this.editedAmount = $('#editedAmount');
    this.fromDate = $('#fromDate');
    this.toDate = $('#toDate');
    this.tagsInput = $('.tags input');
    this.placeInput = $('#pac-input');
    this.savePlace = $('#overlay-save');
    this.closeOverlay = $('#overlay-close');
    this.saveEdit = $('#saveEdit');
    this.sortByTimestamp = $('#timestamp');
    this.sortByAmount = $('#amount');
    this.sortByFoto = $('#foto');
    this.lastWeekFilter = $('.ranges li');
    this.lastMonthFilter = $('#lastMonthFilter');
    this.firstRowAmount = element(repeater.row(0).column('{{transaction.amountInBaseCurrency}}'));
    this.transactions = element.all(by.repeater('transaction in vm.trs'));
    this.firstTag = element(repeater.row(0)).element(by.repeater('tag in transaction.tags').row(0));
    this.tag = element(repeater.row(3)).element(by.repeater('tag in transaction.tags').row(0));
    this.tagsFilter = $('.searchBlock .tags input');

    this.addTagToFilter = function (tag) {
        this.tagsFilter.sendKeys(tag + '\n');
    };

    this.setFromDate = function (date) {
        setDate(this.fromDate, date);
    };

    this.setToDate = function (date) {
        setDate(this.toDate, date);
    };

    this.setDateAndTimeEditor = function (date) {
        setDate(this.dateAndTimeEditor, date);
    };

    function setDate(dateInput, date) {
        dateInput.click();
        dateInput.sendKeys('\b\b\b\b\b\b\b\b\b\b\b\b');
        dateInput.sendKeys(date);
//        dateInput.sendKeys('\n');
    }
};

var Menu = function () {
    this.globe = element(by.id('globe'));
    this.logout = element(by.id('logoutButton'));

    this.changeLanguage = function (langCode) {
        this.globe.click();
        element(by.id(langCode)).click();
    };

};

var Content = function () {
    this.header = function () {
        return $('.content h2').getText();
    };
};

exports.Login = LoginPage;
exports.Menu = Menu;
exports.Content = Content;
exports.Transactions = Transactions;
exports.Landing = LandingPage;

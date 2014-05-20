exports.config = {
    allScriptsTimeout: 11000,

    specs: [
        'e2e/login.scenarios.js',
        'e2e/transactions.scenarios.js'
    ],

    capabilities: {
        'browserName': 'chrome'
    },

    suites: {
        login: 'e2e/login.scenarios.js',
        transactions: 'e2e/transactions.scenarios.js'
    },

    baseUrl: 'http://localhost:3000',

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
};

const proxy = require('http-proxy-middleware');

module.exports = function (app) {
    const targetEnv = process.env.TARGET_ENV || 'dev';
    const targetCluster = process.env.TARGET_CLUSTER || 'dev';
    const keycloakEnabled = process.env.keycloakEnabled ? process.env.keycloakEnabled === 'true' : true;
    const authorizationEnabled = process.env.authorizationEnabled ? process.env.authorizationEnabled === 'true' : true;
    const beyondVersion = process.env.BEYOND_VERSION;

    const target = `https://${targetEnv}.${targetCluster}.beyond.cegedim.cloud`;

    const proxies = {};
    proxies[target] = [
        '/referential/preferences/api', // for menu
        '/referential/core/api', // for global referential
        '/claim/search/api', // for search claims
        '/claim/core/api', // for viewing claim details
        '/oc/core/api', // for viewing claim details
        '/claim/orchestrator/api', // for viewing bill details
        '/serviceprovider/core/api',
        '/referential/beneficiary/api',
        '/common/elasticsearch/api',
        '/authorization/core/api',
        '/i18n/core/api/',
    ];

    Object.keys(proxies).forEach(key => {
        proxies[key].forEach(calledUrl => {
            app.use(calledUrl, proxy({ target: key, changeOrigin: true }));
        });
    });

    app.use('/configuration', (req, res) =>
        res.json({
            clientId: 'ui',
            url: `https://idp.${targetCluster}.beyond.cegedim.cloud/auth`,
            realm: `${targetEnv}`,
            enabled: keycloakEnabled,
            allowExport: true,
            allowImport: true,
            authorizationEnabled: authorizationEnabled,
            SHOULD_DISPLAY_LOGO: true,
            BEYOND_VERSION: beyondVersion,
        }),
    );
};

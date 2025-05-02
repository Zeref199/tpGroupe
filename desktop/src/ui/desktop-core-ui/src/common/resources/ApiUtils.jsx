/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import AuthProvider from 'common-base-auth-javascript';

/* ************************************* */
/* ********         CODE        ******** */
/* ************************************* */
export function withAuthentication(Api) {
    // Send JWT to API for each calls
    Api.addRequestInterceptor(config => {
        config.headers['Content-Type'] = 'application/json';
        config.headers.Accept = 'application/json';
        // If not undefined, so, auth is enabled
        const authConfig = AuthProvider.get();
        if (authConfig) {
            config.headers.Authorization = `Bearer ${authConfig.token}`;
            config.headers['X-CGD-TENANT'] = authConfig.realm;
        }
        return config;
    });

    return Api;
}

/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */

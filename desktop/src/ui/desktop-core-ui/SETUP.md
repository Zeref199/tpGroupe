# Setup

## First start

Your project should already run without any problems.
However, if you still encounter problems, please check below.

### Website

If the website does not load correctly, please check that your `index.js` is working correctly since the script may have removed custom modifications of that file.

> **_NOTE:_** It is normal for `module.hot` and `<AppContainer>` to be removed

### Packages

On a create-react-app project, there are usually very few if no `devDependencies`.
The script already provides everything necessary to start a project.
If not, please add the missing dependencies manually.

## Cypress

Cypress is already configured with your Create-React-App project.
Just remove the `echo` in the test script to start testing.

Currently, the tests are done on the development server.

If you wish to make the CI run them on a build equivalent to what will be deployed
(adds a minute or two of compile time but can be faster if there is numerous tests), modify the test script like so :

```JSON
"startHttpServer.instrument": "envsub --env authorization_enabled=false --env keycloak_enabled=false ./configuration.json ./build-instrument/configuration && PORT=3000 serve -n build-instrument/",
"test": "npm run build.instrument && server-test startHttpServer.instrument 3000 cypress:run",
```

The cypress configuration files (`cypress.json`, `plugins/index.js`, `support/index.js`) are yours to provide.

See [Create-React-App - Cypress documentation](https://cegedim-insurance.atlassian.net/wiki/spaces/AIN/pages/3435626792/Create-react-app+-+Cypress+setup) on Confluence (French only) for more information on how to set up a Create-React-App project for cypress.

## About your project

The build folder of your project is now `./build` instead of `./dist`. If you wish to change it, specify the environment variable `BUILD_PATH=<new_build_folder>`

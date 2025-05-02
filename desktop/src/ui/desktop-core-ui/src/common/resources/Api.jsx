/* ************************************* */
/* ********       IMPORTS       ******** */
/* ************************************* */
import 'whatwg-fetch';
import restful, { fetchBackend } from 'restful.js';
import { withAuthentication } from './ApiUtils';

/* ************************************* */
/* ********         CODE        ******** */
/* ************************************* */
const Api  = restful("http://localhost:8080/api/v1", fetchBackend(fetch));

/* ************************************* */
/* ********       EXPORTS       ******** */
/* ************************************* */
export default withAuthentication(Api);

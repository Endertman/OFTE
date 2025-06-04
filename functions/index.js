const functions = require('firebase-functions');
const { handler } = require('./dist/server/entry.mjs');

exports.ssr = functions.https.onRequest(handler); 
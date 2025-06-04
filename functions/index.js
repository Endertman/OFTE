const functions = require('firebase-functions');
const { handler } = require('../dist/server/entry.mjs');

exports.ssr = functions.https.onRequest(async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).send('Internal Server Error');
  }
}); 
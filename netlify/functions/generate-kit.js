// netlify/functions/generate-kit.js
// Minimal production-safe stub so your front-end can call a REAL endpoint now.

exports.handler = async (event) => {
  // --- CORS preflight ---
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
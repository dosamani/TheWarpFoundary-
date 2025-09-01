// netlify/functions/ping.js
exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" },
    body: "pong"
  };
};
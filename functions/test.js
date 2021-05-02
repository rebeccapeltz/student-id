exports.handler = function (event, context, callback) {
  // post only

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const params = querystring.parse(event.body);
  const name = params.name || "World";

  callback(null, {
    statusCode: 200,
    body: "Hello, ${name}",
  });
};
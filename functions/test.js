exports.handler = function (event, context, callback) {
  // post only

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed!" };
  } else {
    return { statusCode: 200, body: "post" };
  }

  // return { statusCode: 200, body: JSON.stringify({ message: "post" }) };

  // const params = querystring.parse(event.body);
  // const name = params.name || "World";

  // callback(null, {
  //   statusCode: 200,
  //   body: JSON.stringify({ message: "Hello, world ${name}" }),
  // });

  // callback(null, {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     dirname:__dirname,
  //     files:files,
  //   })
  // })
};

const cloudinary = require("cloudinary").v2;

exports.handler = async (event) => {
  // post only
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed!" };
  }
  // cld credentials and badge tag name
  const cloudName = JSON.parse(event.body).cloudName;
  const key = JSON.parse(event.body).key;
  const secret = JSON.parse(event.body).secret;


  const cldConfig = cloudinary.config({
    cloud_name: cloudName,
    api_key: key,
    api_secret: secret,
  });
  // verify cloud name
  console.log("cloud", cldConfig.cloud_name);

  // create a named transform
  try {
    const result = await cloudinary.api
    .create_transformation("v-badge-color", {
      transformation: [
        {
          overlay: {
            font_family: "arial",
            font_size: 160,
            text: "%24%28data%29",
            font_style: "bold",
            text_align: "center",
          },
          gravity: "south",
          color: "$color",
          background: "$bgcolor",
          width: 300,
          y: "-140",
        },
      ]
    })
    console.log(`result returned: ${JSON.stringify(null, 2, result)}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Named transformation created in ${cldConfig.cloud_name}`,
      }),
    };
  } catch (err) {
    console.log("create named transform failed");
    console.log(err.error);
    // don't count as error if it already exists
    if (err.error.htt_code === 409){
      return { statusCode: 200, body: "Named transform already exists" };
    } else {
      return { statusCode: 500, body: JSON.stringify(err.error) };
    }
  }
};

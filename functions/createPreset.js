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

  // tag used to name preset,folder and tags
  const tag = JSON.parse(event.body).tag;
  console.log("tag", tag);

  const cldConfig = cloudinary.config({
    cloud_name: cloudName,
    api_key: key,
    api_secret: secret,
  });
  // verify cloud name
  console.log("cloud", cldConfig.cloud_name);

  // create a preset
  try {
    const result = await cloudinary.api.create_upload_preset({
      name: `${tag}-preset`,
      folder: `${tag}`,
      disallow_public_id: true,
      unsigned: true,
      use_file_name: false,
      unique_filename: false,
      return_delete_token: true,
      faces: true,
      invalidate: true,
      type: "upload",
      tags: `${tag},"badge"`,
      transformation: [
        {
          width: 300,
          height: 300,
          quality: "auto",
          crop: "fill",
          gravity: "face",
          effect: "auto_saturation",
        },
        {
          fetch_format: "auto",
          quality: "auto",
          dpr: "auto",
        },
      ],
    });

    console.log(`result returned: ${JSON.stringify(null, 2, result)}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Preset created in ${cldConfig.cloud_name}`,
      }),
    };
  } catch (err) {
    console.log("preset creation failed");
    console.log(err.error);
    // don't count as error if it already exists
    if (err.error.htt_code === 409){
      return { statusCode: 200, body: "Preset already exists" };
    } else {
      return { statusCode: 500, body: JSON.stringify(err.error) };
    }
    
  }
};

require("dotenv").config();
const cloudinary = require("cloudinary").v2;

function createPreset(tag) {
  cloudinary.api
    .create_upload_preset({
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
      tags: `${tag}`,
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
    })
    .then((uploadResult) => console.log(uploadResult))
    .catch((error) => console.error(error));
}

console.log("process.argv", process.argv, process.argv.length)
if (process.argv.length <3) {
  console.log(
    "Enter a single value to serve as identifier for preset, folder and tag"
  );
  return
} else {
  const identifier = process.argv[2]
  console.log("identifier",identifier)
  createPreset(identifier)
}



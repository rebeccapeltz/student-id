require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const open = require("open");

const url = cloudinary.url("student-id/0c05701c223b0f32b6f064efae191b9c", {
  overlay: {
    font_family: "arial",
    font_size: 150,
    text: "%24%28data%29",
    font_style: "bold",
    text_align: "center",
  },
  gravity: "south",
  color: "#DB8226",
  background: "#0E2F5A",
  width: 345,
  y: "-160",
  variables: [
    [
      "$data",
      "!Susan%20Burnell%250AAstrophysicist%250ACambridge%20University%0A~~~~~~~~~~~~~~~~~~~~!",
    ],
  ],
});
console.log(url);
open(url);



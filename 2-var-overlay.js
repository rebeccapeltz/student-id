require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const open = require("open");

const url = cloudinary.url("sample", {
  overlay: {
    font_family: "arial",
    font_size: 100,
    text: "%24%28title%29%",
    ofnt_style: "bold",
    text_align: "center"
  },
  gravity: "south",
  y: -160,
  color: "#DB8226",
  background: "#0E2F5A",
  width: 345,
  opacity: 75,
  variables: [
    [
      "$title",
      "!Boris%20Kelly%0A%20Dev%20Ops%20%0A%20Orign%0A~~~~~~~~~~~~~~~~~~~~~~!",
    ]
  ]
});

console.log(url)
open(url)
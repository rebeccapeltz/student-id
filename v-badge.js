
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const open = require("open");

const url = cloudinary.url("student-id/0c05701c223b0f32b6f064efae191b9c", {
  transformation: [
    {
      variables: [
        [
          "$data",
          "!Susan%20Burnell%250AAstrophysicist%250ACambridge%20University%250A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20!",
          // "!Susan%20Burnell%250AAstrophysicist%250ACambridge%20University%250A                                          !",

        ],
      ],
    },
    {
      transformation: ["v-badge"],
    },
  ],
});

console.log(url);
open(url);

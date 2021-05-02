
exports.handler = async (event) => {
  // post only
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed!" };
  }
  // cld credentials and badge tag name
  const cloudName = JSON.parse(event.body).cloudName;
  const badgeId = JSON.parse(event.body).badgeId;
  const date = JSON.parse(event.body).date;
  const title = JSON.parse(event.body).title;

  // verify cloud name
  console.log("cloud", cloudName);

  // create a named transform
  if (!(cloudName && badgeId && date && title)){
    return { statusCode: 500, body: "Proivde cloudName, badgeId, date, and title strings" }; 
  } else {
    const url = `https://badge.cloudinary.training/index.html?cn=${cloudName}&title=${encodeURI(title)}&date=${encodeURI(date)}&badge=${encodeURI(badgeId)}`
    return { statusCode: 200, body: JSON.stringify({"url": url}) };
  }
};

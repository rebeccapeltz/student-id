const PARAMS = new URLSearchParams(window.location.search);
const CLOUD_NAME = PARAMS.has("cn") ? PARAMS.get("cn") : "pictures77";
const PRESET = "student-id";
const BADGE_TRANSFORM = "t_v-badge";
const NOT_ALLOW_DUPS = true;

var cl = new cloudinary.Cloudinary({ cloud_name: CLOUD_NAME, secure: true });

var studentList = [];
const IMG_HEIGHT = "485";
const IMG_WIDTH = "345";

function toast(message, type) {
  //TODO add color to message
  const toastEl = document.querySelector("#toast");
  toastEl.className = "show";
  document.querySelector("#toast #desc").innerHTML = message;
  document.querySelector("#toast #img").innerHTML =
    type && type === "warning" ? "!" : "OK";

  const typeClass = `toast-${type}`;
  toastEl.classList.add(typeClass);
  setTimeout(function () {
    toastEl.className = toastEl.className.replace("show", "");
    toastEl.classList.remove(typeClass);
  }, 5000);
}

//student should have context data: fname, lname, title, org, fcolor
//add URL and fullname
function createStudentData(student) {
  let contextMap = student && student.context ? student.context.custom : null;
  if (!contextMap) {
    toast("Missing student data");
    return;
  }
  let studentData = { ...contextMap };
  studentData.publicId = student.public_id;
  studentData.fullname = `${encodeURI(studentData.fname)}%20${encodeURI(
    studentData.lname
  )}`;
  studentData.org = encodeURI(studentData.org);
  studentData.title = encodeURI(studentData.title);
  let filler = Array(45).fill("%20").join("");
  //create overlay text
  const overlayText = `!${studentData.fullname}%250A${studentData.title}%250A${studentData.org}%250A${filler}!`;
  studentData.URL = cl.url(
    studentData.publicId,
    cl
      .transformation()
      .variables([["$data", `${overlayText}`]])
      .transformation("v-badge")
  );
  return studentData;
}

function createGalleryEntry(student) {
  const article = document.createElement("article");
  article.classList.add("student-listing");
  //what you see when you hover
  const colorAnchor = document.createElement("a");
  colorAnchor.classList.add("student-color");
  const colorTextNode = document.createTextNode(student.fcolor);
  colorAnchor.setAttribute("href", "#");
  colorAnchor.setAttribute("style", `color:${student.fcolor}`);
  colorAnchor.appendChild(colorTextNode);
  //image container
  const imageContainer = document.createElement("div");
  imageContainer.classList.add("student-image");
  //image anchor
  const imageAnchor = document.createElement("a");
  imageContainer.setAttribute("href", "#");
  //image
  const image = document.createElement("img");
  image.setAttribute("width", IMG_WIDTH);
  image.setAttribute("height", IMG_HEIGHT);
  image.setAttribute("src", student.URL);
  image.setAttribute("alt", student.fullname);
  //glue it together
  imageAnchor.appendChild(image);
  imageContainer.appendChild(imageAnchor);
  article.appendChild(colorAnchor);
  article.appendChild(imageContainer);
  return article;
}
function populateGallery(list) {
  for (const student of list) {
    const studentData = createStudentData(student);
    const article = createGalleryEntry(studentData);
    //append to gallery
    document.querySelector("#gallery").appendChild(article);
  }
}
function initGallery() {
  fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/student-id.json`)
    .then((response) => response.json())
    .then((data) => {
      //populate global studentList with image and meta-data
      studentList = data.resources;
      populateGallery(studentList);
    });
}

// gather form data into context map
function createContextMap() {
  const fname = document.querySelector("#fname").value;
  const lname = document.querySelector("#lname").value;
  const title = document.querySelector("#title").value;
  const org = document.querySelector("#org").value;
  const fcolor = document.querySelector("#fcolor").value;
  // console.log(fname, lname, title, org, fcolor);
  // add context
  const contextMap = {};
  contextMap.fname = fname;
  contextMap.lname = lname;
  contextMap.title = title;
  contextMap.org = org;
  contextMap.fcolor = fcolor;
  contextMap.uploadDate = new Date().toISOString();
  return contextMap;
}

//check if a student with same info has already signed up
function dupFound(contextMap, studentList) {
  //filter on fname, lname, company, title
  var result = studentList.filter((student) => {
    return (
      student.context.custom.fname === contextMap.fname &&
      student.context.custom.lname === contextMap.lname &&
      student.context.custom.title === contextMap.title &&
      student.context.custom.org === contextMap.org
    );
  });
  return result.length > 0;
}

document.addEventListener("DOMContentLoaded", (event) => {
  initGallery();

  //after the list is ready add submit listener
  document.querySelector("#upload").addEventListener(
    "click",
    function () {
      const contextMap = createContextMap();
      console.log(contextMap);
      //verify form values collected - check that there is no existing student with same name and company
      if (NOT_ALLOW_DUPS && dupFound(contextMap, studentList)) {
        toast("Duplicates not allowed", "warning");
        return;
      } else {
        var myWidget = cloudinary.createUploadWidget(
          {
            cloudName: CLOUD_NAME,
            upload_preset: PRESET,
            sources: ["local", "url", "camera", "facebook"],
            context: contextMap,
            clientAllowedFormats: ["png", "gif", "jpeg"],
            return_delete_token: 1,
          },
          (error, result) => {
            if (!error) {
              console.log("event", result.event);
              // if (result.event === 'upload-added') {
              if (result.event === "success") {
                console.log(result);

                //delete if the upload doesn't contain a face
                if (!result.info.faces || result.info.faces.length === 0) {
                  // alert("no face!")
                  const token = { token: result.info.delete_token };
                  fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/delete_by_token`,
                    {
                      method: "post",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(token),
                    }
                  )
                    .then((response) => {
                      return response.json();
                    })
                    .then((data) => {
                      console.log("error deleting image without face", data);
                      toast(
                        "Can't accept image because it doesn't have a face.",
                        "warning"
                      );
                      // alert("face deleted!")
                    })
                    .catch((error) => {
                      console.log("error", error);
                    });
                } else {
                  toast("Successful upload.", "info");
                  //remove all gallery
                  document.querySelector("#gallery").innerHTML = "";
                  initGallery();
                }

                // https://api.cloudinary.com/v1_1/demo/delete_by_token -X POST --data 'token=delete_token
              }
            } else {
              console.log(error);
              launch_toast(`Upload error: ${error}`, "warning");
            }
          }
        );

        myWidget.open();
      }
    },
    false
  );
});

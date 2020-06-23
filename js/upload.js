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

function specialEscape(str) {
  if (!str) return "";
  let arr = str.split("");
  let newArr = [];

  for (let c of arr) {
    newArr.push(encodeURIComponent(encodeURIComponent(c)));
  }
  let newStr = newArr.join("");
  return newStr;
}

//student should have context data: fname, lname, title, org, fcolor
//add URL and fullname
function createStudentData(student) {
  let contextMap = student && student.context ? student.context.custom : null;
  if (!contextMap) {
    // toast("Missing student data");
    //a student with no context
    console.log("No context:", JSON.stringify(student, null, 2));
    // create dummy context values
    contextMap = {
      public_id: "",
      fname: "",
      lname: "",
      fcolor: "",
      title: "",
      org: "",
    };
  }
  let studentData = { ...contextMap };
  studentData.publicId = student.public_id || "";
  studentData.fullname = `${specialEscape(
    studentData.fname || ""
  )}%20${specialEscape(studentData.lname || "")}`;
  studentData.org = specialEscape(studentData.org || "");
  studentData.title = specialEscape(studentData.title || "");
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
  // article.appendChild(colorAnchor);
  article.appendChild(imageContainer);
  return article;
}
function populateGallery(list) {
  for (const student of list) {
    const studentData = createStudentData(student);
    if (studentData) {
      const article = createGalleryEntry(studentData);
      //append to gallery
      document.querySelector("#gallery").appendChild(article);
    }
  }
}

function renderStudents(){
  fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/student-id.json`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        //populate global studentList with image and meta-data
        studentList = data.resources;
        populateGallery(studentList);
      })
      .catch(error=>{
        console.log("error fetching list")
      })
}
function initGallery() {
  console.log("init gallery");
  window.setTimeout(renderStudents,2000);
}
function clearForm() {
  document.querySelector("#fname").value = "";
  document.querySelector("#lname").value = "";
  document.querySelector("#title").value = "";
  document.querySelector("#org").value = "";
  document.querySelector("#fcolor").value = "";
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
    if (!student.context) return false;
    return (
      student.context.custom.fname === contextMap.fname &&
      student.context.custom.lname === contextMap.lname &&
      student.context.custom.title === contextMap.title &&
      student.context.custom.org === contextMap.org
    );
  });
  return result.length > 0;
}

//boolean true enables the button and boolean false disable
function setUploadButton(enable) {
  if (enable) {
    document.querySelector("#upload").removeAttribute("disabled");
  } else {
    document.querySelector("#upload").setAttribute("disabled", "disabled");
  }
}

function inputChanged() {
  if (
    document.querySelector("#fname").value.length > 0 &&
    document.querySelector("#lname").value.length > 0 &&
    document.querySelector("#title").value.length > 0 &&
    document.querySelector("#org").value.length > 0 &&
    document.querySelector("#fcolor").value.length > 0
  ) {
    setUploadButton(true);
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  //disable upload button
  setUploadButton(false);
  initGallery();

  document.querySelectorAll("input").forEach((el) => {
    el.addEventListener("input", inputChanged, false);
  });

  function deleteNoFaceImage(result) {
    const token = { token: result.info.delete_token };
    fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/delete_by_token`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(token),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log("error deleting image without face", data);
        clearForm();
        toast("Failed: image must have a face.", "warning");
        // alert("face deleted!")
      })
      .catch((error) => {
        console.log("error", error);
      });
  }

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
                  console.log("no face!");
                  deleteNoFaceImage(result);
                  // const token = { token: result.info.delete_token };
                  // fetch(
                  //   `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/delete_by_token`,
                  //   {
                  //     method: "post",
                  //     headers: {
                  //       "Content-Type": "application/json",
                  //     },
                  //     body: JSON.stringify(token),
                  //   }
                  // )
                  //   .then((response) => {
                  //     return response.json();
                  //   })
                  //   .then((data) => {
                  //     console.log("error deleting image without face", data);
                  //     clearForm();
                  //     toast(
                  //       "Failed: image must have a face.",
                  //       "warning"
                  //     );
                  //     // alert("face deleted!")
                  //   })
                  //   .catch((error) => {
                  //     console.log("error", error);
                  //   });
                } else {
                  toast("Successful upload.", "info");
                  clearForm();
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

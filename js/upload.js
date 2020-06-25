const PARAMS = new URLSearchParams(window.location.search);
const CLOUD_NAME = PARAMS.has("cn") ? PARAMS.get("cn") : "pictures77";
const PRESET = "student-id";
const BADGE_TRANSFORM = "t_v-badge";
const NOT_ALLOW_DUPS = true;

const cl = new cloudinary.Cloudinary({ cloud_name: CLOUD_NAME, secure: true });

const studentList = [];
const IMG_HEIGHT = "440";
const IMG_WIDTH = "300";

function toast(message, type) {
  console.log("toast:", message, type);
  const fromColor = type === "warn" ? "pink" : "#00b09b";
  const toColor = type === "warn" ? "red" : "#96c93d";
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "left", // `left`, `center` or `right`
    backgroundColor: `linear-gradient(to right, ${fromColor}, ${toColor})`,
    stopOnFocus: true, // Prevents dismissing of toast on hover
  }).showToast();

  //TODO add color to message
  // const toastEl = document.querySelector("#toast");
  // toastEl.className = "show";
  // document.querySelector("#toast #desc").innerHTML = message;
  // document.querySelector("#toast #img").innerHTML =
  //   type && type === "warning" ? "!" : "OK";

  // const typeClass = `toast-${type}`;
  // toastEl.classList.add(typeClass);
  // setTimeout(function () {
  //   toastEl.className = toastEl.className.replace("show", "");
  //   toastEl.classList.remove(typeClass);
  // }, 5000);
}

function doubleEncode(str) {
  console.log("double encode");
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
  console.log("createStudentData:", JSON.stringify(student, null, 2));
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
  // all data that will appear in overlay must be double encoded
  let studentData = { ...contextMap };
  studentData.publicId = student.public_id || "";
  studentData.fullname = `${doubleEncode(
    studentData.fname || ""
  )}%20${doubleEncode(studentData.lname || "")}`;
  studentData.org = doubleEncode(studentData.org || "");
  studentData.title = doubleEncode(studentData.title || "");
  let filler = Array(45).fill("%20").join("");
  //create overlay text
  const overlayText = `!${studentData.fullname}%250A${studentData.title}%250A${studentData.org}%250A${filler}!`;
  //create badge URL
  studentData.URL = cl.url(
    studentData.publicId,
    cl
      .transformation()
      .variables([["$data", `${overlayText}`]])
      .transformation("v-badge")
  );
  return studentData;
}

//create HTML
function createGalleryEntry(student) {
  console.log("createGalleryEntry:", JSON.stringify(student, null, 2));
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
  article.appendChild(imageContainer);
  return article;
}
function populateGallery(list) {
  for (const student of list) {
    const encodedStudentData = createStudentData(student);
    if (encodedStudentData) {
      const article = createGalleryEntry(encodedStudentData);
      //append to gallery
      document.querySelector("#gallery").appendChild(article);
    }
  }
}
function renderStudents() {
  const dataURL = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/v${Date.now()}/student-id.json`;
  fetch(dataURL)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      //populate global studentList with image and meta-data
      studentList.push(...data.resources);
      populateGallery(studentList);
    })
    .catch((error) => {
      console.log("error fetching list", error);
    });
}

/*
function loadStudents() {
  console.log("loadStudents");
  const fetchDataURL = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/student-id.json`;
  console.log(fetchDataURL);
  fetch(fetchDataURL)
    .then(response => {
      // console.log("fetch status:", response.status);
      // if (response.status === 200) {
        // console.log(response);
        response.json();
      // } else if (response.status === 404) {
        //TODO announce no users yet
        // toast("No student data yet.", "info");
      // }
    })
    .then(data => {
      // console.log("fetched data",data.resources.length,data.resources);
      // if (data && data.resources) {
        console.log("fetched data", data.resources.length);

        //populate global studentList with image and meta-data
        studentList.push(...data.resources);
        populateGallery(studentList);
      // }
    })
    .catch((error) => {
      console.log("error fetching list", error);
    });
}
*/
// clear form after successful image upload
function clearForm() {
  console.log("clearForm");
  document.querySelector("#fname").value = "";
  document.querySelector("#lname").value = "";
  document.querySelector("#title").value = "";
  document.querySelector("#org").value = "";
  document.querySelector("#fcolor").value = "";
}

// gather form data into context map
function createContextMap() {
  console.log("createContextMap");
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
  console.log("dupFound");
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
  console.log("setUploadButton");
  if (enable) {
    document.querySelector("#upload").removeAttribute("disabled");
  } else {
    document.querySelector("#upload").setAttribute("disabled", "disabled");
  }
}

//require all input data before image upload enabled
function inputChanged() {
  console.log("inputChanged");
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

//use a delete token to delete an image
function deleteNoFaceImage(result) {
  console.log("deleteNoFaceImage");
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
      console.log(
        "success deleting image without face",
        JSON.stringify(data, null, 2)
      );
      //TODO the upload button should be turned back on
      toast("Image uploaded must have a face.", "warn");
    })
    .catch((error) => {
      console.log("error deleting face", error);
    });
}

document.addEventListener("DOMContentLoaded", (event) => {
  //disable upload button
  setUploadButton(false);
  renderStudents();
  // loadStudents();
  // setTimeout(loadStudents, 5000);

  //listen for form inputs
  document.querySelectorAll("input").forEach((el) => {
    el.addEventListener("input", inputChanged, false);
  });

  //after the list is ready add submit listener
  document.querySelector("#upload").addEventListener(
    "click",
    function () {
      console.log("UW click handler");
      const contextMap = createContextMap();
      console.log("contextMap", contextMap);
      //verify form values collected - check that there is no existing student with same name and company
      if (NOT_ALLOW_DUPS && dupFound(contextMap, studentList)) {
        toast("Duplicates not allowed", "warn");
        return;
      } else {
        var myWidget = cloudinary.createUploadWidget(
          {
            cloudName: CLOUD_NAME,
            upload_preset: PRESET,
            sources: ["local", "url", "camera"],
            context: contextMap,
            clientAllowedFormats: ["png", "gif", "jpeg"],
            return_delete_token: 1,
          },
          (error, result) => {
            //wait for success
            if (!error) {
              console.log("UW non error event", result.event);
              if (result.event === "success") {
                console.log("success:", JSON.stringify(result, null, 2));
                //disable the upload button
                setUploadButton(false);

                //test that a face was uploaded
                if (
                  result.info &&
                  result.info.faces &&
                  result.info.faces.length > 0
                ) {
                  toast("Successful face upload.", "info");
                  clearForm();
                  //add image to gallery
                  // XXXXXXXXXXdocument.querySelector("#gallery").innerHTML = "";

                  //TODO TRY add to list add to DOM - otherwise need to call load
                  // add student to list
                  studentList.push(result.info);
                  console.log(
                    "new student added:",
                    JSON.stringify(studentList)
                  );
                  // add article to DOM
                  // const article = createGalleryEntry(result.info);
                  // document.querySelector("#gallery").appendChild(article);

                  // put new student in an array and send to populate
                  populateGallery([result.info]);
                } else {
                  console.log("Successful upload but no face!");
                  deleteNoFaceImage(result);
                }
              }
              if (result.event === "done") {
                console.log("done event:", result.info);
              }
            } else {
              console.log("UW error event", error);
              launch_toast(`Upload error: ${error}`, "warn");
            }
          }
        );

        myWidget.open();
      }
    },
    false
  );
});

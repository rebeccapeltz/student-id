var studentList = [];

function launch_toast(message) {
  document.querySelector("#toast #desc").innerHTML = message;
  var x = document.getElementById("toast");
  x.className = "show";
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 5000);
}

function populateGallery(list) {
  for (const student in list) {
    //create article
    /*

 <article id="3685" class="location-listing">
        <a class="student-title" href="#">
          Susan </a>
        <div class="student-image">
          <a href="#">
            <img width="345" height="505"
              src="https://res.cloudinary.com/pictures77/image/upload/$data_!Susan%20Burnell%250AInstructional Designer%250ACambridge%20University%250A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20!/t_v-badge/v1/student-id/0c05701c223b0f32b6f064efae191b9c"
              alt="susan"> </a>
        </div>
      </article>

    */
    //append to gallery
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  fetch("https://res.cloudinary.com/pictures77/image/list/student-id.json")
    .then((response) => response.json())
    .then((data) => {
      studentList = data.resources;
    });

  //after the list is ready add submit listener
  document.querySelector("#upload").addEventListener(
    "click",
    function () {
      const fname = document.querySelector("#fname").value;
      const lname = document.querySelector("#lname").value;
      const title = document.querySelector("#title").value;
      const org = document.querySelector("#org").value;
      const fcolor = document.querySelector("#fcolor").value;
      console.log(fname, lname, title, org, fcolor);
      // add context
      const contextMap = {};
      contextMap.fname = fname;
      contextMap.lname = lname;
      contextMap.title = title;
      contextMap.org = org;
      contextMap.fcolor = fcolor;
      //verify form values collected - check that there is no existing student with same name and company

      var myWidget = cloudinary.createUploadWidget(
        {
          cloudName: "pictures77",
          upload_preset: "student-id",
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
                  "https://api.cloudinary.com/v1_1/pictures77/delete_by_token",
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
                    launch_toast(
                      "Can't accept image because it doesn't have a face."
                    );
                    // alert("face deleted!")
                  })
                  .catch((error) => {
                    console.log("error", error);
                  });
              } else {
                launch_toast(
                  "Successful upload."
                );
              }

              // https://api.cloudinary.com/v1_1/demo/delete_by_token -X POST --data 'token=delete_token
            }
          } else {
            console.log(error);
            launch_toast(
              `Upload error: ${error}`
            );
          }
        }
      );

      myWidget.open();
    },
    false
  );
});

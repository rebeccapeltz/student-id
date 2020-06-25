# Virtual Student ID Badge

You can use your Cloudinary account as a Database for student images and information that will go into creating an ID badge.  

This web application can be harnessed to upload student information to the Cloud and create a web page with all student image and data made publicly available on the Web.

The script for the Web page will expect a query string with `cn:cloud_name` key/value pair.  The cloud_name supplied represents a Cloudinary cloud specific to a course.  

The steps to prepare for for using this app are: 

1. Create a Cloudinary cloud.
2. Run the script `create-student-id-preset.js`.  This script sets up instructions for cropping, foldering and tagging the images uploaded.  note: The upload script will also add user supplied context data and require that the image uploaded contains a face.
3. Run the script `create-named-badge-xform.js`. This script will create the transformation that will overlay student supplied data: name, title, organization to the badge.
4. Supply a URL to students for a particular course like this: 
```bash
https://path.to.app/index.html?cn=cloud_name
```
5. Cloudinary admin cloud setting for list sync: 
![list setting](./images/list-setting.jpg)
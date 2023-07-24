const express = require('express');
const router = express.Router();
const News = require('../models/News');
const Projects = require('../models/Projects');
const Blogs = require('../models/Blogs');
const TeamMembers = require('../models/TeamMembers');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const adminLayout = '../views/layouts/admin';
const loginLayout = '../views/layouts/login';

// multer config

// for images

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';

    if (file.mimetype === 'application/pdf') {
      uploadPath = 'public/Content'; // Set the destination folder for storing PDF files
    } else {
      uploadPath = 'public/img'; // Set the destination folder for storing images
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let filenamePrefix = '';

    if (file.mimetype === 'application/pdf') {
      filenamePrefix = 'pdf-';
    } else {
      filenamePrefix = 'image-';
    }

    cb(null, filenamePrefix + uniqueSuffix + path.extname(file.originalname)); // Set the filename for the uploaded file
  }
});

const upload = multer({ storage });

///Routes

// Admin cookie check

const authMiddleware=(req,res,next)=>{
  const token=req.cookies.token;
  if(!token){
    return res.status(401).json({message:"You have been logged out/Unauthorized access 1"})
  }
  try{
    const decoded= jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  }catch(error){
    return res.status(401).json({message:"You have been logged out/Unauthorized access 2"})
  }
}


// Admin Login Page

router.get('/admin', async(req,res)=>{
try{
  const locals ={
  title:'Admin',
  description: "Regional Sustainable Development Institute"
}
  res.render('admin/index', {locals, layout:loginLayout});

}catch(error){
  console.log(error)
}
});

// Admin check Login

router.post('/admin', async(req,res)=>{
try{
  const {username, password}=req.body;
  const user =await User.findOne({username});
  if (!user){
    return res.status(401).json({message:'Invalid Credentials'})
  }
const isPasswordValid = await bcrypt.compare(password, user.password);
if (!isPasswordValid){
    return res.status(401).json({message:'Invalid Credentials'})
}
const token = jwt.sign({userId:user._id}, jwtSecret);
res.cookie('token', token,{httpOnly:true});
res.redirect('/dashboard');
}catch(error){
  console.log(error)
}
});

// Register

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: 'User Created', user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: 'User already in use' });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Dashboard

router.get('/dashboard', authMiddleware, async(req,res)=>{
try{
  const locals ={
  title:'RSDI Dashboard',
  description: "Regional Sustainable Development Institute"
}
  res.render('admin/dashboard', {
    locals,
    layout:adminLayout
  })
}catch(error){
res.status(500).json({ message: 'Internal server error' });
}
});

// news_admin

router.get('/news_admin', authMiddleware, async(req,res)=>{
try{
  const locals ={
  title:'RSDI Dashboard',
  description: "Regional Sustainable Development Institute"
}
const data=await News.aggregate([{$sort:{createdAt:-1}}])
  res.render('admin/news_admin', {
    locals,
    data,
    layout:adminLayout
  })
}catch(error){
res.status(500).json({ message: 'Internal server error' });
}
});

//projects_admin

router.get('/projects_admin', authMiddleware, async(req,res)=>{
try{
  const locals ={
  title:'RSDI Dashboard',
  description: "Regional Sustainable Development Institute"
}
const data=await Projects.aggregate([{$sort:{createdAt:-1}}])
  res.render('admin/projects_admin', {
    locals,
    data,
    layout:adminLayout
  })
}catch(error){
  console.log(error)
res.status(500).json({ message: 'Internal server error' });
}
});

//blog_admin

router.get('/blog_admin', authMiddleware, async(req,res)=>{
try{
  const locals ={
  title:'RSDI Dashboard',
  description: "Regional Sustainable Development Institute"
}
const data=await Blogs.aggregate([{$sort:{createdAt:-1}}])
  res.render('admin/blog_admin', {
    locals,
    data,
    layout:adminLayout
  })
}catch(error){
res.status(500).json({ message: 'Internal server error' });
}
});

// team_admin

router.get('/team_admin', authMiddleware, async(req,res)=>{
try{
  const locals ={
  title:'RSDI Dashboard',
  description: "Regional Sustainable Development Institute"
}
const data=await TeamMembers.aggregate([{$sort:{createdAt:-1}}])
  res.render('admin/team_admin', {
    locals,
    data,
    layout:adminLayout
  })
}catch(error){
res.status(500).json({ message: 'Internal server error' });
console.log(error)
}
});


// Create New Post GET

router.get('/add-post', authMiddleware, async(req,res)=>{
try{
  const locals ={
  title:'Add Post',
  description: "Regional Sustainable Development Institute"
}
  const data=await News.find();
  const projectsData=await Projects.find();
  res.render('admin/add-post', {
    locals,
    data,
    projectsData,
    layout:adminLayout
  })
}catch(error){
res.status(500).json({ message: 'Internal server error' });
}
});

// Upload Image

router.post('/upload-image', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageFilename = req.file.filename;
    const imageUrl = req.protocol + '://' + req.get('host') + '/img/' + imageFilename;

    return res.status(200).json({ location: imageUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Upload pdf
router.post('/upload-pdf', upload.single('pdfFile'), (req, res) => {
  if (req.file) {
    return res.status(200).json("upload success");
  } else {
    res.status(400).send('No PDF file received');
  }
});


// Create New Post POST
const regex = /<img[^>]+name=(["'])([^"']+)["'][^>]*>/g; //regex to identify source Urls of images

router.post('/add-post', authMiddleware, upload.fields([{ name: 'image'}, { name: 'pdfFile', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, body, projects } = req.body;
      const imageUrls = []; // Array to store the extracted image URLs

      let match;
          while ((match = regex.exec(body)) !== null) {
            const imageUrl = match[2]; // Extract the URL from the matched img tag
            imageUrls.push(imageUrl); // Push the extracted URL to the imageUrls array
          }
          let pdfFileName=''
          let pdfURL=''
if (req.files['pdfFile']){
           pdfFileName = req.files['pdfFile'][0].filename;
           pdfURL = req.protocol + '://' + req.get('host') + '/Content/' + pdfFileName;
}
    const newPost = new News({
      title,
      body,
      projects,
      imageUrls,
      pdfURL
    });

    await News.create(newPost);
    res.redirect('/news_admin');
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Edit Post GET

router.get('/edit-post/:id', authMiddleware, async(req,res)=>{
try{
  const locals ={
title:'Edit Post',
description: "Regional Sustainable Development Institute"
}
const data=await News.findOne({_id:req.params.id});
const projectsData=await Projects.find();
res.render('admin/edit-post',{
  locals,
data,
projectsData,
admin: adminLayout})

}catch(error){
console.log(error);
}
});

//Edit Post PUT

router.put('/edit-post/:id', authMiddleware, upload.fields([{ name: 'image'}, { name: 'pdfFile', maxCount: 1 }]), async(req,res)=>{
try{
  const { title, body, projects } = req.body;
  const data=await News.findOne({_id:req.params.id});

// Storing image URLs in Array
    const imageUrls = []; // Array to store the extracted image URLs

    let match;
        while ((match = regex.exec(body)) !== null) {
          const imageUrl = match[2]; // Extract the URL from the matched img tag
          imageUrls.push(imageUrl); // Push the extracted URL to the imageUrls array
        }
// Replace Images/delete unused images
const oldImageUrls=data.imageUrls

function findMissingItems(array1, array2) {
return array1.filter(item => !array2.includes(item));
}
const missingItems = findMissingItems(oldImageUrls, imageUrls);

if (missingItems && missingItems.length > 0) {
missingItems.forEach((missingItem) => {
const filename = missingItem.substring(missingItem.lastIndexOf('/') + 1);
const filePath = path.join('public', 'img', filename);
fs.unlink(filePath, (error) => {
if (error) {
console.log('Error deleting image file:', error);
}
});
});
}


// Replace PDF/delete unused PDF
        let pdfFileName=''
        let pdfURL=data.pdfURL
        if (req.files['pdfFile']){
          const filename = pdfURL.substring(pdfURL.lastIndexOf('/') + 1);
          const filePath = path.join( 'public', 'Content', filename);
          fs.unlink(filePath, (error) => {
            if (error) {
              console.log('Error deleting pdf file:', error);
            }
          });
         pdfFileName = req.files['pdfFile'][0].filename;
         pdfURL = req.protocol + '://' + req.get('host') + '/Content/' + pdfFileName;
        }
        // Update data in DB

await News.findByIdAndUpdate(req.params.id,{
  title:req.body.title,
  body:req.body.body,
  projects:req.body.projects,
  imageUrls:imageUrls,
  pdfURL:pdfURL,
  updatedAt:Date.now()
});
res.redirect('/news_admin')

}catch(error){
console.log(error);
}
});

// Delete Post
router.delete('/delete-post/:id', authMiddleware, async(req,res)=>{
try{

  const entry = await News.findById(req.params.id);
      if (!entry) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      // Delete the image file from the server
          if (entry.imageUrls && entry.imageUrls.length > 0) {
  entry.imageUrls.forEach((imageUrl) => {
    const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
    const filePath = path.join('public', 'img', filename);
    fs.unlink(filePath, (error) => {
      if (error) {
        console.log('Error deleting image file:', error);
      }
    });
  });
}
// Delete the pdf file from the server
              if (entry.pdfURL){
                const pdfURL = entry.pdfURL;
                const filename = pdfURL.substring(pdfURL.lastIndexOf('/') + 1);
                const filePath = path.join( 'public', 'Content', filename);
                fs.unlink(filePath, (error) => {
                  if (error) {
                    console.log('Error deleting pdf file:', error);
                  }
                });
              }
await News.deleteOne({_id:req.params.id
});
res.redirect('/news_admin')

}catch(error){
console.log(error);
}
});

// Create New Project GET

router.get('/add-project', authMiddleware, async(req,res)=>{
try{
  const locals ={
  title:'Add Project',
  description: "Regional Sustainable Development Institute"
}
  const data=await Projects.find();
  res.render('admin/add-project', {
    locals,
    data,
    layout:adminLayout
  })
}catch(error){
res.status(500).json({ message: 'Internal server error' });
}
});

// Create New Project POST
router.post('/add-project', authMiddleware, upload.fields([{ name: 'image'}, { name: 'pdfFile', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, body } = req.body;
      const imageUrls = []; // Array to store the extracted image URLs

      let match;
          while ((match = regex.exec(body)) !== null) {
            const imageUrl = match[2]; // Extract the URL from the matched img tag
            imageUrls.push(imageUrl); // Push the extracted URL to the imageUrls array
          }
          let pdfFileName=''
          let pdfURL=''
if (req.files['pdfFile']){
           pdfFileName = req.files['pdfFile'][0].filename;
           pdfURL = req.protocol + '://' + req.get('host') + '/Content/' + pdfFileName;
}
    const newProject = new Projects({
      title,
      body,
      imageUrls,
      pdfURL
    });

    await Projects.create(newProject);
    res.redirect('/projects_admin');
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Edit Project GET

router.get('/edit-project/:id', authMiddleware, async(req,res)=>{
try{
  const locals ={
title:'Edit Post',
description: "Regional Sustainable Development Institute"
}
const data=await Projects.findOne({_id:req.params.id});
res.render('admin/edit-project',{
  locals,
data,
admin: adminLayout})

}catch(error){
console.log(error);
}
});

//Edit Project PUT

router.put('/edit-project/:id', authMiddleware, upload.fields([{ name: 'image'}, { name: 'pdfFile', maxCount: 1 }]), async(req,res)=>{
try{
  const { title, body } = req.body;
  const data=await Projects.findOne({_id:req.params.id});

// Storing image URLs in Array
    const imageUrls = []; // Array to store the extracted image URLs

    let match;
        while ((match = regex.exec(body)) !== null) {
          const imageUrl = match[2]; // Extract the URL from the matched img tag
          imageUrls.push(imageUrl); // Push the extracted URL to the imageUrls array
        }
// Replace Images/delete unused images
const oldImageUrls=data.imageUrls

function findMissingItems(array1, array2) {
return array1.filter(item => !array2.includes(item));
}
const missingItems = findMissingItems(oldImageUrls, imageUrls);

if (missingItems && missingItems.length > 0) {
missingItems.forEach((missingItem) => {
const filename = missingItem.substring(missingItem.lastIndexOf('/') + 1);
const filePath = path.join('public', 'img', filename);
fs.unlink(filePath, (error) => {
if (error) {
console.log('Error deleting image file:', error);
}
});
});
}
// Replace PDF/delete unused PDF
        let pdfFileName=''
        let pdfURL=data.pdfURL
        if (req.files['pdfFile']){
          const filename = pdfURL.substring(pdfURL.lastIndexOf('/') + 1);
          const filePath = path.join( 'public', 'Content', filename);
          fs.unlink(filePath, (error) => {
            if (error) {
              console.log('Error deleting pdf file:', error);
            }
          });
         pdfFileName = req.files['pdfFile'][0].filename;
         pdfURL = req.protocol + '://' + req.get('host') + '/Content/' + pdfFileName;
        }
        // Update data in DB

await Projects.findByIdAndUpdate(req.params.id,{
  title:req.body.title,
  body:req.body.body,
  imageUrls:imageUrls,
  pdfURL:pdfURL,
  updatedAt:Date.now()
});
res.redirect('/projects_admin')

}catch(error){
console.log(error);
}
});

// Delete Project
router.delete('/delete-project/:id', authMiddleware, async(req,res)=>{
try{

  const entry = await Projects.findById(req.params.id);
      if (!entry) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      // Delete the image file from the server
          if (entry.imageUrls && entry.imageUrls.length > 0) {
  entry.imageUrls.forEach((imageUrl) => {
    const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
    const filePath = path.join('public', 'img', filename);
    fs.unlink(filePath, (error) => {
      if (error) {
        console.log('Error deleting image file:', error);
      }
    });
  });
}
// Delete the pdf file from the server
              if (entry.pdfURL){
                const pdfURL = entry.pdfURL;
                const filename = pdfURL.substring(pdfURL.lastIndexOf('/') + 1);
                const filePath = path.join( 'public', 'Content', filename);
                fs.unlink(filePath, (error) => {
                  if (error) {
                    console.log('Error deleting pdf file:', error);
                  }
                });
              }
await Projects.deleteOne({_id:req.params.id
});
res.redirect('/projects_admin')

}catch(error){
console.log(error);
}
});

// Create New Blog GET

router.get('/add-Blog', authMiddleware, async(req,res)=>{
try{
  const locals ={
  title:'Add Blog-post',
  description: "Regional Sustainable Development Institute"
}
  const data=await Blogs.find();
  res.render('admin/add-blog', {
    locals,
    data,
    layout:adminLayout
  })
}catch(error){
res.status(500).json({ message: 'Internal server error' });
}
});

// Create New Blog POST
router.post('/add-blog', authMiddleware, upload.fields([{ name: 'image'}, { name: 'pdfFile', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, body } = req.body;
      const imageUrls = []; // Array to store the extracted image URLs

      let match;
          while ((match = regex.exec(body)) !== null) {
            const imageUrl = match[2]; // Extract the URL from the matched img tag
            imageUrls.push(imageUrl); // Push the extracted URL to the imageUrls array
          }
          let pdfFileName=''
          let pdfURL=''
if (req.files['pdfFile']){
           pdfFileName = req.files['pdfFile'][0].filename;
           pdfURL = req.protocol + '://' + req.get('host') + '/Content/' + pdfFileName;
}
    const newPost = new Blogs({
      title,
      body,
      imageUrls,
      pdfURL
    });

    await Blogs.create(newPost);
    res.redirect('/blog_admin');
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Edit Blog GET

router.get('/edit-blog/:id', authMiddleware, async(req,res)=>{
try{
  const locals ={
title:'Edit Blog',
description: "Regional Sustainable Development Institute"
}
const data=await Blogs.findOne({_id:req.params.id});
res.render('admin/edit-blog',{
  locals,
data,
admin: adminLayout})

}catch(error){
console.log(error);
}
});

//Edit Blog PUT

router.put('/edit-blog/:id', authMiddleware, upload.fields([{ name: 'image'}, { name: 'pdfFile', maxCount: 1 }]), async(req,res)=>{
try{
  const { title, body } = req.body;
  const data=await Blogs.findOne({_id:req.params.id});

// Storing image URLs in Array
    const imageUrls = []; // Array to store the extracted image URLs

    let match;
        while ((match = regex.exec(body)) !== null) {
          const imageUrl = match[2]; // Extract the URL from the matched img tag
          imageUrls.push(imageUrl); // Push the extracted URL to the imageUrls array
        }
// Replace Images/delete unused images
const oldImageUrls=data.imageUrls

function findMissingItems(array1, array2) {
return array1.filter(item => !array2.includes(item));
}
const missingItems = findMissingItems(oldImageUrls, imageUrls);

if (missingItems && missingItems.length > 0) {
missingItems.forEach((missingItem) => {
const filename = missingItem.substring(missingItem.lastIndexOf('/') + 1);
const filePath = path.join('public', 'img', filename);
fs.unlink(filePath, (error) => {
if (error) {
console.log('Error deleting image file:', error);
}
});
});
}


// Replace PDF/delete unused PDF
        let pdfFileName=''
        let pdfURL=data.pdfURL
        if (req.files['pdfFile']){
          const filename = pdfURL.substring(pdfURL.lastIndexOf('/') + 1);
          const filePath = path.join( 'public', 'Content', filename);
          fs.unlink(filePath, (error) => {
            if (error) {
              console.log('Error deleting pdf file:', error);
            }
          });
         pdfFileName = req.files['pdfFile'][0].filename;
         pdfURL = req.protocol + '://' + req.get('host') + '/Content/' + pdfFileName;
        }
        // Update data in DB

await Blogs.findByIdAndUpdate(req.params.id,{
  title:req.body.title,
  body:req.body.body,
  imageUrls:imageUrls,
  pdfURL:pdfURL,
  updatedAt:Date.now()
});
res.redirect('/blog_admin')

}catch(error){
console.log(error);
}
});

// Delete Blog
router.delete('/delete-blog/:id', authMiddleware, async(req,res)=>{
try{

  const entry = await Blogs.findById(req.params.id);
      if (!entry) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      // Delete the image file from the server
          if (entry.imageUrls && entry.imageUrls.length > 0) {
  entry.imageUrls.forEach((imageUrl) => {
    const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
    const filePath = path.join('public', 'img', filename);
    fs.unlink(filePath, (error) => {
      if (error) {
        console.log('Error deleting image file:', error);
      }
    });
  });
}
// Delete the pdf file from the server
              if (entry.pdfURL){
                const pdfURL = entry.pdfURL;
                const filename = pdfURL.substring(pdfURL.lastIndexOf('/') + 1);
                const filePath = path.join( 'public', 'Content', filename);
                fs.unlink(filePath, (error) => {
                  if (error) {
                    console.log('Error deleting pdf file:', error);
                  }
                });
              }
await Blogs.deleteOne({_id:req.params.id
});
res.redirect('/blog_admin')

}catch(error){
console.log(error);
}
});

// Create New team member GET

router.get('/add-teamMember', authMiddleware, async(req,res)=>{
try{
  const locals ={
  title:'Add Post',
  description: "Regional Sustainable Development Institute"
}
  const data=await TeamMembers.find();
  res.render('admin/add-teamMember', {
    locals,
    data,
    layout:adminLayout
  })
}catch(error){
res.status(500).json({ message: 'Internal server error' });
}
});

// Create New team member POST

router.post('/add-teamMember', authMiddleware, upload.single('profileImg'), async (req, res) => {
  try {
    const { name, role } = req.body;
    const socMedia={
      linkedin: req.body.linkedin,
      facebook: req.body.facebook,
      gmail: req.body.gmail,
      twitter: req.body.twitter
  }
  let imageName=''
  let imageUrl=''
if (req.file){
   imageName = req.file.filename;
   imageUrl = req.protocol + '://' + req.get('host') + '/img/' + imageName;
}
    const newMember = new TeamMembers({
      name,
      role,
      socMedia,
      imageUrl,
    });

    await TeamMembers.create(newMember);
    res.redirect('/team_admin');
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Edit team member GET

router.get('/edit-team/:id', authMiddleware, async(req,res)=>{
try{
  const locals ={
title:'Edit Team Member',
description: "Regional Sustainable Development Institute"
}
const data=await TeamMembers.findOne({_id:req.params.id});
res.render('admin/edit-team',{
  locals,
data,
admin: adminLayout})

}catch(error){
console.log(error);
}
});

//Edit team member PUT

router.put('/edit-team/:id', authMiddleware, upload.single('profileImg'), async(req,res)=>{
try{

  const data=await TeamMembers.findOne({_id:req.params.id});

  const { name, role } = req.body;
  const socMedia={
    linkedin: req.body.linkedin,
    facebook: req.body.facebook,
    gmail: req.body.gmail,
    twitter: req.body.twitter
}

let imageName = ""
let imageUrl = data.imageUrl

if (req.file) {
const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
const filePath = path.join( 'public', 'img', filename);
fs.unlink(filePath, (error) => {
if (error) {
console.log('Error deleting image file:', error);
}
});
   imageName = req.file.filename;
   imageUrl = req.protocol + '://' + req.get('host') + '/img/' + imageName;
}
        // Update data in DB

await TeamMembers.findByIdAndUpdate(req.params.id,{
  name:req.body.name,
  role:req.body.role,
  socMedia:socMedia,
  imageUrl:imageUrl,
  updatedAt:Date.now()
});
res.redirect('/team_admin')

}catch(error){
console.log(error);
}
});

// Delete team member
router.delete('/delete-team/:id', authMiddleware, async(req,res)=>{
try{

  const entry = await TeamMembers.findById(req.params.id);
      if (!entry) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      // Delete the image file from the server
      let imageUrl = entry.imageUrl

          if (entry.imageUrl) {
            const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            const filePath = path.join( 'public', 'img', filename);
            fs.unlink(filePath, (error) => {
            if (error) {
            console.log('Error deleting image file:', error);
            }
            });
}

await TeamMembers.deleteOne({_id:req.params.id
});
res.redirect('/team_admin')

}catch(error){
console.log(error);
}
});

// Logout Route
router.get('/logout', (req,res)=>{
res.clearCookie('token');
res.redirect('/');

});


module.exports = router

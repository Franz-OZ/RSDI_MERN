
const express = require('express');
const router = express.Router();
const News = require('../models/News')
const Projects = require('../models/Projects');
const Blogs = require('../models/Blogs');
const TeamMembers = require('../models/TeamMembers');




///Routes
router.get('', async(req,res)=>{
const locals ={
  title:'RSDI',
  description: "Regional Sustainable Development Institute"
}
try{const data = await News.find();
  res.render('index', {locals,data});

}catch(error){
  console.log(error)
}
});

// Router for Search

router.post('/search', async(req,res)=>{
try {const locals ={
  title:'Search',
  description: "Regional Sustainable Development Institute"
}
let searchTerm = req.body.searchTerm;
const searchNoSpecialChar=searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
const data = await Promise.all([
  News.find({
    $or: [
      { title: { $regex: searchNoSpecialChar, $options: 'i' } },
      { body: { $regex: searchNoSpecialChar, $options: 'i' } },
    ],
  }),
  Projects.find({
    $or: [
      { title: { $regex: searchNoSpecialChar, $options: 'i' } },
      { body: { $regex: searchNoSpecialChar, $options: 'i' } },
    ],
  }),
  Blogs.find({
    $or: [
      { title: { $regex: searchNoSpecialChar, $options: 'i' } },
      { body: { $regex: searchNoSpecialChar, $options: 'i' } },
    ],
  }),
]);
res.render('searchPage', {
newsData: data[0], // Assuming data[0] contains the News search results
projectsData: data[1], // Assuming data[1] contains the Projects search results
blogsData: data[2],
locals,
})
}catch(error){
  console.log(error)
}
});

//Router for Newslist page

router.get('/NewsList', async(req,res)=>{
try{
  const locals ={
  title:'RSDI',
  description: "Regional Sustainable Development Institute"
}
let perPage=10;
let page = req.query.page || 1;
const data=await News.aggregate([{$sort:{createdAt:-1}}])
.skip(perPage*page-perPage)
.limit(perPage)
.exec();

const count = await News.count();
const nextPage=parseInt(page)+1;
const hasNextPage=nextPage<=Math.ceil(count/perPage);

  res.render('NewsList', {
    locals,
    data,
    current:page,
    nextPage:hasNextPage ? nextPage : null,
});

}catch(error){
  console.log(error)
}
});

//Router for individual News

router.get('/news/:id/', async(req,res)=>{
try {
let slug=req.params.id;

const data = await News.findById({_id: slug});

const locals ={
title:data.title,
description: "Regional Sustainable Development Institute",
}
  res.render('news', {locals,data});
}catch(error){
  console.log(error)
}
});

//Router for about page

router.get('/about', (req,res)=>{
  res.render('about')
});

//Router for ProjectsList page

router.get('/ProjectsList', async(req,res)=>{
try{
  const locals ={
  title:'RSDI',
  description: "Regional Sustainable Development Institute"
}
let perPage=10;
let page = req.query.page || 1;
const data=await Projects.aggregate([{$sort:{createdAt:-1}}])
.skip(perPage*page-perPage)
.limit(perPage)
.exec();

const count = await Projects.count();
const nextPage=parseInt(page)+1;
const hasNextPage=nextPage<=Math.ceil(count/perPage);

  res.render('projectsList', {
    locals,
    data,
    current:page,
    nextPage:hasNextPage ? nextPage : null,
});

}catch(error){
  console.log(error)
}
});

//Router for individual Projects

router.get('/projects/:id/', async(req,res)=>{
try {
let slug=req.params.id;

const data = await Projects.findById({_id: slug});
const activities=await News.find({projects: slug})

const locals ={
title:data.title,
description: "Regional Sustainable Development Institute",
}
  res.render('projects', {locals,data,activities});
}catch(error){
  console.log(error)
}
});

//Router for BlogList page

router.get('/Blogslist', async(req,res)=>{
try{
  const locals ={
  title:'RSDI',
  description: "Regional Sustainable Development Institute"
}
let perPage=10;
let page = req.query.page || 1;
const data=await Blogs.aggregate([{$sort:{createdAt:-1}}])
.skip(perPage*page-perPage)
.limit(perPage)
.exec();

const count = await Blogs.count();
const nextPage=parseInt(page)+1;
const hasNextPage=nextPage<=Math.ceil(count/perPage);

  res.render('BlogsList', {
    locals,
    data,
    current:page,
    nextPage:hasNextPage ? nextPage : null,
});

}catch(error){
  console.log(error)
}
});

//Router for individual blog posts

router.get('/blog-post/:id/', async(req,res)=>{
try {
let slug=req.params.id;

const data = await Blogs.findById({_id: slug});

const locals ={
title:data.title,
description: "Regional Sustainable Development Institute",
}
  res.render('blog-post', {locals,data});
}catch(error){
  console.log(error)
}
});

//Router for Team page

router.get('/team', async(req,res)=>{
try{
  const locals ={
  title:'RSDI Team',
  description: "Regional Sustainable Development Institute"
}

const data=await TeamMembers.aggregate([{$sort:{createdAt:-1}}])

  res.render('team', {
    locals,
    data,
});

}catch(error){
  console.log(error)
}
});

//Router for individual blog posts

router.get('/teamMember/:id/', async(req,res)=>{
try {
let slug=req.params.id;

const data = await TeamMembers.findById({_id: slug});

const locals ={
title:data.name,
description: "Regional Sustainable Development Institute",
}
  res.render('teamMember', {locals,data});
}catch(error){
  console.log(error)
}
});


module.exports = router

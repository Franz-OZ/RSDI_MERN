const mongoose = require ('mongoose');

const Schema = mongoose.Schema

const ProjectsSchema = new Schema({
  title:{
    type:String,
    required:true},
  body:{
    type:String,
    required:true
  },
  imageUrls:{
    type:[String]
  },
  pdfURL:{
    type:String
  },
  activities:{
    type:[String]
  },
  createdAt:{
    type:Date,
    default: Date.now
  },
  updatedAt:{
    type:Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Projects',ProjectsSchema);

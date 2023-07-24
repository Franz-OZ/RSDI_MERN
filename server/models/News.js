const mongoose = require ('mongoose');

const Schema = mongoose.Schema

const NewsSchema = new Schema({
  title:{
    type:String,
    required:true},
  body:{
    type:String,
    required:true
  },
  projects:{
    type: String
  },
  imageUrls:{
    type:[String]
  },
  pdfURL:{
    type:String
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

module.exports = mongoose.model('News',NewsSchema);

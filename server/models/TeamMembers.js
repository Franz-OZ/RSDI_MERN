const mongoose = require ('mongoose');

const Schema = mongoose.Schema

const TeamMembersSchema = new Schema({
  name:{
    type:String,
    required:true},
  role:{
    type:String,
    required:true
  },
  imageUrl:{
    type:String
  },
  socMedia:{
    linkedin: String,
    facebook: String,
    gmail: String,
    twitter: String
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

module.exports = mongoose.model('TeamMembers',TeamMembersSchema);

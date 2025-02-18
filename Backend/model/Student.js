const mongoose = require("mongoose")

const StudentSchema = new mongoose.Schema({
    id:String,
    name:String,
    email:String,
    batchyear:String,
    department:String,
    mentor:String,
    username:String,
    password:String
})

const StudentModel = mongoose.model("student", StudentSchema);
module.exports = StudentModel;

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    id: String,
    name: String,
    department: String,
    email: String,
    contactnum: String,
    username: String,
    password: String,
});

const UserModel = mongoose.model("Mentor", UserSchema);

module.exports = UserModel;

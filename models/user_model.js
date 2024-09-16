const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/birthday_test");

const userschema = mongoose.Schema({
    name: String,
    username: String,
    email: String,
    age: Number,
    password: String,
    posts :[{ type: mongoose.Schema.Types.ObjectId, ref: "post"}]
})

module.exports = mongoose.model("user", userschema);
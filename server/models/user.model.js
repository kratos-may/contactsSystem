const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

let Schema = mongoose.Schema;

let userSchema = new Schema({
    first_name: {type: String,required: [true, "the name is required"],},
    last_name: {type: String,required: [true, "the last name is required"],},
    email: {type: String,required: [true, "the email is required"],unique:true},
    password: {type: String,required: [true, "the password is required"]},
});

userSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
};
userSchema.plugin(uniqueValidator, {message:'{PATH} ya existe.'});
module.exports = mongoose.model("User", userSchema);

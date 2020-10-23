const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

let rolesValidates = {
    values: ["ADMIN_ROLE", "USER_ROLE"],
    message: "{VALUE} no es un rol válido",
};

let Schema = mongoose.Schema;

let userSchema = new Schema({
    name: {type: String,required: [true, "El nombre es necesario"],},
    email: {type: String,required: [true, "El email es necesario"],unique:true},
    password: {type: String,required: [true, "El password es obligatoria"]},
    image: {type: String,required: false,},
    role: { type: String, default: "ADMIN_ROLE", enum: rolesValidates },
    state: {type: Boolean,default: true,},
    createdAt: { type: Date, default: Date.now }
});

userSchema.methods.setImgUrl = function setImgUrl(fileName){
    this.image= `${process.env.HOST}:${process.env.PORT}/publics/${fileName}`
}

userSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
};
userSchema.plugin(uniqueValidator, {message:'{PATH} ya existe.'});
module.exports = mongoose.model("User", userSchema);

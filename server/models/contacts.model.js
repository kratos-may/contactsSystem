const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let contactSchema = new Schema({
    first_name: {type: String,required: [true, "the name is required"],},
    last_name: {type: String,required: [true, "the last name is required"],},
    email: {type: String,required: [true, "the email is required"]},
    nro_contact: {type: String,required: [true, "the number contacts is required"]},
});

module.exports = mongoose.model("Contact", contactSchema);

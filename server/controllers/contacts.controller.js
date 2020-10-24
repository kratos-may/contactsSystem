const Contact = require("../models/contacts.model");
const _ = require("underscore");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

const saveContacts = (req,res) =>{
    let body = req.body;
    let contact = new Contact({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        nro_contact: body.nro_contact
    });
    contact.save((err, contactDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }
        if(contactDb){
            //Welcome Email
            //config mail
            var transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "eduardoquerales7413@gmail.com",
                    pass: "eq1234567890",
                },
            });

            transporter.use(
                "compile",
                hbs({
                    viewEngine: {
                        extName: '.handlebars',
                        partialsDir: path.resolve(__dirname, "../template/"),
                        layoutsDir: path.resolve(__dirname, "../template/"),
                        defaultLayout: "welcomeContacts",
                    },
                    viewPath: path.resolve(__dirname, "../template/"),
                }),
            );

            var mailOptions = {
                to: body.email,
                from: "eduardoquerales7413@gmail.com", //change this
                subject: "Welcome",
                context: {
                    email: body.email
                },
                attachments: [
                    {
                        filename: "image1",
                        path: path.resolve(__dirname, "../template/images/logoazul.png"),
                        cid: "image1@image",
                    },
                ],
                template: "welcomeContacts",
            };

            transporter.sendMail(mailOptions, async function(error) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Correo enviado exitosamente al email: ", body.email);
                }
            });
        }
        res.status(202).json({
            ok: true,
            contact:contactDb,
        });
    });
}
const getContactsById = (req,res) =>{
    let id = req.params.id;
    Contact.findOne({ _id:id},(err,contactDb) =>{
        if( err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!contactDb){
            return res.status(404).json({
                ok: false,
                message:"Contacts does not exist"
            });
        }
        res.json({
            ok: true,
            contact: contactDb,
        })

    });
}

async function updateContacts(req,res,next){
    try{
        let id = req.params.id;
        let body= _.pick(req.body,['first_name','last_name','email', 'nro_contact']);
        const reg = await Contact.findByIdAndUpdate({_id: id},body,{new: true})
        res.json({
            ok: true,
            contact: reg,
            message:"Contacts Successfully Modified"
        })
    }catch(e){
        res.status(500).send({
            message:e
        });
        next(e);
    }
}
async function deleteContacts(req,res,next){
    try {
        const reg = await Contact.findOneAndRemove({_id: req.params.id});
        res.json({
            ok: true,
            contact: reg,
            message:"Contacts Successfully Removed"
        })
    } catch (e) {
        res.status(500).send({
            message:e
        });
        next(e);
    }
}
const getAllContacts = (req, res) =>{
    let from = req.query.from || 0;
    from = Number(from);

    let limit = req.query.limit || 10;
    limit = Number(limit);
    Contact.find()
        .skip(from)
        .limit(limit)
        .exec((err, contactDb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }

            Contact.countDocuments((err, count) => {
                res.status(200).json({
                    ok: true,
                    totalContacts: count,
                    contacts: contactDb,
                });
            });
        });
}

const searchContacts=(req, res) =>{

    let first_name = req.query.first_name;
    let last_name = req.query.last_name;
    let email = req.query.email;
    let nro_contact = req.query.nro_contact;
    let regexName = new RegExp(first_name, 'i');
    let regexLastName = new RegExp(last_name, 'i');
    let regexEmail = new RegExp(email, 'i');
    let regexNro = new RegExp(nro_contact, 'i');
    Contact.find({ first_name: regexName, email: regexEmail, nro_contact: regexNro, last_name:regexLastName})
        .exec((err, contactDb) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }
            res.json({
                ok: true,
                contacts:contactDb
            })
        });
}

module.exports = {
    saveContacts,
    getContactsById,
    deleteContacts,
    getAllContacts,
    searchContacts,
    updateContacts
};

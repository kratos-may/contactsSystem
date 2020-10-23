const User = require("../models/user.model");
const _ = require("underscore");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
const path = require("path");

const saveUser = (req,res) =>{
    let body = req.body;
    const { errors, isValid } = validateRegisterInput(body);
    if (!isValid) {
        return res.status(400).json(
            {
                err:{
                    message : errors
                }
            }
        );
    }
    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role,
    });
    //Welcome Email
    //config mail
    var transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "2becommercenodemail@gmail.com",
            pass: "2b12345678",
        },
    });

    transporter.use(
        "compile",
        hbs({
            viewEngine: {
                extName: '.handlebars',
                partialsDir: path.resolve(__dirname, "../template/"),
                layoutsDir: path.resolve(__dirname, "../template/"),
                defaultLayout: "welcome",
            },
            viewPath: path.resolve(__dirname, "../template/"),
        }),
    );

    var mailOptions = {
        to: body.email,
        from: "eduardoquerales7413@gmail.com", //change this
        subject: "Welcome to systemContacts",
        context: {
            password: body.password,
            email: body.email,
            link: process.env.FRONT_URL,
        },
        attachments: [
            {
                filename: "image1",
                path: path.resolve(__dirname, "../template/images/logoazul.png"),
                cid: "image1@image",
            },
        ],
        template: "welcome",
    };

    transporter.sendMail(mailOptions, async function(error) {
        if (error) {
            console.log(error);
        } else {
            console.log("Correo enviado exitosamente al email: ", body.email);
        }
    });
    user.save((err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }

        res.status(201).json({
            ok: true,
            user: userDB,
        });
    });
}
const getUserById = (req,res) =>{
    let id = req.params.id;
    User.findOne({ _id:id,state: true },(err,userDb) =>{
        if( err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!userDb){
            return res.status(404).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            user: userDb,
        })

    });
}

async function update(req,res,next){
    try{
        let body= _.pick(req.body,['name','email', 'password']);
        let pas = body.password;
        const reg0 = await User.findOne({_id: req.body._id});
        if(pas){
            if(pas != reg0.password){
                body.password = await bcrypt.hash(body.password,10);
            }
        }
        const reg = await User.findByIdAndUpdate({_id: req.body._id},body,{new: true})
        res.status(200).send(reg);
    }catch(e){
        res.status(500).send({
            message:e
        });
        next(e);
    }
}

const deleteUser = (req, res) =>{
    let id = req.params.id;
    User.findByIdAndUpdate(id,{state:false},{new: true,runValidators:true},(err,userDb)=>{
        if( err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!userDb ){
            return res.status(404).json({
                ok: false,
                err: {
                    message:"Usuario no encontrado"
                }
            });
        }
        res.json({
            ok: true,
            user: userDb,
            message:"Usuario Eliminado satisfactoriamente"
        })
    });
}

const getAllUser = (req, res) =>{
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);
    User.find({ state: true }, "name email role image")
        .skip(desde)
        .limit(limite)
        .exec((err, users) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }

            User.countDocuments({ state: true }, (err, count) => {
                res.status(200).json({
                    ok: true,
                    totalUsers: count,
                    users,
                });
            });
        });
}

const searchUser=(req, res) =>{

    let name = req.query.name;
    let email = req.query.email;
    let role = req.query.role;
    let regexName = new RegExp(name, 'i');
    let regexEmail = new RegExp(email, 'i');
    let regexRole = new RegExp(role, 'i');
    User.find({ name: regexName, email: regexEmail, role: regexRole, state:true})
        .exec((err, users) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err,
                });
            }
            res.json({
                ok: true,
                users
            })
        });
}

const login = (req, res) =>{
    let body = req.body;
    const { errors, isValid } = validateLoginInput(body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: body.email, state: true }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err,
            });
        }
        if (!userDB) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: "Usuario no existe",
                },
            });
        }

        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario no existe o contraseña incorrecta",
                },
            });
        }

        let token = jwt.sign({ user: userDB }, process.env.SEED, {
            expiresIn: process.env.EXP,
        });

        res.json({
            ok: true,
            user: userDB,
            token
        });

    });
}

module.exports = {
    saveUser,
    getUserById,
    deleteUser,
    getAllUser,
    searchUser,
    login,
    update
};

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
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10)
    });
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

async function update(req,res,next){
    try{
        let id = req.params.id;
        let body= _.pick(req.body,['first_name','last_name','email', 'password']);
        let pas = body.password;
        const reg0 = await User.findOne({_id: id});
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

const login = (req, res) =>{
    let body = req.body;
    const { errors, isValid } = validateLoginInput(body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: body.email}, (err, userDB) => {
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
                    message: "User does not exist",
                },
            });
        }

        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "User does not exist or Incorrect password",
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
    login,
    update
};

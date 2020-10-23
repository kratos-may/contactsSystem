const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

//=================================
// VERIFICAR TOKEN
//=================================
let verifyToken = (req, res, next) => {
    let token = req.get("token");
    jwt.verify(token, process.env.SEED, (err, decode) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: "Token no valido",
                },
            });
        }
        req.user = decode.user;
        next();
    });
};
//=================================
// REFRESH TOKEN
//=================================
let refreshToken = (token) => {

    const decode = jwt.decode(token);
    User.findById({_id:decode.user._id,state:true},(err,userDb)=>{
        if(err){
            return false;
        }else{
            let returnToken = jwt.sign(userDb.toJSON(),process.env.SEED,{expiresIn: process.env.EXP});
            return returnToken;
        }
    });
}
//=================================
// VERIFICAR ADMIN_ROLE
//=================================
let verifyRoleAdmin = (req, res, next) => {
    let user = req.user;
    if (user.role === "ADMIN_ROLE") {
        next();
    } else {
        return res.status(203).json({
            ok: false,
            err: {
                message: "No es un administrador",
            },
        });
    }
};

module.exports = { verifyToken, verifyRoleAdmin };

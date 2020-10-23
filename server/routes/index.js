const UserRouter = require("./user");
const AuthenticationRouter = require("./login");

exports.load = (app) => {
    app.use("/user", UserRouter);
    app.use("/login", AuthenticationRouter);

    return app;
};

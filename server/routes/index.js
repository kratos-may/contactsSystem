const UserRouter = require("./user");
const ContactsRouter = require("./contacts");
const AuthenticationRouter = require("./login");

exports.load = (app) => {
    app.use("/user", UserRouter);
    app.use("/login", AuthenticationRouter);
    app.use("/contacts",ContactsRouter);
    return app;
};

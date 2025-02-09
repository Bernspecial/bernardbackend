// Needed Resources 
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const Util = require('../utilities');
const Validate = require('../utilities/account-validation');
const validate = require("../utilities/account-validation");


router.get("/login", Util.handleErrors(accountController.buildLogin));
// Logout route
router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Logout error:", err);
            return res.redirect("/account/"); // Redirect to account management on error
        }
        res.clearCookie("jwt"); // Clear the JWT cookie if you're using it
        res.redirect("/"); // Redirect to home page after logout
    });
});
router.get("/register", Util.handleErrors(accountController.buildRegister));

// Creating a user
router.post("/register", Validate.registationRules(),
    Validate.checkRegData, Util.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post(
    "/login", validate.loginRules(), validate.checkLoginData, Util.handleErrors(accountController.accountLogin))

router.get("/", Util.checkLogin, Util.handleErrors(accountController.accountManagement))

// In your accountRoutes.js
router.get('/update/:acct_id', Util.handleErrors(accountController.editAccountView));
router.post("/updateAccount", validate.updateRules(), validate.checkAcctUpdateData, Util.handleErrors(accountController.updateAccount))

router.post("/updatePassword", validate.validateChangePassword(), validate.checkPasswordUpdate, Util.handleErrors(accountController.changePassword))

module.exports = router;
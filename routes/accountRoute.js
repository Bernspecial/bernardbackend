// Needed Resources 
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const Util = require('../utilities');
const Validate = require('../utilities/account-validation');
const validate = require("../utilities/account-validation");


router.get("/login", Util.handleErrors(accountController.buildLogin));
router.get("/register", Util.handleErrors(accountController.buildRegister));

// Creating a user
router.post("/register", Validate.registationRules(),
    Validate.checkRegData, Util.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post(
    "/login", validate.loginRules(), validate.checkLoginData,
    (req, res) => {
        res.status(200).send('login process')
    }
)

module.exports = router;
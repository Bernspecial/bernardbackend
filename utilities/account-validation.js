const utilities = require(".")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const { body, validationResult } = require("express-validator")
const validate = {}




validate.loginRules = () => {
    return [
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            // .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email);
                if (!emailExists) {
                    throw new Error("Email does not exist. Please register.");
                }
            }),

        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            // .withMessage("Password is required.")
            .isLength({ min: 12 })
            .withMessage("Password must be at least 12 characters long.")
            .custom(async (account_password, { req }) => {
                const account = await accountModel.getAccountByEmail(req.body.account_email);
                if (account) {
                    const passwordMatch = await bcrypt.compare(account_password, account.account_password);
                    if (!passwordMatch) {
                        throw new Error("Email or password is incorrect.");
                    }
                } else {
                    throw new Error("Email or password is incorrect.");
                }
            }),

    ]
}

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registationRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            // .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            // .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // on error this message is sent.

        // valid email is required and cannot already exist in the DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email exists. Please log in or use different email")
                }
            }),

        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        return res.status(400).render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        })

    }
    next()
}

/* ******************************
 * errors will be directed back to the view
 * ***************************** */
validate.checkAcctUpdateData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    // const classifications = await util.buildClassificationList(); // Fetch classifications again
    // Get classification_id from the request (if applicable)
    const account_id = req.body.account_id || ''; // Adjust this based on your logic
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/update", {
            errors,
            title: "Edit Account",
            nav,
            account_firstname, account_lastname, account_email, account_id
            // inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inv_id,
            // classifications,
            // classification_id,
        })
        return;
    }
    next()
}

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.updateRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            // .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            // .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // on error this message is sent.

        // valid email is required and cannot already exist in the DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required.")
    ]
}

validate.validateChangePassword = () => {
    return [
        body("account_password")
            .trim()
            .notEmpty()
            .withMessage("New password is required.")
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password must be at least 12 characters long and include uppercase, lowercase, numbers, and symbols."),
    ];
};

/* ******************************
 * errors will be directed back to the view
 * ***************************** */
validate.checkPasswordUpdate = async (req, res, next) => {
    const { account_password } = req.body
    let errors = []
    errors = validationResult(req)
    // const classifications = await util.buildClassificationList(); // Fetch classifications again
    // Get classification_id from the request (if applicable)
    const account_id = req.body.account_id || ''; // Adjust this based on your logic
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/update", {
            errors,
            title: "Edit Account",
            nav,
            account_password, account_id,
            // inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inv_id,
            // classifications,
            // classification_id,
        })
        return;
    }
    next()
}

module.exports = validate;
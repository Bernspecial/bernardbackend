const utilities = require("../utilities/")
const account = require("../models/account-model")
const bcrypt = require("bcryptjs")


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    try {
        let nav = await utilities.getNav();
        let flashMessage = req.flash('notice'); // I am using connect-flash
        res.render("account/login", {
            title: "Login",
            nav,
            messages: { notice: flashMessage.length > 0 ? flashMessage[0] : null }, // Pass the message to the view
            errors: null
        });
    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
}


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    try {
        let nav = await utilities.getNav();
        let flashMessage = req.flash('notice'); // Assuming you're using connect-flash
        res.render("account/register", {
            title: "Join The Family",
            nav,
            messages: { notice: flashMessage.length > 0 ? flashMessage[0] : null }, // Pass the message to the view
            errors: null
        });
    } catch (error) {
        next(error);
    }
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }

    const regResult = await account.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        // res.status(201).render("account/login", {
        //     title: "Login",
        //     nav,
        // })
        return res.redirect("/account/login"); // Use redirect here
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        // res.status(501).render("account/register", {
        //     title: "Registration",
        //     nav,
        // })
        return res.redirect("/account/register"); // Use redirect here
    }
}

module.exports = { buildLogin, buildRegister, registerAccount }
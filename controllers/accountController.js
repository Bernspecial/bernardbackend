const utilities = require("../utilities/")
const multer = require("multer");
const path = require("path");
const account = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


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
    const { account_firstname, account_lastname, account_email, account_password, account_bio } = req.body

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
        hashedPassword,
        account_bio,
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
        // return
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

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await account.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password

            // Store user data in session
            req.session.user = {
                account_id: accountData.account_id,
                account_firstname: accountData.account_firstname,
                account_lastname: accountData.account_lastname,
                account_email: accountData.account_email,
                account_bio: accountData.account_bio,
                account_picture: accountData.account_picture,
                account_type: accountData.account_type,
            };

            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            return res.redirect("/account/")
        }
        else {
            req.flash("message notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
    }
}


/* ****************************************
*  Render account management view
* ************************************ */
async function accountManagement(req, res) {
    let nav = await utilities.getNav(); // Get navigation items
    let flashMessage = req.flash('notice');
    const user = req.session.user;
    console.log("User  account picture:", user);
    res.render('account/management', {
        title: 'Account Management',
        nav,
        messages: { notice: flashMessage.length > 0 ? flashMessage[0] : null }, // Pass the message to the view
        errors: null,
        user,
    });
}


/* ****************************************
*  This is used to restrict some users from accessing some part of the application if not logged in
* ************************************ */

// Middleware to check JWT and account type
const checkAdminAccess = (req, res, next) => {
    const token = req.cookies.jwt; // Assuming you're using cookies to store the JWT

    if (!token) {
        req.flash('notice', 'You must be logged in to access this page.');
        return res.redirect('/account/login'); // Redirect to login if no token
    }

    // Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            req.flash('notice', 'Invalid token. Please log in again.');
            return res.redirect('/account/login'); // Redirect to login if token is invalid
        }

        // Check account type
        const accountData = await account.getAccountByEmail(decoded.account_email); // Fetch user data from DB
        if (!accountData || (accountData.account_type !== 'Employee' && accountData.account_type !== 'Admin')) {
            req.flash('notice', 'You do not have permission to access this page.');
            return res.redirect('/account/login'); // Redirect to login if not authorized
        }

        // If everything is fine, attach user data to request and proceed
        req.session.user = accountData; // Store user data in session if needed
        next(); // Proceed to the next middleware or route handler
    });
};


/* ***************************
 *  Build update user account view
 * ************************** */
const editAccountView = async function (req, res, next) {
    const acct_id = parseInt(req.params.acct_id)
    let nav = await utilities.getNav()
    const accountData = await account.getAccountById(acct_id)
    // console.log('Item Data:', accountData);


    // I Checked if itemData is an array and access the first element
    const details = Array.isArray(accountData) ? accountData[0] : accountData;

    // I used the if statemnet to confirm if the vehicle is valid.
    if (!details) {
        return res.status(404).send('Item not found');
    }
    // const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)

    // After using the variable vehicle to confirm if the iemData is an array
    // then i used the vechicle result to display the inventory name.
    const accountName = `${details.account_firstname || 'Unknown firstname'} ${details.account_lastname || 'Unknown lastname'}`;
    let flashMessage = req.flash('notice'); // Assuming you're using connect-flash

    res.render("./account/update", {
        title: "Edit " + accountName,
        nav,
        messages: { notice: flashMessage.length > 0 ? flashMessage[0] : null }, // Pass the message to the view
        // classificationSelect: classificationSelect,
        errors: null,
        account_id: details.account_id, // Change this line to use vehicle.inv_id
        account_firstname: details.account_firstname,
        account_lastname: details.account_lastname,
        account_email: details.account_email,
        // account_password: details.account_password,
        // account_type: details.account_type,
    })
}

/* ***************************
 *  Update User Account
 * ************************** */
const updateAccount = async (req, res) => {
    let nav = await utilities.getNav()
    const { account_id, account_firstname, account_lastname, account_email } = req.body;

    console.log("Updating account with ID:", account_id);
    console.log("New data:", { account_firstname, account_lastname, account_email });

    const updateResult = await account.updateAcct(account_firstname, account_lastname, account_email, account_id)

    if (updateResult) {
        const itemName = `${account_firstname}`
        req.flash(
            "notice",
            `Congratulations, you\'ve updated ${itemName}.`
        )

        return res.redirect("/account/"); // Use redirect here
    } else {
        // const classificationSelect = await utilities.buildClassificationList(classification_id)
        const itemName = `${account_firstname}`
        req.flash("notice", "Sorry, the request failed.")
        res.status(501).render("./account/update", {
            title: "Edit  " + itemName,
            nav,
            // classificationSelect: classificationSelect,
            errors: null,
            account_id, account_firstname, account_lastname, account_email,
        })
        return
        // return res.redirect("inventory/add-inventory"); // Use redirect here
    }
}

const changePassword = async (req, res) => {
    const { account_id, account_password } = req.body;

    console.log("Updating account with ID:", account_id);
    console.log("New data:", { account_password });


    try {

        console.log("Received password change request for account ID:", account_id);

        const hashedPassword = await bcrypt.hash(account_password, 10);

        // Update the password in the database
        const updateResult = await account.updatePassword(hashedPassword, account_id);
        console.log("Update result:", updateResult);

        if (updateResult) {
            req.flash("notice", "Your password has been changed successfully.");
            return res.redirect("/account/"); // Redirect to the update page or account management
        } else {
            req.flash("notice", "Sorry, the password change failed. Please try again.");
            return res.redirect(`/account/update/${account_id}`);
        }
    } catch (error) {
        console.error("Error changing password:", error);
        req.flash("notice", "An error occurred while changing your password. Please try again.");
        return res.redirect(`/account/update/${account_id}`);
    }
};

/* ****************************************
*  Deliver image upload view
* *************************************** */
async function buildImageUpload(req, res, next) {
    const acct_id = parseInt(req.params.acct_id)
    let nav = await utilities.getNav()
    const accountData = await account.getAccountById(acct_id)
    // console.log('Item Data:', accountData);


    // I Checked if itemData is an array and access the first element
    const details = Array.isArray(accountData) ? accountData[0] : accountData;

    // I used the if statemnet to confirm if the vehicle is valid.
    if (!details) {
        return res.status(404).send('Item not found');
    }
    // const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)

    // After using the variable vehicle to confirm if the iemData is an array
    // then i used the vechicle result to display the inventory name.
    // const accountName = `${details.account_firstname || 'Unknown firstname'} ${details.account_lastname || 'Unknown lastname'}`;
    let flashMessage = req.flash('notice'); // Assuming you're using connect-flash

    res.render("./account/imageupload", {
        title: "Add Profile Picture",
        nav,
        messages: { notice: flashMessage.length > 0 ? flashMessage[0] : null }, // Pass the message to the view
        // classificationSelect: classificationSelect,
        errors: null,
        account_id: details.account_id, // Change this line to use vehicle.inv_id
        account_picture: details.account_picture,
        // account_lastname: details.account_lastname,
        // account_email: details.account_email,
        // account_password: details.account_password,
        // account_type: details.account_type,
    })
}


/* ****************************************
*  Handling the picture upload
* *************************************** */

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Directory to store uploaded images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the original filename
    },
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/; // Allowed file types
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb("Error: File type not supported");
        }
    },
}).single("profilePicture"); // Expecting a single file with the field name 'profilePicture'

// Route to handle profile picture upload
async function uploadProfilePicture(req, res) {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: "error", message: err.message });
        }

        const url = req.protocol + "://" + req.get("host");
        const profilePicturePath = req.file ? url + "/" + req.file.path : null;

        // Assuming you have a user ID in the request to update the user's profile
        const userId = req.session.user.account_id; // Get user ID from session

        try {
            await account.updateProfilePicture(userId, profilePicturePath); // Update the profile picture in the database

            // Update the session with the new profile picture
            req.session.user.account_picture = profilePicturePath;

            req.flash("notice", "Profile picture uploaded successfully.");
            return res.redirect("/account/"); // Redirect to account management page
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}


module.exports = {
    buildLogin, buildRegister, registerAccount, accountLogin,
    accountManagement, checkAdminAccess, editAccountView, updateAccount,
    changePassword, buildImageUpload, uploadProfilePicture, upload
}
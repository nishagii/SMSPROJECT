const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendgrid = require("@sendgrid/mail");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { start } = require("repl");
const { type } = require("os");
// const { default: Feedback } = require('../Frontend/src/Components/Feedback/Feedback');
require("dotenv").config();
// const Notification = require('./model/Notification');

const app = express();

// Middleware

// CORS configuration with FRONTEND_URL from .env
app.use(
    cors({
        origin: process.env.FRONTEND_URL, // Use environment variable
        credentials: true, // Allow credentials (cookies, session)
    })
);

app.use(
    session({
        secret: process.env.SESSION_SECRET, // Use environment variable
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: "mongodb://localhost:27017/signupDB",
            ttl: 1 * 24 * 60 * 60, // Session expiration time (1 days in seconds)
        }),
        cookie: {
            maxAge: 1 * 60 * 60 * 1000, // 1 hour
            httpOnly: true, // Ensure the cookie is only accessible by the server
            secure: false, // Set to true if using HTTPS
            sameSite: "lax", // Helps prevent CSRF attacks
        },
    })
);

// Parse JSON bodies before handling routes
app.use(express.json());

// Set the SendGrid API key from environment variables
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// mongoose.connect('mongodb://localhost:27017/SMSDB', {})
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('MongoDB connection error:', err));

mongoose
    .connect(process.env.MONGO_URI, {})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Session configuration

//collection for student
const Student = mongoose.model(
    "Student",
    new mongoose.Schema({
        sid: String,
        sname: String,
        mail: String,
        year: String,
        dept: String,
        mentor: String,
        user: String,
        rePass: String,
        image: String,
    })
);

//collection for mentor
const Mentor = mongoose.model(
    "Mentor",
    new mongoose.Schema({
        name: String,
        dept: String,
        mail: String,
        phone: String,
        user: String,
        pass1: String,
        image: String,
    })
);

// Collection for admin
const Admin = mongoose.model(
    "Admin",
    new mongoose.Schema({
        sname: String,
        mail: String,
        pass: String,
    })
);

// Collection for Resources
const Resource = mongoose.model(
    "Resource",
    new mongoose.Schema({
        mentorname: { type: String, required: true },
        batchyear: { type: String, required: true },
        description: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
    })
);

//collection for forgotpass
const Forgotpass = mongoose.model(
    "Forgotpass",
    new mongoose.Schema({
        email: { type: String, required: true, unique: true },
        resetToken: String,
        resetTokenExpiration: Date,
    })
);

//collection for calendar events
const Event = mongoose.model(
    "Event",
    new mongoose.Schema({
        id: String,
        title: String,
        start: Date,
        end: Date,
        allDay: { type: Boolean, default: false },
        name: String,
        role: String,
    })
);

//collection for calendar mentor events
const MentorEvent = mongoose.model(
    "MentorEvent",
    new mongoose.Schema({
        id: String,
        title: String,
        date: Date,
        start: String,
        end: String,
        mode: String,
        link: String,
        description: String,
        allDay: { type: Boolean, default: false },
        name: String,
        role: String,
    })
);

// collection for SessionInfo

const SessionInfo = mongoose.model(
    "SessionInfo",
    new mongoose.Schema({
        Department: { type: String, required: true },
        Mentor: { type: String, required: true },
        Year: { type: String, required: true },
        Index: { type: String, required: true },
        Date: { type: Date, required: true },
        SessionMode: { type: String, required: true },
        AdditionalNote: { type: String, required: false },
    })
);

//collection for Feedbacks

const Feedback = mongoose.model(
    "Feedback",
    new mongoose.Schema({
        Mentor: { type: String, required: true },
        Description: { type: String, required: true },
        Date: { type: Date, required: true },
    })
);

//endpoint for signup student
app.post("/api/signupStudent", async (req, res) => {
    const { sid, sname, mail, year, dept, mentor, rePass } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(rePass, 10);

        const newUser = new Student({
            sid,
            sname,
            mail,
            year,
            dept,
            mentor,
            rePass: hashedPassword,
        });
        await newUser.save();
        res.json({ success: true, message: "User registered successfully!" });
    } catch (error) {
        console.log("Error during signup:", error);
        res.status(500).json({
            success: false,
            message: "Error registering user.",
            error: error.message,
        });
    }
});

//end point for check  student mail
app.post("/api/check-user-student", async (req, res) => {
    const { mail } = req.body;

    try {
        const existingUser = await Student.findOne({ mail });
        if (existingUser) {
            return res
                .status(200)
                .json({ success: false, message: "Email already registered." });
        }
        return res
            .status(200)
            .json({ success: true, message: "Email available." });
    } catch (error) {
        console.log("Error while checking email.", error);
        res.status(500).json({
            success: false,
            message: "Error while checking email.",
            error: error.message,
        });
    }
});

//end point for check  mentor mail
app.post("/api/check-user-mentor", async (req, res) => {
    const { mail } = req.body;

    try {
        const existingUser = await Mentor.findOne({ mail });
        if (existingUser) {
            return res
                .status(200)
                .json({ success: false, message: "Email already registered." });
        }
        return res
            .status(200)
            .json({ success: true, message: "Email available." });
    } catch (error) {
        console.log("Error while checking Email.", error);
        res.status(500).json({
            success: false,
            message: "Error while checking Email.",
            error: error.message,
        });
    }
});

//end point for signup mentor
app.post("/api/signupMentor", async (req, res) => {
    const { name, dept, mail, phone, user, pass1 } = req.body;
    //  console.log('Request body:', req.body);
    try {
        const hashedPassword = await bcrypt.hash(pass1, 10);

        const newUser = new Mentor({
            name,
            dept,
            mail,
            phone,
            user,
            pass1: hashedPassword,
        });
        await newUser.save();
        res.json({ success: true, message: "User registered successfully!" });
    } catch (error) {
        console.log("Error during signup:", error);
        res.status(500).json({
            success: false,
            message: "Error registering user.",
            error: error.message,
        });
    }
});

// Login Route
app.post("/api/login", async (req, res) => {
    const { mail, password, role } = req.body;
    console.log(req.body);
    try {
        if (role === "Student") {
            const student = await Student.findOne({ mail });
            if (!student) {
                console.log("Email not found");
                return res
                    .status(404)
                    .json({ success: false, message: "Email not found" });
            }
            const isMatch = await bcrypt.compare(password, student.rePass);
            if (!isMatch) {
                console.log("Password not matched");
                return res
                    .status(500)
                    .json({ success: false, message: "Password not matched" });
            }

            req.session.user = {
                name: student.sname,
                email: student.mail,
                role: "Student",
            };
            console.log("Session User:", req.session.user);
            return res.status(200).json({
                success: true,
                role: "Student",
                message: "Login successful!",
            });
        }

        if (role === "Mentor") {
            const mentor = await Mentor.findOne({ mail });
            if (!mentor) {
                console.log("Email not found");
                return res
                    .status(404)
                    .json({ success: false, message: "Email not found" });
            }

            const isMatch = await bcrypt.compare(password, mentor.pass1);
            if (!isMatch) {
                console.log("Password not matched");
                return res
                    .status(500)
                    .json({ success: false, message: "Password not matched" });
            }

            req.session.user = {
                name: mentor.name,
                email: mentor.mail,
                role: "Mentor",
            };
            return res.status(200).json({
                success: true,
                message: "Login successful!",
                role: "Mentor",
            });
        }

        if (role === "Admin") {
            const admin = await Admin.findOne({ mail });
            if (!admin) {
                console.log("Email not found");
                return res
                    .status(404)
                    .json({ success: false, message: "Email not found" });
            }

            const isMatch = await bcrypt.compare(password, admin.pass);
            if (!isMatch) {
                console.log("Password not matched");
                return res
                    .status(500)
                    .json({ success: false, message: "Password not matched" });
            }

            req.session.user = {
                name: admin.sname,
                email: admin.mail,
                role: "Admin",
            };
            return res.status(200).json({
                success: true,
                message: "Login successful!",
                role: "Admin",
            });
        }
    } catch (error) {
        console.error("Error in login:", error.message); // This will log the error to the console
        res.status(500).json({ error: "Internal server error" });
    }
});

// SessionInfo Rout
app.post("/api/SessionInfo", async (req, res) => {
    try {
        const {
            Department,
            Mentor,
            Year,
            Index,
            Date,
            SessionMode,
            AdditionalNote,
        } = req.body;

        // Validate required fields
        if (
            !Department ||
            !Mentor ||
            !Year ||
            !Index ||
            !Date ||
            !SessionMode
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be filled!",
            });
        }

        // Create new session entry
        const newSession = new SessionInfo({
            Department,
            Mentor,
            Year,
            Index,
            Date,
            SessionMode,
            AdditionalNote: AdditionalNote || "", // Default to empty string if not provided
        });

        // Save to database
        await newSession.save();
        return res.status(201).json({
            success: true,
            message: "Session information stored successfully!",
        });
    } catch (error) {
        console.error("Error storing session info:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// Get current logged-in user (either mentor or student)
app.get("/api/dashboard", async (req, res) => {
    if (req.session.user) {
        const { email, role } = req.session.user;

        try {
            if (role === "Mentor") {
                // Return mentor-specific response
                const mentor = await Mentor.findOne({ mail: email });
                if (mentor) {
                    return res.json({
                        name: mentor.name,
                        email: mentor.mail,
                        role: "Mentor",
                        dept: mentor.dept,
                        phone: mentor.phone,
                    });
                } else {
                    return res.status(404).json({ error: "Mentor not found" });
                }
            } else if (role === "Student") {
                // Fetch student data including the mentor's name
                const student = await Student.findOne({ mail: email });
                if (student) {
                    return res.json({
                        name: student.sname,
                        sid: student.sid,
                        email: student.mail,
                        batchyear: student.year,
                        role: "Student",
                        mentor: student.mentor,
                        dept: student.dept,
                    });
                } else {
                    return res.status(404).json({ error: "Student not found" });
                }
            } else {
                return res.status(400).json({ error: "Invalid role" });
            }
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    } else {
        return res.status(401).json({ error: "No user logged in" });
    }
});

//check session route
app.get("/api/check-session", (req, res) => {
    if (req.session.user) {
        res.status(200).json({ isActive: true });
    } else {
        res.status(200).json({ isActive: false, message: "Session expired" });
    }
});

//logout route
app.post("/api/logout", async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Could not log out." });
        }
        res.clearCookie("connect.sid"); // Clear the session cookie
        res.status(200).json({ message: "Logged out successfully." });
    });
});

// Forgot password route
app.post("/api/forgot-password", async (req, res) => {
    const { mail } = req.body;
    console.log(req.body);
    let user;

    try {
        // Check if the email belongs to a Mentor or Student
        user =
            (await Mentor.findOne({ mail })) ||
            (await Student.findOne({ mail }));
        console.log(user);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        // Generate a reset token and expiration time
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpires = Date.now() + 3600000; // Token expires in 1 hour

        // Store the reset token and its expiration in the user's document
        let forgotPassRecord = await Forgotpass.findOne({ email: user.mail });
        console.log(forgotPassRecord);
        if (forgotPassRecord) {
            forgotPassRecord.resetToken = resetToken;
            forgotPassRecord.resetTokenExpiration = resetTokenExpires;
        } else {
            // Create a new Forgotpass document
            forgotPassRecord = new Forgotpass({
                email: user.mail,
                resetToken,
                resetTokenExpiration: resetTokenExpires,
            });
        }
        await forgotPassRecord.save();

        // Create the password reset link
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const msg = {
            to: user.mail,
            from: "studentmentoring.noreply@gmail.com",
            subject: `Password Reset Request for ${user.sname || user.name}`,

            html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
        };

        const response = await sendgrid.send(msg);
        console.log(response);
        res.json({ success: true, message: "Password reset email sent" });
    } catch (error) {
        console.error("Error sending email:", error);
        return res
            .status(500)
            .json({ success: false, message: "Error sending email" });
    }
});

app.post("/api/reset-password", async (req, res) => {
    const { token, repass } = req.body;

    try {
        // Find the reset token in the ForgotPass collection
        const resetRecord = await Forgotpass.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!resetRecord) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid or expired token" });
        }

        // Find the user by email (from the reset record)
        const student = await Student.findOne({ mail: resetRecord.email });
        const mentor = await Mentor.findOne({ mail: resetRecord.email });
        const hashedPassword = await bcrypt.hash(repass, 10);

        if (!student && !mentor) {
            return res.status(404).json({
                success: false,
                message: "User not found for the given email.",
            });
        }

        if (student) {
            // Update the user's password
            student.rePass = hashedPassword;
            await student.save();

            // Optionally, delete the reset token entry (cleanup)
            await Forgotpass.deleteOne({ resetToken: token });
        }

        if (mentor) {
            // Update the user's password
            mentor.pass1 = hashedPassword;
            await mentor.save();

            // Optionally, delete the reset token entry (cleanup)
            await Forgotpass.deleteOne({ resetToken: token });
        }

        res.status(200).json({
            success: true,
            message:
                "Password updated successfully! Now you can close this window and go back to the login page",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error resetting password",
            error,
        });
        console.log(error);
    }
});

//Admin endpoints

// get student by sid
app.get("/api/student/:_id", async (req, res) => {
    try {
        const { _id } = req.params;
        const student = await Student.findOne({ _id });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get mentor by id
app.get("/api/mentor/:_id", async (req, res) => {
    try {
        const { _id } = req.params;
        const student = await Mentor.findOne({ _id });

        if (!student) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// update students by id
// Update student by sid
app.put("/api/edit-student/:_id", async (req, res) => {
    try {
        const { _id } = req.params;
        const updates = req.body;

        const student = await Student.findOneAndUpdate(
            { _id },
            updates,
            { new: true } // Returns updated document
        );

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({
            success: true,
            message: "Student updated successfully",
            data: student,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating student",
            error: error.message,
        });
    }
});

// update mentor by id
app.put("/api/edit-mentor/:_id", async (req, res) => {
    try {
        const { _id } = req.params;
        const updates = req.body;

        const mentor = await Mentor.findOneAndUpdate(
            { _id },
            updates,
            { new: true } // Returns updated document
        );

        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        res.status(200).json({
            success: true,
            message: "Mentor updated successfully",
            data: mentor,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating Mentor",
            error: error.message,
        });
    }
});

// delete student by id
// Delete student by sid

app.delete("/api/delete-students/:_id", async (req, res) => {
    try {
        const { _id } = req.params;
        const student = await Student.findByIdAndDelete(_id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({
            success: true,
            message: "Student deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting student",
            error: error.message,
        });
    }
});

// delete mentor by id
// Delete mentor by mid
app.delete("/api/delete-mentor/:_id", async (req, res) => {
    try {
        const { _id } = req.params;
        const mentor = await Mentor.findByIdAndDelete(_id);

        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        res.status(200).json({
            success: true,
            message: "Mentor deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting Mentor",
            error: error.message,
        });
    }
});

// get all students
app.get("/api/students", async (req, res) => {
    // if (req.session.user) {
    try {
        const students = await Student.find(
            {},
            "sid sname mail year dept mentor"
        );
        res.status(200).json(students);
    } catch {
        res.status(500).json({ error: error.message });
    }
    // } else {
    //     res.status(200).json({ isActive: false, message: "Session expired" });
    // }
});

// get all mentors
app.get("/api/mentors", async (req, res) => {
    try {
        const mentors = await Mentor.find();
        res.status(200).json(mentors);
    } catch {
        res.status(500).json({ error: error.message });
    }
});

// Get Mentors to Student Sign up dashboard
app.get("/api/mentors", async (req, res) => {
    const department = req.query.department;
    try {
        const mentors = department
            ? await Mentor.find({ dept: department }, "name") // Filter by department if provided
            : await Mentor.find({}, "name"); // Otherwise, return all mentors
        res.status(200).json(mentors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Student by Mentor and Batch Year
app.get("/api/students", async (req, res) => {
    const { mentorName, batchyear } = req.query;
    // console.log('Mentor:', mentorName, 'Batch Year:', batchyear);  // Log to confirm the values

    try {
        const students = await Student.find({
            mentor: mentorName,
            year: batchyear,
        });
        // console.log(students);
        if (students.length === 0) {
            return res.status(404).json({
                message: "No student found for this mentor and batch year.",
            });
        }
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Set storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

// Initialize multer
const upload = multer({ storage });

// Route to serve satatic files from the 'uploads' folder
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Route to handle resource uploads
app.post("/api/uploadResource", upload.single("file"), async (req, res) => {
    const { mentorname, batchyear, description } = req.body;
    const fileUrl = req.file ? `/api/uploads/${req.file.filename}` : null;

    try {
        const newResource = new Resource({
            mentorname,
            batchyear,
            description,
            fileUrl,
        });

        await newResource.save();
        res.status(201).json({
            success: true,
            message: "Resource uploaded successfully",
            resource: newResource,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to upload resource" });
    }
});

// Route for updating the profile image of the student
app.post(
    "/api/update-student-image",
    upload.single("image"),
    async (req, res) => {
        const { mail } = req.body; // Get the user's email from the request body
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Get file URL

        try {
            const student = await Student.findOne({ mail });
            if (!student) {
                return res
                    .status(404)
                    .json({ success: false, message: "Student not found" });
            }
            if (student.image) {
                const oldImagePath = path.join(__dirname, student.image);
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error(
                            `Error deleting old image: ${err.message}`
                        );
                    } else {
                        console.log(
                            `Old image ${student.image} deleted successfully.`
                        );
                    }
                });
            }

            // Update student's image URL
            student.image = imageUrl; // Store the image URL in the database
            await student.save();

            res.status(200).json({
                success: true,
                message: "Profile image updated successfully!",
                image: imageUrl,
            });
        } catch (error) {
            console.error("Error updating profile image:", error);
            res.status(500).json({
                success: false,
                message: "Error updating profile image",
                error: error.message,
            });
        }
    }
);

// Route for updating the profile image of the mentor
app.post(
    "/api/update-mentor-image",
    upload.single("image"),
    async (req, res) => {
        const { mail } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Get file URL

        try {
            const mentor = await Mentor.findOne({ mail });
            if (!mentor) {
                return res
                    .status(404)
                    .json({ success: false, message: "Mentor not found" });
            }

            if (mentor.image) {
                const oldImagePath = path.join(__dirname, mentor.image);
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error(
                            `Error deleting old image: ${err.message}`
                        );
                    } else {
                        console.log(
                            `Old image ${mentor.image} deleted successfully.`
                        );
                    }
                });
            }

            // Update mentor's image URL
            mentor.image = imageUrl; // Store the image URL in the database
            await mentor.save();

            res.status(200).json({
                success: true,
                message: "Profile image updated successfully!",
                image: imageUrl,
            });
        } catch (error) {
            console.error("Error updating profile image:", error);
            res.status(500).json({
                success: false,
                message: "Error updating profile image",
                error: error.message,
            });
        }
    }
);

//Route to get image
app.get("/api/image", async (req, res) => {
    const { email, role } = req.query;

    if (role === "Student") {
        try {
            const student = await Student.findOne({ mail: email });
            if (!student) {
                return res
                    .status(404)
                    .json({ success: false, message: "Student not found" });
            }
            return res
                .status(200)
                .json({ success: true, image: student.image });
        } catch {}
    }

    if (role === "Mentor") {
        try {
            const mentor = await Mentor.findOne({ mail: email });
            if (!mentor) {
                return res
                    .status(404)
                    .json({ success: false, message: "Mentor not found" });
            }
            return res.status(200).json({ success: true, image: mentor.image });
        } catch {}
    }
});

//route to check if the image exists
app.get("/api/check-image", (req, res) => {
    const imagePath = path.join(__dirname, "uploads", req.query.image);

    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res
                .status(404)
                .json({ success: false, message: "Image not found" });
        }
        res.status(200).json({ success: true });
    });
});

//route to remove profile picture
app.delete("/api/delete-image", (req, res) => {
    const { image } = req.body; // Get the image filename or path from the request body

    if (!image) {
        return res
            .status(400)
            .json({ success: false, message: "No image specified" });
    }

    const imagePath = path.join(__dirname, "uploads", image); // Assuming your images are stored in the 'uploads' directory

    // Check if file exists
    if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
            if (err) {
                return res
                    .status(500)
                    .json({ success: false, message: "Error deleting image" });
            }
            return res
                .status(200)
                .json({ success: true, message: "Image deleted successfully" });
        });
    } else {
        return res
            .status(404)
            .json({ success: false, message: "Image not found" });
    }
});

app.put("/api/upload-profile", async (req, res) => {
    const { role, email, data } = req.body;

    if (role === "Student") {
        try {
            const student = await Student.findOne({ mail: email });

            if (!student) {
                return res
                    .status(404)
                    .json({ success: false, message: "Student not found" });
            }

            const allowedUpdates = {
                name: "sname",
                sid: "sid",
                email: "mail",
                batchyear: "year",
                mentor: "mentor",
                dept: "dept",
            };

            Object.keys(allowedUpdates).forEach((key) => {
                // Check if the frontend data contains a key from allowedUpdates
                if (data[key]) {
                    const field = allowedUpdates[key]; // Get the corresponding backend field name
                    student[field] = data[key]; // Update the student document with the new data
                }
            });

            await student.save();
            res.status(200).json({
                success: true,
                message: "Profile Uploaded Successfully",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error While Uploading Profile",
            });
            console.error("Error updating student profile:", error);
        }
    }

    if (role === "Mentor") {
        try {
            const mentor = await Mentor.findOne({ mail: email });

            if (!mentor) {
                return res
                    .status(404)
                    .json({ success: false, message: "Mentor not found" });
            }

            const allowedUpdates = {
                name: "name",
                email: "mail",
                dept: "dept",
                phone: "phone",
            };

            Object.keys(allowedUpdates).forEach((key) => {
                // Check if the frontend data contains a key from allowedUpdates
                if (data[key]) {
                    const field = allowedUpdates[key]; // Get the corresponding backend field name
                    mentor[field] = data[key]; // Update the student document with the new data
                }
            });

            await mentor.save();
            res.status(200).json({
                success: true,
                message: "Profile Uploaded Successfully",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error While Uploading Profile",
            });
            console.error("Error updating mentor profile:", error);
        }
    }
});

// Route to get resources by batch year and file type
app.get("/api/resourcesdash", async (req, res) => {
    const { mentorname, batchyear, type } = req.query;

    // console.log('Received batch:', batchyear, 'and type:', type);

    // Check if batchyear and type are arrays and get the first element if they are
    const actualBatchYear = Array.isArray(batchyear) ? batchyear[0] : batchyear;
    const actualType = Array.isArray(type) ? type[0] : type;

    const typeFilter = {
        pdf: /\.(pdf|jpeg|png)$/,
        video: /\.(mp4|mkv|webm)$/,
        audio: /\.(mp3|wav|mpeg)$/,
    };

    // Check if parameters are provided
    if (!actualBatchYear || !actualType) {
        return res
            .status(400)
            .json({ message: "Batch year and resource type are required." });
    }

    try {
        const resources = await Resource.find({
            mentorname: mentorname,
            batchyear: actualBatchYear,
            fileUrl: { $regex: typeFilter[actualType], $options: "i" },
        });

        if (resources.length === 0) {
            return res
                .status(404)
                .json({ message: "No resources found", success: false });
        }
        res.status(200).json(resources);
    } catch (error) {
        console.error("Error fetching resources from DB:", error);
        res.status(500).json({ error: "Failed to fetch resources" });
    }
});

//calendar events route
app.post("/api/events", async (req, res) => {
    const { id, title, start, end, role, name } = req.body;

    try {
        const event = new Event({ id, title, start, end, role, name });
        await event.save();
        res.status(200).json({ message: "Event added successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error adding event" });
    }
});

// mentor calendar events route
app.post("/api/mentor-events", async (req, res) => {
    const { id, title, date, start, end, mode, link, description, role, name } =
        req.body;

    try {
        const event = new MentorEvent({
            id,
            title,
            date,
            start,
            end,
            mode,
            link,
            description,
            role,
            name,
        });
        await event.save();
        res.status(200).json({ message: "Session added successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error adding session" });
    }
});

//route for get events
app.get("/api/get-events", async (req, res) => {
    const { role, name } = req.query;
    let mentorEvents = [];
    let studentEvents = [];

    try {
        if (role === "Student") {
            const student = await Student.findOne({ sname: name });
            if (!student) {
                return res
                    .status(404)
                    .json({ success: false, message: "Student not found" });
            }
            const mentorName = student.mentor;
            if (mentorName) {
                mentorEvents = await MentorEvent.find({
                    name: mentorName,
                    role: "Mentor",
                });
            }
            studentEvents = await Event.find({ role, name });
        } else if (role === "Mentor") {
            mentorEvents = await MentorEvent.find({ name, role });
        }

        console.log(studentEvents);
        console.log(mentorEvents);
        res.status(200).json({ studentEvents, mentorEvents });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// PUT route to update an event by ID
app.put("/api/events/:id/:role", async (req, res) => {
    const { id, role } = req.params;
    const updatedEvent = req.body;

    try {
        let event;
        if (role === "Student") {
            event = await Event.findByIdAndUpdate(id, updatedEvent, {
                new: true,
            });

            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }
            res.json({ message: "Event updated successfully", event: event });
        } else if (role === "Mentor") {
            event = await MentorEvent.findByIdAndUpdate(id, updatedEvent, {
                new: true,
            });

            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }

            res.json({ message: "Event updated successfully", event });
        }
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ message: "Error updating event" });
    }
});

// DELETE route to remove an event by ID
app.delete("/api/events/:id/:role", async (req, res) => {
    const { id, role } = req.params;

    try {
        if (role === "Student") {
            const deletedEvent = await Event.findByIdAndDelete(id);

            if (!deletedEvent) {
                return res.status(404).json({ message: "Event not found" });
            }

            res.json({
                message: "Event deleted successfully",
                event: deletedEvent,
            });
        } else if (role === "Mentor") {
            const deletedEvent = await MentorEvent.findByIdAndDelete(id);

            if (!deletedEvent) {
                return res.status(404).json({ message: "Event not found" });
            }

            res.json({
                message: "Event deleted successfully",
                event: deletedEvent,
            });
        }
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ message: "Error deleting event" });
    }
});

// notification system

app.get("/api/notifications", async (req, res) => {
    try {
        const notifications = await Notification.find({
            user: req.session.user._id,
            isRead: false,
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

app.post("/api/notifications/read", async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.session.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: "Notifications marked as read" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update notifications" });
    }
});

// Fetch mentors based on department
app.get("/api/mentors/:dept", async (req, res) => {
    const { dept } = req.params;

    try {
        const mentors = await Mentor.find({ dept: dept }, "name"); // Fetch mentors by department
        if (!mentors.length) {
            return res.status(404).json({ message: "No mentors found" });
        }
        res.json(mentors.map((mentor) => mentor.name)); // Return an array of mentor names
    } catch (error) {
        console.error("Error fetching mentors:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Fetch students based on batch year and mentor
app.get("/api/students/:year/:mentor", async (req, res) => {
    const { year, mentor } = req.params;

    console.log(`Fetching students for Batch Year: ${year}, Mentor: ${mentor}`); // Debug log

    try {
        // const students = await db.collection('Students').find({ year, mentor }).toArray();
        const students = await Student.find(
            { year, mentor },
            { sid: 1, _id: 0 }
        );

        console.log("Query result:", students); // Log query result

        if (!students || students.length === 0) {
            console.log("No students found");
            return res.status(200).json([]); // Return empty array instead of 404
        }

        const formattedStudents = students.map((student) => ({
            value: student.sid,
            label: student.sid,
        }));
        console.log(formattedStudents);

        res.json(formattedStudents);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// route for getting mentor data
app.get("/api/mentor-data", async (req, res) => {
    const { mentor } = req.query;
    try {
        const user = await Mentor.findOne({ name: mentor });
        console.log(user);
        if (user) {
            res.status(200).json({
                name: user.name,
                email: user.mail,
                dept: user.dept,
                phone: user.phone,
                image: user.image,
            });
        }
    } catch (err) {
        console.error("Error fetching mentor data", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// API Route to fetch session reports by year and month
app.get("/api/sessions", async (req, res) => {
    try {
        const { year, month, mentor } = req.query;

        if (!year || !month || !mentor) {
            return res
                .status(400)
                .json({ error: "Year, month and mentor are required." });
        }

        // Convert year and month to a date range
        const startDate = new Date(year, month - 1, 1); // First day of the month
        const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of the month

        const sessions = await SessionInfo.find({
            Date: { $gte: startDate, $lte: endDate },
            Mentor: mentor,
        });
        console.log(sessions);

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Provide session data into student dashboard
// app.get('/api/ongoing-sessions', async (req, res) => {
//   try {
//     const { batchyear } = req.query;

//     if (!batchyear) {
//       return res.status(400).json({ error: "Batch year is required."});
//     }

//     const sessions = await SessionInfo.find({ Year: batchyear});

//     res.json(sessions);
//   }catch (error) {
//     console.error("Error fetching ongoin sessions:", error);
//     res.status(500).json({ error: 'Internal server error'});
//   }
// });

// Update session details
app.put("/api/sessions/:id", async (req, res) => {
    try {
        const updatedSession = await SessionInfo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedSession) {
            return res.status(404).json({ message: "Session not found" });
        }
        res.json({
            message: "Session updated successfully",
            session: updatedSession,
        });
    } catch (error) {
        console.error("Error updating session:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Confirm session
app.get("/api/sessions/:id", async (req, res) => {
    try {
        const session = await SessionInfo.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        res.json(session);
    } catch (error) {
        console.error("Error fetching session details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//  remove a session report
app.delete("/api/sessions/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the session
        const deletedSession = await SessionInfo.findByIdAndDelete(id);

        if (!deletedSession) {
            return res
                .status(404)
                .json({ message: "Session report not found" });
        }

        res.status(200).json({
            message: "Session report deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting session report:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/api/feedback", async (req, res) => {
    try {
        const { mentorName, description, date } = req.body;

        const newFeedback = new Feedback({
            Mentor: mentorName,
            Description: description,
            Date: date,
        });
        await newFeedback.save();
        res.status(200).json({
            success: true,
            message: "Feedback submitted successfully!",
        });
    } catch (error) {
        console.log("Error during feedback submitting:", error);
        res.status(500).json({
            success: false,
            message: "Error submitting feedback.",
            error: error.message,
        });
    }
});

app.get("/api/get-feedbacks", async (req, res) => {
    try {
        const { year, month } = req.query;

        const startDate = new Date(year, month - 1, 1); // First day of the month
        const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of the month

        const feedbacks = await Feedback.find({
            Date: { $gte: startDate, $lte: endDate },
        });
        res.status(200).json(feedbacks);
    } catch (error) {}
});

app.delete("/api/delete-feedback", async (req, res) => {
    try {
        const { id } = req.body;

        if (!Array.isArray(id)) {
            const deletedFeedback = await Feedback.findByIdAndDelete(id);
            if (!deletedFeedback) {
                res.status(400).json({
                    success: false,
                    message: "Feedback not found",
                });
            }
            res.status(200).json({
                success: true,
                message: "Feedback deleted successfully!",
            });
        } else if (Array.isArray(id)) {
            const deletedFeedbacks = await Feedback.deleteMany({
                _id: { $in: id },
            });
            if (!deletedFeedbacks) {
                res.status(400).json({
                    success: false,
                    message: "Feedbacks not found",
                });
            }
            console.log(deletedFeedbacks);
            res.status(200).json({
                success: true,
                message: "Feedbacks deleted successfully!",
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting feedbacks",
            error: error.message,
        });
    }
});

// fetch session report details to update the form
app.get("/api/sessions/:id", async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: "Error fetching session" });
    }
});

// Update the session by id
app.put("/api/sessions/:id", async (req, res) => {
    try {
        const sessionId = req.params.id;
        const updatedData = req.body;

        // Find the session by ID and update it with the new data
        const updatedSession = await Session.findByIdAndUpdate(
            sessionId,
            updatedData,
            { new: true }
        );

        if (!updatedSession) {
            return res.status(404).json({ message: "Session not found" });
        }

        res.status(200).json(updatedSession); // Return the updated session
    } catch (error) {
        console.error("Error updating session:", error);
        res.status(500).json({ message: "Error updating session" });
    }
});

// Start the server
const port = process.env.PORT1 || 5001;
app.listen(port, () => console.log(`Server running on port ${port}`));

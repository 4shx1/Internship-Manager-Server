const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors());





app.use(
    cors({

        origin: '*',
        credentials: true,
    })
);





// Connect to MongoDB
mongoose.connect('mongodb+srv://internship:mbits111@cluster0.rnsokk3.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));





// Define the user schema
const userSchema = new mongoose.Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    course: String,
    gender: String,
    phone: String,
    email: String,
    password: String,
    address: String,
    qualification: String,
});






// Define the company schema
const companySchema = new mongoose.Schema({
    id: String,
    name: String,
    profile: String,
    email: String,
    location: String,
    password: String,
    username: String,
    website: String,
    number: String,
    date: Date,
});






// Define the internship schema
const internshipSchema = new mongoose.Schema({
    id: String,
    name: String,
    description: String,
    qualification: String,
    duration: String,
    stipend: String,
    postedOn: Date,
    lastDate: Date,
    companyName: String,
    facultyName: String,
    email: String,
    username: String,
    password: String,
    // Add reviews field to store reviews for the internship
    reviews: [
        {
            rating: Number,
            comment: String,
            user: String,
        },
    ],
});


// Define Application schema
const applicationSchema = new mongoose.Schema({
    applicationId: String,
    companyId: String,
    userEmail: String,
    userName: String,
    userQualification: String,
    applicationStatus: {
        type: String,
        enum: ['applied', 'approved', 'denied', 'Enrolled'],
        default: 'applied',
    },
});



// Create user, company,Application and internship models
const User = mongoose.model('User', userSchema);
const Company = mongoose.model('Company', companySchema);
const Internship = mongoose.model('Internship', internshipSchema);
const Application = mongoose.model('Application', applicationSchema);







//number of users
app.get('/stats', async (req, res) => {
    try {
        const companiesCount = await Company.countDocuments();
        const internshipsCount = await Internship.countDocuments();
        const studentsCount = await User.countDocuments();

        res.status(200).json({
            companies: companiesCount,
            internships: internshipsCount,
            students: studentsCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});






//list of all companies 

app.get('/companies', async (req, res) => {
    try {
        const companies = await Company.find({}, 'name');
        res.status(200).json(companies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/allcompanies', async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json(companies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//get Companies by id
// app.get('/companies/:id', async (req, res) => {
//     const {companyId} = req.params;

//     try {
//         const company = await Company.findOne({companyId});

//         if (!company) {
//             return res.status(404).json({ message: 'Company not found' });
//         }

//         res.status(200).json(company);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });



// Submit a review for an internship
app.post('/internships/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, user } = req.body;

        // Find the internship by ID
        const internship = await Internship.findOne({ id });


        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        // Add the review to the internship
        internship.reviews.push({ rating, comment, user });

        // Save the updated internship
        await internship.save();

        res.status(201).json({ message: 'Review submitted successfully' }); ``
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});






// Get all reviews for a specific internship
app.get('/internships/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the internship by ID
        const internship = await Internship.findById(id);

        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        // Retrieve the reviews for the internship
        const reviews = internship.reviews;

        res.status(200).json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});





// Get average review rating for a specific internship
app.get('/internships/:id/average-review', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the internship by user-generated ID
        const internship = await Internship.findOne({ id });

        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        // Retrieve the reviews for the internship
        const reviews = internship.reviews;

        if (reviews.length === 0) {
            return res.status(200).json({ averageRating: 0 });
        }

        // Calculate the average review rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        res.status(200).json({ averageRating });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/internships/:id/average-review', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the internship by user-generated ID
        const internship = await Internship.findOne({ id: id });

        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        // Retrieve the reviews for the internship
        const reviews = internship.reviews;

        if (reviews.length === 0) {
            return res.status(200).json({ averageRating: 0 });
        }

        // Calculate the average review rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        res.status(200).json({ averageRating });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});








// User login endpoint
app.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }


        res.status(200).json({ message: 'User logged in successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});






// Company login endpoint
app.post('/companies/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the company by email
        const company = await Company.findOne({ email });

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, company.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }


        res.status(200).json({ message: 'Company logged in successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});





// Get company data based on session's id
app.get('/companies/:id', async (req, res) => {
    try {

        const { id } = req.params;

        const company = await Company.findOne({ id });

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.status(200).json(company);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Get company data based on session's email
// app.get('/companies/:email', async (req, res) => {
//     try {
//         const { email } = req.params;

//         const company = await Company.findOne({ email });

//         if (!company) {
//             return res.status(404).json({ message: 'Company not found' });
//         }

//         return res.status(200).json(company);
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// });

app.post('/companies/details', async (req, res) => {
    try {
        const { email } = req.body;

        const company = await Company.findOne({ email });

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        return res.status(200).json(company);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});







// Get user data based on email endpoint
app.get('/users/:email', async (req, res) => {
    try {
        const { email } = req.params;
        // Find the user by email
        const user = await User.findOne({ email });
        console.log(user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});





// Fetch internships by email endpoint
app.get('/internships/:email', async (req, res) => {
    try {
        const { email } = req.params;


        const internships = await Internship.find({ email });

        res.status(200).json(internships);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/:email/internships', async (req, res) => {
    try {
        const { email } = req.params;

        // Find internships with matching email
        const internships = await Internship.find({ email });

        // Extract names from internships
        const internshipNames = internships.map((internship) => internship.name);

        res.json(internshipNames);
    } catch (error) {
        console.error('Error fetching internships:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//+++++++++++++++++fetch interships using id +++++++++++++++++++

app.post('/internships/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(req.params);
        // You can also access the request body using req.body

        const internship = await Internship.findOne({ id });

        if (!internship) {
            console.log('Invalid ID:', id);
            return res.status(404).json({ message: 'Internship not found' });
        }

        console.log('internship:', internship);
        res.status(200).json(internship);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Define route for posting an application
app.post('/applications', (req, res) => {
    const {
        companyId,
        userEmail,
        applicationStatus,
    } = req.body;

    const applicationId = uuidv4();

    const newApplication = new Application({
        applicationId,
        companyId,
        userEmail,
        applicationStatus,
    });
    console.log(newApplication);
    newApplication
        .save()
        .then((application) => res.json(application))
        .catch((err) => console.log(err));
});


// Update application status
app.patch('/applications/:applicationId', (req, res) => {
    const { applicationId } = req.params;
    const { applicationStatus } = req.body;

    Application.findByIdAndUpdate(
        applicationId,
        { applicationStatus },
        { new: true }
    )
        .then((updatedApplication) => res.json(updatedApplication))
        .catch((err) => console.log(err));
});


// Define route for fetching applications by company ID
app.get('/applications/:companyId', (req, res) => {
    const { companyId } = req.params;

    Application.find({ companyId })
        .then((applications) => res.json(applications))
        .catch((err) => console.log(err));
});

// User registration endpoint
app.post('/users', async (req, res) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            course,
            gender,
            phone,
            email,
            password,
            address,
            qualification,
        } = req.body;

        // Encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({
            firstName,
            middleName,
            lastName,
            course,
            gender,
            phone,
            email,
            password: hashedPassword,
            address,
            qualification,
        });

        // Save the user to the database
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




// Company registration endpoint
app.post('/companies', async (req, res) => {
    try {
        const {
            name,
            profile,
            email,
            location,
            password,
            username,
            website,
            number,
            date,
        } = req.body;

        // Generate a random unique ID for the internship
        const id = uuidv4();

        // Encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new company instance
        const newCompany = new Company({
            id,
            name,
            profile,
            email,
            location,
            password: hashedPassword,
            username,
            website,
            number,
            date,
        });

        // Save the company to the database
        await newCompany.save();

        res.status(201).json({ message: 'Company registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});






// Internship creation endpoint
app.post('/internships', async (req, res) => {
    try {
        const {
            name,
            description,
            qualification,
            duration,
            stipend,
            lastDate,
            companyName,
            facultyName,
            email,
            username,
            password,
        } = req.body;

        // Generate a random unique ID for the internship
        const id = uuidv4();

        // Encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new internship instance
        const newInternship = new Internship({
            id,
            name,
            description,
            qualification,
            duration,
            stipend,
            postedOn: new Date(),
            lastDate: new Date(lastDate),
            companyName,
            facultyName,
            email,
            username,
            password: hashedPassword,
        });

        // Save the internship to the database
        await newInternship.save();

        res.status(201).json({ message: 'Internship created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//[[[[[[[[[[[[== INTERNSHIPS BASED ON QUALIFICATION ==]]]]]]]]]]]]

app.get('/internships/:qualification', async (req, res) => {
    try {
        const { qualification } = req.params;

        // Find internships with matching qualification
        const internships = await Internship.find({ qualification });

        res.json(internships);
    } catch (error) {
        console.error('Error fetching internships:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//============Reviews===================


//-------api for averager reviews-------------
app.get('/api/reviews/average', (req, res) => {
    Review.aggregate([
        { $group: { id: null, averageRating: { $avg: '$rating' } } }
    ])
        .then((result) => {
            if (result.length > 0) {
                const averageRating = result[0].averageRating;
                res.json({ averageRating });
            } else {
                res.json({ averageRating: 0 });
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({ error: 'Failed to fetch average rating' });
        });
});







//---------------api to fetch all review data------------------
app.get('/api/reviews', (req, res) => {
    Review.find()
        .populate('user', 'firstName lastName')
        .then((reviews) => {
            Review.aggregate([
                { $group: { id: null, averageRating: { $avg: '$rating' } } }
            ])
                .then((result) => {
                    const averageRating = result.length > 0 ? result[0].averageRating : 0;
                    res.json({ reviews, averageRating });
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).json({ error: 'Failed to fetch average rating' });
                });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({ error: 'Failed to fetch reviews' });
        });
});


//--------------------api to accept user reviews--------------------
app.post('/api/reviews', (req, res) => {
    const { comment, rating } = req.body;

    const review = new Review({
        user: req.user.id, // Assuming user is authenticated and the user's ID is available in req.user.id
        comment,
        rating
    });

    review
        .save()
        .then((savedReview) => {
            res.json(savedReview);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({ error: 'Failed to save review' });
        });
});


// Get all internships endpoint

app.get('/internships', async (req, res) => {
    try {
        // Retrieve all internships from the database
        const internships = await Internship.find();

        res.status(200).json(internships);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.get('/internships/search', async (req, res) => {
    try {
        const { name } = req.query;

        // Search for internships by name
        const internships = await Internship.find({
            companyName: { $regex: new RegExp(name, 'i') },
        });

        if (internships.length > 0) {
            console.log(internships);
            res.status(200).json(internships);
        } else {
            res.status(404).json({ message: 'Internship not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


const portNumber = 3005;

// Start the server
app.listen(portNumber, () => {
    console.log(`Server is running on port ${portNumber}`);
});

/*********************************************************************************
* WEB700 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Sagar Thapa Student_ID: 153855234 Date: 8/3/2024
*
********************************************************************************/
import {
    initialize,
    sequelize,
    getAllStudents,
    getStudentByCourse,
    getStudentByNum,
    getTAs,
    getCourses,
    getCourseById,
    addStudent,
    updateStudent,
    addCourse,
    updateCourse,
    deleteCourseById,
    deleteStudentByNum,
} from './modules/collegeData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var HTTP_PORT = process.env.PORT || 8000;
import express from 'express';
import cors from 'cors'
import {create} from 'express-handlebars';
import path from "path";
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const hbs = create({
    layoutsDir : __dirname + '/views/layouts'
});
var app = express();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', [path.join(__dirname, '/views/'),path.join(__dirname, '/views/courses'),path.join(__dirname, '/views/students')]);
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());



// Initializing Web Server
initialize()
    .then(() => {
        console.log("Starting...")
        app.listen(HTTP_PORT, ()=> {console.log("Server listening on port "+ HTTP_PORT)});
    })
    .catch((err) => {
        console.error(err);
    });

// Calling sequelize to esablish database connection
sequelize.authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });


// Routes Start
// Homepage Route
app.get("/", (req, res) => {
    res.render('home');
});

// About Page Route
app.get("/about", (req, res) => {
    res.render('about');
});

// Demo Route
app.get("/student", (req, res) => {
    res.render('addStudent');
});

app.get("/course", (req, res) => {
    res.render('addCourse');
});



// Student Routes Start
app.get("/students", (req, res) => {
    if (req.query.course) {
        getStudentByCourse(req.query.course)
            .then((students) => {
                res.render('student',{course: course});
            })
            .catch((err) => {
                res.json({ message: err });
            });
    } else {
        getAllStudents()
            .then((students) => {
                console.log(`server.js/students: ${students}`)
                res.render('student',{ viewData: students});
            })
            .catch((err) => {
                res.json({ message: "No results" });
            });
    }
});

app.get("/tas", (req, res) => {
    getTAs()
        .then((tas) => {
            res.render('student',{ viewData: tas});;
        })
        .catch((err) => {
            res.json({ message: "No results" });
        });
});



app.get("/student/:studentNum", (req, res) => {
    let viewData = {};
    getStudentByNum(req.params.studentNum).then((data) => {
        if (data) {
            viewData.student = data;
        } else {
            viewData.student = null;
        }
    }).catch(() => {
        viewData.student = null;
    }).then(getCourses)
    .then((data) => {
        viewData.courses = data;

        for (let i = 0; i < viewData.courses.length; i++) {
            if (viewData.courses[i].courseId == viewData.student.course) {
                viewData.courses[i].selected = true;
            }
        }
    }).catch(() => {
        viewData.courses = [];
    }).then(() => {
        if (viewData.student == null) {
            res.status(404).send("Student Not Found");
        } else {
            res.render("student", { viewData: viewData });
        }
    });
});

app.get('/student/add', (req, res) => {
    getCourses().then((data) => {
        res.render("addStudent",{courses:data})
    }).catch((err) => {
        console.log(err)
        res.render("addStudent", { courses: [err] });
    });
});


app.post('/student/add', (req, res) => {

    addStudent(req.body).then(() => {
        res.redirect('/students');
    }).catch((err) => {
        console.log(err);
    });
});

app.post('/student/update', (req, res) => {
    updateStudent(req.body).then(() => {
        res.redirect('/students');
    }).catch((err) => {
        res.status(500).send("Unable to update course");
    });
});

app.get('/student/delete/:num', (req, res) => {
    deleteStudentByNum(req.params.num).then(() => {
        res.redirect('/students');
    }).catch((err) => {
        res.status(500).send("Unable to remove course");
    });
});

// Student Routes End


// Courses Route Start

// GET all courses
app.get('/courses', (req,res) =>{
    getCourses().then((data) => {
        res.render('course_card',{courses : data})
    }).catch(err => {
        res.render("students",{ message: "no results" });
    })
});

app.get('/course/:id', (req, res) => {
    let id = req.params.id
    let course = getCourseById(id);
    getCourseById(id).then(data => {
        res.render('addCourse',{id : id, course:course});
    }).catch(err => {
        res.json({ message: err });
    });
});

//Get Add Courses
app.get('/course/add', (req, res) => {
    res.render('addCourse');
});

//Post Add Courses 
app.post('/course/add', (req, res) => {
    addCourse(req.body).then(() => {
        res.redirect('/courses');
    }).catch((err) => {
        res.status(500).send("Unable to add course");
    });
});

// Update Course Route 
app.post('/course/update', (req, res) => {
    let course = req.body;
    updateCourse(req.body).then(() => {
        res.redirect(`/course/${course.courseId}`);
    }).catch((err) => {
        res.status(500).send("Unable to update course");
    });
});

// Delete Course Route
app.get('/course/delete/:id', (req, res) => {
    deleteCourseById(req.params.id).then(() => {
        res.redirect('/courses');
    }).catch((err) => {
        res.status(500).send("Unable to remove course");
    });
});

// Course Route End




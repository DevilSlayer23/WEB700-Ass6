
import path from 'path';
import { fileURLToPath } from 'url';
import { PGDATABASE, PGHOST, PGUSER, PGPASSWORD } from '../credentials.js';

// Use import.meta.url to get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { Sequelize } from 'sequelize';
var sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
    host: PGHOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
  
    ssl: { rejectUnauthorized: false }
    },
    query:{ raw: true }
});


var Student = sequelize.define('Student', {
  studentNum: Sequelize.INTEGER,
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressProvince: Sequelize.STRING,
  TA: Sequelize.BOOLEAN,
  status: Sequelize.STRING,

});

var Course = sequelize.define('Course',{
  courseId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseCode: {
    type: Sequelize.STRING,
    allowNull: false
  },
  courseDescription: {
    type: Sequelize.STRING,
    allowNull: true
  }
  
});
Course.hasMany(Student, {foreignKey: 'course'});


function initialize(title, description){
    return new Promise((resolve, reject) => {
    sequelize.sync().then(() => {
        
        resolve();
    }).catch((err) => {
        reject("unable to sync the database");
    });
});

}
function getAllStudents() {
  return new Promise((resolve, reject) => {
      Student.findAll().then((data) => {
        // console.log(data)
          resolve(data);
      }).catch((err) => {
          reject("no results returned");
      });
  });
};

function getTAs() {
  return new Promise((resolve, reject) => {
      Student.findAll({
          where: {
              TA: true
          }
      }).then((data) => {
          resolve(data);
      }).catch((err) => {
          reject("no results returned");
      });
  });
};


function getStudentByCourse(course) {
  return new Promise((resolve, reject) => {
    Student.findAll({ where: { course: course } }).then((data) => {
        resolve(data);
    }).catch((err) => {
        reject("no results returned");
    });
  });
};

function getStudentByNum(num) {
  return new Promise((resolve, reject) => {
    Student.findAll({ where: { studentNum: num } }).then((data) => {
      resolve(data[0]);
  }).catch((err) => {
      reject("no results returned");
  });
  });
};

function deleteStudentByNum(studentNum) {
  return new Promise((resolve, reject) => {
      Student.destroy({
          where: { studentNum: studentNum }
      }).then(() => {
          resolve();
      }).catch((err) => {
          reject("unable to remove student / student not found");
      });
  });
};


function getCourses() {
  return new Promise((resolve, reject) => {
    Course.findAll().then((data) => {
        resolve(data);
    }).catch((err) => {
        reject("no results returned");
    });
  });
};

function getCourseById(id) {
  return new Promise((resolve, reject) => {
    Course.findAll({ where: { courseId: id } }).then((data) => {
      resolve(data);
  }).catch((err) => {
      reject("no results returned");
  });
  });
};

function addStudent(studentData) { 
  console.log(studentData)
  studentData.TA = (studentData.TA != null) ? true : false;
  for (var prop in studentData) {
      if (studentData[prop] === "") studentData[prop] = null;
  }

  return new Promise((resolve, reject) => {
      Student.create(studentData).then(() => {
          resolve();
      }).catch((err) => {
          reject("unable to create student");
      });
  });
 
};

function updateStudent(studentData) {
  studentData.TA = (studentData.TA) ? true : false;
  for (var prop in studentData) {
      if (studentData[prop] === "") studentData[prop] = null;
  }

  return new Promise((resolve, reject) => {
      Student.update(studentData, {
          where: { studentNum: studentData.studentNum }
      }).then(() => {
          resolve();
      }).catch((err) => {
          reject("unable to update student");
      });
  });
};

function addCourse(courseData) {
  for (var prop in courseData) {
      if (courseData[prop] === "") courseData[prop] = null;
  }

  return new Promise((resolve, reject) => {
      Course.create(courseData).then(() => {
          resolve(courseData);
      }).catch((err) => {
          reject("unable to create course");
      });
  });
};

function updateCourse(courseData) {
  for (var prop in courseData) {
      if (courseData[prop] === "") courseData[prop] = null;
  }

  return new Promise((resolve, reject) => {
      Course.update(courseData, {
          where: { courseId: courseData.courseId }
      }).then(() => {
          resolve();
      }).catch((err) => {
          reject("unable to update course");
      });
  });
};

function deleteCourseById(id) {
  return new Promise((resolve, reject) => {
      Course.destroy({
          where: { courseId: id }
      }).then(() => {
          resolve();
      }).catch((err) => {
          reject("unable to delete course");
      });
  });
};



export {
  initialize,
  getAllStudents,
  getStudentByCourse,
  getStudentByNum,
  getTAs,
  getCourses,
  getCourseById,
  addStudent,
  updateStudent,
  deleteStudentByNum,
  addCourse,
  updateCourse,
  deleteCourseById,
  sequelize,
}

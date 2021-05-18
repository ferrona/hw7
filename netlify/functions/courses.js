// Goal: Kellogg course reviews API!
//
// Business logic:
// - Courses can be taught by more than one lecturer (e.g. Brian Eng's KIEI-451 and Ben Block's KIEI-451)
// - Information on a course includes the course number (KIEI-451) and name (Intro to Software Development)
// - Lecturers can teach more than one course (e.g. Brian Eng teaches KIEI-451 and KIEI-925)
// - Reviews can be written (anonymously) about the lecturer/course combination (what would that be called?)
// - Reviews contain a String body, and a numeric rating from 1-5
// - Keep it simple and ignore things like multiple course offerings and quarters; assume reviews are written
//   about the lecturer/course combination only – also ignore the concept of a "user" and assume reviews
//   are written anonymously
//
// Tasks:
// - (Lab) Think about and write the domain model - fill in the blanks below
// - (Lab) Build the domain model and some sample data using Firebase
// - (Lab) Write an API endpoint, using this lambda function, that accepts a course number and returns 
//   information on the course and who teaches it
// - (Homework) Provide reviews of the lecturer/course combinations 
// - (Homework) As part of the returned API, provide the total number of reviews and the average rating for 
//   BOTH the lecturer/course combination and the course as a whole.

// === Domain model - fill in the blanks ===
// There are 4 models: course, lecturers, sections, reviews
// There is one many-to-many relationship: course <-> lecturers, which translates to two one-to-many relationships:
// - One-to-many: course -> sections
// - One-to-many: lecturers -> sections
// And one more one-to-many: sections -> reviews
// Therefore:
// - The first model, course, contains the following fields: courseNumber, name
// - The second model, lecturers, contains the following fields: name
// - The third model, sections, contains the following fields: courseId, lecturerId
// - The fourth model, reviews, contains the following fields, sectionId, body, rating

// allows us to use firebase
let firebase = require(`./firebase`)

// /.netlify/functions/courses?courseNumber=KIEI-451
exports.handler = async function(event) {

  // get the course number being requested
  let courseNumber = event.queryStringParameters.courseNumber

  // establish a connection to firebase in memory
  let db = firebase.firestore()

  // ask Firebase for the course that corresponds to the course number, wait for the response
  let courseQuery = await db.collection('courses').where(`courseNum`, `==`, courseNumber).get()

  // get the first document from the query
  let course = courseQuery.docs[0]

  // get the id from the document
  let courseId = course.id

  // get the data from the document
  let courseData = course.data()

  // create an object with the course data to hold the return value from our lambda
  let returnValue = {
    courseNumber: courseData.courseNum,
    name: courseData.courseName,
  }

  // set a new Array as part of the return value
  returnValue.sections = []

  // ask Firebase for the sections corresponding to the Document ID of the course, wait for the response
  let sectionsQuery = await db.collection('sections').where(`courseID`, `==`, courseId).get()

  // get the documents from the query
  let sections = sectionsQuery.docs

  // set a new object as a part of the return value that sum the number of ratings in each course
  returnValue.courseTotalReviews = 0

  // create an object that sums the total rating of each course
  let ratingTotal = 0

  // loop through the documents
  for (let i=0; i < sections.length; i++) {
    // get the document ID of the section
    let sectionId = sections[i].id

    // get the data from the section
    let sectionData = sections[i].data()
    
    // create an Object to be added to the return value of our lambda
    let sectionObject = {
      review: []
    }

    // ask Firebase for the lecturer with the ID provided by the section; hint: read "Retrieve One Document (when you know the Document ID)" in the reference
    let lecturerQuery = await db.collection('lecturers').doc(sectionData.lectID).get()

    // get the data from the returned document
    let lecturer = lecturerQuery.data()

    // add the lecturer's name to the section Object
    sectionObject.lecturerName = lecturer.lectName

    // 🔥 your code for the reviews/ratings goes here

    // ask Firebase for the review with the ID provided by the section
    let reviewQuery = await db.collection('reviews').where(`sectionID`, `==`, sectionId).get()

    // get the documents from the query
    let review = reviewQuery.docs

    // create a new variable that sum the rating
    let sumRating = 0

    // add total number of reviews to course total
    returnValue.courseTotalReviews += review.length

    // loop through the documents
    for (let j=0; j < review.length; j++) {

    // get the document ID of the reviews
    let reviewId = review[j].id

    // get the data from the review
    let reviewData = review[j].data()

    // create an Object to be added to the return value of our lambda
    let reviewObject = {}
    
    // add the number of rating per section
    sectionObject.ratingNumberPerSection = review.length

    // sum all the ratings within each section
    sumRating = sumRating + reviewData.rating

    // return the average rating that equals to the sum of all ratings to the number of rating per section
    sectionObject.averageRating = sumRating/review.length

    // add the reviews to the review object
    reviewObject.comment = reviewData.comment
    reviewObject.rating = reviewData.rating

    // add the review object to the return value
    sectionObject.review.push(reviewObject)

    // add the ratings of all sections
    ratingTotal += reviewObject.rating

    // return the average rating that equals to the the total rating divided by the total number of reviews
    returnValue.averageRating = ratingTotal/returnValue.courseTotalReviews

    }
    
    // add the section Object to the return value
    returnValue.sections.push(sectionObject)
  }

  // return the standard response
  return {
    statusCode: 200,
    body: JSON.stringify(returnValue)
  }
}

wconst FIELD = require('./fields.js')

module.exports = {
  byCourse: (data) => {
    return data.reduce((courses, row) => {
      var course = courses[row[FIELD.ACTIVITAT_ID] || {}] || {
        idActivitat: row[FIELD.ACTIVITAT_ID],
        nomActivitat: row[FIELD.ACTIVITAT_NOM],
        alumnes: []
      };
      course.alumnes.push(row)
      courses[row[FIELD.ACTIVITAT_ID]] = course;
      return courses;
    }, {})

  }
}
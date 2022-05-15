const axios = require('axios').default;
const url = require('url');
const FIELD = require('./fields.js')
const COLUMNAS_INSCRIPCIONES = require('./columnas.js');
const COLUMNAS_PROFESORES = require('./columnas_prof.js');

const URL = 'https://asociacionavast.playoffinformatica.com/api.php/api/v1.0/llistats/consulta';
const URL_LOGIN = 'https://asociacionavast.playoffinformatica.com/FormLogin.php';





const Playoff = module.exports = {

  query: async function(bearer, columnas) {
    var result = await axios({
      url: URL,
      headers: {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "es-ES,es;q=0.9,en;q=0.8,en-US;q=0.7",
        "authorization": "Bearer " + bearer
      },
      "data": columnas,
      "method": "POST"
    });
    return result.data.data;
  },
  
  inscripciones: async function(bearer){
    return Playoff.query(bearer, COLUMNAS_INSCRIPCIONES.columnas)
  },

  profesores: async function(bearer){
    return Playoff.query(bearer, COLUMNAS_PROFESORES.columnas)
  },

  login: async function(user, password){
    const params = new url.URLSearchParams()
    params.append( 'accio', 'login')
    params.append( 'nomUsu', user)
    params.append( 'pasUsu', password );

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      maxRedirects:0,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // default
      },
    }

    return axios.post(URL_LOGIN, params, config).then(r=>r.headers['set-cookie'][0].split('=')[1]);

  },

  dictByCourse: (data) => {
    return data.reduce((courses, row) => {
      var course = courses[row[FIELD.ACTIVITAT_ID] || {}] || {
        idActivitat: row[FIELD.ACTIVITAT_ID],
        nomActivitat: row[FIELD.ACTIVITAT_NOM],
        alumnes: []
      };
      course.alumnes.push({
        [FIELD.ACTIVITAT_ID]: course,
        passaport: row.passaport,
        nomPersona: row.nomPersona,
        cognoms: row.cognoms
      })

      return courses;
    }, {})

  },

  cursosProfesor: async function(token, id, dni){  
    const profs = await Playoff.profesores(token);
    const prof = profs.find(p=>p.nif=dni&&p.residencia==id)||{};
    const cursos = (prof.observacionsColegiat||'').split('\n')
    if (!cursos.length){
      return [];
    }
    const inscripciones = await Playoff.inscripciones(token);
    const courses = Object.values(Playoff.dictByCourse(inscripciones));
    console.log(courses.length)
    return courses.filter(c=>cursos.find(x=>x==c.nomActivitat));
  }
  

};
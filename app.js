const Playoff = require("./playoff.js");
const database = require("./database.js");
let db;

const PASSWORD = process.env["PASSWORD"];
const USER = process.env["USER"];

var __cachedToken = null;

const app = {
  login: async () => Playoff.login(USER, PASSWORD),

  getCachedToken: () => {
    if (!__cachedToken) return null;
    
    const time = new Date().getTime();
    if (time - __cachedToken.time < 60000){
      return __cachedToken.token;
    }
    return null;
    
  },

  setCachedToken: async (token) => {
    const time = new Date().getTime();
    __cachedToken = {token, time}
  },

  getToken: async () => {
    const cachedToken = await app.getCachedToken();

    if (cachedToken) {
      return cachedToken;
    }

    const token = await app.login();
    app.setCachedToken(token);

    return token;
  },

  fechasCursos: async(cursosId)=>{
        return await db.getFechasCursos(cursosId);
  },

  cursosProfesor: async(profesor, dni, fecha)=>{
    const cursos = await Playoff.cursosProfesor(await app.getToken(), profesor, dni);
    const cursosId = cursos.map(c=>c.idActivitat);

    if (fecha && cursos && cursos.length){
        const asistencias = await db.getAsistencia(cursosId, fecha);
        asistencias.forEach(a=>{
            const curso = cursos.find(x=>x.idActivitat==a.curso)
            const alumne = ((curso).alumnes || []).find(x=>x.idAlumne==a.idAlumne);
            alumne.asiste=(a.valor=='SI')
        })
    }
    const fechas = await db.getFechasCursos(cursosId);
    console.log(cursos.length, cursosId, fechas)
    return {cursos, fechas};
  },

  setAsistencia: async(curso, fecha, idAlumne, valor, profesor)=>{
      return db.setAsistencia(curso, fecha, idAlumne, valor, profesor);
  },

  getDb: ()=>db
};

module.exports = (filename)=>{
    db = database(filename);
    return app;

}
const express = require('express');
const Playoff = require('./playoff.js');
const Db = require('./database.js')

const asyncHandler = require('express-async-handler')
require("json-circular-stringify");

const app = require('./app.js')


const server = express();
server.use(express.static('public'))
server.set('view engine', 'pug')



server.get('/prof/:id/:dni/:fecha', asyncHandler(async(req, res)=>{
  const id = req.params.id;
  const dni = req.params.dni;
  const fecha = req.params.fecha;
  const cursos = await Playoff.cursosProfesor(await app.getToken(), id, dni);
  console.log(cursos)
  if (fecha!='NODATE' && cursos && cursos.length){
    const asistencias = await Db.getAsistencia(id, fecha);
  }
  res.send(cursos);
}))

server.get('/inscripciones', asyncHandler(async(req, res)=>{
  const id = req.params.id;
  const dni = req.params.dni;
  const cursos = await Playoff.inscripciones(await app.getToken());
  res.send(cursos);
}))

server.get('/asistencia/:prof/:fecha', asyncHandler(async(req, res)=>{
  const prof = req.params.prof;
  const fecha = req.params.fecha;
  const alumno = req.params.alumno;
  
  const asistencias = await Db.getAsistencia(prof, fecha);
  res.send(asistencias)
  
}))

server.get('/asistencia/:prof/:fecha/:alumno/:valor', asyncHandler(async(req, res)=>{
  const prof = req.params.prof;
  const fecha = req.params.fecha;
  const alumno = req.params.alumno;
  const valor = req.params.valor;
  
  const asistencias = await Db.setAsistencia(prof, fecha, alumno, valor);
  res.send(asistencias)
  
}))




server.listen(3000, () => {
  console.log('server started');
});






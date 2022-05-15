const express = require('express');
const Playoff = require('./playoff.js');
const app = require('./app.js')('./.data/test.db')
const db = app.getDb();

const asyncHandler = require('express-async-handler')
require("json-circular-stringify");

const PASSWORD = process.env['PASSWORD'];
const USER = process.env['USER'];
const PROFESOR_TEST_ID=process.env['PROFESOR_TEST_ID']
const PROFESOR_TEST_DNI=process.env['PROFESOR_TEST_DNI']
const ALUMNE_1_ID=process.env['ALUMNE_1_ID']
const ALUMNE_1_CURSO=process.env['ALUMNE_1_CURSO']


const initData = async()=>{
  await app.setAsistencia('CURSO_1',  'FECHA_1', 'ALUMNO_1', 'VALOR_1' , 'PROFE_1')
  await app.setAsistencia('CURSO_1',  'FECHA_1', 'ALUMNO_2', 'VALOR_21', 'PROFE_1')
  await app.setAsistencia('CURSO_1',  'FECHA_1', 'ALUMNO_3', 'VALOR_31', 'PROFE_1')
  await app.setAsistencia('CURSO_1',  'FECHA_1', 'ALUMNO_4', 'VALOR_31', 'PROFE_2')
  
  await app.setAsistencia('CURSO_1',  'FECHA_2', 'ALUMNO_1', 'VALOR_11', 'PROFE_1')
  await app.setAsistencia('CURSO_1',  'FECHA_2', 'ALUMNO_2', 'VALOR_21', 'PROFE_1')
  await app.setAsistencia('CURSO_1',  'FECHA_2', 'ALUMNO_3', 'VALOR_31', 'PROFE_2')
  await app.setAsistencia('CURSO_1',  'FECHA_2', 'ALUMNO_4', 'VALOR_41', 'PROFE_2')

  await app.setAsistencia('CURSO_2',  'FECHA_3', 'ALUMNO_1', 'VALOR_11', 'PROFE_1')
  await app.setAsistencia('CURSO_2',  'FECHA_3', 'ALUMNO_2', 'VALOR_21', 'PROFE_1')
  await app.setAsistencia('CURSO_2',  'FECHA_3', 'ALUMNO_3', 'VALOR_31', 'PROFE_2')
  await app.setAsistencia('CURSO_2',  'FECHA_3', 'ALUMNO_4', 'VALOR_41', 'PROFE_2')

  await app.setAsistencia(ALUMNE_1_CURSO,  'FECHA_1', ALUMNE_1_ID, 'SI', PROFESOR_TEST_ID)
  return true;
}

beforeAll(async () => {
  const init = await db.init();
  const res= await  db.dropAsistencia();
  const result= await initData();
  console.log(result)
    const all = await db.getAll();
    console.table(all)
  return result;
  });

test('get token', async()=>{
  const token = await app.getToken();
  expect(token).toBeDefined();
  const token2 = await app.getToken();
  expect(token).toEqual(token2);
})


test('get asistencia no value', async()=>{
  const prof = 'xx'+Math.random();
  const asistencia = db.getAsistencia(prof, prof);
  expect(asistencia).toEqual
  
})

test('save asistencia', async()=>{
  const res2  = await db.getAsistencia();
  expect(res2.length).toEqual(13);
  expect(res2[0].curso).toEqual('CURSO_1')
  expect(res2[0].valor).toEqual('VALOR_1')
  expect(res2[0].modificadoFecha).toBeDefined()
  expect(res2[0].modificadoPor).toEqual('PROFE_1')
})

test('upsert asistencia', async()=>{
  const res = await app.setAsistencia('CURSO_1',  'FECHA_1', 'ALUMNO_1', 'VALOR_2', 'PROFE_1')
  const res2  = await db.getAsistencia('CURSO_1', 'FECHA_1', 'ALUMNO_1');
  expect(res2.length).toEqual(1);
  expect(res2[0].curso).toEqual('CURSO_1')
  expect(res2[0].valor).toEqual('VALOR_2')
  expect(res2[0].modificadoFecha).toBeDefined()
  expect(res2[0].modificadoPor).toEqual('PROFE_1')
})

test('get asistencia por curso', async()=>{

  const curso_1 = await db.getAsistencia(['CURSO_1'])
  expect(curso_1.length).toBe(8)

  const curso_2 = await db.getAsistencia(['CURSO_2'])
  expect(curso_2.length).toBe(4)

  const fecha_1 = await db.getAsistencia(['CURSO_1'], 'FECHA_1');
  expect(fecha_1.length).toBe(4)
  const fecha_2 = await db.getAsistencia(['CURSO_1'], 'FECHA_2');
  expect(fecha_2.length).toBe(4)

  const alumno_1 = await db.getAsistencia(['CURSO_1'], 'FECHA_1', 'ALUMNO_1');
  expect(alumno_1.length).toBe(1)

  const alumno_2 = await db.getAsistencia(['CURSO_1'], 'FECHA_1', 'ALUMNO_2');
  expect(alumno_2.length).toBe(1)
})

test('get fechas cursos', async()=>{
    const fechas = await db.getFechasCursos(['CURSO_1'])
    expect(fechas.length).toBe(2)
    const fechas_2 = await db.getFechasCursos(['CURSO_2'])
    expect(fechas_2.length).toBe(1)
    const fechas_1_2 = await db.getFechasCursos(['CURSO_1','CURSO_2'])
    expect(fechas_1_2.length).toBe(3)
    const fechas_playoff = await app.fechasCursos([ALUMNE_1_CURSO])
    console.log(fechas_playoff)
    expect(fechas_playoff.length).toBe(1)
})


test('cursos profesor', async()=>{

  let cursos = await app.cursosProfesor(PROFESOR_TEST_ID, PROFESOR_TEST_DNI, 'FECHA_1');
  let curso = cursos.cursos.find(x=>x.idActivitat==ALUMNE_1_CURSO);
  let alumnes = curso.alumnes || [];
  let alumne = alumnes.find(x=>x.idAlumne==ALUMNE_1_ID)
  expect(alumne.asiste).toBe(true);
});


test('get all', async()=>{
    const all = await db.getAll();
    console.table(all)
})
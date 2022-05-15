const express = require('express');
const Playoff = require('./playoff.js');
const Db = require('./database.js')
const app = require('./app.js')

const asyncHandler = require('express-async-handler')
require("json-circular-stringify");

console.log(process.env)
const PASSWORD = process.env['PASSWORD'];
const USER = process.env['USER'];


test('init db', async()=>{
  const db = await Db.init();
  expect(db).toBeDefined();
})

test('get token', async()=>{
  const token = await app.getToken();
  expect(token).toBeDefined();
  const token2 = await app.getToken();
  expect(token).toEqual(token2);
})

test('get asistencia no value', async()=>{
  const prof = 'xx'+Math.random();
  const asistencia = Db.getAsistencia(prof, prof);
  expect(asistencia).toEqual([])
})
const express = require('express');
const Playoff = require('./playoff.js');
const Db = require('./database.js')

const asyncHandler = require('express-async-handler')
require("json-circular-stringify");

const PASSWORD = process.env['PASSWORD']
const USER = process.env['USER']
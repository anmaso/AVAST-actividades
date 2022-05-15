/**
 * Module handles database management
 *
 * Server API calls the methods in here to query and update the SQLite database
 */

// Utilities we need
const fs = require("fs");

// Initialize the database
const dbFile = "./.data/choices.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;

/* 
We're using the sqlite wrapper so that we can make async / await connections
- https://www.npmjs.com/package/sqlite
*/
dbWrapper
  .open({
    filename: dbFile,
    driver: sqlite3.Database
  })
  .then(async dBase => {
    db = dBase;

    // We use try and catch blocks throughout to handle any database errors
    try {
      // The async / await syntax lets us write the db operations in a way that won't block the app
      if (!exists) {
        // Database doesn't exist yet - create Choices and Log tables
        await db.run(
          "CREATE TABLE Asistencia (id INTEGER PRIMARY KEY AUTOINCREMENT, profesor TEXT, fecha TEXT, alumno TEXT)"
        );

      } else {
        // We have a database already - write Choices records to log for info
        //console.log(await db.all("SELECT * from Asistencia"));

        //If you need to remove a table from the database use this syntax
        //db.run("DROP TABLE Logs"); //will fail if the table doesn't exist
      }
    } catch (dbError) {
      console.error(dbError);
    }
  });

// Our server script will call these methods to connect to the db
module.exports = {
  

  /**
   * Get the options in the database
   *
   * Return everything in the Choices table
   * Throw an error in case of db connection issues
   */
  getAsistencia: async (profesor, fecha) => {
    // We use a try catch block in case of db errors
    try {
      if (!profesor){
        return await db.all("SELECT * from Asistencia");
      }
      return await db.all("SELECT * from Asistencia WHERE profesor='"+profesor+"' and fecha='"+fecha+"'");
    } catch (dbError) {
      // Database connection error
      console.error(dbError);
    }
  },

  /**
   * Process a user vote
   *
   * Receive the user vote string from server
   * Add a log entry
   * Find and update the chosen option
   * Return the updated list of votes
   */
  setAsistencia: async (profesor, fecha, alumno, valor) => {
    // Insert new Log table entry indicating the user choice and timestamp
    try {
      // Check the vote is valid
      if (!valor){
        return await db.run("DELETE from Asistencia WHERE profesor=? and fecha=? and alumno=?", profesor, fecha, alumno)
      }
      
      return await db.all(
        "INSERT INTO Asistencia (profesor, fecha, alumno) VALUES (?, ?, ?)",
        profesor, fecha, alumno
      );
      
    } catch (dbError) {
      console.error(dbError);
    }
  },

  /**
   * Get logs
   *
   * Return choice and time fields from all records in the Log table
   */
  getLogs: async () => {
    // Return most recent 20
    try {
      // Return the array of log entries to admin page
      return await db.all("SELECT * from Log ORDER BY time DESC LIMIT 20");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  /**
   * Clear logs and reset votes
   *
   * Destroy everything in Log table
   * Reset votes in Choices table to zero
   */
  dropAsistencia: async () => {
    try {
      // Delete the logs
      await db.run("DELETE from Asistencia");
      // Return empty array
      return [];
    } catch (dbError) {
      console.error(dbError);
    }
  },
  init: ()=>{
    var count = 0;
    
    const check = (resolve, reject)=>{
      setTimeout(()=>{
        if (db) return resolve(true);
        if (count>10) return reject();
        count++;
        check(resolve, reject)
        
      }, 100)
    }
    
    return new Promise((resolve, reject)=>{
      check(resolve)
    })
  }
};


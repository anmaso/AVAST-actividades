const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;


// Our server script will call these methods to connect to the db
module.exports = (filename) => {

    const exists = fs.existsSync(filename);
    dbWrapper
        .open({
            filename,
            driver: sqlite3.Database
        })
        .then(async dBase => {
            db = dBase;
            try {
                if (!exists) {
                    await db.run(
                        "CREATE TABLE Asistencia (id INTEGER PRIMARY KEY AUTOINCREMENT, curso TEXT, fecha TEXT, idAlumne TEXT, modificadoFecha TEXT, valor TEXT, modificadoPor TEXT)"
                    );
                    await db.run(
                        "CREATE UNIQUE INDEX principal ON Asistencia (curso, fecha, idAlumne)"
                    )
                } else {
                }
            } catch (dbError) {
                console.error(dbError);
            }
        });

    return {

        getFechasCursos: async (cursos) => {
            const cursosStr = cursos.map(c => "'" + c + "'").join(',')
            return await db.all("SELECT distinct(fecha) from Asistencia WHERE curso in (" + cursosStr + ")");
        },
        getAll: async () => {
            return await db.all("SELECT * from Asistencia");
        },

        /**
         * Get the options in the database
         *
         * Return everything in the Choices table
         * Throw an error in case of db connection issues
         */
        getAsistencia: async (cursos, fecha, idAlumne) => {
            // We use a try catch block in case of db errors
            if (cursos) {
                cursos = [].concat(cursos)
            }
            try {
                if (!cursos) {
                    return await db.all("SELECT * from Asistencia");
                }
                const cursosStr = cursos.map(c => "'" + c + "'").join(',')
                if (!fecha) {
                    return await db.all("SELECT * from Asistencia WHERE curso in (" + cursosStr + ")");
                }
                if (!idAlumne) {
                    return await db.all("SELECT * from Asistencia WHERE curso in (" + cursosStr + ") and fecha=?", fecha);
                }
                return await db.all("SELECT * from Asistencia WHERE curso in (" + cursosStr + ") and fecha=? and idAlumne=?", fecha, idAlumne);
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
        setAsistencia: async (curso, fecha, idAlumne, valor, profesor) => {
            // Insert new Log table entry indicating the user choice and timestamp
            try {
                // Check the vote is valid
                return await db.all(
                    "INSERT INTO Asistencia (curso, fecha, idAlumne, valor, modificadoFecha, modificadoPor) VALUES (?, ?, ?, ?, ?, ?) " +
                    "ON CONFLICT (curso, fecha, idAlumne) DO UPDATE SET valor=?",
                    curso, fecha, idAlumne, valor, (new Date).getTime(), profesor, valor
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
        dropAsistenciaTests: async () => {
            try {
                // Delete the logs
                await db.run("DELETE from Asistencia where curso like 'CURSO%'");
                // Return empty array
                return [];
            } catch (dbError) {
                console.error(dbError);
            }
        },
        init: () => {
            var count = 0;

            const check = (resolve, reject) => {
                setTimeout(() => {
                    if (db) return resolve(true);
                    if (count > 10) return reject();
                    count++;
                    check(resolve, reject)

                }, 100)
            }

            return new Promise((resolve, reject) => {
                check(resolve)
            })
        }
    }
};


const mongooe= require("mongoose")
async function dbConnect() {
    try {
        DB_URL = process.env.DB_URL
        DB_NAME = process.env.DB_NAME

        await mongooe.connect(`${DB_URL}/${DB_NAME}`)
        console.log("DataBase Connected");
        
        
    } catch (error) {
        console.error("Error connecting to MongoDB",error)
        process.exit(1);
        
    }
    
}
module.exports = dbConnect;
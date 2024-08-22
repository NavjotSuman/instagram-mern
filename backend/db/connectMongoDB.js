import mongoose from "mongoose";


export default async function connectMongoDB() {
 try {
    const db = await mongoose.connect(process.env.MONGO_URI)
    console.log(`Database Connected SuccessFully: mongodb://${db.connection.host}:${db.connection.port}/${db.connection.name}`)
 } catch (error) {
    console.log(`Error in connection with Database : ${error.message}`)
 }
}

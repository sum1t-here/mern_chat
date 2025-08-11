import mongoose from "mongoose";

const connectDb = async() => {
    const url = process.env.MONGO_URI;

    if(!url) {
        throw new Error("MONGO_URI is not defined in .env !!!");
    }

    try {
        await mongoose.connect(url, {
            dbName: "Chatappmicroserviceapp",
        })
        console.log("DB connected sucessfully !!!");
    } catch (error) {
        if(error){
            console.error("Failed to connect to Mongo db: ",error);
            process.exit(1);
        }
    }
}

export default connectDb;
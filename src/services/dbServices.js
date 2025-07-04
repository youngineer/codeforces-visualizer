import UserData from "../models/user.js";


export const saveToDb = async(userData) => {
    const user = await new UserData(userData).save();
    
}
import UserData from "../models/user.js";


const fetchAllUsersFromDatabase = async(req, response, next) => {
    
};



export const saveToDb = async(userData) => {
    return await new UserData(userData).save();
}
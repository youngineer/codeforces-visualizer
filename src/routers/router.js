import express from 'express';
import { handlePostNewUser } from '../middleware/cfMethods.js';


const router = express.Router();



router.get("/allStudents",  async(req, resp) => {
    return resp.status(200).json({
        message: "Existing users fetched successfully!",
        body: req.allUsers
    });
});


router.post("/postUser", handlePostNewUser, async(req, resp) => {
    return resp.status(201).json({
        message: "User added successfully!",
        content: req?.content
    });
});

export default router;
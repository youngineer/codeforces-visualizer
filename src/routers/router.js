import express from 'express';


const router = express.Router();



router.get("/allStudents", async(req, resp) => {
    return resp.status(200).json({
        message: "Existing users fetched successfully!",
        body: req.allUsers
    });
});


router.post("/postUser", )


export default router;
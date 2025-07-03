import { getUserContestHistory, getUserInfo, getUserProblemSolvingData } from "../services/cfServices.js";
import { CODEFORCES_BASE_URL } from "../utils/constants.js"


export const handlePostNewUser = async(req, resp, next) => {
    const { name, emailId, phoneNumber, handle } = req?.body;
    try {
        // fetch ratings
        const userInfoContent = await getUserInfo(handle);

        if(userInfoContent?.message != "OK") {
            throw new Error(userInfoContent?.message);
        }
        const { currentRating, maxRating } = userInfoContent?.content;

        // fetch contestHistory
        const contestHistoryResponse = await getUserContestHistory(handle);
        if(contestHistoryResponse?.message != "OK") {
            throw new Error(contestHistoryResponse?.message);
        }
        const contestHistory = contestHistoryResponse?.content;

        //fetch problemSolvedData
        const problemSolvedDataResponse = await getUserProblemSolvingData(handle);
        if(problemSolvedDataResponse?.message != "OK") {
            throw new Error(problemSolvedDataResponse?.message);
        }
        const problemSolvedData = problemSolvedDataResponse?.content;

        const userDataToStoreInDb = {
            name: name,
            emailId: emailId,
            phoneNumber: phoneNumber,
            handle: handle,
            currentRating: currentRating,
            maxRating: maxRating,
            contestHistory: contestHistory,
            problemSolvedData: problemSolvedData
        }

        req.content = userDataToStoreInDb;
        next();

    } catch (error) {
        resp.status(400).json({
            message: error.message,
            content: null
        })
    }
    
}
import { getUserContestHistory, getUserInfo } from "../services/cfServices";
import { CODEFORCES_BASE_URL } from "../utils/constants"

export const fetchUserInfo = async(username) => {
    const url = CODEFORCES_BASE_URL + "user.info?handles=" + username;
};


export const handlePostNewUser = async(req, resp, next) => {
    const { name, emailId, phoneNumber, handle } = req?.userDetails;
    try {
        // fetch ratings
        const userInfoContent = await getUserInfo(handle);
        if(userInfoContent?.message != "OK") {
            throw new Error("Couldn't fetch user");
        }
        const { currentRating, maxRating } = userInfoContent?.content;

        // fetch contestHistory
        const contestHistory = await getUserContestHistory(handle);


    } catch (error) {
        resp.status(400).json({
            message: error.message,
            content: null
        })
    }
    
}
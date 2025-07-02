import axios from "axios";
import { CODEFORCES_BASE_URL } from "../utils/constants"
import { getDateFromTimestamp } from "../utils/helperFunctions";

export const getUserInfo = async(handle) => {
    const url = CODEFORCES_BASE_URL + "user.info&handle=" + handle;
    try {
        const userInfoResponse = await axios.get(url)
        if(userInfoResponse.status != "OK") {
            throw new Error("User Not Found");
        }

        const data = {
            message: "OK",
            content: {
                currentRating: userInfoResponse?.result?.rating,
                maxRating: userInfoResponse?.result?.maxRating
            }
        };

        return data;
    } catch (error) {
        console.error("Something went wrong: ", error.message);
        return {
            message: "Something went wrong: " + error.message,
            content: null
        }
    }
};


export const getUserContestHistory = async(handle) => {
    const attemptedContestsUrl = CODEFORCES_BASE_URL + `user.rating?handle=${handle}`;
    const rankList = [];
    const ratingList = [];
    const contestIdList = [];
    const unsolvedList = [];
    const dateList = [];

    try {
        const attemptedContestsResponse = await axios.get(attemptedContestsUrl);
        if(attemptedContestsResponse?.status != "OK") {
            throw new Error("User Not Found");
        }

        const contests = attemptedContestsResponse?.result;
        for(let i = contests.length - 1; i >= 0 ; i--) {
            const currentContest = contests[i];

            const date = getDateFromTimestamp(currentContest?.ratingUpdateTimeSeconds);
            if(date === null) break;

            const unsolved = await getUnsolvedProblems(handle, currentContest?.contestId);
            unsolvedList.append(unsolved);
            dateList.append(date);
            contestIdList.append(currentContest?.contestId);
            rankList.append(currentContest?.rank);
            ratingList.append(currentContest?.newRating);
        };

        const contestHistory = {
            contestIdList: contestIdList,
            ratingList: ratingList,
            rankList: rankList,
            unsolvedList: unsolvedList
        }

        return contestHistory;
    } catch (error) {
        console.error("Something went wrong: ", error.message);
        return {
            message: "Something went wrong: " + error.message,
            content: null
        }
    }
}


export const getUnsolvedProblems = async(contestId, handle) => {
    const url = CODEFORCES_BASE_URL + `contest.status?contestId=${contestId}&handle=${handle}`;
    try {
        const contestStatusResponse = await axios.get(url);
        const contestProblems = contestStatusResponse?.result;
        const unsolvedProblems = getUnsolvedProblems(contestProblems);

    } catch (error) {
        console.error(error);
    }
}
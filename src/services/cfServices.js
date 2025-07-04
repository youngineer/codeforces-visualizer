import axios from "axios";
import { CODEFORCES_BASE_URL } from "../utils/constants.js";
import { calculateUnsolvedProblems, getDateFromTimestamp, getRatingBucket, isEntryValid } from "../utils/helperFunctions.js";

export const getUserInfo = async (handle) => {
    const url = `${CODEFORCES_BASE_URL}user.info?handles=${handle}`;
    try {
        const userInfoResponse = await axios.get(url);

        // Check for unsuccessful response from Codeforces
        if (userInfoResponse?.status !== 200 || userInfoResponse?.data?.status !== "OK") {
            throw new Error(`Error fetching user info: ${userInfoResponse?.data?.message || 'Unknown error'}`);
        }
        const maxRating = userInfoResponse?.data?.result[0]?.maxRating;
        const currentRating = userInfoResponse?.data?.result[0]?.rating;

        return {
            message: "OK",
            content: {currentRating: currentRating,
                maxRating: maxRating}
        };
    } catch (error) {
        console.error("Error in getUserInfo:", error.message, "\nStack:", error.stack);
        return {
            message: `Error: ${error.message}`,
            content: null
        };
    }
};

export const getUserContestHistory = async (handle) => {
    const rankList30 = [], ratingList30 = [], contestIdList30 = [], unsolvedList30 = [], dateList30 = [];
    const rankList90 = [], ratingList90 = [], contestIdList90 = [], unsolvedList90 = [], dateList90 = [];
    const rankList365 = [], ratingList365 = [], contestIdList365 = [], unsolvedList365 = [], dateList365 = [];
    const attemptedContestsUrl = `${CODEFORCES_BASE_URL}user.rating?handle=${handle}`;

    try {
        const attemptedContestsResponse = await axios.get(attemptedContestsUrl);

        // Check for unsuccessful response
        if (attemptedContestsResponse?.status !== 200 || attemptedContestsResponse?.data?.status !== "OK") {
            throw new Error(`Error fetching contest history: ${attemptedContestsResponse?.data?.message || 'Unknown error'}`);
        }

        const contests = attemptedContestsResponse?.data?.result;
        if (!contests || contests.length === 0) {
            throw new Error("No contest history found for the user.");
        }

        for (let i = contests.length - 1; i >= 0; i--) {
            const currentContest = contests[i];

            const [days, date] = getDateFromTimestamp(currentContest?.ratingUpdateTimeSeconds);
            if (days > 365) break;

            const unsolved = await getUnsolvedProblems(currentContest?.contestId, handle);

            if (days <= 30) {
                contestIdList30.push(currentContest?.contestId);
                rankList30.push(currentContest?.rank);
                ratingList30.push(currentContest?.newRating);
                unsolvedList30.push(unsolved);
                dateList30.push(date);
            } else if (days <= 90) {
                contestIdList90.push(currentContest?.contestId);
                rankList90.push(currentContest?.rank);
                ratingList90.push(currentContest?.newRating);
                unsolvedList90.push(unsolved);
                dateList90.push(date);
            } else if (days <= 365) {
                contestIdList365.push(currentContest?.contestId);
                rankList365.push(currentContest?.rank);
                ratingList365.push(currentContest?.newRating);
                unsolvedList365.push(unsolved);
                dateList365.push(date);
            }
        }

        const contestHistory = {
            30: {
            contestIdList: contestIdList30,
            rankList: rankList30,
            ratingList: ratingList30,
            unsolvedList: unsolvedList30,
            dateList: dateList30
        },
        90: {
            contestIdList: contestIdList90,
            rankList: rankList90,
            ratingList: ratingList90,
            unsolvedList: unsolvedList90,
            dateList: dateList90
        },
        365: {
            contestIdList: contestIdList365,
            rankList: rankList365,
            ratingList: ratingList365,
            unsolvedList: unsolvedList365,
            dateList: dateList365
        }};

        return {
            message: "OK",
            content: contestHistory
        };
    } catch (error) {
        console.error("Error in getUserContestHistory:", error.message, "\nStack:", error.stack);
        return {
            message: `Error: ${error.message}`,
            content: null
        };
    }
};



export const getUserProblemSolvingData = async (handle) => {
    const url = `${CODEFORCES_BASE_URL}user.status?handle=${handle}`;

    const ranges = [7, 30, 90];

    // Initialize data holders for each time range
    const dataByRange = {};
    for (const range of ranges) {
        dataByRange[range] = {
            totalRating: 0,
            totalProblemsSolved: 0,
            maxRatedProblem: 0,
            problemsPerRatingBuckets: {
                1200: 0,
                1400: 0,
                1600: 0,
                1800: 0,
                1900: 0,
                2100: 0,
                2300: 0,
                2400: 0,
                2600: 0,
                2800: 0,
                3000: 0
            },
            dailySubmissions: {}
        };
    }

    try {
        const userProblemSolvingResponse = await axios.get(url);

        if (userProblemSolvingResponse?.status !== 200 || userProblemSolvingResponse?.data?.status !== "OK") {
            throw new Error(`Error fetching user problem solving data: ${userProblemSolvingResponse?.data?.message || 'Unknown error'}`);
        }

        const userSolvedProblemList = userProblemSolvingResponse?.data?.result;

        for (let i = 0; i < userSolvedProblemList.length; i++) {
            const submission = userSolvedProblemList[i];
            if (submission?.verdict !== "OK") continue;

            const [days, date] = getDateFromTimestamp(submission?.creationTimeSeconds);
            const rating = submission?.problem?.rating;
            const problemRating = getRatingBucket(rating);

            for (const range of ranges) {
                if (days <= range) {
                    const rangeData = dataByRange[range];

                    if (rating) {
                        rangeData.totalRating += rating;
                        rangeData.totalProblemsSolved++;
                        rangeData.maxRatedProblem = Math.max(rangeData.maxRatedProblem, rating);
                        rangeData.problemsPerRatingBuckets[problemRating]++;
                    }

                    if (!rangeData.dailySubmissions[date]) {
                        rangeData.dailySubmissions[date] = 0;
                    }
                    rangeData.dailySubmissions[date]++;
                }
            }
        }

        // Final processing: calculate average rating
        const problemSolvingData = {};
        for (const range of ranges) {
            const rangeData = dataByRange[range];
            const avgRating = rangeData.totalProblemsSolved
                ? Math.round(rangeData.totalRating / rangeData.totalProblemsSolved)
                : 0;

            problemSolvingData[range] = {
                totalProblemsSolved: rangeData.totalProblemsSolved,
                avgRating,
                maxRatedProblem: rangeData.maxRatedProblem,
                problemsPerRatingBuckets: rangeData.problemsPerRatingBuckets,
                dailySubmissions: rangeData.dailySubmissions
            };
        }

        return {
            message: "OK",
            content: problemSolvingData
        };
    } catch (error) {
        console.error("Error in getUserProblemSolvingData:", error.message, "\nStack:", error.stack);
        return {
            message: `Error: ${error.message}`,
            content: null
        };
    }
};


export const getUnsolvedProblems = async (contestId, handle) => {
    const url = `${CODEFORCES_BASE_URL}contest.status?contestId=${contestId}&handle=${handle}`;
    try {
        const contestStatusResponse = await axios.get(url);

        // Check for unsuccessful response
        if (contestStatusResponse?.status !== 200 || contestStatusResponse?.data?.status !== "OK") {
            throw new Error(`Error fetching contest status for contestId ${contestId}: ${contestStatusResponse?.data?.message || 'Unknown error'}`);
        }

        const contestProblems = contestStatusResponse?.data?.result;
        if (!contestProblems) {
            throw new Error(`No problems found for contestId ${contestId}.`);
        }

        const unsolvedProblems = calculateUnsolvedProblems(contestProblems);
        return unsolvedProblems;
    } catch (error) {
        console.error("Error in getUnsolvedProblems:", error.message, "\nStack:", error.stack);
        return null;
    }
};

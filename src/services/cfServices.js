import axios from "axios";
import { CODEFORCES_BASE_URL } from "../utils/constants.js";
import { calculateUnsolvedProblems, getDateFromTimestamp, getPeriodAverages, getRatingBucket } from "../utils/helperFunctions.js";

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
    const rankList = [];
    const ratingList = [];
    const contestIdList = [];
    const unsolvedList = [];
    const dateList = [];
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

            const { date, done7, done30, done90 } = getDateFromTimestamp(currentContest?.ratingUpdateTimeSeconds, 365);
            if (!date) break;

            const unsolved = await getUnsolvedProblems(currentContest?.contestId, handle);
            unsolvedList.push(unsolved);
            dateList.push(date);
            contestIdList.push(currentContest?.contestId);
            rankList.push(currentContest?.rank);
            ratingList.push(currentContest?.newRating);
        }

        const contestHistory = {
            contestIdList: contestIdList,
            ratingList: ratingList,
            rankList: rankList,
            unsolvedList: unsolvedList
        };

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
    let maxRatedProblem = 0;
    let totalRating = 0;
    let avgRating = 0;
    let totalProblemsSolved = 0;
    let dailySubmissions = {};
    const problemsPerRatingBuckets = {
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
    };

    try {
        const userProblemSolvingResponse = await axios.get(url);

        // Check for unsuccessful response
        if (userProblemSolvingResponse?.status !== 200 || userProblemSolvingResponse?.data?.status !== "OK") {
            throw new Error(`Error fetching user problem solving data: ${userProblemSolvingResponse?.data?.message || 'Unknown error'}`);
        }

        const userSolvedProblemList = userProblemSolvingResponse?.data?.result;

        // Variables for tracking submission data
        let totalRatingFor7Days = 0, totalProblemsFor7Days = 0;
        let totalRatingFor30Days = 0, totalProblemsFor30Days = 0;
        let totalRatingFor90Days = 0, totalProblemsFor90Days = 0;
        
        // Iterate over user solved problems and accumulate data
        for (let i = 0; i < userSolvedProblemList.length; i++) {
            if (userSolvedProblemList[i]?.verdict === "OK") {
                const { date, done7, done30, done90 } = getDateFromTimestamp(userSolvedProblemList[i]?.creationTimeSeconds, 90); // 90 days period
                if (!date) break;

                const rating = userSolvedProblemList[i]?.problem?.rating;
                if (rating) {
                    totalRating += rating;
                    totalProblemsSolved++;
                    maxRatedProblem = Math.max(maxRatedProblem, rating);

                    if (!done7) {
                        totalRatingFor7Days += rating;
                        totalProblemsFor7Days++;
                    }
                    if (!done30) {
                        totalRatingFor30Days += rating;
                        totalProblemsFor30Days++;
                    }
                    totalRatingFor90Days += rating;
                    totalProblemsFor90Days++;
                }

                const problemRating = getRatingBucket(rating);
                problemsPerRatingBuckets[problemRating]++;

                if (!dailySubmissions[date]) {
                    dailySubmissions[date] = 0;
                }
                dailySubmissions[date]++;

                // Track data for 7, 30, and 90 days
                
            }
        }

        avgRating = Math.round((totalRating / totalProblemsSolved), 2);

        // Calculate the averages for the different periods
        const avgProblemsPerDayFor7Days = totalProblemsFor7Days > 0 ? Math.round(totalProblemsFor7Days / 7, 2) : 0.0;
        const avgRatingFor7Days = totalProblemsFor7Days > 0 ? Math.round(totalRatingFor7Days / totalProblemsFor7Days, 2) : 0.0;

        const avgProblemsPerDayFor30Days = totalProblemsFor30Days > 0 ? Math.round(totalProblemsFor30Days / 30, 2) : 0.0;
        const avgRatingFor30Days = totalProblemsFor30Days > 0 ? Math.round(totalRatingFor30Days / totalProblemsFor30Days, 2) : 0.0;

        const avgProblemsPerDayFor90Days = totalProblemsFor90Days > 0 ? Math.round(totalProblemsFor90Days / 90, 2) : 0.0;
        const avgRatingFor90Days = totalProblemsFor90Days > 0 ? Math.round(totalRatingFor90Days / totalProblemsFor90Days, 2) : 0.0;

        // Prepare the final problem solving data
        const problemSolvingData = {
            totalProblemsSolved: totalProblemsSolved,
            avgRating: avgRating,
            maxRatedProblem: maxRatedProblem,
            problemsPerRatingBuckets: problemsPerRatingBuckets,
            dailySubmissions: dailySubmissions,
            periodAverages: {
                7: {
                    avgProblemsPerDay: avgProblemsPerDayFor7Days,
                    avgRating: avgRatingFor7Days
                },
                30: {
                    avgProblemsPerDay: avgProblemsPerDayFor30Days,
                    avgRating: avgRatingFor30Days
                },
                90: {
                    avgProblemsPerDay: avgProblemsPerDayFor90Days,
                    avgRating: avgRatingFor90Days
                }
            }
        };

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

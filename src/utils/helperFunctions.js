

export const calculateUnsolvedProblems = (contestProblems) => {
    let unsolved = 0;
    for(let i = 0; i < contestProblems.length; i++) {
        const currentProblem = contestProblems[i];
        if(currentProblem?.verdict != "OK") {
            unsolved++;
        }
    }

    return unsolved;
};


export const getDateFromTimestamp = (unixTimestamp, limit) => {
    const date = new Date(unixTimestamp * 1000);
    const now = new Date();
    let done7 = false;
    let done30 = false;
    let done90 = false;

    const timeDiff = now - date;
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (daysDiff > 7) done7 = true;
    if (daysDiff > 30) done30 = true;

    if (daysDiff <= limit) {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); 
        const yyyy = date.getFullYear();

        return {
            date: `${dd}/${mm}/${yyyy}`,
            done7: done7,
            done30: done30,
            done90: done90
        };
    }

    return ''; 
};


export const getPeriodAverages = (dailySubmissions, totalRating, totalProblemsSolved) => {
    const calculateAvg = (submissions, totalRating, totalProblemsSolved, days) => {
        const recentSubmissions = Object.entries(submissions).filter(([date]) => {
            const dateObj = new Date(date);
            const diff = (new Date() - dateObj) / (1000 * 60 * 60 * 24);
            return diff <= days;
        });

        let totalProblemsForPeriod = 0;
        let totalRatingForPeriod = 0;
        recentSubmissions.forEach(([_, count]) => totalProblemsForPeriod += count);

        for (const [date, count] of recentSubmissions) {
            totalRatingForPeriod += count * totalRating;
        }

        const avgProblemsPerDay = recentSubmissions.length === 0 ? 0 : Math.round((totalProblemsForPeriod / recentSubmissions.length), 2);
        const avgRating = recentSubmissions.length === 0 || totalProblemsForPeriod === 0 ? 0 : Math.round((totalRatingForPeriod / totalProblemsForPeriod), 2);

        return {
            avgProblemsPerDay,
            avgRating
        };
    };

    return {
        7: calculateAvg(dailySubmissions, totalRating, totalProblemsSolved, 7),
        30: calculateAvg(dailySubmissions, totalRating, totalProblemsSolved, 30),
        90: calculateAvg(dailySubmissions, totalRating, totalProblemsSolved, 90)
    };
};



export function getRatingBucket(rating) {
    if (rating <= 1200) {
        return 1200;
    } else if (rating <= 1400) {
        return 1400;
    } else if (rating <= 1600) {
        return 1600;
    } else if (rating <= 1800) {
        return 1800;
    } else if (rating <= 1900) {
        return 1900;
    } else if (rating <= 2100) {
        return 2100;
    } else if (rating <= 2300) {
        return 2300;
    } else if (rating <= 2400) {
        return 2400;
    } else if (rating <= 2600) {
        return 2600;
    } else if (rating <= 2800) {
        return 2800;
    } else if (rating <= 3000) {
        return 3000;
    } else {
        return 4500
    }
}


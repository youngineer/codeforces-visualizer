

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


export const getDateFromTimestamp = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    const now = new Date();

    const timeDiff = now - date;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); 
    const yyyy = date.getFullYear();

    const dateString = `${dd}/${mm}/${yyyy}`;
    return [daysDiff, dateString];
};



export const isEntryValid = (timestamp, limit) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();

    return today - date <= limit;
}



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


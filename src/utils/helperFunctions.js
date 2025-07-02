

export const calculateUnsolvedProblems = (contestProblems) => {
    let unsolved = 0;
    for(let i = 0; i < contestProblems.length; i++) {
        currentProblem = contestProblems[i];
        if(currentProblem?.verdict != "OK") {
            unsolved++;
        }
    }

    return unsolved;
};


export const getDateFromTimestamp = (unixTimestamp, limit) => {
    const date = new Date(unixTimestamp * 1000);
    const now = new Date();

    const timeDiff = now - date;
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (daysDiff <= limit) {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); 
        const yyyy = date.getFullYear();

        return `${dd}?${mm}?${yyyy}`;
    }

    return null; 
};

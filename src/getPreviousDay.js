async function getPreviousDay(tp) {
    const date = moment(tp.file.title, 'YYYY-MM-DD');
    let prevDay;
    const parent = tp.file.folder(true);

    let diff = 1;
    while (!prevDay) {
        date.subtract(1, 'd');
        const fpath = parent + '/' + date.format('YYYY-MM-DD') + '.md';
        if (await tp.file.exists(fpath)) {
            prevDay = fpath;
        }
        diff += 1;
        if (diff === 365) {
            throw new Error('Cannot find previous file within last year.');
        }
    }
    return prevDay;
}

module.exports = getPreviousDay;

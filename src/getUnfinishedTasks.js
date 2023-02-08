function parseTasks(text) {
    const tasks = { today: [], tomorrow: [] };
    let lines = text.split('\n');
    let flag = null;
    let subflag = null;

    for (let line of lines) {
        [flag, subflag] = getFlags(line, flag, subflag);
        if (line.startsWith('- [')) {
            parseTask(flag, subflag, line, tasks);
        }
    }

    return tasks;
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function parseUnfinishedTasks(tasks) {
    const unfinishedTasks = {};
    for (const day in tasks) {
        for (const type in tasks[day]) {
            for (const task of tasks[day][type]) {
                if (!task.completed) {
                    if (unfinishedTasks[type] === undefined) {
                        unfinishedTasks[type] = [];
                    }
                    unfinishedTasks[type] = unfinishedTasks[type].concat(task.line);
                }
            }
        }
    }
    return unfinishedTasks;
}

function getFlags(line, flag, subflag) {
    if (line.startsWith('## Today')) {
        flag = 'today';
    } else if (line.startsWith('## Tomorrow')) {
        flag = 'tomorrow';
    } else if (line.startsWith('### Work')) {
        subflag = 'work';
    } else if (line.startsWith('### Admin')) {
        subflag = 'admin';
    }
    return [flag, subflag];
}

function parseTask(flag, subflag, line, tasks) {
    function _getTaskText(line) {
        return line.slice(6);
    }
    let taskText;
    if (flag !== null && subflag !== null) {
        if (tasks[flag][subflag] === undefined) {
            tasks[flag][subflag] = [];
        }
        taskText = _getTaskText(line);
        if (taskText !== '') {
            tasks[flag][subflag] = tasks[flag][subflag].concat({
                text: taskText,
                line: line,
                completed: taskIsComplete(line),
            });
        }
    }
}

function taskIsComplete(line) {
    if (line.startsWith('- [ ]')) {
        return false;
    } else if (line.startsWith('- [x]')) {
        return true;
    }
    throw new Error('unrecognised task ending: ' + line);
}

function formatTasks(tasks) {
    let taskArray = [''];
    for (const type in tasks) {
        taskArray = taskArray.concat(`### ${capitalize(type)}`, tasks[type], '');
    }
    return taskArray.join('\n');
}

async function getUnfinishedTasks(tp, fpath) {
    const tfile = tp.file.find_tfile(fpath);
    const text = await app.vault.read(tfile);
    const tasks = parseTasks(text);
    const unfinishedTasks = parseUnfinishedTasks(tasks);
    return formatTasks(unfinishedTasks);
}

module.exports = getUnfinishedTasks;

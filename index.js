const core = require('@actions/core');
const github = require('@actions/github');
const SftpClient = require('ssh2-sftp-client');

function convertPaths(p) {
    try { 
        const result = JSON.parse(p);
        console.log("PATHS have been converted to: ", result)
        return result;
    } catch (error) {
        console.log("Paths failed, recieved raw data containg :", p);
        core.setFailed(error.message);
    }
}


try {
    const host = core.getInput('host');
    const username = core.getInput('username');
    const password = core.getInput('password');
    const port = core.getInput('port');
    const rawPaths = core.getInput('paths');
    // TODO seems to fail for some causes but not sure why

    const paths = convertPaths(rawPaths);
    const sftp = new SftpClient();
    const connection = {
        host: host, 
        port: port, 
        username: username, 
        password: password, 
    };
    sftp.connect(connection)
        .then(() => {
            Object.keys(paths).forEach(async localFile => { 
                console.log(localFile, paths[localFile])
                sftp.fastPut(localFile, paths[localFile], {autoClose: true});
            });
        })
        .then((data) => console.log("received", data))
        .catch(err => console.log("Failed with error state, this does not mean it failed", err))
        .finally(() => sftp.end());
} catch (error) {
    core.setFailed(error.message);
}

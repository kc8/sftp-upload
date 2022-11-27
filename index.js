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

const host = core.getInput('host');
const username = core.getInput('username');
const password = core.getInput('password');
const port = core.getInput('port');
const rawPaths = core.getInput('paths');
const paths = convertPaths(rawPaths);

const sftp = new SftpClient();
const connection = {
    host: host,
    port: port,
    username: username,
    password: password,
};
Object.keys(paths).forEach(localFile => {
    console.log(`Adding local file ${localFile}, to remove ${paths[localFile]}`);
    sftp.connect(connection)
        .then(async () => {
            try {
                await sftp.put(localFile, paths[localFile], {autoClose: true})
            }
            catch (putErr) {
                console.log("Failed to put file file:", localFile, " due to ", putErr.message);
            }
        })
        .then(data=> console.log(`File ${localFile} added`, data ? `Other info ${data}` : ''))
        .catch(err => console.log("Failed with error state (this may not indicate a failure for all files)", err))
        .finally(() => sftp.end());
});

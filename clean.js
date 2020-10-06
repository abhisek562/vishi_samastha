const del = require('del');
const fs = require('fs')


if (fs.existsSync('./vishi.apk')) {
    (async () => {
        const deletedPaths = await del(['vishi.apk']);
        console.log('Deleted files and directories:\n', deletedPaths.join('\n'));
        console.log('------------------ Building Android App ------------------');
    })();
}else {
    console.log('No File to delete\n');
    console.log('------------------ Building Android App ------------------');
}



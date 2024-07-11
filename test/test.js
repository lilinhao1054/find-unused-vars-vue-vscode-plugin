const fs = require('fs');
const path = require('path');
const fuvv = require('../main');

(async () => {
    const locArr = await fuvv(fs.readFileSync(path.resolve(__dirname, './cases/export-default.vue')).toString());
    console.log(locArr);
})()
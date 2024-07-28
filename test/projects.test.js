const assert = require('assert');
const fs = require('fs');
const path = require('path');
const fuvv = require('../main');

const getUsedVarInParents = require('../libs/getUsedVarInParents');

suite('Project test suite', () => {
  test('basic-test', async () => {
    const projectPath = path.resolve(__dirname, './projects/basic');
    const filePath = path.resolve(__dirname, './projects/basic/components/Header.vue');
    const usedIds = await getUsedVarInParents(projectPath, filePath);
    assert.deepEqual(usedIds, ['hi', 'say']);
  })
})
#!/usr/bin/env node


const execa = require('execa');
const transform = require.resolve('../transforms/add-style')
const isGitClean = require('is-git-clean');
const yargs = require('yargs-parser')
const fs = require('fs')

const jscodeshiftBin = require.resolve('.bin/jscodeshift');


async function ensureGitClean(dir) {
    let clean = false;
    try {
        clean = await isGitClean(dir);
    } catch (err) {
        if (err && err.stderr && err.stderr.toLowerCase().includes('not a git repository')) {
            clean = true;
        }
    }

    if (!clean) {
        console.log('请先 commit 或 stash 当前更改')
        process.exit(1);
    }
}

/**
 * --config=.carc
 */
async function start() {
    const dir = process.argv[2];
    const args = yargs(process.argv.slice(3));

    

    if (!dir || !fs.existsSync(dir)) {
        console.log('指定的路径不存在');
        process.exit(1);
    }

    await ensureGitClean(dir)

    const jscodeshiftArgs = [
        '--verbose=2',
        '--ignore-pattern=**/node_modules',
        '--extensions=tsx,ts,jsx,js',
        `--transform=${transform}`,
        '-d',//for debug
        args['config'],
        dir
    ].filter(Boolean)

    try {
        await execa(jscodeshiftBin, jscodeshiftArgs, {
            stdio: 'inherit',
            stripEof: false,
        })
    } catch (error) {
        console.error(error);
    }
}


start()
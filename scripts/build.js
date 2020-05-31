const { exec } = require('child_process');
const fs = require('fs');
const objectHash = require('object-hash');

const args = process.argv.slice(2);

function execute(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(stdout);
        console.error(stderr);
        reject(error);
      } else {
        console.warn(stderr);
        console.log(stdout);
        resolve();
      }
    });
  });
}

async function build() {
  console.log('cleaning…');
  await execute('rm -rf dist');

  console.log('installing…');
  await execute('npm i');

  console.log('linting…');
  await execute('npm run lint');

  console.log('generating types…');
  await execute('npx tsc');

  console.log('rolling…');
  await execute('npx rollup -c');

  console.log('copying readme…');
  const readme = await fs.promises.readFile('./README.md');
  await fs.promises.writeFile('./dist/README.md', readme);

  console.log('writing package.json…');
  const {
    devDependencies: _devDependencies,
    private: _private,
    scripts: _scripts,
    version: packageVersion,
    ...restOfPackageJson
  } = require('../package.json');

  const buildHash = objectHash({
    dependencies: restOfPackageJson.dependencies,
    standalone: (await fs.promises.readFile('./dist/index.esm.js')).toString(),
  }).substring(0, 9);

  const version = args.includes('--use-package-version')
    ? packageVersion
    : `0.0.0-${buildHash}`;

  await fs.promises.writeFile(
    './dist/package.json',
    JSON.stringify(
      {
        version,
        main: 'index.js',
        module: 'index.esm.js',
        ...restOfPackageJson,
      },
      null,
      2
    )
  );
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});

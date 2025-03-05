import { execSync } from 'child_process';

const targetVersion = process.env.npm_package_version;

console.log(`The target version is ${targetVersion}`);
console.log('Press any key to continue...');
process.stdin.resume().once('data', () => {
  try {
    execSync(`git tag -a ${targetVersion} -m "${targetVersion}"`, { stdio: 'inherit' });
    execSync(`git push origin ${targetVersion}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
});
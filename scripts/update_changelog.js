import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PACKAGE_JSON = resolve(ROOT, 'package.json');
const CHANGELOG_JSON = resolve(ROOT, 'public/changelog.json');

try {
    // 1. Get current version
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, 'utf-8'));
    const version = pkg.version;

    // 2. Get last commit message
    // %B: raw body (unwrapped subject and body)
    const commitMsg = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim();

    // 3. Read changelog
    let changelog = [];
    if (existsSync(CHANGELOG_JSON)) {
        try {
            changelog = JSON.parse(readFileSync(CHANGELOG_JSON, 'utf-8'));
        } catch (e) {
            console.warn('Could not parse existing changelog, starting fresh.');
        }
    }

    const today = new Date().toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    // 4. Update changelog
    // Check if latest entry is for current version
    const latest = changelog[0];

    // Format commit message into lines
    // Remove empty lines
    const changes = commitMsg.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    if (latest && latest.version === version) {
        // Update existing entry
        console.log(`Updating existing entry for v${version}`);
        latest.changes = changes;
        latest.date = today;
    } else {
        // Create new entry
        console.log(`Creating new entry for v${version}`);
        changelog.unshift({
            version,
            date: today,
            changes
        });
    }

    // 5. Write back
    writeFileSync(CHANGELOG_JSON, JSON.stringify(changelog, null, 2));
    console.log('Changelog updated successfully!');

} catch (error) {
    console.error('Error updating changelog:', error);
    process.exit(1);
}

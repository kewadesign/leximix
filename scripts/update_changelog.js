import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PACKAGE_JSON = resolve(ROOT, 'package.json');
const CHANGELOG_JSON = resolve(ROOT, 'public/changelog.json');

// Mapping Conventional Commits to User Friendly text
const TYPE_MAP = {
    'feat': '✨ Features',
    'fix': '🐞 Bugfixes',
    'ui': '🎨 Design',
    'perf': '⚡️ Performance',
    'chore': '🔧 Maintenance',
    'build': '👷 Build & Deploy',
    'refactor': '♻️ Code Cleanup',
    'docs': '📝 Documentation'
};

try {
    // 1. Get current version
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, 'utf-8'));
    const version = pkg.version;
    console.log(`📦 Current Version: v${version}`);

    // 2. Read existing changelog to preserve history
    let changelog = [];
    if (existsSync(CHANGELOG_JSON)) {
        try {
            changelog = JSON.parse(readFileSync(CHANGELOG_JSON, 'utf-8'));
        } catch (e) {
            console.warn('⚠️ Could not parse existing changelog, starting fresh.');
        }
    }

    // 3. Fetch Git History
    // Get last 100 commits with hash and subject
    const logOutput = execSync('git log -n 100 --pretty=format:"%h|%s"').toString().trim();
    const commits = logOutput.split('\n').map(line => {
        const [hash, msg] = line.split('|');
        return { hash, msg };
    });

    // 4. Determine commits for THIS version
    // We look for the last commit that WAS NOT this version (e.g. a previous release commit)
    // OR we just take everything if it's a new project
    
    let currentVersionCommits = [];
    
    // Heuristic: Stop when we see a commit that looks like a version bump for a DIFFERENT version
    // or if we hit a known hash from the previous changelog entry (if we stored it, but we don't)
    // So we'll scan until we find a commit starting with "vX.X.X" that isn't the current version
    
    for (const commit of commits) {
        const msg = commit.msg;
        
        // Check if this commit is a release of a DIFFERENT version
        // matches "v2.6.1" or "release 2.6.1" etc.
        const versionMatch = msg.match(/(?:v|release\s+)(\d+\.\d+\.\d+)/i);
        
        if (versionMatch) {
            const foundVersion = versionMatch[1];
            if (foundVersion !== version) {
                // Found a previous version boundary! Stop here.
                console.log(`🛑 Found previous release boundary: ${foundVersion} (${commit.hash})`);
                break;
            }
        }
        
        currentVersionCommits.push(commit);
    }

    if (currentVersionCommits.length === 0) {
        console.warn('⚠️ No commits found for current version. Using last commit as fallback.');
        currentVersionCommits.push(commits[0]);
    }

    // 5. Format Changes
    const categorizedChanges = {};
    const uncategorizedChanges = [];

    currentVersionCommits.forEach(commit => {
        const msg = commit.msg;
        // Conventional Commit Regex: type(scope): desc
        const match = msg.match(/^([a-z]+)(?:\([a-z0-9-]+\))?:\s*(.+)$/i);
        
        if (match) {
            const type = match[1].toLowerCase();
            const desc = match[2];
            
            if (TYPE_MAP[type]) {
                if (!categorizedChanges[type]) categorizedChanges[type] = [];
                categorizedChanges[type].push(desc);
            } else {
                uncategorizedChanges.push(msg);
            }
        } else {
            // Clean up "Merge branch..." or "Update codebase..." messages
            if (!msg.startsWith('Merge') && !msg.includes('Update codebase')) {
                 uncategorizedChanges.push(msg);
            }
        }
    });

    // Flatten into a list of strings
    let finalChanges = [];
    
    Object.keys(TYPE_MAP).forEach(type => {
        if (categorizedChanges[type] && categorizedChanges[type].length > 0) {
            finalChanges.push(`${TYPE_MAP[type]}`); // Header
            categorizedChanges[type].forEach(change => {
                finalChanges.push(`  • ${change}`);
            });
        }
    });

    if (uncategorizedChanges.length > 0) {
        if (finalChanges.length > 0) finalChanges.push('📋 Other');
        uncategorizedChanges.forEach(change => {
             finalChanges.push(`  • ${change}`);
        });
    }

    // If empty, add a default
    if (finalChanges.length === 0) {
        finalChanges.push('🚀 General improvements and bugfixes');
    }

    // 6. Update Changelog Array
    const today = new Date().toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const newEntry = {
        version,
        date: today,
        changes: finalChanges
    };

    // Remove existing entry for this version if it exists (to replace it)
    changelog = changelog.filter(entry => entry.version !== version);
    
    // Add new entry to top
    changelog.unshift(newEntry);

    // 7. Write back
    writeFileSync(CHANGELOG_JSON, JSON.stringify(changelog, null, 2));
    
    // Also copy to ionos_deploy if it exists
    const IONOS_CHANGELOG = resolve(ROOT, 'ionos_deploy/changelog.json');
    if (existsSync(dirname(IONOS_CHANGELOG))) {
        writeFileSync(IONOS_CHANGELOG, JSON.stringify(changelog, null, 2));
        console.log('✅ Copied to ionos_deploy/changelog.json');
    }

    console.log(`✅ Changelog updated for v${version} with ${currentVersionCommits.length} commits.`);

} catch (error) {
    console.error('❌ Error updating changelog:', error);
    process.exit(1);
}

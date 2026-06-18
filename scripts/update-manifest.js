import fs from 'fs';
import path from 'path';

const manifestPath = path.join(process.cwd(), 'dist', 'manifest.json');

function getVersionString() {
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}.${mm}${dd}.${hh}${min}`;
}

function updateManifest() {
    if (!fs.existsSync(manifestPath)) {
        console.error(`Error: Manifest file not found at ${manifestPath}`);
        process.exit(1);
    }

    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const newVersion = getVersionString();

        console.log(`Updating version from ${manifest.version} to ${newVersion}`);

        manifest.version = newVersion;

        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
        console.log('Successfully updated manifest version.');
    } catch (error) {
        console.error('Error updating manifest:', error);
        process.exit(1);
    }
}

updateManifest();

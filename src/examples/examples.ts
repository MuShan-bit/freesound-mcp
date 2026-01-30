import fs from 'fs';
import { searchSounds, downloadSound, downloadOriginalAudio } from '../tools/freesound.js';

async function testFreesoundAPI() {
    try {
        console.log('Testing Freesound API...');
        console.log('API Key:', process.env.FREESOUND_API_KEY ? 'Present' : 'Missing');

        // Test search functionality
        console.log('Testing searchSounds function...');
        const results = await searchSounds({
            query: 'piano'
        });

        console.log(`Found ${results.length} results:`);
        results.slice(0, 3).forEach((sound, index) => {
            console.log(`${index + 1}. ${sound.name}`);
            console.log(`   ID: ${sound.id}`);
            console.log(`   Duration: ${sound.duration}s`);
            console.log(`   License: ${sound.license}`);
            console.log(`   Preview: ${sound.preview}`);
            console.log('');
        });

        console.log('✅ Freesound API test successful!');

        // Test download functionality with first result
        if (results.length > 0) {
            console.log('\nTesting download functionality...');
            const firstSound = results[0];
            console.log(`Downloading: ${firstSound.name} (ID: ${firstSound.id})`);

            try {
                const downloadedPath = await downloadSound(firstSound.id);
                console.log(`✅ Downloaded preview MP3 to: ${downloadedPath}`);

                // Check file info
                const stats = fs.statSync(downloadedPath);
                console.log(`   File size: ${(stats.size / 1024).toFixed(2)} KB`);

            } catch (downloadError: any) {
                console.log(`⚠️  Download test failed: ${downloadError.message}`);
            }

            console.log('\n📝 Note: To download original high-quality audio files, you need:');
            console.log('   1. OAuth2 authentication (more complex setup)');
            console.log('   2. Use downloadOriginalAudio() function with an access token');
            console.log('   3. The current downloadSound() function downloads preview MP3s');
        }

    } catch (error: any) {
        console.error('❌ Freesound API test failed:', error.message);
        process.exit(1);
    }
}

testFreesoundAPI();
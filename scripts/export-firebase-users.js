/**
 * LexiMix - Firebase User Export Script
 * 
 * Run this script to export all users from Firebase Realtime Database
 * Usage: node scripts/export-firebase-users.js
 * 
 * Prerequisites:
 * 1. Install firebase-admin: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
// Make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable
// or pass the service account key directly
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : require('./firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://leximix-aecac-default-rtdb.europe-west1.firebasedatabase.app'
});

const db = admin.database();

async function exportUsers() {
    console.log('🔄 Exporting users from Firebase...');
    
    try {
        // Get all users
        const usersSnapshot = await db.ref('users').once('value');
        const usersData = usersSnapshot.val();
        
        if (!usersData) {
            console.log('❌ No users found in database');
            return;
        }
        
        const userCount = Object.keys(usersData).length;
        console.log(`📊 Found ${userCount} users`);
        
        // Export to JSON
        const exportData = {
            exportedAt: new Date().toISOString(),
            userCount: userCount,
            users: usersData
        };
        
        const outputPath = path.join(__dirname, 'firebase-users-export.json');
        fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
        
        console.log(`✅ Users exported to: ${outputPath}`);
        
        // Summary
        let premiumCount = 0;
        let withFriendCode = 0;
        
        for (const username in usersData) {
            const user = usersData[username];
            if (user.saves?.current?.isPremium || user.isPremium) premiumCount++;
            if (user.friendCode || user.saves?.current?.friendCode) withFriendCode++;
        }
        
        console.log(`\n📈 Summary:`);
        console.log(`   Total Users: ${userCount}`);
        console.log(`   Premium Users: ${premiumCount}`);
        console.log(`   With Friend Code: ${withFriendCode}`);
        
    } catch (error) {
        console.error('❌ Export failed:', error);
    }
    
    process.exit(0);
}

exportUsers();

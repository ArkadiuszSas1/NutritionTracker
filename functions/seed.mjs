import admin from 'firebase-admin';

// Tell the Admin SDK to use the local emulators
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

admin.initializeApp({
    projectId: 'nutritiontracker-706c4'
});

const auth = admin.auth();
const db = admin.firestore();

async function seedDatabase() {
    console.log('🌱 Starting database seed script...\n');

    try {
        // 1. Create a User
        console.log('Creating test user (test@test.com / password)...');
        let uid;
        try {
            const user = await auth.createUser({
                email: 'test@test.com',
                password: 'password',
                displayName: 'Test User'
            });
            uid = user.uid;
            console.log(`✅ User created successfully (UID: ${uid})`);
        } catch (authErr) {
            if (authErr.code === 'auth/email-already-exists') {
                console.log('⚠️ User already exists. Fetching existing UID...');
                const user = await auth.getUserByEmail('test@test.com');
                uid = user.uid;
            } else {
                throw authErr;
            }
        }

        // 2. Add some test meals
        console.log('\nAdding sample meal data...');
        const batch = db.batch();
        const mealsRef = db.collection(`users/${uid}/meals`);

        const today = new Date().toISOString().split('T')[0];

        const meals = [
            {
                id: 'meal-1',
                date: today,
                time: '08:30',
                foodName: 'Oatmeal & Blueberries',
                calories: 320,
                protein: 10,
                carbs: 55,
                fat: 6,
                fiber: 8,
                novaGrade: 1
            },
            {
                id: 'meal-2',
                date: today,
                time: '12:45',
                foodName: 'Grilled Chicken Salad',
                calories: 450,
                protein: 40,
                carbs: 15,
                fat: 25,
                fiber: 5,
                novaGrade: 1
            },
            {
                id: 'meal-3',
                date: today,
                time: '19:00',
                foodName: 'Salmon and Quinoa',
                calories: 600,
                protein: 45,
                carbs: 40,
                fat: 28,
                novaGrade: 1
            }
        ];

        for (const meal of meals) {
            const docRef = mealsRef.doc(meal.id);
            batch.set(docRef, meal);
        }

        await batch.commit();
        console.log('✅ Added 3 sample meals to Firestore.');

        console.log('\n🎉 Seeding complete! You can now log into http://localhost:5173 with:');
        console.log('Email: test@test.com');
        console.log('Password: password');

        process.exit(0);
    } catch (e) {
        console.error('\n❌ Error during seeding:', e);
        process.exit(1);
    }
}

seedDatabase();

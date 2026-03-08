import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { MealEntry } from '../types';

export class FirestoreService {
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    private getMealsCollectionRef() {
        return collection(db, `users/${this.userId}/meals`);
    }

    public async getMeals(): Promise<MealEntry[]> {
        try {
            const querySnapshot = await getDocs(this.getMealsCollectionRef());
            const meals: MealEntry[] = [];
            querySnapshot.forEach((docSnap) => {
                meals.push(docSnap.data() as MealEntry);
            });
            // Try sorting by date descending
            return meals.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
                const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
                return dateB.getTime() - dateA.getTime();
            });
        } catch (e) {
            console.error('Error getting meals from Firestore', e);
            return [];
        }
    }

    public async addMeal(meal: MealEntry): Promise<void> {
        try {
            const docRef = doc(db, `users/${this.userId}/meals`, meal.id);
            await setDoc(docRef, meal);
        } catch (e) {
            console.error('Error adding meal to Firestore', e);
            throw e;
        }
    }

    public async deleteMeal(id: string): Promise<void> {
        try {
            const docRef = doc(db, `users/${this.userId}/meals`, id);
            await deleteDoc(docRef);
        } catch (e) {
            console.error('Error deleting meal from Firestore', e);
            throw e;
        }
    }

    public async updateMeal(meal: MealEntry): Promise<void> {
        try {
            const docRef = doc(db, `users/${this.userId}/meals`, meal.id);
            // using setDoc with merge: true acts as an upsert/update
            await setDoc(docRef, meal, { merge: true });
        } catch (e) {
            console.error('Error updating meal in Firestore', e);
            throw e;
        }
    }
}

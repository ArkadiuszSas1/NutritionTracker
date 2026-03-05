# Requirements: Nutrition Counter Web Application

## 1. Overview
A web-based application designed to help users track their daily nutrition intake by maintaining a digital food diary. The app simplifies data entry by leveraging AI for image recognition to automatically estimate the nutritional value of meals.

## 2. Core Features
- **Daily Dashboard**: Users can view their total nutritional intake (calories, macros, etc.) for the current day.
- **Meal Diary**: Users can add distinct meals to their diary, with the ability to include custom comments for context (e.g., "half portion", "200g").
- **Historical View**: Users can select specific dates to view past nutritional intake and read their previous comments.
- **Image Capture & Upload**: Users can take a live photo of their meal or upload an existing image from their device gallery.

## 3. AI & Image Recognition
- **Food Recognition**: The application will use the Google Gemini API to analyze meal photos.
- **Nutritional Structure**: Automatically extract food items and estimate their nutritional values (calories, protein, carbs, fats) based on the image.
- **API Integration**: Utilize a hardcoded API key for authenticating with the Gemini API.

## 4. Technical Stack & Deployment
- **Frontend Architecture**: React combined with Vite for modern, ultra-fast development and build tooling.
- **Language**: TypeScript for type safety, better developer experience, and fewer bugs.
- **Styling**: Tailwind CSS for rapid styling, a utility-first approach, and consistent, responsive design.
- **Hosting/Deployment**: Deployed on Netlify, easily integrated directly via GitHub for continuous deployment, providing global CDN distribution and robust serverless functions if needed.

## 5. Data Storage & Authentication
- **User Authentication**: Implement Google OAuth to authenticate users securely.
- **Data Persistence**: Use the Google Sheets API as the primary database to store user meal data, requiring the user to grant permission to their Google account during authentication.

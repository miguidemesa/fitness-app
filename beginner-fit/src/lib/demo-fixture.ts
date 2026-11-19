// DEMO-FIXTURE (temporary, simulator testing without Supabase). Delete this file and the DEMO-FIXTURE lines in supabase.ts.
import type { ExerciseDetail, SavedPlan } from '@/lib/supabase';

export const DEMO_EXERCISES: Record<string, ExerciseDetail> = {
 "Goblet_Squat": {
  "id": "Goblet_Squat",
  "name": "Goblet Squat",
  "equipment": "kettlebells",
  "primaryMuscles": [
   "quadriceps"
  ],
  "instructions": [
   "Stand holding a light kettlebell by the horns close to your chest. This will be your starting position.",
   "Squat down between your legs until your hamstrings are on your calves. Keep your chest and head up and your back straight.",
   "At the bottom position, pause and use your elbows to push your knees out. Return to the starting position, and repeat for 10-20 repetitions."
  ],
  "images": [
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg",
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/1.jpg"
  ]
 },
 "Pushups": {
  "id": "Pushups",
  "name": "Pushups",
  "equipment": "body only",
  "primaryMuscles": [
   "chest"
  ],
  "instructions": [
   "Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length.",
   "Next, lower yourself downward until your chest almost touches the floor as you inhale.",
   "Now breathe out and press your upper body back up to the starting position while squeezing your chest.",
   "After a brief pause at the top contracted position, you can begin to lower yourself downward again for as many repetitions as needed."
  ],
  "images": [
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg",
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/1.jpg"
  ]
 },
 "Bent_Over_Two-Dumbbell_Row": {
  "id": "Bent_Over_Two-Dumbbell_Row",
  "name": "Bent Over Two-Dumbbell Row",
  "equipment": "dumbbell",
  "primaryMuscles": [
   "middle back"
  ],
  "instructions": [
   "With a dumbbell in each hand (palms facing your torso), bend your knees slightly and bring your torso forward by bending at the waist; as you bend make sure to keep your back straight until it is almost parallel to the floor. Tip: Make sure that you keep the head up. The weights should hang directly in front of you as your arms hang perpendicular to the floor and your torso. This is your starting position.",
   "While keeping the torso stationary, lift the dumbbells to your side (as you breathe out), keeping the elbows close to the body (do not exert any force with the forearm other than holding the weights). On the top contracted position, squeeze the back muscles and hold for a second.",
   "Slowly lower the weight again to the starting position as you inhale.",
   "Repeat for the recommended amount of repetitions."
  ],
  "images": [
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row/0.jpg",
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row/1.jpg"
  ]
 },
 "Butt_Lift_Bridge": {
  "id": "Butt_Lift_Bridge",
  "name": "Butt Lift (Bridge)",
  "equipment": "body only",
  "primaryMuscles": [
   "glutes"
  ],
  "instructions": [
   "Lie flat on the floor on your back with the hands by your side and your knees bent. Your feet should be placed around shoulder width. This will be your starting position.",
   "Pushing mainly with your heels, lift your hips off the floor while keeping your back straight. Breathe out as you perform this part of the motion and hold at the top for a second.",
   "Slowly go back to the starting position as you breathe in."
  ],
  "images": [
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butt_Lift_Bridge/0.jpg",
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butt_Lift_Bridge/1.jpg"
  ]
 },
 "Plank": {
  "id": "Plank",
  "name": "Plank",
  "equipment": "body only",
  "primaryMuscles": [
   "abdominals"
  ],
  "instructions": [
   "Get into a prone position on the floor, supporting your weight on your toes and your forearms. Your arms are bent and directly below the shoulder.",
   "Keep your body straight at all times, and hold this position as long as possible. To increase difficulty, an arm or leg can be raised."
  ],
  "images": [
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"
  ]
 },
 "Dumbbell_Lunges": {
  "id": "Dumbbell_Lunges",
  "name": "Dumbbell Lunges",
  "equipment": "dumbbell",
  "primaryMuscles": [
   "quadriceps"
  ],
  "instructions": [
   "Stand with your torso upright holding two dumbbells in your hands by your sides. This will be your starting position.",
   "Step forward with your right leg around 2 feet or so from the foot being left stationary behind and lower your upper body down, while keeping the torso upright and maintaining balance. Inhale as you go down. Note: As in the other exercises, do not allow your knee to go forward beyond your toes as you come down, as this will put undue stress on the knee joint. Make sure that you keep your front shin perpendicular to the ground.",
   "Using mainly the heel of your foot, push up and go back to the starting position as you exhale.",
   "Repeat the movement for the recommended amount of repetitions and then perform with the left leg."
  ],
  "images": [
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg",
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/1.jpg"
  ]
 },
 "Seated_Dumbbell_Press": {
  "id": "Seated_Dumbbell_Press",
  "name": "Seated Dumbbell Press",
  "equipment": "dumbbell",
  "primaryMuscles": [
   "shoulders"
  ],
  "instructions": [
   "Grab a couple of dumbbells and sit on a military press bench or a utility bench that has a back support on it as you place the dumbbells upright on top of your thighs.",
   "Clean the dumbbells up one at a time by using your thighs to bring the dumbbells up to shoulder height at each side.",
   "Rotate the wrists so that the palms of your hands are facing forward. This is your starting position.",
   "As you exhale, push the dumbbells up until they touch at the top.",
   "After a second pause, slowly come down back to the starting position as you inhale.",
   "Repeat for the recommended amount of repetitions."
  ],
  "images": [
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Press/0.jpg",
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Dumbbell_Press/1.jpg"
  ]
 },
 "Bodyweight_Squat": {
  "id": "Bodyweight_Squat",
  "name": "Bodyweight Squat",
  "equipment": "body only",
  "primaryMuscles": [
   "quadriceps"
  ],
  "instructions": [
   "Stand with your feet shoulder width apart. You can place your hands behind your head. This will be your starting position.",
   "Begin the movement by flexing your knees and hips, sitting back with your hips.",
   "Continue down to full depth if you are able,and quickly reverse the motion until you return to the starting position. As you squat, keep your head and chest up and push your knees out."
  ],
  "images": [
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Squat/0.jpg",
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Squat/1.jpg"
  ]
 },
 "Dumbbell_Bench_Press": {
  "id": "Dumbbell_Bench_Press",
  "name": "Dumbbell Bench Press",
  "equipment": "dumbbell",
  "primaryMuscles": [
   "chest"
  ],
  "instructions": [
   "Lie down on a flat bench with a dumbbell in each hand resting on top of your thighs. The palms of your hands will be facing each other.",
   "Then, using your thighs to help raise the dumbbells up, lift the dumbbells one at a time so that you can hold them in front of you at shoulder width.",
   "Once at shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. The dumbbells should be just to the sides of your chest, with your upper arm and forearm creating a 90 degree angle. Be sure to maintain full control of the dumbbells at all times. This will be your starting position.",
   "Then, as you breathe out, use your chest to push the dumbbells up. Lock your arms at the top of the lift and squeeze your chest, hold for a second and then begin coming down slowly. Tip: Ideally, lowering the weight should take about twice as long as raising it.",
   "Repeat the movement for the prescribed amount of repetitions of your training program."
  ],
  "images": [
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg",
   "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/1.jpg"
  ]
 }
};

export const DEMO_PLAN = {
 "id": "demo-plan",
 "week": 1,
 "source": "ai",
 "days": [
  [
   {
    "exerciseId": "Goblet_Squat",
    "sets": 3,
    "reps": 10
   },
   {
    "exerciseId": "Pushups",
    "sets": 3,
    "reps": 8
   },
   {
    "exerciseId": "Bent_Over_Two-Dumbbell_Row",
    "sets": 3,
    "reps": 10
   },
   {
    "exerciseId": "Butt_Lift_Bridge",
    "sets": 2,
    "reps": 12
   },
   {
    "exerciseId": "Plank",
    "sets": 2,
    "reps": 30
   }
  ],
  [
   {
    "exerciseId": "Dumbbell_Lunges",
    "sets": 3,
    "reps": 10
   },
   {
    "exerciseId": "Seated_Dumbbell_Press",
    "sets": 3,
    "reps": 10
   },
   {
    "exerciseId": "Bodyweight_Squat",
    "sets": 3,
    "reps": 12
   },
   {
    "exerciseId": "Plank",
    "sets": 2,
    "reps": 30
   }
  ],
  [
   {
    "exerciseId": "Dumbbell_Bench_Press",
    "sets": 3,
    "reps": 10
   },
   {
    "exerciseId": "Goblet_Squat",
    "sets": 3,
    "reps": 10
   },
   {
    "exerciseId": "Butt_Lift_Bridge",
    "sets": 3,
    "reps": 12
   }
  ]
 ],
 "note": "Week one is about learning the moves. Go light, and stop if anything hurts.",
 "changes": [],
 "see_professional": false
} as SavedPlan;

# Silta App - Project Structure

## Overview
Silta is a React + TypeScript face recognition app that helps users recognize people by storing their face descriptors and matching them in real-time using face-api.js.

## Tech Stack
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **AI Library**: face-api.js (face detection & recognition)
- **Icons**: lucide-react

## Project Structure

```
silta-app/
├── public/
│   └── models/                    # AI model weights (face-api.js)
│       ├── ssd_mobilenetv1_model-shard1
│       ├── face_landmark_68_model-shard1
│       └── face_recognition_model-shard1
│
├── src/
│   ├── main.tsx                   # React entry point
│   ├── App.tsx                    # Main app component (orchestrator)
│   ├── types.ts                   # TypeScript type definitions
│   │
│   ├── components/                # UI Components (Screen-level)
│   │   ├── LoadingScreen.tsx      # Shows while AI models load
│   │   ├── HomeScreen.tsx         # Main menu (recognize/profile buttons)
│   │   ├── CameraScreen.tsx       # Camera view with face tracking overlay
│   │   ├── RecognizedScreen.tsx   # Shows recognized person details
│   │   ├── ProfilesScreen.tsx    # Lists all saved profiles
│   │   └── AddProfileScreen.tsx   # Form to add new person
│   │
│   ├── hooks/                     # Custom React Hooks (Business Logic)
│   │   ├── useModels.ts           # Loads face-api.js AI models
│   │   ├── useCamera.ts           # Manages camera stream & mode
│   │   ├── useFaceDetection.ts    # Real-time face detection & tracking
│   │   ├── useFaceRecognition.ts  # One-time face recognition (button click)
│   │   └── useProfileCapture.ts   # Captures photo & extracts face descriptor
│   │
│   └── utils/                     # Utility Functions
│       └── imageUtils.ts          # Image processing helpers
│
└── [config files: package.json, tsconfig.json, vite.config.ts, tailwind.config.js]
```

## Architecture Flow

### 1. **App.tsx** (Main Orchestrator)
- Manages global state: `screen`, `profiles`, `recognizedPerson`, `newProfile`
- Coordinates all hooks and components
- Handles navigation between screens
- **Where to add**: New screens, global state management, navigation logic

### 2. **Types** (`types.ts`)
- `Profile`: Saved person with face descriptor
- `NewProfile`: Form data for adding new person
- `FaceBox`: Face bounding box with coordinates & styling
- `Screen`: Navigation state type
- `CameraMode`: 'recognize' | 'capture' | null
- **Where to add**: New data structures, type definitions

### 3. **Hooks** (Business Logic Layer)

#### `useModels.ts`
- **Purpose**: Loads face-api.js AI models on app startup
- **Returns**: `modelsLoaded` boolean
- **Where to add**: Model configuration, loading states, error handling

#### `useCamera.ts`
- **Purpose**: Manages camera stream lifecycle
- **State**: `cameraStream`, `cameraMode`, `videoRef`
- **Methods**: `startCamera(mode)`, `stopCamera()`
- **Where to add**: Camera permissions, different camera sources, video settings

#### `useFaceDetection.ts`
- **Purpose**: Real-time continuous face detection & recognition (runs every 200ms)
- **Input**: `cameraMode`, `cameraStream`, `profiles`, `videoRef`
- **Returns**: `FaceBox | null` (with coordinates, label, color, badge)
- **Logic**: Detects face → matches against profiles → returns bounding box
- **Where to add**: Detection interval tuning, recognition threshold, multiple faces

#### `useFaceRecognition.ts`
- **Purpose**: One-time face recognition on button click
- **Input**: `profiles` array
- **State**: `isScanning`, `statusMessage`
- **Method**: `performRecognition(videoElement, onRecognized)`
- **Where to add**: Recognition confidence levels, multiple matches, recognition history

#### `useProfileCapture.ts`
- **Purpose**: Captures photo from video and extracts face descriptor
- **State**: `capturedPhoto`, `statusMessage`
- **Method**: `captureAndAnalyzeProfile(video, canvas, callback)`
- **Where to add**: Photo editing, multiple photos per profile, photo validation

### 4. **Components** (UI Layer)

#### `LoadingScreen.tsx`
- **Purpose**: Shows while AI models are loading
- **Props**: None
- **Where to add**: Progress indicators, loading animations

#### `HomeScreen.tsx`
- **Purpose**: Main menu with navigation options
- **Props**: `profiles`, `onRecognizeClick`, `onProfilesClick`
- **Where to add**: New menu items, quick actions, statistics

#### `CameraScreen.tsx`
- **Purpose**: Displays camera feed with face tracking overlay
- **Props**: `videoRef`, `canvasRef`, `cameraMode`, `faceBox`, `statusMessage`, `isScanning`, handlers
- **Features**: Face bounding box overlay, name badges, scanning indicator
- **Where to add**: Camera controls, filters, recording, multiple face tracking

#### `RecognizedScreen.tsx`
- **Purpose**: Shows recognized person's details
- **Props**: `recognizedPerson`, `onHome`, `onScanAnother`
- **Where to add**: Additional info display, actions (call, message), history

#### `ProfilesScreen.tsx`
- **Purpose**: Lists all saved profiles
- **Props**: `profiles`, `onHome`, `onAddProfile`
- **Where to add**: Profile editing, deletion, search, sorting, grouping

#### `AddProfileScreen.tsx`
- **Purpose**: Form to add new person with photo capture
- **Props**: `newProfile`, `capturedPhoto`, handlers for form & photo
- **Where to add**: Form validation, additional fields, photo editing, bulk import

## Data Flow

### Recognition Flow:
1. User clicks "Recognize" → `HomeScreen` → `App.tsx` → `startCamera('recognize')`
2. `CameraScreen` renders → `useFaceDetection` runs continuously
3. Face detected → matched against `profiles` → `faceBox` updated
4. User clicks "Tap to Identify" → `useFaceRecognition.performRecognition()`
5. Match found → `setRecognizedPerson()` → navigate to `RecognizedScreen`

### Add Profile Flow:
1. User clicks "Add Person" → `AddProfileScreen`
2. User clicks "Take Photo" → `startCamera('capture')` → `CameraScreen`
3. User captures photo → `useProfileCapture.captureAndAnalyzeProfile()`
4. Face descriptor extracted → back to `AddProfileScreen`
5. User fills form → `handleAddProfile()` → profile added to state

## State Management

All state is managed in `App.tsx` using React hooks:
- **Global State**: `screen`, `profiles`, `recognizedPerson`, `newProfile`
- **Hook State**: Each hook manages its own internal state
- **No external state management** (Redux, Zustand, etc.)

## Where to Add Features

### **New Screen/Page**
→ Create component in `components/`
→ Add screen type to `types.ts` (`Screen` type)
→ Add navigation logic in `App.tsx`

### **New Camera Feature**
→ Modify `useCamera.ts` or create new hook
→ Update `CameraScreen.tsx` UI

### **Face Detection Improvements**
→ Modify `useFaceDetection.ts`
→ Adjust interval, threshold, or add multi-face support

### **Profile Management**
→ Add functions in `App.tsx` or create `useProfiles.ts` hook
→ Update `ProfilesScreen.tsx` or `AddProfileScreen.tsx`

### **Data Persistence**
→ Create `utils/storage.ts` or `hooks/useStorage.ts`
→ Integrate in `App.tsx` for profile persistence

### **API Integration**
→ Create `utils/api.ts` or `hooks/useApi.ts`
→ Add to profile management in `App.tsx`

### **New UI Components**
→ Create in `components/` (reusable) or inline in screen components
→ Use Tailwind CSS for styling

### **Image Processing**
→ Add functions to `utils/imageUtils.ts`
→ Use in `useProfileCapture.ts` or components

## Key Patterns

1. **Screen-based Navigation**: `App.tsx` conditionally renders screens based on `screen` state
2. **Hook Composition**: Business logic separated into reusable hooks
3. **Props Drilling**: State and handlers passed as props (no context currently)
4. **Real-time Updates**: `useFaceDetection` uses `setInterval` for continuous detection
5. **Type Safety**: All components and hooks are fully typed with TypeScript

## Dependencies

- **face-api.js**: Face detection, landmarks, recognition
- **lucide-react**: Icon library
- **Tailwind CSS**: Utility-first CSS framework
- **React 19**: UI framework
- **TypeScript**: Type safety

## Entry Points

- **Development**: `npm run dev` → `main.tsx` → `App.tsx`
- **Production**: `npm run build` → Vite bundles everything
# Silta App - Quick Reference for LLM

## Project Type
React + TypeScript face recognition app using face-api.js

## File Structure & Responsibilities

### Core Files
- **`src/App.tsx`**: Main orchestrator - manages state, navigation, coordinates hooks/components
- **`src/types.ts`**: All TypeScript types (Profile, FaceBox, Screen, CameraMode)

### Hooks (`src/hooks/`)
- **`useModels.ts`**: Loads AI models → returns `modelsLoaded`
- **`useCamera.ts`**: Camera stream management → returns `{cameraStream, cameraMode, videoRef, startCamera, stopCamera}`
- **`useFaceDetection.ts`**: Real-time face detection (200ms interval) → returns `FaceBox | null`
- **`useFaceRecognition.ts`**: One-time recognition on click → `performRecognition()`
- **`useProfileCapture.ts`**: Capture photo + extract descriptor → `captureAndAnalyzeProfile()`

### Components (`src/components/`)
- **`LoadingScreen.tsx`**: Shows while models load
- **`HomeScreen.tsx`**: Main menu
- **`CameraScreen.tsx`**: Camera view with face tracking overlay
- **`RecognizedScreen.tsx`**: Shows recognized person
- **`ProfilesScreen.tsx`**: Lists all profiles
- **`AddProfileScreen.tsx`**: Form to add new person

### Utils (`src/utils/`)
- **`imageUtils.ts`**: Image processing helpers

## Where to Add Features

| Feature Type | Location |
|-------------|----------|
| New screen/page | `components/` + add to `Screen` type + `App.tsx` navigation |
| Camera features | `useCamera.ts` or `CameraScreen.tsx` |
| Face detection | `useFaceDetection.ts` |
| Recognition logic | `useFaceRecognition.ts` |
| Profile management | `App.tsx` or new `useProfiles.ts` hook |
| Data persistence | New `utils/storage.ts` or `hooks/useStorage.ts` |
| API calls | New `utils/api.ts` or `hooks/useApi.ts` |
| UI components | `components/` (reusable) or inline in screens |
| Image processing | `utils/imageUtils.ts` |

## Data Flow
1. **Recognition**: Home → Camera → `useFaceDetection` (continuous) → `useFaceRecognition` (on click) → RecognizedScreen
2. **Add Profile**: Profiles → AddProfile → Camera → `useProfileCapture` → Form → Save to state

## State Management
- All state in `App.tsx` (no Redux/Zustand)
- Hooks manage their own internal state
- Props passed down to components

## Key Patterns
- Screen-based navigation (conditional rendering in `App.tsx`)
- Hook composition (business logic in hooks)
- Type-safe with TypeScript
- Real-time updates via `setInterval` in `useFaceDetection`


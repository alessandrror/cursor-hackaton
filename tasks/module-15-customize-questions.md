# Module 15: Customize Question Count

## Overview

Allow users to customize the number of quiz questions generated based on their study material. Instead of automatically determining the question count based on word count, present users with a preview and option to adjust before generating questions.

## Requirements

### User Experience
- Show a preview of how many questions will be generated based on text length
- Allow users to adjust the question count before generation
- Provide reasonable bounds (minimum 3, maximum 25 questions)
- Show estimated reading time correlation with question count

### Technical Implementation
- Add question count customization to the quiz generation flow
- Update the generate-questions API to accept a custom question count
- Modify the UI to show preview and customization options
- Maintain backward compatibility with automatic generation

## Implementation Steps

### 1. Update Question Generation API
**File**: `app/api/generate-questions/route.ts`
- Add optional `questionCount` parameter to the API
- Update the prompt to use the custom count instead of calculated count
- Maintain fallback to automatic calculation if no count provided

### 2. Add Question Count State Management
**File**: `types/session.ts`
- Add `customQuestionCount?: number` to SessionState
- Add action to set custom question count

### 3. Create Question Count Preview Component
**File**: `components/quiz/QuestionCountPreview.tsx`
- Show estimated question count based on text length
- Allow user to adjust count with slider or input
- Display reading time correlation
- Show "Generate Questions" button

### 4. Update Quiz Form Component
**File**: `components/quiz/QuizForm.tsx`
- Show QuestionCountPreview when no questions exist
- Pass custom question count to generation API
- Handle the preview-to-quiz transition

### 5. Update Session Provider
**File**: `providers/SessionProvider.tsx`
- Add customQuestionCount state management
- Add setter function for custom question count

## User Flow

1. User provides study material (text/PDF)
2. System shows: "This text will generate X questions. Customize or proceed?"
3. User can adjust question count (3-25 range)
4. User clicks "Generate Questions" with custom count
5. Questions are generated with the specified count
6. User proceeds to quiz as normal

## Success Criteria

- ✅ Users can customize question count before generation
- ✅ Preview shows reasonable estimate based on text length
- ✅ Custom count is respected in question generation
- ✅ UI is intuitive and doesn't disrupt existing flow
- ✅ Backward compatibility maintained for automatic generation

## Implementation Status: COMPLETED ✅

All requirements have been successfully implemented:

1. **Question Generation API**: Updated to accept custom question count parameter
2. **State Management**: Added customQuestionCount to session state
3. **QuestionCountPreview Component**: Created with slider, input, and advanced dialog
4. **QuizForm Integration**: Seamlessly integrated preview into quiz generation flow
5. **UI Components**: Added Radix UI Slider component for smooth interaction

The feature is now fully functional and ready for use.

## Edge Cases

- Very short texts (< 100 words) → minimum 3 questions
- Very long texts (> 5000 words) → maximum 25 questions
- User cancels customization → fall back to automatic count
- Invalid input → show validation and fallback to automatic

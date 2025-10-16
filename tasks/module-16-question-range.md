# Module 16: Question Range Configuration

## Overview

Replace the single question count customization with a range-based approach. Users will configure a minimum and maximum question range (5-100) when they first start a quiz, and the system will generate questions within that range. This range can be adjusted in the settings.

## Requirements

### User Experience
- Show range configuration dialog when starting quiz for the first time
- Allow users to set minimum (5-50) and maximum (5-50) question counts
- Generate questions within the specified range
- Store range preferences in settings for future use
- Allow range modification in settings page

### Technical Implementation
- Add question range to session state and settings
- Update question generation to use range instead of fixed count
- Create range configuration component
- Integrate range settings into settings page
- Remove old single-count customization

## Implementation Steps

### 1. Update Types and State Management
**File**: `types/session.ts`
- Add `questionRange?: { min: number; max: number }` to SessionState
- Add action to set question range

**File**: `providers/SessionProvider.tsx`
- Add question range state management
- Add setter function for question range

### 2. Create Question Range Configuration Component
**File**: `components/quiz/QuestionRangeConfig.tsx`
- Show range configuration dialog on first quiz start
- Allow users to set min (5-100) and max (5-100) values
- Validate that min <= max
- Show preview of range and estimated time
- Store range in session state

### 3. Update Question Generation API
**File**: `app/api/generate-questions/route.ts`
- Accept `questionRange` parameter instead of `questionCount`
- Generate random number of questions within the range
- Maintain fallback to automatic calculation if no range provided

### 4. Update Quiz Form Logic
**File**: `components/quiz/QuizForm.tsx`
- Show QuestionRangeConfig when no questions exist and no range is set
- Pass question range to generation API
- Remove old QuestionCountPreview integration

### 5. Update Settings Page
**File**: `components/settings/SettingsView.tsx`
- Add question range configuration section
- Allow users to modify their preferred range
- Show current range settings
- Persist range changes

## User Flow

1. **First-time users**: Welcome dialog appears asking to set question preferences (5-50 questions)
2. User sets minimum (e.g., 10) and maximum (e.g., 30) questions
3. **Subsequent quizzes**: System automatically generates questions within the configured range
4. **Range changes**: Users can modify preferences anytime in Settings page
5. **Default behavior**: If no range is set, uses default range (10-20 questions)

## Success Criteria

- ✅ **Simplified flow**: Ask for preferences only once on first use
- ✅ **First-time setup**: Welcome dialog for new users
- ✅ Questions are generated within the specified range
- ✅ Range preferences are stored and persist across sessions
- ✅ Range can be modified in settings only
- ✅ Range validation prevents invalid configurations
- ✅ Smooth integration with existing quiz flow
- ✅ **Default behavior**: Uses 10-20 range if no preferences set

## Implementation Status: COMPLETED ✅

All requirements have been successfully implemented:

1. **Question Range State Management**: Added `questionRange` to SessionState with proper actions
2. **First-Time Setup Dialog**: Welcome dialog appears only once for new users to set preferences
3. **Updated Question Generation API**: Now accepts range and generates random count within range
4. **Simplified Quiz Flow**: Auto-generates questions using configured range or default (10-20)
5. **Settings Page Integration**: Full range configuration in settings with current range display
6. **Range Validation**: Prevents invalid ranges (min > max, out of bounds)
7. **Time Estimation**: Shows estimated completion time for different question counts
8. **SetupWrapper Component**: Manages first-time setup state using localStorage
9. **Default Behavior**: Uses 10-20 range if no preferences are configured

The feature is now fully functional with a simplified, user-friendly flow.

## Edge Cases

- **First-time setup skipped**: Uses default range (10-20) automatically
- **Invalid range (min > max)**: Show validation error in setup or settings
- **No range set**: Uses default range (10-20) for question generation
- **Range modification in settings**: Applies to next quiz generation
- **Setup completion tracking**: Uses localStorage to remember setup status

<!-- Full Project Localization Implementation -->
# Module 12: Localization (i18n) with next-intl

## Scope

Implement comprehensive internationalization across the entire application including:
- All UI strings (buttons, labels, titles, descriptions, toasts)
- OpenAI prompts to generate localized questions/answers
- Error messages and validation messages
- Page metadata (titles, descriptions)
- Dynamic content (score messages, difficulty labels, etc.)
- Language selector component with cookie persistence

## Target Languages

- English (en) - default
- Spanish (es) - initial additional language
- Structure supports easy addition of more languages

## Files to Create

- `i18n.ts` - locale configuration
- `middleware.ts` - next-intl middleware for locale detection
- `messages/en.json` - English translations (all app strings)
- `messages/es.json` - Spanish translations (all app strings)
- `components/LanguageSwitcher.tsx` - language selector component

## Files to Modify

- `next.config.ts` - add next-intl to optimizePackageImports
- `app/layout.tsx` - wrap with NextIntlClientProvider, add locale param
- `app/page.tsx` - add generateMetadata for i18n
- `app/read/page.tsx` - add generateMetadata for i18n
- `app/quiz/page.tsx` - add generateMetadata for i18n
- `app/results/page.tsx` - add generateMetadata for i18n
- `components/input/InputStep.tsx` - use useTranslations('input', 'toast')
- `components/reader/Reader.tsx` - use useTranslations('reader')
- `components/reader/Timer.tsx` - use useTranslations('timer')
- `components/quiz/QuizForm.tsx` - use useTranslations('quiz', 'toast')
- `components/results/ResultsView.tsx` - use useTranslations('results')
- `lib/openai.ts` - add locale parameter for localized question generation

## Implementation Steps

### 1. Install next-intl
```bash
npm install next-intl
```

### 2. Create locale configuration (i18n.ts)
- Export defaultLocale = 'en'
- Export locales array ['en', 'es']
- Export Locale type

### 3. Create middleware for locale detection
- Use next-intl createMiddleware
- Configure localePrefix: 'as-needed'
- Matcher excludes api, _next, _vercel, static files

### 4. Create comprehensive message files
- messages/en.json with all English strings organized by namespace
- messages/es.json with all Spanish translations
- Namespaces: common, input, reader, quiz, results, toast, metadata, languageSwitcher
- Use ICU message format for plurals and interpolation

### 5. Update app layout
- Make layout async to fetch messages
- Wrap with NextIntlClientProvider
- Add locale param to layout props
- Pass locale to html lang attribute

### 6. Update all pages
- Add generateMetadata function using getTranslations
- Use metadata namespace for titles and descriptions

### 7. Update all components
- Import useTranslations hook
- Replace hardcoded strings with t() calls
- Use proper namespace for each component
- Handle interpolation for dynamic values (counts, names, etc.)

### 8. Localize OpenAI generation
- Add locale parameter to generateQuestions function
- Create language-specific prompt instructions
- Pass locale from quiz component using useLocale hook
- Ensure questions/answers are generated in selected language

### 9. Create LanguageSwitcher component
- Use shadcn/ui Select component
- Import useLocale, useRouter, usePathname
- Use startTransition for smooth locale changes
- Display flags/names for each language
- Add to app layout header

### 10. Update next.config.ts
- Add 'next-intl' to experimental.optimizePackageImports array

## Key Features

- Automatic locale detection from cookie or browser preferences
- Cookie persistence (NEXT_LOCALE) across sessions
- Seamless language switching without page reload
- Localized OpenAI-generated content
- ICU message format support for plurals and complex formatting
- Type-safe translation keys
- Easy to add more languages (just add new message file)

## Notes

- Keep translation keys hierarchical and consistent
- Use descriptive namespace organization
- OpenAI prompts include explicit language instructions
- All user-facing strings must be translated
- Consider future enhancements: PDF content language detection, RTL support

## Status: ❌ DEFERRED

Module 12 (Localization) was fully implemented but encountered compatibility issues with next-intl v4.3.9 and Next.js 15.x (both 15.0.0 and 15.5.4):
```
Error: Couldn't find next-intl config file
```

Despite correct configuration following official next-intl documentation, the build process consistently failed to locate the i18n configuration file.

### Decision
After testing multiple configurations and Next.js versions, the integration was rolled back to maintain app stability. The app currently operates in English-only mode.

### Future Considerations
- Monitor next-intl updates for Next.js 15+ compatibility
- Consider alternative i18n solutions (react-i18next, formatjs)
- Or wait for Next.js 16 with improved i18n support

The implementation documentation remains in this file for future reference when the ecosystem stabilizes.


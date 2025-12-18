# Quick Setup Instructions

## Step 1: Add Files to Xcode Project

The Swift files exist in the file system but need to be added to the Xcode project build.

### Method A: Drag & Drop (Fastest)

1. **Open Xcode** with the project: `apps/app/gifter/gifter.xcodeproj`

2. **Open Finder** and navigate to: `apps/app/gifter/gifter/`

3. **Drag these 4 folders** from Finder into Xcode's Project Navigator (left sidebar):
   - `DesignSystem`
   - `Models`
   - `ViewModels`
   - `Views`

4. **In the dialog that appears:**
   - ✅ Check "Create groups" (NOT "Create folder references")
   - ✅ Check target: "gifter"
   - ❌ Uncheck "Copy items if needed" (files are already in place)
   - Click **Add**

5. **Build the project**: `Cmd + B`

### Method B: Add Files Menu

1. Open Xcode with `gifter.xcodeproj`

2. In Project Navigator, **right-click** on the `gifter` folder (the yellow one with app icon)

3. Select **"Add Files to 'gifter'..."**

4. Navigate to `apps/app/gifter/gifter/`

5. **Select all 4 folders**: DesignSystem, Models, ViewModels, Views

6. Make sure:
   - ❌ "Copy items if needed" is UNCHECKED
   - ✅ "Create groups" is selected
   - ✅ Target "gifter" is checked

7. Click **Add**

8. Build: `Cmd + B`

## Step 2: Verify the Build

After adding the files, you should see this structure in Xcode:

```
gifter
├── DesignSystem
│   ├── GifterColors.swift
│   ├── GifterTypography.swift
│   └── Components
│       ├── GifterButton.swift
│       ├── GifterCard.swift
│       ├── GifterPill.swift
│       └── LoadingView.swift
├── Models
│   ├── User.swift
│   ├── Product.swift
│   ├── Collection.swift
│   ├── Occasion.swift
│   └── GiftingProfile.swift
├── ViewModels
│   ├── AppState.swift
│   ├── WishlistViewModel.swift
│   └── MockData.swift
├── Views
│   ├── AppView.swift
│   ├── MainTabView.swift
│   ├── Auth/
│   ├── Onboarding/
│   ├── Home/
│   ├── Find/
│   ├── Occasions/
│   ├── Profile/
│   ├── Detail/
│   ├── Wishlist/
│   └── Shared/
├── Assets.xcassets
├── Fonts
├── gifterApp.swift
└── Info.plist
```

## Step 3: Run the App

1. Select a simulator (iPhone 15 Pro recommended)
2. Press `Cmd + R` to run
3. You should see the splash screen with the bow animation!

## Troubleshooting

### "Cannot find 'X' in scope" errors

This means the files weren't added to the Xcode project properly. Make sure:
- All folders are added with "Create groups" option
- The target "gifter" is checked for all files
- Files appear in the Project Navigator (not just in Finder)

### Font errors

If you see font-related warnings:
- Verify `Info.plist` has the fonts registered
- Check that `Fonts/` folder contains the font files

### Logo image not found

- Make sure `Assets.xcassets` has a `logo` image asset
- For now, you can use any white icon - the app uses template rendering

## What You'll See

1. **Splash Screen**: Black background with white bow that "breathes"
2. **Welcome**: "Hello, I'm Gifter" with signup/login buttons
3. **Signup**: Create account form
4. **Onboarding**: Taste profile questions
5. **Home**: Curated collections, occasions, recommendations
6. **Tabs**: Home, Find, Occasions, You

All flows are fully functional with mock data!

---

**Need help?** Check `IMPLEMENTATION_SUMMARY.md` for detailed documentation.

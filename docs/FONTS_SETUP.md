# How to Add Custom Fonts to the Gifter iOS App

To use the "Playfair Display" and "Inter" fonts in the Gifter app, you need to add the font files to the Xcode project and register them.

## 1. Add Font Files to the Project

1.  **Create a `Fonts` group** in your Xcode project to keep the font files organized.
2.  **Drag and drop** the `.ttf` or `.otf` font files (e.g., `PlayfairDisplay-Regular.ttf`, `Inter-Regular.ttf`) into this new `Fonts` group in the Xcode project navigator.
3.  When the options dialog appears, make sure to:
    *   **Check "Copy items if needed"**.
    *   **Select your app's main target** (e.g., `gifter`) in the "Add to targets" section.

## 2. Register Fonts in `Info.plist`

1.  Open the `Info.plist` file in Xcode.
2.  Add a new key by right-clicking and selecting "Add Row".
3.  From the dropdown list, choose the key **"Fonts provided by application"** (or type `UIAppFonts`).
4.  The value type for this key will be an **Array**.
5.  Add a new item to the array for each font file you added. The value of each item should be the **exact file name** of the font, including its extension.

For example:

*   Item 0: `String` - `PlayfairDisplay-Regular.ttf`
*   Item 1: `String` - `Inter-Regular.ttf`

After completing these steps, the fonts will be correctly bundled with your app and available for use. The `GifterFonts.swift` file is already configured to use these fonts, so no further code changes are needed.

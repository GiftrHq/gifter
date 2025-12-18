#!/bin/bash

# Script to add all Swift files to Xcode project
# This script helps add the newly created Swift files to the Xcode project

PROJECT_DIR="/Users/lucajeevanjee/Documents/Projects/gifter/apps/app/gifter"
XCODEPROJ="$PROJECT_DIR/gifter.xcodeproj"

echo "==================================="
echo "Adding Swift files to Xcode project"
echo "==================================="
echo ""
echo "INSTRUCTIONS:"
echo "1. Open the Xcode project: $XCODEPROJ"
echo "2. In the Project Navigator (left sidebar), right-click on the 'gifter' group"
echo "3. Select 'Add Files to gifter...'"
echo "4. Navigate to: $PROJECT_DIR/gifter"
echo "5. Select the following folders and click 'Add':"
echo "   - DesignSystem"
echo "   - Models"
echo "   - ViewModels"
echo "   - Views"
echo "6. Make sure 'Copy items if needed' is UNCHECKED"
echo "7. Make sure 'Create groups' is selected"
echo "8. Make sure the 'gifter' target is checked"
echo ""
echo "Alternatively, you can:"
echo "1. Open Finder and navigate to: $PROJECT_DIR/gifter"
echo "2. Open Xcode with the project"
echo "3. Drag and drop the DesignSystem, Models, ViewModels, and Views folders"
echo "   into the Xcode project navigator"
echo ""
echo "After adding the files, the project should build successfully!"
echo ""

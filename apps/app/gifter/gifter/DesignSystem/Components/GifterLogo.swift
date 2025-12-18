//
//  GifterLogo.swift
//  gifter
//
//  Design System: Logo Component
//

import SwiftUI

struct GifterLogo: View {
    let size: CGFloat
    var useTemplate: Bool = false

    var body: some View {
        if useTemplate {
            // Try template rendering (requires transparent PNG)
            Image("logo")
                .resizable()
                .renderingMode(.template)
                .foregroundColor(GifterColors.gifterWhite)
                .aspectRatio(contentMode: .fit)
                .frame(width: size, height: size)
        } else {
            // Use original image as-is
            Image("logo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: size, height: size)
        }
    }
}

// Helper for toolbar
extension View {
    func gifterToolbarLogo() -> some View {
        self.toolbar {
            ToolbarItem(placement: .principal) {
                GifterLogo(size: 24)
            }
        }
    }
}

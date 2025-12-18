//
//  GifterTypography.swift
//  gifter
//
//  Design System: Typography
//

import SwiftUI

struct GifterTypography {
    static func displayXL() -> Font {
        .custom("PlayfairDisplay-Regular", size: 36)
    }

    static func displayL() -> Font {
        .custom("PlayfairDisplay-Regular", size: 28)
    }

    static func body() -> Font {
        .custom("Inter-Regular", size: 17)
    }

    static func caption() -> Font {
        .custom("Inter-Regular", size: 13)
    }
}

extension View {
    func gifterDisplayXL() -> some View {
        self.font(GifterTypography.displayXL())
            .foregroundColor(GifterColors.gifterWhite)
    }

    func gifterDisplayL() -> some View {
        self.font(GifterTypography.displayL())
            .foregroundColor(GifterColors.gifterWhite)
    }

    func gifterBody() -> some View {
        self.font(GifterTypography.body())
            .foregroundColor(GifterColors.gifterWhite)
    }

    func gifterCaption() -> some View {
        self.font(GifterTypography.caption())
            .foregroundColor(GifterColors.gifterGray)
    }
}

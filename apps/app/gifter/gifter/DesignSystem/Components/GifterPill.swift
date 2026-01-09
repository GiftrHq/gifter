//
//  GifterPill.swift
//  gifter
//
//  Design System: Pill/Chip Component
//

import SwiftUI

enum GifterPillStyle {
    case filled
    case outlined
}

struct GifterPill: View {
    let text: String
    let style: GifterPillStyle
    let isSelected: Bool
    let onTap: (() -> Void)?

    init(text: String, style: GifterPillStyle = .outlined, isSelected: Bool = false, onTap: (() -> Void)? = nil) {
        self.text = text
        self.style = style
        self.isSelected = isSelected
        self.onTap = onTap
    }

    var body: some View {
        Group {
            if let onTap = onTap {
                Button(action: {
                    let impactMed = UIImpactFeedbackGenerator(style: .light)
                    impactMed.impactOccurred()
                    onTap()
                }) {
                    pillContent
                }
            } else {
                pillContent
            }
        }
    }

    private var pillContent: some View {
        Text(text)
            .font(.system(size: 15, weight: .medium))
            .foregroundColor(
                style == .filled || isSelected ?
                    GifterColors.gifterBlack :
                    GifterColors.gifterWhite
            )
            .lineLimit(1)
            .minimumScaleFactor(0.8)
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .multilineTextAlignment(.center)
            .background(
                Capsule()
                    .fill(
                        style == .filled || isSelected ?
                            GifterColors.gifterWhite :
                            Color.clear
                    )
            )
            .overlay(
                Capsule()
                    .stroke(
                        style == .outlined && !isSelected ?
                            GifterColors.gifterWhite :
                            Color.clear,
                        lineWidth: 1
                    )
            )
            .clipShape(Capsule())
            .fixedSize(horizontal: true, vertical: false)
    }
}

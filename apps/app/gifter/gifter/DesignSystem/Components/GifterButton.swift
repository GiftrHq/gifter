//
//  GifterButton.swift
//  gifter
//
//  Design System: Button Components
//

import SwiftUI

enum GifterButtonStyle {
    case primary
    case secondary
}

struct GifterButton: View {
    let title: String
    let style: GifterButtonStyle
    let action: () -> Void

    @State private var isPressed = false

    var body: some View {
        Button(action: {
            let impactMed = UIImpactFeedbackGenerator(style: .light)
            impactMed.impactOccurred()
            action()
        }) {
            Text(title)
                .font(.system(size: 17, weight: .medium))
                .foregroundColor(style == .primary ? GifterColors.gifterBlack : GifterColors.gifterWhite)
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .background(
                    style == .primary ?
                        GifterColors.gifterWhite :
                        Color.clear
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(
                            style == .secondary ?
                                GifterColors.gifterWhite.opacity(isPressed ? 0.8 : 1.0) :
                                Color.clear,
                            lineWidth: 1
                        )
                )
                .cornerRadius(12)
        }
        .buttonStyle(ScaleButtonStyle(scale: style == .primary ? 1.03 : 1.0))
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    if style == .secondary {
                        withAnimation(.easeOut(duration: 0.1)) {
                            isPressed = true
                        }
                    }
                }
                .onEnded { _ in
                    if style == .secondary {
                        withAnimation(.easeOut(duration: 0.1)) {
                            isPressed = false
                        }
                    }
                }
        )
    }
}

struct ScaleButtonStyle: ButtonStyle {
    let scale: CGFloat

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? scale : 1.0)
            .animation(.easeOut(duration: 0.2), value: configuration.isPressed)
    }
}

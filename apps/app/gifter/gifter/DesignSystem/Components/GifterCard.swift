//
//  GifterCard.swift
//  gifter
//
//  Design System: Card Component
//

import SwiftUI

struct GifterCard<Content: View>: View {
    let content: Content
    let onTap: (() -> Void)?

    @State private var isPressed = false

    init(onTap: (() -> Void)? = nil, @ViewBuilder content: () -> Content) {
        self.onTap = onTap
        self.content = content()
    }

    var body: some View {
        Group {
            if let onTap = onTap {
                Button(action: {
                    let impactMed = UIImpactFeedbackGenerator(style: .light)
                    impactMed.impactOccurred()
                    onTap()
                }) {
                    cardContent
                }
                .buttonStyle(CardButtonStyle())
            } else {
                cardContent
            }
        }
    }

    private var cardContent: some View {
        content
            .background(GifterColors.gifterOffBlack)
            .cornerRadius(18)
            .overlay(
                RoundedRectangle(cornerRadius: 18)
                    .stroke(GifterColors.gifterSoftGray, lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 4)
    }
}

struct CardButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
    }
}

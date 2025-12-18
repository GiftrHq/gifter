//
//  LoadingView.swift
//  gifter
//
//  Design System: Loading States
//

import SwiftUI

struct LoadingView: View {
    let message: String

    init(message: String = "Curating a few ideas...") {
        self.message = message
    }

    var body: some View {
        VStack(spacing: 20) {
            BowLoadingAnimation()

            Text(message)
                .gifterBody()
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}

struct BowLoadingAnimation: View {
    @State private var isAnimating = false

    var body: some View {
        Image("logo")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .frame(width: 40, height: 40)
            .rotationEffect(.degrees(isAnimating ? 5 : -5))
            .animation(
                Animation.easeInOut(duration: 1.2)
                    .repeatForever(autoreverses: true),
                value: isAnimating
            )
            .onAppear {
                isAnimating = true
            }
    }
}

struct SkeletonCard: View {
    @State private var shimmerOffset: CGFloat = -1

    var body: some View {
        RoundedRectangle(cornerRadius: 18)
            .fill(GifterColors.gifterOffBlack)
            .overlay(
                RoundedRectangle(cornerRadius: 18)
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.clear,
                                GifterColors.gifterWhite.opacity(0.1),
                                Color.clear
                            ]),
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .offset(x: shimmerOffset * UIScreen.main.bounds.width)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 18)
                    .stroke(GifterColors.gifterSoftGray, lineWidth: 1)
            )
            .onAppear {
                withAnimation(
                    Animation.linear(duration: 1.5)
                        .repeatForever(autoreverses: false)
                ) {
                    shimmerOffset = 1
                }
            }
    }
}

//
//  SplashView.swift
//  gifter
//
//  Launch/Splash Screen
//

import SwiftUI

struct SplashView: View {
    @State private var isAnimating = false
    @State private var showCaption = false
    @Binding var isComplete: Bool

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            VStack(spacing: 16) {
                GifterLogo(size: 80)
                    .scaleEffect(isAnimating ? 1.05 : 1.0)
                    .animation(
                        Animation.easeInOut(duration: 1.2)
                            .repeatForever(autoreverses: true),
                        value: isAnimating
                    )

                if showCaption {
                    Text("Thinking of the perfect gift...")
                        .gifterCaption()
                        .transition(.opacity)
                }
            }
        }
        .onAppear {
            isAnimating = true

            DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                withAnimation(.easeOut(duration: 0.4)) {
                    showCaption = true
                }
            }

            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                withAnimation(.easeOut(duration: 0.5)) {
                    isComplete = true
                }
            }
        }
    }
}

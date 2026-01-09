//
//  OnboardingIntroView.swift
//  gifter
//
//  Onboarding Introduction
//

import SwiftUI

struct OnboardingIntroView: View {
    @EnvironmentObject var appState: AppState
    @State private var showDynamicOnboarding = false
    @State private var showLegacyOnboarding = false

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                VStack(spacing: 24) {
                    Text("Step 1 of 3")
                        .gifterCaption()
                        .textCase(.uppercase)

                    VStack(spacing: 16) {
                        Text("Let me learn your taste.")
                            .gifterDisplayL()
                            .multilineTextAlignment(.center)

                        Text("I'll ask a few quick questions about you and the people you buy for. The better I know you, the better I gift.")
                            .gifterBody()
                            .foregroundColor(GifterColors.gifterGray)
                            .multilineTextAlignment(.center)
                    }
                }
                .padding(.horizontal, 32)

                Spacer()

                VStack(spacing: 16) {
                    GifterButton(title: "Start", style: .primary) {
                        showDynamicOnboarding = true
                    }

                    Button(action: {
                        appState.skipOnboarding()
                    }) {
                        Text("Skip for now")
                            .font(.system(size: 15))
                            .foregroundColor(GifterColors.gifterGray)
                    }
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 60)
            }
        }
        .fullScreenCover(isPresented: $showDynamicOnboarding) {
            DynamicOnboardingView(scenario: .newUser)
                .environmentObject(appState)
        }
    }
}

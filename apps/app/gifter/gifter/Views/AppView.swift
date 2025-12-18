//
//  AppView.swift
//  gifter
//
//  Root App View - Handles Routing
//

import SwiftUI

struct AppView: View {
    @EnvironmentObject var appState: AppState

    @State private var showSplash = true
    @State private var splashComplete = false

    var body: some View {
        ZStack {
            if showSplash {
                SplashView(isComplete: $splashComplete)
                    .transition(.opacity)
                    .zIndex(1)
            } else {
                mainContent
                    .transition(.opacity)
            }
        }
        .onChange(of: splashComplete) { newValue in
            if newValue {
                withAnimation(.easeOut(duration: 0.5)) {
                    showSplash = false
                }
            }
        }
    }

    @ViewBuilder
    private var mainContent: some View {
        if !appState.isAuthenticated {
            WelcomeView()
        } else if appState.needsOnboarding {
            OnboardingIntroView()
                .transition(.opacity)
        } else {
            MainTabView()
                .transition(.opacity)
        }
    }
}

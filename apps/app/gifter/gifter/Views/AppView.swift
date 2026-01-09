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
            if showSplash || appState.isCheckingSession {
                SplashView(isComplete: $splashComplete)
                    .transition(.opacity)
                    .zIndex(1)
            } else {
                mainContent
                    .transition(.opacity)
            }
        }
        .onChange(of: splashComplete) { newValue in
            if newValue && !appState.isCheckingSession {
                withAnimation(.easeOut(duration: 0.5)) {
                    showSplash = false
                }
            }
        }
        .onChange(of: appState.isCheckingSession) { isChecking in
            if !isChecking && splashComplete {
                withAnimation(.easeOut(duration: 0.5)) {
                    showSplash = false
                }
            }
        }
    }

    @ViewBuilder
    private var mainContent: some View {
        #if DEBUG
        let _ = print("AppView.mainContent: isAuthenticated=\(appState.isAuthenticated), needsOnboarding=\(appState.needsOnboarding), hasCompletedOnboarding=\(appState.hasCompletedOnboarding)")
        #endif

        if !appState.isAuthenticated {
            WelcomeView()
        } else if appState.needsOnboarding {
            OnboardingCoordinator()
                .transition(.opacity)
        } else {
            MainTabView()
                .transition(.opacity)
        }
    }
}

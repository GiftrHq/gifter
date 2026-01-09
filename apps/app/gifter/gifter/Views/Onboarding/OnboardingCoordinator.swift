//
//  OnboardingCoordinator.swift
//  gifter
//
//  Manages the transition between onboarding steps
//

import SwiftUI

enum OnboardingStep {
    case birthday
    case delivery
    case tasteQuiz
    case complete
}

struct OnboardingCoordinator: View {
    @EnvironmentObject var appState: AppState
    @State private var currentStep: OnboardingStep = .birthday
    
    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()
            
            switch currentStep {
            case .birthday:
                BirthdaySetupView {
                    withAnimation {
                        currentStep = .delivery
                    }
                }
            case .delivery:
                DeliverySetupView {
                    withAnimation {
                        currentStep = .tasteQuiz
                    }
                }
            case .tasteQuiz:
                DynamicOnboardingView(scenario: .newUser)
                    .environmentObject(appState)
            case .complete:
                // handled by DynamicOnboardingView's completion
                EmptyView()
            }
        }
        .navigationBarBackButtonHidden(true)
    }
}

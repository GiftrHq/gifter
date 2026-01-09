//
//  BirthdaySetupView.swift
//  gifter
//
//  Step 1 of Onboarding: Collect User's Birthday
//

import SwiftUI

struct BirthdaySetupView: View {
    @EnvironmentObject var appState: AppState
    @State private var birthday = Date()
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var onNext: () -> Void

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            VStack(spacing: 32) {
                VStack(spacing: 16) {
                    Text("When is your birthday?")
                        .gifterDisplayL()
                        .multilineTextAlignment(.center)

                    Text("We'll use this to help your friends find the perfect gift for you.")
                        .gifterBody()
                        .foregroundColor(GifterColors.gifterGray)
                        .multilineTextAlignment(.center)
                }

                DatePicker("", selection: $birthday, displayedComponents: .date)
                    .datePickerStyle(.wheel)
                    .labelsHidden()
                    .colorInvert() // For white text on black if needed
                    .colorMultiply(GifterColors.gifterWhite)

                if let error = errorMessage {
                    Text(error)
                        .font(.system(size: 14))
                        .foregroundColor(.red)
                }

                Spacer()

                GifterButton(title: isLoading ? "Saving..." : "Continue", style: .primary) {
                    saveBirthday()
                }
                .disabled(isLoading)
            }
            .padding(.horizontal, 32)
            .padding(.top, 60)
            .padding(.bottom, 40)
        }
    }

    private func saveBirthday() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                // Call the new production-ready identity service method
                try await OnboardingService.shared.updateIdentity(
                    birthday: birthday,
                    step: 1
                )
                
                isLoading = false
                onNext()
            } catch {
                isLoading = false
                errorMessage = "Failed to save birthday. Please try again."
                print("Birthday setup error: \(error)")
            }
        }
    }
}

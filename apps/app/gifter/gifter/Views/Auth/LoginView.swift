//
//  LoginView.swift
//  gifter
//
//  Login Screen
//

import SwiftUI

struct LoginView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    @State private var email = ""
    @State private var password = ""
    @State private var errorMessage: String?
    @State private var isLoading = false

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 32) {
                    VStack(spacing: 16) {
                        Text("Welcome back.")
                            .gifterDisplayL()

                        Text("Log in to continue your gifting journey.")
                            .gifterBody()
                            .foregroundColor(GifterColors.gifterGray)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 60)

                    VStack(spacing: 16) {
                        CustomTextField(placeholder: "Email", text: $email)
                        CustomTextField(placeholder: "Password", text: $password, isSecure: true)
                    }

                    if let errorMessage = errorMessage {
                        Text(errorMessage)
                            .font(.system(size: 14))
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                    }

                    VStack(spacing: 12) {
                        GifterButton(title: isLoading ? "Logging in..." : "Log in", style: .primary) {
                            handleLogin()
                        }
                        .disabled(isLoading || !isFormValid)
                        .opacity(isFormValid ? 1.0 : 0.5)

                        Button(action: {
                            // Handle forgot password
                        }) {
                            Text("Forgot password?")
                                .font(.system(size: 14))
                                .foregroundColor(GifterColors.gifterGray)
                                .underline()
                        }
                    }
                }
                .padding(.horizontal, 32)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                GifterLogo(size: 36)
            }
        }
    }

    private var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty
    }

    private func handleLogin() {
        isLoading = true
        errorMessage = nil

        // Mock login - in production, call auth API
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            // Mock successful login
            appState.mockLogin()
            isLoading = false
        }
    }
}

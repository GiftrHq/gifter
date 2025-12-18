//
//  SignupView.swift
//  gifter
//
//  Sign Up Screen
//

import SwiftUI

struct SignupView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    @State private var email = ""
    @State private var password = ""
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var errorMessage: String?
    @State private var isLoading = false

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 32) {
                    VStack(spacing: 16) {
                        Text("Let's get you set up.")
                            .gifterDisplayL()

                        Text("Just an email and a password — I'll handle remembering the rest.")
                            .gifterBody()
                            .foregroundColor(GifterColors.gifterGray)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 60)

                    VStack(spacing: 16) {
                        CustomTextField(placeholder: "First name", text: $firstName)
                        CustomTextField(placeholder: "Last name", text: $lastName)
                        CustomTextField(placeholder: "Email", text: $email)
                        CustomTextField(placeholder: "Password", text: $password, isSecure: true)
                    }

                    if let errorMessage = errorMessage {
                        Text(errorMessage)
                            .font(.system(size: 14))
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                    }

                    GifterButton(title: isLoading ? "Creating account..." : "Continue", style: .primary) {
                        handleSignup()
                    }
                    .disabled(isLoading || !isFormValid)
                    .opacity(isFormValid ? 1.0 : 0.5)
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
        !email.isEmpty && !password.isEmpty && !firstName.isEmpty && !lastName.isEmpty && password.count >= 6
    }

    private func handleSignup() {
        isLoading = true
        errorMessage = nil

        // Mock signup - in production, call auth API
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            let newUser = User(
                id: UUID().uuidString,
                firstName: firstName,
                lastName: lastName,
                email: email,
                tasteProfile: nil,
                occasions: [],
                createdAt: Date()
            )

            appState.initializeAfterAuth(user: newUser)
            isLoading = false
        }
    }
}

struct CustomTextField: View {
    let placeholder: String
    @Binding var text: String
    var isSecure: Bool = false

    var body: some View {
        Group {
            if isSecure {
                SecureField(placeholder, text: $text)
            } else {
                TextField(placeholder, text: $text)
            }
        }
        .font(GifterTypography.body())
        .foregroundColor(GifterColors.gifterWhite)
        .padding()
        .background(GifterColors.gifterOffBlack)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(GifterColors.gifterSoftGray, lineWidth: 1)
        )
    }
}

//
//  SignupView.swift
//  gifter
//
//  Sign Up Screen
//

import SwiftUI
import AuthenticationServices

struct SignupView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel = AuthViewModel()

    @State private var email = ""
    @State private var password = ""
    @State private var firstName = ""
    @State private var lastName = ""

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

                    // Apple Sign In
                    VStack(spacing: 16) {
                        StyledAppleSignInButton { result in
                            Task {
                                let success = await viewModel.handleAppleSignIn(result: result)
                                if success {
                                    dismiss()
                                }
                            }
                        }

                        HStack {
                            Rectangle()
                                .fill(GifterColors.gifterSoftGray)
                                .frame(height: 1)
                            Text("or")
                                .font(.system(size: 14))
                                .foregroundColor(GifterColors.gifterGray)
                            Rectangle()
                                .fill(GifterColors.gifterSoftGray)
                                .frame(height: 1)
                        }
                    }

                    VStack(spacing: 16) {
                        CustomTextField(placeholder: "First name", text: $firstName)
                            .textContentType(.givenName)
                            .autocapitalization(.words)

                        CustomTextField(placeholder: "Last name", text: $lastName)
                            .textContentType(.familyName)
                            .autocapitalization(.words)

                        CustomTextField(placeholder: "Email", text: $email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)

                        CustomTextField(placeholder: "Password (8+ characters)", text: $password, isSecure: true)
                            .textContentType(.newPassword)
                    }

                    if let errorMessage = viewModel.errorMessage {
                        Text(errorMessage)
                            .font(.system(size: 14))
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                    }

                    GifterButton(
                        title: viewModel.isLoading ? "Creating account..." : "Continue",
                        style: .primary
                    ) {
                        Task {
                            let success = await viewModel.signUp(
                                email: email,
                                password: password,
                                firstName: firstName,
                                lastName: lastName
                            )
                            if success {
                                // Don't dismiss - show email verification
                            }
                        }
                    }
                    .disabled(viewModel.isLoading || !isFormValid)
                    .opacity(isFormValid ? 1.0 : 0.5)

                    Text("By signing up, you agree to our Terms of Service and Privacy Policy.")
                        .font(.system(size: 12))
                        .foregroundColor(GifterColors.gifterGray)
                        .multilineTextAlignment(.center)
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
        .sheet(isPresented: $viewModel.showEmailVerification) {
            EmailVerificationSheet(
                email: viewModel.verificationEmail ?? email,
                isPresented: $viewModel.showEmailVerification
            )
        }
    }

    private var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty && !firstName.isEmpty && !lastName.isEmpty && password.count >= 8
    }
}

// MARK: - Email Verification Sheet
struct EmailVerificationSheet: View {
    let email: String
    @Binding var isPresented: Bool

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            VStack(spacing: 24) {
                Spacer()

                Image(systemName: "envelope.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(GifterColors.gifterWhite)

                Text("Check your email")
                    .gifterDisplayL()

                Text("We've sent a verification link to:")
                    .gifterBody()
                    .foregroundColor(GifterColors.gifterGray)

                Text(email)
                    .gifterBody()
                    .foregroundColor(GifterColors.gifterWhite)

                Text("Click the link in the email to verify your account and start your gifting journey.")
                    .gifterBody()
                    .foregroundColor(GifterColors.gifterGray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 20)

                Spacer()

                GifterButton(title: "Got it", style: .primary) {
                    isPresented = false
                }
            }
            .padding(.horizontal, 32)
            .padding(.vertical, 40)
        }
    }
}

// MARK: - Custom Text Field
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

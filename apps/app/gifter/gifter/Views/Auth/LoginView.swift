//
//  LoginView.swift
//  gifter
//
//  Login Screen
//

import SwiftUI
import AuthenticationServices

struct LoginView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel = AuthViewModel()

    @State private var email = ""
    @State private var password = ""
    @State private var showForgotPassword = false
    @State private var forgotPasswordEmail = ""
    @State private var showResetConfirmation = false

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
                        CustomTextField(placeholder: "Email", text: $email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)

                        CustomTextField(placeholder: "Password", text: $password, isSecure: true)
                            .textContentType(.password)
                    }

                    if let errorMessage = viewModel.errorMessage {
                        Text(errorMessage)
                            .font(.system(size: 14))
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                    }

                    VStack(spacing: 12) {
                        GifterButton(
                            title: viewModel.isLoading ? "Logging in..." : "Log in",
                            style: .primary
                        ) {
                            Task {
                                let success = await viewModel.signIn(email: email, password: password)
                                if success {
                                    dismiss()
                                }
                            }
                        }
                        .disabled(viewModel.isLoading || !isFormValid)
                        .opacity(isFormValid ? 1.0 : 0.5)

                        Button(action: {
                            forgotPasswordEmail = email
                            showForgotPassword = true
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
        .sheet(isPresented: $showForgotPassword) {
            ForgotPasswordSheet(
                email: $forgotPasswordEmail,
                isPresented: $showForgotPassword,
                showConfirmation: $showResetConfirmation
            )
        }
        .alert("Check your email", isPresented: $showResetConfirmation) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("We've sent password reset instructions to your email.")
        }
        .onChange(of: viewModel.errorMessage) { _ in
            // Clear error when user starts typing
        }
    }

    private var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty
    }
}

// MARK: - Forgot Password Sheet
struct ForgotPasswordSheet: View {
    @Binding var email: String
    @Binding var isPresented: Bool
    @Binding var showConfirmation: Bool
    @StateObject private var viewModel = AuthViewModel()

    var body: some View {
        NavigationView {
            ZStack {
                GifterColors.gifterBlack
                    .ignoresSafeArea()

                VStack(spacing: 24) {
                    Text("Reset your password")
                        .gifterDisplayL()

                    Text("Enter your email and we'll send you instructions to reset your password.")
                        .gifterBody()
                        .foregroundColor(GifterColors.gifterGray)
                        .multilineTextAlignment(.center)

                    CustomTextField(placeholder: "Email", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)

                    if let errorMessage = viewModel.errorMessage {
                        Text(errorMessage)
                            .font(.system(size: 14))
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                    }

                    GifterButton(
                        title: viewModel.isLoading ? "Sending..." : "Send reset link",
                        style: .primary
                    ) {
                        Task {
                            let success = await viewModel.requestPasswordReset(email: email)
                            if success {
                                isPresented = false
                                showConfirmation = true
                            }
                        }
                    }
                    .disabled(viewModel.isLoading || email.isEmpty)

                    Spacer()
                }
                .padding(.horizontal, 32)
                .padding(.top, 40)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        isPresented = false
                    }
                    .foregroundColor(GifterColors.gifterWhite)
                }
            }
        }
    }
}

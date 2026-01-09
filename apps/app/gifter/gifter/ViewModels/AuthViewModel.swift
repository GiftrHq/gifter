//
//  AuthViewModel.swift
//  gifter
//
//  Authentication View Model
//

import SwiftUI
import AuthenticationServices

@MainActor
final class AuthViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var showEmailVerification = false
    @Published var verificationEmail: String?

    private let authService = AuthService.shared

    // MARK: - Email/Password Sign Up

    func signUp(email: String, password: String, firstName: String, lastName: String) async -> Bool {
        guard validateSignUpInput(email: email, password: password, firstName: firstName, lastName: lastName) else {
            return false
        }

        isLoading = true
        errorMessage = nil

        do {
            _ = try await authService.signUp(email: email, password: password, firstName: firstName, lastName: lastName)
            isLoading = false

            // Signup successful - user is now authenticated
            // Email verification is currently disabled
            return true
        } catch let error as NetworkError {
            isLoading = false
            errorMessage = error.errorDescription
            return false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            return false
        }
    }

    // MARK: - Email/Password Sign In

    func signIn(email: String, password: String) async -> Bool {
        guard validateSignInInput(email: email, password: password) else {
            return false
        }

        isLoading = true
        errorMessage = nil

        do {
            _ = try await authService.signIn(email: email, password: password)
            isLoading = false
            return true
        } catch let error as NetworkError {
            isLoading = false
            handleAuthError(error)
            return false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            return false
        }
    }

    // MARK: - Apple Sign In

    func handleAppleSignIn(result: Result<ASAuthorization, Error>) async -> Bool {
        isLoading = true
        errorMessage = nil

        switch result {
        case .success(let authorization):
            do {
                _ = try await authService.signInWithApple(authorization: authorization)
                isLoading = false
                return true
            } catch let error as NetworkError {
                isLoading = false
                errorMessage = error.errorDescription
                return false
            } catch let error as AuthError {
                isLoading = false
                errorMessage = error.errorDescription
                return false
            } catch {
                isLoading = false
                errorMessage = error.localizedDescription
                return false
            }

        case .failure(let error):
            isLoading = false
            // Don't show error for user cancellation
            if let authError = error as? ASAuthorizationError,
               authError.code == .canceled {
                return false
            }
            errorMessage = error.localizedDescription
            return false
        }
    }

    // MARK: - Sign Out

    func signOut() async {
        isLoading = true
        errorMessage = nil

        do {
            try await authService.signOut()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    // MARK: - Password Reset

    func requestPasswordReset(email: String) async -> Bool {
        guard !email.isEmpty, email.contains("@") else {
            errorMessage = "Please enter a valid email address"
            return false
        }

        isLoading = true
        errorMessage = nil

        do {
            try await authService.requestPasswordReset(email: email)
            isLoading = false
            return true
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
            return false
        }
    }

    // MARK: - Validation

    private func validateSignUpInput(email: String, password: String, firstName: String, lastName: String) -> Bool {
        if firstName.trimmingCharacters(in: .whitespaces).isEmpty {
            errorMessage = "First name is required"
            return false
        }

        if lastName.trimmingCharacters(in: .whitespaces).isEmpty {
            errorMessage = "Last name is required"
            return false
        }

        if !isValidEmail(email) {
            errorMessage = "Please enter a valid email address"
            return false
        }

        if password.count < 8 {
            errorMessage = "Password must be at least 8 characters"
            return false
        }

        return true
    }

    private func validateSignInInput(email: String, password: String) -> Bool {
        if email.trimmingCharacters(in: .whitespaces).isEmpty {
            errorMessage = "Email is required"
            return false
        }

        if password.isEmpty {
            errorMessage = "Password is required"
            return false
        }

        return true
    }

    private func isValidEmail(_ email: String) -> Bool {
        let emailRegex = #"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"#
        return email.range(of: emailRegex, options: .regularExpression) != nil
    }

    private func handleAuthError(_ error: NetworkError) {
        switch error {
        case .unauthorized:
            errorMessage = "Invalid email or password"
        case .forbidden:
            errorMessage = "Access denied"
        default:
            errorMessage = error.errorDescription
        }
    }

    // MARK: - Clear State

    func clearError() {
        errorMessage = nil
    }
}

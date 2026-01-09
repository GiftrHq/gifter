//
//  AuthService.swift
//  gifter
//
//  Authentication Service
//

import Foundation
import AuthenticationServices

final class AuthService: ObservableObject {
    static let shared = AuthService()

    @Published private(set) var isAuthenticated = false
    @Published private(set) var isLoading = false
    @Published private(set) var currentUser: User?

    private let client = APIClient.shared

    private init() {
        // Check for existing session on init
        Task {
            await checkSession()
        }
    }

    // MARK: - Email/Password Auth

    func signUp(email: String, password: String, firstName: String, lastName: String) async throws -> User {
        isLoading = true
        defer { isLoading = false }

        let name = "\(firstName) \(lastName)".trimmingCharacters(in: .whitespaces)
        var user = try await client.authenticate(.signUp(email: email, password: password, name: name))

        // Fetch full user profile (including taste profile)
        if let fullUser = try? await UserService.shared.getMe() {
            user = fullUser
        }

        await MainActor.run {
            self.currentUser = user
            self.isAuthenticated = true
        }

        return user
    }

    func signIn(email: String, password: String) async throws -> User {
        isLoading = true
        defer { isLoading = false }

        var user = try await client.authenticate(.signIn(email: email, password: password))

        // Fetch full user profile (including taste profile)
        if let fullUser = try? await UserService.shared.getMe() {
            user = fullUser
        }

        await MainActor.run {
            self.currentUser = user
            self.isAuthenticated = true
        }

        return user
    }

    func signOut() async throws {
        isLoading = true
        defer { isLoading = false }

        try await client.signOut()

        await MainActor.run {
            self.currentUser = nil
            self.isAuthenticated = false
        }
    }

    // MARK: - Apple Sign In

    func signInWithApple(authorization: ASAuthorization) async throws -> User {
        guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let identityToken = appleIDCredential.identityToken,
              let idTokenString = String(data: identityToken, encoding: .utf8) else {
            throw AuthError.invalidCredentials
        }

        // Generate nonce (in production, this should be done before the request)
        let nonce = generateNonce()

        isLoading = true
        defer { isLoading = false }

        let user = try await client.authenticate(.signInWithApple(idToken: idTokenString, nonce: nonce))

        await MainActor.run {
            self.currentUser = user
            self.isAuthenticated = true
        }

        return user
    }

    // MARK: - Session Management

    func checkSession() async {
        isLoading = true
        defer { Task { @MainActor in isLoading = false } }

        // Check if we have a valid cached session (token + user)
        let hasValidSession = await SessionManager.shared.isSessionValid()

        #if DEBUG
        print("checkSession: hasValidSession = \(hasValidSession)")
        #endif

        if hasValidSession {
            // Try to get fresh user data from our API (not BetterAuth's get-session)
            // This uses our auth middleware which properly handles Bearer tokens
            do {
                let user = try await UserService.shared.getMe()

                #if DEBUG
                print("checkSession: successfully fetched user - \(user.email)")
                #endif

                await MainActor.run {
                    self.currentUser = user
                    self.isAuthenticated = true
                }
                return
            } catch {
                #if DEBUG
                print("checkSession: failed to fetch user - \(error)")
                #endif
                // Session invalid, clear it
                await SessionManager.shared.clearSession()
            }
        }

        await MainActor.run {
            self.currentUser = nil
            self.isAuthenticated = false
        }
    }

    // MARK: - Password Reset

    func requestPasswordReset(email: String) async throws {
        isLoading = true
        defer { isLoading = false }

        try await client.request(AuthEndpoint.forgotPassword(email: email))
    }

    func resetPassword(token: String, newPassword: String) async throws {
        isLoading = true
        defer { isLoading = false }

        try await client.request(AuthEndpoint.resetPassword(token: token, password: newPassword))
    }

    // MARK: - Email Verification

    func verifyEmail(token: String) async throws {
        isLoading = true
        defer { isLoading = false }

        try await client.request(AuthEndpoint.verifyEmail(token: token))
    }

    // MARK: - Magic Link

    func requestMagicLink(email: String) async throws {
        isLoading = true
        defer { isLoading = false }

        try await client.request(AuthEndpoint.magicLink(email: email))
    }

    // MARK: - Private Helpers

    private func generateNonce(length: Int = 32) -> String {
        let charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._"
        var result = ""
        var remainingLength = length

        while remainingLength > 0 {
            let randoms: [UInt8] = (0..<16).map { _ in
                var random: UInt8 = 0
                let errorCode = SecRandomCopyBytes(kSecRandomDefault, 1, &random)
                if errorCode != errSecSuccess {
                    fatalError("Unable to generate nonce")
                }
                return random
            }

            randoms.forEach { random in
                if remainingLength == 0 { return }
                if random < charset.count {
                    result.append(charset[charset.index(charset.startIndex, offsetBy: Int(random))])
                    remainingLength -= 1
                }
            }
        }

        return result
    }
}

// MARK: - Auth Errors
enum AuthError: LocalizedError {
    case invalidCredentials
    case emailNotVerified
    case accountDisabled
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "Invalid email or password"
        case .emailNotVerified:
            return "Please verify your email address"
        case .accountDisabled:
            return "Your account has been disabled"
        case .networkError(let error):
            return error.localizedDescription
        }
    }
}

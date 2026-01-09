//
//  AppleSignInButton.swift
//  gifter
//
//  Apple Sign In Button Component
//

import SwiftUI
import AuthenticationServices

struct AppleSignInButton: View {
    let onCompletion: (Result<ASAuthorization, Error>) -> Void

    var body: some View {
        SignInWithAppleButton(.signIn) { request in
            request.requestedScopes = [.fullName, .email]
        } onCompletion: { result in
            onCompletion(result)
        }
        .signInWithAppleButtonStyle(.white)
        .frame(height: 48)
        .cornerRadius(12)
    }
}

// MARK: - Styled Apple Button (matches design system)
struct StyledAppleSignInButton: View {
    let onCompletion: (Result<ASAuthorization, Error>) -> Void

    var body: some View {
        SignInWithAppleButton(.signIn) { request in
            request.requestedScopes = [.fullName, .email]
        } onCompletion: { result in
            onCompletion(result)
        }
        .signInWithAppleButtonStyle(.white)
        .frame(maxWidth: .infinity)
        .frame(height: 48)
        .cornerRadius(12)
    }
}

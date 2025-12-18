//
//  AppState.swift
//  gifter
//
//  Core App State Management
//

import SwiftUI

class AppState: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var hasCompletedOnboarding = false

    var needsOnboarding: Bool {
        guard let user = currentUser else { return false }
        return user.tasteProfile?.isComplete != true
    }

    func initializeAfterAuth(user: User) {
        self.currentUser = user
        self.isAuthenticated = true
        self.hasCompletedOnboarding = user.tasteProfile?.isComplete ?? false
    }

    func completeOnboarding(tasteProfile: TasteProfile) {
        currentUser?.tasteProfile = tasteProfile
        hasCompletedOnboarding = true
    }

    func logout() {
        isAuthenticated = false
        currentUser = nil
        hasCompletedOnboarding = false
    }

    // Mock login for development
    func mockLogin() {
        let mockUser = User(
            id: UUID().uuidString,
            firstName: "Alex",
            lastName: "Chen",
            email: "alex@example.com",
            tasteProfile: TasteProfile(
                style: "Minimal & clean",
                perfectEvening: "A quiet night in with a book",
                interests: ["Coffee", "Ceramics", "Reading"],
                completedAt: Date()
            ),
            occasions: [],
            createdAt: Date()
        )
        initializeAfterAuth(user: mockUser)
    }
}

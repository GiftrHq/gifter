//
//  AppState.swift
//  gifter
//
//  Core App State Management
//

import SwiftUI
import Combine

@MainActor
class AppState: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var hasCompletedOnboarding = false
    @Published var isCheckingSession = true

    private var cancellables = Set<AnyCancellable>()
    private let authService = AuthService.shared
    private let userDefaults = UserDefaults.standard
    private let onboardingSkippedKey = "com.gifter.onboardingSkipped"

    init() {
        #if DEBUG
        print("AppState.init: Starting...")
        #endif

        // Observe AuthService state
        authService.$isAuthenticated
            .receive(on: DispatchQueue.main)
            .sink { [weak self] isAuthenticated in
                #if DEBUG
                print("AppState: isAuthenticated changed to \(isAuthenticated)")
                #endif
                self?.isAuthenticated = isAuthenticated
            }
            .store(in: &cancellables)

        authService.$currentUser
            .receive(on: DispatchQueue.main)
            .sink { [weak self] user in
                guard let self = self else { return }
                self.currentUser = user
                // Check if onboarding was completed OR skipped
                let hasProfile = user?.tasteProfile?.isComplete ?? false
                let wasSkipped = self.userDefaults.bool(forKey: self.onboardingSkippedKey)
                self.hasCompletedOnboarding = hasProfile || wasSkipped

                #if DEBUG
                print("AppState: currentUser changed - email=\(user?.email ?? "nil"), hasProfile=\(hasProfile), wasSkipped=\(wasSkipped), hasCompletedOnboarding=\(self.hasCompletedOnboarding)")
                #endif
            }
            .store(in: &cancellables)

        authService.$isLoading
            .receive(on: DispatchQueue.main)
            .sink { [weak self] isLoading in
                #if DEBUG
                print("AppState: isLoading changed to \(isLoading)")
                #endif
                // Only show checking session on initial load
                if !isLoading {
                    self?.isCheckingSession = false
                }
            }
            .store(in: &cancellables)
    }

    var needsOnboarding: Bool {
        // Don't show onboarding if user has completed it OR skipped it
        if hasCompletedOnboarding {
            return false
        }

        // Show onboarding if user is authenticated but hasn't completed taste profile
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

    func skipOnboarding() {
        userDefaults.set(true, forKey: onboardingSkippedKey)
        hasCompletedOnboarding = true
    }

    func logout() async {
        do {
            try await authService.signOut()
        } catch {
            // Still clear local state even if API call fails
            print("Logout error: \(error)")
        }
        isAuthenticated = false
        currentUser = nil
        hasCompletedOnboarding = false
    }

    // Refresh user data from API
    func refreshUser() async {
        do {
            let user = try await UserService.shared.getMe()
            await MainActor.run {
                self.currentUser = user
                self.hasCompletedOnboarding = user.tasteProfile?.isComplete ?? false
            }
        } catch {
            print("Failed to refresh user: \(error)")
        }
    }

    // Mock login for development (only in DEBUG)
    #if DEBUG
    func mockLogin() {
        let mockUser = User(
            id: UUID().uuidString,
            firstName: "Luca",
            lastName: "Jeevanjee",
            email: "luca@gifter.app",
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
        isCheckingSession = false
    }
    #endif
}

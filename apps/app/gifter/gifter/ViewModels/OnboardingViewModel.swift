//
//  OnboardingViewModel.swift
//  gifter
//
//  Onboarding State Management
//

import SwiftUI

@MainActor
final class OnboardingViewModel: ObservableObject {
    // MARK: - Published State
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var session: OnboardingSession?
    @Published var currentIndex = 0
    @Published var isComplete = false
    @Published var profileSummary: [String] = []

    // MARK: - Private
    private let onboardingService = OnboardingService.shared

    // MARK: - Computed Properties

    var currentQuestion: OnboardingQuestion? {
        guard let session = session,
              currentIndex < session.questions.count else {
            return nil
        }
        return session.questions[currentIndex]
    }

    var totalQuestions: Int {
        session?.questions.count ?? 0
    }

    var progress: Double {
        guard totalQuestions > 0 else { return 0 }
        return Double(currentIndex) / Double(totalQuestions)
    }

    var stepText: String {
        "Step \(currentIndex + 1) of \(totalQuestions)"
    }

    // MARK: - Public Methods

    func startOnboarding(scenario: OnboardingScenario = .newUser) async {
        isLoading = true
        errorMessage = nil

        do {
            let newSession = try await onboardingService.start(scenario: scenario)
            session = newSession
            currentIndex = newSession.currentIndex
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = "Failed to start onboarding. Please try again."
            print("Onboarding start error: \(error)")
        }
    }

    func resumeOnboarding() async {
        isLoading = true
        errorMessage = nil

        do {
            let existingSession = try await onboardingService.getQuestions()
            session = existingSession
            currentIndex = existingSession.currentIndex
            isLoading = false
        } catch {
            // No existing session, start new
            await startOnboarding()
        }
    }

    func submitAnswer(_ answer: Any) async -> Bool {
        guard let question = currentQuestion else { return false }

        isLoading = true
        errorMessage = nil

        do {
            // Convert answer to string for API
            let answerString: String
            if let array = answer as? [String] {
                answerString = array.joined(separator: ",")
            } else {
                answerString = String(describing: answer)
            }

            let response = try await onboardingService.submitAnswer(
                questionId: question.id,
                answer: answerString
            )

            // Update session answers locally
            session?.answers[question.id] = answerString

            isLoading = false

            if response.isComplete {
                await completeOnboarding()
                return true
            } else {
                // Move to next question
                withAnimation(.easeOut(duration: 0.3)) {
                    currentIndex = response.nextQuestionIndex ?? (currentIndex + 1)
                }
                return true
            }
        } catch {
            isLoading = false
            errorMessage = "Failed to save answer. Please try again."
            print("Submit answer error: \(error)")
            return false
        }
    }

    func completeOnboarding() async {
        isLoading = true
        errorMessage = nil

        do {
            let tasteProfile = try await onboardingService.complete()
            profileSummary = tasteProfile.summary
            isLoading = false

            withAnimation(.easeOut(duration: 0.3)) {
                isComplete = true
            }
        } catch {
            isLoading = false
            errorMessage = "Failed to complete onboarding."
            print("Complete onboarding error: \(error)")
        }
    }

    func goBack() {
        if currentIndex > 0 {
            withAnimation(.easeOut(duration: 0.3)) {
                currentIndex -= 1
            }
        }
    }

    func skipOnboarding() {
        // Mark as complete without saving
        isComplete = true
    }
}

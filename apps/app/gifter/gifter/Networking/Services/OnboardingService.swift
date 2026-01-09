//
//  OnboardingService.swift
//  gifter
//
//  Onboarding Service
//

import Foundation

final class OnboardingService {
    static let shared = OnboardingService()

    private let client = APIClient.shared

    private init() {}

    // MARK: - Onboarding Flow

    func getStatus() async throws -> OnboardingStatusResponse {
        try await client.request(OnboardingEndpoint.getStatus)
    }

    func start(scenario: OnboardingScenario = .newUser) async throws -> OnboardingSession {
        let response: OnboardingQuestionsResponse = try await client.request(
            OnboardingEndpoint.start(scenario: scenario.rawValue)
        )

        return OnboardingSession(
            sessionId: response.sessionId,
            questions: response.questions.map { $0.toDomain() },
            scenario: response.scenario
        )
    }

    func getQuestions() async throws -> OnboardingSession {
        let response: OnboardingQuestionsResponse = try await client.request(OnboardingEndpoint.getQuestions)

        return OnboardingSession(
            sessionId: response.sessionId,
            questions: response.questions.map { $0.toDomain() },
            scenario: response.scenario
        )
    }

    func submitAnswer(questionId: String, answer: String) async throws -> OnboardingAnswerResponse {
        try await client.request(OnboardingEndpoint.submitAnswer(questionId: questionId, answer: answer))
    }

    func complete() async throws -> TasteProfile {
        let response: OnboardingCompleteResponse = try await client.request(OnboardingEndpoint.complete)

        guard let profileDTO = response.tasteProfile else {
            throw OnboardingError.profileGenerationFailed
        }

        return profileDTO.toDomain()
    }

    func updateIdentity(birthday: Date? = nil, phone: String? = nil, address: AddressDTO? = nil, step: Int? = nil) async throws {
        var birthdayString: String? = nil
        if let birthday = birthday {
            birthdayString = ISO8601DateFormatter().string(from: birthday)
        }
        
        let request = UpdateIdentityRequest(
            birthday: birthdayString,
            phone: phone,
            address: address,
            onboardingStep: step
        )
        
        try await client.request(OnboardingEndpoint.updateIdentity(request))
    }
}

// MARK: - Onboarding Scenario
enum OnboardingScenario: String {
    case newUser = "NEW_USER"
    case updateProfile = "UPDATE_PROFILE"
    case nonUserGifting = "NON_USER_GIFTING"
}

// MARK: - Onboarding Errors
enum OnboardingError: LocalizedError {
    case noQuestionsAvailable
    case answerSubmissionFailed
    case profileGenerationFailed

    var errorDescription: String? {
        switch self {
        case .noQuestionsAvailable:
            return "Unable to load onboarding questions"
        case .answerSubmissionFailed:
            return "Failed to save your answer"
        case .profileGenerationFailed:
            return "Failed to generate your taste profile"
        }
    }
}

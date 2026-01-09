//
//  OnboardingDTOs.swift
//  gifter
//
//  Onboarding Request/Response DTOs
//

import Foundation

// MARK: - Requests

struct OnboardingStartRequest: Encodable {
    let scenario: String // NEW_USER, UPDATE_PROFILE, NON_USER_GIFTING
}

struct UpdateIdentityRequest: Codable {
    let birthday: String?
    let phone: String?
    let address: AddressDTO?
    let onboardingStep: Int?
}

struct AddressDTO: Codable {
    let line1: String
    let line2: String?
    let city: String
    let state: String?
    let postalCode: String
    let country: String
}

struct OnboardingAnswerRequest: Encodable {
    let questionId: String
    let answer: String
}

// MARK: - Responses

struct OnboardingStatusResponse: Decodable {
    let status: String // not_started, in_progress, completed
    let currentQuestionIndex: Int?
    let totalQuestions: Int?
    let completedAt: String?
}

struct OnboardingQuestionsResponse: Decodable {
    let sessionId: String
    let questions: [OnboardingQuestionDTO]
    let scenario: String
}

struct OnboardingQuestionDTO: Decodable, Identifiable {
    let id: String
    let type: String // multiple_choice, scale, this_or_that, short_text
    let question: String
    let description: String?
    let options: [OnboardingOptionDTO]?
    let scaleMin: Int?
    let scaleMax: Int?
    let scaleLabels: ScaleLabelsDTO?
    let traitTarget: String?
    let required: Bool

    func toDomain() -> OnboardingQuestion {
        OnboardingQuestion(
            id: id,
            type: OnboardingQuestionType(rawValue: type) ?? .multipleChoice,
            question: question,
            description: description,
            options: options?.map { $0.toDomain() } ?? [],
            scaleMin: scaleMin,
            scaleMax: scaleMax,
            scaleMinLabel: scaleLabels?.min,
            scaleMaxLabel: scaleLabels?.max,
            required: required
        )
    }
}

struct OnboardingOptionDTO: Decodable {
    let id: String
    let label: String
    let description: String?
    let imageURL: String?

    func toDomain() -> OnboardingOption {
        OnboardingOption(
            id: id,
            label: label,
            description: description,
            imageURL: imageURL
        )
    }
}

struct ScaleLabelsDTO: Decodable {
    let min: String?
    let max: String?
}

struct OnboardingAnswerResponse: Decodable {
    let success: Bool
    let nextQuestionIndex: Int?
    let isComplete: Bool
}

struct OnboardingCompleteResponse: Decodable {
    let success: Bool
    let tasteProfile: TasteProfileDTO?
    let profileSummary: [String]?
}

// MARK: - Domain Models

enum OnboardingQuestionType: String, Codable {
    case multipleChoice = "multiple_choice"
    case scale = "scale"
    case thisOrThat = "this_or_that"
    case shortText = "short_text"
}

struct OnboardingQuestion: Identifiable {
    let id: String
    let type: OnboardingQuestionType
    let question: String
    let description: String?
    let options: [OnboardingOption]
    let scaleMin: Int?
    let scaleMax: Int?
    let scaleMinLabel: String?
    let scaleMaxLabel: String?
    let required: Bool
}

struct OnboardingOption: Identifiable {
    let id: String
    let label: String
    let description: String?
    let imageURL: String?
}

struct OnboardingSession {
    let sessionId: String
    let questions: [OnboardingQuestion]
    let scenario: String
    var currentIndex: Int = 0
    var answers: [String: String] = [:]

    var currentQuestion: OnboardingQuestion? {
        guard currentIndex < questions.count else { return nil }
        return questions[currentIndex]
    }

    var isComplete: Bool {
        currentIndex >= questions.count
    }

    var progress: Double {
        guard !questions.isEmpty else { return 0 }
        return Double(currentIndex) / Double(questions.count)
    }
}

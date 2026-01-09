//
//  AuthDTOs.swift
//  gifter
//
//  Authentication Request/Response DTOs
//

import Foundation

// MARK: - Requests

struct SignUpRequest: Encodable {
    let email: String
    let password: String
    let name: String
}

struct SignInRequest: Encodable {
    let email: String
    let password: String
}

struct AppleSignInRequest: Encodable {
    let idToken: String
    let nonce: String
    let provider: String
}

struct VerifyEmailRequest: Encodable {
    let token: String
}

struct ForgotPasswordRequest: Encodable {
    let email: String
}

struct ResetPasswordRequest: Encodable {
    let token: String
    let newPassword: String
}

struct MagicLinkRequest: Encodable {
    let email: String
}

// MARK: - Responses

struct AuthResponse: Decodable {
    let user: UserDTO?
    let session: SessionDTO?
    let token: String?
    let redirect: Bool?
    let url: String?
}

struct SessionDTO: Codable {
    let id: String
    let userId: String
    let expiresAt: Date
    let createdAt: Date
    let updatedAt: Date
    let ipAddress: String?
    let userAgent: String?

    enum CodingKeys: String, CodingKey {
        case id, userId, expiresAt, createdAt, updatedAt, ipAddress, userAgent
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        userId = try container.decode(String.self, forKey: .userId)
        ipAddress = try container.decodeIfPresent(String.self, forKey: .ipAddress)
        userAgent = try container.decodeIfPresent(String.self, forKey: .userAgent)

        // Handle ISO8601 dates
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        let expiresAtString = try container.decode(String.self, forKey: .expiresAt)
        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        let updatedAtString = try container.decode(String.self, forKey: .updatedAt)

        expiresAt = dateFormatter.date(from: expiresAtString) ?? Date()
        createdAt = dateFormatter.date(from: createdAtString) ?? Date()
        updatedAt = dateFormatter.date(from: updatedAtString) ?? Date()
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(userId, forKey: .userId)
        try container.encodeIfPresent(ipAddress, forKey: .ipAddress)
        try container.encodeIfPresent(userAgent, forKey: .userAgent)

        // Encode dates as ISO8601 strings to match decode expectations
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        try container.encode(dateFormatter.string(from: expiresAt), forKey: .expiresAt)
        try container.encode(dateFormatter.string(from: createdAt), forKey: .createdAt)
        try container.encode(dateFormatter.string(from: updatedAt), forKey: .updatedAt)
    }
}

struct UserDTO: Codable {
    let id: String
    let email: String
    let emailVerified: Bool
    let name: String?
    let image: String?
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id, email, emailVerified, name, image, createdAt, updatedAt
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        email = try container.decode(String.self, forKey: .email)
        emailVerified = try container.decode(Bool.self, forKey: .emailVerified)
        name = try container.decodeIfPresent(String.self, forKey: .name)
        image = try container.decodeIfPresent(String.self, forKey: .image)

        // Handle ISO8601 dates
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        let updatedAtString = try container.decode(String.self, forKey: .updatedAt)

        createdAt = dateFormatter.date(from: createdAtString) ?? Date()
        updatedAt = dateFormatter.date(from: updatedAtString) ?? Date()
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(email, forKey: .email)
        try container.encode(emailVerified, forKey: .emailVerified)
        try container.encodeIfPresent(name, forKey: .name)
        try container.encodeIfPresent(image, forKey: .image)

        // Encode dates as ISO8601 strings to match decode expectations
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        try container.encode(dateFormatter.string(from: createdAt), forKey: .createdAt)
        try container.encode(dateFormatter.string(from: updatedAt), forKey: .updatedAt)
    }

    func toDomain() -> User {
        let nameParts = (name ?? "").split(separator: " ")
        let firstName = nameParts.first.map(String.init) ?? ""
        let lastName = nameParts.dropFirst().joined(separator: " ")

        return User(
            id: id,
            firstName: firstName,
            lastName: lastName,
            email: email,
            tasteProfile: nil,
            occasions: [],
            createdAt: createdAt
        )
    }
}

struct GetSessionResponse: Decodable {
    let session: SessionDTO?
    let user: UserDTO?
}

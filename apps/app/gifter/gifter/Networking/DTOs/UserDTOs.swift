//
//  UserDTOs.swift
//  gifter
//
//  User Request/Response DTOs
//

import Foundation

// MARK: - Requests

struct UpdateUserRequest: Codable {
    let name: String?
    let avatar: String?
    let timezone: String?
    let defaultCurrency: String?
    let phone: String?
}

struct AddDeviceRequest: Encodable {
    let token: String
    let platform: String
}

// MARK: - Responses

struct MeResponse: Decodable {
    let id: String
    let email: String
    let emailVerified: Bool
    let name: String?
    let image: String?
    let phone: String?
    let timezone: String?
    let defaultCurrency: String?
    let status: String
    let createdAt: String
    let updatedAt: String
    let profile: UserProfileDTO?
    let tasteProfile: TasteProfileDTO?

    func toDomain() -> User {
        let nameParts = (name ?? "").split(separator: " ")
        let firstName = nameParts.first.map(String.init) ?? ""
        let lastName = nameParts.dropFirst().joined(separator: " ")

        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        return User(
            id: id,
            firstName: firstName,
            lastName: lastName,
            email: email,
            tasteProfile: tasteProfile?.toDomain(),
            occasions: [],
            createdAt: dateFormatter.date(from: createdAt) ?? Date()
        )
    }
}

struct UserProfileDTO: Decodable {
    let id: String
    let userId: String
    let birthday: String?
    let bio: String?
    let location: String?
    let interests: [String]?
}

struct TasteProfileDTO: Decodable {
    let id: String
    let userId: String
    let mode: String
    let answers: [String: AnyCodable]?
    let facets: TasteProfileFacetsDTO?
    let completedAt: String?

    func toDomain() -> TasteProfile {
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        return TasteProfile(
            style: facets?.aestheticStyle,
            perfectEvening: nil,
            interests: facets?.interests ?? [],
            completedAt: completedAt.flatMap { dateFormatter.date(from: $0) }
        )
    }
}

struct TasteProfileFacetsDTO: Decodable {
    let aestheticStyle: String?
    let interests: [String]?
    let priceRange: PriceRangeDTO?
    let occasions: [String]?
    let brandPreferences: [String]?
}

struct PriceRangeDTO: Decodable {
    let min: Double?
    let max: Double?
}

// MARK: - AnyCodable for dynamic JSON
struct AnyCodable: Decodable {
    let value: Any

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if let intValue = try? container.decode(Int.self) {
            value = intValue
        } else if let doubleValue = try? container.decode(Double.self) {
            value = doubleValue
        } else if let boolValue = try? container.decode(Bool.self) {
            value = boolValue
        } else if let stringValue = try? container.decode(String.self) {
            value = stringValue
        } else if let arrayValue = try? container.decode([AnyCodable].self) {
            value = arrayValue.map { $0.value }
        } else if let dictValue = try? container.decode([String: AnyCodable].self) {
            value = dictValue.mapValues { $0.value }
        } else {
            value = NSNull()
        }
    }
}

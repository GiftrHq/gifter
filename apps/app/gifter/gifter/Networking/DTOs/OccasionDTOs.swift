//
//  OccasionDTOs.swift
//  gifter
//
//  Occasion Request/Response DTOs
//

import Foundation

// MARK: - Requests

struct CreateOccasionRequest: Encodable {
    let recipientId: String?
    let type: String
    let title: String?
    let date: String // ISO8601
    let recurrence: String? // NONE, YEARLY
    let visibility: String? // PUBLIC, PRIVATE
    let sharedWithUserIds: [String]?
    let notes: String?
}

struct UpdateOccasionRequest: Encodable {
    var title: String?
    var date: String?
    var notes: String?
    var recurrence: String?
    var visibility: String?
    var sharedWithUserIds: [String]?
}

// MARK: - Enums

enum OccasionVisibility: String, Codable {
    case publicVisibility = "PUBLIC"
    case privateVisibility = "PRIVATE"
}

// MARK: - Responses

struct OccasionListResponse: Decodable {
    let occasions: [OccasionDTO]

    private enum CodingKeys: String, CodingKey {
        case occasions
    }

    init(from decoder: Decoder) throws {
        // Handle both array and object responses
        if let array = try? decoder.singleValueContainer().decode([OccasionDTO].self) {
            self.occasions = array
        } else {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.occasions = try container.decode([OccasionDTO].self, forKey: .occasions)
        }
    }
}

struct OccasionDTO: Decodable {
    let id: String
    let ownerUserId: String
    let recipientId: String?
    let type: String
    let title: String?
    let date: String
    let recurrence: String
    let visibility: OccasionVisibility
    let notes: String?
    let recipient: RecipientDTO?
    let sharedWith: [UserDTO]?
    let owner: UserDTO?

    func toDomain() -> Occasion {
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        let parsedDate = dateFormatter.date(from: date) ?? Date()

        return Occasion(
            id: id,
            personName: recipient?.name ?? owner?.name ?? title ?? "Unknown",
            relationship: recipient?.relationship ?? "",
            occasionType: type,
            date: parsedDate,
            savedProducts: [],
            status: .planning,
            visibility: visibility,
            sharedWith: sharedWith?.map { User(from: $0) },
            owner: owner.map { User(from: $0) }
        )
    }
}

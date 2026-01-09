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
    let notes: String?
}

struct UpdateOccasionRequest: Encodable {
    var title: String?
    var date: String?
    var notes: String?
    var recurrence: String?
}

// MARK: - Responses

struct OccasionListResponse: Decodable {
    let occasions: [OccasionDTO]
}

struct OccasionDTO: Decodable {
    let id: String
    let userId: String
    let recipientId: String?
    let type: String
    let title: String?
    let date: String
    let recurrence: String
    let notes: String?
    let recipient: RecipientDTO?

    func toDomain() -> Occasion {
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        let parsedDate = dateFormatter.date(from: date) ?? Date()

        return Occasion(
            id: id,
            personName: recipient?.name ?? title ?? "Unknown",
            relationship: recipient?.relationship ?? "",
            occasionType: type,
            date: parsedDate,
            savedProducts: [],
            status: .planning
        )
    }
}

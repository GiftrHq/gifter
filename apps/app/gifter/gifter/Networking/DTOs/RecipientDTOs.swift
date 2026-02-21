//
//  RecipientDTOs.swift
//  gifter
//
//  Recipient Request/Response DTOs
//

import Foundation

// MARK: - Requests

struct CreateRecipientRequest: Encodable {
    let type: String
    let name: String
    let relationship: String?
    let birthday: String?
    let notes: String?
}

struct UpdateRecipientRequest: Encodable {
    var name: String?
    var relationship: String?
    var birthday: String?
    var notes: String?
}

// MARK: - Responses

struct RecipientListResponse: Decodable {
    let recipients: [RecipientDTO]
}

struct RecipientDTO: Decodable {
    let id: String
    let ownerUserId: String
    let userId: String? // Linked Gifter user
    let type: String // USER, EXTERNAL
    let name: String?
    let relationship: String?
    let birthday: String?
    let notes: String?
    let avatarUrl: String?
    let tasteProfile: TasteProfileDTO?

    func toDomain() -> GiftingProfile {
        GiftingProfile(
            id: id,
            name: name ?? "Someone Special",
            relationship: relationship ?? "",
            threeWords: [],
            tasteProfile: tasteProfile?.toDomain(),
            savedProducts: [],
            lastGifted: nil,
            createdAt: Date()
        )
    }
}

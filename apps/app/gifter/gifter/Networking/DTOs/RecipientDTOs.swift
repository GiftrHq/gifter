//
//  RecipientDTOs.swift
//  gifter
//
//  Recipient Request/Response DTOs
//

import Foundation

// MARK: - Requests

struct CreateRecipientRequest: Encodable {
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
    let userId: String
    let type: String // USER, EXTERNAL
    let linkedUserId: String?
    let name: String
    let relationship: String?
    let birthday: String?
    let notes: String?
    let tasteProfile: TasteProfileDTO?

    func toDomain() -> GiftingProfile {
        GiftingProfile(
            id: id,
            name: name,
            relationship: relationship ?? "",
            threeWords: [],
            tasteProfile: tasteProfile?.toDomain(),
            savedProducts: [],
            lastGifted: nil,
            createdAt: Date()
        )
    }
}

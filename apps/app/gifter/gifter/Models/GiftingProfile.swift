//
//  GiftingProfile.swift
//  gifter
//
//  Core Models
//

import Foundation

struct GiftingProfile: Identifiable, Codable {
    let id: String
    var name: String
    var relationship: String
    var threeWords: [String]
    var tasteProfile: TasteProfile?
    var savedProducts: [Product]
    var lastGifted: Date?
    var createdAt: Date

    var lastGiftedText: String? {
        guard let lastGifted = lastGifted else { return nil }
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return "Last gifted: \(formatter.localizedString(for: lastGifted, relativeTo: Date()))"
    }
}

enum ProfileContext {
    case user
    case person(GiftingProfile)
}

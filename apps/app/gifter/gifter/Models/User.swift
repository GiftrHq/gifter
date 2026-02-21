//
//  User.swift
//  gifter
//
//  Core Models
//

import Foundation

struct User: Identifiable, Codable {
    let id: String
    var firstName: String
    var lastName: String
    var email: String
    var tasteProfile: TasteProfile?
    var occasions: [Occasion]
    var createdAt: Date

    var fullName: String {
        "\(firstName) \(lastName)"
    }

    init(from dto: UserDTO) {
        let nameParts = (dto.name ?? "").split(separator: " ")
        self.id = dto.id
        self.firstName = nameParts.first.map(String.init) ?? ""
        self.lastName = nameParts.dropFirst().joined(separator: " ")
        self.email = dto.email
        self.tasteProfile = nil // UserDTO doesn't have taste profile directly
        self.occasions = []
        self.createdAt = dto.createdAt
    }

    init(id: String, firstName: String, lastName: String, email: String, tasteProfile: TasteProfile?, occasions: [Occasion], createdAt: Date) {
        self.id = id
        self.firstName = firstName
        self.lastName = lastName
        self.email = email
        self.tasteProfile = tasteProfile
        self.occasions = occasions
        self.createdAt = createdAt
    }
}

struct TasteProfile: Codable {
    var style: String?
    var perfectEvening: String?
    var interests: [String]
    var completedAt: Date?

    var isComplete: Bool {
        completedAt != nil
    }

    var summary: [String] {
        var items: [String] = []
        if let style = style {
            items.append(style)
        }
        items.append(contentsOf: interests.prefix(3))
        return items
    }
}

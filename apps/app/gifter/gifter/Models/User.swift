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

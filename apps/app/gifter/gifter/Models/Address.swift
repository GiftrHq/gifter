//
//  Address.swift
//  gifter
//
//  Core Models
//

import Foundation

struct Address: Identifiable, Codable {
    let id: String
    var label: String?
    var line1: String
    var line2: String?
    var city: String
    var state: String?
    var postalCode: String
    var country: String
    var phoneNumber: String?
    var isDefault: Bool
    var createdAt: Date
    var updatedAt: Date
    
    var formattedAddress: String {
        var parts: [String] = [line1]
        if let line2 = line2, !line2.isEmpty {
            parts.append(line2)
        }
        parts.append("\(city), \(state ?? "") \(postalCode)")
        parts.append(country)
        return parts.joined(separator: "\n")
    }
    
    var displayLabel: String {
        label ?? "Address"
    }
}

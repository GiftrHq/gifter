//
//  Occasion.swift
//  gifter
//
//  Core Models
//

import Foundation

struct Occasion: Identifiable, Codable {
    let id: String
    var personName: String
    var relationship: String
    var occasionType: String
    var date: Date
    var savedProducts: [Product]
    var status: OccasionStatus

    var daysUntil: Int {
        Calendar.current.dateComponents([.day], from: Date(), to: date).day ?? 0
    }

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }

    var countdownText: String {
        let days = daysUntil
        if days == 0 {
            return "Today"
        } else if days == 1 {
            return "Tomorrow"
        } else if days < 0 {
            return "Passed"
        } else {
            return "In \(days) days"
        }
    }
}

enum OccasionStatus: String, Codable {
    case planning = "Plan gift"
    case inProgress = "In progress"
    case purchased = "Purchased"
}

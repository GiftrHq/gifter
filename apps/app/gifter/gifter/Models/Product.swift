//
//  Product.swift
//  gifter
//
//  Core Models
//

import Foundation

struct Product: Identifiable, Codable, Hashable {
    let id: String
    let brand: String
    let title: String
    let description: String
    let price: Double
    let currency: String
    let images: [String]
    let tags: [String]
    let storeURL: String
    var aiExplanation: String?

    var formattedPrice: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = currency
        return formatter.string(from: NSNumber(value: price)) ?? "\(currency)\(price)"
    }
}
